"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { API_BASE } from "@/lib/api";
import { useCart } from "@/hooks/useCart";

interface Category { id: string; name: string }
interface MenuItem { id: string; name: string; description: string | null; price: string; image_url: string | null; is_vegetarian: boolean; is_available: boolean; category_name: string | null }

export default function MenuPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const { addItem, itemCount: cartCount } = useCart();

  useEffect(() => {
    // Build URL with category_name parameter for backend filtering
    let url = `${API_BASE}/menu?per_page=50`;
    if (categoryParam) {
      url += `&category_name=${encodeURIComponent(categoryParam)}`;
    }
    Promise.all([
      fetch(`${API_BASE}/menu/categories`).then(r => r.json()).catch(() => []),
      fetch(url).then(r => r.json()).then(d => d?.items || []).catch(() => []),
    ]).then(([cats, items]) => {
      setCategoriesList(cats);
      setMenuItems(items);
    }).finally(() => setLoading(false));
  }, [categoryParam]);

  let filtered = menuItems;
  if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  if (vegOnly) filtered = filtered.filter(i => i.is_vegetarian);

  const handleAdd = async (item: MenuItem) => {
    await addItem(item as any, 1);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Menu</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-xl p-4 space-y-4 sticky top-24">
            <div>
              <label className="text-sm font-semibold mb-2 block">Search</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Search dishes..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="veg" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="veg" className="text-sm">Vegetarian Only</label>
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-2 block">Categories</h2>
              <div className="space-y-1">
                <Link href="/menu" className="block px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded">All</Link>
                {categoriesList.map(c => (
                  <Link key={c.id} href={`/menu?category=${c.name}`} className={`block px-3 py-1 text-sm rounded ${categories === c.name ? "bg-orange-100 text-orange-700 font-medium" : "hover:bg-gray-100"}`}>
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
            <div className="text-center py-12 text-gray-400">No items found</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
                  <Link href={`/menu/${item.id}`}>
                    <div className="h-40 bg-orange-100 flex items-center justify-center relative">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.name} width={160} height={128} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-5xl">{item.is_vegetarian ? "🥬" : "🍗"}</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <Link href={`/menu/${item.id}`} className="font-semibold hover:text-orange-600 transition">{item.name}</Link>
                      {item.is_vegetarian && <span className="text-green-500 text-xs bg-green-100 px-2 py-0.5 rounded">Veg</span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description || ""}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-orange-600 font-bold text-lg">₹{item.price}</span>
                      <button onClick={() => handleAdd(item)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {cartCount > 0 && (
            <div className="fixed bottom-6 right-6 bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg">
              <Link href="/cart" className="font-medium">{cartCount} item{cartCount > 1 ? "s" : ""} in cart →</Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
