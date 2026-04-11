"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/SkeletonLoader";

interface Category { id: string; name: string; image_url: string | null }
interface MenuItem { id: string; name: string; description: string | null; price: string; image_url: string | null; is_vegetarian: boolean; is_available?: boolean }

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<Category[]>('/menu/categories'),
      apiFetch<{ items: MenuItem[] }>('/menu', { params: { per_page: 8 } }),
    ]).then(([cats, menuData]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setFeaturedItems(Array.isArray(menuData?.items) ? menuData.items : []);
      setError(null);
    }).catch(() => {
      setError("Failed to load menu data. Please refresh.");
      setCategories([]);
      setFeaturedItems([]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center mx-6">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold hover:text-red-900">×</button>
        </div>
      )}
      {/* Hero */}
      <section className="relative min-h-[400px] md:h-[500px] bg-gradient-to-r from-orange-600 to-amber-500 flex items-center">
        <div className="max-w-6xl mx-auto px-6 text-white w-full">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Authentic Nellore Cuisine</h1>
          <p className="text-lg md:text-xl mb-6 md:mb-8 text-orange-100">Taste the tradition, delivered to your door</p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/menu"
              className="bg-white text-orange-600 px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Order Now
            </Link>
            <Link
              href="/auth/register"
              className="border-2 border-white text-white px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 w-full">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Browse Categories</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl overflow-hidden">
                <div className="h-32 bg-gray-200 animate-shimmer" />
                <div className="p-4 text-center"><div className="h-4 w-16 mx-auto bg-gray-200 rounded animate-shimmer" /></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No categories available</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/menu?category=${encodeURIComponent(cat.name)}`} className="group">
                <div className="bg-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-28 md:h-32 bg-orange-200 flex items-center justify-center">
                    {cat.image_url ? (
                      <Image src={cat.image_url} alt={cat.name} width={128} height={128} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-4xl">{cat.name?.[0] || '🍽️'}</span>
                    )}
                  </div>
                  <div className="p-3 md:p-4 text-center">
                    <h3 className="font-semibold group-hover:text-orange-600 transition-colors truncate">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Items */}
      <section className="bg-gray-50 py-10 md:py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Items</h2>
            <Link href="/menu" className="text-orange-600 font-semibold hover:underline">View All →</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow">
                  <div className="h-36 md:h-40 bg-gray-200 animate-shimmer" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-shimmer" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded animate-shimmer" />
                    <div className="h-5 w-16 bg-gray-200 rounded animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No items available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredItems.map((item) => (
                <Link key={item.id} href={`/menu/${item.id}`} className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
                  <div className="h-36 md:h-40 bg-orange-100 flex items-center justify-center relative">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} width={160} height={128} className="object-cover w-full h-full" />
                    ) : (
                      <span className="text-5xl">{item.is_vegetarian ? "🥬" : "🍗"}</span>
                    )}
                    {item.is_vegetarian && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded">Veg</span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold mb-1 truncate">{item.name}</h3>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">{item.description || ""}</p>
                    <p className="text-orange-600 font-bold">₹{item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-6 py-10 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">About NelloreRuchullu</h2>
            <p className="text-gray-600 mb-4">We bring the authentic flavors of Nellore to your table. Our recipes have been passed down through generations, using traditional spices and cooking methods that make every bite a journey back home.</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">✓ Fresh ingredients daily</li>
              <li className="flex items-center gap-2">✓ Authentic Nellore recipes</li>
              <li className="flex items-center gap-2">✓ Fast delivery across the city</li>
              <li className="flex items-center gap-2">✓ Vegetarian & Non-vegetarian options</li>
            </ul>
          </div>
          <div className="bg-orange-100 rounded-2xl h-64 md:h-80 flex items-center justify-center order-first md:order-last">
            <span className="text-7xl md:text-8xl">🍛</span>
          </div>
        </div>
      </section>
    </div>
  );
}
