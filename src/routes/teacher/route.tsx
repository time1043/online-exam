import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Navbar } from '@/components/layout/navbar';

const navItems = [
  { label: '仪表盘', href: '/teacher' },
  { label: '考试管理', href: '/teacher/exams' },
  { label: '题库', href: '/teacher/questions' },
  { label: '学生', href: '/teacher/students' },
  { label: '成绩', href: '/teacher/results' },
];

export const Route = createFileRoute('/teacher')({
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
