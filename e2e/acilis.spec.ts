import { expect, test, type Locator, type Page } from '@playwright/test'
import { bolge, haritaBasligi, yatayTasma } from './yardimcilar.ts'

// Açılış ekranı: ada haritası. Başlık Baloo 2, metin Andika; ikisi de pakete gömülü.

// Yazı tipinin gerçekten yüklenip öğeye uygulandığını denetler. document.fonts.check()
// burada kullanılmaz: ı (U+0131) hem latin hem latin-ext aralığında olduğundan, tarayıcı
// yalnız latin'i indirse de check() false döner.
const yaziTipiYuklendi = (oge: Locator, aile: string) =>
  oge.evaluate(async (el, aile) => {
    await document.fonts.ready
    const stil = getComputedStyle(el)
    return (
      stil.fontFamily.replace(/["']/g, '').startsWith(aile) &&
      [...document.fonts].some(
        (yuz) =>
          yuz.family.replace(/["']/g, '') === aile &&
          yuz.weight === stil.fontWeight &&
          yuz.status === 'loaded',
      )
    )
  }, aile)

const yaziTipleriYuklendi = async (sayfa: Page) =>
  (await yaziTipiYuklendi(haritaBasligi(sayfa), 'Baloo 2')) &&
  (await yaziTipiYuklendi(bolge(sayfa, 'Bukalemun Koyu').locator('.bolge__ad'), 'Andika'))

test.describe('açılış ekranı', () => {
  test('harita telefonda başlığıyla, yazı tipleriyle, taşmadan açılır', async ({ page }) => {
    await page.goto('./')

    await expect(haritaBasligi(page)).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr')
    await expect(page).toHaveTitle('Ekle Bakalım')
    expect(await yaziTipleriYuklendi(page)).toBe(true)
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)

    // En dar yaygın telefon genişliğinde de taşma olmamalı.
    await page.setViewportSize({ width: 320, height: 568 })
    await expect(haritaBasligi(page)).toBeInViewport()
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)
  })

  test('dış sunucuya hiç istek gitmez (CDN yok)', async ({ page, baseURL }) => {
    const kaynak = new URL(baseURL!).origin
    const disIstekler: string[] = []
    page.on('request', (istek) => {
      const adres = new URL(istek.url())
      if (adres.protocol.startsWith('http') && adres.origin !== kaynak) {
        disIstekler.push(istek.url())
      }
    })

    await page.goto('./')
    await yaziTipleriYuklendi(page)
    await page.waitForLoadState('networkidle')

    expect(disIstekler).toEqual([])
  })
})

test.describe('ana ekrana eklenebilir uygulama (PWA)', () => {
  test('manifest ve ikonlar alt yolda doğru sunulur; renkler zeminin belirteci', async ({
    page,
    request,
  }) => {
    await page.goto('./')
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      'href',
      '/ekle-bakalim/manifest.webmanifest',
    )

    const yanit = await request.get('manifest.webmanifest')
    expect(yanit.ok()).toBe(true)
    const manifest = await yanit.json()
    expect(manifest).toMatchObject({
      name: 'Ekle Bakalım',
      short_name: 'Ekle Bakalım',
      lang: 'tr',
      start_url: '/ekle-bakalim/',
      scope: '/ekle-bakalim/',
      display: 'standalone',
    })

    // Manifest ve tema rengi belirteç okuyamaz: değerleri tema.css'teki --zemin olmalı.
    const zemin = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--zemin').trim().toLowerCase(),
    )
    expect(zemin).toBe('#fff6e9')
    expect(manifest.background_color.toLowerCase()).toBe(zemin)
    expect(manifest.theme_color.toLowerCase()).toBe(zemin)
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', /^#fff6e9$/i)

    const ikonlar: { src: string; sizes: string; purpose?: string }[] = manifest.icons
    expect(ikonlar.map((ikon) => ikon.sizes)).toEqual(
      expect.arrayContaining(['192x192', '512x512']),
    )
    expect(ikonlar.some((ikon) => ikon.purpose === 'maskable')).toBe(true)
    for (const ikon of ikonlar) {
      const ikonYaniti = await request.get(ikon.src)
      expect(ikonYaniti.ok(), ikon.src).toBe(true)
      expect(ikonYaniti.headers()['content-type']).toBe('image/png')
    }
  })

  test('bir kez açıldıktan sonra çevrim dışı da açılır', async ({ page, context }) => {
    await page.goto('./')
    const kapsam = await page.evaluate(async () => {
      const kayit = await navigator.serviceWorker.ready
      return kayit.scope
    })
    expect(new URL(kapsam).pathname).toBe('/ekle-bakalim/')
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

    await context.setOffline(true)
    await page.reload()

    await expect(haritaBasligi(page)).toBeVisible()
    expect(await yaziTipleriYuklendi(page)).toBe(true)
  })
})
