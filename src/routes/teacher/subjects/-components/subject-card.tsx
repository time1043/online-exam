import { Link } from '@tanstack/react-router';
import { BookOpen, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubjectCardProps {
  id: number;
  name: string;
  inviteCode: string;
  enrollmentCount: number;
  examCount: number;
}

export function SubjectCard({
  id,
  name,
  inviteCode,
  enrollmentCount,
  examCount,
}: SubjectCardProps) {
  function handleCopyCode(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    navigator.clipboard.writeText(inviteCode);
    toast.success(`邀请码已复制 ${inviteCode}`);
  }

  return (
    <Link to="/teacher/subjects/$subjectId" params={{ subjectId: String(id) }}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">邀请码</span>
            <Badge
              variant="secondary"
              className="cursor-pointer font-mono"
              onClick={handleCopyCode}
            >
              {inviteCode}
              <Copy className="ml-1 size-3" />
            </Badge>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {enrollmentCount} 名学生
            </span>
            <span>{examCount} 场考试</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
