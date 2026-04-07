'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { isAuthenticated as checkAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  fallbackPath = '/auth/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const isLoggedIn = checkAuth();

    if (!isLoggedIn) {
      router.push(`${fallbackPath}?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (requireAdmin && user?.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [ isAuthenticated, user, requireAdmin, fallbackPath, router]);

  const isLoggedIn = typeof window !== 'undefined' ? checkAuth() : false;
  const isAdminOk = requireAdmin ? user?.role === 'admin' : true;

  if (!isLoggedIn || !isAdminOk) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
