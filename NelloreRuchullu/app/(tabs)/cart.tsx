import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useCartStore } from "../../src/store";
import { CartItem, Button, EmptyState } from "../../src/components";

const PROMO_CODES = {
  NRCHULLU30: 30,
  FREEDELIV: 0,
  FIRST100: 100,
};

export default function CartScreen() {
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 300 ? 0 : 40;
  const discount = appliedPromo && PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES]
    ? PROMO_CODES[appliedPromo as keyof typeof PROMO_CODES]
    : 0;
  const discountAmount = discount > 100 ? discount : subtotal * (discount / 100);
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (PROMO_CODES[code as keyof typeof PROMO_CODES] !== undefined) {
      setAppliedPromo(code);
      setPromoDiscount(PROMO_CODES[code as keyof typeof PROMO_CODES]);
      Alert.alert("Promo Applied!", `${code} has been applied to your order.`);
    } else {
      Alert.alert("Invalid Code", "Please enter a valid promo code.");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoDiscount(0);
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          emoji="🛒"
          title="Your cart is empty"
          subtitle="Add some delicious Nellore cuisine to get started!"
          actionLabel="Browse Restaurants"
          onAction={() => router.push("/(tabs)")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart 🛒</Text>
        <Pressable onPress={clearCart}>
          <Text style={styles.clearText}>Clear All</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsSection}>
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <Text style={styles.sectionTitle}>💰 Apply Promo Code</Text>
          {appliedPromo ? (
            <View style={styles.appliedPromo}>
              <View style={styles.appliedPromoInfo}>
                <Text style={styles.appliedPromoCode}>{appliedPromo}</Text>
                <Text style={styles.appliedPromoDesc}>
                  {promoDiscount > 10 ? `₹${promoDiscount} OFF` : `${promoDiscount}% OFF`}
                </Text>
              </View>
              <Pressable onPress={handleRemovePromo}>
                <Text style={styles.removePromoText}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.promoInputContainer}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor="#9CA3AF"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
              />
              <Pressable style={styles.applyButton} onPress={handleApplyPromo}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.hintText}>Try: NRCHULLU30, FREEDELIV, FIRST100</Text>
        </View>

        {/* Bill Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>📋 Bill Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              {deliveryFee === 0 ? (
                <Text style={styles.freeText}>FREE</Text>
              ) : (
                `₹${deliveryFee}`
              )}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.discountValue}>-₹{discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <Pressable onPress={handleCheckout}>
          <LinearGradient
            colors={["#FF4500", "#FF6B35"]}
            style={styles.checkoutButton}
          >
            <View style={styles.checkoutContent}>
              <View>
                <Text style={styles.checkoutLabel}>Proceed to Checkout</Text>
                <Text style={styles.checkoutSubtext}>{items.length} items • ₹{total.toFixed(2)}</Text>
              </View>
              <Text style={styles.checkoutArrow}>→</Text>
            </View>
          </LinearGradient>
        </Pressable>
      </View>
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  clearText: {
    fontSize: 14,
    color: "#FF4500",
    fontWeight: "600",
  },
  itemsSection: {
    paddingHorizontal: 16,
  },
  promoSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  promoInputContainer: {
    flexDirection: "row",
    gap: 8,
  },
  promoInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#1A1A1A",
  },
  applyButton: {
    backgroundColor: "#FF4500",
    borderRadius: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  hintText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
  },
  appliedPromo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appliedPromoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appliedPromoCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },
  appliedPromoDesc: {
    fontSize: 14,
    color: "#2E7D32",
  },
  removePromoText: {
    fontSize: 14,
    color: "#FF4500",
    fontWeight: "600",
  },
  summarySection: {
    paddingHorizontal: 16,
    marginTop: 24,
    paddingBottom: 120,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  freeText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  discountValue: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FF4500",
  },
  checkoutContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFF8F0",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  checkoutContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  checkoutLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  checkoutSubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  checkoutArrow: {
    fontSize: 24,
    color: "#FFFFFF",
  },
});