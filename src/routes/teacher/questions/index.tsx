import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';

import {
  createQuestion,
  deleteQuestion,
  deleteQuestions,
  getQuestions,
  importQuestions,
} from '@/server/question';

import type { QuestionRow } from './-components/question-table';

import { CreateQuestionDialog } from './-components/create-question-dialog';
import { ImportQuestionsDialog } from './-components/import-questions-dialog';
import { QuestionTable } from './-components/question-table';

export const Route = createFileRoute('/teacher/questions/')({
  component: RouteComponent,
});

function toQuestionRow(
  q: NonNullable<Awaited<ReturnType<typeof getQuestions>>>[number],
): QuestionRow {
  return {
    id: q.id,
    content: q.content,
    type: q.type,
    options: q.options as string[] | null,
    answer: q.answer as string | number | number[],
    tags: q.tags,
    status: q.status,
    isReported: q.isReported,
    creatorName: q.creator.name,
    createdAt: typeof q.createdAt === 'string' ? q.createdAt : (q.createdAt as Date).toISOString(),
  };
}

type CreateQuestionInput = {
  content: string;
  type: string;
  options: string[] | null;
  answer: string | number | number[] | string[];
  tags: string[];
};

function RouteComponent() {
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: () => getQuestions(),
  });

  const rows = questions.map(toQuestionRow);

  const createMutation = useMutation({
    mutationFn: (data: CreateQuestionInput) => createQuestion({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('题目创建成功');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '创建失败，请重试');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteQuestion({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success('题目已删除');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '删除失败，请重试');
    },
  });

  const importMutation = useMutation({
    mutationFn: (questions: CreateQuestionInput[]) => importQuestions({ data: { questions } }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success(`成功导入 ${result.count} 道题目`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '导入失败，请重试');
    },
  });

  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => deleteQuestions({ data: { ids } }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast.success(`成功删除 ${result.count} 道题目`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '删除失败，请重试');
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">题库管理</h1>
          <p className="text-muted-foreground">管理你的题目</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateQuestionDialog onSubmit={(data) => createMutation.mutate(data)} />
          <ImportQuestionsDialog
            onSubmit={(questions) => importMutation.mutate(questions as CreateQuestionInput[])}
            isLoading={importMutation.isPending}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">加载中...</div>
      ) : (
        <QuestionTable
          data={rows}
          onDelete={(id) => deleteMutation.mutate(id)}
          onBatchDelete={(ids) => batchDeleteMutation.mutate(ids)}
        />
      )}
    </div>
  );
}
