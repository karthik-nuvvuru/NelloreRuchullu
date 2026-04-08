"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const orderNumber = searchParams.get("number");

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold mb-2">Order Placed!</h1>
      <p className="text-gray-500 mb-8">Your order has been confirmed and is being prepared</p>

      {orderNumber && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <p className="text-sm text-gray-600 mb-1">Order Number</p>
          <p className="text-2xl font-bold text-green-700">{orderNumber}</p>
        </div>
      )}

      <div className="space-y-3">
        {orderId ? (
          <Link
            href={`/orders/${orderId}`}
            className="block bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Track Your Order
          </Link>
        ) : (
          <Link
            href="/orders"
            className="block bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            View My Orders
          </Link>
        )}
        <Link
          href="/menu"
          className="block border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Order More
        </Link>
      </div>

      <div className="mt-12 text-sm text-gray-400">
        <p>Thank you for choosing NelloreRuchullu!</p>
      </div>
    </div>
  );
}
