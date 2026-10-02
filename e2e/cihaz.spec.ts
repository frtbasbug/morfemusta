import { expect, test } from '@playwright/test'
import { disIstekleriTopla, haritaBasligi, hatalariTopla } from './yardimcilar.ts'

// Eski cihazlar (DESIGN.md, "Cihazda ilerleme"): Cihaz Denetimi (cihaz.html) tarayıcıyı, ekranı
// ve oyunun dayandığı özellikleri gösterir; Kopyala özeti panoya koyar. Oyunun açılamayacağı eski
// tarayıcıda beyaz ekran yerine kısa bir uyarı ve cihaz.html bağlantısı çıkar.

const OZELLIKLER = [
  'Service worker (çevrim dışı)',
  'localStorage (ilerleme)',
  'Web Audio (efektler)',
  'Pointer Events (sürükle-bırak)',
  'dvh birimi',
  'Kap sorgusu birimleri (cqw, cqh)',
  'ES modülleri',
  ':has() seçicisi',
  'Web Animations (hareketler)',
]

test.describe('Cihaz Denetimi (cihaz.html)', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('tarayıcı, ekran ve özellikler tek tek; Kopyala özeti panoya koyar', async ({ page, baseURL }) => {
    const hatalar = hatalariTopla(page)
    const disIstekler = disIstekleriTopla(page, baseURL)
    await page.goto('cihaz.html')
    await expect(page.getByRole('heading', { level: 1, name: 'Cihaz Denetimi' })).toBeVisible()
    await expect(page.locator('#tarayici')).toHaveText(/^Chrome \d+/)
    await expect(page.locator('#sistem')).toHaveText(/^Android \d+/)
    await expect(page.locator('#ekran')).toHaveText(/^\d+×\d+ \(pencere 412×839, piksel oranı 2\.625\)$/)
    const satirlar = page.locator('#ozellikler li')
    await expect(satirlar).toHaveCount(OZELLIKLER.length)
    for (const [i, ad] of OZELLIKLER.entries()) {
      // Bu tarayıcıda hepsi var: ✓; erişilebilir adı "ad: var".
      await expect(satirlar.nth(i)).toHaveText(`✓${ad}`)
      await expect(satirlar.nth(i)).toHaveAccessibleName(`${ad}: var`)
    }

    await page.getByRole('button', { name: 'Kopyala' }).click()
    await expect(page.getByRole('status')).toHaveText('Panoya kopyalandı.')
    const pano = await page.evaluate(() => navigator.clipboard.readText())
    expect(pano.split('\n').slice(0, 4)).toEqual([
      'Ekle Bakalım · cihaz denetimi',
      expect.stringMatching(/^Tarayıcı: Chrome \d+/),
      expect.stringMatching(/^İşletim sistemi: Android \d+/),
      expect.stringMatching(/^Ekran: \d+×\d+/),
    ])
    for (const ad of OZELLIKLER) expect(pano).toContain(`${ad}: ✓`)
    expect(pano).toContain(`Kullanıcı ajanı: ${await page.evaluate(() => navigator.userAgent)}`)
    // Denetim için yazılan deneme anahtarı silinir: depoda iz kalmaz.
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
    expect(hatalar).toEqual([])
    expect(disIstekler).toEqual([])
  })

  test('olmayan özellik ✗ ile yazılır', async ({ page }) => {
    await page.addInitScript(() => {
      // Pointer Events'i olmayan bir tarayıcı gibi.
      delete (window as unknown as { PointerEvent?: unknown }).PointerEvent
    })
    await page.goto('cihaz.html')
    const satir = page.locator('#ozellikler li').filter({ hasText: 'Pointer Events' })
    await expect(satir).toHaveText('✗Pointer Events (sürükle-bırak) (yok)')
    await expect(satir).toHaveAccessibleName('Pointer Events (sürükle-bırak): yok')
  })

  test('oyun açıldıktan sonra çevrim dışı da açılır', async ({ page, context }) => {
    await page.goto('./')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
    await context.setOffline(true)
    await page.goto('cihaz.html')
    await expect(page.getByRole('heading', { level: 1, name: 'Cihaz Denetimi' })).toBeVisible()
  })
})

test.describe('eski tarayıcı', () => {
  // Service worker yokken istekler yakalanabilir (route); ilk açılış gibi.
  test.use({ serviceWorkers: 'block' })

  const uyari = (sayfa: import('@playwright/test').Page) =>
    sayfa.getByRole('alert').filter({ hasText: 'Bu tarayıcı Ekle Bakalım için çok eski.' })

  test('oyun açılınca uyarı yok', async ({ page }) => {
    await page.goto('./')
    await expect(haritaBasligi(page)).toBeVisible()
    await page.waitForLoadState('load')
    await expect(page.locator('#eski-tarayici')).toBeHidden()
  })

  test('paket ayrıştırılamazsa (eski sözdizimi) beyaz ekran yok: uyarı ve cihaz.html bağlantısı', async ({
    page,
  }) => {
    // Oyunun giriş modülü bu tarayıcının anlamadığı sözdizimindeymiş gibi.
    await page.route(/\/assets\/oyun-[^/]+\.js$/, (yol) =>
      yol.fulfill({ contentType: 'text/javascript', body: 'export const x = ;' }),
    )
    await page.goto('./')
    await expect(uyari(page)).toBeVisible()
    await expect(page.locator('#kok')).toBeEmpty()
    await page.getByRole('link', { name: 'Cihazı denetle' }).click()
    await expect(page.getByRole('heading', { level: 1, name: 'Cihaz Denetimi' })).toBeVisible()
  })

  test('ES modülü olmayan tarayıcıda (nomodule) uyarı hemen çıkar', async ({ page }) => {
    await page.addInitScript(() => {
      delete (HTMLScriptElement.prototype as { noModule?: boolean }).noModule
    })
    // Böyle bir tarayıcı type="module" betiği hiç çalıştırmaz.
    await page.route(/\/assets\/.+\.js$/, (yol) => yol.abort())
    await page.goto('./', { waitUntil: 'domcontentloaded' })
    await expect(uyari(page)).toBeVisible()
    await expect(page.getByRole('link', { name: 'Cihazı denetle' })).toHaveAttribute('href', 'cihaz.html')
  })
})
