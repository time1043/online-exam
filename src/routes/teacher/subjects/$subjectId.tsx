import { Outlet, createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/teacher/subjects/$subjectId')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teacher/subjects" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">科目详情</h1>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
