import { Link } from '@tanstack/react-router';
import { BookOpen, FileText } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubjectCardProps {
  id: number;
  name: string;
  teacherName: string;
  examCount: number;
}

export function SubjectCard({ id, name, teacherName, examCount }: SubjectCardProps) {
  return (
    <Link to="/student/subjects/$subjectId" params={{ subjectId: String(id) }}>
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" />
            {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">教师：{teacherName}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="size-3" />
            {examCount} 场考试
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
