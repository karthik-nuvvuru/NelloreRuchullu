"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api";

interface Category { id: string; name: string; image_url: string | null }
interface MenuItem { id: string; name: string; description: string | null; price: string; image_url: string | null; is_vegetarian: boolean }

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/menu/categories`).then(r => r.json()),
      fetch(`${API_BASE}/menu?per_page=8`).then(r => r.json()),
    ]).then(([cats, menuData]) => {
      setCategories(cats || []);
      setFeaturedItems(menuData?.items || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="relative h-[500px] bg-gradient-to-r from-orange-600 to-amber-500 flex items-center">
        <div className="max-w-6xl mx-auto px-6 text-white">
          <h1 className="text-5xl font-bold mb-4">Authentic Nellore Cuisine</h1>
          <p className="text-xl mb-8 text-orange-100">Taste the tradition, delivered to your door</p>
          <div className="flex gap-4">
            <Link href="/menu" className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition">
              Order Now
            </Link>
            <Link href="/auth/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/menu?category=${cat.id}`} className="group">
              <div className="bg-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition">
                <div className="h-32 bg-orange-200 flex items-center justify-center">
                  {cat.image_url ? (
                    <Image src={cat.image_url} alt={cat.name} width={128} height={128} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-4xl">{cat.name[0]}</span>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold group-hover:text-orange-600 transition">{cat.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Items</h2>
            <Link href="/menu" className="text-orange-600 font-semibold hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredItems.map((item) => (
              <Link key={item.id} href={`/menu/${item.id}`} className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition">
                <div className="h-40 bg-orange-100 flex items-center justify-center relative">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} width={160} height={128} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-5xl">{item.is_vegetarian ? "🥬" : "🍗"}</span>
                  )}
                  {item.is_vegetarian && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Veg</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  <p className="text-gray-500 text-sm mb-2 truncate">{item.description || ""}</p>
                  <p className="text-orange-600 font-bold">₹{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">About NelloreRuchullu</h2>
            <p className="text-gray-600 mb-4">We bring the authentic flavors of Nellore to your table. Our recipes have been passed down through generations, using traditional spices and cooking methods that make every bite a journey back home.</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">✓ Fresh ingredients daily</li>
              <li className="flex items-center gap-2">✓ Authentic Nellore recipes</li>
              <li className="flex items-center gap-2">✓ Fast delivery across the city</li>
              <li className="flex items-center gap-2">✓ Vegetarian & Non-vegetarian options</li>
            </ul>
          </div>
          <div className="bg-orange-100 rounded-2xl h-80 flex items-center justify-center">
            <span className="text-8xl">🍛</span>
          </div>
        </div>
      </section>
    </div>
  );
}
