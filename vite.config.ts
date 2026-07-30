import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/dont-trust-anyone/',
  plugins: [react()],
})
