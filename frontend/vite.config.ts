import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const rootDir = import.meta.dirname ?? path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    proxy: {
      '/webhook': {
        target: 'https://dev.boldsolution.com.br',
        changeOrigin: true,
        secure: true,
      },
      '/webhook-site-api': {
        target: 'https://webhook.site',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/webhook-site-api/, ''),
      },
    },
  },
})
