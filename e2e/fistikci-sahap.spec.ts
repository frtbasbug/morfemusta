import { expect, test, type Page } from '@playwright/test'
import {
  ANAHTAR,
  bolge,
  dikeyTasma,
  disIstekleriTopla,
  gezinme,
  haritaBasligi,
  hatalariTopla,
  sira,
  sonraki,
  yatayTasma,
} from './yardimcilar.ts'

// Fıstıkçı Şahap'ın Dükkânı: çocuk sınırdaki ünsüzü seçer, taş (sert) ya da jöle (yumuşak).
// Oyun doğru karoyu motordan alır; burada yalnız testlerin beklediği sonuçlar yazılıdır.

/** Her görevin doğru karosu ve kelimesi, sırayla. */
const GOREVLER = [
  { karo: 'jöle', kelime: 'kitabım' },
  { karo: 'jöle', kelime: 'köpeğim' },
  { karo: 'jöle', kelime: 'ağacı' },
  { karo: 'taş', kelime: 'topum' },
  { karo: 'taş', kelime: 'sütü' },
  { karo: 'taş', kelime: 'kitapta' },
  { karo: 'jöle', kelime: 'evde' },
  { karo: 'taş', kelime: 'balıkçı' },
  { karo: 'jöle', kelime: 'fıstığı' },
  { karo: 'taş', kelime: 'fıstıkçı' },
] as const

const KOY_BITTI = { bolgeler: { koy: { bitenler: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], kaldigi: 10 } } }
const BASLIK = "Fıstıkçı Şahap'ın Dükkânı"

const dukkanBasligi = (sayfa: Page) => sayfa.getByRole('heading', { level: 1, name: BASLIK })
const karo = (sayfa: Page, tur: 'taş' | 'jöle') =>
  sayfa.getByRole('button', { name: tur === 'taş' ? /^., sert$/ : /^., yumuşak$/ })
const kart = (sayfa: Page) => sayfa.locator('button.dukkan__kart')
const neden = (sayfa: Page) => sayfa.locator('.dukkan__neden')

/** Koy bitmiş olarak açar ve haritadan dükkâna girer. */
async function dukkaniAc(sayfa: Page) {
  await sayfa.goto('./')
  await sayfa.evaluate(
    ([anahtar, kayit]) => localStorage.setItem(anahtar, kayit),
    [ANAHTAR, JSON.stringify(KOY_BITTI)] as const,
  )
  await sayfa.reload()
  await bolge(sayfa, 'Dükkânı').click()
  await expect(dukkanBasligi(sayfa)).toBeVisible()
}

test.describe("Fıstıkçı Şahap'ın Dükkânı", () => {
  test('10 görev dokun-dokun oynanır; kelimeler rafa dizilir, akşam ekranına varılır; bahçe açılır', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(120_000)
    const hatalar = hatalariTopla(page)
    const disIstekler = disIstekleriTopla(page, baseURL)
    await dukkaniAc(page)

    for (const [yer, gorev] of GOREVLER.entries()) {
      await expect(sira(page)).toHaveText(`Görev ${yer + 1} / 10`)
      await karo(page, gorev.karo).tap()
      await kart(page).tap()
      await expect(sonraki(page)).toBeVisible()
      await expect(kart(page)).toHaveAccessibleName(gorev.kelime)
      await expect(page.locator('.raf__kelime')).toHaveText(GOREVLER.slice(0, yer + 1).map((g) => g.kelime))
      await sonraki(page).tap()
    }

    await expect(page.getByRole('heading', { level: 1, name: 'Dükkânda akşam oldu' })).toBeVisible()
    await expect(page.locator('.aksam__kelimeler .sonuc-kelime__okunan')).toHaveText(
      GOREVLER.map((g) => g.kelime),
    )
    await expect(page.getByText(/puan|seri|süre|skor/i)).toHaveCount(0)
    await page.getByRole('button', { name: 'Haritaya dön' }).click()
    await expect(bolge(page, 'Dükkânı')).toHaveAccessibleName(`${BASLIK}, Tamam`)
    // Dükkân bitince bahçe açılır ve girilir.
    await expect(bolge(page, 'Kök Bahçesi')).toHaveAccessibleName('Kök Bahçesi, Açık')
    await bolge(page, 'Kök Bahçesi').click()
    await expect(page.getByRole('heading', { level: 1, name: 'Kök Bahçesi' })).toBeVisible()
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await page.getByRole('button', { name: 'Harita', exact: true }).click()
    await expect(haritaBasligi(page)).toBeVisible()

    // Dükkânın kartları Sözlük'te, kendi bölgesinin altında.
    await gezinme(page, 'Sözlük').click()
    const grup = page.getByRole('region', { name: BASLIK })
    // Her grupta en yeni kart önde.
    await expect(grup.locator('.sozluk-karti__kelime')).toHaveText(
      GOREVLER.map((g) => g.kelime).reverse(),
    )

    expect(hatalar).toEqual([])
    expect(disIstekler).toEqual([])
  })

  test('1. görevde taş seçilince karo tezgâha döner, nedeni yazılır; ceza, puan ve süre yok', async ({
    page,
  }) => {
    await dukkaniAc(page)
    // Taş hep solda, jöle hep sağda; adları harf ve türü.
    const tas = page.getByRole('button', { name: 'p, sert' })
    const jole = page.getByRole('button', { name: 'b, yumuşak' })
    const [t, j] = [(await tas.boundingBox())!, (await jole.boundingBox())!]
    expect(t.x).toBeLessThan(j.x)
    await expect(kart(page)).toHaveAccessibleName('kita … ım')

    await tas.tap()
    await kart(page).tap()
    await expect(neden(page).locator('.dukkan__cumle')).toHaveText('p ünlüden önce jöle olur: b.')
    // İlgili iki ses vurgulu: p çerçevede, ı etikette.
    await expect(neden(page).locator('.dukkan__aday .dukkan__ses')).toHaveText('p')
    await expect(neden(page).locator('.dukkan__aday .unlu-etiketi')).toHaveText('ı')
    await expect(tas).toHaveAttribute('aria-disabled', 'false')
    await expect.poll(() => tas.evaluate((el) => el.getBoundingClientRect().top)).toBeCloseTo(t.y, 0)
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await expect(page.getByText(/puan|skor|süre/i)).toHaveCount(0)

    // Doğru karo oturur; yumuşama görünür: kitap → kitabım.
    await jole.tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await expect(neden(page)).toHaveText('kitap → kitabım')
  })

  test('1. görev klavyeyle oynanır: Tab ve Enter', async ({ page }) => {
    await dukkaniAc(page)
    const jole = karo(page, 'jöle')
    for (let i = 0; i < 8 && !(await jole.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab')
    }
    await expect(jole).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(jole).toHaveAttribute('aria-pressed', 'true')
    // Seçilen karo yuvaya götürülmeyi bekler: odak kelime kartında.
    await expect(kart(page)).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(sonraki(page)).toBeFocused()
    await expect(kart(page)).toHaveAccessibleName('kitabım')
    await page.keyboard.press('Enter')
    await expect(sira(page)).toHaveText('Görev 2 / 10')
    await expect(kart(page)).toHaveAccessibleName('köpe … im')
  })

  test('1. görev sürükle-bırakla oynanır (Pointer Events)', async ({ page }) => {
    await dukkaniAc(page)
    const jole = karo(page, 'jöle')
    const kaynak = (await jole.boundingBox())!
    const hedef = (await kart(page).boundingBox())!

    // Kelimenin dışına bırakılan karo yerine döner; taşıma sayılmaz.
    await page.mouse.move(kaynak.x + kaynak.width / 2, kaynak.y + kaynak.height / 2)
    await page.mouse.down()
    await page.mouse.move(kaynak.x - 20, kaynak.y + 200, { steps: 6 })
    await page.mouse.up()
    await expect(neden(page)).toBeEmpty()
    await expect(jole).toHaveAttribute('aria-pressed', 'false')
    await expect.poll(() => jole.evaluate((el) => el.getBoundingClientRect().top)).toBeCloseTo(kaynak.y, 0)

    await page.mouse.move(kaynak.x + kaynak.width / 2, kaynak.y + kaynak.height / 2)
    await page.mouse.down()
    await page.mouse.move(hedef.x + hedef.width / 2, hedef.y + hedef.height / 2, { steps: 12 })
    await expect(kart(page)).toHaveClass(/dukkan__kart--ustunde/)
    await page.mouse.up()

    await expect(sonraki(page)).toBeVisible()
    await expect(kart(page)).toHaveAccessibleName('kitabım')
    await expect(page.locator('.yuva .karo--jole')).toHaveCount(1)
  })

  test('parmakla sürükle-bırak da çalışır (dokunma olayları)', async ({ page }) => {
    await dukkaniAc(page)
    const kaynak = (await karo(page, 'jöle').boundingBox())!
    const hedef = (await kart(page).boundingBox())!
    const cdp = await page.context().newCDPSession(page)
    const dokun = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
      })
    const bas = { x: kaynak.x + kaynak.width / 2, y: kaynak.y + kaynak.height / 2 }
    const son = { x: hedef.x + hedef.width / 2, y: hedef.y + hedef.height / 2 }
    await dokun('touchStart', bas.x, bas.y)
    for (let i = 1; i <= 10; i++) {
      await dokun('touchMove', bas.x + ((son.x - bas.x) * i) / 10, bas.y + ((son.y - bas.y) * i) / 10)
    }
    await dokun('touchEnd', son.x, son.y)
    await expect(sonraki(page)).toBeVisible()
    await expect(kart(page)).toHaveAccessibleName('kitabım')
  })

  test.describe('hareket azaltma açıkken', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } })

    test('yalnız durum değişir: benzeşmede ekin jölesi taş olur (-da → kitapta)', async ({ page }) => {
      await page.goto('./')
      await page.evaluate(
        ([anahtar, kayit]) => localStorage.setItem(anahtar, kayit),
        [
          ANAHTAR,
          JSON.stringify({ bolgeler: { ...KOY_BITTI.bolgeler, dukkan: { bitenler: [1, 2, 3, 4, 5], kaldigi: 5 } } }),
        ] as const,
      )
      await page.reload()
      await bolge(page, 'Dükkânı').click()
      await expect(sira(page)).toHaveText('Görev 6 / 10')
      await page.getByRole('button', { name: 't, sert' }).tap()
      await kart(page).tap()
      await expect(sonraki(page)).toBeVisible()
      await expect(neden(page)).toHaveText('-da → kitapta')
      await expect(page.locator('.yuva .karo--tas')).toHaveCount(1)
      const hareketler = await page.evaluate(() => document.getAnimations().length)
      expect(hareketler).toBe(0)
    })
  })

  test('telefonda ve 360×640\'ta taşmaz; dokunma alanları en az 44 px', async ({ page }) => {
    for (const boyut of [null, { width: 360, height: 640 }, { width: 320, height: 568 }]) {
      if (boyut) await page.setViewportSize(boyut)
      await dukkaniAc(page)
      // En uzun kelime ve dolu raf: son görev.
      await page.evaluate(
        ([anahtar, kayit]) => localStorage.setItem(anahtar, kayit),
        [
          ANAHTAR,
          JSON.stringify({
            bolgeler: { ...KOY_BITTI.bolgeler, dukkan: { bitenler: [1, 2, 3, 4, 5, 6, 7, 8, 9], kaldigi: 9 } },
          }),
        ] as const,
      )
      await page.reload()
      await expect(page.locator('.raf__kelime')).toHaveCount(9)
      await karo(page, 'jöle').tap()
      await kart(page).tap()
      await expect(neden(page).locator('.dukkan__cumle')).toBeVisible()
      expect(await yatayTasma(page), `${boyut?.width ?? 'Pixel 7'}`).toBe(0)
      expect(await dikeyTasma(page), `${boyut?.width ?? 'Pixel 7'}`).toBe(0)
      for (const oge of await page.locator('.tezgah__karo, .dukkan__kart, .bolge-ustu__harita').all()) {
        const kutu = (await oge.boundingBox())!
        expect(Math.min(kutu.width, kutu.height)).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('Renksiz\'de taş ve jöle biçimleriyle ayrılır; renkleri aynı gri', async ({ page }) => {
    await dukkaniAc(page)
    await page.evaluate(() => {
      document.documentElement.dataset.renkler = 'renksiz'
    })
    const dolgu = (sinif: string) =>
      page.locator(`.tezgah .${sinif} .karo__govde`).evaluate((el) => getComputedStyle(el).fill)
    expect(await dolgu('karo--tas')).toBe(await dolgu('karo--jole'))
    const yol = (sinif: string) =>
      page.locator(`.tezgah .${sinif} .karo__govde`).getAttribute('d')
    expect(await yol('karo--tas')).not.toBe(await yol('karo--jole'))
  })

  test('görev biter bitmez sayfa kapansa da görev ve kart kaydedilir (raf hareketini beklemez)', async ({
    page,
  }) => {
    await page.goto('./')
    await page.evaluate(
      ([anahtar, kayit]) => localStorage.setItem(anahtar, kayit),
      [
        ANAHTAR,
        JSON.stringify({
          bolgeler: { ...KOY_BITTI.bolgeler, dukkan: { bitenler: [1, 2, 3, 4, 5, 6, 7, 8, 9], kaldigi: 9 } },
        }),
      ] as const,
    )
    await page.reload()
    await bolge(page, 'Dükkânı').click()
    await expect(sira(page)).toHaveText('Görev 10 / 10')

    // Sıradaki DOM'a girdiği anda (raf hareketi sürerken) kayıt okunur: sayfa o an kapansa
    // cihazda kalan kayıt budur. Görev ve kart, Sıradaki göründüğünde yazılmış olmalı.
    const kayitAni = page.evaluate(
      (anahtar) =>
        new Promise<string | null>((coz) => {
          const izleyici = new MutationObserver(() => {
            const dugmeler = [...document.querySelectorAll('button')]
            if (!dugmeler.some((d) => d.textContent === 'Sıradaki')) return
            izleyici.disconnect()
            coz(localStorage.getItem(anahtar))
          })
          izleyici.observe(document.body, { childList: true, subtree: true })
        }),
      ANAHTAR,
    )
    await karo(page, 'taş').tap()
    await kart(page).tap()
    const anlik = JSON.parse((await kayitAni) ?? '{}')
    expect(anlik.bolgeler?.dukkan?.bitenler).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(anlik.kartlar?.map((k: { kelime: string }) => k.kelime)).toEqual(['fıstıkçı'])
  })

  test('Harita düğmesi haritaya döner', async ({ page }) => {
    await dukkaniAc(page)
    await page.getByRole('button', { name: 'Harita', exact: true }).click()
    await expect(haritaBasligi(page)).toBeVisible()
  })
})
