import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#FFF8F0" },
            animation: "slide_from_right",
          }}
        >
          {/* Splash Screen */}
          <Stack.Screen name="splash" />

          {/* Onboarding */}
          <Stack.Screen name="onboarding" />

          {/* Auth Screens */}
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />

          {/* Main Tabs */}
          <Stack.Screen name="(tabs)" />

          {/* Restaurant Detail */}
          <Stack.Screen name="restaurant/[id]" />

          {/* Checkout */}
          <Stack.Screen name="checkout" />

          {/* Order Tracking */}
          <Stack.Screen name="track/[id]" />

          {/* Notifications */}
          <Stack.Screen name="notifications" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
