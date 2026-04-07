'use client';

import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const incrementQuantity = useCartStore((state) => state.incrementQuantity);
  const decrementQuantity = useCartStore((state) => state.decrementQuantity);

  return (
    <div className="flex gap-4 border-b border-gray-100 py-4 last:border-b-0">
      <button
        onClick={() => removeItem(item.menuItem.id)}
        className="self-start text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Remove item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {item.menuItem.image ? (
          <Image
            src={item.menuItem.image}
            alt={item.menuItem.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{item.menuItem.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{item.menuItem.description}</p>
          {item.specialInstructions && (
            <p className="mt-1 text-xs text-gray-400 italic">Note: {item.specialInstructions}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => decrementQuantity(item.menuItem.id)}
              className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => incrementQuantity(item.menuItem.id)}
              className="flex size-7 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              +
            </button>
          </div>

          <span className="font-semibold text-gray-900">
            ₹{(item.menuItem.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
