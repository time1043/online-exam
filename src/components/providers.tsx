import type { ReactNode } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';
import { ThemeProvider, useTheme } from 'next-themes';

import { authClient } from '@/lib/auth-client';
import { themePlugin } from '@/lib/auth/theme-plugin';

import { AuthProvider } from './auth/auth-provider';
import { Toaster } from './ui/sonner';
import { TooltipProvider } from './ui/tooltip';

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider
        authClient={authClient}
        redirectTo="/settings/account"
        navigate={navigate}
        plugins={[themePlugin({ useTheme })]}
        Link={Link}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
