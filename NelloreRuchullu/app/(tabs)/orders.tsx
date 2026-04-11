import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useOrderStore, useUserStore, Order } from "../../src/store";
import { EmptyState, Badge } from "../../src/components";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";
import { orderApi } from "../../src/lib/api";
import type { Order as ApiOrder, OrderItem as ApiOrderItem } from "../../src/lib/api";

type OrderStatus = "active" | "completed" | "cancelled";

export default function OrdersScreen() {
  const [filter, setFilter] = useState<OrderStatus>("active");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const orders = useOrderStore((state) => state.orders);
  const setOrders = useOrderStore((state) => state.setOrders);
  const appendOrders = useOrderStore((state) => state.appendOrders);
  const user = useUserStore((state) => state.user);

  // Transform API order to store order
  const transformApiOrder = (apiOrder: ApiOrder): Order => {
    const statusMap: Record<string, Order["status"]> = {
      PENDING: "placed",
      CONFIRMED: "confirmed",
      PREPARING: "preparing",
      READY_FOR_PICKUP: "preparing",
      OUT_FOR_DELIVERY: "outForDelivery",
      DELIVERED: "delivered",
      CANCELLED: "cancelled",
    };

    const apiStatus = apiOrder.status;
    const storeStatus = statusMap[apiStatus] || "placed";

    return {
      id: apiOrder.id,
      restaurantId: "",
      restaurantName: apiOrder.deliveryAddress?.fullAddress || "Nellore Ruchullu",
      items: apiOrder.items.map((item: ApiOrderItem) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.unitPrice,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
      })),
      subtotal: apiOrder.subtotal,
      taxAmount: apiOrder.taxAmount,
      deliveryFee: apiOrder.deliveryFee,
      totalAmount: apiOrder.totalAmount,
      status: storeStatus,
      deliveryAddress: apiOrder.deliveryAddress?.fullAddress || "",
      paymentMethod: apiOrder.paymentMethod,
      paymentStatus: apiOrder.paymentStatus,
      createdAt: new Date(apiOrder.createdAt).getTime(),
      estimatedDelivery: new Date(apiOrder.createdAt).getTime() + 45 * 60 * 1000,
    };
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await orderApi.getAll({ page: 1, limit: 20 });
        const transformedOrders = response.orders.map(transformApiOrder);
        setOrders(transformedOrders);
        setPage(1);
        setHasMore(transformedOrders.length === 20);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const loadMoreOrders = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await orderApi.getAll({ page: nextPage, limit: 20 });
      const transformedOrders = response.orders.map(transformApiOrder);
      appendOrders(transformedOrders);
      setPage(nextPage);
      setHasMore(transformedOrders.length === 20);
    } catch (error) {
      console.error("Failed to load more orders:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "active") {
      return ["placed", "confirmed", "preparing", "outForDelivery"].includes(order.status);
    } else if (filter === "completed") {
      return order.status === "delivered";
    } else {
      return order.status === "cancelled";
    }
  });

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

  const getStatusText = (status: string) => {
    switch (status) {
      case "placed":
        return "Order Placed";
      case "confirmed":
        return "Confirmed";
      case "preparing":
        return "Preparing";
      case "outForDelivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getETAText = (order: typeof orders[0]) => {
    if (order.status === "delivered") return "Delivered";
    if (order.estimatedDelivery) {
      const mins = Math.ceil((order.estimatedDelivery - Date.now()) / 60000);
      return mins > 0 ? `${mins} mins` : "Arriving soon";
    }
    return "";
  };

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Orders 📋</Text>
          {user && (
            <Text style={styles.userGreeting}>Hi, {user?.name?.split(" ")?.[0] || "User"}!</Text>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(["active", "completed", "cancelled"] as OrderStatus[]).map((status) => (
            <Pressable
              key={status}
              style={[styles.filterTab, filter === status && styles.filterTabActive]}
              onPress={() => setFilter(status)}
            >
              <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
                {status === "active" ? "🟢 Active" : status === "completed" ? "✅ Completed" : "❌ Cancelled"}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF4500" />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              emoji={filter === "active" ? "📦" : filter === "completed" ? "✅" : "❌"}
              title={filter === "active" ? "No active orders" : filter === "completed" ? "No completed orders" : "No cancelled orders"}
              subtitle={
                filter === "active"
                  ? "Your active orders will appear here"
                  : "Past orders will be shown here"
              }
              actionLabel="Order Now"
              onAction={() => router.push("/(tabs)")}
            />
          ) : (
            <View style={styles.ordersList}>
              {filteredOrders.map((order) => (
                <Pressable
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => router.push(`/track/${order.id}`)}
                >
                  {/* Restaurant Info */}
                  <View style={styles.restaurantRow}>
                    <Text style={styles.restaurantEmoji}>🏪</Text>
                    <Text style={styles.restaurantName}>{order.restaurantName}</Text>
                  </View>

                  {/* Order Items */}
                  <Text style={styles.orderItems}>
                    {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                  </Text>

                  {/* Order Meta */}
                  <View style={styles.orderMeta}>
                    <View style={styles.metaLeft}>
                      <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                    </View>
                    <View style={styles.metaRight}>
                      <Text style={styles.orderTotal}>₹{order.totalAmount.toFixed(2)}</Text>
                      <Badge
                        text={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                      />
                    </View>
                  </View>

                  {/* ETA for active orders */}
                  {filter === "active" && order.estimatedDelivery && (
                    <View style={styles.etaContainer}>
                      <Text style={styles.etaIcon}>⏱️</Text>
                      <Text style={styles.etaText}>{getETAText(order)}</Text>
                    </View>
                  )}

                  {/* View Details */}
                  <View style={styles.viewDetails}>
                    <Text style={styles.viewDetailsText}>View Details →</Text>
                  </View>
                </Pressable>
              ))}
              {hasMore && (
                <Pressable
                  style={styles.loadMoreButton}
                  onPress={loadMoreOrders}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color="#FF4500" />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More</Text>
                  )}
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  userGreeting: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterTabActive: {
    backgroundColor: "#FF4500",
    borderColor: "#FF4500",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  ordersList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadMoreButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF4500",
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  restaurantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  orderItems: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  orderMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orderId: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  orderDate: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  metaRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  etaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  etaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  etaText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4500",
  },
  viewDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF4500",
    textAlign: "center",
  },
});