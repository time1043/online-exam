import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  BookOpen,
  FileText,
  Trophy,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { getAvailableExams } from '@/server/exam';
import { getStudentSubjects } from '@/server/subject';

export const Route = createFileRoute('/student/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['studentSubjects'],
    queryFn: () => getStudentSubjects(),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['availableExams'],
    queryFn: () => getAvailableExams(),
  });

  const totalExams = exams.length;
  const submittedExams = exams.filter(
    (e: any) => e.examSubmissions.length > 0 && e.examSubmissions[0].submittedAt,
  ).length;
  const draftExams = totalExams - submittedExams;

  if (subjectsLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">学生仪表盘</h1>
        <p className="text-muted-foreground">查看你的科目和考试</p>
      </div>

      {/* 概览 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500">
              <BookOpen className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">已加入科目</p>
              <p className="text-2xl font-bold">{subjects.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-green-500">
              <FileText className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">可参加考试</p>
              <p className="text-2xl font-bold">{draftExams}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500">
              <Trophy className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">已提交</p>
              <p className="text-2xl font-bold">{submittedExams}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近考试 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <FileText className="mr-2 inline size-5" />
            最近考试
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              暂无考试，先加入一个科目吧
            </div>
          ) : (
            <div className="space-y-3">
              {exams.slice(0, 8).map((exam: any) => {
                const submitted = exam.examSubmissions.length > 0 && exam.examSubmissions[0].submittedAt;
                return (
                  <Link
                    key={exam.id}
                    to={submitted ? '/student/subjects/$subjectId/exams/$examId/result' : '/student/subjects/$subjectId/exams/$examId'}
                    params={{
                      subjectId: String(exam.subject.id),
                      examId: String(exam.id),
                    }}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {exam.subject.name} · {exam.examQuestions?.length ?? 0} 题 · {exam.timeLimit ? `${exam.timeLimit} 分钟` : '不限时'}
                      </p>
                    </div>
                    <Badge variant={submitted ? 'secondary' : 'default'}>
                      {submitted ? '已提交' : '待考试'}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 已加入科目 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <BookOpen className="mr-2 inline size-5" />
            我的科目
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              暂未加入任何科目
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((s: any) => (
                <Link
                  key={s.id}
                  to="/student/subjects/$subjectId"
                  params={{ subjectId: String(s.id) }}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{s.subject.name}</p>
                    <p className="text-xs text-muted-foreground">
                      教师：{s.subject.teacher.name} · {s.subject.exams?.length ?? 0} 场考试
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
