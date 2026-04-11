// API hooks for NelloreRuchullu - Real Backend Integration
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch, authApi, menuApi, orderApi, couponApi, cartApi, ApiError } from "../lib/api";
import type { User, MenuItem, Order, CartResponse } from "../lib/api";

// Re-export types for backwards compatibility
export type { User, MenuItem, Order };
export { ApiError };

// Auth token storage
export async function saveAuthToken(token: string, user: User): Promise<void> {
  await AsyncStorage.setItem("auth_token", token);
  await AsyncStorage.setItem("user", JSON.stringify(user));
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem("auth_token");
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem("auth_token");
  await AsyncStorage.removeItem("user");
}

// Fetch user profile
export async function fetchUserProfile(): Promise<User | null> {
  try {
    return await authApi.getProfile();
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
}

// Fetch menu items from backend
export async function fetchMenuItems(params?: {
  category?: string;
  vegetarian?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: MenuItem[]; total: number }> {
  try {
    const result = await menuApi.getAll(params);
    return { items: result.items, total: result.total };
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return { items: [], total: 0 };
  }
}

// Fetch menu categories
export async function fetchCategories(): Promise<string[]> {
  try {
    const result = await menuApi.getCategories();
    return result.categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

// Fetch orders from backend
export async function fetchOrders(): Promise<Order[]> {
  try {
    const result = await orderApi.getMyOrders();
    return result.orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

// Fetch single order
export async function fetchOrderById(orderId: string): Promise<Order | null> {
  try {
    return await orderApi.getById(orderId);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

// Validate coupon
export async function validateCoupon(code: string, orderAmount: number) {
  try {
    return await couponApi.validate(code, orderAmount);
  } catch (error) {
    console.error("Failed to validate coupon:", error);
    return { valid: false, message: "Failed to validate coupon" };
  }
}

// Apply coupon (increment usage count)
export async function applyCoupon(code: string) {
  try {
    return await couponApi.apply(code);
  } catch (error) {
    console.error("Failed to apply coupon:", error);
    return null;
  }
}

// Cart operations
export async function fetchCart(): Promise<CartResponse | null> {
  try {
    return await cartApi.get();
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return null;
  }
}

export async function addToCart(menuItemId: string, quantity: number, specialInstructions?: string): Promise<CartResponse | null> {
  try {
    return await cartApi.addItem({ menuItemId, quantity, specialInstructions });
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return null;
  }
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartResponse | null> {
  try {
    return await cartApi.updateItem(itemId, { quantity });
  } catch (error) {
    console.error("Failed to update cart item:", error);
    return null;
  }
}

export async function removeFromCart(itemId: string): Promise<CartResponse | null> {
  try {
    return await cartApi.removeItem(itemId);
  } catch (error) {
    console.error("Failed to remove from cart:", error);
    return null;
  }
}

export async function clearCartApi(): Promise<boolean> {
  try {
    await cartApi.clear();
    return true;
  } catch (error) {
    console.error("Failed to clear cart:", error);
    return false;
  }
}

// Transform backend order to app format
export function transformBackendOrder(order: Order) {
  const statusMap: Record<string, string> = {
    PENDING: "placed",
    CONFIRMED: "confirmed",
    PREPARING: "preparing",
    READY_FOR_PICKUP: "outForDelivery",
    OUT_FOR_DELIVERY: "outForDelivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  };

  return {
    id: order.id,
    restaurantName: "Nellore Ruchullu",
    status: statusMap[order.status] || "placed",
    total: order.totalAmount,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
    })),
    placedAt: order.createdAt,
    estimatedDelivery: Date.now() + 45 * 60 * 1000,
  };
}

// Transform backend menu item to app format
export function transformBackendMenuItem(item: MenuItem) {
  return {
    id: item.id,
    name: item.name,
    description: item.description || "",
    price: item.price,
    image: item.image || "",
    category: item.category,
    isVeg: item.isVeg,
    rating: item.rating || 4.2,
    prepTime: item.prepTime || "30",
    popular: item.popular || false,
    restaurantId: "restaurant_1",
    addons: item.addons || [],
  };
}
