import { expect, test, type Page } from '@playwright/test'
import {
  bolge,
  dikeyTasma,
  disIstekleriTopla,
  gezinme,
  haritaBasligi,
  haritaDugmesi,
  hatalariTopla,
  ileti,
  koyBasligi,
  yatayTasma,
} from './yardimcilar.ts'

// Ada haritası ve kabuk: bölge kilitleri, alt gezinme, hash yönlendirici ve geri tuşu.

const bolgeDugmeleri = (sayfa: Page) => sayfa.locator('.harita__bolgeler button')

/** Birbirinin üstüne binen bölge düğmeleri (çiftler). */
const cakisanlar = (sayfa: Page) =>
  bolgeDugmeleri(sayfa).evaluateAll((dugmeler) => {
    const kutular = dugmeler.map((d) => d.getBoundingClientRect())
    const cakisan: string[] = []
    kutular.forEach((a, i) =>
      kutular.slice(i + 1).forEach((b, j) => {
        const ust = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
        if (ust) cakisan.push(`${i + 1} ile ${i + j + 2}`)
      }),
    )
    return cakisan
  })

const kucukDokunmaAlanlari = (sayfa: Page) =>
  sayfa.locator('.harita__bolgeler button, nav a').evaluateAll((ogeler) =>
    ogeler
      .map((o) => o.getBoundingClientRect())
      .filter((k) => k.width < 44 || k.height < 44)
      .map((k) => `${k.width}×${k.height}`),
  )

test.describe('ada haritası', () => {
  test('ilk açılışta yalnız Bukalemun Koyu açık; durum simge ve yazıyla görünür', async ({
    page,
  }) => {
    const hatalar = hatalariTopla(page)
    await page.goto('./')
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(page.locator('svg.harita__cizim')).toHaveAttribute('aria-hidden', 'true')

    // Adlar sırayla; her düğmenin adı görünen yazısıdır: bölge ve durum.
    const adlar = await bolgeDugmeleri(page).evaluateAll((dugmeler) =>
      dugmeler.map((d) => d.getAttribute('aria-label')),
    )
    expect(adlar).toEqual([
      'Bukalemun Koyu, Açık',
      "Fıstıkçı Şahap'ın Dükkânı, Kilitli",
      'Kök Bahçesi, Kilitli',
      'Uydurukçuklar, Kilitli',
    ])
    await expect(bolge(page, 'Bukalemun Koyu')).toHaveAccessibleName('Bukalemun Koyu, Açık')
    // Kilitli bölgenin kilit simgesi var; durum yalnız renkle verilmez.
    await expect(bolgeDugmeleri(page).locator('.bolge__durum svg.simge')).toHaveCount(4)
    // Koyun işareti küçük bir bukalemun; öteki bölgelerin işareti henüz yok.
    await expect(bolgeDugmeleri(page).locator('.bolge__isaret .bukalemun')).toHaveCount(1)
    await expect(bolge(page, 'Bukalemun Koyu').locator('.bukalemun')).toBeVisible()
    // İşaret süstür: ek yazısı yok (0.42 ölçekte okunmazdı).
    await expect(bolge(page, 'Bukalemun Koyu').locator('.bukalemun text')).toHaveCount(0)
    expect(hatalar).toEqual([])
  })

  test('kilitli bölgeye dokununca önce hangi bölgenin bitmesi gerektiği yazılır', async ({
    page,
  }) => {
    await page.goto('./')
    await expect(ileti(page)).toBeEmpty()

    await bolge(page, 'Kök Bahçesi').click()
    await expect(ileti(page)).toHaveText("Önce Fıstıkçı Şahap'ın Dükkânı bitmeli.")
    await bolge(page, 'Dükkânı').click()
    await expect(ileti(page)).toHaveText('Önce Bukalemun Koyu bitmeli.')
    await expect(ileti(page)).toHaveAttribute('role', 'status')
    // Harita yerinde kalır.
    await expect(haritaBasligi(page)).toBeVisible()
    expect(new URL(page.url()).hash).toMatch(/^(#\/?)?$/)
  })

  test('kilitli bölgenin adresi haritaya döner', async ({ page }) => {
    await page.goto('./#/bolge/dukkan')
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(page).toHaveURL(/#\/$/)
    await page.goto('./#/bolge/yok')
    await expect(haritaBasligi(page)).toBeVisible()
    await page.goto('./#/bilinmeyen')
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(page).toHaveURL(/#\/$/)
  })

  test("360×640'ta kaydırmadan sığar; düğmeler üst üste binmez, en az 44 px", async ({ page }) => {
    await page.goto('./')
    for (const [en, boy] of [
      [412, 839],
      [360, 640],
      [320, 568],
    ] as const) {
      await page.setViewportSize({ width: en, height: boy })
      const etiket = `${en}×${boy}`
      await expect(haritaBasligi(page), etiket).toBeInViewport({ ratio: 1 })
      expect(await yatayTasma(page), etiket).toBeLessThanOrEqual(0)
      expect(await dikeyTasma(page), etiket).toBeLessThanOrEqual(0)
      for (const dugme of await bolgeDugmeleri(page).all()) {
        await expect(dugme, etiket).toBeInViewport({ ratio: 1 })
      }
      await expect(page.getByRole('navigation', { name: 'Gezinme' }), etiket).toBeInViewport({
        ratio: 1,
      })
      expect(await cakisanlar(page), etiket).toEqual([])
      expect(await kucukDokunmaAlanlari(page), etiket).toEqual([])
    }

    // Kilitli bölgenin iletisi (iki satır) gelince de harita kaymaz, sığar.
    await page.setViewportSize({ width: 360, height: 640 })
    const once = await bolge(page, 'Bukalemun Koyu').boundingBox()
    await bolge(page, 'Kök Bahçesi').click()
    await expect(ileti(page)).not.toBeEmpty()
    expect(await bolge(page, 'Bukalemun Koyu').boundingBox()).toEqual(once)
    expect(await dikeyTasma(page)).toBeLessThanOrEqual(0)
  })
})

test.describe('gezinme', () => {
  test('alt gezinme: Harita, Sözlük, Ayarlar; açık ekran işaretli', async ({ page }) => {
    await page.goto('./')
    await expect(gezinme(page, 'Harita')).toHaveAttribute('aria-current', 'page')
    await gezinme(page, 'Sözlük').click()
    await expect(page.getByRole('heading', { level: 1, name: 'Sözlük' })).toBeVisible()
    await expect(page).toHaveURL(/#\/sozluk$/)
    await expect(gezinme(page, 'Sözlük')).toHaveAttribute('aria-current', 'page')
    await expect(gezinme(page, 'Harita')).not.toHaveAttribute('aria-current', 'page')
    await gezinme(page, 'Ayarlar').click()
    await expect(page.getByRole('heading', { level: 1, name: 'Ayarlar' })).toBeVisible()
    await expect(page).toHaveURL(/#\/ayarlar$/)
    // Harita geçmişte bir adım geri: oyunun ilk açıldığı adres (hash'siz ya da #/).
    await gezinme(page, 'Harita').click()
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(page).toHaveURL(/\/morfemusta\/(#\/)?$/)
  })

  test('telefonun geri tuşu: bölgeden, Sözlük\'ten ve Ayarlar\'dan haritaya; haritadan dışarı', async ({
    page,
  }) => {
    await page.goto('./')

    await bolge(page, 'Bukalemun Koyu').click()
    await expect(koyBasligi(page)).toBeVisible()
    await expect(page).toHaveURL(/#\/bolge\/koy$/)
    await page.goBack()
    await expect(haritaBasligi(page)).toBeVisible()

    // Alt gezinmedeki geçişler geçmişi büyütmez (Android'in alt gezinme düzeni).
    await gezinme(page, 'Sözlük').click()
    await gezinme(page, 'Ayarlar').click()
    await expect(page.getByRole('heading', { level: 1, name: 'Ayarlar' })).toBeVisible()
    await page.goBack()
    await expect(haritaBasligi(page)).toBeVisible()

    // Koydaki Harita düğmesi de geri gider: haritadan sonra geri tuşu oyundan çıkar.
    await bolge(page, 'Bukalemun Koyu').click()
    await haritaDugmesi(page).click()
    await expect(haritaBasligi(page)).toBeVisible()
    await page.goBack()
    await expect(page).toHaveURL('about:blank')
  })

  test('adresle doğrudan açılan ekrandan haritaya dönülür', async ({ page }) => {
    await page.goto('./#/sozluk')
    await expect(page.getByRole('heading', { level: 1, name: 'Sözlük' })).toBeVisible()
    await gezinme(page, 'Harita').click()
    await expect(haritaBasligi(page)).toBeVisible()
    await page.goto('./#/bolge/koy')
    await expect(koyBasligi(page)).toBeVisible()
    await haritaDugmesi(page).click()
    await expect(haritaBasligi(page)).toBeVisible()
  })

  test('Sözlük boşken nasıl dolacağını söyler; dış sunucuya istek gitmez', async ({
    page,
    baseURL,
  }) => {
    const disIstekler = disIstekleriTopla(page, baseURL)
    await page.goto('./')
    await gezinme(page, 'Sözlük').click()
    await expect(
      page.getByText('Sözlüğün henüz boş. Bir kelime kurunca kartı buraya gelir.'),
    ).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(disIstekler).toEqual([])
  })
})
