import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/political-quadrant/',
  server: {
    proxy: {
      '/instantdb': {
        target: 'https://api.instantdb.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/instantdb/, ''),
      },
    },
  },
})
