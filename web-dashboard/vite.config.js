// Vite configuration for the browser dashboard.
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: true
  }
});
