import { expect, test, type Locator, type Page } from '@playwright/test'

// Karakter Galerisi: ayrı giriş sayfası (galeri.html); oyundan bağlantı almaz. Piksel
// karşılaştırmalı ekran görüntüsü testi yoktur: yazı tipi çizimi ortama göre değişir.
const GALERI = 'galeri.html'

const baslik = (sayfa: Page) =>
  sayfa.getByRole('heading', { level: 1, name: 'Karakter Galerisi' })
const unluler = (sayfa: Page) => sayfa.getByRole('img', { name: /^[aıoueiöü]: / })
const bukalemunlar = (sayfa: Page) => sayfa.getByRole('img', { name: / bukalemunu, / })
const renksizDugmesi = (sayfa: Page) => sayfa.getByRole('button', { name: 'Renksiz' })

const yatayTasma = (sayfa: Page) =>
  sayfa.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )

// Yazı tipinin gerçekten yüklenip öğeye uygulandığını denetler. document.fonts.check()
// kullanılmaz (CLAUDE.md, "Yazı tipi testi").
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

const degisken = (oge: Locator, ad: string) =>
  oge.evaluate((el, ad) => getComputedStyle(el).getPropertyValue(ad).trim().toLowerCase(), ad)

const dolgu = (oge: Locator) => oge.evaluate((el) => getComputedStyle(el).fill)

test.describe('Karakter Galerisi', () => {
  test('telefonda açılır; sekiz ünlü ve sekiz bukalemun görünür; konsol hatası yok', async ({
    page,
  }) => {
    const hatalar: string[] = []
    page.on('console', (ileti) => {
      if (ileti.type() === 'error') hatalar.push(ileti.text())
    })
    page.on('pageerror', (hata) => hatalar.push(hata.message))

    await page.goto(GALERI)

    await expect(baslik(page)).toBeVisible()
    await expect(page).toHaveTitle('Karakter Galerisi · Morfemusta')
    await expect(unluler(page)).toHaveCount(8)
    await expect(bukalemunlar(page)).toHaveCount(8)
    for (const karakter of [...(await unluler(page).all()), ...(await bukalemunlar(page).all())]) {
      await expect(karakter).toBeVisible()
    }
    await expect(page.getByText('kedim', { exact: true })).toBeVisible()
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)

    // En dar yaygın telefon genişliğinde de.
    await page.setViewportSize({ width: 320, height: 568 })
    await expect(baslik(page)).toBeInViewport()
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)

    await page.waitForLoadState('networkidle')
    expect(hatalar).toEqual([])
  })

  test('yazı tipleri pakete gömülü; Google Fonts\'a ve başka sunucuya istek gitmez', async ({
    page,
    baseURL,
  }) => {
    const kaynak = new URL(baseURL!).origin
    const disIstekler: string[] = []
    page.on('request', (istek) => {
      const adres = new URL(istek.url())
      if (adres.protocol.startsWith('http') && adres.origin !== kaynak) {
        disIstekler.push(istek.url())
      }
    })

    await page.goto(GALERI)
    await expect(baslik(page)).toBeVisible()
    expect(await yaziTipiYuklendi(baslik(page), 'Baloo 2')).toBe(true)
    expect(await yaziTipiYuklendi(page.locator('.kok-yazisi').first(), 'Andika')).toBe(true)
    await page.waitForLoadState('networkidle')

    expect(disIstekler.filter((adres) => /fonts\.(googleapis|gstatic)\.com/.test(adres))).toEqual(
      [],
    )
    expect(disIstekler).toEqual([])
  })

  test('Renksiz: --kalin ile --ince aynı değeri alır; kalın ve ince gövde aynı gri', async ({
    page,
  }) => {
    await page.goto(GALERI)
    const dugme = renksizDugmesi(page)
    const a = page.getByRole('img', { name: 'a: kalın, düz, geniş', exact: true })
    const e = page.getByRole('img', { name: 'e: ince, düz, geniş', exact: true })
    const kalinGovde = a.locator('.unlu__govde')
    const inceGovde = e.locator('.unlu__govde')

    await expect(dugme).toHaveAttribute('aria-pressed', 'false')
    expect(await degisken(a, '--kalin')).not.toBe(await degisken(a, '--ince'))
    expect(await dolgu(kalinGovde)).not.toBe(await dolgu(inceGovde))

    await dugme.click()
    await expect(dugme).toHaveAttribute('aria-pressed', 'true')
    expect(await degisken(a, '--kalin')).toBe('#8e8c99')
    expect(await degisken(a, '--ince')).toBe('#8e8c99')
    expect(await degisken(a, '--kalin-zemin')).toBe('#e2e1e8')
    expect(await degisken(a, '--ince-zemin')).toBe('#e2e1e8')
    expect(await dolgu(kalinGovde)).toBe(await dolgu(inceGovde))
    expect(await dolgu(kalinGovde)).toBe('rgb(142, 140, 153)')

    // Tekrar basınca renkler döner.
    await dugme.click()
    await expect(dugme).toHaveAttribute('aria-pressed', 'false')
    expect(await degisken(a, '--kalin')).not.toBe(await degisken(a, '--ince'))
  })

  test('oyun galeriye bağlantı vermez', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { level: 1, name: 'Morfemusta Adası' })).toBeVisible()
    await expect(page.locator('a[href*="galeri"]')).toHaveCount(0)
    expect(await page.content()).not.toContain('galeri')
  })

  test('oyun bir kez açıldıktan sonra çevrim dışı da açılır, yazı tipleriyle', async ({
    page,
    context,
  }) => {
    // Service worker önbellekte olmayan gezinmeyi oyuna (index.html) düşürür; galeri ve
    // yazı tipleri önbellekte olduğu için kendisi, kendi yazı tipleriyle açılmalı.
    await page.goto('./')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

    await context.setOffline(true)
    await page.goto(GALERI)

    await expect(baslik(page)).toBeVisible()
    await expect(unluler(page)).toHaveCount(8)
    expect(await yaziTipiYuklendi(baslik(page), 'Baloo 2')).toBe(true)
  })
})
