// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// 👇 1. Agregamos @ts-ignore para que TypeScript ignore la falta de tipos aquí (TS2307)
// @ts-ignore
import tailwindcss from '@tailwindcss/vite' 
import * as path from 'path'

export default defineConfig({
  plugins: [
    react(), 
    // 2. Mantenemos el 'as any' para el error de sobrecarga de tipos
    tailwindcss() as any 
  ], 
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})