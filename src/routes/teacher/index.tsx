import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  BookOpen,
  FileText,
  Users,
  GraduationCap,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { getSubjects } from '@/server/subject';

export const Route = createFileRoute('/teacher/')({
  component: RouteComponent,
});

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className={`flex size-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="size-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RouteComponent() {
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => getSubjects(),
  });

  const totalStudents = subjects.reduce((sum, s) => sum + ((s as any)._count?.enrollments ?? 0), 0);
  const totalExams = subjects.reduce((sum, s) => sum + ((s as any)._count?.exams ?? 0), 0);

  if (isLoading) {
    return <div className="text-center text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">教师仪表盘</h1>
        <p className="text-muted-foreground">欢迎回来</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="我的科目"
          value={subjects.length}
          color="bg-blue-500"
        />
        <StatCard
          icon={FileText}
          label="试卷总数"
          value={totalExams}
          color="bg-green-500"
        />
        <StatCard
          icon={Users}
          label="学生总数"
          value={totalStudents}
          color="bg-purple-500"
        />
        <StatCard
          icon={GraduationCap}
          label="角色"
          value="教师"
          color="bg-orange-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 最近科目 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近科目</CardTitle>
          </CardHeader>
          <CardContent>
            {subjects.length === 0 ? (
              <p className="py-4 text-center text-muted-foreground">暂无科目</p>
            ) : (
              <div className="space-y-3">
                {subjects.slice(0, 5).map((s) => (
                  <Link
                    key={s.id}
                    to="/teacher/subjects/$subjectId"
                    params={{ subjectId: String(s.id) }}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        邀请码：{s.inviteCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{((s as any)._count?.enrollments ?? 0)} 学生</span>
                      <span>·</span>
                      <span>{((s as any)._count?.exams ?? 0)} 试卷</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to="/teacher/subjects"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                <BookOpen className="size-5" />
              </div>
              <div>
                <p className="font-medium">管理科目</p>
                <p className="text-xs text-muted-foreground">创建和管理你的科目</p>
              </div>
            </Link>
            <Link
              to="/teacher/questions"
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="font-medium">题库管理</p>
                <p className="text-xs text-muted-foreground">导入和管理题目</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
