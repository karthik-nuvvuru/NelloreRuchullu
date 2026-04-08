"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { API_BASE } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { SkeletonMenuGrid } from "@/components/SkeletonLoader";

interface Category { id: string; name: string }
interface MenuItem { id: string; name: string; description: string | null; price: string; image_url: string | null; is_vegetarian: boolean; is_available: boolean; category_name: string | null }

export default function MenuPageContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const { addItem, itemCount: cartCount } = useCart();

  useEffect(() => {
    setLoading(true);
    // Build URL with category_name parameter for backend filtering
    let url = `${API_BASE}/menu?per_page=50`;
    if (categoryParam) {
      url += `&category_name=${encodeURIComponent(categoryParam)}`;
    }
    Promise.all([
      fetch(`${API_BASE}/menu/categories`).then(r => r.json()).catch(() => []),
      fetch(url).then(r => r.json()).then(d => d?.items || []).catch(() => []),
    ]).then(([cats, items]) => {
      setCategoriesList(Array.isArray(cats) ? cats : []);
      setMenuItems(Array.isArray(items) ? items : []);
    }).catch(() => {
      setCategoriesList([]);
      setMenuItems([]);
    }).finally(() => setLoading(false));
  }, [categoryParam]);

  const handleAdd = useCallback(async (item: MenuItem) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: parseFloat(String(item.price)) || 0,
      category: item.category_name || item.category || '',
      image: item.image_url || '',
      isVegetarian: item.is_vegetarian,
      isAvailable: item.is_available ?? true,
    };
    await addItem(cartItem as any, 1);
  }, [addItem]);

  const filtered = useMemo(() => {
    let result = menuItems;
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(searchLower));
    }
    if (vegOnly) {
      result = result.filter(i => i.is_vegetarian);
    }
    return result;
  }, [menuItems, search, vegOnly]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Menu</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 sticky top-24">
              <div className="h-10 bg-gray-200 rounded-lg animate-shimmer" />
              <div className="h-6 w-24 bg-gray-200 rounded animate-shimmer" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-8 bg-gray-200 rounded animate-shimmer" />
                ))}
              </div>
            </div>
          </aside>
          <main className="flex-1">
            <SkeletonMenuGrid count={6} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Menu</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-xl p-4 space-y-4 sticky top-24">
            <div>
              <label className="text-sm font-semibold mb-2 block">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Search dishes..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="veg"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
              <label htmlFor="veg" className="text-sm">Vegetarian Only</label>
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-2 block">Categories</h2>
              <div className="space-y-1">
                <Link
                  href="/menu"
                  className={`block px-3 py-1 text-sm rounded ${!categoryParam ? "bg-orange-100 text-orange-700 font-medium" : "text-orange-600 hover:bg-orange-50"}`}
                >
                  All
                </Link>
                {categoriesList.map(c => (
                  <Link
                    key={c.id}
                    href={`/menu?category=${encodeURIComponent(c.name)}`}
                    className={`block px-3 py-1 text-sm rounded ${categoryParam === c.name ? "bg-orange-100 text-orange-700 font-medium" : "hover:bg-gray-100"}`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
        {/* Menu Grid */}
        <main className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🍽️</div>
              <p className="text-gray-400 text-lg">No items found</p>
              {search && <button onClick={() => setSearch("")} className="text-orange-600 hover:underline mt-2">Clear search</button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/menu/${item.id}`}>
                    <div className="h-40 bg-orange-100 flex items-center justify-center relative">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} width={160} height={128} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-5xl">{item.is_vegetarian ? "🥬" : "🍗"}</span>
                      )}
                      {item.is_vegetarian && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">Veg</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <Link href={`/menu/${item.id}`} className="font-semibold hover:text-orange-600 transition-colors">{item.name}</Link>
                    </div>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description || ""}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-orange-600 font-bold text-lg">₹{item.price}</span>
                      <button
                        onClick={() => handleAdd(item)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors active:scale-95"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {cartCount > 0 && (
            <div className="fixed bottom-6 right-6 bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-700 transition-colors z-50">
              <Link href="/cart" className="font-medium">{cartCount} item{cartCount > 1 ? "s" : ""} in cart →</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
