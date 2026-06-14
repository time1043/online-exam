import { createFileRoute } from '@tanstack/react-router';

import { JoinSubjectDialog } from './-components/join-subject-dialog';
import { SubjectCard } from './-components/subject-card';

export const Route = createFileRoute('/student/subjects/')({
  component: RouteComponent,
});

// TODO: 替换为真实数据
const mockSubjects = [
  {
    id: 1,
    name: '数据库原理',
    teacherName: '张老师',
    _count: { exams: 3 },
  },
  {
    id: 2,
    name: '数据结构',
    teacherName: '李老师',
    _count: { exams: 2 },
  },
];

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的科目</h1>
          <p className="text-muted-foreground">查看已加入的科目</p>
        </div>
        <JoinSubjectDialog onSubmit={(code) => console.log('加入科目:', code)} />
      </div>

      {mockSubjects.length === 0 ? (
        <div className="text-center text-muted-foreground">
          暂无科目，点击上方按钮通过邀请码加入
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              name={subject.name}
              teacherName={subject.teacherName}
              examCount={subject._count.exams}
            />
          ))}
        </div>
      )}
    </div>
  );
}
