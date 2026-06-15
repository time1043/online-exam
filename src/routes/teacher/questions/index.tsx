import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { createFileRoute } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { CreateQuestionDialog } from './-components/create-question-dialog';

export const Route = createFileRoute('/teacher/questions/')({
  component: RouteComponent,
});

type QuestionRow = {
  id: string;
  content: string;
  type: string;
  options: string[] | null;
  answer: string | number | number[];
  tags: string[];
  status: string;
  createdAt: string;
};

const questionTypeMap: Record<string, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  essay: '论述题',
};

const statusMap: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: '待审核', variant: 'secondary' },
  active: { label: '已通过', variant: 'default' },
  rejected: { label: '已拒绝', variant: 'destructive' },
};

function formatAnswer(type: string, answer: string | number | number[]): string {
  switch (type) {
    case 'single_choice':
      return getOptionLabel(Number(answer));
    case 'multiple_choice':
      return (answer as number[]).map((i) => getOptionLabel(i)).join('、');
    case 'true_false':
      return Number(answer) === 0 ? '正确' : '错误';
    case 'fill_blank':
    case 'essay':
      return String(answer).length > 50 ? String(answer).slice(0, 50) + '...' : String(answer);
    default:
      return String(answer);
  }
}

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

const columnHelper = createColumnHelper<QuestionRow>();

const columns = [
  columnHelper.accessor('content', {
    header: '题干',
    cell: (info) => (
      <span className="line-clamp-2 max-w-80">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('type', {
    header: '题型',
    cell: (info) => (
      <Badge variant="secondary" className="shrink-0">
        {questionTypeMap[info.getValue()] || info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor('answer', {
    header: '答案',
    cell: (info) => (
      <span className="text-sm text-muted-foreground">
        {formatAnswer(info.row.original.type, info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor('tags', {
    header: '标签',
    cell: (info) => {
      const tags = info.getValue();
      if (tags.length === 0) return <span className="text-sm text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor('status', {
    header: '状态',
    cell: (info) => {
      const s = statusMap[info.getValue()] || statusMap.pending;
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  }),
  columnHelper.accessor('createdAt', {
    header: '创建时间',
    cell: (info) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {new Date(info.getValue()).toLocaleDateString('zh-CN')}
      </span>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: '操作',
    cell: (info) => (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          console.log('Delete question:', info.row.original.id);
        }}
      >
        <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
      </Button>
    ),
  }),
];

const mockQuestions: QuestionRow[] = [
  {
    id: '1',
    content: 'HTTP 状态码 404 表示什么？',
    type: 'single_choice',
    options: ['Not Found', 'Bad Request', 'Unauthorized', 'Internal Server Error'],
    answer: 0,
    tags: ['HTTP', '网络'],
    status: 'active',
    createdAt: '2026-06-10T08:00:00.000Z',
  },
  {
    id: '2',
    content: '以下哪些是 JavaScript 的原始类型？',
    type: 'multiple_choice',
    options: ['string', 'array', 'boolean', 'object', 'number'],
    answer: [0, 2, 4],
    tags: ['JavaScript', '基础'],
    status: 'pending',
    createdAt: '2026-06-12T10:30:00.000Z',
  },
  {
    id: '3',
    content: 'TypeScript 是 JavaScript 的超集。',
    type: 'true_false',
    options: null,
    answer: 0,
    tags: ['TypeScript'],
    status: 'active',
    createdAt: '2026-06-13T14:00:00.000Z',
  },
  {
    id: '4',
    content: 'HTML 中，____ 标签用于创建超链接。',
    type: 'fill_blank',
    options: null,
    answer: 'a',
    tags: ['HTML', '前端'],
    status: 'rejected',
    createdAt: '2026-06-14T09:00:00.000Z',
  },
  {
    id: '5',
    content: '解释 RESTful API 的设计原则，并举例说明。',
    type: 'essay',
    options: null,
    answer: 'RESTful API 的核心原则包括：无状态、统一接口、资源导向...',
    tags: ['API', '架构'],
    status: 'pending',
    createdAt: '2026-06-15T11:00:00.000Z',
  },
];

function RouteComponent() {
  const table = useReactTable({
    data: mockQuestions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">题库管理</h1>
          <p className="text-muted-foreground">管理你的题目</p>
        </div>
        <CreateQuestionDialog onSubmit={(data) => console.log('创建题目:', data)} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  暂无题目
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
