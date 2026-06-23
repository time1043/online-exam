import { createOpenAI } from '@ai-sdk/openai';
import { createServerFn } from '@tanstack/react-start';
import { generateText, stepCountIs, tool } from 'ai';
import { z } from 'zod';

import { prisma } from '@/db';
import { authFnMiddleware } from '@/middlewares/auth';
import { chatWithAISchema, gradeEssayWithAISchema } from '@/schemas/ai';

const openai = createOpenAI({
  baseURL: process.env.MIMO_OPENAI_API_URL,
  apiKey: process.env.MIMO_API_KEY,
});

export const gradeEssayWithAI = createServerFn({ method: 'POST' })
  .validator(gradeEssayWithAISchema)
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

    const answer = await prisma.examAnswer.findFirst({
      where: {
        submissionId: data.submissionId,
        questionId: data.questionId,
      },
      include: {
        question: {
          select: {
            content: true,
            type: true,
            gradingCriteria: true,
          },
        },
      },
    });
    if (!answer) throw new Error('未找到答题记录');

    if (answer.question.type !== 'essay') {
      throw new Error('只能对论述题使用 AI 评分');
    }

    const question = answer.question;
    const criteria = question.gradingCriteria || '无评分标准，请根据论述质量综合评分';

    try {
      const { text } = await generateText({
        model: openai.chat('mimo-v2.5'),
        system: '你是一个严格的阅卷老师。评分。只返回 JSON：{"score": number, "reason": string}。',
        prompt: `【题目】${question.content}\n【评分标准】${criteria}\n【学生答案】${JSON.stringify(answer.answer)}\n\n请返回 JSON 格式评分。`,
      });

      const result = JSON.parse(text) as { score: number; reason: string };
      return { suggestedScore: result.score, reason: result.reason };
    } catch (err) {
      console.error('AI grading error:', err);
      throw err;
    }
  });

export const chatWithAI = createServerFn({ method: 'POST' })
  .validator(chatWithAISchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;

    const exam = await prisma.exam.findFirst({
      where: { id: data.examId, subject: { teacherId: session.user.id } },
      include: {
        subject: { select: { name: true } },
        examQuestions: {
          include: { question: { select: { id: true, content: true, type: true } } },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    const buildExamInfo = (eqs: typeof exam.examQuestions) =>
      eqs.map((eq) => ({
        id: eq.question.id,
        content: eq.question.content,
        type: eq.question.type,
        score: eq.score,
      }));

    const questionTypeMap: Record<string, string> = {
      single_choice: '单选题',
      multiple_choice: '多选题',
      true_false: '判断题',
      fill_blank: '填空题',
      essay: '论述题',
    };

    const { text, steps } = await generateText({
      model: openai.chat('mimo-v2.5'),
      system: `你是组卷助手，帮教师组卷。操作后说明做了什么。当前试卷：标题"${exam.title}"，科目"${exam.subject.name}"，时间限制${exam.timeLimit ?? '不限'}。已选题：${JSON.stringify(buildExamInfo(exam.examQuestions))}。`,
      prompt: data.message,
      stopWhen: stepCountIs(10),
      tools: {
        searchQuestions: tool({
          description: '搜索题库中的题目',
          parameters: z.object({
            keywords: z.string().describe('搜索关键词'),
            questionType: z.string().optional().describe('题型筛选'),
            tag: z.string().optional().describe('标签筛选'),
          }),
          execute: async (args: unknown) => {
            const { keywords, questionType, tag } = args as {
              keywords: string;
              questionType?: string;
              tag?: string;
            };
            const where: Record<string, unknown> = { content: { contains: keywords } };
            if (questionType) where.type = questionType;
            if (tag) where.tags = { has: tag };
            const results = await prisma.question.findMany({
              where,
              select: { id: true, content: true, type: true, tags: true },
              take: 20,
            });
            return results.map((q) => ({
              id: q.id,
              content: q.content,
              type: `${questionTypeMap[q.type] ?? q.type}`,
              tags: q.tags,
            }));
          },
        } as any),
        addToExam: tool({
          description: '添加题目到当前试卷',
          parameters: z.object({
            questionId: z.string().describe('题目 ID'),
            score: z.number().min(1).default(10).describe('分值'),
          }),
          execute: async (args: unknown) => {
            const a = args as Record<string, unknown>;
            const questionId = String(a.questionId);
            const score = Number(a.score) || 10;
            const last = await prisma.examQuestion.findFirst({
              where: { examId: data.examId },
              orderBy: { order: 'desc' },
              select: { order: true },
            });
            await prisma.examQuestion.create({
              data: { examId: data.examId, questionId, score, order: (last?.order ?? 0) + 1 },
            });
            const q = await prisma.question.findUnique({
              where: { id: questionId },
              select: { content: true, type: true },
            });
            return { success: true, content: q?.content, type: q?.type, score };
          },
        } as any),
        removeFromExam: tool({
          description: '从当前试卷移除题目',
          parameters: z.object({ questionId: z.string().describe('题目 ID') }),
          execute: async (args: unknown) => {
            await prisma.examQuestion.deleteMany({
              where: {
                examId: data.examId,
                questionId: (args as { questionId: string }).questionId,
              },
            });
            return { success: true };
          },
        } as any),
        setScore: tool({
          description: '修改试卷中某题的分值',
          parameters: z.object({
            questionId: z.string().describe('题目 ID'),
            score: z.number().min(1).describe('新分值'),
          }),
          execute: async (args: unknown) => {
            const a = args as Record<string, unknown>;
            const questionId = String(a.questionId);
            const score = Number(a.score) || 0;
            await prisma.examQuestion.updateMany({
              where: { examId: data.examId, questionId },
              data: { score },
            });
            return { success: true, score };
          },
        } as any),
        setTimeLimit: tool({
          description: '设置考试时间限制（分钟）',
          parameters: z.object({ minutes: z.number().min(1).describe('分钟数') }),
          execute: async (args: unknown) => {
            const minutes = Number((args as Record<string, unknown>).minutes) || 0;
            await prisma.exam.update({ where: { id: data.examId }, data: { timeLimit: minutes } });
            return { success: true, timeLimit: minutes };
          },
        } as any),
      },
    });

    const stepsCount = steps?.length ?? 0;

    return { reply: text, modified: stepsCount > 0 ? true : undefined };
  });
