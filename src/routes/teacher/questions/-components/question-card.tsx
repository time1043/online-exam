import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuestionCardProps {
  id: string;
  content: string;
  type: string;
  tags: string[];
}

const questionTypeMap: Record<string, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  essay: '论述题',
};

export function QuestionCard({ content, type, tags }: QuestionCardProps) {
  return (
    <Card className="transition-colors hover:bg-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="line-clamp-1 text-sm font-medium">{content}</span>
          <Badge variant="secondary" className="ml-2 shrink-0">
            {questionTypeMap[type] || type}
          </Badge>
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
