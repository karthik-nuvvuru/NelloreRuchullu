"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const orderNumber = searchParams.get("number");

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <div className="text-7xl mb-6">✓</div>
      <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-6">Your order has been confirmed and is being prepared</p>
      {orderNumber && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <p className="text-sm text-gray-600">Order Number</p>
          <p className="text-2xl font-bold text-green-700">{orderNumber}</p>
        </div>
      )}
      <div className="space-y-3">
        <Link href={`/orders/${orderId}`} className="block bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition">
          Track Your Order
        </Link>
        <Link href="/menu" className="block border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">
          Order More
        </Link>
      </div>
    </div>
  );
}
