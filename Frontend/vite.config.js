import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: './public/manifest.json',
          dest: '.'  // Copy manifest.json to the root of dist
        }
      ]
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },

});
