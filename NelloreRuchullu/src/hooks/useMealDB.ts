// Meal/Hotel hooks using real NelloreRuchullu backend
import { useState, useEffect, useCallback } from "react";
import { menuApi, fetchCategories as getCategories } from "../lib/api";
import type { MenuItem } from "../lib/api";

// Fetch meals by category from real backend
export function useMealsByCategory(category: string = "Biryani") {
  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await menuApi.getAll({ category, limit: 50 });
        setMeals(result.items);
      } catch (err) {
        setError("Failed to fetch meals");
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [category]);

  return { meals, loading, error };
}

// Search meals by name from real backend
export function useSearchMeals(query: string) {
  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setMeals([]);
      return;
    }

    const searchMeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await menuApi.getAll({ search: query, limit: 20 });
        setMeals(result.items);
      } catch (err) {
        setError("Failed to search meals");
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchMeals, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return { meals, loading, error };
}

// Get meal details by ID from real backend
export function useMealDetails(id: string) {
  const [meal, setMeal] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMealDetails = async () => {
      if (!id) {
        setMeal(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await menuApi.getById(id);
        setMeal(result);
      } catch (err) {
        setError("Failed to fetch meal details");
        setMeal(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetails();
  }, [id]);

  return { meal, loading, error };
}

// Transform backend menu item to app format
export function transformMealToMenuItem(meal: MenuItem) {
  return {
    id: meal.id,
    name: meal.name,
    description: meal.description || "",
    price: meal.price,
    image: meal.image || "",
    category: meal.category,
    isVeg: meal.isVeg,
    rating: meal.rating || 4.2,
    prepTime: meal.prepTime || "30",
    popular: meal.popular || false,
  };
}

// Meal type for backwards compatibility
export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  [key: string]: string | null;
}
