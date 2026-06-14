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

interface CreateSubjectDialogProps {
  onSubmit: (name: string) => void;
}

export function CreateSubjectDialog({ onSubmit }: CreateSubjectDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      onSubmit(value.name.trim());
      form.reset();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 size-4" />
          创建科目
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
            <DialogTitle>创建科目</DialogTitle>
            <DialogDescription>输入科目名称，系统将自动生成邀请码</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => (!value.trim() ? '科目名称不能为空' : undefined),
              }}
              children={(field) => (
                <>
                  <Label htmlFor={field.name}>科目名称</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="例如：数据库原理"
                    className="mt-2"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </>
              )}
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
            <Button type="submit">创建</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
