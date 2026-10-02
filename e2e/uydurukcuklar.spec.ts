import { expect, test, type Page } from '@playwright/test'
import {
  ANAHTAR,
  bolge,
  bukalemun,
  dikeyTasma,
  disIstekleriTopla,
  gezinme,
  haritaBasligi,
  hatalariTopla,
  sira,
  sonraki,
  yatayTasma,
} from './yardimcilar.ts'

// Uydurukçuklar: uydurma yaratıklarla wug görevleri. Oyun doğru biçimi motordan alır; burada
// yalnız testlerin beklediği sonuçlar yazılıdır (1. turun on görevi, sırayla). Sınır adımı
// olan görevlerde (gıvak, zitep) karo da seçilir: iki karo da doğrudur.

const GOREVLER = [
  { kok: 'fıngıl', yuzey: 'lar', kelime: 'fıngıllar' },
  { kok: 'nöfel', yuzey: 'ler', kelime: 'nöfeller' },
  { kok: 'pobul', yuzey: 'um', kelime: 'pobulum' },
  { kok: 'gıvak', yuzey: 'ım', karo: 'jöle', kelime: 'gıvağım' },
  { kok: 'mömüş', yuzey: 'te', kelime: 'mömüşte' },
  { kok: 'cofar', yuzey: 'da', kelime: 'cofarda' },
  { kok: 'zolku', yuzey: 'da', kelime: 'zolkuda' },
  { kok: 'zelü', yuzey: 'ye', kelime: 'zelüye' },
  { kok: 'kıbı', yuzey: 'ya', kelime: 'kıbıya' },
  { kok: 'zitep', yuzey: 'im', karo: 'taş', kelime: 'zitepim' },
] as const

const bir = (n: number) => Array.from({ length: n }, (_, i) => i + 1)
const BAHCE_BITTI = {
  bolgeler: {
    koy: { bitenler: bir(10), kaldigi: 10 },
    dukkan: { bitenler: bir(10), kaldigi: 10 },
    bahce: { bitenler: bir(10), kaldigi: 10 },
  },
}

const baslik = (sayfa: Page) => sayfa.getByRole('heading', { level: 1, name: 'Uydurukçuklar' })
const hedef = (sayfa: Page) => sayfa.locator('button.uyduruk__hedef')
const neden = (sayfa: Page) => sayfa.locator('.uyduruk__neden')
const karo = (sayfa: Page, tur: 'taş' | 'jöle') =>
  sayfa.getByRole('button', { name: tur === 'taş' ? /^., sert$/ : /^., yumuşak$/ })

/** Bahçe bitmiş olarak açar (kalınan yer verilebilir) ve haritadan Uydurukçuklar'a girer. */
async function uydurugaGir(sayfa: Page, kaldigi?: number) {
  await sayfa.goto('./')
  const kayit =
    kaldigi === undefined
      ? BAHCE_BITTI
      : { bolgeler: { ...BAHCE_BITTI.bolgeler, uyduruk: { bitenler: [], kaldigi } } }
  await sayfa.evaluate(
    ([anahtar, metin]) => localStorage.setItem(anahtar, metin),
    [ANAHTAR, JSON.stringify(kayit)] as const,
  )
  await sayfa.reload()
  await bolge(sayfa, 'Uydurukçuklar').click()
  await expect(baslik(sayfa)).toBeVisible()
}

/** Bukalemun (ya da karo) seçilebilir olana kadar bekler: önceki taşımanın hareketi bitti. */
async function secilebilir(oge: ReturnType<Page['locator']>) {
  await expect(oge).toHaveAttribute('aria-disabled', 'false')
}

/** Görevi dokun-dokun oynar; karo verilirse sınır adımında onu seçer. */
async function gorevOyna(sayfa: Page, gorev: (typeof GOREVLER)[number], secilenKaro?: 'taş' | 'jöle') {
  await bukalemun(sayfa, gorev.yuzey).tap()
  await hedef(sayfa).tap()
  const k = secilenKaro ?? ('karo' in gorev ? gorev.karo : undefined)
  if (k) {
    await secilebilir(karo(sayfa, k))
    await karo(sayfa, k).tap()
    await hedef(sayfa).tap()
  }
  await expect(sonraki(sayfa)).toBeVisible()
}

test.describe('Uydurukçuklar', () => {
  test('1. tur dokun-dokun oynanır, akşam ekranına varılır; ikinci girişte 2. turun ilk yaratığı', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(180_000)
    const hatalar = hatalariTopla(page)
    const disIstekler = disIstekleriTopla(page, baseURL)
    await uydurugaGir(page)

    for (const [yer, gorev] of GOREVLER.entries()) {
      await expect(sira(page)).toHaveText(`1. tur · Görev ${yer + 1} / 10`)
      await expect(hedef(page)).toHaveAccessibleName(gorev.kok)
      await gorevOyna(page, gorev)
      await expect(page.locator('.uyduruk__sahne')).not.toContainText(/puan|skor|süre/i)
      await sonraki(page).tap()
    }

    await expect(page.getByRole('heading', { level: 1, name: 'Uydurukçuklarda akşam oldu' })).toBeVisible()
    await expect(page.locator('.aksam__kelimeler .sonuc-kelime__okunan')).toHaveText(
      GOREVLER.map((g) => g.kelime),
    )
    await expect(page.getByText(/puan|seri|süre|skor/i)).toHaveCount(0)
    await page.getByRole('button', { name: 'Haritaya dön' }).click()
    // İlk tur bitince bölge tamam.
    await expect(bolge(page, 'Uydurukçuklar')).toHaveAccessibleName('Uydurukçuklar, Tamam')

    // İkinci giriş: 2. turun ilk yaratığı; üst çubukta tur numarası da yazar.
    await bolge(page, 'Uydurukçuklar').click()
    await expect(sira(page)).toHaveText('2. tur · Görev 1 / 10')
    await expect(hedef(page)).toHaveAccessibleName('pıbız')
    await page.getByRole('button', { name: 'Harita', exact: true }).click()
    await expect(haritaBasligi(page)).toBeVisible()

    // Sözlük'te on kart; uydurma kelimelerin köşesinde yaratık işareti.
    await gezinme(page, 'Sözlük').click()
    const grup = page.getByRole('region', { name: 'Uydurukçuklar' })
    await expect(grup.locator('.sozluk-karti__kelime')).toHaveText(
      GOREVLER.map((g) => g.kelime).reverse(),
    )
    await expect(grup.locator('.sozluk-karti__yaratik')).toHaveCount(10)

    expect(hatalar).toEqual([])
    expect(disIstekler).toEqual([])
  })

  test('yarım kalan tur kaldığı yerden sürer', async ({ page }) => {
    await uydurugaGir(page)
    await gorevOyna(page, GOREVLER[0])
    await page.reload()
    await expect(baslik(page)).toBeVisible()
    await expect(sira(page)).toHaveText('1. tur · Görev 2 / 10')
    await expect(hedef(page)).toHaveAccessibleName('nöfel')
  })

  test('8. görevde (zelü) e seçilince bukalemun düşer; kaynaştırma cümlesi, ilgili iki ses', async ({
    page,
  }) => {
    await uydurugaGir(page, 7)
    await expect(hedef(page)).toHaveAccessibleName('zelü')
    await expect(page.getByRole('button', { name: /bukalemunu,/ })).toHaveCount(4)
    await bukalemun(page, 'e').tap()
    await hedef(page).tap()
    await expect(neden(page).locator('.uyduruk__cumle')).toHaveText(
      'İki ünlü yan yana gelmez: araya y girer.',
    )
    // İlgili iki ses: ü ve e, yan yana iki ünlü, etiketlerinde.
    await expect(neden(page).locator('.uyduruk__aday .unlu-etiketi')).toHaveText(['ü', 'e'])
    await expect(bukalemun(page, 'e')).toHaveAttribute('aria-disabled', 'false')
    await expect(sira(page)).toHaveText('1. tur · Görev 8 / 10')
    await expect(page.getByText(/puan|skor|süre/i)).toHaveCount(0)

    await bukalemun(page, 'ye').tap()
    await hedef(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await expect(hedef(page)).toHaveAccessibleName('zelüye')
  })

  test('5. görevde (mömüş) de seçilince benzeşme cümlesi: ş sert, ekin başı da sert olur', async ({
    page,
  }) => {
    await uydurugaGir(page, 4)
    await expect(hedef(page)).toHaveAccessibleName('mömüş')
    // Kıyıda dört kılık: da, de, ta, te.
    await expect(page.getByRole('button', { name: /bukalemunu,/ })).toHaveCount(4)
    for (const yuzey of ['da', 'de', 'ta', 'te']) await expect(bukalemun(page, yuzey)).toHaveCount(1)
    await bukalemun(page, 'de').tap()
    await hedef(page).tap()
    await expect(neden(page).locator('.uyduruk__cumle')).toHaveText('ş sert, ekin başı da sert olur: t.')
    // İlgili iki ses: ş ve d, çerçevede.
    await expect(neden(page).locator('.uyduruk__aday .uyduruk__ses')).toHaveText(['ş', 'd'])
    await secilebilir(bukalemun(page, 'te'))
    await bukalemun(page, 'te').tap()
    await hedef(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await expect(hedef(page)).toHaveAccessibleName('mömüşte')
  })

  test('7. görevde (zolku) ta seçilince: Ünlüden sonra ekin başı yumuşak kalır', async ({ page }) => {
    await uydurugaGir(page, 6)
    await expect(hedef(page)).toHaveAccessibleName('zolku')
    await bukalemun(page, 'ta').tap()
    await hedef(page).tap()
    await expect(neden(page).locator('.uyduruk__cumle')).toHaveText(
      'Ünlüden sonra ekin başı yumuşak kalır: d.',
    )
    // İlgili iki ses: u etikette, t çerçevede.
    await expect(neden(page).locator('.uyduruk__aday .unlu-etiketi')).toHaveText('u')
    await expect(neden(page).locator('.uyduruk__aday .uyduruk__ses')).toHaveText('t')
    await secilebilir(bukalemun(page, 'da'))
    await bukalemun(page, 'da').tap()
    await hedef(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await expect(hedef(page)).toHaveAccessibleName('zolkuda')
  })

  for (const secilen of ['jöle', 'taş'] as const) {
    const kelime = secilen === 'jöle' ? 'gıvağım' : 'gıvakım'
    test(`4. görevde (gıvak) ${secilen} seçilince Sözlük'te ${kelime} kartı`, async ({ page }) => {
      await uydurugaGir(page, 3)
      await bukalemun(page, 'ım').tap()
      await hedef(page).tap()
      // Doğru bukalemundan sonra tezgâh: taş solda, jöle sağda.
      await secilebilir(karo(page, secilen))
      await expect(hedef(page)).toHaveAccessibleName('gıva … ım')
      const [t, j] = [(await karo(page, 'taş').boundingBox())!, (await karo(page, 'jöle').boundingBox())!]
      expect(t.x).toBeLessThan(j.x)
      await karo(page, secilen).tap()
      await hedef(page).tap()
      await expect(sonraki(page)).toBeVisible()
      await expect(neden(page)).toHaveText('İkisi de olur: gıvakım, gıvağım.')
      await expect(page.locator('.uyduruk__cep .sonuc-kelime__okunan')).toHaveText(kelime)

      await page.getByRole('button', { name: 'Harita', exact: true }).click()
      await gezinme(page, 'Sözlük').click()
      const grup = page.getByRole('region', { name: 'Uydurukçuklar' })
      await expect(grup.locator('.sozluk-karti__kelime')).toHaveText([kelime])
      // Kart yeniden yüklemeden sonra da kayıttan okunur.
      await page.reload()
      await expect(grup.locator('.sozluk-karti__kelime')).toHaveText([kelime])
    })
  }

  test('1. görev klavyeyle oynanır: Tab ve Enter', async ({ page }) => {
    await uydurugaGir(page)
    const lar = bukalemun(page, 'lar')
    for (let i = 0; i < 10 && !(await lar.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab')
    }
    await expect(lar).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(lar).toHaveAttribute('aria-pressed', 'true')
    // Seçilen bukalemun yaratığa götürülmeyi bekler: odak yaratıkta.
    await expect(hedef(page)).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(sonraki(page)).toBeFocused()
    await expect(hedef(page)).toHaveAccessibleName('fıngıllar')
    await expect(page.locator('.uyduruk__kopya')).toHaveCount(2)
    await page.keyboard.press('Enter')
    await expect(sira(page)).toHaveText('1. tur · Görev 2 / 10')
  })

  test('1. görev sürükle-bırakla oynanır (Pointer Events)', async ({ page }) => {
    await uydurugaGir(page)
    const lar = bukalemun(page, 'lar')
    const kaynak = (await lar.boundingBox())!
    const h = (await hedef(page).boundingBox())!

    // Yaratığın dışına bırakılan bukalemun yerine döner; taşıma sayılmaz.
    await page.mouse.move(kaynak.x + kaynak.width / 2, kaynak.y + kaynak.height / 2)
    await page.mouse.down()
    await page.mouse.move(kaynak.x + kaynak.width / 2, kaynak.y - 20, { steps: 6 })
    await page.mouse.up()
    await expect(neden(page)).toBeEmpty()
    await expect(lar).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(() => lar.evaluate((el) => el.getBoundingClientRect().top)).toBeCloseTo(kaynak.y, 0)

    await page.mouse.move(kaynak.x + kaynak.width / 2, kaynak.y + kaynak.height / 2)
    await page.mouse.down()
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2, { steps: 12 })
    await expect(hedef(page)).toHaveClass(/uyduruk__hedef--ustunde/)
    await page.mouse.up()
    await expect(sonraki(page)).toBeVisible()
    await expect(hedef(page)).toHaveAccessibleName('fıngıllar')
  })

  test('sınır adımında karo da sürükle-bırakla taşınır', async ({ page }) => {
    await uydurugaGir(page, 3)
    await bukalemun(page, 'ım').tap()
    await hedef(page).tap()
    const jole = karo(page, 'jöle')
    await secilebilir(jole)
    const kaynak = (await jole.boundingBox())!
    const h = (await hedef(page).boundingBox())!
    await page.mouse.move(kaynak.x + kaynak.width / 2, kaynak.y + kaynak.height / 2)
    await page.mouse.down()
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2, { steps: 12 })
    await page.mouse.up()
    await expect(sonraki(page)).toBeVisible()
    await expect(page.locator('.uyduruk__cep .sonuc-kelime__okunan')).toHaveText('gıvağım')
  })

  test.describe('hareket azaltma açıkken', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } })

    test('yalnız durum değişir: yıldız yerinde, hiçbir hareket yok', async ({ page }) => {
      await uydurugaGir(page, 4)
      await bukalemun(page, 'te').tap()
      await hedef(page).tap()
      await expect(sonraki(page)).toBeVisible()
      await expect(page.locator('.uyduruk__yildiz--ustte')).toHaveCount(1)
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
    })
  })

  test("telefonda, 360×640'ta ve 320×568'de kaydırmadan sığar; dokunma alanları en az 44 px", async ({
    page,
  }) => {
    for (const boyut of [null, { width: 360, height: 640 }, { width: 320, height: 568 }]) {
      if (boyut) await page.setViewportSize(boyut)
      const etiket = `${boyut?.width ?? 'Pixel 7'}`
      // gıvak: dört bukalemun ve cep; yanlış seçimin cümlesi de görünür.
      await uydurugaGir(page, 3)
      const denetle = async () => {
        expect(await yatayTasma(page), etiket).toBe(0)
        expect(await dikeyTasma(page), etiket).toBe(0)
        for (const oge of await page
          .locator('.uyduruk__bukalemun, .uyduruk__karo, .uyduruk__hedef, .bolge-ustu__harita')
          .all()) {
          const kutu = (await oge.boundingBox())!
          expect(Math.min(kutu.width, kutu.height), etiket).toBeGreaterThanOrEqual(44)
        }
      }
      await bukalemun(page, 'üm').tap()
      await hedef(page).tap()
      await expect(neden(page).locator('.uyduruk__cumle')).not.toBeEmpty()
      await denetle()
      await secilebilir(bukalemun(page, 'ım'))
      await bukalemun(page, 'ım').tap()
      await hedef(page).tap()
      await secilebilir(karo(page, 'taş'))
      await denetle()
      await karo(page, 'taş').tap()
      await hedef(page).tap()
      await expect(sonraki(page)).toBeVisible()
      await denetle()
    }
  })

  test("bulunmada dört bukalemun telefonda, 360×640'ta ve 320×568'de kaydırmadan sığar", async ({
    page,
  }) => {
    for (const boyut of [null, { width: 360, height: 640 }, { width: 320, height: 568 }]) {
      if (boyut) await page.setViewportSize(boyut)
      const etiket = `${boyut?.width ?? 'Pixel 7'}`
      // mömüş: dört bukalemun (da, de, ta, te); yanlış seçimin cümlesi de görünür.
      await uydurugaGir(page, 4)
      await expect(page.getByRole('button', { name: /bukalemunu,/ })).toHaveCount(4)
      const denetle = async () => {
        expect(await yatayTasma(page), etiket).toBe(0)
        expect(await dikeyTasma(page), etiket).toBe(0)
        for (const oge of await page.locator('.uyduruk__bukalemun, .uyduruk__hedef').all()) {
          const kutu = (await oge.boundingBox())!
          expect(Math.min(kutu.width, kutu.height), etiket).toBeGreaterThanOrEqual(44)
        }
      }
      await bukalemun(page, 'de').tap()
      await hedef(page).tap()
      await expect(neden(page).locator('.uyduruk__cumle')).not.toBeEmpty()
      await denetle()
      await secilebilir(bukalemun(page, 'te'))
      await bukalemun(page, 'te').tap()
      await hedef(page).tap()
      await expect(sonraki(page)).toBeVisible()
      await denetle()
    }
  })

  test("Renksiz'de yaratığın gövdesi gri; süsler ve yıldız yerinde", async ({ page }) => {
    await uydurugaGir(page, 4)
    await page.evaluate(() => {
      document.documentElement.dataset.renkler = 'renksiz'
    })
    const govde = page.locator('.uyduruk__yaratik .unlu__govde')
    const renksiz = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--renksiz').trim(),
    )
    expect(renksiz).not.toBe('')
    expect(await govde.evaluate((el) => getComputedStyle(el).fill)).toBe('rgb(142, 140, 153)')
  })

  test('Harita düğmesi haritaya döner', async ({ page }) => {
    await uydurugaGir(page)
    await page.getByRole('button', { name: 'Harita', exact: true }).click()
    await expect(haritaBasligi(page)).toBeVisible()
  })
})
