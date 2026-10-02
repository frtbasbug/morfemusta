import { createHash } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import {
  ANAHTAR,
  DOGRU_YUZEYLER,
  KELIMELER,
  bolge,
  bukalemun,
  disIstekleriTopla,
  hatalariTopla,
  kart,
  koyBasligi,
  sira,
  sonraki,
} from './yardimcilar.ts'

// Ses ve resim (DESIGN.md, "Ses ve resim"). Çalma çağrıları yakalanır: HTMLMediaElement'in
// play'i sarılır; çalınan metin <audio> öğesinin data-metin'indedir. Sarılmış play sesi
// gerçekten çalmaz, hemen biter: dizinin sıradaki sesi beklemeden gelir.

const KOKLER = ['at', 'ev', 'kuş', 'göz', 'kız', 'el', 'top', 'göz', 'gül', 'top'] as const

/** Her görevin her adımında doğruda kurulan kelime (zincirde ara gövde de). */
const KURULANLAR = KELIMELER.map((k, i) => (i === 9 ? ['toplar', k] : [k]))

type Ses = 'kapali' | 'dokununca' | 'sesli'

/**
 * Ses ayarını kurar (ilk açılışta) ve çalma çağrılarını kaydeder. bitmez: çalan ses hiç bitmez
 * (susturma testi); pause çağrısı ⏹ olarak kaydedilir.
 */
function calmalariKaydet(sayfa: Page, ses?: Ses, bitmez = false) {
  return sayfa.addInitScript(
    ([anahtar, ayar, surer]) => {
      if (ayar && sessionStorage.getItem('kuruldu') === null) {
        sessionStorage.setItem('kuruldu', 'evet')
        localStorage.setItem(anahtar!, JSON.stringify({ ayarlar: { ses: ayar } }))
      }
      const kayit: string[] = []
      ;(window as unknown as { calinanlar: string[] }).calinanlar = kayit
      HTMLMediaElement.prototype.play = function () {
        const metin = this.dataset.metin
        if (metin) kayit.push(metin)
        if (!surer) setTimeout(() => this.dispatchEvent(new Event('ended')), 0)
        return Promise.resolve()
      }
      const durdur = HTMLMediaElement.prototype.pause
      HTMLMediaElement.prototype.pause = function () {
        if (surer && this.dataset.metin) kayit.push('⏹')
        durdur.call(this)
      }
    },
    [ANAHTAR, ses ?? '', bitmez] as const,
  )
}

const calinanlar = (sayfa: Page) =>
  sayfa.evaluate(() => [...(window as unknown as { calinanlar: string[] }).calinanlar])
const sonCalinan = async (sayfa: Page) => (await calinanlar(sayfa)).at(-1)

/** Metnin ses dosyası: SHA-1'inin ilk 12 hanesi (scripts/ses-uret.py). */
const sesDosyasi = (metin: string) =>
  `${createHash('sha1').update(metin.normalize('NFC')).digest('hex').slice(0, 12)}.mp3`

test.describe('sesli mod', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('Koy okumadan oynanır: görev başında kök, seçilen bukalemunun kelimesi, doğruda kurulan kelime, yanlışta neden cümlesi', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(180_000)
    const hatalar = hatalariTopla(page)
    const disIstekler = disIstekleriTopla(page, baseURL)
    await calmalariKaydet(page, 'sesli')
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(koyBasligi(page)).toBeVisible()

    // Girişte bölgenin adı, sonra kök.
    await expect.poll(() => calinanlar(page)).toEqual(['Bukalemun Koyu', 'at'])

    // Yanlış deneme: ler seçilince atler, köke taşınınca neden cümlesi.
    await bukalemun(page, 'ler').tap()
    await expect.poll(() => sonCalinan(page)).toBe('atler')
    await kart(page).tap()
    await expect.poll(() => sonCalinan(page)).toBe('a kalın, e ince. Kalınlıkları uyuşmuyor.')

    for (let i = 0; i < 10; i++) {
      await expect(sira(page)).toHaveText(`Görev ${i + 1} / 10`)
      if (i > 0) await expect.poll(() => sonCalinan(page)).toBe(KOKLER[i])
      const yuzeyler = DOGRU_YUZEYLER[i] ?? []
      for (const [adim, yuzey] of yuzeyler.entries()) {
        const kurulan = KURULANLAR[i]?.[adim]
        const govde = adim === 0 ? KOKLER[i] : KURULANLAR[i]?.[adim - 1]
        await bukalemun(page, yuzey).tap()
        // Seçilen bukalemunun kuracağı kelime; çocuk seçimini kulağıyla yapar.
        await expect.poll(() => sonCalinan(page)).toBe(`${govde}${yuzey}`)
        await kart(page).tap()
        await expect.poll(() => sonCalinan(page)).toBe(kurulan)
      }
      // Sıradaki düğmesi simgesinden de tanınır.
      await expect(sonraki(page).locator('svg.simge')).toBeVisible()
      await sonraki(page).tap()
    }

    // Akşam: başlık, ara yazı ve bugünün kelimeleri.
    await expect(page.getByRole('heading', { level: 1, name: 'Koyda akşam oldu' })).toBeVisible()
    await expect
      .poll(async () => (await calinanlar(page)).slice(-12))
      .toEqual(['Koyda akşam oldu', 'Bugün kurduğun kelimeler:', ...KELIMELER])
    expect(hatalar).toEqual([])
    expect(disIstekler).toEqual([])
  })

  test('haritada kilitli bölgeye dokununca adı ve iletisi; Sözlük\'te karta dokununca kelime', async ({
    page,
  }) => {
    await calmalariKaydet(page, 'sesli')
    await page.goto('./')
    await bolge(page, 'Kök Bahçesi').tap()
    await expect
      .poll(() => calinanlar(page))
      .toEqual(['Kök Bahçesi', "Önce Fıstıkçı Şahap'ın Dükkânı bitmeli."])

    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await page.getByRole('button', { name: 'Harita', exact: true }).tap()
    await page.getByRole('navigation', { name: 'Gezinme' }).getByRole('link', { name: 'Sözlük' }).tap()
    await page.locator('.sozluk-karti').first().tap()
    await expect.poll(() => sonCalinan(page)).toBe('atlar')
  })
})

test.describe('ekran değişince', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('haritaya dönünce çalan ses susar; dizinin kalanı çalmaz', async ({ page }) => {
    await calmalariKaydet(page, 'sesli', true)
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    // Bölgenin adı çalıyor (bitmiyor); kök sırada bekliyor.
    await expect.poll(() => calinanlar(page)).toEqual(['Bukalemun Koyu'])
    await page.getByRole('button', { name: 'Harita', exact: true }).tap()
    await expect(page.getByRole('heading', { level: 1, name: 'Ekle Bakalım' })).toBeVisible()
    await expect.poll(() => calinanlar(page)).toEqual(['Bukalemun Koyu', '⏹'])
    await page.waitForTimeout(300)
    expect(await calinanlar(page)).toEqual(['Bukalemun Koyu', '⏹'])
  })
})

test.describe('Kapalı ve Dokununca', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('Kapalı: hiçbir ses çalmaz, hoparlör yok', async ({ page }) => {
    await calmalariKaydet(page, 'kapali')
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'ler').tap()
    await kart(page).tap()
    await expect(page.locator('.neden__cumle')).toBeVisible()
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await expect(page.locator('.hoparlor')).toHaveCount(0)
    await page.waitForTimeout(300)
    expect(await calinanlar(page)).toEqual([])
  })

  test('Dokununca (varsayılan): kendiliğinden çalmaz; hoparlöre dokununca çalar', async ({ page }) => {
    await calmalariKaydet(page)
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'ler').tap()
    await kart(page).tap()
    await expect(page.locator('.neden__cumle')).toBeVisible()
    await page.waitForTimeout(300)
    expect(await calinanlar(page)).toEqual([])

    await page.getByRole('button', { name: 'Dinle: at' }).tap()
    await expect.poll(() => calinanlar(page)).toEqual(['at'])
    await page
      .getByRole('button', { name: 'Dinle: a kalın, e ince. Kalınlıkları uyuşmuyor.' })
      .tap()
    await expect
      .poll(() => calinanlar(page))
      .toEqual(['at', 'a kalın, e ince. Kalınlıkları uyuşmuyor.'])
    // Hoparlör en az 44 px.
    const kutu = await page.getByRole('button', { name: 'Dinle: at' }).boundingBox()
    expect(Math.min(kutu?.width ?? 0, kutu?.height ?? 0)).toBeGreaterThanOrEqual(44)
  })

  test('Ayarlar\'da Ses: Kapalı / Dokununca / Sesli mod; varsayılan Dokununca, seçim kalır', async ({
    page,
  }) => {
    await page.goto('./#/ayarlar')
    const ses = page.getByRole('group', { name: 'Ses' })
    await expect(ses.getByRole('radio')).toHaveCount(3)
    await expect(ses.getByRole('radio', { name: 'Dokununca' })).toBeChecked()
    await ses.getByText('Sesli mod').tap()
    await page.reload()
    await expect(page.getByRole('group', { name: 'Ses' }).getByRole('radio', { name: 'Sesli mod' })).toBeChecked()
    await expect(page.getByRole('heading', { name: 'Hakkında' })).toBeVisible()
    await expect(page.locator('.hakkinda')).toContainText('Sesler yapay zekâyla üretildi.')
    await expect(page.locator('.hakkinda')).toContainText('Twemoji')
  })
})

test.describe('resim', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('at kartında 🐎; çoğul büyüsünde kart üçe çoğalınca resim de üç', async ({ page }) => {
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    const resim = kart(page).locator('img.kok-resmi')
    await expect(resim).toHaveAttribute('data-emoji', '🐎')
    await expect(resim).toBeVisible()
    expect(await resim.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await expect(page.locator('.koy__sahne img[data-emoji="🐎"]')).toHaveCount(3)
  })
})

test.describe('önbellek', () => {
  test("arayüzün ve Koy'un sesleri service worker önbelleğinde; öteki bölgelerinki değil", async ({
    page,
  }) => {
    await page.goto('./')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
    const onbellektekiler = await page.evaluate(async () => {
      const adresler: string[] = []
      for (const ad of await caches.keys()) {
        for (const istek of await (await caches.open(ad)).keys()) adresler.push(istek.url)
      }
      return adresler
    })
    const var_ = (metin: string) => onbellektekiler.some((a) => a.includes(`/ses/${sesDosyasi(metin)}`))
    for (const metin of ['at', 'atlar', 'atler', 'toplarım', 'Bukalemun Koyu', 'Koyda akşam oldu']) {
      expect(var_(metin), metin).toBe(true)
    }
    // Uydurukçuklar'ın sesi bölgeye ilk girişte arka planda iner.
    expect(var_('fıngıl')).toBe(false)
    const bitti = (n: number) => ({ bitenler: Array.from({ length: n }, (_, i) => i + 1), kaldigi: n })
    await page.evaluate(
      ([anahtar, kayit]) => localStorage.setItem(anahtar, kayit),
      [ANAHTAR, JSON.stringify({ bolgeler: { koy: bitti(10), dukkan: bitti(10), bahce: bitti(10) } })] as const,
    )
    await page.reload()
    await bolge(page, 'Uydurukçuklar').tap()
    await expect
      .poll(
        () =>
          page.evaluate(async (dosya) => {
            const onbellek = await caches.open('morfemusta-ses')
            // Adreste içeriğin sürümü var: ses yeniden üretilince eski kayıt kullanılmaz.
            return (await onbellek.keys()).some((istek) => /\?v=[0-9a-f]{12}$/.test(istek.url) && istek.url.includes(`/ses/${dosya}?v=`))
          }, sesDosyasi('fıngıl')),
        { timeout: 20_000 },
      )
      .toBe(true)
  })
})

test.describe('Ses Denetim Sayfası', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

  test('bütün sesler bölge bölge; çal düğmesi; Hatalı işaretleri kalır, Listeyi kopyala panoya koyar', async ({
    page,
    baseURL,
  }) => {
    const hatalar = hatalariTopla(page)
    const disIstekler = disIstekleriTopla(page, baseURL)
    await calmalariKaydet(page)
    await page.goto('ses.html')
    await expect(page.getByRole('heading', { level: 1, name: 'Ses Denetimi' })).toBeVisible()
    for (const ad of ['Arayüz', 'Bukalemun Koyu', "Fıstıkçı Şahap'ın Dükkânı", 'Kök Bahçesi', 'Uydurukçuklar']) {
      await expect(page.getByRole('heading', { level: 2, name: new RegExp(`^${ad}`) })).toBeVisible()
    }
    // Her metnin çal düğmesi etkin: sesi var.
    await expect(page.locator('.ses-denetimi__liste button:disabled')).toHaveCount(0)
    // Hız seçildi (0.9): örnekler bölümü yok.
    await expect(page.getByRole('heading', { name: /^Örnekler/ })).toHaveCount(0)
    await expect(page.locator('.ses-denetimi__ozet')).toContainText('hız 0.9')

    await page.getByRole('button', { name: 'Çal: atler', exact: true }).tap()
    await expect.poll(() => calinanlar(page)).toEqual(['atler'])

    const satir = (metin: string) =>
      page.locator('.ses-denetimi__liste li').filter({
        has: page.getByRole('button', { name: `Çal: ${metin}`, exact: true }),
      })
    await satir('atler').first().getByLabel('Hatalı').check()
    await satir('kitapım').first().getByLabel('Hatalı').check()
    await page.getByRole('button', { name: 'Listeyi kopyala' }).tap()
    await expect(page.getByRole('status')).toHaveText('2 metin panoya kopyalandı.')
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('atler\nkitapım')

    // İşaretler bu cihazda kalır.
    await page.reload()
    await expect(satir('atler').first().getByLabel('Hatalı')).toBeChecked()
    await expect(satir('kitapım').first().getByLabel('Hatalı')).toBeChecked()

    // İşaret sesin sürümüne bağlı: ses yeniden üretilince (sürüm değişince) eski işaret görünmez.
    await page.evaluate(() => {
      const anahtar = 'morfemusta.ses-denetimi.v2'
      const isaretler = JSON.parse(localStorage.getItem(anahtar) ?? '{}') as Record<string, string>
      localStorage.setItem(anahtar, JSON.stringify({ ...isaretler, atler: '000000000000' }))
    })
    await page.reload()
    await expect(satir('atler').first().getByLabel('Hatalı')).not.toBeChecked()
    await expect(satir('kitapım').first().getByLabel('Hatalı')).toBeChecked()
    await expect(page.getByText('1 hatalı', { exact: true })).toBeVisible()
    expect(hatalar).toEqual([])
    expect(disIstekler).toEqual([])
  })

  test('oyun açıldıktan sonra çevrim dışı da açılır', async ({ page, context }) => {
    await page.goto('./')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
    await context.setOffline(true)
    await page.goto('ses.html')
    await expect(page.getByRole('heading', { level: 1, name: 'Ses Denetimi' })).toBeVisible()
  })
})
