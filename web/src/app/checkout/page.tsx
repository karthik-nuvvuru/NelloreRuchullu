"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useCart } from "@/hooks/useCart";
import { CheckoutSkeleton } from "@/components/SkeletonLoader";
import type { Address } from "@/types";

interface NewAddressFormData {
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  label: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("cod");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<NewAddressFormData>({
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
    label: "",
  });
  const { items, clearCart, subtotal, tax } = useCart();
  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setLoading(true);
    apiFetch<Address[]>('/users/addresses', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((data) => setAddresses(Array.isArray(data) ? data : []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [token, router]);

  const handleSaveNewAddress = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      setError("Please fill in all required fields");
      return;
    }
    setSavingAddress(true);
    setError(null);
    try {
      const newAddress = await apiFetch<Address>('/addresses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddress(newAddress.id);
      setShowAddressForm(false);
      setAddressForm({ address_line1: "", city: "", state: "", pincode: "", label: "" });
    } catch (err: any) {
      setError(err.message || "Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  }, [addressForm, token]);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }
    setError(null);
    setPlacingOrder(true);
    try {
      const orderData = await apiFetch<{ id: string; order_number: string }>('/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_id: selectedAddress, payment_method: paymentMethod, notes: notes || undefined }),
      });
      clearCart();
      router.push(`/checkout/success?id=${orderData.id}&number=${orderData.order_number}`);
    } catch (err: any) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }, [selectedAddress, paymentMethod, notes, token, clearCart, router]);

  const handleOnlinePayment = useCallback(async () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }
    setError(null);
    setPlacingOrder(true);
    try {
      // First create order to get order details
      const orderData = await apiFetch<{ id: string; order_number: string; total_amount: number }>('/orders', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ address_id: selectedAddress, payment_method: 'upi', notes: notes || undefined }),
      });

      // Create Razorpay order
      const razorpayOrder = await apiFetch<{ razorpay_order_id: string; amount: number; currency: string }>('/payments/create', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderData.id, amount: Math.round(orderData.total_amount * 100) }),
      });

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
        setTimeout(resolve, 3000); // fallback timeout
      });

      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.razorpay_order_id,
        name: 'NelloreRuchullu',
        description: `Order #${orderData.order_number}`,
        handler: async (response: any) => {
          // Verify payment
          try {
            await apiFetch('/payments/verify', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.id,
              }),
            });
            clearCart();
            router.push(`/checkout/success?id=${orderData.id}&number=${orderData.order_number}`);
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#ea580c',
        },
      });
      rzp.on('payment.failed', (response: any) => {
        setError(`Payment failed: ${response.error.description}`);
        setPlacingOrder(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment. Please try again.");
      setPlacingOrder(false);
    }
  }, [selectedAddress, notes, token, clearCart, router]);

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
          {addresses.length === 0 && !showAddressForm ? (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-500 mb-4">No saved addresses yet</p>
              <button onClick={() => setShowAddressForm(true)} className="text-orange-600 font-medium hover:underline">Add New Address</button>
            </div>
          ) : showAddressForm ? (
            <form onSubmit={handleSaveNewAddress} className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-lg">Add New Address</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line</label>
                <input
                  type="text"
                  value={addressForm.address_line1}
                  onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="123 Main Street"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Nellore"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Andhra Pradesh"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="524001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Label (optional)</label>
                  <input
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Home, Work, etc."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </form>
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
                    <p className="font-medium">{addr.line1}</p>
                    <p className="text-gray-500 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                    <p className="text-gray-400 text-xs capitalize">{addr.label}</p>
                  </div>
                </label>
              ))}
              <button onClick={() => setShowAddressForm(true)} className="text-orange-600 font-medium hover:underline mt-2">
                + Add New Address
              </button>
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
              onClick={paymentMethod === "online" ? handleOnlinePayment : handlePlaceOrder}
              disabled={placingOrder || !selectedAddress || items.length === 0}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {placingOrder ? "Processing..." : paymentMethod === "online" ? "Pay Now with Razorpay" : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
