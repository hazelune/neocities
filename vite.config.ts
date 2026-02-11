import { defineConfig } from 'vite'
import { resolve, relative, extname } from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src/pages',
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  build: {
      emptyOutDir: true,
      outDir: '../../dist',
      rollupOptions: {
        input: {
		main: resolve(__dirname, 'src/pages/index.html'),
		zoe: resolve(__dirname, 'src/pages/zoe.html'),
		...Object.fromEntries(
          		glob.sync('src/pages/**/*.html')
				.filter(file => !file.endsWith('index.html') && !file.endsWith('zoe.html'))
				.map(file => {
					const name = relative('src/pages', file.slice(0, file.length - extname(file).length))
					return [
						`pages/${name}`,
            					fileURLToPath(new URL(file, import.meta.url))
          				]
				}
				)
		)
	},
      },
  },
})
