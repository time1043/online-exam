import { viewPaths } from '@better-auth-ui/core';
import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Settings } from '@/components/auth/settings/settings';
import { ensureSession } from '@/lib/auth-guard';

const validSettingsPaths = Object.values(viewPaths.settings);

export const Route = createFileRoute('/settings/$path')({
  async beforeLoad({ params: { path }, location }) {
    if (!validSettingsPaths.includes(path)) {
      throw notFound();
    }

    const session = await ensureSession();

    if (!session) {
      throw redirect({
        to: '/auth/$path',
        params: { path: 'sign-in' },
        search: { redirectTo: location.href },
      });
    }

    return { role: session.user.role };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const { path } = Route.useParams();
  const { role } = Route.useRouteContext();

  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <Link
        to={`/${role}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回
      </Link>
      <Settings path={path} />
    </div>
  );
}
