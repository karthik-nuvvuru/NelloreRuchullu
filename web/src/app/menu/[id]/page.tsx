"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { API_BASE } from "@/lib/api";
import { useCartStore } from "@/lib/store";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  is_vegetarian: boolean;
  is_available: boolean;
  preparation_time_minutes: number | null;
}

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s: any) => s.addItem);

  useEffect(() => {
    fetch(`${API_BASE}/menu/${params.id}`).then((r) => r.json()).then(setItem).finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;
  if (!item) return <div className="text-center py-20 text-gray-400">Item not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={() => router.back()} className="text-orange-600 hover:underline mb-6">← Back to Menu</button>
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="h-64 bg-orange-100 flex items-center justify-center relative">
          {item.image_url ? (
            <Image src={item.image_url} alt={item.name} width={400} height={256} className="object-cover w-full h-full" />
          ) : (
            <span className="text-8xl">{item.is_vegetarian ? "🥬" : "🍗"}</span>
          )}
        </div>
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{item.name}</h1>
            {item.is_vegetarian && <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">Vegetarian</span>}
          </div>
          {item.description && <p className="text-gray-600 mb-6">{item.description}</p>}
          {item.preparation_time_minutes && <p className="text-gray-500 text-sm mb-4">⏱ Prep time: {item.preparation_time_minutes} min</p>}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100">−</button>
              <span className="px-4 py-2 font-medium min-w-[40px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100">+</button>
            </div>
            <button onClick={() => addItem({ id: item.id, name: item.name, price: parseFloat(item.price), quantity })}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition">
              Add to Cart — ₹{(parseFloat(item.price) * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
