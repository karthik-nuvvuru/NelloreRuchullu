import {create} from 'zustand';
import type { User, MenuItem } from '@/types';

// ---- Auth Store ----
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: string | null;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
}

let userFromStorage: User | null = null;
let tokenFromStorage = false;
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try { userFromStorage = JSON.parse(storedUser); } catch { userFromStorage = null; }
  }
  tokenFromStorage = !!localStorage.getItem('auth_token');
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: userFromStorage,
  isAuthenticated: tokenFromStorage,
  isLoading: false,
  userRole: userFromStorage?.role ?? null,
  setUser: (user) => set({ user, userRole: user?.role ?? null, isAuthenticated: !!user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    set({ user: null, userRole: null, isAuthenticated: false });
  },
}));

// ---- Cart Store ----
interface FlatCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: FlatCartItem[];
  addItem: (item: FlatCartItem | MenuItem, quantity?: number, specialInstructions?: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  subtotal: () => number;
  tax: () => number;
  total: () => number;
  getTotal: () => number;
  count: () => number;
  getItemCount: () => number;
  // Legacy methods for CartItem component compatibility
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
}

const getInitialItems = (): FlatCartItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('cart');
  if (!stored) return [];
  try { return JSON.parse(stored) as FlatCartItem[]; } catch { return []; }
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: getInitialItems(),

  addItem: (item, quantity) =>
    set((state) => {
      const flatItem: FlatCartItem = {
        id: item.id,
        name: 'name' in item ? item.name : '',
        price: 'price' in item ? item.price : 0,
        quantity: 'quantity' in item ? item.quantity : (quantity ?? 1),
      };
      const existing = state.items.find((i) => i.id === flatItem.id);
      let newItems: FlatCartItem[];
      if (existing) {
        newItems = state.items.map((i) =>
          i.id === flatItem.id ? { ...i, quantity: i.quantity + flatItem.quantity } : i,
        );
      } else {
        newItems = [...state.items, flatItem];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      return { items: newItems };
    }),

  updateQuantity: (id, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('cart', JSON.stringify(newItems));
        }
        return { items: newItems };
      }
      const newItems = state.items.map((i) =>
        i.id === id ? { ...i, quantity } : i,
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      return { items: newItems };
    }),

  removeItem: (id) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      return { items: newItems };
    }),

  clearCart: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify([]));
    }
    set({ items: [] });
  },

  subtotal: () => {
    const items = get().items;
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  tax: () => {
    return get().subtotal() * 0.05;
  },

  total: () => {
    return get().subtotal();
  },

  getTotal: () => {
    return get().subtotal();
  },

  count: () => {
    return get().items.length;
  },

  getItemCount: () => {
    const items = get().items;
    return items.reduce((sum, i) => sum + i.quantity, 0);
  },

  incrementQuantity: (id) =>
    set((state) => {
      const newItems = state.items.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i,
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      return { items: newItems };
    }),

  decrementQuantity: (id) =>
    set((state) => {
      const newItems = state.items
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cart', JSON.stringify(newItems));
      }
      return { items: newItems };
    }),
}));
