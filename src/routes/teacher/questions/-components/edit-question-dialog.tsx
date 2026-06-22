import { useEffect, useState } from 'react';

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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

import type { QuestionRow } from './question-table';

import { questionTypeMap } from './question-helpers';

interface EditQuestionDialogProps {
  question: QuestionRow | null;
  onClose: () => void;
  onSubmit: (data: {
    id: string;
    content: string;
    options: string[] | null;
    answer: string | number | number[] | string[];
    gradingCriteria?: string;
    tags: string[];
  }) => void;
}

export function EditQuestionDialog({ question, onClose, onSubmit }: EditQuestionDialogProps) {
  const [content, setContent] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [singleAnswer, setSingleAnswer] = useState('');
  const [multipleAnswers, setMultipleAnswers] = useState<string[]>([]);
  const [fillBlankAnswers, setFillBlankAnswers] = useState<string[]>([]);
  const [essayAnswer, setEssayAnswer] = useState('');
  const [gradingCriteria, setGradingCriteria] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (!question) return;
    setContent(question.content);
    setOptions(question.options ? [...question.options] : ['', '']);
    setSingleAnswer(
      ['single_choice', 'true_false'].includes(question.type) ? String(question.answer) : '',
    );
    setMultipleAnswers(
      question.type === 'multiple_choice' ? (question.answer as number[]).map(String) : [],
    );
    setFillBlankAnswers(
      question.type === 'fill_blank'
        ? Array.isArray(question.answer)
          ? [...(question.answer as string[])]
          : [String(question.answer)]
        : [''],
    );
    setEssayAnswer(question.type === 'essay' ? String(question.answer) : '');
    setGradingCriteria(question.gradingCriteria ?? '');
    setTags(question.tags.join(', '));
  }, [question]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question) return;

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const filteredOptions = ['single_choice', 'multiple_choice'].includes(question.type)
      ? options.filter(Boolean)
      : null;

    let answer: string | number | number[] | string[];
    switch (question.type) {
      case 'single_choice':
        answer = Number(singleAnswer) || 0;
        break;
      case 'multiple_choice':
        answer = multipleAnswers.map(Number).sort();
        break;
      case 'true_false':
        answer = Number(singleAnswer) || 0;
        break;
      case 'fill_blank':
        answer = fillBlankAnswers.filter(Boolean);
        break;
      case 'essay':
        answer = essayAnswer;
        break;
      default:
        answer = 0;
    }

    onSubmit({
      id: question.id,
      content,
      options: filteredOptions,
      answer,
      gradingCriteria,
      tags: parsedTags,
    });
  }

  return (
    <Dialog
      open={question !== null}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        {question && (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>编辑题目</DialogTitle>
              <DialogDescription>修改题目内容和答案</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>题型</Label>
                <div className="mt-2">
                  <Badge variant="secondary">
                    {questionTypeMap[question.type] ?? question.type}
                  </Badge>
                </div>
              </div>

              <div>
                <Label htmlFor="content">题干</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="输入题目内容"
                  className="mt-2"
                />
              </div>

              {['single_choice', 'multiple_choice'].includes(question.type) && (
                <div className="space-y-2">
                  <Label>选项</Label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                        placeholder={`选项 ${index + 1}`}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setOptions(options.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions([...options, ''])}
                  >
                    添加选项
                  </Button>
                </div>
              )}

              {question.type === 'single_choice' && (
                <div className="space-y-2">
                  <Label>正确答案</Label>
                  <RadioGroup value={singleAnswer} onValueChange={setSingleAnswer} className="mt-2">
                    {options.filter(Boolean).map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(index)} id={`edit-option-${index}`} />
                        <Label htmlFor={`edit-option-${index}`} className="font-normal">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <Label>正确答案（可多选）</Label>
                  <div className="mt-2 space-y-2">
                    {options.filter(Boolean).map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-option-${index}`}
                          checked={multipleAnswers.includes(String(index))}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setMultipleAnswers([...multipleAnswers, String(index)]);
                            } else {
                              setMultipleAnswers(
                                multipleAnswers.filter((a) => a !== String(index)),
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`edit-option-${index}`} className="font-normal">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.type === 'true_false' && (
                <div className="space-y-2">
                  <Label>正确答案</Label>
                  <RadioGroup value={singleAnswer} onValueChange={setSingleAnswer} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="edit-true" />
                      <Label htmlFor="edit-true" className="font-normal">
                        正确
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="edit-false" />
                      <Label htmlFor="edit-false" className="font-normal">
                        错误
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {question.type === 'fill_blank' && (
                <div className="space-y-2">
                  <Label>标准答案（每个空一个答案）</Label>
                  {fillBlankAnswers.map((answer, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={answer}
                        onChange={(e) => {
                          const newAnswers = [...fillBlankAnswers];
                          newAnswers[index] = e.target.value;
                          setFillBlankAnswers(newAnswers);
                        }}
                        placeholder={`第 ${index + 1} 个空的答案`}
                      />
                      {fillBlankAnswers.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            setFillBlankAnswers(fillBlankAnswers.filter((_, i) => i !== index))
                          }
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFillBlankAnswers([...fillBlankAnswers, ''])}
                  >
                    添加空
                  </Button>
                </div>
              )}

              {question.type === 'essay' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="essayAnswer">参考答案</Label>
                    <Textarea
                      id="essayAnswer"
                      value={essayAnswer}
                      onChange={(e) => setEssayAnswer(e.target.value)}
                      placeholder="输入参考答案"
                      className="mt-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradingCriteria">评分标准</Label>
                    <Textarea
                      id="gradingCriteria"
                      value={gradingCriteria}
                      onChange={(e) => setGradingCriteria(e.target.value)}
                      placeholder="输入评分标准，供阅卷参考"
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="tags">标签（用逗号分隔）</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="例如：数据库, SQL, 基础"
                  className="mt-2"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                取消
              </Button>
              <Button type="submit">保存</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
