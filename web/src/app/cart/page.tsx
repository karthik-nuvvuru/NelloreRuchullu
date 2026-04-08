"use client";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useCallback } from "react";
import { CartSkeleton } from "@/components/SkeletonLoader";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, tax, total } = useCart();

  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    updateQuantity(id, quantity);
  }, [updateQuantity]);

  const handleRemoveItem = useCallback((id: string) => {
    removeItem(id);
  }, [removeItem]);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-7xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added any delicious items yet</p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
        >
          <span>Browse Menu</span>
          <span>→</span>
        </Link>
      </div>
    );
  }

  const deliveryFee = 40;
  const grandTotal = total + tax + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
      <p className="text-gray-500 mb-6">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{item.name}</h3>
                <p className="text-orange-600 font-bold">₹{item.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  className="px-3 py-2 text-lg hover:bg-gray-100 transition-colors active:scale-95"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-4 py-2 font-medium min-w-[48px] text-center">{item.quantity}</span>
                <button
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  className="px-3 py-2 text-lg hover:bg-gray-100 transition-colors active:scale-95"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <p className="font-semibold w-24 text-right text-nowrap">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>

              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                aria-label="Remove item"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}

          <div className="pt-4">
            <button
              onClick={clearCart}
              className="text-gray-500 text-sm hover:text-red-500 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (5%)</span>
              <span className="font-medium">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-600">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block bg-orange-600 text-white text-center py-3 rounded-lg font-semibold mt-4 hover:bg-orange-700 transition-colors active:scale-[0.98]"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/menu"
            className="block text-center text-orange-600 text-sm font-medium mt-3 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
