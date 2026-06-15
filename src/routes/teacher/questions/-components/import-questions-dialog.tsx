import { AlertCircle, CheckCircle, FileJson, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { QuestionRow } from './question-table';

import { questionTypeMap } from './question-helpers';

interface ImportQuestionsDialogProps {
  onSubmit: (
    questions: Omit<QuestionRow, 'id' | 'status' | 'isReported' | 'creatorName' | 'createdAt'>[],
  ) => void;
  isLoading?: boolean;
}

export function ImportQuestionsDialog({ onSubmit, isLoading }: ImportQuestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<
    Omit<QuestionRow, 'id' | 'status' | 'isReported' | 'creatorName' | 'createdAt'>[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setQuestions([]);
    setError(null);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setQuestions([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          setError('JSON 文件必须是一个数组');
          return;
        }
        if (json.length === 0) {
          setError('JSON 数组不能为空');
          return;
        }
        if (json.length > 200) {
          setError('单次最多导入 200 道题目');
          return;
        }

        const validTypes = [
          'single_choice',
          'multiple_choice',
          'true_false',
          'fill_blank',
          'essay',
        ];
        const parsed: Omit<QuestionRow, 'id' | 'status' | 'isReported' | 'creatorName' | 'createdAt'>[] = [];

        for (let i = 0; i < json.length; i++) {
          const item = json[i];
          const idx = i + 1;

          if (!item.content || typeof item.content !== 'string') {
            setError(`第 ${idx} 题：题干 (content) 必填且为字符串`);
            return;
          }
          if (!item.type || !validTypes.includes(item.type)) {
            setError(`第 ${idx} 题：题型 (type) 必须是 ${validTypes.join(', ')} 之一`);
            return;
          }
          if (['single_choice', 'multiple_choice'].includes(item.type)) {
            if (!Array.isArray(item.options) || item.options.length < 2) {
              setError(`第 ${idx} 题：选择题至少需要 2 个选项`);
              return;
            }
          }
          if (item.answer === undefined || item.answer === null) {
            setError(`第 ${idx} 题：答案 (answer) 必填`);
            return;
          }

          parsed.push({
            content: item.content,
            type: item.type,
            options: item.options ?? null,
            answer: item.answer,
            tags: Array.isArray(item.tags) ? item.tags : [],
          });
        }

        setQuestions(parsed);
      } catch {
        setError('JSON 解析失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  }

  function handleSubmit() {
    onSubmit(questions);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetState();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 size-4" />
          批量导入
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>批量导入题目</DialogTitle>
          <DialogDescription>上传 JSON 文件，格式为题目数组</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full">
            <FileJson className="mr-2 size-4" />
            {fileName ?? '选择 JSON 文件'}
          </Button>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {questions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="size-4 text-green-500" />
                <span>解析成功，共 {questions.length} 道题目</span>
              </div>
              <div className="max-h-64 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>题干</TableHead>
                      <TableHead className="w-20">题型</TableHead>
                      <TableHead>标签</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.slice(0, 10).map((q, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="max-w-60 truncate">{q.content}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{questionTypeMap[q.type] ?? q.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {q.tags.length > 0
                            ? q.tags.map((t) => (
                                <Badge key={t} variant="outline" className="mr-1 text-xs">
                                  {t}
                                </Badge>
                              ))
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                    {questions.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          还有 {questions.length - 10} 道题目...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={questions.length === 0 || isLoading}>
            {isLoading ? '导入中...' : `导入 ${questions.length} 道题目`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
