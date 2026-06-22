import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getExamSubmissionsSchema } from '@/schemas/exam';
import { getExamSubmissions } from '@/server/exam';

export const Route = createFileRoute('/teacher/subjects/$subjectId/exams/$examId/submissions/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { subjectId, examId } = Route.useParams();
  const eid = Number(examId);

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['examSubmissions', examId],
    queryFn: () => getExamSubmissions({ data: getExamSubmissionsSchema.parse({ examId: eid }) }),
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/teacher/subjects/$subjectId/exams/$examId"
          params={{ subjectId, examId }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">学生提交</h1>
          <p className="text-sm text-muted-foreground">共 {submissions.length} 份提交</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">暂无学生提交</div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>学生</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>提交时间</TableHead>
                <TableHead className="text-right">得分</TableHead>
                <TableHead className="text-center">状态</TableHead>
                <TableHead className="text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.student.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.student.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.submittedAt ? new Date(s.submittedAt).toLocaleString('zh-CN') : '—'}
                  </TableCell>
                  <TableCell className="text-right font-medium">{s.gradedScore}</TableCell>
                  <TableCell className="text-center">
                    {s.hasUngraded ? (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="size-3" />
                        待批改
                      </Badge>
                    ) : (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="size-3" />
                        已批改
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Link
                      to="/teacher/subjects/$subjectId/exams/$examId/submissions/$submissionId"
                      params={{ subjectId, examId, submissionId: String(s.id) }}
                      className="text-sm text-primary hover:underline"
                    >
                      查看详情
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
