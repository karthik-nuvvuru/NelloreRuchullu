import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useCartStore, useOrderStore } from "../src/store";
import { ProtectedRoute } from "../src/components/ProtectedRoute";
import { orderApi, addressApi } from "../src/lib/api";
import type { Address } from "../src/lib/api";

type PaymentMethod = "upi" | "card" | "cod";

export default function CheckoutScreen() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const { items, clearCart } = useCartStore();
  const addOrder = useOrderStore((state) => state.addOrder);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 300 ? 0 : 40;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const fetchedAddresses = await addressApi.getAll();
        setAddresses(fetchedAddresses);
        const defaultAddr = fetchedAddresses.find((a) => a.isDefault) || fetchedAddresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const addressId = selectedAddressId || "default_address";

      // Call the backend API to create order
      const createdOrder = await orderApi.create({
        items: items.map((item) => ({
          menuItemId: item.menuItemId || item.id,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        addressId,
        paymentMethod,
      });

      // Create local order representation for the store
      const taxAmount = Math.round(subtotal * 0.05);
      const localOrder = {
        id: createdOrder.id,
        restaurantId: items[0]?.restaurantId || "",
        restaurantName: items[0]?.restaurantName || "",
        items: items.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        taxAmount,
        deliveryFee,
        totalAmount: total,
        status: "placed" as const,
        deliveryAddress: "Koramanpally, Nellore",
        paymentMethod,
        paymentStatus: "pending" as const,
        createdAt: Date.now(),
        estimatedDelivery: Date.now() + 45 * 60 * 1000,
      };

      addOrder(localOrder);
      clearCart();

      Alert.alert(
        "Order Placed! 🎉",
        "Your order has been placed successfully. You can track it in the Orders tab.",
        [
          {
            text: "Track Order",
            onPress: () => router.replace(`/track/${createdOrder.id}`),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Order Failed",
        error instanceof Error ? error.message : "Failed to place order. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
            <Text style={styles.title}>Checkout</Text>
          </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
          {loadingAddresses ? (
            <ActivityIndicator size="small" color="#FF4500" />
          ) : addresses.length === 0 ? (
            <View style={styles.addressCard}>
              <Text style={styles.addressText}>No saved addresses. Your delivery address will be used.</Text>
            </View>
          ) : (
            addresses.map((addr) => (
              <Pressable
                key={addr.id}
                style={[
                  styles.addressCard,
                  selectedAddressId === addr.id && styles.addressCardSelected,
                ]}
                onPress={() => setSelectedAddressId(addr.id)}
              >
                <View style={styles.addressRadioRow}>
                  <View style={[styles.radio, selectedAddressId === addr.id && styles.radioActive]}>
                    {selectedAddressId === addr.id && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.addressName}>{addr.label}</Text>
                </View>
                <Text style={styles.addressText}>{addr.fullAddress}</Text>
              </Pressable>
            ))
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Order Summary</Text>
          <View style={styles.orderCard}>
            {items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <View style={styles.orderItemLeft}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemQty}>x{item.quantity}</Text>
                </View>
                <Text style={styles.orderItemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
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
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          <View style={styles.paymentOptions}>
            <Pressable
              style={[
                styles.paymentOption,
                paymentMethod === "upi" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("upi")}
            >
              <View style={styles.paymentOptionLeft}>
                <Text style={styles.paymentIcon}>📱</Text>
                <View>
                  <Text style={styles.paymentLabel}>UPI</Text>
                  <Text style={styles.paymentDesc}>Google Pay, PhonePe, Paytm</Text>
                </View>
              </View>
              <View style={[styles.radio, paymentMethod === "upi" && styles.radioActive]}>
                {paymentMethod === "upi" && <View style={styles.radioInner} />}
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.paymentOption,
                paymentMethod === "card" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("card")}
            >
              <View style={styles.paymentOptionLeft}>
                <Text style={styles.paymentIcon}>💳</Text>
                <View>
                  <Text style={styles.paymentLabel}>Card</Text>
                  <Text style={styles.paymentDesc}>Credit/Debit Card</Text>
                </View>
              </View>
              <View style={[styles.radio, paymentMethod === "card" && styles.radioActive]}>
                {paymentMethod === "card" && <View style={styles.radioInner} />}
              </View>
            </Pressable>

            <Pressable
              style={[
                styles.paymentOption,
                paymentMethod === "cod" && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod("cod")}
            >
              <View style={styles.paymentOptionLeft}>
                <Text style={styles.paymentIcon}>💵</Text>
                <View>
                  <Text style={styles.paymentLabel}>Cash on Delivery</Text>
                  <Text style={styles.paymentDesc}>Pay when you receive</Text>
                </View>
              </View>
              <View style={[styles.radio, paymentMethod === "cod" && styles.radioActive]}>
                {paymentMethod === "cod" && <View style={styles.radioInner} />}
              </View>
            </Pressable>
          </View>
        </View>

        {/* Safety Note */}
        <View style={styles.safetyNote}>
          <Text style={styles.safetyIcon}>🔒</Text>
          <Text style={styles.safetyText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalRowLabel}>Total to Pay</Text>
          <Text style={styles.totalRowValue}>₹{total.toFixed(2)}</Text>
        </View>
        <Pressable
          onPress={handlePlaceOrder}
          disabled={isProcessing || items.length === 0}
        >
          <LinearGradient
            colors={isProcessing ? ["#9CA3AF", "#6B7280"] : ["#FF4500", "#FF6B35"]}
            style={styles.placeOrderButton}
          >
            <Text style={styles.placeOrderText}>
              {isProcessing ? "Processing..." : `Place Order • ₹${total.toFixed(2)}`}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
    </ProtectedRoute>
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
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backText: {
    fontSize: 16,
    color: "#FF4500",
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  addressCardSelected: {
    borderColor: "#FF4500",
    backgroundColor: "#FFF5F0",
  },
  addressRadioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioActive: {
    borderColor: "#FF4500",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF4500",
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderItemName: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  orderItemQty: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  orderItemPrice: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  freeText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF4500",
  },
  paymentOptions: {
    gap: 12,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  paymentOptionActive: {
    borderColor: "#FF4500",
    backgroundColor: "#FFF5F0",
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentIcon: {
    fontSize: 28,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  paymentDesc: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  safetyNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  safetyIcon: {
    fontSize: 16,
  },
  safetyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalRowLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  totalRowValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  placeOrderButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  placeOrderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});