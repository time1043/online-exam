import { createServerFn } from '@tanstack/react-start';

import type { $Enums, Prisma } from '@/generated/prisma/client';

import { prisma } from '@/db';
import { authFnMiddleware } from '@/middlewares/auth';
import {
  createQuestionSchema,
  deleteQuestionSchema,
  deleteQuestionsSchema,
  importQuestionsSchema,
} from '@/schemas/question';

export const getQuestions = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const { session } = context;
    return prisma.question.findMany({
      where: { createdBy: session.user.id },
      include: {
        creator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

export const createQuestion = createServerFn({ method: 'POST' })
  .validator(createQuestionSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    return prisma.question.create({
      data: {
        content: data.content,
        type: data.type as $Enums.QuestionType,
        ...(data.options !== null ? { options: data.options } : {}),
        answer: data.answer as Prisma.InputJsonValue,
        tags: data.tags,
        createdBy: session.user.id,
      },
      include: {
        creator: { select: { name: true } },
      },
    });
  });

export const importQuestions = createServerFn({ method: 'POST' })
  .validator(importQuestionsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const { count } = await prisma.question.createMany({
      data: data.questions.map((q) => ({
        content: q.content,
        type: q.type as $Enums.QuestionType,
        ...(q.options !== null ? { options: q.options } : {}),
        answer: q.answer as Prisma.InputJsonValue,
        tags: q.tags,
        createdBy: session.user.id,
      })),
    });
    return { count };
  });

export const deleteQuestion = createServerFn({ method: 'POST' })
  .validator(deleteQuestionSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const question = await prisma.question.findUnique({
      where: { id: data.id },
      select: { createdBy: true },
    });
    if (!question) throw new Error('题目不存在');
    if (question.createdBy !== session.user.id) throw new Error('无权删除');

    return prisma.question.delete({ where: { id: data.id } });
  });

export const deleteQuestions = createServerFn({ method: 'POST' })
  .validator(deleteQuestionsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const { count } = await prisma.question.deleteMany({
      where: {
        id: { in: data.ids },
        createdBy: session.user.id,
      },
    });
    return { count };
  });
