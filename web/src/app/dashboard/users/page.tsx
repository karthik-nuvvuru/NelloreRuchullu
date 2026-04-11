"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, API_BASE } from "@/lib/api";
import { getToken, getUser } from "@/lib/auth";

export default function AdminUsersPage() {
  const router = useRouter();
  const token = getToken();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!token) { router.push("/auth/login"); return; }
    const user = getUser();
    if (user?.role !== "admin") {
      alert("Access denied: Admin only");
      router.push("/");
      return;
    }
    apiFetch<{ items: any[] }>('/users', { params: { per_page: 50 }, headers: { Authorization: `Bearer ${token}` } })
      .then((d) => setUsers(d.items || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [token, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!token) return;
    setRoleLoading(userId);
    try {
      await apiFetch(`/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      setToast({ msg: "Role updated successfully", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ msg: "Failed to update role", type: "error" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setRoleLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8">
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg text-white text-sm shadow-lg z-50 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">User Management ({users.length})</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-500">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{user.first_name} {user.last_name}</td>
                <td className="py-3 px-4 text-gray-500">{user.email || "—"}</td>
                <td className="py-3 px-4 text-gray-500">{user.phone || "—"}</td>
                <td className="py-3 px-4">
                  <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={roleLoading === user.id}
                    className="px-2 py-1 border rounded text-sm bg-white disabled:opacity-50">
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                    <option value="delivery">Delivery</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${user.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
