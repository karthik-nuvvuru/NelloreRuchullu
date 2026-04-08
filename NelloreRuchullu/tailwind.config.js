/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        primary: {
          50: "#FFF1EC",
          100: "#FFE0D1",
          200: "#FFC3A6",
          300: "#FF9B6A",
          400: "#FF7A3D",
          500: "#FF4500", // Main fiery orange
          600: "#E85A2A",
          700: "#CC4921",
          800: "#B33818",
          900: "#992710",
        },
        // Gold Accent
        gold: {
          50: "#FFF9E6",
          100: "#FFF0C2",
          200: "#FFE299",
          300: "#FFD700", // Main gold
          400: "#E6C200",
          500: "#B39700",
          600: "#8C7500",
          700: "#665800",
          800: "#403C00",
          900: "#1A1800",
        },
        // Semantic Colors
        success: "#4CAF50",
        warning: "#FFC107",
        error: "#EF4444",
        info: "#3B82F6",
        // Dark Mode
        dark: {
          bg: "#0F0F0F",
          card: "#1A1A1A",
          text: "#FFFFFF",
          textSecondary: "#A0A0A0",
          border: "#2A2A2A",
        },
        // Light Mode
        light: {
          bg: "#FFF8F0",
          card: "#FFFFFF",
          text: "#1A1A1A",
          textSecondary: "#6B7280",
          border: "#E5E7EB",
        },
      },
      fontFamily: {
        sans: ["Poppins", "system-ui"],
        telugu: ["Noto Sans Telugu", "Poppins"],
      },
      fontSize: {
        h1: ["32px", { fontWeight: "700", lineHeight: "38px" }],
        h2: ["28px", { fontWeight: "700", lineHeight: "34px" }],
        h3: ["24px", { fontWeight: "600", lineHeight: "30px" }],
        h4: ["20px", { fontWeight: "600", lineHeight: "26px" }],
        h5: ["18px", { fontWeight: "600", lineHeight: "24px" }],
        body: ["16px", { fontWeight: "400", lineHeight: "24px" }],
        bodyBold: ["16px", { fontWeight: "500", lineHeight: "24px" }],
        caption: ["14px", { fontWeight: "400", lineHeight: "20px" }],
        small: ["12px", { fontWeight: "400", lineHeight: "16px" }],
      },
      spacing: {
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0px 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)",
        card: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        elevated: "0px 8px 24px rgba(0, 0, 0, 0.12)",
        inner: "inset 2px 2px 5px rgba(255, 255, 255, 0.3), inset -2px -2px 5px rgba(0, 0, 0, 0.1)",
        gold: "0px 4px 14px rgba(255, 215, 0, 0.3)",
        orange: "0px 4px 14px rgba(255, 69, 0, 0.3)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
