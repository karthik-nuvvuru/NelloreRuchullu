export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  created_at?: string;
}

export interface Address {
  id: string;
  userId: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  label?: string;
  isDefault: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category?: string;
  category_name?: string | null;
  image?: string | null;
  image_url?: string | null;
  isVegetarian?: boolean;
  is_vegetarian?: boolean;
  isAvailable?: boolean;
  is_available?: boolean;
  spiceLevel?: 'none' | 'mild' | 'medium' | 'hot' | 'extra-hot';
  rating?: number;
  reviewCount?: number;
  prepTime?: number;
  prep_time?: number;
  tags?: string[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: Address;
  paymentMethod: 'cod' | 'upi' | 'card';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingHistory?: TrackingEvent[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out-for-delivery'
  | 'delivered'
  | 'cancelled';

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

export interface CartState {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface OrderWebSocketMessage {
  type: 'order_update';
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  message?: string;
  eta?: number;
}
