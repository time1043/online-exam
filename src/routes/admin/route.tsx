import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { ModeToggle } from '#/components/dark/mode-toggle';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) throw redirect({ to: '/auth/$path', params: { path: 'sign-in' } });
    if (session.data.user.role !== 'admin') throw redirect({ to: '/' });
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="my-2 h-8" />
          <ModeToggle />
        </header>
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
