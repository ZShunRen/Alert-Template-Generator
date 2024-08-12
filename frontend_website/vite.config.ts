import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    outDir: "./dist",
    emptyOutDir: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Ensure Vite resolves these file types
  },
})
