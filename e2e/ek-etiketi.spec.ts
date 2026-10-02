import { expect, test, type Locator, type Page } from '@playwright/test'
import { ANAHTAR, bukalemun, gezinme, hatalariTopla, kart, sonraki, dugmeyleOyna } from './yardimcilar.ts'

// Bu dosyadaki testler Düğmeyle ayarında koşar (yardimcilar.ts, dugmeyleOyna).
test.beforeEach(({ page }) => dugmeyleOyna(page))

// Birleşen ekte ünlü etiketi (DESIGN.md, "Birleşen ek"): ekin ünlüsü kök etiketiyle aynı
// etikettedir; kalında geniş, incede dar. Uyum etiketlerin eninden okunur, bu yüzden Renksiz'de
// de görünür: renk gider, en kalır.

const RENKSIZ_GRI = 'rgb(142, 140, 153)'

interface Etiket {
  readonly harf: string
  readonly en: number
  readonly kalin: boolean
  readonly ekte: boolean
  readonly zemin: string
}

/** Her kelimenin etiketleri, sırayla: kökteki (ekte değil) ve ekteki. */
const kelimeEtiketleri = (kelimeler: Locator) =>
  kelimeler.evaluateAll((ogeler) =>
    ogeler.map((kelime) =>
      [...kelime.querySelectorAll('.unlu-etiketi')].map((etiket) => ({
        harf: etiket.textContent ?? '',
        en: etiket.getBoundingClientRect().width,
        kalin: etiket.classList.contains('unlu-etiketi--kalin'),
        ekte: etiket.closest('.ek-yazisi') !== null,
        zemin: getComputedStyle(etiket).backgroundColor,
      })),
    ),
  )

/** Renksiz'de bütün etiketler aynı gri; kalın ve ince ek etiketlerinin enleri farklı; her
 *  kelimede kökün ve ekin etiketleri aynı ende (uyum). */
function denetle(kelimeler: Etiket[][], yer: string) {
  const hepsi = kelimeler.flat()
  expect(hepsi.length, yer).toBeGreaterThan(0)
  expect(new Set(hepsi.map((e) => e.zemin)), yer).toEqual(new Set([RENKSIZ_GRI]))

  const ekteKalin = hepsi.filter((e) => e.ekte && e.kalin).map((e) => e.en)
  const ekteInce = hepsi.filter((e) => e.ekte && !e.kalin).map((e) => e.en)
  expect(ekteKalin.length, `${yer}: kalın ek`).toBeGreaterThan(0)
  expect(ekteInce.length, `${yer}: ince ek`).toBeGreaterThan(0)
  // Renksiz'de kalın ve ince ek yalnız eninden ayrılır: en dar kalın, en geniş inceden geniş.
  expect(Math.min(...ekteKalin), yer).toBeGreaterThan(Math.max(...ekteInce) + 5)

  for (const etiketler of kelimeler) {
    const adi = `${yer}: ${etiketler.map((e) => e.harf).join('')}`
    expect(etiketler.some((e) => !e.ekte), adi).toBe(true)
    expect(etiketler.some((e) => e.ekte), adi).toBe(true)
    const [ilk] = etiketler
    for (const etiket of etiketler) expect(etiket.en, adi).toBeCloseTo(ilk!.en, 0)
  }
}

const kayitla = (sayfa: Page) => {
  const simdi = new Date().toISOString()
  const kartYaz = (kelime: string, kok: string, etiketler: string[]) => ({
    kelime,
    kok,
    etiketler,
    bolge: 'koy',
    tarih: simdi,
    sonKurulma: simdi,
  })
  // Renksiz ve Azalt açık; koyun ilk dokuz görevi bitmiş, ikisinin kartı bugün kurulmuş.
  const kayit = {
    bolgeler: { koy: { bitenler: [1, 2, 3, 4, 5, 6, 7, 8, 9], kaldigi: 9 } },
    kartlar: [kartYaz('atlar', 'at', ['PL']), kartYaz('evler', 'ev', ['PL'])],
    ayarlar: { hareket: 'azalt', renkler: 'renksiz' },
  }
  return sayfa.addInitScript(
    ([anahtar, metin]) => {
      if (sessionStorage.getItem('kuruldu') !== null) return
      sessionStorage.setItem('kuruldu', 'evet')
      localStorage.setItem(anahtar!, metin!)
    },
    [ANAHTAR, JSON.stringify(kayit)],
  )
}

test('Renksiz: kalın ve ince ek etiketlerinin enleri farklı; kökün ve ekin etiketi aynı ende', async ({
  page,
}) => {
  const hatalar = hatalariTopla(page)
  await kayitla(page)
  await page.goto('./#/bolge/koy')

  // Koydaki sonuç: top + lar + ım. Cepteki kelimede kökün ve iki ekin etiketi aynı ende.
  await bukalemun(page, 'lar').tap()
  await kart(page).tap()
  await bukalemun(page, 'ım').tap()
  await kart(page).tap()
  await expect(sonraki(page)).toBeVisible()
  const cep = await kelimeEtiketleri(page.locator('.cep__yazi .sonuc-kelime'))
  expect(cep.map((e) => e.map((x) => x.harf).join(''))).toEqual(['oaı'])
  for (const etiket of cep[0]!) {
    expect(etiket.zemin).toBe(RENKSIZ_GRI)
    expect(etiket.en).toBeCloseTo(cep[0]![0]!.en, 0)
  }

  // Akşam ekranı: atlar (kalın), evler (ince), toplarım (kalın).
  await sonraki(page).tap()
  const aksam = page.locator('.aksam__kelimeler .sonuc-kelime')
  await expect(aksam).toHaveCount(3)
  denetle(await kelimeEtiketleri(aksam), 'akşam')

  // Sözlük kartları: aynı kurallar.
  await page.getByRole('button', { name: 'Haritaya dön' }).click()
  await gezinme(page, 'Sözlük').click()
  const sozluk = page.locator('.sozluk-karti__parcalar')
  await expect(sozluk).toHaveCount(3)
  denetle(await kelimeEtiketleri(sozluk), 'Sözlük')
  expect(hatalar).toEqual([])
})

test("Sözlük kartında kök ve ek satırı kırılmaz: 360–412 px'te topum ve toplarım tek satır", async ({
  page,
}) => {
  const kart = (kelime: string, etiketler: string[], dakika: number) => ({
    kelime,
    kok: 'top',
    etiketler,
    bolge: 'koy',
    tarih: `2026-10-01T10:0${dakika}:00.000Z`,
    sonKurulma: `2026-10-01T10:0${dakika}:00.000Z`,
  })
  await page.addInitScript(
    ([anahtar, kayit]) => localStorage.setItem(anahtar, kayit),
    [
      ANAHTAR,
      JSON.stringify({
        kartlar: [kart('toplar', ['PL'], 1), kart('topum', ['POSS.1SG'], 2), kart('toplarım', ['PL', 'POSS.1SG'], 3)],
      }),
    ] as const,
  )
  for (const en of [360, 375, 390, 412]) {
    await page.setViewportSize({ width: en, height: 760 })
    await page.goto('./#/sozluk')
    await expect(page.locator('.sozluk-karti')).toHaveCount(3)
    await page.evaluate(() => document.fonts.ready)
    for (const kelime of ['topum', 'toplarım']) {
      const parcalar = page
        .locator('.sozluk-karti')
        .filter({ has: page.getByRole('heading', { name: kelime, exact: true }) })
        .locator('.sozluk-karti__parcalar')
      // Bütün parçalar (kök, artı, ekler) ilk parçanın yüksekliği içinde: tek satır.
      const satirlar = await parcalar.evaluate((p) => {
        const kutular = [...p.children].map((c) => c.getBoundingClientRect())
        const ilk = kutular[0]!
        return kutular.filter((k) => k.top + k.height / 2 > ilk.bottom || k.top + k.height / 2 < ilk.top).length
      })
      expect(satirlar, `${en}px: ${kelime}`).toBe(0)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${en}px`).toBeLessThanOrEqual(0)
  }

  // Ekran yeniden yüklenmeden daralınca (tek sütun) geniş kart kalmaz, Sözlük taşmaz: iki
  // sütunluk kartın açtığı örtük sütun sayılmaz.
  await expect(page.locator('.sozluk__kartlar > [data-genis]')).not.toHaveCount(0)
  await page.setViewportSize({ width: 300, height: 760 })
  await expect(page.locator('.sozluk__kartlar > [data-genis]')).toHaveCount(0)
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('.sozluk__kartlar')!).gridTemplateColumns.split(' ').length)).toBe(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0)
})
