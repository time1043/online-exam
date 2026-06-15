import { createFileRoute } from '@tanstack/react-router';

import { CreateQuestionDialog } from './-components/create-question-dialog';
import { mockQuestions } from './-components/mock-data';
import { QuestionTable } from './-components/question-table';

export const Route = createFileRoute('/teacher/questions/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">题库管理</h1>
          <p className="text-muted-foreground">管理你的题目</p>
        </div>
        <CreateQuestionDialog onSubmit={(data) => console.log('创建题目:', data)} />
      </div>

      <QuestionTable data={mockQuestions} />
    </div>
  );
}
