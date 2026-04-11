import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useUserStore, useOrderStore } from "../../src/store";
import { TRANSLATIONS } from "../../src/data/mockData";
import { ProtectedRoute } from "../../src/components/ProtectedRoute";

type Language = "en" | "te";

export default function ProfileScreen() {
  const [notifications, setNotifications] = useState(true);
  const user = useUserStore((state) => state.user);
  const language = useUserStore((state) => state.language);
  const toggleLanguage = useUserStore((state) => state.toggleLanguage);
  const logout = useUserStore((state) => state.logout);
  const orders = useOrderStore((state) => state.orders);

  const t = TRANSLATIONS[language];

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: "👤",
      label: t.profile.account,
      onPress: () => Alert.alert("Coming soon", "This feature is coming soon!"),
    },
    {
      icon: "📍",
      label: t.profile.addresses,
      onPress: () => Alert.alert("Coming soon", "This feature is coming soon!"),
    },
    {
      icon: "💳",
      label: t.profile.payment,
      onPress: () => Alert.alert("Coming soon", "This feature is coming soon!"),
    },
    {
      icon: "🔔",
      label: t.profile.notifications,
      type: "toggle" as const,
      value: notifications,
      onToggle: () => setNotifications(!notifications),
    },
    {
      icon: "🌐",
      label: "Language / భాష",
      type: "selector" as const,
      value: language,
      options: [
        { label: "English", value: "en" as Language },
        { label: "తెలుగు", value: "te" as Language },
      ],
      onSelect: () => toggleLanguage(),
    },
    {
      icon: "❓",
      label: t.profile.help,
      onPress: () => Alert.alert("Coming soon", "This feature is coming soon!"),
    },
    {
      icon: "📜",
      label: t.profile.terms,
      onPress: () => Alert.alert("Coming soon", "This feature is coming soon!"),
    },
    {
      icon: "🔒",
      label: t.profile.privacy,
      onPress: () => Alert.alert("Coming soon", "This feature is coming soon!"),
    },
  ];

  return (
    <ProtectedRoute>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || "👤"}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
              <Text style={styles.userPhone}>{user?.phone || "+91 9876543210"}</Text>
              <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{orders.length}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹0</Text>
              <Text style={styles.statLabel}>Wallet</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>⭐ 4.5</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
                disabled={item.type === "toggle" || item.type === "selector"}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.type === "selector" && (
                      <Text style={styles.menuValue}>
                        {language === "en" ? "English" : "తెలుగు"}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.menuItemRight}>
                  {item.type === "toggle" && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: "#E5E7EB", true: "#FFB4A0" }}
                      thumbColor={item.value ? "#FF4500" : "#FFFFFF"}
                    />
                  )}
                  {item.type === "selector" && (
                    <View style={styles.languageSelector}>
                      {item.options?.map((opt) => (
                        <Pressable
                          key={opt.value}
                          style={[
                            styles.langOption,
                            language === opt.value && styles.langOptionActive,
                          ]}
                          onPress={() => item.onSelect?.()}
                        >
                          <Text
                            style={[
                              styles.langOptionText,
                              language === opt.value && styles.langOptionTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                  {!item.type && <Text style={styles.menuArrow}>›</Text>}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Logout Button */}
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout / లాగ్ అవుట్</Text>
          </Pressable>

          {/* App Version */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>NelloreRuchullu v1.0.0</Text>
            <Text style={styles.footerSubtext}>Made with ❤️ in Nellore, AP</Text>
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FF4500",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  userPhone: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  menuSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  menuValue: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuArrow: {
    fontSize: 24,
    color: "#9CA3AF",
  },
  languageSelector: {
    flexDirection: "row",
    gap: 8,
  },
  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  langOptionActive: {
    backgroundColor: "#FF4500",
  },
  langOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  langOptionTextActive: {
    color: "#FFFFFF",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 16,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  footerSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
});