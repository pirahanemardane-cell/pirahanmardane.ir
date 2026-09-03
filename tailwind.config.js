/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IRANYekanX"', "sans-serif"],
      },
      colors: {
        primary: {
          50: "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          300: "var(--color-primary-300)",
          400: "var(--color-primary-400)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          800: "var(--color-primary-800)",
          900: "var(--color-primary-900)",
          950: "var(--color-primary-950)",
        },
        "apple-blue": "var(--color-apple-blue)",
        "apple-blue-link": "var(--color-apple-blue-link)",
        "apple-blue-dark": "var(--color-apple-blue-dark)",
        "apple-blue-hover": "var(--color-apple-blue-hover)",
        "grok-orange": "var(--color-grok-orange)",
        "grok-orange-hover": "var(--color-grok-orange-hover)",
      },
    },
  },
  plugins: [],
};
