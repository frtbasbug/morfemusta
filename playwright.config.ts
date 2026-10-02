import { existsSync } from 'node:fs'
import { defineConfig, devices, webkit } from '@playwright/test'

// Uçtan uca testler derlenmiş siteyi (vite preview) GitHub Pages'teki alt yolda sınar;
// service worker yalnız derlemede üretildiği için geliştirme sunucusu kullanılmaz.
const PORT = 4173
const ADRES = `http://localhost:${PORT}/morfemusta/`

// WebKit (iPhone ve iPad Safari'ye yakınlık): pilot yolu ve pilot.html (e2e/pilot.spec.ts). CI'da
// her zaman koşar; yerelde tarayıcı kurulu değilse (bulut oturumunda indirilemeyebilir) atlanır.
const WEBKIT_VAR = !!process.env.CI || existsSync(webkit.executablePath())
if (!WEBKIT_VAR) console.warn('WebKit kurulu değil: webkit projesi atlandı (CI koşar).')

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: ADRES,
    trace: 'retain-on-failure',
    // Takılan bir eylem (dokunuş, tıklama) testin bütün süresini beklemesin: 15 saniyede
    // nedenini yazarak düşer.
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'telefon',
      use: { ...devices['Pixel 7'] },
    },
    ...(WEBKIT_VAR
      ? [
          {
            name: 'webkit',
            use: { ...devices['iPhone 13'] },
            testMatch: /pilot\.spec\.ts$/,
            // Uzun pilot yolu (dört bölge) yalnız Chromium'da: Playwright'ın WebKit'teki dokunuşu ve
            // tıklaması, ekranın altından taşan öğeye kendi kaydırmasında ara sıra takılıyor (CI'da
            // Bahçe'nin akşam ekranında Haritaya dön). Aynı commit bir koşuda yeşil, ötekinde
            // kırmızıydı. pilot.html'in testleri WebKit'te kalır. NEXT.md, Oturum 13.
            grepInvert: /pilot yolu/,
          },
        ]
      : []),
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: ADRES,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
