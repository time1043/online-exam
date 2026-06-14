import { z } from 'zod';

// Teacher schemas
export const getSubjectSchema = z.object({
  subjectId: z.number(),
});

export const createSubjectSchema = z.object({
  name: z.string().min(1, '科目名称不能为空'),
});

// Student schemas
export const joinSubjectSchema = z.object({
  inviteCode: z.string().length(6, '邀请码为 6 位'),
});
