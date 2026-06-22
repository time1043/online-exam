import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { questionTypeMap } from '@/routes/teacher/questions/-components/question-helpers';
import { getExamForStudentSchema } from '@/schemas/exam';
import { getExamResult } from '@/server/exam';

export const Route = createFileRoute('/student/subjects/$subjectId/exams/$examId/result/')({
  component: RouteComponent,
});

function formatAnswer(type: string, answer: unknown): string {
  if (answer === null || answer === undefined) return '未作答';
  switch (type) {
    case 'single_choice':
    case 'true_false':
      return String.fromCharCode(65 + Number(answer));
    case 'multiple_choice':
      return (answer as number[]).map((i) => String.fromCharCode(65 + i)).join('、');
    case 'fill_blank':
      return Array.isArray(answer) ? (answer as string[]).join('、') : String(answer);
    case 'essay':
      return String(answer);
    default:
      return String(answer);
  }
}

function RouteComponent() {
  const { subjectId, examId } = Route.useParams();
  const eid = Number(examId);

  const { data, isLoading } = useQuery({
    queryKey: ['examResult', examId],
    queryFn: () => getExamResult({ data: getExamForStudentSchema.parse({ examId: eid }) }),
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  if (!data) {
    return <div className="text-center text-muted-foreground">未找到考试记录</div>;
  }

  const {
    exam,
    submittedAt,
    totalScore,
    objectiveTotal,
    objectiveScore,
    subjectiveTotal,
    subjectiveScore,
    answers,
  } = data;
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));
  const gradedScore = objectiveScore + subjectiveScore;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/student/subjects/$subjectId"
          params={{ subjectId }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{exam.title} — 成绩</h1>
          <p className="text-sm text-muted-foreground">
            {exam.subject.name} · 提交时间：{new Date(submittedAt).toLocaleString('zh-CN')}
          </p>
        </div>
      </div>

      {/* 成绩概览 */}
      <Card>
        <CardContent className="flex items-center gap-6 pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{gradedScore}</div>
            <p className="text-sm text-muted-foreground">/ {totalScore} 分</p>
          </div>
          <Separator orientation="vertical" className="h-12" />
          <div className="space-y-1">
            <p className="text-sm">
              客观题：<span className="font-medium">{objectiveScore}</span>
              {objectiveTotal > 0 && (
                <span className="text-muted-foreground"> / {objectiveTotal}</span>
              )}
            </p>
            <p className="text-sm">
              主观题：<span className="font-medium">{subjectiveScore}</span>
              {subjectiveTotal > 0 && (
                <span className="text-muted-foreground"> / {subjectiveTotal}</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 逐题详情 */}
      <div className="space-y-4">
        {exam.examQuestions.map((eq, index) => {
          const answer = answerMap.get(eq.question.id);
          const studentAnswer = answer?.answer;
          const score = answer?.score;
          const isObjective = [
            'single_choice',
            'multiple_choice',
            'true_false',
            'fill_blank',
          ].includes(eq.question.type);
          const isCorrect = score === eq.score;

          return (
            <Card key={eq.question.id}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between text-base">
                  <div>
                    <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                    {eq.question.content}
                    <Badge variant="secondary" className="ml-2">
                      {questionTypeMap[eq.question.type] ?? eq.question.type}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {score !== null && score !== undefined ? (
                      isCorrect ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="size-3" />
                          {score}/{eq.score}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="size-3" />
                          {score}/{eq.score}
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline">待评分</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">你的答案：</span>
                  <span className="text-sm font-medium">
                    {formatAnswer(eq.question.type, studentAnswer)}
                  </span>
                </div>
                {isObjective && (
                  <div>
                    <span className="text-sm text-muted-foreground">正确答案：</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatAnswer(eq.question.type, eq.question.answer)}
                    </span>
                  </div>
                )}
                {eq.question.type === 'essay' && eq.question.gradingCriteria && (
                  <div>
                    <span className="text-sm text-muted-foreground">评分标准：</span>
                    <p className="mt-1 text-sm whitespace-pre-wrap">
                      {eq.question.gradingCriteria}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
