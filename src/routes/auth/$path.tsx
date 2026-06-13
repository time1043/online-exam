import { viewPaths } from '@better-auth-ui/core';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { GraduationCap } from 'lucide-react';

import { Auth } from '@/components/auth/auth';
import { magicLinkPlugin } from '@/lib/auth/magic-link-plugin';

const validAuthPathSegments = new Set([
  ...Object.values(viewPaths.auth),
  magicLinkPlugin().viewPaths.auth.magicLink,
]);

export const Route = createFileRoute('/auth/$path')({
  beforeLoad({ params: { path } }) {
    if (!validAuthPathSegments.has(path)) {
      throw redirect({ to: '/' });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const { path } = Route.useParams();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-4 md:p-6">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="size-5" />
        </div>
        <span className="text-xl font-semibold">在线考试系统</span>
      </Link>
      <Auth path={path} />
    </div>
  );
}
