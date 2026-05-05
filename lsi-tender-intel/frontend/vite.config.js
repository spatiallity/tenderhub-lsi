import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — loaded first, cached aggressively
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],

          // Data-fetching — changes rarely
          'vendor-query': ['@tanstack/react-query'],

          // Supabase — large SDK, separate so it doesn't block the main bundle
          'vendor-supabase': ['@supabase/supabase-js'],

          // Recharts — only needed on Dashboard; split so other pages don't pay for it
          'vendor-recharts': ['recharts'],

          // Document generation — only needed on export actions
          'vendor-docs': ['jspdf', 'jspdf-autotable', 'xlsx'],

          // Utility libs
          'vendor-utils': ['axios', 'date-fns', 'lucide-react'],
        },
      },
    },
  },
})
