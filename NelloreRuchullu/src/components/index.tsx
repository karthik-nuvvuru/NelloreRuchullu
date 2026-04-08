import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Badge Component
interface BadgeProps {
  text: string;
  color?: string;
  textColor?: string;
}

export function Badge({ text, color = "#FF4500", textColor = "#FFFFFF" }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

// Button Component
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ title, onPress, variant = "primary", disabled = false }: ButtonProps) {
  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return { backgroundColor: "#FFD700", borderWidth: 0 };
      case "ghost":
        return { backgroundColor: "transparent" };
      case "outline":
        return { backgroundColor: "transparent", borderWidth: 2, borderColor: "#FF4500" };
      default:
        return { backgroundColor: "#FF4500" };
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, getVariantStyle(), disabled && styles.buttonDisabled]}
    >
      <Text style={[styles.buttonText, variant === "secondary" && styles.buttonTextSecondary]}>
        {title}
      </Text>
    </Pressable>
  );
}

// Food Card Component
interface FoodCardProps {
  item: {
    id: string;
    name: string;
    price: number;
    image: string;
    rating?: number;
    isVeg: boolean;
    description?: string;
    prepTime?: string;
    popular?: boolean;
  };
  onAddToCart: () => void;
  onPress?: () => void;
  showAddButton?: boolean;
  variant?: "grid" | "list";
}

export function FoodCard({
  item,
  onAddToCart,
  onPress,
  showAddButton = true,
  variant = "grid",
}: FoodCardProps) {
  return (
    <View style={[styles.foodCard, variant === "list" && styles.foodCardList]}>
      <Pressable onPress={onPress}>
        <Image source={{ uri: item.image }} style={styles.foodCardImage} />
        <View style={[styles.vegBadge, { backgroundColor: item.isVeg ? "#2E7D32" : "#EF4444" }]}>
          <Text style={styles.vegBadgeText}>{item.isVeg ? "V" : "N"}</Text>
        </View>
        {item.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularBadgeText}>POPULAR</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.foodCardContent}>
        <Text style={styles.foodCardName} numberOfLines={1}>{item.name}</Text>
        {item.description && (
          <Text style={styles.foodCardDesc} numberOfLines={1}>{item.description}</Text>
        )}

        <View style={styles.foodCardFooter}>
          <Text style={styles.foodCardPrice}>₹{item.price}</Text>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {item.rating}</Text>
            </View>
          )}
        </View>

        {showAddButton && (
          <Pressable style={styles.addButton} onPress={onAddToCart}>
            <Text style={styles.addButtonText}>ADD +</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// Restaurant Card Component
interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    image: string;
    rating: number;
    deliveryTime: string;
    cuisine: string[];
    priceRange?: string;
    isVeg?: boolean;
    offer?: string;
    distance?: string;
  };
  onPress: () => void;
}

export function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  return (
    <Pressable style={styles.restaurantCard} onPress={onPress}>
      <View style={styles.restaurantImageContainer}>
        <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
        {restaurant.offer && (
          <View style={styles.restaurantOfferBadge}>
            <Text style={styles.restaurantOfferText}>{restaurant.offer}</Text>
          </View>
        )}
        {restaurant.isVeg !== undefined && (
          <View style={[styles.vegBadge, { backgroundColor: restaurant.isVeg ? "#2E7D32" : "#EF4444" }]}>
            <Text style={styles.vegBadgeText}>{restaurant.isVeg ? "V" : "N"}</Text>
          </View>
        )}
      </View>

      <View style={styles.restaurantContent}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>⭐ {restaurant.rating}</Text>
          </View>
        </View>

        <Text style={styles.restaurantCuisine}>
          {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(" • ") : restaurant.cuisine}
        </Text>

        <View style={styles.restaurantMeta}>
          <Text style={styles.restaurantMetaText}>⏱️ {restaurant.deliveryTime}</Text>
          {restaurant.priceRange && (
            <Text style={styles.restaurantMetaText}>💰 {restaurant.priceRange}</Text>
          )}
          {restaurant.distance && (
            <Text style={styles.restaurantMetaText}>📍 {restaurant.distance}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// Offer Card Component
interface OfferCardProps {
  title: string;
  description: string;
  code?: string;
  color?: string;
}

export function OfferCard({ title, description, code, color = "#FF4500" }: OfferCardProps) {
  return (
    <LinearGradient
      colors={[color, `${color}CC`]}
      style={styles.offerCard}
    >
      <Text style={styles.offerEmoji}>🎉</Text>
      <View style={styles.offerContent}>
        <Text style={styles.offerTitle}>{title}</Text>
        <Text style={styles.offerDescription}>{description}</Text>
        {code && (
          <View style={styles.offerCodeContainer}>
            <Text style={styles.offerCodeText}>{code}</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

// Cart Item Component
interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemContent}>
        <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.quantitySelector}>
        <Pressable
          onPress={() => item.quantity > 1 ? onUpdateQuantity(item.quantity - 1) : onRemove()}
          style={styles.quantityButton}
        >
          <Text style={styles.quantityButtonText}>{item.quantity > 1 ? "−" : "🗑️"}</Text>
        </Pressable>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <Pressable
          onPress={() => onUpdateQuantity(item.quantity + 1)}
          style={[styles.quantityButton, styles.quantityButtonAdd]}
        >
          <Text style={[styles.quantityButtonText, styles.quantityButtonTextAdd]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

// CartItem alias for backwards compatibility
export { CartItemComponent as CartItem };

// Search Bar Component
interface SearchBarProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  value?: string;
  onFocus?: () => void;
}

export function SearchBar({ placeholder = "Search...", onChangeText, value, onFocus }: SearchBarProps) {
  return (
    <View style={styles.searchBar}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        onChangeText={onChangeText}
        value={value}
        onFocus={onFocus}
      />
    </View>
  );
}

// Category Chip Component
interface CategoryChipProps {
  name: string;
  emoji: string;
  selected?: boolean;
  onPress: () => void;
}

export function CategoryChip({ name, emoji, selected = false, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.categoryChip, selected && styles.categoryChipSelected]}
    >
      <Text style={styles.categoryChipEmoji}>{emoji}</Text>
      <Text style={[styles.categoryChipText, selected && styles.categoryChipTextSelected]}>
        {name}
      </Text>
    </Pressable>
  );
}

// Quantity Selector Component
interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantitySelector({ quantity, onIncrement, onDecrement }: QuantitySelectorProps) {
  return (
    <View style={styles.quantitySelectorContainer}>
      <Pressable onPress={onDecrement} style={styles.qsButton}>
        <Text style={styles.qsButtonText}>−</Text>
      </Pressable>
      <Text style={styles.qsText}>{quantity}</Text>
      <Pressable onPress={onIncrement} style={[styles.qsButton, styles.qsButtonActive]}>
        <Text style={[styles.qsButtonText, styles.qsButtonTextActive]}>+</Text>
      </Pressable>
    </View>
  );
}

// Empty State Component
interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Pressable style={styles.emptyButton} onPress={onAction}>
          <Text style={styles.emptyButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

// Loading Skeleton Component
interface SkeletonProps {
  width?: number | string;
  height?: number | string;
}

export function Skeleton({ width = "100%", height = 20 }: SkeletonProps) {
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoad(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.skeleton, { width: width as number, height: height as number }, load && styles.skeletonLoading]} />
  );
}

// Section Header Component
interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      {actionLabel && (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionHeaderAction}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Button
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextSecondary: {
    color: "#1A1A1A",
  },

  // Food Card
  foodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  foodCardList: {
    flexDirection: "row",
    padding: 12,
  },
  foodCardImage: {
    width: "100%",
    height: 140,
    objectFit: "cover",
  },
  foodCardContent: {
    padding: 12,
  },
  vegBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  vegBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  popularBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#FF4500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  popularBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  foodCardName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  foodCardDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  foodCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  foodCardPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FF4500",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FF4500",
    fontSize: 13,
    fontWeight: "600",
  },

  // Restaurant Card
  restaurantCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  restaurantImageContainer: {
    position: "relative",
  },
  restaurantImage: {
    width: "100%",
    height: 160,
    objectFit: "cover",
  },
  restaurantOfferBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#FF4500",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  restaurantOfferText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  restaurantContent: {
    padding: 14,
  },
  restaurantHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  restaurantCuisine: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  restaurantMeta: {
    flexDirection: "row",
    marginTop: 10,
    gap: 16,
  },
  restaurantMetaText: {
    fontSize: 13,
    color: "#6B7280",
  },

  // Offer Card
  offerCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  offerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  offerDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  offerCodeContainer: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  offerCodeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "monospace",
  },

  // Cart Item
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    objectFit: "cover",
  },
  cartItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4500",
    marginTop: 2,
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonAdd: {
    backgroundColor: "#FF4500",
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  quantityButtonTextAdd: {
    color: "#FFFFFF",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginHorizontal: 12,
  },

  // Search Bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
  },

  // Category Chip
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    marginRight: 10,
  },
  categoryChipSelected: {
    backgroundColor: "#FF4500",
  },
  categoryChipEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },

  // Quantity Selector
  quantitySelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  qsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  qsButtonActive: {
    backgroundColor: "#FF4500",
  },
  qsButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  qsButtonTextActive: {
    color: "#FFFFFF",
  },
  qsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginHorizontal: 14,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: "#FF4500",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Skeleton
  skeleton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  skeletonLoading: {
    opacity: 0.6,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sectionHeaderAction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4500",
  },
});