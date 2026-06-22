import { createServerFn } from '@tanstack/react-start';

import { prisma } from '@/db';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

import { Prisma } from '@/generated/prisma/client';
import { authFnMiddleware } from '@/middlewares/auth';
import {
  createExamSchema,
  deleteExamSchema,
  getExamForStudentSchema,
  getExamSchema,
  getExamSubmissionsSchema,
  getSubmissionDetailSchema,
  gradeSubmissionSchema,
  saveExamSchema,
  getExamsSchema,
  publishExamSchema,
  submitExamSchema,
  toggleAIGradingSchema,
  updateExamQuestionsSchema,
  updateExamSchema,
} from '@/schemas/exam';

export const getExams = createServerFn({ method: 'GET' })
  .validator(getExamsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, teacherId: session.user.id },
      select: { id: true },
    });
    if (!subject) throw new Error('科目不存在或无权访问');

    return prisma.exam.findMany({
      where: { subjectId: data.subjectId },
      include: {
        _count: { select: { examQuestions: true } },
        examQuestions: { select: { score: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

export const getExam = createServerFn({ method: 'GET' })
  .validator(getExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, teacherId: session.user.id },
      select: { id: true },
    });
    if (!subject) throw new Error('科目不存在或无权访问');

    const exam = await prisma.exam.findFirst({
      where: { id: data.examId, subjectId: data.subjectId },
      include: {
        subject: { select: { name: true } },
        examQuestions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                options: true,
                answer: true,
                tags: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!exam) throw new Error('试卷不存在');
    return exam;
  });

export const createExam = createServerFn({ method: 'POST' })
  .validator(createExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, teacherId: session.user.id },
      select: { id: true },
    });
    if (!subject) throw new Error('科目不存在或无权访问');

    return prisma.exam.create({
      data: {
        title: data.title,
        subjectId: data.subjectId,
        timeLimit: data.timeLimit,
      },
    });
  });

export const updateExam = createServerFn({ method: 'POST' })
  .validator(updateExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    return prisma.exam.update({
      where: { id: data.examId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.timeLimit !== undefined ? { timeLimit: data.timeLimit } : {}),
      },
    });
  });

export const updateExamQuestions = createServerFn({ method: 'POST' })
  .validator(updateExamQuestionsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    await prisma.$transaction([
      prisma.examQuestion.deleteMany({ where: { examId: data.examId } }),
      ...(data.questions.length > 0
        ? [
            prisma.examQuestion.createMany({
              data: data.questions.map((q) => ({
                examId: data.examId,
                questionId: q.questionId,
                order: q.order,
                score: q.score,
              })),
            }),
          ]
        : []),
    ]);

    return { count: data.questions.length };
  });

export const publishExam = createServerFn({ method: 'POST' })
  .validator(publishExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true, status: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    const newStatus = exam.status === 'draft' ? 'published' : 'draft';
    return prisma.exam.update({
      where: { id: data.examId },
      data: { status: newStatus },
    });
  });

export const toggleAIGrading = createServerFn({ method: 'POST' })
  .validator(toggleAIGradingSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    return prisma.exam.update({
      where: { id: data.examId },
      data: { aiGradingEnabled: data.enabled },
    });
  });

export const deleteExam = createServerFn({ method: 'POST' })
  .validator(deleteExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    return prisma.exam.delete({ where: { id: data.examId } });
  });

// Student server functions
export const getAvailableExams = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const { session } = context;
    return prisma.exam.findMany({
      where: {
        status: 'published',
        subject: {
          enrollments: { some: { studentId: session.user.id } },
        },
      },
      include: {
        subject: { select: { id: true, name: true } },
        _count: { select: { examQuestions: true } },
        examQuestions: { select: { score: true } },
        examSubmissions: {
          where: { studentId: session.user.id },
          select: { id: true, submittedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

export const getExamForStudent = createServerFn({ method: 'GET' })
  .validator(getExamForStudentSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;

    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        status: 'published',
        subject: {
          enrollments: { some: { studentId: session.user.id } },
        },
      },
      include: {
        subject: { select: { name: true } },
        examQuestions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                options: true,
                answer: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    const submission = await prisma.examSubmission.findUnique({
      where: { examId_studentId: { examId: data.examId, studentId: session.user.id } },
      select: { id: true, submittedAt: true },
    });
    if (submission?.submittedAt) throw new Error('你已经提交过这份试卷');

    // Get saved answers (draft)
    let savedAnswers: { questionId: string; answer: string | number | number[] | string[] }[] = [];
    if (submission) {
      const draftAnswers = await prisma.examAnswer.findMany({
        where: { submissionId: submission.id },
        select: { questionId: true, answer: true },
      });
      savedAnswers = draftAnswers.map((d) => ({
        questionId: d.questionId,
        answer: d.answer as string | number | number[] | string[],
      }));
    }

    return { ...exam, savedAnswers };
  });

export const saveExam = createServerFn({ method: 'POST' })
  .validator(saveExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;

    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        status: 'published',
        subject: { enrollments: { some: { studentId: session.user.id } } },
      },
      select: { id: true, aiGradingEnabled: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    const existing = await prisma.examSubmission.findUnique({
      where: { examId_studentId: { examId: data.examId, studentId: session.user.id } },
      select: { id: true, submittedAt: true },
    });
    if (existing?.submittedAt) throw new Error('试卷已提交，无法修改');

    if (existing) {
      await prisma.$transaction([
        prisma.examAnswer.deleteMany({ where: { submissionId: existing.id } }),
        prisma.examAnswer.createMany({
          data: data.answers.map((a) => ({
            submissionId: existing.id,
            questionId: a.questionId,
            answer: a.answer as Prisma.InputJsonValue,
          })),
        }),
      ]);
      return { submissionId: existing.id };
    }

    const submission = await prisma.examSubmission.create({
      data: {
        examId: data.examId,
        studentId: session.user.id,
        submittedAt: undefined,
        answers: {
          create: data.answers.map((a) => ({
            questionId: a.questionId,
            answer: a.answer as Prisma.InputJsonValue,
          })),
        },
      },
    });
    return { submissionId: submission.id };
  });

function gradeObjectiveAnswer(
  questionType: string,
  correctAnswer: unknown,
  studentAnswer: unknown,
): boolean {
  switch (questionType) {
    case 'single_choice':
    case 'true_false':
      return Number(studentAnswer) === Number(correctAnswer);
    case 'multiple_choice': {
      const correct = (correctAnswer as number[]).slice().sort();
      const student = (studentAnswer as number[]).slice().sort();
      return correct.length === student.length && correct.every((v, i) => v === student[i]);
    }
    case 'fill_blank': {
      const correct = correctAnswer as string[];
      const student = studentAnswer as string[];
      if (!Array.isArray(correct) || !Array.isArray(student)) return false;
      return (
        correct.length === student.length &&
        correct.every((v, i) => v.trim().toLowerCase() === (student[i] ?? '').trim().toLowerCase())
      );
    }
    default:
      return false;
  }
}

export const submitExam = createServerFn({ method: 'POST' })
  .validator(submitExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;

    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        status: 'published',
        subject: { enrollments: { some: { studentId: session.user.id } } },
      },
      select: { id: true, aiGradingEnabled: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    const existing = await prisma.examSubmission.findUnique({
      where: { examId_studentId: { examId: data.examId, studentId: session.user.id } },
      select: { id: true, submittedAt: true },
    });
    if (existing?.submittedAt) throw new Error('你已经提交过这份试卷');

    // Get questions with correct answers and scores for auto-grading
    const examQuestions = await prisma.examQuestion.findMany({
      where: { examId: data.examId },
      include: { question: { select: { id: true, type: true, answer: true } } },
    });
    const questionMap = new Map(examQuestions.map((eq) => [eq.question.id, eq]));

    // Build answers with scores
    const answeredIds = new Set(data.answers.map((a) => a.questionId));
    const now = new Date().toISOString();
    const answersWithScores = [
      ...data.answers.map((a) => {
        const eq = questionMap.get(a.questionId);
        if (!eq)
          return { questionId: a.questionId, answer: a.answer, score: null, scoreHistory: null };
        const objectiveTypes = ['single_choice', 'multiple_choice', 'true_false', 'fill_blank'];
        if (objectiveTypes.includes(eq.question.type)) {
          const correct = gradeObjectiveAnswer(eq.question.type, eq.question.answer, a.answer);
          const score = correct ? eq.score : 0;
          return {
            questionId: a.questionId,
            answer: a.answer,
            score,
            scoreHistory: JSON.stringify([
              { score, reason: '自动评分', role: 'hard', changedAt: now },
            ]),
          };
        }
        return { questionId: a.questionId, answer: a.answer, score: null, scoreHistory: null };
      }),
      // Unanswered questions get 0
      ...examQuestions
        .filter((eq) => !answeredIds.has(eq.question.id))
        .map((eq) => ({
          questionId: eq.question.id,
          answer: '',
          score: 0,
          scoreHistory: JSON.stringify([
            { score: 0, reason: '未作答', role: 'hard', changedAt: now },
          ]),
        })),
    ];

    if (existing) {
      await prisma.$transaction([
        prisma.examAnswer.deleteMany({ where: { submissionId: existing.id } }),
        prisma.examAnswer.createMany({
          data: answersWithScores.map((a) => ({
            submissionId: existing.id,
            questionId: a.questionId,
            answer: a.answer as Prisma.InputJsonValue,
            score: a.score,
            scoreHistory: a.scoreHistory ? JSON.parse(a.scoreHistory as string) : undefined,
          })),
        }),
        prisma.examSubmission.update({
          where: { id: existing.id },
          data: { submittedAt: new Date() },
        }),
      ]);
      return { submissionId: existing.id };
    }

    const submission = await prisma.examSubmission.create({
      data: {
        examId: data.examId,
        studentId: session.user.id,
        submittedAt: new Date(),
        answers: {
          create: answersWithScores.map((a) => ({
            questionId: a.questionId,
            answer: a.answer as Prisma.InputJsonValue,
            score: a.score,
            scoreHistory: a.scoreHistory ? JSON.parse(a.scoreHistory as string) : undefined,
          })),
        },
      },
    });
    const submissionId = submission.id;

    // Auto-grade essay questions with AI if enabled
    if (exam.aiGradingEnabled) {
      try {
        const essayAnswers = await prisma.examAnswer.findMany({
          where: { submissionId, score: null },
          include: {
            question: {
              select: { id: true, content: true, type: true, gradingCriteria: true },
            },
          },
        });

        const openai = createOpenAI({
          baseURL: process.env.MIMO_OPENAI_API_URL,
          apiKey: process.env.MIMO_API_KEY,
        });
        const now = new Date().toISOString();

        for (const eq of essayAnswers) {
          if (eq.question.type !== 'essay') continue;
          const criteria = eq.question.gradingCriteria || '无评分标准，请根据论述质量综合评分';
          try {
            const { text } = await generateText({
              model: openai.chat('mimo-v2.5'),
              system: '你是一个严格的阅卷老师。评分。只返回 JSON：{"score": number, "reason": string}。',
              prompt: `【题目】${eq.question.content}\n【评分标准】${criteria}\n【学生答案】${JSON.stringify(eq.answer)}\n\n请返回 JSON 格式评分。`,
            });
            const result = JSON.parse(text) as { score: number; reason: string };
            const history = (eq.scoreHistory as unknown[] ?? []);
            await prisma.examAnswer.update({
              where: { submissionId_questionId: { submissionId, questionId: eq.questionId } },
              data: {
                score: result.score,
                scoreHistory: [...history, { score: result.score, reason: result.reason, role: 'ai', changedAt: now }] as unknown as Prisma.InputJsonValue,
              },
            });
          } catch (aiErr) {
            console.error('AI grading failed for question', eq.questionId, aiErr);
          }
        }
      } catch (err) {
        console.error('AI auto-grading failed:', err);
      }
    }

    return { submissionId };
  });

export const getExamResult = createServerFn({ method: 'GET' })
  .validator(getExamForStudentSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;

    const submission = await prisma.examSubmission.findUnique({
      where: {
        examId_studentId: { examId: data.examId, studentId: session.user.id },
      },
      include: {
        exam: {
          include: {
            subject: { select: { name: true } },
            examQuestions: {
              include: {
                question: {
                  select: {
                    id: true,
                    content: true,
                    type: true,
                    options: true,
                    answer: true,
                    gradingCriteria: true,
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        answers: true,
      },
    });
    if (!submission?.submittedAt) throw new Error('未找到提交记录');

    const answers = submission.answers;
    const totalScore = submission.exam.examQuestions.reduce((sum, eq) => sum + eq.score, 0);
    const objectiveTypes = ['single_choice', 'multiple_choice', 'true_false', 'fill_blank'];

    let objectiveTotal = 0;
    let objectiveScore = 0;
    let subjectiveTotal = 0;
    let subjectiveScore = 0;

    for (const eq of submission.exam.examQuestions) {
      const answer = answers.find((a) => a.questionId === eq.question.id);
      if (objectiveTypes.includes(eq.question.type)) {
        objectiveTotal += eq.score;
        objectiveScore += answer?.score ?? 0;
      } else {
        subjectiveTotal += eq.score;
        subjectiveScore += answer?.score ?? 0;
      }
    }

    const hasUngraded = answers.some((a) => a.score === null);

    return {
      exam: submission.exam,
      submittedAt: submission.submittedAt,
      totalScore,
      objectiveTotal,
      objectiveScore,
      subjectiveTotal,
      subjectiveScore,
      hasUngraded,
      answers,
    };
  });

export const getExamSubmissions = createServerFn({ method: 'GET' })
  .validator(getExamSubmissionsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true, title: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    const submissions = await prisma.examSubmission.findMany({
      where: { examId: data.examId, submittedAt: { not: null } },
      include: {
        student: { select: { id: true, name: true, email: true } },
        answers: { select: { score: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions.map((s) => ({
      id: s.id,
      student: s.student,
      submittedAt: s.submittedAt,
      gradedScore: s.answers.reduce((sum, a) => sum + (a.score ?? 0), 0),
      hasUngraded: s.answers.some((a) => a.score === null),
    }));
  });

export const getSubmissionDetail = createServerFn({ method: 'GET' })
  .validator(getSubmissionDetailSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;

    const submission = await prisma.examSubmission.findFirst({
      where: {
        id: data.submissionId,
        submittedAt: { not: null },
        exam: { subject: { teacherId: session.user.id } },
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        exam: {
          include: {
            examQuestions: {
              include: {
                question: {
                  select: {
                    id: true,
                    content: true,
                    type: true,
                    options: true,
                    answer: true,
                    gradingCriteria: true,
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        answers: true,
      },
    });
    if (!submission) throw new Error('提交记录不存在');

    const answers = submission.answers;
    const totalScore = submission.exam.examQuestions.reduce((sum, eq) => sum + eq.score, 0);
    const gradedScore = answers.reduce((sum, a) => sum + (a.score ?? 0), 0);

    return {
      submission,
      answers,
      totalScore,
      gradedScore,
      hasUngraded: answers.some((a) => a.score === null),
    };
  });

export const gradeSubmission = createServerFn({ method: 'POST' })
  .validator(gradeSubmissionSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;

    const submission = await prisma.examSubmission.findFirst({
      where: {
        id: data.submissionId,
        submittedAt: { not: null },
        exam: { subject: { teacherId: session.user.id } },
      },
      select: { id: true },
    });
    if (!submission) throw new Error('提交记录不存在或无权访问');

    const now = new Date().toISOString();

    // First fetch all existing answers
    const existingAnswers = await prisma.examAnswer.findMany({
      where: {
        submissionId: data.submissionId,
        questionId: { in: data.scores.map((s) => s.questionId) },
      },
      select: { questionId: true, score: true, scoreHistory: true },
    });
    const existingMap = new Map(existingAnswers.map((a) => [a.questionId, a]));

    // Build update operations
    const updates = data.scores.map((s) => {
      const existing = existingMap.get(s.questionId);
      const history =
        (existing?.scoreHistory as {
          score: number;
          reason: string;
          role: string;
          changedAt: string;
        }[]) ?? [];
      const lastEntry = history[history.length - 1];

      // Skip if score and reason haven't changed
      if (lastEntry && lastEntry.score === s.score && lastEntry.reason === s.reason) {
        return prisma.examAnswer.update({
          where: {
            submissionId_questionId: {
              submissionId: data.submissionId,
              questionId: s.questionId,
            },
          },
          data: { score: s.score },
        });
      }

      const newEntry = {
        score: s.score,
        reason: s.reason,
        role: 'teacher' as const,
        changedAt: now,
      };

      return prisma.examAnswer.update({
        where: {
          submissionId_questionId: {
            submissionId: data.submissionId,
            questionId: s.questionId,
          },
        },
        data: {
          score: s.score,
          scoreHistory: [...history, newEntry],
        },
      });
    });

    await prisma.$transaction(updates);

    return { success: true };
  });
