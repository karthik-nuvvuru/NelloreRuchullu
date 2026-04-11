import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { restaurants, categories, getPopularItems } from "../../src/data/mockData";
import { useCartStore } from "../../src/store";
import { SearchBar, RestaurantCard, FoodCard, CategoryChip, OfferCard } from "../../src/components";
import { useMealsByCategory, transformMealToMenuItem, Meal } from "../../src/hooks/useMealDB";

const { width } = Dimensions.get("window");

// Hyderabad coordinates for map
const HYDERABAD_COORDS = {
  latitude: 17.3850,
  longitude: 78.4867,
};

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  // MealDB API - Fetch chicken biryani meals
  const { meals, loading, error } = useMealsByCategory("Chicken");

  // Transform backend menu items to app format
  const apiMenuItems = meals.slice(0, 12).map((meal) => transformMealToMenuItem(meal));

  // Mock restaurants (from local data + MealDB images)
  const allRestaurants = restaurants.slice(0, 5).map((r, i) => ({
    ...r,
    image: meals[i]?.image || r.image,
  }));

  useEffect(() => {
    if (!loading) {
      // Small delay to ensure data is ready
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const popularItems = getPopularItems();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
    setIsLoading(false);
  }, []);

  const handleAddToCart = (item: any) => {
    const restaurant = restaurants[0] as any;
    addItem(item, restaurant);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Foodie! 👋</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>Koramanpally, Nellore</Text>
            <Text style={styles.locationArrow}>▼</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push("/notifications")} style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationBadge} />
        </Pressable>
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.initialLoadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF4500" />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Search restaurants, dishes..."
            onFocus={() => router.push("/(tabs)/search")}
          />
        </View>

        {/* Offers Carousel */}
        <View style={styles.offersSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { id: "o1", title: "30% OFF", description: "Use NRCHULLU30", code: "NRCHULLU30", color: "#FF4500" },
              { id: "o2", title: "FREE Delivery", description: "On orders above ₹300", code: "FREEDELIV", color: "#4CAF50" },
              { id: "o3", title: "₹100 OFF", description: "First order only", code: "FIRST100", color: "#3B82F6" },
            ]}
            renderItem={({ item }) => (
              <View style={styles.offerCardContainer}>
                <OfferCard
                  title={item.title}
                  description={item.description}
                  code={item.code}
                  color={item.color}
                />
              </View>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.offersContent}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>🍽️ Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                name={cat.name}
                emoji={cat.emoji}
                selected={selectedCategory === cat.id}
                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* API Loaded Dishes - MealDB */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🍛 Nellore Specials (Live API)</Text>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text style={styles.seeAllText}>See All →</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF4500" />
              <Text style={styles.loadingText}>Loading from TheMealDB API...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorEmoji}>⚠️</Text>
              <Text style={styles.errorText}>Failed to load dishes</Text>
              <Text style={styles.errorSubtext}>Showing local data instead</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={apiMenuItems}
              renderItem={({ item }) => (
                <View style={styles.popularCardContainer}>
                  <FoodCard
                    item={item}
                    onAddToCart={() => handleAddToCart(item)}
                    showAddButton={true}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>

        {/* Popular Items (Local Data) */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Popular Picks</Text>
            <Pressable onPress={() => router.push("/(tabs)/search")}>
              <Text style={styles.seeAllText}>See All →</Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularItems.slice(0, 6)}
            renderItem={({ item }) => {
              const restaurant = restaurants.find((r) => r.id === item.restaurantId);
              if (!restaurant) return null;
              return (
                <View style={styles.popularCardContainer}>
                  <FoodCard
                    item={item}
                    onAddToCart={() => addItem(item, restaurant)}
                    showAddButton={true}
                  />
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
          />
        </View>

        {/* Restaurants Near You */}
        <View style={styles.restaurantsSection}>
          <Text style={styles.sectionTitle}>🏪 Restaurants Near You</Text>
          {allRestaurants.map((restaurant) => (
            <View key={restaurant.id} style={styles.restaurantCardContainer}>
              <RestaurantCard
                restaurant={restaurant}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              />
            </View>
          ))}
        </View>

        {/* Hyderabad Location Banner */}
        <View style={styles.locationBanner}>
          <LinearGradient
            colors={["#FF4500", "#FF6B35"]}
            style={styles.locationBannerGradient}
          >
            <Text style={styles.locationBannerEmoji}>📍</Text>
            <View style={styles.locationBannerContent}>
              <Text style={styles.locationBannerTitle}>Serving Hyderabad & Nellore</Text>
              <Text style={styles.locationBannerSubtitle}>
                Live tracking at: {HYDERABAD_COORDS.latitude}°N, {HYDERABAD_COORDS.longitude}°E
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
      )}

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <Pressable
          style={styles.cartButton}
          onPress={() => router.push("/(tabs)/cart")}
        >
          <LinearGradient
            colors={["#FF4500", "#FF6B35"]}
            style={styles.cartButtonGradient}
          >
            <View style={styles.cartContent}>
              <View style={styles.cartIconContainer}>
                <Text style={styles.cartIcon}>🛒</Text>
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              </View>
              <Text style={styles.cartButtonText}>View Cart</Text>
              <Text style={styles.cartTotal}>
                ₹{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationIcon: {
    fontSize: 12,
  },
  location: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
  },
  locationArrow: {
    fontSize: 10,
    color: "#6B7280",
    marginLeft: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF4500",
  },
  initialLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  offersSection: {
    marginBottom: 16,
  },
  offersContent: {
    paddingHorizontal: 16,
  },
  offerCardContainer: {
    width: width * 0.7,
    marginRight: 12,
  },
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  popularSection: {
    marginBottom: 16,
  },
  popularCardContainer: {
    width: width * 0.45,
    marginRight: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF4500",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  errorContainer: {
    alignItems: "center",
    padding: 32,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    marginTop: 8,
  },
  errorSubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  restaurantsSection: {
    paddingBottom: 100,
  },
  restaurantCardContainer: {
    paddingHorizontal: 16,
  },
  locationBanner: {
    marginHorizontal: 16,
    marginBottom: 100,
  },
  locationBannerGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
  },
  locationBannerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  locationBannerContent: {
    flex: 1,
  },
  locationBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  locationBannerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  cartButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FF4500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cartContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartIconContainer: {
    position: "relative",
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFD700",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cartBadgeText: {
    color: "#1A1A1A",
    fontSize: 12,
    fontWeight: "700",
  },
  cartButtonText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  cartTotal: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
