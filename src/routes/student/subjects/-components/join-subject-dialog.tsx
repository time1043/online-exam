import { useForm } from '@tanstack/react-form';
import { Plus } from 'lucide-react';
import { useState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JoinSubjectDialogProps {
  onSubmit: (inviteCode: string) => void;
}

export function JoinSubjectDialog({ onSubmit }: JoinSubjectDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      inviteCode: '',
    },
    onSubmit: async ({ value }) => {
      onSubmit(value.inviteCode.trim().toUpperCase());
      form.reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          加入科目
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>加入科目</DialogTitle>
            <DialogDescription>请输入教师提供的 6 位邀请码</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <form.Field
              name="inviteCode"
              validators={{
                onChange: ({ value }) => {
                  if (!value.trim()) return '邀请码不能为空';
                  if (value.trim().length !== 6) return '邀请码为 6 位';
                  return undefined;
                },
              }}
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <>
                    <Label htmlFor={field.name}>邀请码</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      placeholder="例如：DB2024"
                      className="mt-2 font-mono"
                      maxLength={6}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && field.state.meta.errors.length > 0 && (
                      <p className="mt-1 text-sm text-destructive">{field.state.meta.errors[0]}</p>
                    )}
                  </>
                );
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setOpen(false);
              }}
            >
              取消
            </Button>
            <Button type="submit">加入</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
