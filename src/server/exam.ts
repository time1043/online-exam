import { createServerFn } from '@tanstack/react-start';

import { prisma } from '@/db';
import { authFnMiddleware } from '@/middlewares/auth';
import {
  createExamSchema,
  deleteExamSchema,
  getExamSchema,
  getExamsSchema,
  publishExamSchema,
  updateExamQuestionsSchema,
  updateExamSchema,
} from '@/schemas/exam';

export const getExams = createServerFn({ method: 'GET' })
  .validator(getExamsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, teacherId: session.user.id },
      select: { id: true },
    });
    if (!subject) throw new Error('科目不存在或无权访问');

    return prisma.exam.findMany({
      where: { subjectId: data.subjectId },
      include: {
        _count: { select: { examQuestions: true } },
        examQuestions: { select: { score: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

export const getExam = createServerFn({ method: 'GET' })
  .validator(getExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, teacherId: session.user.id },
      select: { id: true },
    });
    if (!subject) throw new Error('科目不存在或无权访问');

    const exam = await prisma.exam.findFirst({
      where: { id: data.examId, subjectId: data.subjectId },
      include: {
        subject: { select: { name: true } },
        examQuestions: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                type: true,
                options: true,
                answer: true,
                tags: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!exam) throw new Error('试卷不存在');
    return exam;
  });

export const createExam = createServerFn({ method: 'POST' })
  .validator(createExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const subject = await prisma.subject.findFirst({
      where: { id: data.subjectId, teacherId: session.user.id },
      select: { id: true },
    });
    if (!subject) throw new Error('科目不存在或无权访问');

    return prisma.exam.create({
      data: {
        title: data.title,
        subjectId: data.subjectId,
        timeLimit: data.timeLimit,
      },
    });
  });

export const updateExam = createServerFn({ method: 'POST' })
  .validator(updateExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    return prisma.exam.update({
      where: { id: data.examId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.timeLimit !== undefined ? { timeLimit: data.timeLimit } : {}),
      },
    });
  });

export const updateExamQuestions = createServerFn({ method: 'POST' })
  .validator(updateExamQuestionsSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    await prisma.$transaction([
      prisma.examQuestion.deleteMany({ where: { examId: data.examId } }),
      ...(data.questions.length > 0
        ? [
            prisma.examQuestion.createMany({
              data: data.questions.map((q) => ({
                examId: data.examId,
                questionId: q.questionId,
                order: q.order,
                score: q.score,
              })),
            }),
          ]
        : []),
    ]);

    return { count: data.questions.length };
  });

export const publishExam = createServerFn({ method: 'POST' })
  .validator(publishExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true, status: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    const newStatus = exam.status === 'draft' ? 'published' : 'draft';
    return prisma.exam.update({
      where: { id: data.examId },
      data: { status: newStatus },
    });
  });

export const deleteExam = createServerFn({ method: 'POST' })
  .validator(deleteExamSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const exam = await prisma.exam.findFirst({
      where: {
        id: data.examId,
        subject: { teacherId: session.user.id },
      },
      select: { id: true },
    });
    if (!exam) throw new Error('试卷不存在或无权访问');

    return prisma.exam.delete({ where: { id: data.examId } });
  });
