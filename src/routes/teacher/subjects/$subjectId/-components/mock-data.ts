export interface ExamRow {
  id: number;
  title: string;
  status: 'draft' | 'published';
  questionCount: number;
  totalScore: number;
  timeLimit: number | null;
  createdAt: string;
}

export const mockExams: ExamRow[] = [
  {
    id: 1,
    title: 'JavaScript 基础测验',
    status: 'published',
    questionCount: 10,
    totalScore: 100,
    timeLimit: 60,
    createdAt: '2026-06-10T08:00:00.000Z',
  },
  {
    id: 2,
    title: 'CSS 布局专项练习',
    status: 'draft',
    questionCount: 8,
    totalScore: 80,
    timeLimit: 45,
    createdAt: '2026-06-12T10:00:00.000Z',
  },
  {
    id: 3,
    title: 'React 综合考试',
    status: 'draft',
    questionCount: 0,
    totalScore: 0,
    timeLimit: null,
    createdAt: '2026-06-15T14:00:00.000Z',
  },
];
