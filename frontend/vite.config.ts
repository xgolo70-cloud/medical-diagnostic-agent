/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - essential, loads first
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          
          // Animations - large, can be lazy loaded
          'animations': ['framer-motion', 'gsap'],
          
          // MUI - very large, split into core and icons
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          'mui-icons': ['@mui/icons-material'],
          
          // Utilities
          'icons': ['lucide-react'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'data': ['@tanstack/react-query', 'axios'],
          'state': ['@reduxjs/toolkit', 'react-redux'],
          'pdf': ['jspdf', 'html2canvas'],
        },
      },
    },
    // Adjust warning limit for better visibility
    chunkSizeWarningLimit: 500,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
