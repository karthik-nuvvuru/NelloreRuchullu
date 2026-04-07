'use client';

import { useAuthStore, useCartStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import type { MenuItem } from '@/types';

export function useCart() {
  const store = useCartStore();

  const { isAuthenticated } = useAuthStore();

  const addItemToCart = async (menuItem: MenuItem, quantity: number = 1, specialInstructions?: string) => {
    // Add to local store first
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
  };

  const removeItemFromCart = async (menuItemId: string) => {
    const localItem = store.items.find(i => i.id === menuItemId);
    store.removeItem(menuItemId);

    // Sync to backend if authenticated
    if (isAuthenticated && localItem) {
      try {
        await apiFetch('/cart', { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to sync cart removal to backend:', error);
      }
    }
  };

  const updateItemQuantity = async (menuItemId: string, quantity: number) => {
    store.updateQuantity(menuItemId, quantity);

    if (isAuthenticated) {
      try {
        await apiFetch('/cart', { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to sync cart update to backend:', error);
      }
    }
  };

  const clearCartAndSync = async () => {
    store.clearCart();

    if (isAuthenticated) {
      try {
        await apiFetch('/cart', { method: 'DELETE' });
      } catch (error) {
        console.error('Failed to sync cart clear to backend:', error);
      }
    }
  };

  const syncCartFromBackend = async () => {
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

      if (cartData.items && cartData.items.length > 0) {
        const backendItems = cartData.items.map(item => ({
          id: item.menu_item_id,
          name: item.item_name,
          price: item.price,
          quantity: item.quantity,
        }));

        const currentStore = useCartStore.getState();
        backendItems.forEach(item => {
          if (!currentStore.items.find(i => i.id === item.id)) {
            currentStore.addItem({ id: item.id, name: item.name, price: item.price, quantity: item.quantity } as any);
          }
        });
      }
    } catch (error) {
      console.error('Failed to sync cart from backend:', error);
    }
  };

  return {
    items: store.items,
    addItem: addItemToCart,
    removeItem: removeItemFromCart,
    updateQuantity: updateItemQuantity,
    incrementQuantity: store.incrementQuantity,
    decrementQuantity: store.decrementQuantity,
    clearCart: clearCartAndSync,
    total: store.total(), // This is subtotal only, UI adds delivery fee
    subtotal: store.subtotal(),
    tax: store.tax(),
    cartTotal: store.total(),
    itemCount: store.getItemCount(),
    isAuthenticated,
    syncCartFromBackend,
  };
}