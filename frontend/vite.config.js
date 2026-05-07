import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    },
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    }
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`,
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'vendor-router';
          if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
          if (id.includes('xlsx')) return 'vendor-xlsx';
          if (id.includes('docx') || id.includes('file-saver')) return 'vendor-docx';
          if (id.includes('jspdf')) return 'vendor-jspdf';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (id.includes('@tanstack')) return 'vendor-query';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('date-fns')) return 'vendor-datefns';
          if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react';
          return undefined;
        },
      }
    }
  }
})
