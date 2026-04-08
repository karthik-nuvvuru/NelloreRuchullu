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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = useUserStore((state) => state.register);

  const validatePhone = (phoneNumber: string) => {
    return /^[6-9]\d{9}$/.test(phoneNumber.replace(/\D/g, ""));
  };

  const validateEmail = (emailAddress: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  };

  const handleSendOtp = async () => {
    if (!name.trim()) {
      Alert.alert("Invalid Name", "Please enter your full name.");
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit Indian phone number.");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    setShowOtp(true);
    Alert.alert("OTP Sent", "OTP has been sent to your phone number.");
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    register({
      id: "user_" + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: "+91" + phone,
      language: "en",
    });

    router.replace("/(tabs)");
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

            {!showOtp ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    keyboardType="default"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.phoneInput}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                      maxLength={10}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
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
                    onChangeText={setOtp}
                    maxLength={6}
                    secureTextEntry
                  />
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