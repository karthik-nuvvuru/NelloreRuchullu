import { Redirect } from "expo-router";

export default function Root() {
  // Redirect to splash screen on app load
  return <Redirect href="/splash" />;
}