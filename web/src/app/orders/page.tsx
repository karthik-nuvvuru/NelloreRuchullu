"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

interface Order { id: string; order_number: string; status: string; total_amount: string; created_at: string; items: { name: string; quantity: number }[] }

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready_for_pickup: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    if (!token) { router.push("/auth/login"); return; }
    fetch(`${API_BASE}/orders/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setOrders(d.orders || d.items || [])).finally(() => setLoading(false));
  }, [token, router]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No orders yet</p>
          <Link href="/menu" className="text-orange-600 hover:underline">Browse menu</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}
              className="block bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{order.order_number}</p>
                  <p className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3">
                <p className="text-gray-600 text-sm">{order.items?.length || 0} items</p>
                <p className="font-bold text-orange-600">₹{order.total_amount}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
