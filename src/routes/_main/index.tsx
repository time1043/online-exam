import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpen, FileText, GraduationCap, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_main/')({
  component: RouteComponent,
});

function RoleCard({ icon: Icon, title, description, href, color }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link to={href}>
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className={`mb-2 flex size-12 items-center justify-center rounded-xl ${color}`}>
            <Icon className="size-6 text-white" />
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function RouteComponent() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          在线考试系统
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          教师出卷、学生考试、AI 辅助判分
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/auth/$path" params={{ path: 'sign-in' }}>
            <Button size="lg">开始使用</Button>
          </Link>
          <Link to="/auth/$path" params={{ path: 'sign-up' }}>
            <Button variant="outline" size="lg">注册账号</Button>
          </Link>
        </div>
      </section>

      {/* 角色入口 */}
      <section className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-center text-2xl font-bold">选择你的角色</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <RoleCard
            icon={GraduationCap}
            title="教师"
            description="组卷、发布考试、批改试卷、查看成绩"
            href="/teacher"
            color="bg-blue-500"
          />
          <RoleCard
            icon={Users}
            title="学生"
            description="加入科目、参加考试、查看成绩"
            href="/student"
            color="bg-green-500"
          />
          <RoleCard
            icon={BookOpen}
            title="题库"
            description="浏览公开题目资源"
            href="/teacher/questions"
            color="bg-purple-500"
          />
        </div>
      </section>

      {/* 功能亮点 */}
      <section className="mx-auto max-w-4xl pb-12">
        <h2 className="mb-6 text-center text-2xl font-bold">核心功能</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <FileText className="mr-2 inline size-4" />
                智能组卷
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                手动选题或 AI 对话组卷，支持分数控制、题型筛选、难度分级
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <GraduationCap className="mr-2 inline size-4" />
                AI 判分
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                客观题自动评分，论述题 AI 辅助判分，教师可覆盖修改
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <BookOpen className="mr-2 inline size-4" />
                丰富题库
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                支持单选、多选、判断、填空、论述五种题型，JSON 批量导入
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                <Users className="mr-2 inline size-4" />
                多角色协作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                教师出卷批改、学生考试答题、管理员全局管理
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
