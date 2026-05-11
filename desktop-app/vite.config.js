// Vite configuration for the Electron desktop app React frontend.
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true
  }
});
