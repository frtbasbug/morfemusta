import { expect, test, type Page } from '@playwright/test'
import { ANAHTAR, bolge, bukalemun, hatalariTopla, kart, koyBasligi, sonraki, dugmeyleOyna } from './yardimcilar.ts'

// Bu dosyadaki testler Düğmeyle ayarında koşar (yardimcilar.ts, dugmeyleOyna).
test.beforeEach(({ page }) => dugmeyleOyna(page))

// Efektler ve parıltı (DESIGN.md, "Ses ve resim"). Web Audio'nun osilatörleri, AudioContext'in
// kuruluşu ve <audio> öğesinin play ile pause'u sarılır; çalınan nota (Hz) ve metin sırasıyla
// kaydedilir. Sarılmış play sesi gerçekten çalmaz: hemen biter (bitmez verilirse hiç bitmez).
// Doğruda yükselen iki nota (G5, C6), yanlışta alçak bir nota (A3), büyüde parıltı arpeji
// (C6 E6 G6 C7). Doğruda kelimenin çevresinde yıldızcıklar: belirteç renklerinde, Renksiz'de gri,
// hareket azaltmada hiç yok. Parıltının eklenişi MutationObserver'la yakalanır (600 ms sürer).

const DOGRU = ['783.99', '1046.50']
const YANLIS = ['220.00']
const BUYU = ['1046.50', '1318.51', '1567.98', '2093.00']

interface Olay {
  readonly tur: 'nota' | 'baglam' | 'ses' | 'dur'
  readonly deger: string
  readonly an: number
}

interface Parilti {
  readonly yildizlar: number
  readonly gizli: string | null
  readonly dokunulmaz: string
  readonly renkler: readonly string[]
  readonly kutu: { readonly x: number; readonly y: number; readonly en: number; readonly boy: number }
  readonly hedef: { readonly x: number; readonly y: number; readonly en: number; readonly boy: number } | null
}

/**
 * İlk açılışta kaydı kurar (ayarlar ve ilerleme); sesleri ve parıltıları kaydeder. hedef:
 * parıltının çevrelemesi beklenen kelimenin seçicisi.
 */
function kaydet(
  sayfa: Page,
  { kayit, hedef, bitmez = false }: { kayit: object; hedef: string; bitmez?: boolean },
) {
  return sayfa.addInitScript(
    ([anahtar, metin, secici, surer]) => {
      if (sessionStorage.getItem('kuruldu') === null) {
        sessionStorage.setItem('kuruldu', 'evet')
        localStorage.setItem(anahtar, metin)
      }
      const olaylar: Olay[] = []
      const parildamalar: Parilti[] = []
      Object.assign(window, { olaylar, parildamalar })
      const simdi = () => performance.now()

      const baslat = OscillatorNode.prototype.start
      OscillatorNode.prototype.start = function (...a: Parameters<OscillatorNode['start']>) {
        olaylar.push({ tur: 'nota', deger: this.frequency.value.toFixed(2), an: simdi() })
        return baslat.apply(this, a)
      }
      const Asil = window.AudioContext
      window.AudioContext = class extends Asil {
        constructor(...a: ConstructorParameters<typeof AudioContext>) {
          super(...a)
          olaylar.push({ tur: 'baglam', deger: '', an: simdi() })
        }
      }
      HTMLMediaElement.prototype.play = function () {
        // İlk dokunuşun sessiz sesi (iOS için, metinsiz) kaydedilmez.
        const ses = this.dataset.metin
        if (ses) olaylar.push({ tur: 'ses', deger: ses, an: simdi() })
        if (!surer) setTimeout(() => this.dispatchEvent(new Event('ended')), 0)
        return Promise.resolve()
      }
      const durdur = HTMLMediaElement.prototype.pause
      HTMLMediaElement.prototype.pause = function () {
        if (this.dataset.metin) olaylar.push({ tur: 'dur', deger: this.dataset.metin, an: simdi() })
        durdur.call(this)
      }

      const kutusu = (el: Element) => {
        const k = el.getBoundingClientRect()
        return { x: k.x, y: k.y, en: k.width, boy: k.height }
      }
      new MutationObserver((degisiklikler) => {
        for (const d of degisiklikler) {
          for (const oge of d.addedNodes) {
            if (!(oge instanceof HTMLElement) || !oge.classList.contains('parilti')) continue
            const yildizlar = [...oge.querySelectorAll('svg.parilti__yildiz')]
            const kelime = document.querySelector(secici)
            parildamalar.push({
              yildizlar: yildizlar.length,
              gizli: oge.getAttribute('aria-hidden'),
              dokunulmaz: getComputedStyle(oge).pointerEvents,
              renkler: [...new Set(yildizlar.map((y) => getComputedStyle(y).fill))],
              kutu: kutusu(oge),
              hedef: kelime ? kutusu(kelime) : null,
            })
          }
        }
      }).observe(document, { childList: true, subtree: true })
    },
    [ANAHTAR, JSON.stringify(kayit), hedef, bitmez] as const,
  )
}

const olaylar = (sayfa: Page) =>
  sayfa.evaluate(() => [...(window as unknown as { olaylar: Olay[] }).olaylar])
const notalar = async (sayfa: Page) =>
  (await olaylar(sayfa)).filter((o) => o.tur === 'nota').map((o) => o.deger)
/** Çalınan notalar ve metinler, sırayla (AudioContext'in kuruluşu ve pause'lar dışında). */
const akis = async (sayfa: Page) =>
  (await olaylar(sayfa)).filter((o) => o.tur === 'nota' || o.tur === 'ses').map((o) => o.deger)
const parildamalar = (sayfa: Page) =>
  sayfa.evaluate(() => [...(window as unknown as { parildamalar: Parilti[] }).parildamalar])

const KOY_KELIMESI = 'button.kelime-karti .kelime'
const bir = (n: number) => Array.from({ length: n }, (_, i) => i + 1)

/** Koyu açar: yanlış (ler) dener, neden görünür. */
async function koydaYanlis(sayfa: Page) {
  await sayfa.goto('./')
  await bolge(sayfa, 'Bukalemun Koyu').tap()
  await expect(koyBasligi(sayfa)).toBeVisible()
  await bukalemun(sayfa, 'ler').tap()
  await kart(sayfa).tap()
  await expect(sayfa.locator('.neden__cumle')).toBeVisible()
}

/** Koyun ilk görevini doğru bitirir (at + -lAr: kart çoğalır). */
async function koydaDogru(sayfa: Page) {
  await bukalemun(sayfa, 'lar').tap()
  await kart(sayfa).tap()
  await expect(sonraki(sayfa)).toBeVisible()
}

test.describe('efektler (hareket azaltma açık)', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('Kapalı: hiçbir efekt çalmaz, Web Audio açılmaz', async ({ page }) => {
    const hatalar = hatalariTopla(page)
    await kaydet(page, { kayit: { ayarlar: { ses: 'kapali' } }, hedef: KOY_KELIMESI })
    await koydaYanlis(page)
    await koydaDogru(page)
    // Gecikmeli bir ses (sesli modda kelime 320 ms sonra gelir) de yok.
    await page.waitForTimeout(800)
    expect(await olaylar(page)).toEqual([])
    expect(hatalar).toEqual([])
  })

  test('Dokununca: yanlışta alçak nota, doğruda yükselen iki nota, çoğalmada parıltı sesi; çalan konuşmayı kesmez; parıltı yok', async ({
    page,
  }) => {
    const hatalar = hatalariTopla(page)
    await kaydet(page, { kayit: { ayarlar: { ses: 'dokununca' } }, hedef: KOY_KELIMESI, bitmez: true })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(koyBasligi(page)).toBeVisible()
    // Hoparlöre dokununca kök çalar ve (bitmez) sürer.
    await page.getByRole('button', { name: 'Dinle: at' }).tap()
    await expect.poll(() => akis(page)).toEqual(['at'])

    await bukalemun(page, 'ler').tap()
    await kart(page).tap()
    await expect(page.locator('.neden__cumle')).toBeVisible()
    await expect.poll(() => notalar(page)).toEqual(YANLIS)
    await koydaDogru(page)
    await expect.poll(() => notalar(page)).toEqual([...YANLIS, ...DOGRU, ...BUYU])

    const hepsi = await olaylar(page)
    // Tek AudioContext; konuşma yalnız hoparlörün kökü, efektler onu kesmedi (pause yok).
    expect(hepsi.filter((o) => o.tur === 'baglam')).toHaveLength(1)
    expect(hepsi.filter((o) => o.tur === 'ses' || o.tur === 'dur')).toMatchObject([
      { tur: 'ses', deger: 'at' },
    ])
    // Hareket azaltma açık: parıltı yok.
    expect(await parildamalar(page)).toEqual([])
    expect(hatalar).toEqual([])
  })

  test('Sesli mod: doğruda önce efekt, hemen ardından kurulan kelime', async ({ page }) => {
    const hatalar = hatalariTopla(page)
    await kaydet(page, { kayit: { ayarlar: { ses: 'sesli' } }, hedef: KOY_KELIMESI })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(koyBasligi(page)).toBeVisible()
    await expect.poll(() => akis(page)).toEqual(['Bukalemun Koyu', 'at'])

    // Yanlışta: seçilen bukalemunun kelimesi (atler), efekt, sonra neden cümlesi.
    await bukalemun(page, 'ler').tap()
    await kart(page).tap()
    const cumle = 'a kalın, e ince. Kalınlıkları uyuşmuyor.'
    await expect.poll(() => akis(page)).toEqual(['Bukalemun Koyu', 'at', 'atler', ...YANLIS, cumle])

    // Doğruda: aday (atlar), doğrunun notaları, büyü (çoğalma), kurulan kelime.
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect
      .poll(() => akis(page))
      .toEqual(['Bukalemun Koyu', 'at', 'atler', ...YANLIS, cumle, 'atlar', ...DOGRU, ...BUYU, 'atlar'])
    const hepsi = (await olaylar(page)).filter((o) => o.tur === 'nota' || o.tur === 'ses')
    const yanlisNotasi = hepsi.find((o) => o.tur === 'nota')!
    const neden = hepsi.find((o) => o.deger === cumle)!
    const dogruNotasi = hepsi.find((o) => o.deger === DOGRU[0])!
    const kelime = hepsi.at(-1)!
    // Kelime efekt bitince gelir (doğru 320 ms, yanlış 260 ms), beklemeden.
    expect(kelime.an - dogruNotasi.an).toBeGreaterThanOrEqual(300)
    expect(kelime.an - dogruNotasi.an).toBeLessThan(1500)
    expect(neden.an - yanlisNotasi.an).toBeGreaterThanOrEqual(240)
    expect(neden.an - yanlisNotasi.an).toBeLessThan(1500)
    expect(hatalar).toEqual([])
  })
})

test.describe('parıltı (hareket açık)', () => {
  test('doğruda kelimenin çevresinde altı yıldızcık: belirteç renkleri, süs; sonra kalkar', async ({
    page,
  }) => {
    const hatalar = hatalariTopla(page)
    await kaydet(page, { kayit: {}, hedef: KOY_KELIMESI })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(koyBasligi(page)).toBeVisible()
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect.poll(() => parildamalar(page)).toHaveLength(1)
    const [p] = await parildamalar(page)
    expect(p).toMatchObject({
      yildizlar: 6,
      gizli: 'true',
      dokunulmaz: 'none',
      // --parilti-1 (yanak) ve --parilti-2 (kara).
      renkler: ['rgb(255, 157, 180)', 'rgb(244, 230, 200)'],
    })
    // Kelimenin kutusunu çevreler.
    expect(p?.hedef).not.toBeNull()
    for (const k of ['x', 'y', 'en', 'boy'] as const) {
      expect(Math.abs((p?.kutu[k] ?? 0) - (p?.hedef?.[k] ?? 0))).toBeLessThan(1)
    }
    expect(p?.kutu.en).toBeGreaterThan(0)
    // Hareket bitince kalkar; çocuk oynamayı sürdürür.
    await expect(page.locator('.parilti')).toHaveCount(0)
    await expect(sonraki(page)).toBeVisible()
    expect(hatalar).toEqual([])
  })

  test("Renksiz'de yıldızcıklar gri (dükkânda)", async ({ page }) => {
    await kaydet(page, {
      kayit: {
        bolgeler: { koy: { bitenler: bir(10), kaldigi: 10 } },
        ayarlar: { renkler: 'renksiz' },
      },
      hedef: '.dukkan__kelime',
    })
    await page.goto('./')
    await bolge(page, 'Dükkânı').tap()
    await page.getByRole('button', { name: /^b, yumuşak$/ }).tap()
    await page.locator('button.dukkan__kart').tap()
    await expect.poll(() => parildamalar(page)).toHaveLength(1)
    const [p] = await parildamalar(page)
    // --renksiz ve --renksiz-zemin.
    expect(p?.renkler).toEqual(['rgb(142, 140, 153)', 'rgb(226, 225, 232)'])
    expect(p?.yildizlar).toBe(6)
    await expect(sonraki(page)).toBeVisible()
  })

  test('oyunun Azalt ayarında parıltı yok', async ({ page }) => {
    await kaydet(page, { kayit: { ayarlar: { hareket: 'azalt' } }, hedef: KOY_KELIMESI })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await koydaDogru(page)
    await page.waitForTimeout(800)
    expect(await parildamalar(page)).toEqual([])
  })
})
