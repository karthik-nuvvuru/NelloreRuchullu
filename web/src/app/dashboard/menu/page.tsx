"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AdminMenuPage() {
  const router = useRouter();
  const token = getToken();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", is_vegetarian: false, is_available: true });

  useEffect(() => {
    if (!token) { router.push("/auth/login"); return; }
    fetch(`${API_BASE}/menu?per_page=50`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => setItems(d.items || [])).finally(() => setLoading(false));
  }, [token, router]);

  const handleCreate = async () => {
    if (!form.name || !form.price) { alert("Name and price are required"); return; }
    const res = await fetch(`${API_BASE}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    if (!res.ok) return;
    const newItem = await res.json();
    setItems((prev) => [newItem, ...prev]);
    setShowForm(false);
    setForm({ name: "", description: "", price: "", is_vegetarian: false, is_available: true });
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Delete this item?")) return;
    await fetch(`${API_BASE}/menu/${itemId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management ({items.length})</h1>
        <button onClick={() => setShowForm(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition">
          + Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Item</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Item name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-3 py-2 border rounded-lg" />
            <input type="number" placeholder="Price" value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="px-3 py-2 border rounded-lg" />
            <input type="text" placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="px-3 py-2 border rounded-lg col-span-2" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_vegetarian}
              onChange={(e) => setForm({ ...form, is_vegetarian: e.target.checked })} /> Vegetarian</label>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreate} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">Create</button>
            <button onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-500 hover:text-gray-700 transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b text-left text-gray-500">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Available</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{item.name}</td>
                <td className="py-3 px-4">₹{item.price}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${item.is_vegetarian ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {item.is_vegetarian ? "Veg" : "Non-Veg"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${item.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.is_available ? "Yes" : "No"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 text-xs">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
