import path from 'node:path'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

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
    // Installable PWA + offline service worker. Paths are relative so they work under any BASE_PATH.
    // The SW is only built for production; main.tsx registers it (not in dev).
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      // public/ icons and favicon are precached by globPatterns below
      includeManifestIcons: false,
      manifest: {
        id: './',
        name: 'AdamLearns',
        short_name: 'AdamLearns',
        description: 'Free interactive science and maths lessons and labs: IB MYP first, mapped to CBSE/NCERT. Progress stays on your device.',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#5761d8',
        background_color: '#f9fdfc',
        categories: ['education'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Home', short_name: 'Home', description: 'Your next lesson and subjects', url: './', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Labs', short_name: 'Labs', description: 'Interactive virtual labs', url: './labs', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Progress', short_name: 'Progress', description: 'XP, badges and mastered topics', url: './progress', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Review', short_name: 'Review', description: 'Spaced-repetition review', url: './review', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // Precache the app itself (pages, components, styles, fonts) so it opens offline. Lessons, practice
        // sets and labs (hundreds of files) are cached the first time each is opened instead, which keeps the
        // first visit light on phones; "Save everything for offline" in Settings fetches the rest on request.
        // KaTeX also ships .woff/.ttf fallbacks; every browser that runs a service worker uses .woff2.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['assets/content/**', 'assets/labs/**'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            // file names include a content hash, so a cached copy never goes stale
            urlPattern: /\/assets\/(content|labs)\//,
            handler: 'CacheFirst',
            options: { cacheName: 'adamlearns-content', expiration: { maxEntries: 3000, maxAgeSeconds: 365 * 24 * 60 * 60 } },
          },
        ],
        // SPA: any in-scope navigation (deep links) is answered with the cached index.html
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // lessons, practice sets and labs go in their own folders, so the service worker can cache them on demand
        chunkFileNames: (chunk) => {
          const id = chunk.facadeModuleId ?? ''
          if (id.includes('/content/')) return 'assets/content/[name]-[hash].js'
          if (id.includes('/src/labs/') && !id.includes('/_kit/') && !id.includes('/_shared/')) return 'assets/labs/[name]-[hash].js'
          return 'assets/[name]-[hash].js'
        },
      },
    },
  },
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
