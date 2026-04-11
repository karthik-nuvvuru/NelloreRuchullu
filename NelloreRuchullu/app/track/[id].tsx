import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOrderStore } from "../../src/store";
import { Badge } from "../../src/components";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";
import { orderApi, cartApi } from "../../src/lib/api";

type OrderStep = "placed" | "confirmed" | "preparing" | "outForDelivery" | "delivered";

const STEPS: { status: OrderStep; label: string; emoji: string }[] = [
  { status: "placed", label: "Order Placed", emoji: "📋" },
  { status: "confirmed", label: "Confirmed", emoji: "✅" },
  { status: "preparing", label: "Preparing", emoji: "👨‍🍳" },
  { status: "outForDelivery", label: "Out for Delivery", emoji: "🚴" },
  { status: "delivered", label: "Delivered", emoji: "🎉" },
];

export default function TrackOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orders = useOrderStore((state) => state.orders);
  const setCurrentOrder = useOrderStore((state) => state.setCurrentOrder);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    if (!order || reordering) return;
    setReordering(true);
    try {
      for (const item of order.items) {
        await cartApi.addItem({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        });
      }
      router.push("/cart");
    } catch (error) {
      console.error("Failed to reorder:", error);
    } finally {
      setReordering(false);
    }
  };

  // Fetch order from API on mount
  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setOrderError(null);
        const fetchedOrder = await orderApi.getById(id);
        setCurrentOrder(fetchedOrder as any);
      } catch (error) {
        setOrderError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fall back to store data if API failed
  const storeOrder = orders.find((o) => o.id === id);
  const order = storeOrder;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4500" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>📦</Text>
          <Text style={styles.notFoundText}>Order not found</Text>
          {orderError && <Text style={styles.errorText}>{orderError}</Text>}
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const eta = order.estimatedDelivery
    ? Math.max(0, Math.ceil((order.estimatedDelivery - currentTime) / 60000))
    : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "placed":
        return "#3B82F6";
      case "confirmed":
        return "#8B5CF6";
      case "preparing":
        return "#F59E0B";
      case "outForDelivery":
        return "#10B981";
      case "delivered":
        return "#2E7D32";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
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
            <Text style={styles.title}>Track Order</Text>
          </View>

        {/* ETA Banner */}
        {order.status !== "delivered" && order.status !== "cancelled" && eta !== null && (
          <View style={styles.etaBanner}>
            <View style={styles.etaContent}>
              <Text style={styles.etaEmoji}>⏱️</Text>
              <View>
                <Text style={styles.etaText}>
                  {eta > 0 ? `${eta} mins` : "Arriving soon!"}
                </Text>
                <Text style={styles.etaSubtext}>Estimated delivery</Text>
              </View>
            </View>
          </View>
        )}

        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.restaurantName}>{order.restaurantName}</Text>
            <Badge
              text={order.status.replace(/([A-Z])/g, " $1").trim()}
              color={getStatusColor(order.status)}
            />
          </View>
          <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderItems}>
            {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
          </Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>📍 Order Progress</Text>
          <View style={styles.stepsContainer}>
            {STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === STEPS.length - 1;

              return (
                <View key={step.status} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View
                      style={[
                        styles.stepCircle,
                        isCompleted && styles.stepCircleCompleted,
                        isCurrent && styles.stepCircleCurrent,
                      ]}
                    >
                      <Text style={styles.stepEmoji}>{step.emoji}</Text>
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          isCompleted && styles.stepLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelCurrent,
                      ]}
                    >
                      {step.label}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.stepTime}>
                        {order.status === "placed" && "Order received"}
                        {order.status === "confirmed" && "Restaurant confirmed"}
                        {order.status === "preparing" && "Chef is cooking"}
                        {order.status === "outForDelivery" && "Delivery partner on the way"}
                        {order.status === "delivered" && "Enjoy your meal!"}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>🏠 Delivery Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressName}>{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>💳 Payment Details</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Subtotal</Text>
              <Text style={styles.paymentValue}>₹{order.subtotal?.toFixed(2) || "0.00"}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Delivery Fee</Text>
              <Text style={styles.paymentValue}>
                {order.deliveryFee === 0 ? (
                  <Text style={styles.freeText}>FREE</Text>
                ) : (
                  `₹${order.deliveryFee?.toFixed(2) || "0.00"}`
                )}
              </Text>
            </View>
            <View style={styles.paymentDivider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentTotalLabel}>Total Paid</Text>
              <Text style={styles.paymentTotalValue}>₹{order.totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentDivider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method</Text>
              <Text style={styles.paymentValue}>
                {order.paymentMethod === "upi"
                  ? "UPI"
                  : order.paymentMethod === "card"
                  ? "Card"
                  : "Cash on Delivery"}
              </Text>
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Pressable style={styles.helpButton}>
            <Text style={styles.helpIcon}>📞</Text>
            <Text style={styles.helpText}>Need help with this order?</Text>
            <Text style={styles.helpArrow}>→</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      {order.status === "delivered" && (
        <View style={styles.bottomActions}>
          <Pressable style={styles.reorderButton} onPress={handleReorder} disabled={reordering}>
            {reordering ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.reorderText}>🔄 Reorder</Text>
            )}
          </Pressable>
          <Pressable style={styles.helpOrderButton}>
            <Text style={styles.helpOrderText}>Rate Order</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 8,
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
  etaBanner: {
    backgroundColor: "#FF4500",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  etaContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  etaEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  etaText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  etaSubtext: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  orderId: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: "#6B7280",
  },
  progressSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  stepsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  stepRow: {
    flexDirection: "row",
    minHeight: 60,
  },
  stepLeft: {
    width: 40,
    alignItems: "center",
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleCompleted: {
    backgroundColor: "#D1FAE5",
  },
  stepCircleCurrent: {
    backgroundColor: "#FF4500",
  },
  stepEmoji: {
    fontSize: 16,
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: "#10B981",
  },
  stepContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  stepLabel: {
    fontSize: 15,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  stepLabelCurrent: {
    color: "#1A1A1A",
    fontWeight: "700",
  },
  stepTime: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  addressSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  addressName: {
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  paymentSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  paymentDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  paymentTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF4500",
  },
  freeText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  helpSection: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  helpIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  helpText: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  helpArrow: {
    fontSize: 20,
    color: "#FF4500",
  },
  bottomActions: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  reorderButton: {
    flex: 1,
    backgroundColor: "#FF4500",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  reorderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  helpOrderButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  helpOrderText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "600",
  },
});