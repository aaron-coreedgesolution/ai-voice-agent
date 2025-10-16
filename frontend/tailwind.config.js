/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: "#2563eb", // blue-600
          secondary: "#64748b", // slate-500
        },
      },
    },
    plugins: [],
  };
  