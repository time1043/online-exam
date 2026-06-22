import { z } from 'zod';

export const getExamsSchema = z.object({
  subjectId: z.number(),
});

export const getExamSchema = z.object({
  subjectId: z.number(),
  examId: z.number(),
});

export const createExamSchema = z.object({
  subjectId: z.number(),
  title: z.string().min(1, '试卷名称不能为空'),
  timeLimit: z.number().min(1).nullable(),
});

export const updateExamSchema = z.object({
  examId: z.number(),
  title: z.string().min(1, '试卷名称不能为空').optional(),
  timeLimit: z.number().min(1).nullable().optional(),
});

export const updateExamQuestionsSchema = z.object({
  examId: z.number(),
  questions: z.array(
    z.object({
      questionId: z.string(),
      order: z.number(),
      score: z.number().min(1),
    }),
  ),
});

export const publishExamSchema = z.object({
  examId: z.number(),
});

export const toggleAIGradingSchema = z.object({
  examId: z.number(),
  enabled: z.boolean(),
});

export const deleteExamSchema = z.object({
  examId: z.number(),
});

// Student schemas
export const getExamForStudentSchema = z.object({
  examId: z.number(),
});

export const saveExamSchema = z.object({
  examId: z.number(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.number(), z.array(z.number()), z.array(z.string())]),
    }),
  ),
});

export const submitExamSchema = z.object({
  examId: z.number(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.union([z.string(), z.number(), z.array(z.number()), z.array(z.string())]),
    }),
  ),
});

// Teacher grading schemas
export const getExamSubmissionsSchema = z.object({
  examId: z.number(),
});

export const getSubmissionDetailSchema = z.object({
  submissionId: z.number(),
});

export const gradeSubmissionSchema = z.object({
  submissionId: z.number(),
  scores: z.array(
    z.object({
      questionId: z.string(),
      score: z.number().min(0),
      reason: z.string().min(1, '请填写批改说明'),
    }),
  ),
});
