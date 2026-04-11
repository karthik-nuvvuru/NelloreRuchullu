"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

interface Order { id: string; user_id: string; order_number: string }

export default function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const orderNumber = searchParams.get("number");
  const [error, setError] = useState<string | null>(null);
  const [verifiedOrderId, setVerifiedOrderId] = useState<string | null>(orderId);

  useEffect(() => {
    if (!orderId) return;
    const token = getToken();
    if (!token) {
      setError("Please log in to view your order");
      return;
    }
    // Verify order exists and belongs to current user
    apiFetch<Order>(`/orders/${orderId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((order) => {
        if (!order || !order.id) {
          setError("Order not found");
          setVerifiedOrderId(null);
        } else if (order.user_id !== JSON.parse(localStorage.getItem('user') || '{}').id) {
          setError("You do not have permission to view this order");
          setVerifiedOrderId(null);
        }
      })
      .catch(() => {
        setError("Failed to verify order");
        setVerifiedOrderId(null);
      });
  }, [orderId]);

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}
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
        {verifiedOrderId ? (
          <Link
            href={`/orders/${verifiedOrderId}`}
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
