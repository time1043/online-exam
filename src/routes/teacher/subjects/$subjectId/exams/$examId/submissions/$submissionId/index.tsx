import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { questionTypeMap } from '@/routes/teacher/questions/-components/question-helpers';
import { getSubmissionDetailSchema } from '@/schemas/exam';
import { getSubmissionDetail, gradeSubmission } from '@/server/exam';

export const Route = createFileRoute(
  '/teacher/subjects/$subjectId/exams/$examId/submissions/$submissionId/',
)({
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
  const { subjectId, examId, submissionId } = Route.useParams();
  const queryClient = useQueryClient();
  const sid = Number(submissionId);

  const { data, isLoading } = useQuery({
    queryKey: ['submissionDetail', submissionId],
    queryFn: () =>
      getSubmissionDetail({ data: getSubmissionDetailSchema.parse({ submissionId: sid }) }),
  });

  const [scores, setScores] = useState<Record<string, number>>({});

  const gradeMutation = useMutation({
    mutationFn: () =>
      gradeSubmission({
        data: {
          submissionId: sid,
          scores: Object.entries(scores).map(([questionId, score]) => ({
            questionId,
            score,
          })),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissionDetail', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['examSubmissions', examId] });
      toast.success('批改已保存');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '保存失败，请重试');
    },
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  if (!data) {
    return <div className="text-center text-muted-foreground">未找到提交记录</div>;
  }

  const { submission, answers, totalScore, gradedScore, hasUngraded } = data;
  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  function getScore(questionId: string, _maxScore: number): number {
    if (scores[questionId] !== undefined) return scores[questionId];
    const answer = answerMap.get(questionId);
    return answer?.score ?? 0;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/teacher/subjects/$subjectId/exams/$examId/submissions"
          params={{ subjectId, examId }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">批改试卷</h1>
          <p className="text-sm text-muted-foreground">
            学生：{submission.student.name} · 提交时间：
            {submission.submittedAt
              ? new Date(submission.submittedAt).toLocaleString('zh-CN')
              : '—'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{gradedScore}</div>
          <p className="text-sm text-muted-foreground">/ {totalScore} 分</p>
        </div>
      </div>

      <div className="space-y-4">
        {submission.exam.examQuestions.map((eq, index) => {
          const answer = answerMap.get(eq.question.id);
          const studentAnswer = answer?.answer;
          const currentScore = getScore(eq.question.id, eq.score);
          const isObjective = [
            'single_choice',
            'multiple_choice',
            'true_false',
            'fill_blank',
          ].includes(eq.question.type);

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
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      满分 {eq.score}
                    </span>
                  </div>
                  {answer?.score !== null && answer?.score !== undefined && !hasUngraded && (
                    <Badge variant={answer.score === eq.score ? 'default' : 'destructive'}>
                      {answer.score}/{eq.score}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">学生答案：</span>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {formatAnswer(eq.question.type, studentAnswer)}
                  </p>
                </div>

                {isObjective && (
                  <div>
                    <span className="text-sm text-muted-foreground">正确答案：</span>
                    <span className="ml-2 text-sm font-medium text-green-600">
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

                {/* 主观题打分 */}
                {!isObjective && (
                  <div className="flex items-center gap-2 rounded-md border bg-muted/30 p-3">
                    <Label htmlFor={`score-${eq.question.id}`} className="text-sm">
                      得分：
                    </Label>
                    <Input
                      id={`score-${eq.question.id}`}
                      type="number"
                      min="0"
                      max={eq.score}
                      value={currentScore}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [eq.question.id]: Math.min(Number(e.target.value) || 0, eq.score),
                        }))
                      }
                      className="h-8 w-20"
                    />
                    <span className="text-sm text-muted-foreground">/ {eq.score}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={gradeMutation.isPending || Object.keys(scores).length === 0}
          onClick={() => gradeMutation.mutate()}
        >
          {gradeMutation.isPending ? '保存中...' : '保存批改'}
        </Button>
      </div>
    </div>
  );
}
