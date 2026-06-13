import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Navbar } from '@/components/layout/navbar';

const navItems = [
  { label: '仪表盘', href: '/student' },
  { label: '我的考试', href: '/student/exams' },
  { label: '成绩', href: '/student/results' },
  { label: '个人资料', href: '/student/profile' },
];

export const Route = createFileRoute('/student')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar title="学生端" role="student" navItems={navItems} />
      <main className="container mx-auto max-w-7xl flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
