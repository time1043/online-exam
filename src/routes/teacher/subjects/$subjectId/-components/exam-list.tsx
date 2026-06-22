import { FileText } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { ExamRow } from './mock-data';

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: '草稿', variant: 'secondary' },
  published: { label: '已发布', variant: 'default' },
};

interface ExamListProps {
  exams: ExamRow[];
  actions?: React.ReactNode;
}

export function ExamList({ exams, actions }: ExamListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          <FileText className="mr-2 inline size-5" />
          试卷管理 ({exams.length})
        </CardTitle>
        {actions}
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">暂无试卷，点击上方按钮创建</div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>试卷名称</TableHead>
                  <TableHead className="w-20">状态</TableHead>
                  <TableHead className="w-20 text-right">题数</TableHead>
                  <TableHead className="w-20 text-right">总分</TableHead>
                  <TableHead className="w-24 text-right">时限</TableHead>
                  <TableHead className="w-28">创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => {
                  const s = statusMap[exam.status] ?? statusMap.draft;
                  return (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.title}</TableCell>
                      <TableCell>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{exam.questionCount}</TableCell>
                      <TableCell className="text-right">{exam.totalScore}</TableCell>
                      <TableCell className="text-right">
                        {exam.timeLimit ? `${exam.timeLimit} 分钟` : '—'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(exam.createdAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
