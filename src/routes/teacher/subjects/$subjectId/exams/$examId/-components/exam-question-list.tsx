import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { questionTypeMap } from '@/routes/teacher/questions/-components/question-helpers';

import type { ExamQuestionItem } from './mock-data';

interface ExamQuestionListProps {
  questions: ExamQuestionItem[];
  onScoreChange: (order: number, score: number) => void;
  onMove: (fromOrder: number, direction: 'up' | 'down') => void;
  onRemove: (order: number) => void;
}

export function ExamQuestionList({
  questions,
  onScoreChange,
  onMove,
  onRemove,
}: ExamQuestionListProps) {
  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          共 {questions.length} 题，总分 {totalScore}
        </span>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">排序</TableHead>
              <TableHead className="w-10 text-center">序号</TableHead>
              <TableHead>题干</TableHead>
              <TableHead className="w-20">题型</TableHead>
              <TableHead className="w-24 text-center">分值</TableHead>
              <TableHead className="w-16 text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  暂未添加题目
                </TableCell>
              </TableRow>
            ) : (
              questions.map((item, index) => (
                <TableRow key={item.question.id}>
                  <TableCell>
                    <div className="flex items-center justify-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0}
                        onClick={() => onMove(item.order, 'up')}
                      >
                        <ChevronUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === questions.length - 1}
                        onClick={() => onMove(item.order, 'down')}
                      >
                        <ChevronDown className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">{item.order}</TableCell>
                  <TableCell>
                    <span className="line-clamp-2 max-w-md">{item.question.content}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="shrink-0">
                      {questionTypeMap[item.question.type] ?? item.question.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={item.score}
                      onChange={(e) => onScoreChange(item.order, Number(e.target.value) || 0)}
                      className="h-8 text-center"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon-sm" onClick={() => onRemove(item.order)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
