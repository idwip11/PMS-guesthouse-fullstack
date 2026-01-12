/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // Royal Blue
        secondary: "#0EA5E9", // Sky Blue
        accent: "#F97316", // Orange
        "background-light": "#F3F4F6", // Slate 100
        "background-dark": "#0F172A", // Slate 900
        "surface-light": "rgba(255, 255, 255, 0.7)",
        "surface-dark": "rgba(30, 41, 59, 0.7)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
