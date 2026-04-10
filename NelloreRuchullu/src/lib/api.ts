// API client for NelloreRuchullu backend
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem("auth_token");
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...restOptions } = options;

  const url = new URL(`${API_BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  const token = await getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url.toString(), {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const errorMessage =
      errorBody?.message || `API request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, errorBody);
  }

  return response.json() as Promise<T>;
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; phone: string; password: string }) =>
    apiFetch<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  requestOtp: (phone: string) =>
    apiFetch<{ message: string }>("/auth/otp/request", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    apiFetch<{ token: string; user: User }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),

  getProfile: () => apiFetch<User>("/users/me"),

  updateProfile: (data: Partial<User>) =>
    apiFetch<User>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Menu API
export const menuApi = {
  getAll: (params?: { category?: string; vegetarian?: boolean; search?: string; page?: number; limit?: number }) => {
    const searchParams: Record<string, string | number | boolean | undefined> = {};
    if (params?.category) searchParams.category = params.category;
    if (params?.vegetarian !== undefined) searchParams.vegetarian = params.vegetarian;
    if (params?.search) searchParams.search = params.search;
    if (params?.page) searchParams.page = params.page;
    if (params?.limit) searchParams.limit = params.limit;
    return apiFetch<{ items: MenuItem[]; total: number; page: number; limit: number }>("/menu", { params: searchParams });
  },

  getById: (id: string) => apiFetch<MenuItem>(`/menu/${id}`),

  getCategories: () => apiFetch<{ categories: string[] }>("/menu/categories"),
};

// Order API
export const orderApi = {
  create: (data: {
    items: { menuItemId: string; quantity: number; specialInstructions?: string }[];
    addressId: string;
    paymentMethod: "cod" | "upi" | "card";
    couponCode?: string;
  }) =>
    apiFetch<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAll: (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams: Record<string, string | number | boolean | undefined> = {};
    if (params?.page) searchParams.page = params.page;
    if (params?.limit) searchParams.limit = params.limit;
    if (params?.status) searchParams.status = params.status;
    return apiFetch<{ orders: Order[]; total: number; page: number; limit: number }>("/orders", { params: searchParams });
  },

  getMyOrders: () => apiFetch<{ orders: Order[] }>("/orders/my"),

  getById: (id: string) => apiFetch<Order>(`/orders/${id}`),

  cancel: (id: string) =>
    apiFetch<Order>(`/orders/${id}/cancel`, {
      method: "POST",
    }),
};

// Cart API
export const cartApi = {
  get: () => apiFetch<CartResponse>("/cart"),

  addItem: (data: { menuItemId: string; quantity: number; specialInstructions?: string }) =>
    apiFetch<CartResponse>("/cart/items", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateItem: (itemId: string, data: { quantity: number; specialInstructions?: string }) =>
    apiFetch<CartResponse>(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  removeItem: (itemId: string) =>
    apiFetch<CartResponse>(`/cart/items/${itemId}`, {
      method: "DELETE",
    }),

  clear: () =>
    apiFetch<{ message: string }>("/cart", {
      method: "DELETE",
    }),
};

// Address API
export const addressApi = {
  getAll: () => apiFetch<Address[]>("/addresses"),

  create: (data: Omit<Address, "id">) =>
    apiFetch<Address>("/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Address>) =>
    apiFetch<Address>(`/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ message: string }>(`/addresses/${id}`, {
      method: "DELETE",
    }),

  setDefault: (id: string) =>
    apiFetch<Address>(`/addresses/${id}/default`, {
      method: "PATCH",
    }),
};

// Coupon API
export const couponApi = {
  validate: (code: string, orderAmount: number) =>
    apiFetch<{ valid: boolean; message: string; discount_type?: string; discount_value?: number; discounted_amount?: number }>(
      `/coupons/validate/${code}?order_amount=${orderAmount}`
    ),

  apply: (code: string) =>
    apiFetch<{ message: string; code: string; used_count: number }>(`/coupons/apply/${code}`, {
      method: "POST",
    }),
};

// Delivery API
export const deliveryApi = {
  track: (orderId: string) => apiFetch<DeliveryTrackResponse>(`/delivery/track/${orderId}`),
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "admin" | "vendor" | "delivery";
  language?: "en" | "te";
  avatar?: string;
  createdAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  isVeg: boolean;
  isAvailable?: boolean;
  rating?: number;
  prepTime?: string;
  stock?: number;
  addons?: Addon[];
  popular?: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface CartResponse {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress: Address;
  couponCode?: string;
  notes?: string;
  paymentMethod: "cod" | "upi" | "card";
  paymentStatus: "pending" | "initiated" | "completed" | "failed";
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface DeliveryTrackResponse {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  partnerId?: string;
  partnerName?: string;
  partnerPhone?: string;
  currentLatitude?: number;
  currentLongitude?: number;
  pickedUpAt?: string;
  deliveredAt?: string;
  estimatedMinutes?: number;
}

export type DeliveryStatus =
  | "UNASSIGNED"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED";

export { ApiError };
