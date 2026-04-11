import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { restaurants, menuItems } from "../../src/data/mockData";
import { useCartStore } from "../../src/store";
import { FoodCard, Badge } from "../../src/components";
import { restaurantApi, menuApi } from "../../src/lib/api";

const { width } = Dimensions.get("window");

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"menu" | "info">("menu");
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItemsList, setMenuItemsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  // Fetch restaurant from API on mount
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const restaurantData = await restaurantApi.getById(id);
        setRestaurant(restaurantData);

        // Fetch menu items for this restaurant
        const menuData = await menuApi.getAll({ limit: 100 });
        const filteredMenu = menuData.items.filter(
          (item: any) => item.restaurantId === id || !item.restaurantId
        );
        setMenuItemsList(filteredMenu);
      } catch (err) {
        setError("Failed to load restaurant");
        // Fall back to mock data
        const mockRestaurant = restaurants.find((r) => r.id === id);
        setRestaurant(mockRestaurant || null);
        const mockMenu = menuItems.filter((item) => item.restaurantId === id);
        setMenuItemsList(mockMenu);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantData();
  }, [id]);

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Loading restaurant...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFoundText}>Restaurant not found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = (item: (typeof menuItemsList)[0]) => {
    addItem(item, restaurant);
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: restaurant.image }} style={styles.headerImage} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.headerGradient}
        />
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>
            {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(" • ") : restaurant.cuisine}
          </Text>
          <View style={styles.headerMeta}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {restaurant.rating}</Text>
            </View>
            <Text style={styles.deliveryTime}>🚴 {restaurant.deliveryTime} mins</Text>
            {restaurant.priceRange && (
              <Text style={styles.priceForTwo}>💰 {restaurant.priceRange}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Restaurant Info Pills */}
      <View style={styles.infoPills}>
        <Badge text={restaurant.isVeg ? "Pure Veg" : "Non-Veg"} color={restaurant.isVeg ? "#2E7D32" : "#EF4444"} />
        {restaurant.offer && (
          <View style={styles.infoPill}>
            <Text style={styles.infoPillText}>🔥 {restaurant.offer}</Text>
          </View>
        )}
        {restaurant.distance && (
          <View style={styles.infoPill}>
            <Text style={styles.infoPillText}>📍 {restaurant.distance}</Text>
          </View>
        )}
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "menu" && styles.tabActive]}
          onPress={() => setActiveTab("menu")}
        >
          <Text style={[styles.tabText, activeTab === "menu" && styles.tabTextActive]}>
            🍴 Menu
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "info" && styles.tabActive]}
          onPress={() => setActiveTab("info")}
        >
          <Text style={[styles.tabText, activeTab === "info" && styles.tabTextActive]}>
            ℹ️ Info
          </Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === "menu" ? (
          <View style={styles.menuSection}>
            {/* Popular Items */}
            {menuItemsList.filter((item) => item.popular).length > 0 && (
              <View style={styles.menuCategory}>
                <Text style={styles.categoryTitle}>⭐ Popular Items</Text>
                <View style={styles.menuGrid}>
                  {menuItemsList
                    .filter((item) => item.popular)
                    .map((item) => (
                      <View key={item.id} style={styles.menuItemWrapper}>
                        <FoodCard
                          item={item}
                          onAddToCart={() => handleAddToCart(item)}
                          showAddButton={true}
                        />
                      </View>
                    ))}
                </View>
              </View>
            )}

            {/* Starters */}
            {menuItemsList.filter((item) => item.category === "starters").length > 0 && (
              <View style={styles.menuCategory}>
                <Text style={styles.categoryTitle}>🥗 Starters</Text>
                <View style={styles.menuList}>
                  {menuItemsList
                    .filter((item) => item.category === "starters")
                    .map((item) => (
                      <View key={item.id} style={styles.menuItemWrapper}>
                        <FoodCard
                          item={item}
                          onAddToCart={() => handleAddToCart(item)}
                          showAddButton={true}
                          variant="list"
                        />
                      </View>
                    ))}
                </View>
              </View>
            )}

            {/* Main Course */}
            {menuItemsList.filter((item) => item.category === "main course").length > 0 && (
              <View style={styles.menuCategory}>
                <Text style={styles.categoryTitle}>🍛 Main Course</Text>
                <View style={styles.menuList}>
                  {menuItemsList
                    .filter((item) => item.category === "main course")
                    .map((item) => (
                      <View key={item.id} style={styles.menuItemWrapper}>
                        <FoodCard
                          item={item}
                          onAddToCart={() => handleAddToCart(item)}
                          showAddButton={true}
                          variant="list"
                        />
                      </View>
                    ))}
                </View>
              </View>
            )}

            {/* Biryani */}
            {menuItemsList.filter((item) => item.category === "biryani").length > 0 && (
              <View style={styles.menuCategory}>
                <Text style={styles.categoryTitle}>🍚 Biryani</Text>
                <View style={styles.menuList}>
                  {menuItemsList
                    .filter((item) => item.category === "biryani")
                    .map((item) => (
                      <View key={item.id} style={styles.menuItemWrapper}>
                        <FoodCard
                          item={item}
                          onAddToCart={() => handleAddToCart(item)}
                          showAddButton={true}
                          variant="list"
                        />
                      </View>
                    ))}
                </View>
              </View>
            )}

            {/* Beverages */}
            {menuItemsList.filter((item) => item.category === "beverages").length > 0 && (
              <View style={styles.menuCategory}>
                <Text style={styles.categoryTitle}>🥤 Beverages</Text>
                <View style={styles.menuList}>
                  {menuItemsList
                    .filter((item) => item.category === "beverages")
                    .map((item) => (
                      <View key={item.id} style={styles.menuItemWrapper}>
                        <FoodCard
                          item={item}
                          onAddToCart={() => handleAddToCart(item)}
                          showAddButton={true}
                          variant="list"
                        />
                      </View>
                    ))}
                </View>
              </View>
            )}

            <View style={styles.menuFooter} />
          </View>
        ) : (
          <View style={styles.infoSection}>
            {/* Address */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>📍 Address</Text>
              <Text style={styles.infoCardContent}>{restaurant.address || "Koramanpally, Nellore, AP"}</Text>
            </View>

            {/* Timings */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>🕐 Timings</Text>
              <Text style={styles.infoCardContent}>{restaurant.timings || "10:00 AM - 10:00 PM"}</Text>
            </View>

            {/* Info */}
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>ℹ️ About</Text>
              <Text style={styles.infoCardContent}>
                {restaurant.name} is a renowned cloud kitchen serving authentic Nellore cuisine with fresh ingredients and traditional recipes passed down through generations.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  notFoundText: {
    fontSize: 18,
    color: "#6B7280",
  },
  backLink: {
    fontSize: 16,
    color: "#FF4500",
    marginTop: 12,
  },
  headerImageContainer: {
    height: 220,
    position: "relative",
  },
  headerImage: {
    width: width,
    height: "100%",
    resizeMode: "cover",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
  },
  headerContent: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  ratingBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  deliveryTime: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  priceForTwo: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  infoPills: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  infoPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoPillText: {
    fontSize: 13,
    color: "#6B7280",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tabActive: {
    backgroundColor: "#FF4500",
    borderColor: "#FF4500",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  menuSection: {
    paddingBottom: 100,
  },
  menuCategory: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  menuList: {
    gap: 12,
  },
  menuItemWrapper: {
    width: "100%",
  },
  menuFooter: {
    height: 40,
  },
  infoSection: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  infoCardContent: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
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