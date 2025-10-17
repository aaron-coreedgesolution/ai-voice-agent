import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6d28d9',
          50: '#f6f0ff',
          100: '#efe6ff',
          200: '#dfccff',
          300: '#c29bff',
          400: '#a269ff',
          500: '#6d28d9',
          600: '#5b21b6',
          700: '#471a8e',
          800: '#351266',
          900: '#230a3e',
        },
        accent: {
          DEFAULT: '#06b6d4',
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
    },
  },
  plugins: [],
};

export default config;
