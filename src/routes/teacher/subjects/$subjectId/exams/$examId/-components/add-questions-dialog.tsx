import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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

interface QuestionOption {
  id: string;
  content: string;
  type: string;
  tags: string[];
}

interface AddQuestionsDialogProps {
  availableQuestions: QuestionOption[];
  onAdd: (questionIds: string[]) => void;
}

export function AddQuestionsDialog({ availableQuestions, onAdd }: AddQuestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filtered = availableQuestions.filter(
    (q) => q.content.includes(search) || q.tags.some((t) => t.includes(search)),
  );

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSubmit() {
    if (selected.length === 0) return;
    onAdd(selected);
    setSelected([]);
    setSearch('');
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 size-4" />
          添加题目
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>从题库选题</DialogTitle>
          <DialogDescription>选择要添加到试卷的题目</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            placeholder="搜索题干、标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="max-h-80 overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>题干</TableHead>
                  <TableHead className="w-20">题型</TableHead>
                  <TableHead>标签</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      无匹配题目
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(q.id)}
                          onCheckedChange={() => toggle(q.id)}
                        />
                      </TableCell>
                      <TableCell className="max-w-60 truncate">{q.content}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{questionTypeMap[q.type] ?? q.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {q.tags.map((t) => (
                          <Badge key={t} variant="outline" className="mr-1 text-xs">
                            {t}
                          </Badge>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {selected.length > 0 && (
            <p className="text-sm text-muted-foreground">已选 {selected.length} 题</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={selected.length === 0}>
            添加 {selected.length} 题
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
