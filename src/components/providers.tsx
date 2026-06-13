import type { ReactNode } from 'react';

import { Link, useNavigate } from '@tanstack/react-router';

import { authClient } from '@/lib/auth-client';
import { themePlugin } from '@/lib/auth/theme-plugin';

import { AuthProvider } from './auth/auth-provider';
import { ThemeProvider, useTheme } from './dark/theme-provider';
import { Toaster } from './ui/sonner';
import { TooltipProvider } from './ui/tooltip';

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <ThemeProvider defaultTheme="system">
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
