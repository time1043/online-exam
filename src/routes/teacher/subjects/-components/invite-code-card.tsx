import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InviteCodeCardProps {
  inviteCode: string;
}

export function InviteCodeCard({ inviteCode }: InviteCodeCardProps) {
  function handleCopyCode() {
    navigator.clipboard.writeText(inviteCode);
    toast.success('邀请码已复制');
  }

  return (
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
            {inviteCode}
            <Copy className="ml-2 size-4" />
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          将此邀请码分享给学生，学生可通过邀请码加入该科目
        </p>
      </CardContent>
    </Card>
  );
}
