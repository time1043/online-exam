import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { Navbar } from '@/components/layout/navbar';
import { ensureSession } from '@/lib/auth-guard';

const navItems = [
  { label: '仪表盘', href: '/teacher' },
  { label: '科目', href: '/teacher/subjects' },
  { label: '考试管理', href: '/teacher/exams' },
  { label: '题库', href: '/teacher/questions' },
  { label: '学生', href: '/teacher/students' },
  { label: '成绩', href: '/teacher/results' },
];

export const Route = createFileRoute('/teacher')({
  beforeLoad: async () => {
    const session = await ensureSession();
    if (!session) throw redirect({ to: '/auth/$path', params: { path: 'sign-in' } });
    if (session.user.role !== 'teacher') throw redirect({ to: `/${session.user.role}` });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar title="教师端" role="teacher" navItems={navItems} />
      <main className="container mx-auto max-w-7xl flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
