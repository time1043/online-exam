import { createFileRoute } from '@tanstack/react-router';

import { CreateSubjectDialog } from './-components/create-subject-dialog';
import { SubjectCard } from './-components/subject-card';

export const Route = createFileRoute('/teacher/subjects/')({
  component: RouteComponent,
});

// TODO: 替换为真实数据
const mockSubjects = [
  {
    id: 1,
    name: '数据库原理',
    inviteCode: 'DB2024',
    _count: { enrollments: 12, exams: 3 },
  },
  {
    id: 2,
    name: '数据结构',
    inviteCode: 'DS101',
    _count: { enrollments: 8, exams: 2 },
  },
  {
    id: 3,
    name: '操作系统',
    inviteCode: 'OS301',
    _count: { enrollments: 15, exams: 4 },
  },
];

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">科目管理</h1>
          <p className="text-muted-foreground">管理你创建的科目和邀请码</p>
        </div>
        <CreateSubjectDialog onSubmit={(name) => console.log('创建科目:', name)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockSubjects.map((subject) => (
          <SubjectCard
            key={subject.id}
            id={subject.id}
            name={subject.name}
            inviteCode={subject.inviteCode}
            enrollmentCount={subject._count.enrollments}
            examCount={subject._count.exams}
          />
        ))}
      </div>
    </div>
  );
}
