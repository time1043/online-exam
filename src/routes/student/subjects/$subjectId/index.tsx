import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { FileText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { getSubjectSchema } from '@/schemas/subject';
import { getStudentSubject } from '@/server/subject';

export const Route = createFileRoute('/student/subjects/$subjectId/')({
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
      <div>
        <h1 className="text-2xl font-bold">{subject.name}</h1>
        <p className="text-muted-foreground">教师：{subject.teacher.name}</p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          <FileText className="mr-2 inline size-5" />
          考试列表
        </h2>
        {subject.exams.length === 0 ? (
          <p className="text-muted-foreground">暂无考试</p>
        ) : (
          <div className="space-y-3">
            {subject.exams.map((exam) => {
              const submitted =
                exam.examSubmissions.length > 0 && exam.examSubmissions[0].submittedAt;
              const draft = exam.examSubmissions.length > 0 && !exam.examSubmissions[0].submittedAt;
              return (
                <Link
                  key={exam.id}
                  to={
                    submitted
                      ? '/student/subjects/$subjectId/exams/$examId/result'
                      : '/student/subjects/$subjectId/exams/$examId'
                  }
                  params={{ subjectId, examId: String(exam.id) }}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                >
                  <span className="font-medium">{exam.title}</span>
                  {submitted ? (
                    <Badge variant="secondary">已提交 · 查看成绩</Badge>
                  ) : draft ? (
                    <Badge variant="outline">答题中</Badge>
                  ) : (
                    <Badge>可参加</Badge>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
