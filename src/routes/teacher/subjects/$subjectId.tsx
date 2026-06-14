import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/teacher/subjects/$subjectId')({
  component: SubjectDetailPage,
});

// TODO: 替换为真实数据
const mockSubject = {
  id: 1,
  name: '数据库原理',
  inviteCode: 'DB2024',
  enrollments: [
    {
      id: 1,
      student: { name: '张三', email: 'zhangsan@example.com' },
      joinedAt: new Date('2024-03-01'),
    },
    {
      id: 2,
      student: { name: '李四', email: 'lisi@example.com' },
      joinedAt: new Date('2024-03-05'),
    },
    {
      id: 3,
      student: { name: '王五', email: 'wangwu@example.com' },
      joinedAt: new Date('2024-03-10'),
    },
  ],
};

function SubjectDetailPage() {
  const { subjectId } = Route.useParams();

  function handleCopyCode() {
    navigator.clipboard.writeText(mockSubject.inviteCode);
    toast.success(`邀请码已复制`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teacher/subjects" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{mockSubject.name}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">邀请码</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="cursor-pointer font-mono text-lg"
              onClick={handleCopyCode}
            >
              {mockSubject.inviteCode}
              <Copy className="ml-2 size-4" />
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            将此邀请码分享给学生，学生可通过邀请码加入该科目
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            <Users className="mr-2 inline size-5" />
            已选学生 ({mockSubject.enrollments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockSubject.enrollments.map((enrollment) => (
              <div key={enrollment.id}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{enrollment.student.name}</p>
                    <p className="text-sm text-muted-foreground">{enrollment.student.email}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {enrollment.joinedAt.toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
