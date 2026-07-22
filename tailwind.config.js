/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          dark:    "#1A1F2E",   // deep navy
          darker:  "#12161F",   // near-black
          amber:   "#F59E0B",   // warm amber
          "amber-light": "#FCD34D",
          bg:      "#F8F7F4",   // warm off-white
          card:    "#FFFFFF",
          muted:   "#64748B",
          border:  "#E2E8F0",
          danger:  "#EF4444",
          success: "#10B981",
          info:    "#3B82F6",
        },
      },
    },
  },
  plugins: [],
};
