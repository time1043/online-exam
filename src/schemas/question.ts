import { z } from 'zod';

import { QuestionType } from '@/generated/prisma/enums';

const questionTypeValues = Object.values(QuestionType) as [string, ...string[]];

export const createQuestionSchema = z.object({
  content: z.string().min(1, '题干不能为空'),
  type: z.enum(questionTypeValues),
  options: z.array(z.string()).nullable(),
  answer: z.union([z.string(), z.number(), z.array(z.number())]),
  tags: z.array(z.string()),
});

export const importQuestionsSchema = z.object({
  questions: z
    .array(createQuestionSchema)
    .min(1, '至少导入 1 道题目')
    .max(200, '单次最多导入 200 道'),
});

export const deleteQuestionSchema = z.object({
  id: z.string(),
});

export const deleteQuestionsSchema = z.object({
  ids: z.array(z.string()).min(1, '至少选择 1 道题目'),
});
