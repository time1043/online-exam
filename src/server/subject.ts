import { createServerFn } from '@tanstack/react-start';

import { prisma } from '@/db';
import { authFnMiddleware } from '@/middlewares/auth';
import { subjectIdSchema, createSubjectSchema } from '@/schemas/subject';

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
  .validator(subjectIdSchema)
  .middleware([authFnMiddleware])
  .handler(async ({ data: subjectId, context }) => {
    const { session } = context;
    return prisma.subject.findFirst({
      where: { id: subjectId, teacherId: session.user.id },
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
