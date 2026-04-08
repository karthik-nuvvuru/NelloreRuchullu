// API hooks for NelloreRuchullu
import { useState, useEffect } from "react";

// TheMealDB API base
const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

// MealDB meal type
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

// Fetch meals by category (e.g., Chicken)
export function useMealsByCategory(category: string = "Chicken") {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${MEALDB_BASE}/filter.php?c=${category}`);
        const data = await response.json();
        setMeals(data.meals || []);
        setError(null);
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

// Search meals by name
export function useSearchMeals(query: string) {
  const [meals, setMeals] = useState<Meal[]>([]);
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
        const response = await fetch(`${MEALDB_BASE}/search.php?s=${encodeURIComponent(query)}`);
        const data = await response.json();
        setMeals(data.meals || []);
        setError(null);
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

// Get meal details by ID
export function useMealDetails(id: string) {
  const [meal, setMeal] = useState<Meal | null>(null);
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
        const response = await fetch(`${MEALDB_BASE}/lookup.php?i=${id}`);
        const data = await response.json();
        setMeal(data.meals?.[0] || null);
        setError(null);
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

// Transform MealDB meal to app format
export function transformMealToMenuItem(meal: Meal, category: string = "Chicken") {
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    description: meal.strInstructions?.substring(0, 100) + "..." || "",
    price: Math.floor(Math.random() * 300) + 150, // Random price between 150-450
    image: meal.strMealThumb || "",
    category: category,
    isVeg: false, // MealDB meals are mostly non-veg
    rating: 4.0 + Math.random(),
    prepTime: "30",
    popular: true,
  };
}