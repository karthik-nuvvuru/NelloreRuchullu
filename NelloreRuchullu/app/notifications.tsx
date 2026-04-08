import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const NOTIFICATIONS = [
  {
    id: "1",
    type: "promo",
    title: "🎉 30% OFF Today!",
    message: "Use code NRCHULLU30 to get 30% off on your order",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "order",
    title: "Order Delivered",
    message: "Your order from Rayalaseema Delights has been delivered. Enjoy your meal!",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "promo",
    title: "Free Delivery",
    message: "Get free delivery on orders above ₹300. Limited time offer!",
    time: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "order",
    title: "Order Placed",
    message: "Your order #NRCH123 has been placed successfully",
    time: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "New Restaurant",
    message: "Nellore Spice Kitchen is now available! Check out their menu.",
    time: "3 days ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Notifications 🔔</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {NOTIFICATIONS.map((notification) => (
          <View
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.notificationUnread,
            ]}
          >
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              {!notification.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notificationMessage}>{notification.message}</Text>
            <Text style={styles.notificationTime}>{notification.time}</Text>
          </View>
        ))}
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
  notificationCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  notificationUnread: {
    borderColor: "#FF4500",
    backgroundColor: "#FFF8F0",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF4500",
  },
  notificationMessage: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});