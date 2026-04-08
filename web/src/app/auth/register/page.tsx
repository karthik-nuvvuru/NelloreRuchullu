"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setToken } from "@/lib/auth";
import { API_BASE } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "", phone: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Registration failed"); }
      const data = await res.json();
      setToken(data.token || data.access_token, data.refresh_token);
      router.push("/menu");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Create Account</h1>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" value={form.first_name} onChange={update("first_name")}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="John" required data-testid="input-first-name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" value={form.last_name} onChange={update("last_name")}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Doe" required data-testid="input-last-name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={form.email} onChange={update("email")}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="john@example.com" required data-testid="input-email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={update("phone")}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="+919999999999" data-testid="input-phone" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={form.password} onChange={update("password")}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Min 8 characters" required minLength={8} data-testid="input-password" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
            data-testid="button-submit">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center mt-6 text-gray-500 text-sm">
          Already have an account? <Link href="/auth/login" className="text-orange-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
