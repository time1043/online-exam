import { useState } from 'react';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { chatWithAI } from '@/server/ai';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

interface ExamChatProps {
  examId: number;
  onModified?: () => void;
}

export function ExamChat({ examId, onModified }: ExamChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await chatWithAI({
        data: { examId, message: userMsg },
      });
      setMessages((prev) => [...prev, { role: 'ai', text: result.reply }]);
      if (result.modified) onModified?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'AI 回复失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">AI 组卷助手</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden p-0">
        <div className="flex-1 space-y-3 overflow-y-auto px-4 pt-2">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">
              告诉我你想要什么样的试卷，我来帮你组卷。
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                m.role === 'user' ? 'ml-8 bg-primary text-primary-foreground' : 'mr-8 bg-muted'
              }`}
            >
              {m.role === 'ai' ? (
                <Streamdown className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  {m.text}
                </Streamdown>
              ) : (
                m.text
              )}
            </div>
          ))}
          {loading && (
            <div className="mr-8 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
              思考中...
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t px-4 pt-3 pb-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="例如：帮我选 5 道 React 单选题"
            className="min-h-10 resize-none"
            rows={2}
            disabled={loading}
          />
          <Button
            size="sm"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="shrink-0"
          >
            发送
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
