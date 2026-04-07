'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MenuItem as MenuItemType } from '@/types';

interface MenuItemProps {
  item: MenuItemType;
}

export default function MenuItem({ item }: MenuItemProps) {
  return (
    <Link
      href={`/menu/${item.id}`}
      className={`group block rounded-xl border transition-all duration-200 hover:shadow-lg ${
        !item.isAvailable
          ? 'border-gray-200 opacity-60'
          : 'border-gray-200 hover:border-primary-200'
      }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gray-100">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              item.isVegetarian
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {item.isVegetarian ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        <div className="absolute bottom-2 left-2">
          <span className="inline-flex rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {item.category}
          </span>
        </div>

        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white px-4 py-1 text-sm font-semibold text-gray-900">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {item.rating && (
              <span className="flex items-center gap-0.5 text-sm text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {item.rating}
                {item.reviewCount && (
                  <span className="text-gray-400">({item.reviewCount})</span>
                )}
              </span>
            )}
          </div>

          <span className="text-lg font-bold text-primary-500">
            ₹{item.price.toFixed(2)}
          </span>
        </div>

        {item.prepTime && (
          <div className="mt-2 text-xs text-gray-400">
            {item.prepTime} min prep time
          </div>
        )}
      </div>
    </Link>
  );
}
