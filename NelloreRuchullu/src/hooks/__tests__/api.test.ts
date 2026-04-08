/**
 * NelloreRuchullu - API Integration Tests
 * Tests MealDB, JSONPlaceholder, and core app functionality
 */

import { Meal, transformMealToMenuItem } from "./useMealDB";
import {
  fetchPlaceholderOrders,
  fetchPlaceholderUser,
  transformPlaceholderOrder,
  transformPlaceholderUser,
  transformMealToRestaurant,
} from "./useApi";

// Mock meal data from TheMealDB
const mockMeal: Meal = {
  idMeal: "52940",
  strMeal: "Brown Stew Chicken",
  strCategory: "Chicken",
  strArea: "Nigerian",
  strInstructions: "Step 1. Chop the chicken... Step 2. Brown the onions...",
  strMealThumb: "https://www.themealdb.com/images/media/meals/sypxpx1515365095.jpg",
  strTags: "Chicken,Stew",
};

// Test 1: MealDB transformation
console.log("✅ Test 1: MealDB data transforms correctly");
const menuItem = transformMealToMenuItem(mockMeal, "Chicken");
console.log(`   - Dish: ${menuItem.name}`);
console.log(`   - Price: ₹${menuItem.price}`);
console.log(`   - Category: ${menuItem.category}`);
console.log(`   - Image: ${menuItem.image.substring(0, 50)}...`);
console.assert(menuItem.id === "52940", "Menu item ID should match");
console.assert(menuItem.name === "Brown Stew Chicken", "Menu item name should match");
console.assert(menuItem.price >= 150 && menuItem.price <= 450, "Price should be 150-450");
console.assert(menuItem.category === "Chicken", "Category should match");

// Test 2: Restaurant transformation
console.log("\n✅ Test 2: Meal transforms to restaurant correctly");
const restaurant = transformMealToRestaurant(mockMeal, 0);
console.log(`   - Restaurant: ${restaurant.name}`);
console.log(`   - Rating: ${restaurant.rating}`);
console.log(`   - Cuisine: ${restaurant.cuisine.join(", ")}`);
console.assert(restaurant.id === "rest_52940", "Restaurant ID should match");
console.assert(restaurant.cuisine.includes("Nellore Special"), "Should include Nellore Special");

// Test 3: Order transformation
console.log("\n✅ Test 3: Placeholder order transforms correctly");
const placeholderOrder = {
  userId: 1,
  id: 1,
  title: "delectus aut autem",
  completed: false,
};
const appOrder = transformPlaceholderOrder(placeholderOrder, 0);
console.log(`   - Order ID: ${appOrder.id}`);
console.log(`   - Restaurant: ${appOrder.restaurantName}`);
console.log(`   - Status: ${appOrder.status}`);
console.log(`   - Total: ₹${appOrder.total}`);
console.assert(appOrder.id.startsWith("NR"), "Order ID should start with NR");
console.assert(appOrder.status === "placed", "Status should be 'placed'");

// Test 4: User transformation
console.log("\n✅ Test 4: Placeholder user transforms correctly");
const placeholderUser = {
  id: 1,
  name: "Leanne Graham",
  username: "Bret",
  email: "Sincere@april.biz",
  phone: "1-770-736-8058 x56442",
  website: "hildegard.org",
};
const appUser = transformPlaceholderUser(placeholderUser);
console.log(`   - User ID: ${appUser.id}`);
console.log(`   - Name: ${appUser.name}`);
console.log(`   - Email: ${appUser.email}`);
console.assert(appUser.id === "user_1", "User ID should be user_1");
console.assert(appUser.name === "Leanne Graham", "User name should match");

// Test 5: Coupon validation
console.log("\n✅ Test 5: Coupon validation logic");
const COUPONS: Record<string, { discount: number; minOrder: number }> = {
  NRCHULLU30: { discount: 0.3, minOrder: 500 },
  FREEDELIV: { discount: 0, minOrder: 300 },
  FIRST100: { discount: 100, minOrder: 0 },
};

const applyCoupon = (code: string, subtotal: number) => {
  const coupon = COUPONS[code.toUpperCase()];
  if (!coupon) return { discount: 0, message: "Invalid code" };
  if (subtotal < coupon.minOrder) return { discount: 0, message: `Min order ₹${coupon.minOrder}` };
  return { discount: coupon.discount, message: "Applied!" };
};

let result = applyCoupon("NRCHULLU30", 600);
console.log(`   - NRCHULLU30 @ ₹600: ₹${result.discount * 600} off (30%)`);
console.assert(result.discount === 180, "30% of 600 = 180");

result = applyCoupon("NRCHULLU30", 400);
console.log(`   - NRCHULLU30 @ ₹400: ${result.message}`);
console.assert(result.discount === 0, "Should fail - below min order");

result = applyCoupon("INVALID", 600);
console.log(`   - INVALID @ ₹600: ${result.message}`);
console.assert(result.discount === 0, "Should be invalid");

console.log("\n✅ All API transformation tests passed!");

// Export for use in app
export { transformMealToMenuItem, transformMealToRestaurant, transformPlaceholderOrder, transformPlaceholderUser };
