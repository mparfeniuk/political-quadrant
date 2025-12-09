import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isVercel = process.env.VERCEL === '1'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isVercel ? '/' : '/political-quadrant/',
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
