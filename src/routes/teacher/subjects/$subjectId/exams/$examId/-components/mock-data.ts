import type { QuestionRow } from '@/routes/teacher/questions/-components/question-table';

export interface ExamInfo {
  id: number;
  title: string;
  status: 'draft' | 'published';
  timeLimit: number | null;
  subjectName: string;
}

export interface ExamQuestionItem {
  order: number;
  score: number;
  question: Pick<QuestionRow, 'id' | 'content' | 'type' | 'options' | 'answer' | 'tags'>;
}

export const mockExamInfo: ExamInfo = {
  id: 1,
  title: 'JavaScript 基础测验',
  status: 'draft',
  timeLimit: 60,
  subjectName: 'Web 前端开发',
};

export const mockExamQuestions: ExamQuestionItem[] = [
  {
    order: 1,
    score: 10,
    question: {
      id: 'q1',
      content: 'HTTP 状态码 404 表示什么？',
      type: 'single_choice',
      options: ['Not Found', 'Bad Request', 'Unauthorized', 'Internal Server Error'],
      answer: 0,
      tags: ['HTTP', '网络'],
    },
  },
  {
    order: 2,
    score: 10,
    question: {
      id: 'q2',
      content: '以下哪些是 JavaScript 的原始类型？',
      type: 'multiple_choice',
      options: ['string', 'array', 'boolean', 'object', 'number'],
      answer: [0, 2, 4],
      tags: ['JavaScript', '基础'],
    },
  },
  {
    order: 3,
    score: 5,
    question: {
      id: 'q3',
      content: 'TypeScript 是 JavaScript 的超集。',
      type: 'true_false',
      options: null,
      answer: 0,
      tags: ['TypeScript'],
    },
  },
  {
    order: 4,
    score: 10,
    question: {
      id: 'q4',
      content: 'HTML 中，____ 标签用于创建超链接。',
      type: 'fill_blank',
      options: null,
      answer: ['a'],
      tags: ['HTML', '前端'],
    },
  },
  {
    order: 5,
    score: 15,
    question: {
      id: 'q5',
      content: '简述虚拟 DOM 的工作原理及其优势。',
      type: 'essay',
      options: null,
      answer: '虚拟 DOM 是真实 DOM 的轻量级 JavaScript 对象表示...',
      tags: ['React', '原理'],
    },
  },
];
