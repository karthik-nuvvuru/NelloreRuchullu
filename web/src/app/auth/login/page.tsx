"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setToken } from "@/lib/auth";
import { API_BASE } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ emailOrPhone?: string; otpPhone?: string }>({});

  const validateEmailOrPhone = (val: string): string | undefined => {
    if (!val) return undefined;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^\+?[\d\s-]{10,}$/;
    if (emailRe.test(val)) return undefined;
    if (phoneRe.test(val.replace(/\s/g, ""))) return undefined;
    return "Enter a valid email or phone (10+ digits)";
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmailOrPhone(emailOrPhone);
    if (err) { setFieldErrors({ emailOrPhone: err }); return; }
    setFieldErrors({});
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_or_phone: emailOrPhone, password }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || "Login failed"); }
      const data = await res.json();
      setToken(data.token || data.access_token, data.refresh_token);
      router.push("/menu");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: otpPhone }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      setOtpSent(true);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: otpPhone, code: otpCode }),
      });
      if (!res.ok) throw new Error("Invalid or expired OTP");
      const data = await res.json();
      setToken(data.access_token, data.refresh_token);
      router.push("/menu");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Login</h1>
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setMode("email")} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === "email" ? "bg-white shadow text-orange-600" : "text-gray-500"}`}>
            Email / Phone
          </button>
          <button onClick={() => setMode("otp")} className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === "otp" ? "bg-white shadow text-orange-600" : "text-gray-500"}`}>
            OTP Login
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        {mode === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-4" data-testid="login-form">
            <div>
              <label className="block text-sm font-medium mb-1">Email or Phone</label>
              <input type="text" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="email@example.com or +91..." required data-testid="input-email-or-phone" />
              {fieldErrors.emailOrPhone && <p className="text-red-500 text-sm mt-1">{fieldErrors.emailOrPhone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter password" required data-testid="input-password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
              data-testid="button-submit">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleOtpLogin : handleSendOtp} className="space-y-4" data-testid="otp-form">
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input type="tel" value={otpPhone} onChange={(e) => setOtpPhone(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="+919999999999" required disabled={otpSent} data-testid="input-phone" />
              {otpSent && (
                <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); }} className="text-sm text-orange-600 hover:underline mt-1">Edit phone number</button>
              )}
            </div>
            {otpSent && (
              <div>
                <label className="block text-sm font-medium mb-1">OTP Code</label>
                <input type="text" value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter 6-digit OTP" required maxLength={6} data-testid="input-otp" />
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50"
              data-testid="button-submit">
              {loading ? "Sending..." : otpSent ? "Verify & Login" : "Send OTP"}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-gray-500 text-sm">
          Don&apos;t have an account? <Link href="/auth/register" className="text-orange-600 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
