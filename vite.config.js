import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'block-direct-source-access',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const isSourceFile = url.includes('/src/') || url.endsWith('.jsx') || url.endsWith('.tsx') || url.includes('package.json') || url.includes('vite.config.js');
          const isDirectNavigation = req.headers['sec-fetch-dest'] === 'document';
          if (isSourceFile && isDirectNavigation) {
            res.statusCode = 403;
            res.end('Forbidden: Direct access to source files is restricted.');
            return;
          }
          next();
        });
      }
    }
  ],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    host: true,
    allowedHosts: 'all',
    fs: { strict: true },
    proxy: {
      '/api': {
        target: 'https://connect-backend-1-varc.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'https://connect-backend-1-varc.onrender.com',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'react-icons', 'recharts', 'react-hot-toast'],
          'vendor-utils': ['axios', 'canvas-confetti', 'date-fns', 'socket.io-client', 'clsx', 'tailwind-merge'],
          'supabase-core': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
