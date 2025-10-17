import tailwindPostcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default {
  plugins: [
    // Use the new PostCSS adapter for Tailwind
    tailwindPostcss(),
    autoprefixer(),
  ],
};


