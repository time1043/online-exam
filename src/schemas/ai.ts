import { z } from 'zod';

export const gradeEssayWithAISchema = z.object({
  submissionId: z.number(),
  questionId: z.string(),
});
