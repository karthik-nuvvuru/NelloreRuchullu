export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const API_BASE_URL = API_BASE;

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

export interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number;
  retries?: number;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { params, headers: customHeaders, timeout = DEFAULT_TIMEOUT, retries = MAX_RETRIES, ...restOptions } = options;

  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }

    try {
      const response = await fetchWithTimeout(url.toString(), {
        ...restOptions,
        headers,
      }, timeout);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const errorMessage =
          errorBody?.message || `API request failed with status ${response.status}`;

        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
          }
        }

        throw new ApiError(errorMessage, response.status, errorBody);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 4xx errors (except 408 request timeout)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 408) {
        throw error;
      }

      // Don't retry if we've exhausted retries
      if (attempt >= retries) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Request failed');
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Auth APIs
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: import('@/types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  requestOtp: (phone: string) =>
    apiFetch<{ message: string }>('/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    apiFetch<{ token: string; user: import('@/types').User }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  register: (data: { name: string; email: string; phone: string; password: string }) =>
    apiFetch<{ token: string; user: import('@/types').User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () =>
    apiFetch<import('@/types').User>('/users/me'),
};

// Menu APIs
export const menuApi = {
  getAll: (params?: {
    category?: string;
    vegetarian?: boolean;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) => menuApi._getAll(params || {}),

  _getAll: (params: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{
      items: import('@/types').MenuItem[];
      total: number;
      page: number;
      limit: number;
    }>('/menu', { params }),

  getById: (id: string) =>
    apiFetch<import('@/types').MenuItem>(`/menu/${id}`),

  create: (data: Omit<import('@/types').MenuItem, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiFetch<import('@/types').MenuItem>('/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<import('@/types').MenuItem>) =>
    apiFetch<import('@/types').MenuItem>(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/menu/${id}`, {
      method: 'DELETE',
    }),
};

// Order APIs
export const orderApi = {
  create: (data: {
    items: { menuItemId: string; quantity: number; specialInstructions?: string }[];
    addressId: string;
    paymentMethod: 'cod' | 'upi' | 'card';
  }) =>
    apiFetch<import('@/types').Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    orderApi._getAll(params || {}),

  _getAll: (params: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{
      orders: import('@/types').Order[];
      total: number;
      page: number;
      limit: number;
    }>('/orders', { params }),

  getById: (id: string) =>
    apiFetch<import('@/types').Order>(`/orders/${id}`),

  cancel: (id: string) =>
    apiFetch<import('@/types').Order>(`/orders/${id}/cancel`, {
      method: 'POST',
    }),
};

// Admin APIs
export const adminApi = {
  getStats: () =>
    apiFetch<{
      totalOrders: number;
      totalRevenue: number;
      totalUsers: number;
      totalMenuItems: number;
      revenueByDay: { date: string; revenue: number }[];
      ordersByDay: { date: string; count: number }[];
      topItems: { name: string; count: number; revenue: number }[];
    }>('/admin/stats'),

  getAllUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    adminApi._getAllUsers(params || {}),

  _getAllUsers: (params: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{
      users: import('@/types').User[];
      total: number;
      page: number;
      limit: number;
    }>('/admin/users', { params }),

  getAllOrders: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) =>
    adminApi._getAllOrders(params || {}),

  _getAllOrders: (params: Record<string, string | number | boolean | undefined>) =>
    apiFetch<{
      orders: import('@/types').Order[];
      total: number;
      page: number;
      limit: number;
    }>('/admin/orders', { params }),

  updateOrderStatus: (orderId: string, status: import('@/types').OrderStatus) =>
    apiFetch<import('@/types').Order>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// Address APIs
export const addressApi = {
  getAll: () =>
    apiFetch<import('@/types').Address[]>('/addresses'),

  create: (data: Omit<import('@/types').Address, 'id' | 'userId'>) =>
    apiFetch<import('@/types').Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<import('@/types').Address>) =>
    apiFetch<import('@/types').Address>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/addresses/${id}`, {
      method: 'DELETE',
    }),

  setDefault: (id: string) =>
    apiFetch<import('@/types').Address>(`/addresses/${id}/default`, {
      method: 'PATCH',
    }),
};
