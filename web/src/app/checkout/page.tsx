"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useCart } from "@/hooks/useCart";

interface Address { id: string; address_line1: string; city: string; state: string; pincode: string; address_type: string }

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { items, clearCart, subtotal } = useCart();
  const token = getToken();

  useEffect(() => {
    if (!token) { router.push("/auth/login"); return; }
    fetch(`${API_BASE}/users/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then(setAddresses).catch(() => {});
  }, [token, router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { alert("Please select an address"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address_id: selectedAddress, payment_method: paymentMethod, notes: notes || undefined }),
      });
      if (!res.ok) throw new Error("Failed to place order");
      const data = await res.json();
      clearCart();
      router.push(`/checkout/success?id=${data.id}&number=${data.order_number}`);
    } catch (err: any) {
      alert(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
          {addresses.length === 0 ? (
            <p className="text-gray-500">No saved addresses yet.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${selectedAddress === addr.id ? "border-orange-500 bg-orange-50" : "hover:bg-gray-50"}`}>
                  <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
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
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
            rows={3} placeholder="Any special instructions..." />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="space-y-3 mb-8">
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === "cod" ? "border-orange-500 bg-orange-50" : ""}`}>
              <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
              <span>Cash on Delivery</span>
            </label>
            <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === "online" ? "border-orange-500 bg-orange-50" : ""}`}>
              <input type="radio" name="payment" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} />
              <span>Online Payment (Razorpay)</span>
            </label>
          </div>
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-bold mb-3">Order Total</h3>
            <div className="text-3xl font-bold text-orange-600">₹{(subtotal + 40).toFixed(2)}</div>
            <p className="text-gray-500 text-sm mt-1">Includes delivery fee of ₹40</p>
            <button onClick={handlePlaceOrder} disabled={loading || !selectedAddress}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold mt-4 hover:bg-orange-700 transition disabled:opacity-50">
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
