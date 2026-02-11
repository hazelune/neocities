import { defineConfig } from 'vite'
import { relative, extname } from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: './',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
      emptyOutDir: true,
      rollupOptions: {
        input: Object.fromEntries(
          glob.sync('src/pages/**/*.html').map(file => [
            relative('src/pages', file.slice(0, file.length - extname(file).length)),
            fileURLToPath(new URL(file, import.meta.url))
          ])
        ),
      },
  },
})
