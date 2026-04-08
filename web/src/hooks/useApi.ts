'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseQueryOptions<T> {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

export function useApiQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: UseQueryOptions<T>,
) {
  const enabled = options?.enabled ?? true;
  const refetchOnMount = options?.refetchOnMount ?? true;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData, key]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch };
}

// This hook is deprecated - use direct apiFetch calls instead
// Kept for backwards compatibility but mutate does not make API calls
export function useApiMutation<T, P = void>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = useCallback(
    async (_payload: P): Promise<T | null> => {
      setIsLoading(false);
      setError(new Error('useApiMutation is deprecated - use apiFetch directly'));
      return null;
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { mutate, isLoading, error, data, reset };
}

export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
