"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useCart } from "@/hooks/useCart";
import { CheckoutSkeleton } from "@/components/SkeletonLoader";

interface Address { id: string; address_line1: string; city: string; state: string; pincode: string; address_type: string }

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { items, clearCart, subtotal, tax } = useCart();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/users/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [token, router]);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }
    setError(null);
    setPlacingOrder(true);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address_id: selectedAddress, payment_method: paymentMethod, notes: notes || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to place order");
      }
      const data = await res.json();
      clearCart();
      router.push(`/checkout/success?id=${data.id}&number=${data.order_number}`);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }, [selectedAddress, paymentMethod, notes, token, clearCart, router]);

  if (loading) {
    return <CheckoutSkeleton />;
  }

  const deliveryFee = 40;
  const total = subtotal + tax + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          {addresses.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-500 mb-4">No saved addresses yet</p>
              <button className="text-orange-600 font-medium hover:underline">Add New Address</button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${selectedAddress === addr.id ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500" : "hover:bg-gray-50"}`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                    className="mt-1 accent-orange-600"
                  />
                  <div>
                    <p className="font-medium">{addr.address_line1}</p>
                    <p className="text-gray-500 text-sm">{addr.city}, {addr.state} {addr.pincode}</p>
                    <p className="text-gray-400 text-xs capitalize">{addr.address_type}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <h2 className="text-xl font-semibold mb-4 mt-8">Order Notes (optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            rows={3}
            placeholder="Any special instructions for your order..."
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="space-y-3 mb-8">
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "cod" ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500" : ""}`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                className="accent-orange-600"
              />
              <div>
                <span className="font-medium">Cash on Delivery</span>
                <p className="text-gray-500 text-sm">Pay when your order arrives</p>
              </div>
            </label>
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "online" ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500" : ""}`}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
                className="accent-orange-600"
              />
              <div>
                <span className="font-medium">Online Payment</span>
                <p className="text-gray-500 text-sm">Pay now with Razorpay</p>
              </div>
            </label>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold mb-4 text-lg">Order Summary</h3>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-orange-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddress || items.length === 0}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
