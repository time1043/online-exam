import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';

import { getStudentSubjects, joinSubject } from '@/server/subject';

import { JoinSubjectDialog } from './-components/join-subject-dialog';
import { SubjectCard } from './-components/subject-card';

export const Route = createFileRoute('/student/subjects/')({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['studentSubjects'],
    queryFn: () => getStudentSubjects(),
  });

  const joinMutation = useMutation({
    mutationFn: (inviteCode: string) => joinSubject({ data: { inviteCode } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentSubjects'] });
      toast.success('加入科目成功');
    },
    onError: (error) => {
      toast.error(error.message || '加入失败，请检查邀请码');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的科目</h1>
          <p className="text-muted-foreground">查看已加入的科目</p>
        </div>
        <JoinSubjectDialog onSubmit={(code) => joinMutation.mutate(code)} />
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground">加载中...</div>
      ) : enrollments.length === 0 ? (
        <div className="text-center text-muted-foreground">
          暂无科目，点击上方按钮通过邀请码加入
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <SubjectCard
              key={enrollment.subject.id}
              id={enrollment.subject.id}
              name={enrollment.subject.name}
              teacherName={enrollment.subject.teacher.name}
              examCount={enrollment.subject._count.exams}
            />
          ))}
        </div>
      )}
    </div>
  );
}
