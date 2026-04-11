import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useUserStore } from "../src/store";
import { authApi } from "../src/lib/api";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});

  const login = useUserStore((state) => state.login);

  const validatePhone = (phoneNumber: string) => {
    return /^[6-9]\d{9}$/.test(phoneNumber.replace(/\D/g, ""));
  };

  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      setErrors({ phone: "Please enter a valid 10-digit Indian phone number." });
      return;
    }

    setLoading(true);
    try {
      await authApi.requestOtp("+91" + phone);
      setShowOtp(true);
      setErrors({});
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Please enter the 6-digit OTP." });
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyOtp("+91" + phone, otp);
      login({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        language: response.user.language || "en",
        avatar: response.user.avatar,
      });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* Back Button */}
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🍛</Text>
          <Text style={styles.logoText}>NelloreRuchullu</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back! 👋</Text>
          <Text style={styles.subtitle}>
            Login or sign up to order your favorite Nellore cuisine
          </Text>

          {!showOtp ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.phoneInput}>
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    maxLength={10}
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              <Pressable
                onPress={handleSendOtp}
                style={[styles.button, loading && styles.buttonDisabled]}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#FF4500", "#FF6B35"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="Enter 6-digit OTP"
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
                  }}
                  maxLength={6}
                  secureTextEntry
                />
                {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
                <Pressable onPress={() => setShowOtp(false)}>
                  <Text style={styles.changeNumber}>Change number</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleVerifyOtp}
                style={[styles.button, loading && styles.buttonDisabled]}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#FF4500", "#FF6B35"]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Verifying..." : "Verify & Login"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <Pressable style={styles.socialButton}>
            <Text style={styles.socialIcon}>G</Text>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </Pressable>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Create Account</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  keyboardView: {
    flex: 1,
  },
  backButton: {
    padding: 16,
  },
  backText: {
    fontSize: 16,
    color: "#FF4500",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logoEmoji: {
    fontSize: 48,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF4500",
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 8,
  },
  inputContainer: {
    marginTop: 32,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  phoneInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
  },
  countryCode: {
    fontSize: 16,
    color: "#1A1A1A",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: "#1A1A1A",
  },
  otpInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
  },
  changeNumber: {
    color: "#FF4500",
    marginTop: 8,
    textAlign: "right",
  },
  button: {
    marginTop: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#9CA3AF",
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#6B7280",
  },
  registerLink: {
    color: "#FF4500",
    fontWeight: "600",
  },
});
