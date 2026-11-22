import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { tripflowServiceWorker } from './build/serviceWorkerPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tripflowServiceWorker()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_']
})
