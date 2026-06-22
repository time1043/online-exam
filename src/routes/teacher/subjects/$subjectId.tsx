import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { getSubjectSchema } from '@/schemas/subject';
import { getSubject } from '@/server/subject';

import { CreateExamDialog } from './$subjectId/-components/create-exam-dialog';
import { ExamList } from './$subjectId/-components/exam-list';
import { mockExams } from './$subjectId/-components/mock-data';
import { EnrollmentList } from './-components/enrollment-list';
import { InviteCodeCard } from './-components/invite-code-card';

export const Route = createFileRoute('/teacher/subjects/$subjectId')({
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
      <div className="flex items-center gap-4">
        <Link to="/teacher/subjects" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{subject.name}</h1>
        </div>
      </div>

      <InviteCodeCard inviteCode={subject.inviteCode} />
      <ExamList
        exams={mockExams}
        actions={<CreateExamDialog onSubmit={(data) => console.log('创建试卷:', data)} />}
      />
      <EnrollmentList enrollments={subject.enrollments} />
    </div>
  );
}
