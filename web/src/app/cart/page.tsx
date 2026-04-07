"use client";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, subtotal, tax, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some delicious items to get started</p>
        <Link href="/menu" className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Cart ({items.length} items)</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow">
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-orange-600 font-bold">₹{item.price}</p>
              </div>
              <div className="flex items-center border rounded-lg">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100">−</button>
                <span className="px-3 py-1 font-medium">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
              </div>
              <p className="font-semibold w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 px-2">✕</button>
            </div>
          ))}
          <button onClick={clearCart} className="text-gray-500 text-sm hover:text-red-500 transition">Clear Cart</button>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery</span><span>₹40.00</span></div>
            <hr />
            <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{(total + 40).toFixed(2)}</span></div>
          </div>
          <Link href="/checkout"
            className="block bg-orange-600 text-white text-center py-3 rounded-lg font-semibold mt-4 hover:bg-orange-700 transition">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
