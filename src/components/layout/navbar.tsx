import { Link, useLocation, type FileRouteTypes } from '@tanstack/react-router';
import { LogOut, Menu, GraduationCap, Settings } from 'lucide-react';
import * as React from 'react';

import { ModeToggle } from '@/components/dark/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useUser } from '@/hooks/use-user';
import { cn } from '@/lib/utils';

export interface NavItem {
  label: string;
  href: FileRouteTypes['to'];
}

interface NavbarProps {
  title: string;
  role: 'admin' | 'teacher' | 'student';
  navItems: NavItem[];
}

export function Navbar({ title, role, navItems }: NavbarProps) {
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  const { user, signOut } = useUser();

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 左侧: Logo + 导航 */}
        <div className="flex items-center gap-6">
          <Link to={`/${role}`} className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4" />
            </div>
            <span className="hidden font-semibold sm:inline-block">{title}</span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 右侧: 用户菜单 */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-full">
                <Avatar className="size-8">
                  <AvatarImage src={user?.image ?? undefined} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() ?? role.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/settings/$path" params={{ path: 'account' }}>
                  <Settings className="mr-2 size-4" />
                  <span>设置</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 size-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 移动端汉堡菜单 */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">打开菜单</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{title}</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary',
                      location.pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
