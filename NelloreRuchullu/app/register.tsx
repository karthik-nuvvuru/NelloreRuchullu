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
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useUserStore } from "../src/store";
import { authApi } from "../src/lib/api";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string; otp?: string }>({});

  const register = useUserStore((state) => state.register);

  const validatePhone = (phoneNumber: string) => {
    return /^[6-9]\d{9}$/.test(phoneNumber.replace(/\D/g, ""));
  };

  const validateEmail = (emailAddress: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  };

  const handleSendOtp = async () => {
    const newErrors: { phone?: string; email?: string } = {};
    if (!validatePhone(phone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian phone number.";
    }
    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
      // Check if user has a valid name (not "User" or empty)
      if (!response.user.name || response.user.name === "User" || response.user.name === "") {
        setPendingUser(response.user);
        setShowNamePrompt(true);
        setShowOtp(false);
      } else {
        register({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          language: response.user.language || "en",
          avatar: response.user.avatar,
        });
        router.replace("/(tabs)");
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!name.trim()) {
      setErrors({ name: "Please enter your name." });
      return;
    }

    if (!pendingUser) return;

    setLoading(true);
    try {
      // Update profile with the name
      await authApi.updateProfile({ name: name.trim() });
      register({
        id: pendingUser.id,
        name: name.trim(),
        email: pendingUser.email,
        phone: pendingUser.phone,
        language: pendingUser.language || "en",
        avatar: pendingUser.avatar,
      });
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Failed to complete registration");
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
          <Text style={styles.logoText}>Join NelloreRuchullu</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account 👋</Text>
            <Text style={styles.subtitle}>
              Sign up to explore authentic Nellore cuisine
            </Text>

            {!showOtp && !showNamePrompt ? (
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

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    autoCapitalize="none"
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
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
            ) : showNamePrompt ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Enter Your Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    keyboardType="default"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    autoFocus
                  />
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <Pressable
                  onPress={handleCompleteRegistration}
                  style={[styles.button, loading && styles.buttonDisabled]}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={["#FF4500", "#FF6B35"]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? "Completing..." : "Complete Registration"}
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
                      {loading ? "Creating Account..." : "Create Account"}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </>
            )}

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.push("/login")}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
    fontSize: 20,
    fontWeight: "600",
    color: "#FF4500",
    marginTop: 8,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
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
    marginTop: 24,
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
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1A1A1A",
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
  phoneInputField: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: "#1A1A1A",
  },
  otpInput: {
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
    marginTop: 32,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: "#6B7280",
  },
  loginLink: {
    color: "#FF4500",
    fontWeight: "600",
  },
});