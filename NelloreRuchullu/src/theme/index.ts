// Theme configuration for NelloreRuchullu
export const theme = {
  colors: {
    primary: "#FF4500",
    primaryLight: "#FF6B35",
    primaryDark: "#CC3700",
    gold: "#FFD700",
    goldLight: "#FFE566",
    background: {
      light: "#FFF8F0",
      dark: "#0F0F0F",
    },
    card: {
      light: "#FFFFFF",
      dark: "#1A1A1A",
    },
    text: {
      light: "#1A1A1A",
      dark: "#FFFFFF",
      secondary: "#6B7280",
    },
    success: "#4CAF50",
    warning: "#FFC107",
    error: "#EF4444",
    info: "#3B82F6",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: "700" as const },
    h2: { fontSize: 28, fontWeight: "700" as const },
    h3: { fontSize: 24, fontWeight: "600" as const },
    h4: { fontSize: 20, fontWeight: "600" as const },
    h5: { fontSize: 18, fontWeight: "600" as const },
    body: { fontSize: 16, fontWeight: "400" as const },
    caption: { fontSize: 14, fontWeight: "400" as const },
    small: { fontSize: 12, fontWeight: "400" as const },
  },
  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 8,
    },
    gold: {
      shadowColor: "#FFD700",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
      elevation: 8,
    },
  },
};

// Dark mode toggle hook would go here in a real app
// For now, we'll use React Context or Zustand store
