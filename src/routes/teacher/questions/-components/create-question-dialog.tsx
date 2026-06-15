import { useForm } from '@tanstack/react-form';
import { Plus } from 'lucide-react';
import { useState } from 'react';

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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateQuestionDialogProps {
  onSubmit: (data: {
    content: string;
    type: string;
    options: string[] | null;
    answer: string | number | number[] | string[];
    tags: string[];
  }) => void;
}

export function CreateQuestionDialog({ onSubmit }: CreateQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [questionType, setQuestionType] = useState('single_choice');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [singleAnswer, setSingleAnswer] = useState<string>('');
  const [multipleAnswers, setMultipleAnswers] = useState<string[]>([]);
  const [fillBlankAnswers, setFillBlankAnswers] = useState<string[]>(['']);
  const [essayAnswer, setEssayAnswer] = useState('');

  const form = useForm({
    defaultValues: {
      content: '',
      tags: '',
    },
    onSubmit: async ({ value }) => {
      const parsedTags = value.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const filteredOptions = ['single_choice', 'multiple_choice'].includes(questionType)
        ? options.filter(Boolean)
        : null;

      let answer: string | number | number[] | string[];

      switch (questionType) {
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
        content: value.content,
        type: questionType,
        options: filteredOptions,
        answer,
        tags: parsedTags,
      });
      form.reset();
      setOptions(['', '']);
      setSingleAnswer('');
      setMultipleAnswers([]);
      setFillBlankAnswers(['']);
      setEssayAnswer('');
      setOpen(false);
    },
  });

  function addOption() {
    setOptions([...options, '']);
  }

  function updateOption(index: number, value: string) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          创建题目
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>创建题目</DialogTitle>
            <DialogDescription>输入题目内容和选项</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="type">题型</Label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single_choice">单选题</SelectItem>
                  <SelectItem value="multiple_choice">多选题</SelectItem>
                  <SelectItem value="true_false">判断题</SelectItem>
                  <SelectItem value="fill_blank">填空题</SelectItem>
                  <SelectItem value="essay">论述题</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <form.Field
              name="content"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div>
                    <Label htmlFor={field.name}>题干</Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="输入题目内容"
                      className="mt-2"
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-sm text-destructive">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                );
              }}
            />

            {['single_choice', 'multiple_choice'].includes(questionType) && (
              <div className="space-y-2">
                <Label>选项</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`选项 ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeOption(index)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  添加选项
                </Button>
              </div>
            )}

            {/* 答案输入区域 */}
            {questionType === 'single_choice' && (
              <div className="space-y-2">
                <Label>正确答案</Label>
                <RadioGroup value={singleAnswer} onValueChange={setSingleAnswer} className="mt-2">
                  {options.filter(Boolean).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={String(index)} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {questionType === 'multiple_choice' && (
              <div className="space-y-2">
                <Label>正确答案（可多选）</Label>
                <div className="mt-2 space-y-2">
                  {options.filter(Boolean).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`option-${index}`}
                        checked={multipleAnswers.includes(String(index))}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMultipleAnswers([...multipleAnswers, String(index)]);
                          } else {
                            setMultipleAnswers(multipleAnswers.filter((a) => a !== String(index)));
                          }
                        }}
                      />
                      <Label htmlFor={`option-${index}`} className="font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {questionType === 'true_false' && (
              <div className="space-y-2">
                <Label>正确答案</Label>
                <RadioGroup value={singleAnswer} onValueChange={setSingleAnswer} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="true" />
                    <Label htmlFor="true" className="font-normal">
                      正确
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="false" />
                    <Label htmlFor="false" className="font-normal">
                      错误
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {questionType === 'fill_blank' && (
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

            {questionType === 'essay' && (
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
            )}

            <form.Field
              name="tags"
              children={(field) => (
                <div>
                  <Label htmlFor={field.name}>标签（用逗号分隔）</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="例如：数据库, SQL, 基础"
                    className="mt-2"
                  />
                </div>
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setOptions(['', '']);
                setOpen(false);
              }}
            >
              取消
            </Button>
            <Button type="submit">创建</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
