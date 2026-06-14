import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuestionCardProps {
  id: string;
  content: string;
  type: string;
  tags: string[];
  status: string;
}

const questionTypeMap: Record<string, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  essay: '论述题',
};

const statusMap: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: '待审核', variant: 'secondary' },
  active: { label: '已通过', variant: 'default' },
  rejected: { label: '已拒绝', variant: 'destructive' },
};

export function QuestionCard({ content, type, tags, status }: QuestionCardProps) {
  const statusInfo = statusMap[status] || statusMap.pending;

  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="line-clamp-1 text-sm font-medium">{content}</span>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <Badge variant="secondary">{questionTypeMap[type] || type}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
