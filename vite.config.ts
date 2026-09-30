/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages'te site https://<kullanıcı>.github.io/morfemusta/ altında yayımlanır.
const TABAN = '/morfemusta/'

// Sesler (scripts/ses-uret.py üretir, public/ses/): arayüzün ve Bukalemun Koyu'nun sesleri
// önceden önbelleğe alınır; öteki bölgelerinki bölgeye ilk girişte arka planda iner
// (src/ses/calar.ts) ve aynı önbellekten çalar. Dosyanın adı metnin özeti, sürümü içeriğinin.
const sesListesi = JSON.parse(
  readFileSync(new URL('src/ses/ses-listesi.json', import.meta.url), 'utf8'),
) as { metinler: Record<string, { dosya: string; bolgeler: string[]; surum?: string }> }
const ONCEDEN_INEN_SESLER = Object.values(sesListesi.metinler)
  .filter(({ bolgeler }) => bolgeler.includes('arayuz') || bolgeler.includes('koy'))
  .map(({ dosya, surum }) => ({ url: `ses/${dosya}`, revision: surum ?? null }))
/** src/ses/calar.ts'teki SES_ONBELLEGI. */
const SES_ONBELLEGI = 'morfemusta-ses'

export default defineConfig({
  base: TABAN,
  build: {
    rolldownOptions: {
      // Dört giriş sayfası: oyun, Biçim Denetim Sayfası, Karakter Galerisi ve Ses Denetim
      // Sayfası. Oyun ötekilere bağlantı vermez. Onlar da önbelleğe girer; girmeselerdi
      // service worker oraya giden gezinmeyi oyunun index.html'ine yönlendirirdi
      // (navigateFallback).
      input: {
        oyun: fileURLToPath(new URL('index.html', import.meta.url)),
        denetim: fileURLToPath(new URL('denetim.html', import.meta.url)),
        galeri: fileURLToPath(new URL('galeri.html', import.meta.url)),
        ses: fileURLToPath(new URL('ses.html', import.meta.url)),
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
        // tema.css'teki --zemin: açılış ekranının (ada haritası) ve oyun ekranlarının krem
        // zemini. Manifest belirteç okuyamaz; değer burada yazılıdır (e2e/acilis.spec.ts denetler).
        background_color: '#FFF6E9',
        theme_color: '#FFF6E9',
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
        // Emojiler (public/emoji/*.svg) de burada. Sesler (mp3) kalıpta yok: yalnız arayüzün ve
        // koyun sesleri listeden eklenir, ötekiler çalışma anında önbelleğe iner.
        globPatterns: ['**/*.{html,js,css,svg,png,woff2}'],
        additionalManifestEntries: ONCEDEN_INEN_SESLER,
        runtimeCaching: [
          {
            // İşlev değil düzenli ifade: kalıp service worker'a metin olarak kopyalanır.
            urlPattern: /\/morfemusta\/ses\/.+\.mp3$/,
            handler: 'CacheFirst',
            options: { cacheName: SES_ONBELLEGI },
          },
        ],
        // Yeni sürüm sessizce devreye girer; çocuğa güncelleme sorusu sorulmaz.
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    // Vitest CSS dosyalarını boş modüle çevirir, ?raw ile okunanları da. Stil kaynağını
    // metin olarak okuyan testler (src/gorsel/kurallar.test.ts) için ?raw istekleri
    // Vite'a bırakılır; yan etki olarak yüklenen CSS yine boştur.
    css: { include: [/[?&]raw\b/] },
  },
})
