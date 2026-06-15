import type { ColumnFiltersState, SortingState } from '@tanstack/react-table';

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Trash2, User, X } from 'lucide-react';
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

import { formatAnswer, questionTypeMap, statusMap } from './question-helpers';

export type QuestionRow = {
  id: string;
  content: string;
  type: string;
  options: string[] | null;
  answer: string | number | number[];
  tags: string[];
  status: string;
  creatorName: string;
  createdAt: string;
};

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
  columnHelper.accessor('creatorName', {
    header: '上传人',
    filterFn: 'includesString',
    cell: (info) => <span className="text-sm whitespace-nowrap">{info.getValue()}</span>,
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

interface QuestionTableProps {
  data: QuestionRow[];
}

export function QuestionTable({ data }: QuestionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
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
  const creatorFilter = (columnFilters.find((f) => f.id === 'creatorName')?.value as string) ?? '';
  const dateRange = (columnFilters.find((f) => f.id === 'createdAt')?.value as
    | { from: string | null; to: string | null }
    | undefined) ?? { from: null, to: null };
  const hasNonDateFilters = globalFilter !== '' || columnFilters.some((f) => f.id !== 'createdAt');
  const hasDateFilter = dateRange.from !== null || dateRange.to !== null;
  const hasFilters = hasNonDateFilters || hasDateFilter;

  return (
    <div className="space-y-4">
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
        <div className="relative">
          <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="上传人"
            value={creatorFilter}
            onChange={(e) =>
              table.getColumn('creatorName')?.setFilterValue(e.target.value || undefined)
            }
            className="w-44 pl-9"
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
