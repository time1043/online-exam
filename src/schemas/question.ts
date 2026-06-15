import { z } from 'zod';

import { QuestionType } from '@/generated/prisma/enums';

const questionTypeValues = Object.values(QuestionType) as [string, ...string[]];

export const createQuestionSchema = z.object({
  content: z.string().min(1, '题干不能为空'),
  type: z.enum(questionTypeValues),
  options: z.array(z.string()).nullable(),
  answer: z.union([z.string(), z.number(), z.array(z.number())]),
  referenceAnswer: z.string().optional(),
  tags: z.array(z.string()),
});

export const deleteQuestionSchema = z.object({
  id: z.string(),
});
