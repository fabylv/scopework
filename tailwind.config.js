/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#1E2530",
          amber: "#FFA12B",
          bg: "#FAF9F6",
          card: "#FFFFFF",
          muted: "#6B7280",
          border: "#E5E7EB",
          danger: "#EF4444",
          success: "#22C55E",
        },
      },
      fontFamily: {
        sans: ["Inter", "System"],
      },
    },
  },
  plugins: [],
};
