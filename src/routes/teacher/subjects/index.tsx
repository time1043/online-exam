import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';

import { getSubjects, createSubject } from '@/server/subject';

import { CreateSubjectDialog } from './-components/create-subject-dialog';
import { SubjectCard } from './-components/subject-card';

export const Route = createFileRoute('/teacher/subjects/')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getSubjects(),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => createSubject({ data: name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('科目创建成功');
    },
    onError: () => {
      toast.error('创建失败，请重试');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">科目管理</h1>
          <p className="text-muted-foreground">管理你创建的科目和邀请码</p>
        </div>
        <CreateSubjectDialog onSubmit={(name) => createMutation.mutate(name)} />
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">加载中...</div>
      ) : subjects.length === 0 ? (
        <div className="text-center text-muted-foreground">暂无科目，点击上方按钮创建</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              id={subject.id}
              name={subject.name}
              inviteCode={subject.inviteCode}
              enrollmentCount={subject._count.enrollments}
              examCount={subject._count.exams}
            />
          ))}
        </div>
      )}
    </div>
  );
}
