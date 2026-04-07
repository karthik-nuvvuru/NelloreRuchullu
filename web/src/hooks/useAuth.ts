'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { saveAuth, clearAuth } from '@/lib/auth';
import type { User } from '@/types';

export function useAuth() {
  const { user, setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      saveAuth(data.token, data.user);
      setUser(data.user);
      setSuccess('Login successful!');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async (phone: string): Promise<void> => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await authApi.requestOtp(phone);
      setSuccess('OTP sent to your phone.');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string): Promise<void> => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(phone, otp);
      saveAuth(data.token, data.user);
      setUser(data.user);
      setSuccess('Login successful!');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<boolean> => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = await authApi.register({ name, email, phone, password });
      saveAuth(data.token, data.user);
      setUser(data.user);
      setSuccess('Registration successful!');
      router.push('/');
      router.refresh();
      return true;
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    clearAuth();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return {
    user,
    error,
    success,
    login,
    loginWithOtp,
    verifyOtp,
    register,
    logout,
  };
}

export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  if (typeof window !== 'undefined' && !isAuthenticated) {
    router.push(`${redirectTo}?returnUrl=${encodeURIComponent(window.location.pathname)}`);
  }

  return { user, isAuthenticated };
}

export function useRequireAdmin() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  if (typeof window !== 'undefined') {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== 'admin') {
      router.push('/');
    }
  }

  return { user, isAuthenticated };
}
