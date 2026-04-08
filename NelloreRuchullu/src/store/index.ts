import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string;
  restaurantName: string;
  specialInstructions?: string;
  addons?: Addon[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  cuisine: string[];
  priceRange: string;
  isVeg: boolean;
  offer?: string;
  distance: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  rating: number;
  prepTime: string;
  addons?: Addon[];
  popular?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  language: "en" | "te";
}

interface CartState {
  items: CartItem[];
  restaurantName: string | null;
  restaurantId: string | null;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;

  addItem: (item: MenuItem, restaurant: Restaurant) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { discount: number; message: string };
  getItemCount: () => number;
}

const COUPONS = {
  NRCHULLU30: { discount: 0.3, minOrder: 500, message: "30% off applied!" },
  FREEDELIV: { discount: 0, deliveryWaiver: true, minOrder: 300, message: "Free delivery!" },
  FIRST100: { discount: 100, minOrder: 0, message: "₹100 off your first order!" },
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantName: null,
  restaurantId: null,
  subtotal: 0,
  deliveryFee: 40,
  tax: 0,
  total: 0,

  addItem: (item: MenuItem, restaurant: Restaurant) => {
    const currentItems = get().items;

    // If adding from different restaurant, clear cart first
    if (get().restaurantId && get().restaurantId !== restaurant.id) {
      set({
        items: [
          {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            image: item.image,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            addons: item.addons,
          },
        ],
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
      });
    } else {
      const existingIndex = currentItems.findIndex((i) => i.id === item.id);

      if (existingIndex >= 0) {
        const updatedItems = [...currentItems];
        updatedItems[existingIndex].quantity += 1;
        set({ items: updatedItems });
      } else {
        set({
          items: [
            ...currentItems,
            {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: 1,
              image: item.image,
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              addons: item.addons,
            },
          ],
          restaurantName: restaurant.name,
          restaurantId: restaurant.id,
        });
      }
    }

    // Recalculate totals
    const items = get().items;
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + get().deliveryFee + tax;

    set({ subtotal, tax, total });
  },

  removeItem: (id: string) => {
    const items = get().items.filter((i) => i.id !== id);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + get().deliveryFee + tax;

    set({
      items,
      subtotal,
      tax,
      total,
      restaurantName: items.length > 0 ? get().restaurantName : null,
      restaurantId: items.length > 0 ? get().restaurantId : null,
    });
  },

  updateQuantity: (id: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }

    const items = get().items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + get().deliveryFee + tax;

    set({ items, subtotal, tax, total });
  },

  clearCart: () => {
    set({
      items: [],
      restaurantName: null,
      restaurantId: null,
      subtotal: 0,
      deliveryFee: 40,
      tax: 0,
      total: 0,
    });
  },

  applyCoupon: (code: string) => {
    const coupon = COUPONS[code.toUpperCase() as keyof typeof COUPONS];
    if (!coupon) return { discount: 0, message: "Invalid coupon code" };

    const subtotal = get().subtotal;
    if (subtotal < coupon.minOrder) {
      return {
        discount: 0,
        message: `Minimum order ₹${coupon.minOrder} required`,
      };
    }

    return {
      discount: coupon.discount * subtotal,
      message: coupon.message,
    };
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

// User Store
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  language: "en" | "te";

  login: (user: User) => void;
  register: (user: User) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  toggleLanguage: () => void;
  setUser: (user: Partial<User>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isDarkMode: false,
  language: "en",

  login: (user: User) => {
    set({ user, isAuthenticated: true });
    AsyncStorage.setItem("user", JSON.stringify(user));
  },

  register: (user: User) => {
    set({ user, isAuthenticated: true });
    AsyncStorage.setItem("user", JSON.stringify(user));
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    AsyncStorage.removeItem("user");
  },

  toggleDarkMode: () => {
    set({ isDarkMode: !get().isDarkMode });
    AsyncStorage.setItem("darkMode", String(!get().isDarkMode));
  },

  toggleLanguage: () => {
    const newLang = get().language === "en" ? "te" : "en";
    set({ language: newLang });
    AsyncStorage.setItem("language", newLang);
  },

  setUser: (userData: Partial<User>) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, ...userData };
      set({ user: updated });
      AsyncStorage.setItem("user", JSON.stringify(updated));
    }
  },
}));

// Order Store
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "placed" | "confirmed" | "preparing" | "outForDelivery" | "delivered" | "cancelled";
  deliveryAddress: string;
  paymentMethod: "upi" | "card" | "cod";
  createdAt: number;
  estimatedDelivery: number;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  setCurrentOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,

  addOrder: (order: Order) => {
    set({ orders: [...get().orders, order], currentOrder: order });
  },

  updateOrderStatus: (id: string, status: Order["status"]) => {
    const orders = get().orders.map((o) => (o.id === id ? { ...o, status } : o));
    const currentOrder =
      get().currentOrder?.id === id ? { ...get().currentOrder!, status } : null;
    set({ orders, currentOrder });
  },

  setCurrentOrder: (order: Order | null) => {
    set({ currentOrder: order });
  },
}));
