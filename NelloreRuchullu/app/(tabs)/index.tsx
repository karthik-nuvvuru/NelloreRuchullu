import { useState } from "react";
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
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { restaurants, categories, getPopularItems } from "../../src/data/mockData";
import { useCartStore } from "../../src/store";
import { SearchBar, RestaurantCard, FoodCard, CategoryChip, OfferCard } from "../../src/components";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const popularItems = getPopularItems();
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
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
            onFocus={() => router.push("/search")}
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

        {/* Popular Items */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Popular Picks</Text>
            <Pressable onPress={() => router.push("/search")}>
              <Text style={styles.seeAllText}>See All →</Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularItems}
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
          {restaurants.slice(0, 5).map((restaurant) => (
            <View key={restaurant.id} style={styles.restaurantCardContainer}>
              <RestaurantCard
                restaurant={restaurant}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <Pressable
          style={styles.cartButton}
          onPress={() => router.push("/cart")}
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
  restaurantsSection: {
    paddingBottom: 100,
  },
  restaurantCardContainer: {
    paddingHorizontal: 16,
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
