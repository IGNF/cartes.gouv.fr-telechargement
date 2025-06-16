import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  base: '/telechargement/', // Ajoutez le base path ici
  plugins: [TanStackRouterVite({}), react()],
})
