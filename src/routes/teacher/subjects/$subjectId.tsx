import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { EnrollmentList } from './-components/enrollment-list';
import { InviteCodeCard } from './-components/invite-code-card';

export const Route = createFileRoute('/teacher/subjects/$subjectId')({
  component: RouteComponent,
});

// TODO: 替换为真实数据
const mockSubject = {
  id: 1,
  name: '数据库原理',
  inviteCode: 'DB2024',
  enrollments: [
    {
      id: 1,
      student: { name: '张三', email: 'zhangsan@example.com' },
      joinedAt: new Date('2024-03-01'),
    },
    {
      id: 2,
      student: { name: '李四', email: 'lisi@example.com' },
      joinedAt: new Date('2024-03-05'),
    },
    {
      id: 3,
      student: { name: '王五', email: 'wangwu@example.com' },
      joinedAt: new Date('2024-03-10'),
    },
  ],
};

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teacher/subjects" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{mockSubject.name}</h1>
        </div>
      </div>

      <InviteCodeCard inviteCode={mockSubject.inviteCode} />
      <EnrollmentList enrollments={mockSubject.enrollments} />
    </div>
  );
}
