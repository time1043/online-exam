import { z } from 'zod';

export const getSubjectSchema = z.object({
  subjectId: z.number(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1, '科目名称不能为空'),
});
