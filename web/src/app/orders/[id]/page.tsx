"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

const STATUS_STEPS = ["pending", "confirmed", "preparing", "ready_for_pickup", "out_for_delivery", "delivered"];

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [wsStatus, setWsStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const token = getToken();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/orders/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => { setOrder(d); setWsStatus(d.status); }).finally(() => setLoading(false));

    const ws = new WebSocket(`${API_BASE.replace("http", "ws")}/ws/orders/${params.id}?token=${token}`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "order_update" && data.status) {
        setWsStatus(data.status);
        setOrder((prev: any) => prev ? { ...prev, status: data.status } : prev);
      }
    };
    wsRef.current = ws;
    return () => ws.close();
  }, [params.id, token]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  const currentStep = STATUS_STEPS.indexOf(wsStatus || order.status);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <p className="text-gray-500">Order #{order.order_number}</p>
        <h1 className="text-2xl font-bold">Track Your Order</h1>
        <p className="text-sm text-gray-400">₹{order.total_amount}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between mb-2">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className={`flex flex-col items-center flex-1 ${i <= currentStep ? "text-green-600" : "text-gray-300"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 text-sm font-bold ${i <= currentStep ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                {i <= currentStep ? "✓" : i + 1}
              </div>
              <span className="text-xs text-center hidden sm:block">{step.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
        <div className="relative h-1 bg-gray-200 rounded">
          <div className="absolute top-0 left-0 h-full bg-green-600 rounded transition-all duration-500"
            style={{ width: `${((currentStep) / (STATUS_STEPS.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold p-4 pb-0">Order Details</h2>
        <div className="p-4">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-medium">₹{item.total_price}</span>
            </div>
          ))}
          <div className="flex justify-between pt-3 font-bold">
            <span>Total</span><span className="text-orange-600">₹{order.total_amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
