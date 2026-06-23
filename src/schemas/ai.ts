import { z } from 'zod';

export const gradeEssayWithAISchema = z.object({
  submissionId: z.number(),
  questionId: z.string(),
});

export const chatWithAISchema = z.object({
  examId: z.number(),
  message: z.string(),
});
