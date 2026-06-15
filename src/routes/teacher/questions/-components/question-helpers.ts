export const questionTypeMap: Record<string, string> = {
  single_choice: '单选题',
  multiple_choice: '多选题',
  true_false: '判断题',
  fill_blank: '填空题',
  essay: '论述题',
};

export const statusMap: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  private: { label: '私有', variant: 'outline' },
  pending: { label: '待审核', variant: 'secondary' },
  public: { label: '已公开', variant: 'default' },
};

export function formatAnswer(type: string, answer: string | number | number[] | string[]): string {
  switch (type) {
    case 'single_choice':
      return getOptionLabel(Number(answer));
    case 'multiple_choice':
      return (answer as number[]).map((i) => getOptionLabel(i)).join('、');
    case 'true_false':
      return Number(answer) === 0 ? '正确' : '错误';
    case 'fill_blank':
      return Array.isArray(answer) ? (answer as string[]).join('、') : String(answer);
    case 'essay':
      return String(answer).length > 50 ? String(answer).slice(0, 50) + '...' : String(answer);
    default:
      return String(answer);
  }
}

export function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}
