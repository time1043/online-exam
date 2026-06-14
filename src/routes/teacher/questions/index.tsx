import { createFileRoute } from '@tanstack/react-router';

import { CreateQuestionDialog } from './-components/create-question-dialog';
import { QuestionCard } from './-components/question-card';

export const Route = createFileRoute('/teacher/questions/')({
  component: RouteComponent,
});

// TODO: 替换为真实数据
const mockQuestions = [
  {
    id: '1',
    content: 'HTTP 状态码 404 表示什么？',
    type: 'single_choice',
    tags: ['HTTP', '网络'],
  },
  {
    id: '2',
    content: '以下哪些是 JavaScript 的原始类型？',
    type: 'multiple_choice',
    tags: ['JavaScript', '基础'],
  },
  {
    id: '3',
    content: 'TypeScript 是 JavaScript 的超集。',
    type: 'true_false',
    tags: ['TypeScript'],
  },
  {
    id: '4',
    content: 'HTML 中，____ 标签用于创建超链接。',
    type: 'fill_blank',
    tags: ['HTML', '前端'],
  },
  {
    id: '5',
    content: '解释 RESTful API 的设计原则，并举例说明。',
    type: 'essay',
    tags: ['API', '架构'],
  },
];

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">题库管理</h1>
          <p className="text-muted-foreground">管理你的题目</p>
        </div>
        <CreateQuestionDialog onSubmit={(data) => console.log('创建题目:', data)} />
      </div>

      {mockQuestions.length === 0 ? (
        <div className="text-center text-muted-foreground">暂无题目，点击上方按钮创建</div>
      ) : (
        <div className="space-y-3">
          {mockQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              id={question.id}
              content={question.content}
              type={question.type}
              tags={question.tags}
            />
          ))}
        </div>
      )}
    </div>
  );
}
