import type { User } from 'better-auth';

import { ensureSession as ensureSessionClient } from '@better-auth-ui/react';
import { ensureSession as ensureSessionServer } from '@better-auth-ui/react/server';
import { createIsomorphicFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import type { Role } from '@/generated/prisma/enums';

import { auth } from './auth';
import { authClient } from './auth-client';
import { makeQueryClient } from './query-client';

type AuthUser = User & { role: Role };
type AuthSession = { user: AuthUser; session: Record<string, unknown> };

export async function ensureSession(): Promise<AuthSession | null> {
  const queryClient = makeQueryClient();

  const fn = createIsomorphicFn()
    .server(() => ensureSessionServer(queryClient, auth as any, { headers: getRequestHeaders() }))
    .client(() => ensureSessionClient(queryClient, authClient));

  return fn();
}
