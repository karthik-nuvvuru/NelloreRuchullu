import { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Link, Redirect } from "expo-router";
import { useUserStore } from "./src/store";

export default function Root() {
  const user = useUserStore((state) => state.user);

  // For now, redirect to onboarding
  // In a real app, you'd check if user has completed onboarding
  return <Redirect href="/splash" />;
}