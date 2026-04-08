import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { restaurants, menuItems, categories } from "../../src/data/mockData";
import { RestaurantCard, FoodCard, CategoryChip } from "../../src/components";
import { useCartStore } from "../../src/store";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"rating" | "delivery" | "price">("rating");
  const addItem = useCartStore((state) => state.addItem);

  const filteredRestaurants = useMemo(() => {
    let results = restaurants;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.cuisine.toLowerCase().includes(query) ||
          r.menu.some((itemId) => {
            const item = menuItems.find((m) => m.id === itemId);
            return item?.name.toLowerCase().includes(query);
          })
      );
    }

    if (selectedCategory) {
      results = results.filter((r) => r.category === selectedCategory);
    }

    switch (sortBy) {
      case "rating":
        return [...results].sort((a, b) => b.rating - a.rating);
      case "delivery":
        return [...results].sort((a, b) => a.deliveryTime.localeCompare(b.deliveryTime));
      case "price":
        return [...results].sort((a, b) => a.priceForTwo - b.priceForTwo);
      default:
        return results;
    }
  }, [searchQuery, selectedCategory, sortBy]);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const query = searchQuery.toLowerCase();
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleAddToCart = (item: typeof menuItems[0]) => {
    const restaurant = restaurants.find((r) => r.id === item.restaurantId);
    if (restaurant) {
      addItem(item, restaurant);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search dishes or restaurants..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>
        <Pressable style={styles.filterButton} onPress={() => {}}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* Quick Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {["rating", "delivery", "price"].map((sort) => (
          <Pressable
            key={sort}
            style={[styles.sortChip, sortBy === sort && styles.sortChipActive]}
            onPress={() => setSortBy(sort as typeof sortBy)}
          >
            <Text style={[styles.sortChipText, sortBy === sort && styles.sortChipTextActive]}>
              {sort === "rating" ? "⭐ Top Rated" : sort === "delivery" ? "⚡ Fast Delivery" : "💰 Low Price"}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Results (Dishes) */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍴 Dish Results</Text>
            {searchResults.map((item) => {
              const restaurant = restaurants.find((r) => r.id === item.restaurantId);
              if (!restaurant) return null;
              return (
                <View key={item.id} style={styles.dishResultContainer}>
                  <FoodCard
                    item={item}
                    onAddToCart={() => handleAddToCart(item)}
                    showAddButton={true}
                  />
                </View>
              );
            })}
          </View>
        )}

        {/* Restaurant Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            🏪 Restaurants ({filteredRestaurants.length})
          </Text>
          {filteredRestaurants.map((restaurant) => (
            <View key={restaurant.id} style={styles.restaurantContainer}>
              <RestaurantCard
                restaurant={restaurant}
                onPress={() => router.push(`/restaurant/${restaurant.id}`)}
              />
            </View>
          ))}
        </View>

        {filteredRestaurants.length === 0 && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching for something else
            </Text>
          </View>
        )}
      </ScrollView>
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
  },
  clearIcon: {
    fontSize: 16,
    color: "#9CA3AF",
    padding: 4,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterIcon: {
    fontSize: 20,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sortChipActive: {
    backgroundColor: "#FF4500",
    borderColor: "#FF4500",
  },
  sortChipText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  sortChipTextActive: {
    color: "#FFFFFF",
  },
  categoriesContainer: {
    maxHeight: 50,
    marginTop: 12,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  section: {
    marginTop: 24,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dishResultContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  restaurantContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
  },
});