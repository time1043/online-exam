import { createOpenAI } from '@ai-sdk/openai';
import { createServerFn } from '@tanstack/react-start';
import { generateText } from 'ai';

import { prisma } from '@/db';
import { authFnMiddleware } from '@/middlewares/auth';
import { gradeEssayWithAISchema } from '@/schemas/ai';

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
