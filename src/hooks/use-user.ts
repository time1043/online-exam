import { useQuery } from '@tanstack/react-query';

import { authClient } from '@/lib/auth-client';

export function useUser() {
  const { data: session, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: () => authClient.getSession(),
  });

  return {
    user: session?.data?.user ?? null,
    session: session?.data?.session ?? null,
    isLoading,
  };
}
