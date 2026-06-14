import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { getSubjectSchema } from '@/schemas/subject';
import { getStudentSubject } from '@/server/subject';

export const Route = createFileRoute('/student/subjects/$subjectId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { subjectId } = Route.useParams();

  const { data: subject, isLoading } = useQuery({
    queryKey: ['studentSubject', subjectId],
    queryFn: () =>
      getStudentSubject({ data: getSubjectSchema.parse({ subjectId: Number(subjectId) }) }),
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  if (!subject) {
    return <div className="text-center text-muted-foreground">科目不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/student/subjects" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{subject.name}</h1>
          <p className="text-muted-foreground">教师：{subject.teacher.name}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">考试列表</h2>
        {subject.exams.length === 0 ? (
          <p className="text-muted-foreground">暂无考试</p>
        ) : (
          <div className="space-y-3">
            {subject.exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <span className="font-medium">{exam.title}</span>
                <span className="text-sm text-muted-foreground">进行中</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
