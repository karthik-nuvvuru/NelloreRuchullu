import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  emoji: string;
  title: string;
  titleTelugu: string;
  subtitle: string;
  image: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    emoji: "🍛",
    title: "Authentic Nellore Cuisine",
    titleTelugu: "నెల్లూరు వంటకాలు",
    subtitle: "Taste the tradition delivered to your door. Home-style recipes passed down through generations.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600",
  },
  {
    id: 2,
    emoji: "🚴",
    title: "Real-Time Tracking",
    titleTelugu: "తక్షణ ట్రాకింగ్",
    subtitle: "Track your order from kitchen to doorstep. Know exactly when your food will arrive.",
    image: "https://images.unsplash.com/photo-1527661591475-527312dd1f9a?w=600",
  },
  {
    id: 3,
    emoji: "💳",
    title: "Secure Payments",
    titleTelugu: "సురక్షిత చెల్లింపులు",
    subtitle: "Pay your way with UPI, cards, or cash on delivery. Multiple options for your convenience.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
  },
];

export default function OnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.replace("/login");
    }
  };

  const handleSkip = () => {
    router.replace("/login");
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <Text style={styles.pageIndicator}>
          {currentSlide + 1}/{slides.length}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: slide.image }} style={styles.image} />
          <LinearGradient
            colors={["transparent", "#FFF8F0"]}
            style={styles.imageGradient}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.emoji}>{slide.emoji}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.titleTelugu}>{slide.titleTelugu}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        </View>
      </View>

      {/* Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentSlide > 0 && (
          <Pressable onPress={() => setCurrentSlide(currentSlide - 1)} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
        )}

        <Pressable onPress={handleNext} style={styles.nextButton}>
          <LinearGradient
            colors={["#FF4500", "#FF6B35"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: "#6B7280",
  },
  pageIndicator: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: height * 0.4,
    position: "relative",
  },
  image: {
    width: width,
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  textContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
  },
  titleTelugu: {
    fontSize: 20,
    color: "#FF4500",
    fontWeight: "600",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: "#FF4500",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 12,
  },
  backText: {
    fontSize: 16,
    color: "#FF4500",
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    marginLeft: "auto",
  },
  nextButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
