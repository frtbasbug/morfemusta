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
  dugmeyleOyna,
} from './yardimcilar.ts'

// Bu dosyadaki testler Düğmeyle ayarında koşar (yardimcilar.ts, dugmeyleOyna).
test.beforeEach(({ page }) => dugmeyleOyna(page))

// Kök Bahçesi: çocuk ekleri sırayla ağaca taşır. Yapım eki gövdeyi bir halka büyütür, yeni
// kelime kart olarak düşer; çekim eki meyve olur. Oyun hedefi, yüzeyleri ve gövde kelimelerini
// motordan alır; burada yalnız testlerin beklediği sonuçlar yazılıdır.

/** Her ağacın ekleri (doğru sırayla), hedefi ve gövdeden düşen kartları. */
const AGACLAR = [
  { ekler: ['çi', 'ler'], hedef: 'çiçekçiler', kartlar: ['çiçekçi'] },
  { ekler: ['luk', 'lar'], hedef: 'tuzluklar', kartlar: ['tuzluk'] },
  { ekler: ['lı', 'cı'], hedef: 'tatlıcı', kartlar: ['tatlı', 'tatlıcı'] },
  { ekler: ['siz', 'lik'], hedef: 'sessizlik', kartlar: ['sessiz', 'sessizlik'] },
  { ekler: ['çık', 'lar'], hedef: 'kitapçıklar', kartlar: ['kitapçık'] },
  { ekler: ['cu', 'luk'], hedef: 'yolculuk', kartlar: ['yolcu', 'yolculuk'] },
  { ekler: ['lik', 'im'], hedef: 'kalemliğim', kartlar: ['kalemlik'] },
  { ekler: ['cik', 'im'], hedef: 'kediciğim', kartlar: ['kedicik'] },
  { ekler: ['suz', 'luk'], hedef: 'susuzluk', kartlar: ['susuz', 'susuzluk'] },
  { ekler: ['lük', 'çü', 'ler'], hedef: 'gözlükçüler', kartlar: ['gözlük', 'gözlükçü'] },
] as const

const BITTI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const agac = (sayfa: Page) => sayfa.locator('button.bahce__agac')
const neden = (sayfa: Page) => sayfa.locator('.bahce__neden')
const kartlar = (sayfa: Page) => sayfa.locator('.bahce__kartlar .sonuc-kelime__okunan')

/** Koy ve dükkân bitmiş olarak açar (bahçede kalınan ağaçla) ve haritadan bahçeye girer. */
async function bahceyiAc(sayfa: Page, kaldigi = 0) {
  await sayfa.goto('./')
  await sayfa.evaluate(
    ([anahtar, kayit]) => localStorage.setItem(anahtar, kayit),
    [
      ANAHTAR,
      JSON.stringify({
        bolgeler: {
          koy: { bitenler: BITTI, kaldigi: 10 },
          dukkan: { bitenler: BITTI, kaldigi: 10 },
          ...(kaldigi > 0 ? { bahce: { bitenler: BITTI.slice(0, kaldigi), kaldigi } } : {}),
        },
      }),
    ] as const,
  )
  await sayfa.reload()
  await bolge(sayfa, 'Kök Bahçesi').click()
  await expect(sayfa.getByRole('heading', { level: 1, name: 'Kök Bahçesi' })).toBeVisible()
  await expect(sira(sayfa)).toHaveText(`Görev ${kaldigi + 1} / 10`)
}

/** Ek seçilebilir olana kadar bekler: önceki büyü bitmiştir. */
const secilebilir = (sayfa: Page, yuzey: string) =>
  expect(bukalemun(sayfa, yuzey)).toHaveAttribute('aria-disabled', 'false')

/** Eki dokun-dokun ağaca taşır. */
async function tasi(sayfa: Page, yuzey: string) {
  await secilebilir(sayfa, yuzey)
  await bukalemun(sayfa, yuzey).tap()
  await agac(sayfa).tap()
}

test.describe('Kök Bahçesi', () => {
  test('10 ağaç dokun-dokun büyür; gövdeden 15 kart düşer, akşam ekranına varılır', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(150_000)
    const hatalar = hatalariTopla(page)
    const disIstekler = disIstekleriTopla(page, baseURL)
    await bahceyiAc(page)

    for (const [yer, a] of AGACLAR.entries()) {
      await expect(sira(page)).toHaveText(`Görev ${yer + 1} / 10`)
      await expect(page.locator('.tabela')).toHaveText(`Hedef: ${a.hedef}`)
      for (const yuzey of a.ekler) await tasi(page, yuzey)
      await expect(sonraki(page)).toBeVisible()
      await expect(agac(page)).toHaveAccessibleName(`Ağaç: ${a.hedef}`)
      await expect(kartlar(page)).toHaveText([...a.kartlar])
      await expect(page.locator('.sepet .sepet__ek')).toHaveCount(0)
      await sonraki(page).tap()
    }

    await expect(page.getByRole('heading', { level: 1, name: 'Bahçede akşam oldu' })).toBeVisible()
    const gunun = AGACLAR.flatMap((a) => a.kartlar)
    expect(gunun).toHaveLength(15)
    await expect(page.locator('.aksam__kelimeler .sonuc-kelime__okunan')).toHaveText(gunun)
    // Turun puanı ve yıldızları: her ek ayrı yerleştirme (21), hepsi ilk denemede, yedi seri.
    await expect(page.locator('.aksam__puan')).toContainText('Puan: 245')
    await expect(page.getByRole('img', { name: '3 yıldızdan 3' })).toBeVisible()
    await expect(page.getByText(/süre|skor/i)).toHaveCount(0)
    await page.getByRole('button', { name: 'Haritaya dön' }).click()
    await expect(bolge(page, 'Kök Bahçesi')).toHaveAccessibleName('Kök Bahçesi, Tamam, 3 yıldızdan 3')
    // Bahçe bitince Uydurukçuklar açılır ve girilir.
    await expect(bolge(page, 'Uydurukçuklar')).toHaveAccessibleName('Uydurukçuklar, Açık')
    await bolge(page, 'Uydurukçuklar').click()
    await expect(page.getByRole('heading', { level: 1, name: 'Uydurukçuklar' })).toBeVisible()
    await expect(sira(page)).toHaveText('1. tur · Görev 1 / 10')
    await page.getByRole('button', { name: 'Harita', exact: true }).click()
    await expect(haritaBasligi(page)).toBeVisible()

    // Sözlük'te kart gövdeden: çiçekçi var, çiçekçiler yok.
    await gezinme(page, 'Sözlük').click()
    const grup = page.getByRole('region', { name: 'Kök Bahçesi' })
    await expect(grup.locator('.sozluk-karti__kelime')).toHaveCount(15)
    await expect(grup.locator('.sozluk-karti__kelime', { hasText: /^çiçekçi$/ })).toHaveCount(1)
    await expect(page.locator('.sozluk-karti__kelime', { hasText: /^çiçekçiler$/ })).toHaveCount(0)

    expect(hatalar).toEqual([])
    expect(disIstekler).toEqual([])
  })

  test('1. ağaçta önce ler seçilince: meyvenin üstüne gövde çıkmaz; ek sepete döner', async ({
    page,
  }) => {
    await bahceyiAc(page)
    await expect(agac(page)).toHaveAccessibleName('Ağaç: çiçek')
    await tasi(page, 'ler')
    await expect(neden(page)).toHaveText('Meyvenin üstüne gövde çıkmaz: önce çi.')
    await expect(bukalemun(page, 'ler')).toHaveAttribute('aria-disabled', 'false')
    await expect(page.locator('.agac .meyve')).toHaveCount(0)
    await expect(agac(page)).toHaveAccessibleName('Ağaç: çiçek')
    await expect(sira(page)).toHaveText('Görev 1 / 10')

    // Doğru sırayla: halka büyür, kart düşer; sonra meyve üçe çoğalır.
    await tasi(page, 'çi')
    await expect(page.locator('.agac .agac__halka')).toHaveCount(1)
    await expect(kartlar(page)).toHaveText(['çiçekçi'])
    await expect(neden(page)).toBeEmpty()
    await tasi(page, 'ler')
    await expect(sonraki(page)).toBeVisible()
    await expect(page.locator('.agac .meyve')).toHaveCount(3)
    // Meyve kart düşürmez.
    await expect(kartlar(page)).toHaveText(['çiçekçi'])
  })

  test('6. ağaçta önce luk seçilince: yolculuk: önce cu, sonra luk.', async ({ page }) => {
    await bahceyiAc(page, 5)
    await tasi(page, 'luk')
    await expect(neden(page)).toHaveText('yolculuk: önce cu, sonra luk.')
    await expect(page.locator('.agac .agac__halka')).toHaveCount(0)
  })

  test('7. ağaçta meyve gövdenin sonunu eritir: kalemlik → kalemliğim; meyve cebe girer', async ({
    page,
  }) => {
    await bahceyiAc(page, 6)
    await tasi(page, 'lik')
    await expect(kartlar(page)).toHaveText(['kalemlik'])
    await tasi(page, 'im')
    await expect(sonraki(page)).toBeVisible()
    await expect(neden(page)).toHaveText('kalemlik → kalemliğim')
    await expect(page.locator('.agac__halka .bahce__yuva .karo--jole')).toHaveCount(1)
    await expect(page.locator('.bahce__cep .meyve')).toHaveCount(1)
    await expect(page.locator('.agac .meyve')).toHaveCount(0)
  })

  test('büyüler kartlarda: -lI katar, -sIz eksiltir, -CIk küçültür', async ({ page }) => {
    await bahceyiAc(page, 2)
    await tasi(page, 'lı')
    await expect(page.locator('.bahce-karti__onceki:not(.bahce-karti__onceki--silindi)')).toHaveCount(1)
    await tasi(page, 'cı')
    await sonraki(page).tap()
    await tasi(page, 'siz')
    await expect(page.locator('.bahce-karti__onceki--silindi')).toHaveCount(1)
    await tasi(page, 'lik')
    await sonraki(page).tap()
    await tasi(page, 'çık')
    await expect(page.locator('.bahce-karti--kucuk')).toHaveCount(1)
  })

  test('1. ağaç klavyeyle oynanır: Tab ve Enter', async ({ page }) => {
    await bahceyiAc(page)
    for (const yuzey of ['çi', 'ler']) {
      const ek = bukalemun(page, yuzey)
      await secilebilir(page, yuzey)
      for (let i = 0; i < 10 && !(await ek.evaluate((el) => el === document.activeElement)); i++) {
        await page.keyboard.press('Tab')
      }
      await expect(ek).toBeFocused()
      await page.keyboard.press('Enter')
      await expect(ek).toHaveAttribute('aria-pressed', 'true')
      // Seçilen ek ağaca götürülmeyi bekler: odak ağaçta.
      await expect(agac(page)).toBeFocused()
      await page.keyboard.press('Enter')
    }
    await expect(sonraki(page)).toBeFocused()
    await expect(agac(page)).toHaveAccessibleName('Ağaç: çiçekçiler')
    await page.keyboard.press('Enter')
    await expect(sira(page)).toHaveText('Görev 2 / 10')
  })

  test('1. ağaç sürükle-bırakla oynanır (Pointer Events)', async ({ page }) => {
    await bahceyiAc(page)
    const surukle = async (yuzey: string, disari = false) => {
      await secilebilir(page, yuzey)
      const kaynak = (await bukalemun(page, yuzey).boundingBox())!
      const hedef = (await agac(page).boundingBox())!
      await page.mouse.move(kaynak.x + kaynak.width / 2, kaynak.y + kaynak.height / 2)
      await page.mouse.down()
      if (disari) {
        await page.mouse.move(kaynak.x + kaynak.width / 2, kaynak.y - 10, { steps: 6 })
      } else {
        await page.mouse.move(hedef.x + hedef.width / 2, hedef.y + hedef.height / 2, { steps: 12 })
        await expect(agac(page)).toHaveClass(/bahce__agac--ustunde/)
      }
      await page.mouse.up()
    }
    // Ağacın dışına bırakılan ek yerine döner; taşıma sayılmaz.
    await surukle('çi', true)
    await expect(neden(page)).toBeEmpty()
    await expect(page.locator('.agac .agac__halka')).toHaveCount(0)

    await surukle('çi')
    await expect(page.locator('.agac .agac__halka')).toHaveCount(1)
    await expect(bukalemun(page, 'çi')).toHaveCount(0)
    await surukle('ler')
    await expect(sonraki(page)).toBeVisible()
    await expect(agac(page)).toHaveAccessibleName('Ağaç: çiçekçiler')
  })

  test.describe('hareket azaltma açıkken', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } })

    test('yalnız durum değişir: halka, kart ve meyve hemen yerinde', async ({ page }) => {
      await bahceyiAc(page, 6)
      await tasi(page, 'lik')
      await expect(kartlar(page)).toHaveText(['kalemlik'])
      await tasi(page, 'im')
      await expect(sonraki(page)).toBeVisible()
      await expect(neden(page)).toHaveText('kalemlik → kalemliğim')
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
    })
  })

  test("en yüksek ağaç telefonda, 360×640'ta ve 320×568'de kaydırmadan sığar; dokunma alanları en az 44 px", async ({
    page,
  }) => {
    for (const boyut of [null, { width: 360, height: 640 }, { width: 320, height: 568 }]) {
      if (boyut) await page.setViewportSize(boyut)
      const etiket = `${boyut?.width ?? 'Pixel 7'}`
      await bahceyiAc(page, 9)
      const denetle = async () => {
        expect(await yatayTasma(page), etiket).toBe(0)
        expect(await dikeyTasma(page), etiket).toBe(0)
        for (const oge of await page.locator('.sepet__ek, .bahce__agac, .bolge-ustu__harita').all()) {
          const kutu = (await oge.boundingBox())!
          expect(Math.min(kutu.width, kutu.height), etiket).toBeGreaterThanOrEqual(44)
        }
      }
      // Başta: sepette üç ek; yanlış seçimin cümlesi de görünür.
      await tasi(page, 'ler')
      await expect(neden(page)).not.toBeEmpty()
      await denetle()
      for (const yuzey of ['lük', 'çü', 'ler']) await tasi(page, yuzey)
      await expect(sonraki(page)).toBeVisible()
      await denetle()
    }
  })

  test("Renksiz'de halka ile meyve biçimle ayrılır; gövde ve taç aynı gri", async ({ page }) => {
    await bahceyiAc(page)
    await page.evaluate(() => {
      document.documentElement.dataset.renkler = 'renksiz'
    })
    await tasi(page, 'çi')
    await tasi(page, 'ler')
    await expect(sonraki(page)).toBeVisible()
    const dolgu = (secici: string) =>
      page.locator(secici).first().evaluate((el) => getComputedStyle(el).fill)
    expect(await dolgu('.agac__halka .agac__govde')).toBe(await dolgu('.agac__tac .agac__yaprak'))
    // Halka bir bant (yol), meyve bir daire.
    await expect(page.locator('.agac__halka svg path')).toHaveCount(1)
    await expect(page.locator('.agac .meyve svg circle')).toHaveCount(3)
  })

  test('Harita düğmesi haritaya döner', async ({ page }) => {
    await bahceyiAc(page)
    await page.getByRole('button', { name: 'Harita', exact: true }).click()
    await expect(haritaBasligi(page)).toBeVisible()
  })
})
