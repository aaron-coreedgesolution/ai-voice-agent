// Resilient PostCSS config for Vite/Tailwind
// Tries the new @tailwindcss/postcss adapter first, falls back to legacy tailwindcss
// This helps on environments where the adapter isn't installed yet.
const autoprefixer = require('autoprefixer');

function loadTailwind() {
  try {
    // New PostCSS adapter for Tailwind
    const adapter = require('@tailwindcss/postcss');
    return adapter();
  } catch (e) {
    // Fallback to legacy tailwindcss plugin (if present)
    try {
      const tailwind = require('tailwindcss');
      return tailwind;
    } catch (err) {
      console.error('Could not load @tailwindcss/postcss or tailwindcss. Please install one of them.');
      throw err;
    }
  }
}

module.exports = {
  plugins: [
    loadTailwind(),
    autoprefixer(),
  ],
};
