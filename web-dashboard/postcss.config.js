// PostCSS configuration for Tailwind in the browser dashboard.
module.exports = {
  plugins: [
    require('postcss-nesting'),
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};
