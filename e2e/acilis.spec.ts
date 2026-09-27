import { expect, test, type Page } from '@playwright/test'

const baslik = (sayfa: Page) =>
  sayfa.getByRole('heading', { level: 1, name: 'Morfemusta Adası' })

// Andika'nın gerçekten yüklenip başlığa uygulandığını denetler.
// document.fonts.check() burada kullanılmaz: ı (U+0131) hem latin hem latin-ext
// aralığında olduğundan, tarayıcı yalnız latin'i indirse de check() false döner.
const andikaYuklendi = (sayfa: Page) =>
  baslik(sayfa).evaluate(async (h1) => {
    await document.fonts.ready
    const stil = getComputedStyle(h1)
    return (
      stil.fontFamily.startsWith('Andika') &&
      [...document.fonts].some(
        (yuz) =>
          yuz.family.replace(/["']/g, '') === 'Andika' &&
          yuz.weight === stil.fontWeight &&
          yuz.status === 'loaded',
      )
    )
  })

const yatayTasma = (sayfa: Page) =>
  sayfa.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )

test.describe('açılış ekranı', () => {
  test('başlık telefonda Andika yazı tipiyle, taşmadan görünür', async ({ page }) => {
    await page.goto('./')

    await expect(baslik(page)).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr')
    await expect(page).toHaveTitle('Morfemusta Adası')
    expect(await andikaYuklendi(page)).toBe(true)
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)

    // En dar yaygın telefon genişliğinde de taşma olmamalı.
    await page.setViewportSize({ width: 320, height: 568 })
    await expect(baslik(page)).toBeInViewport()
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
    await andikaYuklendi(page)
    await page.waitForLoadState('networkidle')

    expect(disIstekler).toEqual([])
  })
})

test.describe('ana ekrana eklenebilir uygulama (PWA)', () => {
  test('manifest ve ikonlar alt yolda doğru sunulur', async ({ page, request }) => {
    await page.goto('./')
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      'href',
      '/morfemusta/manifest.webmanifest',
    )

    const yanit = await request.get('manifest.webmanifest')
    expect(yanit.ok()).toBe(true)
    const manifest = await yanit.json()
    expect(manifest).toMatchObject({
      name: 'Morfemusta Adası',
      short_name: 'Morfemusta',
      lang: 'tr',
      start_url: '/morfemusta/',
      scope: '/morfemusta/',
      display: 'standalone',
    })

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
    expect(new URL(kapsam).pathname).toBe('/morfemusta/')
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

    await context.setOffline(true)
    await page.reload()

    await expect(baslik(page)).toBeVisible()
    expect(await andikaYuklendi(page)).toBe(true)
  })
})
