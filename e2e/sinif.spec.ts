import { expect, test, type Page } from '@playwright/test'
import {
  ANAHTAR,
  bolge,
  bukalemun,
  disIstekleriTopla,
  gezinme,
  gorevleriOyna,
  haritaBasligi,
  haritaDugmesi,
  hatalariTopla,
  kart,
  sira,
  sonraki,
} from './yardimcilar.ts'

// Sınıf modu (etkileşimli tahta; DESIGN.md, "Koleksiyon ve modlar"): adreste ?sinif=1 açar,
// ?sinif=0 kapatır; seçim ayarlara yazılır. Açıkken bütün bölgeler açıktır; ilerleme, kartlar ve
// kalınan yer kayda yazılmaz, yalnız o açılış boyunca bellekte durur. Sınıf modu kapanınca
// cihazın kendi ilerlemesi olduğu gibi geri gelir. Görünüm geniş yatay ekran içindir:
// 1920×1080 ve 1366×768'de harita, dört bölge, Sözlük ve akşam ekranı kaydırmadan sığar;
// 1920×1080'de en küçük yazı 28 px, en küçük dokunma hedefi 64 px. Hızlı oynamak için hareket
// azaltma açıktır.

const tarih = '2026-09-30T10:00:00.000Z'
const koyKarti = (kelime: string, kok: string) => ({
  kelime,
  kok,
  etiketler: ['PL'],
  bolge: 'koy',
  tarih,
  sonKurulma: tarih,
})

/** Cihazın kendi kaydı: koyda üç görev, üç kart. Sınıf modu kapanınca aynen geri gelir. */
const CIHAZIN_KAYDI = {
  bolgeler: { koy: { bitenler: [1, 2, 3], kaldigi: 3 } },
  kartlar: [koyKarti('atlar', 'at'), koyKarti('evler', 'ev'), koyKarti('kuşlar', 'kuş')],
}

const BOLGELER = [
  ['koy', 'Bukalemun Koyu'],
  ['dukkan', "Fıstıkçı Şahap'ın Dükkânı"],
  ['bahce', 'Kök Bahçesi'],
  ['uyduruk', 'Uydurukçuklar'],
] as const

const kayit = (sayfa: Page) =>
  sayfa.evaluate((anahtar) => JSON.parse(localStorage.getItem(anahtar) ?? 'null'), ANAHTAR)
const kartKelimeleri = (sayfa: Page) => sayfa.locator('.sozluk-karti__kelime')
const sinifIsareti = (sayfa: Page) => sayfa.locator('.sinif-isareti')
const baslik = (sayfa: Page, ad: string) => sayfa.getByRole('heading', { level: 1, name: ad })

/** Ek ya da karo seçilebilir olana kadar bekler: önceki hareket bitti. */
const secilebilir = (oge: ReturnType<Page['locator']>) =>
  expect(oge).toHaveAttribute('aria-disabled', 'false')

/** Bölgenin ilk görevini dokun-dokun doğru oynar (sınıf modunda her bölge baştan başlar). */
async function ilkGorevi(sayfa: Page, kimlik: (typeof BOLGELER)[number][0]) {
  if (kimlik === 'koy') {
    await bukalemun(sayfa, 'lar').tap()
    await kart(sayfa).tap()
  } else if (kimlik === 'dukkan') {
    // kitap + -(I)m: sınırda jöle b.
    await sayfa.getByRole('button', { name: /^b, yumuşak$/ }).tap()
    await sayfa.locator('button.dukkan__kart').tap()
  } else if (kimlik === 'bahce') {
    // çiçek + -CI + -lAr: önce yapım, sonra çekim.
    for (const yuzey of ['çi', 'ler']) {
      await secilebilir(bukalemun(sayfa, yuzey))
      await bukalemun(sayfa, yuzey).tap()
      await sayfa.locator('button.bahce__agac').tap()
    }
  } else {
    await bukalemun(sayfa, 'lar').tap()
    await sayfa.locator('button.uyduruk__hedef').tap()
  }
  await expect(sonraki(sayfa)).toBeVisible()
}

interface Olcu {
  readonly yatay: number
  readonly dikey: number
  readonly yazi: { readonly px: number; readonly metin: string }
  readonly hedef: { readonly px: number; readonly ad: string }
}

/**
 * Ekranın ölçüleri: iki yönde taşma (kaydırma çubuğu), en küçük görünür yazı ve en küçük
 * dokunma hedefi (CSS pikseli). Yazının boyu ölçekle (transform, scale; SVG'de ekran matrisi)
 * çarpılır. Ekran okuyucuya kalan gizli yazı (.gizli, *__okunan: 1 px'lik kutu) sayılmaz.
 */
async function olc(sayfa: Page): Promise<Olcu> {
  await sayfa.evaluate(() => document.fonts.ready)
  return sayfa.evaluate(() => {
    const gorunmez = (el: Element) => {
      for (let e: Element | null = el; e && e !== document.body; e = e.parentElement) {
        const st = getComputedStyle(e)
        if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return true
        const kutu = e.getBoundingClientRect()
        if (st.overflow === 'hidden' && (kutu.width <= 1 || kutu.height <= 1)) return true
      }
      return false
    }
    const ad = (el: Element) => `${(el.textContent ?? '').trim().slice(0, 30)} <${el.getAttribute('class')}>`

    let yazi = { px: Infinity, metin: '' }
    const yuruyucu = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let n = yuruyucu.nextNode(); n; n = yuruyucu.nextNode()) {
      const el = n.parentElement
      if (!n.textContent?.trim() || !el || gorunmez(el)) continue
      const kutu = el.getBoundingClientRect()
      if (kutu.width < 2 || kutu.height < 2) continue
      let olcek = 1
      if (el instanceof SVGGraphicsElement) {
        const m = el.getScreenCTM()
        if (m) olcek = Math.hypot(m.a, m.b)
      } else {
        for (let e: Element | null = el; e; e = e.parentElement) {
          const st = getComputedStyle(e)
          if (st.transform !== 'none') {
            const m = new DOMMatrix(st.transform)
            olcek *= Math.hypot(m.a, m.b)
          }
          if (st.scale !== 'none') olcek *= parseFloat(st.scale)
        }
      }
      const px = parseFloat(getComputedStyle(el).fontSize) * olcek
      if (px < yazi.px) yazi = { px, metin: ad(el) }
    }

    let hedef = { px: Infinity, ad: '' }
    for (const el of document.querySelectorAll('button, a[href], label, [role="button"]')) {
      if (gorunmez(el)) continue
      const kutu = el.getBoundingClientRect()
      if (kutu.width === 0 || kutu.height === 0) continue
      const px = Math.min(kutu.width, kutu.height)
      if (px < hedef.px) hedef = { px, ad: el.getAttribute('aria-label') ?? ad(el) }
    }

    const kok = document.documentElement
    return {
      yatay: kok.scrollWidth - kok.clientWidth,
      dikey: kok.scrollHeight - kok.clientHeight,
      yazi,
      hedef,
    }
  })
}

for (const [en, boy] of [
  [1920, 1080],
  [1366, 768],
] as const) {
  test.describe(`sınıf modu ${en}×${boy}`, () => {
    test.use({
      viewport: { width: en, height: boy },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: true,
      contextOptions: { reducedMotion: 'reduce' },
    })

    test('harita, dört bölge, Sözlük ve akşam ekranı kaydırmadan sığar', async ({ page }) => {
      test.setTimeout(120_000)
      const hatalar = hatalariTopla(page)
      const olculer: Record<string, Olcu> = {}
      const sinanan = async (ekran: string) => {
        olculer[ekran] = await olc(page)
      }

      await page.goto('./?sinif=1')
      await expect(haritaBasligi(page)).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute('data-sinif', 'acik')
      await sinanan('harita')

      for (const [kimlik, ad] of BOLGELER) {
        await bolge(page, ad).tap()
        await expect(baslik(page, ad)).toBeVisible()
        await expect(sira(page)).toHaveText(
          kimlik === 'uyduruk' ? '1. tur · Görev 1 / 10' : 'Görev 1 / 10',
        )
        await sinanan(kimlik)
        if (kimlik === 'koy') {
          // Yanlış deneme: neden ve cümlesi.
          await bukalemun(page, 'ler').tap()
          await kart(page).tap()
          await expect(page.locator('.neden__cumle')).toBeVisible()
          await sinanan('koy-yanlis')
        }
        await ilkGorevi(page, kimlik)
        await sinanan(`${kimlik}-dogru`)
        await haritaDugmesi(page).tap()
        await expect(haritaBasligi(page)).toBeVisible()
      }

      // Sözlük: dört bölgenin kartları yan yana.
      await gezinme(page, 'Sözlük').tap()
      await expect(kartKelimeleri(page)).toHaveText(['atlar', 'kitabım', 'çiçekçi', 'fıngıllar'])
      await sinanan('sozluk')

      // Akşam ekranı: koyun on görevi (ilki oynandı; koy kalınan yerden, 2. görevden açılır).
      await gezinme(page, 'Harita').tap()
      await bolge(page, 'Bukalemun Koyu').tap()
      await gorevleriOyna(page, 1, 9)
      await expect(baslik(page, 'Koyda akşam oldu')).toBeVisible()
      await sinanan('aksam')

      for (const [ekran, o] of Object.entries(olculer)) {
        expect.soft({ ekran, yatay: o.yatay, dikey: o.dikey }).toEqual({ ekran, yatay: 0, dikey: 0 })
        if (en === 1920) {
          expect.soft(o.yazi.px, `${ekran}: en küçük yazı ${o.yazi.metin}`).toBeGreaterThanOrEqual(28)
          expect.soft(o.hedef.px, `${ekran}: en küçük hedef ${o.hedef.ad}`).toBeGreaterThanOrEqual(64)
        }
      }
      expect(hatalar).toEqual([])
    })
  })
}

test.describe('sınıf modu: ilerleme yalnız o açılışta', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: true,
    contextOptions: { reducedMotion: 'reduce' },
  })

  test("?sinif=1: bütün bölgeler açık, dört bölgede birer görev; yenileyince ilerleme yok; kapanınca cihazın ilerlemesi geri gelir", async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(90_000)
    const hatalar = hatalariTopla(page)
    const disIstekler = disIstekleriTopla(page, baseURL)
    await page.goto('./')
    await page.evaluate(
      ([anahtar, metin]) => localStorage.setItem(anahtar, metin),
      [ANAHTAR, JSON.stringify(CIHAZIN_KAYDI)] as const,
    )

    // Adresteki ?sinif=1 ayara yazılır ve adresten kalkar; ekranın adresi kalır. Sınıf modunun
    // Sözlük'ü boş: cihazın kartları görünmez.
    await page.goto('./?sinif=1#/sozluk')
    await expect(page.locator('html')).toHaveAttribute('data-sinif', 'acik')
    await expect(baslik(page, 'Sözlük')).toBeVisible()
    await expect(page.getByText('Sözlüğün henüz boş.')).toBeVisible()
    expect(new URL(page.url()).search).toBe('')
    expect(new URL(page.url()).hash).toBe('#/sozluk')
    expect(await kayit(page)).toMatchObject({ ...CIHAZIN_KAYDI, ayarlar: { sinif: 'acik' } })

    // İşaret: görünen "Sınıf", ekran okuyucuya ilerlemenin kaydedilmediği.
    await gezinme(page, 'Harita').tap()
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(sinifIsareti(page)).toBeVisible()
    await expect(sinifIsareti(page)).toContainText('Sınıf modu: ilerleme kaydedilmiyor.')
    for (const [, ad] of BOLGELER) await expect(bolge(page, ad)).toHaveAccessibleName(`${ad}, Açık`)

    for (const [kimlik, ad] of BOLGELER) {
      await bolge(page, ad).tap()
      await expect(baslik(page, ad)).toBeVisible()
      // Sınıf modunun belleği baştan: cihazın kalınan yeri (koyda 4. görev) değil.
      await expect(sira(page)).toHaveText(kimlik === 'uyduruk' ? '1. tur · Görev 1 / 10' : 'Görev 1 / 10')
      await expect(page.locator('.bolge-ustu .sinif-isareti')).toBeVisible()
      await ilkGorevi(page, kimlik)
      await haritaDugmesi(page).tap()
      await expect(haritaBasligi(page)).toBeVisible()
    }

    // Sözlük'te o açılışın kartları; cihazın kaydına hiçbiri yazılmadı.
    await gezinme(page, 'Sözlük').tap()
    await expect(kartKelimeleri(page)).toHaveText(['atlar', 'kitabım', 'çiçekçi', 'fıngıllar'])
    await expect(sinifIsareti(page)).toBeVisible()
    expect(await kayit(page)).toMatchObject({ ...CIHAZIN_KAYDI, ayarlar: { sinif: 'acik' } })

    // Yenileyince sınıf modu sürer, ilerlemesi yok.
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-sinif', 'acik')
    await expect(page.getByText('Sözlüğün henüz boş.')).toBeVisible()
    await gezinme(page, 'Harita').tap()
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(sira(page)).toHaveText('Görev 1 / 10')

    // Ayarlar'da sınıf modu kapanır: cihazın ilerlemesi ve kartları olduğu gibi.
    await haritaDugmesi(page).tap()
    await gezinme(page, 'Ayarlar').tap()
    const sinif = page.getByRole('group', { name: 'Sınıf modu' })
    await expect(sinif.getByRole('radio', { name: 'Açık' })).toBeChecked()
    await sinif.getByRole('radio', { name: 'Kapalı' }).check()
    await expect(page.locator('html')).toHaveAttribute('data-sinif', 'kapali')
    await expect(sinifIsareti(page)).toHaveCount(0)
    expect(await kayit(page)).toMatchObject({ ...CIHAZIN_KAYDI, ayarlar: { sinif: 'kapali' } })
    await gezinme(page, 'Sözlük').tap()
    await expect(kartKelimeleri(page)).toHaveText(['kuşlar', 'evler', 'atlar'])
    await gezinme(page, 'Harita').tap()
    await expect(bolge(page, 'Kök Bahçesi')).toHaveAccessibleName('Kök Bahçesi, Kilitli')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(sira(page)).toHaveText('Görev 4 / 10')

    // ?sinif=0 de kapatır: önce yer imiyle yeniden açılır, sonra kapanır.
    await page.goto('./?sinif=1')
    await expect(page.locator('html')).toHaveAttribute('data-sinif', 'acik')
    await page.goto('./?sinif=0')
    await expect(page.locator('html')).toHaveAttribute('data-sinif', 'kapali')
    await expect(haritaBasligi(page)).toBeVisible()
    expect(new URL(page.url()).search).toBe('')
    expect(await kayit(page)).toMatchObject({ ...CIHAZIN_KAYDI, ayarlar: { sinif: 'kapali' } })

    await page.waitForLoadState('networkidle')
    expect(disIstekler).toEqual([])
    expect(hatalar).toEqual([])
  })
})
