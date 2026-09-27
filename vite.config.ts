/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages'te site https://<kullanıcı>.github.io/morfemusta/ altında yayımlanır.
const TABAN = '/morfemusta/'

export default defineConfig({
  base: TABAN,
  build: {
    rolldownOptions: {
      // Üç giriş sayfası: oyun, Biçim Denetim Sayfası ve Karakter Galerisi. Oyun öteki
      // ikisine bağlantı vermez. Onlar da önbelleğe girer; girmeselerdi service worker
      // onlara giden gezinmeyi oyunun index.html'ine yönlendirirdi (navigateFallback).
      input: {
        oyun: fileURLToPath(new URL('index.html', import.meta.url)),
        denetim: fileURLToPath(new URL('denetim.html', import.meta.url)),
        galeri: fileURLToPath(new URL('galeri.html', import.meta.url)),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      manifest: {
        id: TABAN,
        name: 'Morfemusta Adası',
        short_name: 'Morfemusta',
        description:
          'Kök ve ek yaratıklarıyla kelime büyüsü: ilkokul çocukları için Türkçe biçimbilim oyunu.',
        lang: 'tr',
        dir: 'ltr',
        start_url: TABAN,
        scope: TABAN,
        display: 'standalone',
        background_color: '#bfe6f2',
        theme_color: '#2a7fa8',
        categories: ['education', 'games', 'kids'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Çevrim dışı çalışma için her şey (yazı tipleri dahil) önceden önbelleğe alınır.
        // woff dosyaları alınmaz: woff2'yi desteklemeyen tarayıcı hedefte yok.
        globPatterns: ['**/*.{html,js,css,svg,png,woff2}'],
        // Yeni sürüm sessizce devreye girer; çocuğa güncelleme sorusu sorulmaz.
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
})
