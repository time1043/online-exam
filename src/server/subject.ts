import { createServerFn } from '@tanstack/react-start';

import { prisma } from '@/db';
import { authFnMiddleware } from '@/middlewares/auth';
import { getSubjectSchema, createSubjectSchema, joinSubjectSchema } from '@/schemas/subject';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const getSubjects = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const { session } = context;
    return prisma.subject.findMany({
      where: { teacherId: session.user.id },
      include: {
        _count: {
          select: { enrollments: true, exams: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

export const getSubject = createServerFn({ method: 'GET' })
  .validator(getSubjectSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    return prisma.subject.findFirst({
      where: { id: data.subjectId, teacherId: session.user.id },
      include: {
        enrollments: {
          include: { student: { select: { id: true, name: true, email: true } } },
          orderBy: { joinedAt: 'desc' },
        },
      },
    });
  });

export const createSubject = createServerFn({ method: 'POST' })
  .validator(createSubjectSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const inviteCode = generateInviteCode();
    return prisma.subject.create({
      data: {
        name: data.name,
        inviteCode,
        teacherId: session.user.id,
      },
    });
  });

// Student server functions
export const joinSubject = createServerFn({ method: 'POST' })
  .validator(joinSubjectSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const subject = await prisma.subject.findUnique({
      where: { inviteCode: data.inviteCode },
    });
    if (!subject) throw new Error('邀请码无效');

    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_subjectId: {
          studentId: session.user.id,
          subjectId: subject.id,
        },
      },
    });
    if (existing) throw new Error('已加入该科目');

    return prisma.enrollment.create({
      data: {
        studentId: session.user.id,
        subjectId: subject.id,
      },
    });
  });

export const getStudentSubjects = createServerFn({ method: 'GET' })
  .middleware([authFnMiddleware])
  .handler(async ({ context }) => {
    const { session } = context;
    return prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        subject: {
          include: {
            teacher: { select: { name: true } },
            _count: { select: { exams: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  });

export const getStudentSubject = createServerFn({ method: 'GET' })
  .validator(getSubjectSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data, context }) => {
    const { session } = context;
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_subjectId: {
          studentId: session.user.id,
          subjectId: data.subjectId,
        },
      },
      include: {
        subject: {
          include: {
            teacher: { select: { name: true } },
            exams: {
              where: { status: 'published' },
              select: { id: true, title: true, status: true },
            },
          },
        },
      },
    });
    return enrollment?.subject ?? null;
  });
