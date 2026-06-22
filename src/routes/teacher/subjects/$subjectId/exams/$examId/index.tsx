import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { ExamQuestionItem } from './-components/mock-data';

import { AddQuestionsDialog } from './-components/add-questions-dialog';
import { ExamQuestionList } from './-components/exam-question-list';
import { mockExamInfo, mockExamQuestions } from './-components/mock-data';

export const Route = createFileRoute('/teacher/subjects/$subjectId/exams/$examId/')({
  component: RouteComponent,
});

// 题库中可选的题目（mock）
const mockAvailableQuestions = [
  {
    id: 'q6',
    content: 'React 中 useState 返回的第二个值是什么？',
    type: 'fill_blank',
    tags: ['React', 'Hooks'],
  },
  {
    id: 'q7',
    content: 'CSS 中，以下哪个属性用于设置文字颜色？',
    type: 'single_choice',
    tags: ['CSS', '基础'],
  },
  {
    id: 'q8',
    content: '以下哪些是 HTTP 请求方法？',
    type: 'multiple_choice',
    tags: ['HTTP', '网络'],
  },
  {
    id: 'q9',
    content: '在 JavaScript 中，null == undefined 的结果是 true。',
    type: 'true_false',
    tags: ['JavaScript', '基础'],
  },
  {
    id: 'q10',
    content: '解释浏览器从输入 URL 到页面渲染完成的完整流程。',
    type: 'essay',
    tags: ['浏览器', '原理'],
  },
];

function RouteComponent() {
  const { subjectId, examId: _examId } = Route.useParams();
  const [questions, setQuestions] = useState<ExamQuestionItem[]>(mockExamQuestions);

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' }> = {
    draft: { label: '草稿', variant: 'secondary' },
    published: { label: '已发布', variant: 'default' },
  };
  const s = statusMap[mockExamInfo.status] ?? statusMap.draft;

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
      const q = mockAvailableQuestions.find((aq) => aq.id === id)!;
      return {
        order: 0,
        score: 10,
        question: {
          id: q.id,
          content: q.content,
          type: q.type,
          options: null,
          answer: 0,
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
          <h1 className="text-2xl font-bold">{mockExamInfo.title}</h1>
          <p className="text-sm text-muted-foreground">
            {mockExamInfo.subjectName}
            {mockExamInfo.timeLimit && ` · ${mockExamInfo.timeLimit} 分钟`}
          </p>
        </div>
        <Badge variant={s.variant}>{s.label}</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">试卷题目</CardTitle>
          <AddQuestionsDialog availableQuestions={mockAvailableQuestions} onAdd={handleAdd} />
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
  );
}
