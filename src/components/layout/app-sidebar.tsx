import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const navItems = [
  { label: '仪表盘', href: '/admin', icon: LayoutDashboard },
  { label: '用户管理', href: '/admin/users', icon: Users },
  { label: '考试管理', href: '/admin/exams', icon: FileText },
  { label: '题库管理', href: '/admin/questions', icon: BookOpen },
  { label: '设置', href: '/admin/settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">在线考试系统</span>
                  <span className="truncate text-xs text-muted-foreground">管理后台</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>导航</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    tooltip={item.label}
                  >
                    <Link to={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">管理员</span>
                    <span className="truncate text-xs text-muted-foreground">
                      admin@example.com
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-dropdown-menu-trigger-width]">
                <DropdownMenuItem>
                  <LogOut className="mr-2 size-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
