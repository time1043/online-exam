import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { questionTypeMap } from '@/routes/teacher/questions/-components/question-helpers';
import { getExamForStudentSchema } from '@/schemas/exam';
import { getExamForStudent, saveExam, submitExam } from '@/server/exam';

export const Route = createFileRoute('/student/subjects/$subjectId/exams/$examId/')({
  component: RouteComponent,
});

type AnswerValue = string | number | number[] | string[];

function RouteComponent() {
  const { subjectId, examId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const eid = Number(examId);

  const { data: exam, isLoading } = useQuery({
    queryKey: ['studentExam', examId],
    queryFn: () => getExamForStudent({ data: getExamForStudentSchema.parse({ examId: eid }) }),
  });

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

  const saveMutation = useMutation({
    mutationFn: () =>
      saveExam({
        data: {
          examId: eid,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        },
      }),
    onSuccess: () => {
      toast.success('保存成功');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '保存失败，请重试');
    },
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submitExam({
        data: {
          examId: eid,
          answers: Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            answer,
          })),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentSubject', subjectId] });
      toast.success('提交成功');
      navigate({ to: '/student/subjects/$subjectId', params: { subjectId } });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '提交失败，请重试');
    },
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  if (!exam) {
    return <div className="text-center text-muted-foreground">试卷不存在</div>;
  }

  const totalScore = exam.examQuestions.reduce((sum, eq) => sum + eq.score, 0);

  function setAnswer(questionId: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function getAnswer(questionId: string): AnswerValue {
    return answers[questionId] ?? '';
  }

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
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            {exam.subject.name} · 共 {exam.examQuestions.length} 题 · 总分 {totalScore}
            {exam.timeLimit && ` · ${exam.timeLimit} 分钟`}
          </p>
        </div>
        {exam.timeLimit && (
          <Badge variant="outline">
            <Clock className="mr-1 size-3" />
            {exam.timeLimit} 分钟
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {exam.examQuestions.map((eq, index) => (
          <Card key={eq.question.id}>
            <CardHeader>
              <CardTitle className="text-base">
                <span className="mr-2 text-muted-foreground">{index + 1}.</span>
                {eq.question.content}
                <Badge variant="secondary" className="ml-2">
                  {questionTypeMap[eq.question.type] ?? eq.question.type}
                </Badge>
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {eq.score} 分
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionInput
                questionId={eq.question.id}
                type={eq.question.type}
                options={eq.question.options as string[] | null}
                blankCount={
                  Array.isArray(eq.question.answer) ? (eq.question.answer as string[]).length : 1
                }
                value={getAnswer(eq.question.id)}
                onChange={(v) => setAnswer(eq.question.id, v)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          size="lg"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? '保存中...' : '保存'}
        </Button>
        <Button
          size="lg"
          disabled={submitMutation.isPending}
          onClick={() => submitMutation.mutate()}
        >
          {submitMutation.isPending ? '提交中...' : '提交试卷'}
        </Button>
      </div>
    </div>
  );
}

interface QuestionInputProps {
  questionId: string;
  type: string;
  options: string[] | null;
  blankCount?: number;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}

function QuestionInput({
  questionId,
  type,
  options,
  blankCount,
  value,
  onChange,
}: QuestionInputProps) {
  switch (type) {
    case 'single_choice':
    case 'true_false':
      return (
        <RadioGroup
          value={String(value)}
          onValueChange={(v) => onChange(type === 'true_false' ? Number(v) : Number(v))}
        >
          {(type === 'true_false' ? ['正确', '错误'] : (options ?? [])).map((opt, i) => (
            <div key={i} className="flex items-center space-x-2">
              <RadioGroupItem value={String(i)} id={`${questionId}-${i}`} />
              <Label htmlFor={`${questionId}-${i}`} className="font-normal">
                {type === 'true_false' ? opt : opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {(options ?? []).map((opt, i) => {
            const selected = Array.isArray(value) ? (value as number[]).includes(i) : false;
            return (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox
                  id={`${questionId}-${i}`}
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? (value as number[]) : [];
                    onChange(checked ? [...current, i] : current.filter((x) => x !== i));
                  }}
                />
                <Label htmlFor={`${questionId}-${i}`} className="font-normal">
                  {opt}
                </Label>
              </div>
            );
          })}
        </div>
      );

    case 'fill_blank': {
      const blanks: string[] = Array.isArray(value)
        ? (value as string[])
        : Array(blankCount ?? 1).fill('');
      return (
        <div className="space-y-2">
          {blanks.map((blank, i) => (
            <Input
              key={i}
              value={blank}
              onChange={(e) => {
                const next = [...blanks];
                next[i] = e.target.value;
                onChange(next);
              }}
              placeholder={`第 ${i + 1} 个空`}
            />
          ))}
        </div>
      );
    }

    case 'essay':
      return (
        <Textarea
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          placeholder="输入答案"
          rows={6}
        />
      );

    default:
      return null;
  }
}
