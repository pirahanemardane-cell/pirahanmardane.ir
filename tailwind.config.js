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
      fontSize: {
        // Material 3 Type Scale (px @ 16 root)
        'm3-display-lg': ['3.5625rem', { lineHeight: '4rem', fontWeight: '400', letterSpacing: '-0.0156em' }],
        'm3-display-md': ['2.8125rem', { lineHeight: '3.25rem', fontWeight: '400' }],
        'm3-display-sm': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '400' }],
        'm3-headline-lg': ['2rem', { lineHeight: '2.5rem', fontWeight: '400' }],
        'm3-headline-md': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '400' }],
        'm3-headline-sm': ['1.5rem', { lineHeight: '2rem', fontWeight: '400' }],
        'm3-title-lg': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '500' }],
        'm3-title-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '500', letterSpacing: '0.009375em' }],
        'm3-title-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500', letterSpacing: '0.00625em' }],
        'm3-body-lg': ['1rem', { lineHeight: '1.5rem', fontWeight: '400', letterSpacing: '0.009375em' }],
        'm3-body-md': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400', letterSpacing: '0.015625em' }],
        'm3-body-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '400', letterSpacing: '0.025em' }],
        'm3-label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500', letterSpacing: '0.00625em' }],
        'm3-label-md': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.03125em' }],
        'm3-label-sm': ['0.6875rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.03125em' }],
      },

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
