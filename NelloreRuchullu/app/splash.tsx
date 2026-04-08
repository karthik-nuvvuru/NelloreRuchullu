import { useEffect } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen() {
  const logoScale = new Animated.Value(0.8);
  const logoOpacity = new Animated.Value(0);

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={["#FF4500", "#FF6B35", "#FF8C5A"]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          },
        ]}
      >
        <Text style={styles.emoji}>🍛</Text>
        <Text style={styles.logoText}>NelloreRuchullu</Text>
        <Text style={styles.tagline}>రుచుల్లు</Text>
        <Text style={styles.subTagline}>Authentic Nellore Cuisine</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: logoOpacity }]}>
        <Text style={styles.footerText}>Premium Food Delivery</Text>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View style={styles.loadingProgress} />
          </View>
        </View>
      </Animated.View>

      {/* Auto-navigate to onboarding after 2.5 seconds */}
      <Link href="/onboarding" style={styles.skipLink} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  emoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFD700",
    marginTop: 4,
  },
  subTagline: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  loadingContainer: {
    marginTop: 20,
    width: 200,
  },
  loadingBar: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  loadingProgress: {
    height: "100%",
    width: "75%",
    backgroundColor: "#FFD700",
    borderRadius: 2,
  },
  skipLink: {
    position: "absolute",
    top: 60,
    right: 20,
  },
});
