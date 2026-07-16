import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { adminPathsPlugin } from './vite-plugin-admin-paths.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), adminPathsPlugin()],
})
