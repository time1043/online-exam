import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpen, Copy, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/teacher/subjects/')({
  component: SubjectListPage,
});

// TODO: 替换为真实数据
const mockSubjects = [
  {
    id: 1,
    name: '数据库原理',
    inviteCode: 'DB2024',
    _count: { enrollments: 12, exams: 3 },
  },
  {
    id: 2,
    name: '数据结构',
    inviteCode: 'DS101',
    _count: { enrollments: 8, exams: 2 },
  },
  {
    id: 3,
    name: '操作系统',
    inviteCode: 'OS301',
    _count: { enrollments: 15, exams: 4 },
  },
];

function SubjectListPage() {
  function handleCopyCode(e: React.MouseEvent, code: string) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    navigator.clipboard.writeText(code);
    toast.success(`邀请码已复制 ${code}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">科目管理</h1>
          <p className="text-muted-foreground">管理你创建的科目和邀请码</p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          创建科目
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockSubjects.map((subject) => (
          <Link
            key={subject.id}
            to="/teacher/subjects/$subjectId"
            params={{ subjectId: String(subject.id) }}
          >
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  {subject.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">邀请码</span>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer font-mono"
                    onClick={(e) => handleCopyCode(e, subject.inviteCode)}
                  >
                    {subject.inviteCode}
                    <Copy className="ml-1 size-3" />
                  </Badge>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {subject._count.enrollments} 名学生
                  </span>
                  <span>{subject._count.exams} 场考试</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
