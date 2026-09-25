import path from 'node:path'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'

const contentDir = path.resolve(import.meta.dirname, '../content')

export default defineConfig({
  // GitHub Pages serves the site under /<repo-name>/; the deploy workflow sets BASE_PATH
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm] }) },
    react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),
    tailwindcss(),
    {
      // content/ sits outside the app root; watch it so new lessons appear without restarting
      name: 'watch-content',
      configureServer(server) {
        server.watcher.add(contentDir)
      },
    },
  ],
  resolve: {
    // content/*.mdx lives outside the app folder, so force these to resolve from app/node_modules
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@content': contentDir,
    },
  },
  server: { fs: { allow: [path.resolve(import.meta.dirname, '..')] } },
})
