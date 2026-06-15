import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

import { createFileRoute } from '@tanstack/react-router';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
    cell: (info) => <span className="line-clamp-2 max-w-80">{info.getValue()}</span>,
  }),
  columnHelper.accessor('type', {
    header: '题型',
    filterFn: 'equals',
    cell: (info) => (
      <Badge variant="secondary" className="shrink-0">
        {questionTypeMap[info.getValue()] || info.getValue()}
      </Badge>
    ),
  }),
  columnHelper.accessor('answer', {
    header: '答案',
    enableSorting: false,
    cell: (info) => (
      <span className="text-sm text-muted-foreground">
        {formatAnswer(info.row.original.type, info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor('tags', {
    header: '标签',
    enableSorting: false,
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
    filterFn: 'equals',
    cell: (info) => {
      const s = statusMap[info.getValue()] || statusMap.pending;
      return <Badge variant={s.variant}>{s.label}</Badge>;
    },
  }),
  columnHelper.accessor('createdAt', {
    header: '创建时间',
    filterFn: (
      row,
      columnId,
      filterValue: { from: string | null; to: string | null } | undefined,
    ) => {
      if (!filterValue || (!filterValue.from && !filterValue.to)) return true;
      const date = new Date(row.getValue(columnId));
      // strip time for date-only comparison
      const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      if (filterValue.from) {
        const from = new Date(filterValue.from + 'T00:00:00').getTime();
        if (day < from) return false;
      }
      if (filterValue.to) {
        const to = new Date(filterValue.to + 'T23:59:59').getTime();
        if (day > to) return false;
      }
      return true;
    },
    cell: (info) => (
      <span className="text-sm whitespace-nowrap text-muted-foreground">
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
  {
    id: '6',
    content: 'React 中 useState 返回的第二个值是什么？',
    type: 'fill_blank',
    options: null,
    answer: 'setState',
    tags: ['React', 'Hooks'],
    status: 'active',
    createdAt: '2026-06-14T16:00:00.000Z',
  },
  {
    id: '7',
    content: 'CSS 中，以下哪个属性用于设置文字颜色？',
    type: 'single_choice',
    options: ['font-color', 'text-color', 'color', 'foreground'],
    answer: 2,
    tags: ['CSS', '基础'],
    status: 'active',
    createdAt: '2026-06-13T09:00:00.000Z',
  },
  {
    id: '8',
    content: '以下哪些是 HTTP 请求方法？',
    type: 'multiple_choice',
    options: ['GET', 'SEND', 'POST', 'FETCH', 'DELETE'],
    answer: [0, 2, 4],
    tags: ['HTTP', '网络'],
    status: 'active',
    createdAt: '2026-06-12T14:00:00.000Z',
  },
  {
    id: '9',
    content: '在 JavaScript 中，null == undefined 的结果是 true。',
    type: 'true_false',
    options: null,
    answer: 0,
    tags: ['JavaScript', '基础'],
    status: 'pending',
    createdAt: '2026-06-15T08:00:00.000Z',
  },
  {
    id: '10',
    content: '简述虚拟 DOM 的工作原理及其优势。',
    type: 'essay',
    options: null,
    answer: '虚拟 DOM 是真实 DOM 的轻量级 JavaScript 对象表示...',
    tags: ['React', '原理'],
    status: 'pending',
    createdAt: '2026-06-14T10:00:00.000Z',
  },
  {
    id: '11',
    content: 'Node.js 中，____ 模块用于操作文件系统。',
    type: 'fill_blank',
    options: null,
    answer: 'fs',
    tags: ['Node.js', '基础'],
    status: 'active',
    createdAt: '2026-06-13T11:00:00.000Z',
  },
  {
    id: '12',
    content: 'CSS Flexbox 中，justify-content 的默认值是？',
    type: 'single_choice',
    options: ['center', 'flex-start', 'flex-end', 'space-between'],
    answer: 1,
    tags: ['CSS', '布局'],
    status: 'rejected',
    createdAt: '2026-06-12T08:00:00.000Z',
  },
];

function RouteComponent() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: mockQuestions,
    columns,
    state: { sorting, globalFilter, columnFilters },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: 'auto',
    initialState: { pagination: { pageSize: 10 } },
  });

  const typeFilter = (columnFilters.find((f) => f.id === 'type')?.value as string) ?? 'all';
  const statusFilter = (columnFilters.find((f) => f.id === 'status')?.value as string) ?? 'all';
  const dateRange = (columnFilters.find((f) => f.id === 'createdAt')?.value as
    | { from: string | null; to: string | null }
    | undefined) ?? { from: null, to: null };
  const hasNonDateFilters = globalFilter !== '' || columnFilters.some((f) => f.id !== 'createdAt');
  const hasDateFilter = dateRange.from !== null || dateRange.to !== null;
  const hasFilters = hasNonDateFilters || hasDateFilter;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">题库管理</h1>
          <p className="text-muted-foreground">管理你的题目</p>
        </div>
        <CreateQuestionDialog onSubmit={(data) => console.log('创建题目:', data)} />
      </div>

      {/* 搜索与筛选栏 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索题干、标签..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-56 pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) =>
            table.getColumn('type')?.setFilterValue(v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className="h-10 w-32">
            <SelectValue placeholder="题型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部题型</SelectItem>
            {Object.entries(questionTypeMap).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            table.getColumn('status')?.setFilterValue(v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className="h-10 w-32">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {Object.entries(statusMap).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <input
            type="date"
            value={dateRange.from ?? ''}
            onChange={(e) => {
              const from = e.target.value || null;
              const to = dateRange.to;
              if (!from && !to) {
                table.getColumn('createdAt')?.setFilterValue(undefined);
              } else {
                table.getColumn('createdAt')?.setFilterValue({ from, to });
              }
            }}
            className="h-10 rounded-md border bg-background px-3 text-foreground"
          />
          <span>—</span>
          <input
            type="date"
            value={dateRange.to ?? ''}
            onChange={(e) => {
              const to = e.target.value || null;
              const from = dateRange.from;
              if (!from && !to) {
                table.getColumn('createdAt')?.setFilterValue(undefined);
              } else {
                table.getColumn('createdAt')?.setFilterValue({ from, to });
              }
            }}
            className="h-10 rounded-md border bg-background px-3 text-foreground"
          />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setGlobalFilter('');
              setColumnFilters([]);
            }}
          >
            <X className="mr-1 size-4" />
            清除筛选
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        className="inline-flex items-center gap-1 hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="size-3" />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {hasFilters ? '无匹配结果' : '暂无题目'}
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

      {/* 分页 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {table.getFilteredRowModel().rows.length} 条
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>每页</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(v) => table.setPageSize(Number(v))}
            >
              <SelectTrigger className="h-8 w-17.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>条</span>
          </div>
          <div className="text-sm">
            第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 页
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
