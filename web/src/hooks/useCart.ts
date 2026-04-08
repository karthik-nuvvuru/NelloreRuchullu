'use client';

import { useCallback } from 'react';
import { useAuthStore, useCartStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import type { MenuItem } from '@/types';

export function useCart() {
  const store = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const addItemToCart = useCallback(async (menuItem: MenuItem, quantity: number = 1, specialInstructions?: string) => {
    // Add to local store first (Zustand handles localStorage persistence)
    store.addItem(menuItem, quantity, specialInstructions);

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        await apiFetch('/cart/items', {
          method: 'POST',
          body: JSON.stringify({
            menu_item_id: menuItem.id,
            quantity,
            special_instructions: specialInstructions,
          }),
        });
      } catch (error) {
        console.error('Failed to sync cart to backend:', error);
      }
    }
  }, [isAuthenticated, store]);

  const removeItemFromCart = useCallback(async (menuItemId: string) => {
    store.removeItem(menuItemId);

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        // Backend expects DELETE /cart/items/{item_id}
        await apiFetch(`/cart/items/${menuItemId}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to sync cart removal to backend:', error);
      }
    }
  }, [isAuthenticated, store]);

  const updateItemQuantity = useCallback(async (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      store.removeItem(menuItemId);
    } else {
      store.updateQuantity(menuItemId, quantity);
    }

    if (isAuthenticated) {
      try {
        // Use PUT to update cart item quantity
        await apiFetch(`/cart/items/${menuItemId}`, {
          method: 'PUT',
          body: JSON.stringify({ quantity }),
        });
      } catch (error) {
        console.error('Failed to sync cart update to backend:', error);
      }
    }
  }, [isAuthenticated, store]);

  const clearCartAndSync = useCallback(async () => {
    store.clearCart();

    if (isAuthenticated) {
      try {
        await apiFetch('/cart', { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to sync cart clear to backend:', error);
      }
    }
  }, [isAuthenticated, store]);

  const syncCartFromBackend = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const cartData = await apiFetch<{
        items: Array<{
          id: string;
          menu_item_id: string;
          item_name: string;
          price: number;
          quantity: number;
        }>;
      }>('/cart');

      if (cartData?.items && cartData.items.length > 0) {
        // Clear local cart and rebuild from backend
        store.clearCart();
        cartData.items.forEach(item => {
          store.addItem({
            id: item.menu_item_id,
            name: item.item_name,
            price: item.price,
            quantity: item.quantity,
          } as any);
        });
      }
    } catch (error) {
      console.error('Failed to sync cart from backend:', error);
    }
  }, [isAuthenticated, store]);

  return {
    items: store.items,
    addItem: addItemToCart,
    removeItem: removeItemFromCart,
    updateQuantity: updateItemQuantity,
    incrementQuantity: store.incrementQuantity,
    decrementQuantity: store.decrementQuantity,
    clearCart: clearCartAndSync,
    total: store.total(),
    subtotal: store.subtotal(),
    tax: store.tax(),
    cartTotal: store.total(),
    itemCount: store.getItemCount(),
    isAuthenticated,
    syncCartFromBackend,
  };
}