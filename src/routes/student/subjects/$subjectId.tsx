import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/student/subjects/$subjectId')({
  component: RouteComponent,
});

// TODO: 替换为真实数据
const mockSubject = {
  id: 1,
  name: '数据库原理',
  teacherName: '张老师',
  exams: [
    { id: 1, title: '期中考试', status: 'published' },
    { id: 2, title: '期末考试', status: 'draft' },
  ],
};

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/student/subjects" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{mockSubject.name}</h1>
          <p className="text-muted-foreground">教师：{mockSubject.teacherName}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">考试列表</h2>
        {mockSubject.exams.length === 0 ? (
          <p className="text-muted-foreground">暂无考试</p>
        ) : (
          <div className="space-y-3">
            {mockSubject.exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <span className="font-medium">{exam.title}</span>
                <span className="text-sm text-muted-foreground">
                  {exam.status === 'published' ? '进行中' : '未发布'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
