"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!token) { router.push("/auth/login"); return; }
    Promise.all([
      fetch(`${API_BASE}/analytics/overview`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_BASE}/analytics/popular-items`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_BASE}/orders?per_page=5`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([overview, popular, ordersData]) => {
      setStats(overview);
      setPopularItems(popular || []);
      setOrders(ordersData?.items || []);
    }).finally(() => setLoading(false));
  }, [token, router]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;

  const statCards = [
    { label: "Total Orders", value: stats.total_orders || 0, icon: "📦", color: "bg-blue-500" },
    { label: "Active Orders", value: stats.active_orders || 0, icon: "🔵", color: "bg-orange-500" },
    { label: "Total Revenue", value: `₹${stats.total_revenue?.toFixed(0) || 0}`, icon: "💰", color: "bg-green-500" },
    { label: "Total Users", value: stats.total_users || 0, icon: "👥", color: "bg-purple-500" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`${card.color} text-white rounded-xl p-6 shadow-lg`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-white/80 text-sm">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Popular Items */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">🔥 Popular Items</h2>
          {popularItems.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {popularItems.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="font-medium">#{i + 1} {item.name}</span>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>{item.total_quantity} sold</span>
                    <span>{item.total_orders} orders</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📊 Revenue Overview</h2>
          {stats.total_revenue ? (
            <div className="space-y-4">
              <div className="flex items-end gap-2 h-40" style={{ maxWidth: "100%" }}>
                {[
                  { label: "Revenue", value: stats.total_revenue, color: "bg-green-500" },
                  { label: "Avg Order", value: stats.avg_order_value || 0, color: "bg-blue-500" },
                  { label: "Active", value: stats.active_orders, color: "bg-orange-500" },
                ].map((bar) => {
                  const max = Math.max(stats.total_revenue, stats.avg_order_value || 0, stats.active_orders, 1);
                  const height = Math.max((bar.value / max) * 100, 10);
                  return (
                    <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold">{typeof bar.value === "number" ? `₹${bar.value.toFixed(0)}` : bar.value}</span>
                      <div className={`${bar.color} rounded-t`} style={{ height: `${height}%`, width: "60%", minHeight: 20 }} />
                      <span className="text-xs text-gray-500">{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No data yet</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <h2 className="text-lg font-semibold mb-4">📋 Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400">No orders</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-gray-500"><th className="py-2">Order #</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-b">
                  <td className="py-3 font-medium">{o.order_number}</td>
                  <td className="py-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{o.status}</span></td>
                  <td className="py-3 font-bold text-orange-600">₹{o.total_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
