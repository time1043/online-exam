import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

import { authClient } from '@/lib/auth-client';

export function useUser() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: () => authClient.getSession(),
  });

  async function signOut() {
    await authClient.signOut();
    queryClient.setQueryData(['session'], null);
    toast.success('退出登录');
    navigate({ to: '/auth/$path', params: { path: 'sign-in' } });
  }

  return {
    user: session?.data?.user ?? null,
    session: session?.data?.session ?? null,
    isLoading,
    signOut,
  };
}
