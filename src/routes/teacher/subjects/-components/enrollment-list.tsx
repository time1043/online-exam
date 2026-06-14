import { Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Enrollment {
  id: number;
  student: {
    name: string;
    email: string;
  };
  joinedAt: Date;
}

interface EnrollmentListProps {
  enrollments: Enrollment[];
}

export function EnrollmentList({ enrollments }: EnrollmentListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          <Users className="mr-2 inline size-5" />
          已选学生 ({enrollments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {enrollments.map((enrollment) => (
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
  );
}
