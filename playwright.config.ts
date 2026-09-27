import { defineConfig, devices } from '@playwright/test'

// Uçtan uca testler derlenmiş siteyi (vite preview) GitHub Pages'teki alt yolda sınar;
// service worker yalnız derlemede üretildiği için geliştirme sunucusu kullanılmaz.
const PORT = 4173
const ADRES = `http://localhost:${PORT}/morfemusta/`

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: ADRES,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'telefon',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: ADRES,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
