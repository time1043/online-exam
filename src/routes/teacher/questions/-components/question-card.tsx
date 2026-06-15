import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { formatAnswer, getOptionLabel, questionTypeMap, statusMap } from './question-helpers';

interface QuestionCardProps {
  id: string;
  content: string;
  type: string;
  options: string[] | null;
  answer: string | number | number[];
  tags: string[];
  status: string;
}

export function QuestionCard({ content, type, options, answer, tags, status }: QuestionCardProps) {
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
      <CardContent className="space-y-3">
        {/* 选项显示 */}
        {options && options.length > 0 && (
          <div className="space-y-1">
            {options.map((option, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {getOptionLabel(index)}. {option}
              </div>
            ))}
          </div>
        )}

        {/* 答案显示 */}
        <div className="text-sm">
          <span className="font-medium">答案：</span>
          <span className="text-primary">{formatAnswer(type, answer)}</span>
        </div>

        {/* 标签 */}
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
