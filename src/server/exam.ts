import { createServerFn } from '@tanstack/react-start';

import { prisma } from '@/db';
import { Prisma } from '@/generated/prisma/client';
import { authFnMiddleware } from '@/middlewares/auth';
import {
  createExamSchema,
  deleteExamSchema,
  getExamForStudentSchema,
  getExamSchema,
  saveExamSchema,
  getExamsSchema,
  publishExamSchema,
  submitExamSchema,
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
      select: { submittedAt: true },
    });
    if (submission?.submittedAt) throw new Error('你已经提交过这份试卷');

    return exam;
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
      select: { id: true },
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
      select: { id: true },
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
    const answersWithScores = [
      ...data.answers.map((a) => {
        const eq = questionMap.get(a.questionId);
        if (!eq) return { questionId: a.questionId, answer: a.answer, score: null };
        const objectiveTypes = ['single_choice', 'multiple_choice', 'true_false', 'fill_blank'];
        if (objectiveTypes.includes(eq.question.type)) {
          const correct = gradeObjectiveAnswer(eq.question.type, eq.question.answer, a.answer);
          return { questionId: a.questionId, answer: a.answer, score: correct ? eq.score : 0 };
        }
        return { questionId: a.questionId, answer: a.answer, score: null };
      }),
      // Unanswered questions get 0
      ...examQuestions
        .filter((eq) => !answeredIds.has(eq.question.id))
        .map((eq) => ({ questionId: eq.question.id, answer: '', score: 0 })),
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
          })),
        },
      },
    });
    return { submissionId: submission.id };
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

    const answerMap = new Map(submission.answers.map((a) => [a.questionId, a]));

    const totalScore = submission.exam.examQuestions.reduce((sum, eq) => sum + eq.score, 0);
    const gradedScore = submission.answers.reduce((sum, a) => sum + (a.score ?? 0), 0);
    const hasUngraded = submission.answers.some((a) => a.score === null);

    return {
      exam: submission.exam,
      submittedAt: submission.submittedAt,
      totalScore,
      gradedScore,
      hasUngraded,
      answerMap,
    };
  });
