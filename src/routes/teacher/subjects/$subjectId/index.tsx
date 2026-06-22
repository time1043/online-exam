import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';

import { getSubjectSchema } from '@/schemas/subject';
import { createExam, getExams } from '@/server/exam';
import { getSubject } from '@/server/subject';

import type { ExamRow } from './-components/mock-data';

import { EnrollmentList } from '../-components/enrollment-list';
import { InviteCodeCard } from '../-components/invite-code-card';
import { CreateExamDialog } from './-components/create-exam-dialog';
import { ExamList } from './-components/exam-list';

export const Route = createFileRoute('/teacher/subjects/$subjectId/')({
  component: RouteComponent,
});

function toExamRow(exam: NonNullable<Awaited<ReturnType<typeof getExams>>>[number]): ExamRow {
  return {
    id: exam.id,
    title: exam.title,
    status: exam.status,
    questionCount: exam._count.examQuestions,
    totalScore: exam.examQuestions.reduce((sum, eq) => sum + eq.score, 0),
    timeLimit: exam.timeLimit,
    createdAt: typeof exam.createdAt === 'string' ? exam.createdAt : exam.createdAt.toISOString(),
  };
}

function RouteComponent() {
  const { subjectId } = Route.useParams();
  const queryClient = useQueryClient();
  const sid = Number(subjectId);

  const { data: subject, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubject({ data: getSubjectSchema.parse({ subjectId: sid }) }),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['exams', subjectId],
    queryFn: () => getExams({ data: { subjectId: sid } }),
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; timeLimit: number | null }) =>
      createExam({ data: { ...data, subjectId: sid } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', subjectId] });
      toast.success('试卷创建成功');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : '创建失败，请重试');
    },
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  if (!subject) {
    return <div className="text-center text-muted-foreground">科目不存在</div>;
  }

  const rows = exams.map(toExamRow);

  return (
    <div className="space-y-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{subject.name}</h1>
      </div>

      <InviteCodeCard inviteCode={subject.inviteCode} />
      <ExamList
        subjectId={subjectId}
        exams={rows}
        actions={<CreateExamDialog onSubmit={(data) => createMutation.mutate(data)} />}
      />
      <EnrollmentList enrollments={subject.enrollments} />
    </div>
  );
}
