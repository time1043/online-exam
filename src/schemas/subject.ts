import { z } from 'zod';

export const subjectIdSchema = z.number();

export const createSubjectSchema = z.object({
  name: z.string().min(1, '科目名称不能为空'),
});
