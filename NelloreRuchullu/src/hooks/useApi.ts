// API services for NelloreRuchullu
import { Meal } from "./useMealDB";

// JSONPlaceholder base
const JSONPLACEHOLDER_BASE = "https://jsonplaceholder.typicode.com";

// Types for orders
export interface PlaceholderOrder {
  userId: number;
  id?: number;
  title: string;
  completed: boolean;
}

export interface PlaceholderUser {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

// Fetch orders from JSONPlaceholder (simulating order history)
export async function fetchPlaceholderOrders(userId: number = 1): Promise<PlaceholderOrder[]> {
  try {
    const response = await fetch(`${JSONPLACEHOLDER_BASE}/users/${userId}/todos`);
    const data = await response.json();
    return data.slice(0, 10); // Return first 10 as "orders"
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

// Fetch users from JSONPlaceholder (simulating user profiles)
export async function fetchPlaceholderUsers(): Promise<PlaceholderUser[]> {
  try {
    const response = await fetch(`${JSONPLACEHOLDER_BASE}/users`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

// Fetch single user
export async function fetchPlaceholderUser(id: number): Promise<PlaceholderUser | null> {
  try {
    const response = await fetch(`${JSONPLACEHOLDER_BASE}/users/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

// Transform placeholder order to app order format
export function transformPlaceholderOrder(order: PlaceholderOrder, index: number) {
  const statuses = ["placed", "confirmed", "preparing", "outForDelivery", "delivered"] as const;
  const restaurants = [
    "Nellore Kitchen",
    "Rayalaseema Flavors",
    "Spice Garden",
    "Biryani Point",
    "Royal Biryani"
  ];
  const status = order.completed ? "delivered" : statuses[index % statuses.length];

  return {
    id: `NR${order.id || index + 100}`,
    restaurantName: restaurants[index % restaurants.length],
    status,
    total: Math.floor(Math.random() * 400) + 200,
    items: [
      { id: "1", name: "Chicken Biryani", price: 349, quantity: 1 },
      { id: "2", name: "Gongura Chicken", price: 279, quantity: 1 },
    ],
    placedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: Date.now() + 45 * 60 * 1000,
  };
}

// Transform placeholder user to app user format
export function transformPlaceholderUser(user: PlaceholderUser) {
  return {
    id: `user_${user.id}`,
    name: user.name,
    email: user.email,
    phone: user.phone,
    language: "en" as const,
  };
}

// Transform MealDB meal to restaurant format
export function transformMealToRestaurant(meal: Meal, index: number): any {
  const cuisines = ["Nellore", "Biryani", "South Indian", "Andhra", "Rayalaseema"];
  const deliveryTimes = ["30", "35", "40", "45", "50"];
  const ratings = [4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8];

  return {
    id: `rest_${meal.idMeal}`,
    name: meal.strArea ? `${meal.strArea} Kitchen` : `Restaurant ${index + 1}`,
    image: meal.strMealThumb || "",
    rating: ratings[index % ratings.length],
    deliveryTime: deliveryTimes[index % deliveryTimes.length],
    cuisine: [cuisines[index % cuisines.length], "Biryani", "Nellore Special"],
    priceRange: "₹200 for two",
    isVeg: false,
    offer: index % 2 === 0 ? "30% OFF" : "FREE Delivery",
    distance: `${(Math.random() * 3 + 0.5).toFixed(1)} km`,
  };
}