import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { getSubjectSchema } from '@/schemas/subject';
import { getSubject } from '@/server/subject';

import { EnrollmentList } from '../-components/enrollment-list';
import { InviteCodeCard } from '../-components/invite-code-card';
import { CreateExamDialog } from './-components/create-exam-dialog';
import { ExamList } from './-components/exam-list';
import { mockExams } from './-components/mock-data';

export const Route = createFileRoute('/teacher/subjects/$subjectId/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { subjectId } = Route.useParams();

  const { data: subject, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => getSubject({ data: getSubjectSchema.parse({ subjectId: Number(subjectId) }) }),
  });

  if (isLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  if (!subject) {
    return <div className="text-center text-muted-foreground">科目不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{subject.name}</h1>
      </div>

      <InviteCodeCard inviteCode={subject.inviteCode} />
      <ExamList
        subjectId={subjectId}
        exams={mockExams}
        actions={<CreateExamDialog onSubmit={(data) => console.log('创建试卷:', data)} />}
      />
      <EnrollmentList enrollments={subject.enrollments} />
    </div>
  );
}
