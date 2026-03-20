import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const securityHeaders = {
  // Block third-party iframe embedding (clickjacking protection)
  'X-Frame-Options': 'DENY',
  // Modern replacement for X-Frame-Options
  'Content-Security-Policy': "frame-ancestors 'none'",
  // Cross-origin isolation headers
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.js', 'server/**/*.test.js'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
  },
  server: {
    headers: securityHeaders,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
})
