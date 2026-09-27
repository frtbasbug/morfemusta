import { expect, test, type Page } from '@playwright/test'

// Karakter Galerisi: ayrı giriş sayfası (galeri.html); oyundan bağlantı almaz.
// Piksel karşılaştırmalı ekran görüntüsü testi yok: yazı tipi farkları CI'da kırılır.
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

// Baloo 2'nin (800) gerçekten yüklenip başlığa uygulandığını denetler. document.fonts.check()
// kullanılmaz (ı hem latin hem latin-ext aralığında; bkz. acilis.spec.ts).
const baloo2Yuklendi = (sayfa: Page) =>
  baslik(sayfa).evaluate(async (h1) => {
    await document.fonts.ready
    const stil = getComputedStyle(h1)
    return (
      stil.fontFamily.replace(/["']/g, '').startsWith('Baloo 2') &&
      [...document.fonts].some(
        (yuz) =>
          yuz.family.replace(/["']/g, '') === 'Baloo 2' &&
          yuz.weight === stil.fontWeight &&
          yuz.status === 'loaded',
      )
    )
  })

// Renk belirteçlerinin ilk ünlü karakterindeki değerleri.
const belirtecler = (sayfa: Page) =>
  unluler(sayfa)
    .first()
    .evaluate((oge) => {
      const stil = getComputedStyle(oge)
      const deger = (ad: string) => stil.getPropertyValue(ad).trim().toUpperCase()
      return {
        kalin: deger('--kalin'),
        ince: deger('--ince'),
        kalinZemin: deger('--kalin-zemin'),
        inceZemin: deger('--ince-zemin'),
      }
    })

// a (kalın) ve e (ince) gövdelerinin boyandığı renk.
const govdeRenkleri = (sayfa: Page) =>
  Promise.all(
    ['a', 'e'].map((unlu) =>
      sayfa
        .locator(`svg.unlu[data-unlu="${unlu}"] .karakter__govde`)
        .evaluate((govde) => getComputedStyle(govde).fill),
    ),
  )

test.describe('Karakter Galerisi', () => {
  test('telefonda açılır: 8 ünlü ve 8 bukalemun görünür, konsol hatası yok', async ({ page }) => {
    const hatalar: string[] = []
    page.on('console', (ileti) => {
      if (ileti.type() === 'error') hatalar.push(ileti.text())
    })
    page.on('pageerror', (hata) => hatalar.push(hata.message))

    await page.goto(GALERI)

    await expect(baslik(page)).toBeVisible()
    await expect(page).toHaveTitle('Karakter Galerisi · Morfemusta')
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr')

    await expect(unluler(page)).toHaveCount(8)
    for (const unlu of await unluler(page).all()) await expect(unlu).toBeVisible()
    // Okul çizelgesinin sırası: kalın satırı a ı o u, ince satırı e i ö ü.
    expect(await unluler(page).evaluateAll((ogeler) => ogeler.map((o) => o.dataset.unlu))).toEqual(
      ['a', 'ı', 'o', 'u', 'e', 'i', 'ö', 'ü'],
    )
    await expect(page.getByRole('img', { name: 'a: kalın, düz, geniş', exact: true })).toBeVisible()
    await expect(
      page.getByRole('img', { name: 'ü: ince, yuvarlak, dar', exact: true }),
    ).toBeVisible()

    await expect(bukalemunlar(page)).toHaveCount(8)
    for (const bukalemun of await bukalemunlar(page).all()) await expect(bukalemun).toBeVisible()
    await expect(
      page.getByRole('img', { name: 'm bukalemunu, saklanan i: ince, düz, dar', exact: true }),
    ).toBeVisible()
    await expect(page.locator('li[data-sonuc="evlar"] s')).toHaveText('evlar')

    expect(await baloo2Yuklendi(page)).toBe(true)
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)

    // En dar yaygın telefon genişliğinde de taşma yok.
    await page.setViewportSize({ width: 320, height: 568 })
    await expect(baslik(page)).toBeInViewport()
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)

    expect(hatalar).toEqual([])
  })

  test('Renksiz: --kalin ile --ince aynı gri, iki zemin aynı; düğme geri alır', async ({
    page,
  }) => {
    await page.goto(GALERI)
    await expect(renksizDugmesi(page)).toHaveAttribute('aria-pressed', 'false')

    const renkli = await belirtecler(page)
    expect(renkli).toEqual({
      kalin: '#FF8A3D',
      ince: '#2F80ED',
      kalinZemin: '#FFD6BB',
      inceZemin: '#B6D3F9',
    })
    const [kalinGovde, inceGovde] = await govdeRenkleri(page)
    expect(kalinGovde).not.toBe(inceGovde)

    await renksizDugmesi(page).click()
    await expect(renksizDugmesi(page)).toHaveAttribute('aria-pressed', 'true')
    const renksiz = await belirtecler(page)
    expect(renksiz.kalin).toBe(renksiz.ince)
    expect(renksiz).toEqual({
      kalin: '#8E8C99',
      ince: '#8E8C99',
      kalinZemin: '#E2E1E8',
      inceZemin: '#E2E1E8',
    })
    const [kalinGri, inceGri] = await govdeRenkleri(page)
    expect(kalinGri).toBe(inceGri)

    await renksizDugmesi(page).click()
    await expect(renksizDugmesi(page)).toHaveAttribute('aria-pressed', 'false')
    expect(await belirtecler(page)).toEqual(renkli)
  })

  test('yazı tipleri pakette: fonts.googleapis.com\'a ve başka sunucuya istek gitmez', async ({
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
    expect(await baloo2Yuklendi(page)).toBe(true)
    await page.waitForLoadState('networkidle')

    expect(disIstekler.filter((adres) => adres.includes('fonts.googleapis.com'))).toEqual([])
    expect(disIstekler).toEqual([])
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
    // Service worker gezinmeleri oyuna (index.html) düşürür; galeri önbellekte olduğu için
    // kendisi açılmalı, woff2 dosyaları da önbellekten gelmeli.
    await page.goto('./')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

    await context.setOffline(true)
    await page.goto(GALERI)

    await expect(baslik(page)).toBeVisible()
    await expect(unluler(page)).toHaveCount(8)
    await expect(bukalemunlar(page)).toHaveCount(8)
    expect(await baloo2Yuklendi(page)).toBe(true)
  })
})
