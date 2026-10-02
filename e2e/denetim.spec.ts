import { expect, test, type Page } from '@playwright/test'

// Biçim Denetim Sayfası: ayrı giriş sayfası (denetim.html); oyundan bağlantı almaz.
const DENETIM = 'denetim.html'

const baslik = (sayfa: Page) => sayfa.getByRole('heading', { level: 1, name: 'Biçim Denetimi' })

const bicim = (sayfa: Page, kok: string, etiket: string) =>
  sayfa.locator(`tr[data-kok="${kok}"] td[data-etiket="${etiket}"] .denetim__bicim-metni`)

const yatayTasma = (sayfa: Page) =>
  sayfa.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )

// Bölünen ya da hücresinden taşan biçimler: en uzun biçimler de (kaplumbağanın) tek satırda,
// hücresinin içinde kalmalı. Satır içi öğe bölününce birden çok dikdörtgen verir.
const bolunenBicimler = (sayfa: Page) =>
  sayfa.locator('.denetim__bicim-metni').evaluateAll((ogeler) =>
    ogeler
      .filter((oge) => {
        const hucre = oge.parentElement!.getBoundingClientRect()
        const tasiyor = oge.getBoundingClientRect().right > hucre.right + 0.5
        return oge.getClientRects().length > 1 || tasiyor
      })
      .map((oge) => oge.textContent),
  )

test.describe('Biçim Denetim Sayfası', () => {
  test('telefonda açılır; her kök sekiz biçimiyle, taşmadan görünür', async ({ page }) => {
    await page.goto(DENETIM)

    await expect(baslik(page)).toBeVisible()
    await expect(page).toHaveTitle('Biçim Denetimi · Ekle Bakalım')
    // Zemin sayfanın kendi açık rengi: oyunla paylaşılan genel.css sonra yüklense de.
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(
      'rgb(244, 249, 251)',
    )
    await expect(page.locator('tr[data-kok]')).toHaveCount(151)
    await expect(page.locator('td[data-etiket]')).toHaveCount(1208)

    await expect(bicim(page, 'kitap', 'ACC')).toHaveText('kitabı')
    await expect(bicim(page, 'renk', 'POSS.3SG')).toHaveText('rengi')
    await expect(bicim(page, 'burun', 'POSS.1SG')).toHaveText('burnum')
    await expect(bicim(page, 'saat', 'PL')).toHaveText('saatler')
    await expect(bicim(page, 'sır', 'POSS.1SG')).toHaveText('sırrım')
    await expect(bicim(page, 'su', 'GEN')).toHaveText('suyun')
    await expect(bicim(page, 'tat', 'PROP')).toHaveText('tatlı')
    await expect(page.locator('tr[data-kok="kalp"] .denetim__isaret')).toHaveText([
      'yumuşar',
      'ince ek',
    ])

    // Telefonda her kök bir karttır: etiket biçimin üstünde görünür.
    await expect(
      page.locator('tr[data-kok="kitap"] td[data-etiket="ACC"] .denetim__hucre-etiketi'),
    ).toBeVisible()
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)
    expect(await bolunenBicimler(page)).toEqual([])

    // En dar yaygın telefon genişliğinde de.
    await page.setViewportSize({ width: 320, height: 568 })
    await expect(baslik(page)).toBeInViewport()
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)
    expect(await bolunenBicimler(page)).toEqual([])
  })

  test('kategori bağlantısı o kategoriye götürür', async ({ page }) => {
    await page.goto(DENETIM)
    const kategoriler = page.getByRole('navigation', { name: 'Kategoriler' })
    await kategoriler.getByRole('link', { name: 'doğa' }).click()
    await expect(page.getByRole('heading', { level: 2, name: 'doğa' })).toBeInViewport()
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

    await page.goto(DENETIM)
    await expect(baslik(page)).toBeVisible()
    await page.waitForLoadState('networkidle')

    expect(disIstekler).toEqual([])
  })

  test('oyun denetim sayfasına bağlantı vermez', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { level: 1, name: 'Ekle Bakalım' })).toBeVisible()
    await expect(page.locator('a[href*="denetim"]')).toHaveCount(0)
    expect(await page.content()).not.toContain('denetim')
  })

  test('oyun bir kez açıldıktan sonra da açılır, çevrim dışı da', async ({ page, context }) => {
    // Service worker gezinmeleri oyuna (index.html) düşürür; denetim sayfası önbellekte
    // olduğu için kendisi açılmalı.
    await page.goto('./')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

    await context.setOffline(true)
    await page.goto(DENETIM)

    await expect(baslik(page)).toBeVisible()
    await expect(page.locator('tr[data-kok]')).toHaveCount(151)
  })
})
