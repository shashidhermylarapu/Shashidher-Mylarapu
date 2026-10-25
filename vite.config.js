import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // keep the heavy 3D/physics libraries in their own cacheable chunks
        manualChunks: { three: ['three'], motion: ['gsap', 'lenis', 'matter-js'] },
      },
    },
  },
})
