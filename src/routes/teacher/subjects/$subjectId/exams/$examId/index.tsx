import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { getExam, publishExam, toggleAIGrading, updateExamQuestions } from '@/server/exam';
import { getQuestions } from '@/server/question';

import type { ExamQuestionItem } from './-components/mock-data';

import { AddQuestionsDialog } from './-components/add-questions-dialog';
import { ExamChat } from './-components/exam-chat';
import { ExamQuestionList } from './-components/exam-question-list';

export const Route = createFileRoute('/teacher/subjects/$subjectId/exams/$examId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { subjectId, examId } = Route.useParams();
  const queryClient = useQueryClient();
  const sid = Number(subjectId);
  const eid = Number(examId);

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['exam', subjectId, examId],
    queryFn: () => getExam({ data: { subjectId: sid, examId: eid } }),
  });

  const { data: allQuestions = [] } = useQuery({
    queryKey: ['questions'],
    queryFn: () => getQuestions(),
  });

  const [questions, setQuestions] = useState<ExamQuestionItem[]>([]);

  useEffect(() => {
    if (exam) {
      setQuestions(
        exam.examQuestions.map((eq) => ({
          order: eq.order,
          score: eq.score,
          question: {
            id: eq.question.id,
            content: eq.question.content,
            type: eq.question.type,
            options: eq.question.options as string[] | null,
            answer: eq.question.answer as string | number | number[],
            tags: eq.question.tags,
          },
        })),
      );
    }
  }, [exam]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateExamQuestions({
        data: {
          examId: eid,
          questions: questions.map((q) => ({
            questionId: q.question.id,
            order: q.order,
            score: q.score,
          })),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', subjectId, examId] });
      queryClient.invalidateQueries({ queryKey: ['exams', subjectId] });
      toast.success('试卷已保存');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '保存失败，请重试');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishExam({ data: { examId: eid } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', subjectId, examId] });
      queryClient.invalidateQueries({ queryKey: ['exams', subjectId] });
      toast.success('状态已更新');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '操作失败');
    },
  });

  const aiGradingMutation = useMutation({
    mutationFn: (enabled: boolean) => toggleAIGrading({ data: { examId: eid, enabled } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam', subjectId, examId] });
      toast.success('设置已更新');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '操作失败');
    },
  });

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' }> = {
    draft: { label: '草稿', variant: 'secondary' },
    published: { label: '已发布', variant: 'default' },
  };

  if (examLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  if (!exam) {
    return <div className="text-center text-muted-foreground">试卷不存在</div>;
  }

  const s = statusMap[exam.status] ?? statusMap.draft;

  // Available questions = not already in exam
  const usedIds = new Set(questions.map((q) => q.question.id));
  const availableQuestions = allQuestions
    .filter((q) => !usedIds.has(q.id))
    .map((q) => ({ id: q.id, content: q.content, type: q.type, tags: q.tags }));

  function handleScoreChange(order: number, score: number) {
    setQuestions((prev) => prev.map((q) => (q.order === order ? { ...q, score } : q)));
  }

  function handleMove(fromOrder: number, direction: 'up' | 'down') {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.order === fromOrder);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next.map((q, i) => ({ ...q, order: i + 1 }));
    });
  }

  function handleRemove(order: number) {
    setQuestions((prev) =>
      prev.filter((q) => q.order !== order).map((q, i) => ({ ...q, order: i + 1 })),
    );
  }

  function handleAdd(questionIds: string[]) {
    const newItems: ExamQuestionItem[] = questionIds.map((id) => {
      const q = allQuestions.find((aq) => aq.id === id)!;
      return {
        order: 0,
        score: 10,
        question: {
          id: q.id,
          content: q.content,
          type: q.type,
          options: q.options as string[] | null,
          answer: q.answer as string | number | number[],
          tags: q.tags,
        },
      };
    });
    setQuestions((prev) => {
      const merged = [...prev, ...newItems];
      return merged.map((q, i) => ({ ...q, order: i + 1 }));
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/teacher/subjects/$subjectId"
          params={{ subjectId }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            {exam.subject.name}
            {exam.timeLimit && ` · ${exam.timeLimit} 分钟`}
          </p>
        </div>
        <Badge variant={s.variant}>{s.label}</Badge>
        {exam.status === 'published' && (
          <Link
            to="/teacher/subjects/$subjectId/exams/$examId/submissions"
            params={{ subjectId, examId }}
          >
            <Button variant="outline" size="sm">
              查看提交
            </Button>
          </Link>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          保存
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">AI 自动判题</span>
          <Switch
            size="sm"
            checked={(exam as Record<string, unknown>).aiGradingEnabled as boolean}
            disabled={aiGradingMutation.isPending}
            onCheckedChange={(checked) => aiGradingMutation.mutate(checked)}
          />
        </div>
        {exam.status === 'draft' ? (
          <Button
            size="sm"
            disabled={questions.length === 0 || publishMutation.isPending}
            onClick={() => publishMutation.mutate()}
          >
            发布试卷
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={publishMutation.isPending}
            onClick={() => publishMutation.mutate()}
          >
            取消发布
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">试卷题目</CardTitle>
              <AddQuestionsDialog availableQuestions={availableQuestions} onAdd={handleAdd} />
            </CardHeader>
            <CardContent>
              <ExamQuestionList
                questions={questions}
                onScoreChange={handleScoreChange}
                onMove={handleMove}
                onRemove={handleRemove}
              />
            </CardContent>
          </Card>
        </div>
        <div className="max-h-[calc(100vh-12rem)]">
          <ExamChat examId={eid} />
        </div>
      </div>
    </div>
  );
}
