import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import {
  ANAHTAR,
  agac,
  bahceGorevi,
  bolge,
  bukalemun,
  disIstekleriTopla,
  dukkanGorevi,
  dukkanKarti,
  gezinme,
  gorevleriOyna,
  haritaBasligi,
  hatalariTopla,
  kart,
  karo,
  secilebilir,
  sonraki,
  uydurukGorevi,
  yaratik,
} from './yardimcilar.ts'

// Pilot (DESIGN.md, "Pilot"): pilot.html'de çocuk kodu girilince deneme günlüğü açılır; dört
// bölgedeki her seçim cihazdaki günlüğe bir satır olarak yazılır. pilot.html özeti, CSV'yi ve
// kopyayı verir; Yeni çocuk oyunun ilerlemesini sıfırlar, Günlüğü sil iki adımdır. Bu dosya
// WebKit'te de koşar (playwright.config.ts: iPhone).

const PILOT = 'pilot.html'
const GUNLUK = 'morfemusta.pilot.v1'
const DURMA = 'morfemusta.pilot.durdu'
const SUTUNLAR = [
  'zaman',
  'cocuk',
  'surum',
  'bolge',
  'tur',
  'gorev',
  'kok',
  'ekler',
  'dogru_bicim',
  'secilen',
  'aday',
  'sonuc',
  'neden',
  'deneme_no',
  'sure_ms',
  'ses_modu',
]

const pilotBasligi = (sayfa: Page) => sayfa.getByRole('heading', { level: 1, name: 'Pilot' })
const kodAlani = (sayfa: Page) => sayfa.getByLabel('Çocuk kodu')
const dugme = (sayfa: Page, ad: string) => sayfa.getByRole('button', { name: ad, exact: true })
const ozet = (sayfa: Page, kod: string) => sayfa.locator(`article.pilot__ozet[data-cocuk="${kod}"]`)
const gunlugunSatirlari = (sayfa: Page) =>
  sayfa.evaluate((anahtar) => {
    const kayit = JSON.parse(localStorage.getItem(anahtar) ?? 'null') as {
      cocuk: string | null
      satirlar: Record<string, unknown>[]
    } | null
    return kayit
  }, GUNLUK)

/** Sesler gerçekten çalmaz: play sarılır, hemen biter (sesli mod sırayla ilerler). */
const sesleriSustur = (sayfa: Page) =>
  sayfa.addInitScript(() => {
    HTMLMediaElement.prototype.play = function () {
      setTimeout(() => this.dispatchEvent(new Event('ended')), 0)
      return Promise.resolve()
    }
  })

/** Noktalı virgüllü CSV satırı: tırnaklı alanlar, ikilenen tırnaklar. */
function csvSatiri(satir: string): string[] {
  const alanlar: string[] = []
  let alan = ''
  let tirnakta = false
  for (let i = 0; i < satir.length; i++) {
    const harf = satir[i]
    if (tirnakta) {
      if (harf === '"' && satir[i + 1] === '"') {
        alan += '"'
        i++
      } else if (harf === '"') tirnakta = false
      else alan += harf
    } else if (harf === '"') tirnakta = true
    else if (harf === ';') {
      alanlar.push(alan)
      alan = ''
    } else alan += harf
  }
  alanlar.push(alan)
  return alanlar
}

/** pilot.html'de kodu yazar ve Yeni çocuk'a basar. */
async function yeniCocuk(sayfa: Page, kod: string) {
  await sayfa.goto(PILOT)
  await expect(pilotBasligi(sayfa)).toBeVisible()
  await kodAlani(sayfa).fill(kod)
  await dugme(sayfa, 'Yeni çocuk').click()
  await expect(sayfa.locator('strong[data-cocuk]')).toHaveText(kod.toUpperCase())
}

const haritayaDon = async (sayfa: Page) => {
  await sayfa.getByRole('button', { name: 'Haritaya dön' }).tap()
  await expect(haritaBasligi(sayfa)).toBeVisible()
}

test.describe('pilot yolu', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('telefonda sesli modda kod girilir, dört bölge oynanır; özet ve CSV doğru', async ({
    page,
    baseURL,
  }) => {
    test.setTimeout(300_000)
    const hatalar = hatalariTopla(page)
    const disIstekler = disIstekleriTopla(page, baseURL)
    await sesleriSustur(page)

    // Ses modu oyunun Ayarlar'ından: Sesli mod. Yeni çocuk ayarlara dokunmaz.
    await page.goto('./#/ayarlar')
    await page.getByRole('radio', { name: 'Sesli mod' }).check()
    await yeniCocuk(page, 'p07')
    await expect(page.locator('.pilot__ileti')).toContainText('Yeni çocuk: P07. Günlük açık.')
    await expect(page.locator('[data-ayarlar]')).toContainText('Ses: Sesli mod · Sınıf modu: Kapalı')
    await expect(page.locator('[data-surum]')).toHaveText(
      /^pilot-\d+(?:\.\d+)? \((?:[0-9a-f]{7}|bilinmiyor), \d{4}-\d{2}-\d{2}\)$/,
    )
    await page.getByRole('link', { name: 'Oyunu aç' }).click()
    await expect(haritaBasligi(page)).toBeVisible()

    // Bukalemun Koyu: 1. görevde önce ler (yanlış), sonra on görev.
    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'ler').tap()
    await kart(page).tap()
    await expect(page.locator('.neden__cumle')).toBeVisible()
    await gorevleriOyna(page, 0, 9)
    await expect(page.getByRole('heading', { level: 1, name: 'Koyda akşam oldu' })).toBeVisible()
    await haritayaDon(page)

    // Fıstıkçı Şahap'ın Dükkânı: 1. görevde taş (yanlış: kitapım).
    await bolge(page, 'Dükkânı').tap()
    await secilebilir(karo(page, 'taş'))
    await karo(page, 'taş').tap()
    await dukkanKarti(page).tap()
    await expect(page.locator('.dukkan__cumle')).toHaveText('Ek ünlüyle başlayınca p yumuşar: b olur.')
    for (let yer = 0; yer < 10; yer++) {
      await dukkanGorevi(page, yer)
      await sonraki(page).tap()
    }
    await expect(page.getByRole('heading', { level: 1, name: 'Dükkânda akşam oldu' })).toBeVisible()
    await haritayaDon(page)

    // Kök Bahçesi: 1. ağaçta önce ler (meyvenin üstüne gövde çıkmaz).
    await bolge(page, 'Kök Bahçesi').tap()
    await secilebilir(bukalemun(page, 'ler'))
    await bukalemun(page, 'ler').tap()
    await agac(page).tap()
    await expect(page.locator('.bahce__neden')).toContainText('Meyvenin üstüne gövde çıkmaz: önce çi.')
    for (let yer = 0; yer < 10; yer++) {
      await bahceGorevi(page, yer)
      await sonraki(page).tap()
    }
    await expect(page.getByRole('heading', { level: 1, name: 'Bahçede akşam oldu' })).toBeVisible()
    await haritayaDon(page)

    // Uydurukçuklar'ın 1. turu: 1. görevde ler (yanlış: fıngıller).
    await bolge(page, 'Uydurukçuklar').tap()
    await secilebilir(bukalemun(page, 'ler'))
    await bukalemun(page, 'ler').tap()
    await yaratik(page).tap()
    await expect(page.locator('.uyduruk__neden')).toBeVisible()
    for (let yer = 0; yer < 10; yer++) {
      await uydurukGorevi(page, yer)
      await sonraki(page).tap()
    }
    await expect(
      page.getByRole('heading', { level: 1, name: 'Uydurukçuklarda akşam oldu' }),
    ).toBeVisible()

    // pilot.html: çocuk başına özet.
    await page.goto(PILOT)
    await expect(pilotBasligi(page)).toBeVisible()
    await expect(page.locator('[data-gunluk-sayisi]')).toHaveText('58 deneme, 1 çocuk.')
    const p07 = ozet(page, 'P07')
    const satir = (bolgesi: string) => p07.locator(`tr[data-bolge="${bolgesi}"] td`)
    await expect(satir('koy')).toHaveText(['10', '10 / 11 (%91)'])
    await expect(satir('dukkan')).toHaveText(['10', '9 / 10 (%90)'])
    await expect(satir('bahce')).toHaveText(['10', '20 / 21 (%95)'])
    // Sınır adımının iki karosu da doğrudur: orana girmez.
    await expect(satir('uyduruk')).toHaveText(['10', '9 / 10 (%90)'])
    await expect(satir('toplam')).toHaveText(['40', '48 / 52 (%92)'])
    await expect(p07.locator('.pilot__nedenler li')).toHaveText([
      'PL:kalınlık (2)',
      'GÖVDE:yumuşama (1)',
      'meyve:AGT (1)',
    ])

    // CSV: UTF-8 imli, noktalı virgüllü; 58 satır ve başlık.
    const indirme = page.waitForEvent('download')
    await dugme(page, 'CSV indir').click()
    const dosya = await indirme
    expect(dosya.suggestedFilename()).toMatch(/^morfemusta-pilot-\d{4}-\d{2}-\d{2}\.csv$/)
    const baytlar = readFileSync((await dosya.path())!)
    expect([...baytlar.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    const metin = new TextDecoder('utf-8').decode(baytlar.subarray(3))
    const satirlar = metin.split('\r\n')
    expect(satirlar.pop()).toBe('')
    expect(satirlar).toHaveLength(59)
    expect(satirlar[0]).toBe(SUTUNLAR.join(';'))
    const kayitlar = satirlar.slice(1).map((s) => {
      const alanlar = csvSatiri(s)
      expect(alanlar).toHaveLength(SUTUNLAR.length)
      return Object.fromEntries(SUTUNLAR.map((sutun, i) => [sutun, alanlar[i] ?? '']))
    })
    for (const k of kayitlar) {
      expect(k).toMatchObject({ cocuk: 'P07', ses_modu: 'sesli', tur: '1' })
      expect(k.surum).toMatch(/^pilot-\d+(?:\.\d+)?$/)
      expect(k.zaman).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/)
      expect(k.sure_ms).toMatch(/^\d+$/)
      expect(['dogru', 'yanlis']).toContain(k.sonuc)
    }
    expect(kayitlar.map((k) => k.bolge)).toEqual([
      ...Array<string>(12).fill('koy'),
      ...Array<string>(11).fill('dukkan'),
      ...Array<string>(22).fill('bahce'),
      ...Array<string>(13).fill('uyduruk'),
    ])
    const [ilk, ikinci] = kayitlar
    expect(ilk).toMatchObject({
      gorev: '1',
      kok: 'at',
      ekler: 'PL',
      dogru_bicim: 'atlar',
      secilen: 'ler',
      aday: 'atler',
      sonuc: 'yanlis',
      neden: 'PL:kalınlık',
      deneme_no: '1',
    })
    expect(ikinci).toMatchObject({ gorev: '1', secilen: 'lar', aday: 'atlar', sonuc: 'dogru', neden: '', deneme_no: '2' })
    // Zincir: 10. görevin iki adımı.
    expect(kayitlar.slice(10, 12).map((k) => [k.gorev, k.ekler, k.dogru_bicim, k.aday])).toEqual([
      ['10', 'PL+POSS.1SG', 'toplar', 'toplar'],
      ['10', 'PL+POSS.1SG', 'toplarım', 'toplarım'],
    ])
    expect(kayitlar[12]).toMatchObject({
      bolge: 'dukkan',
      kok: 'kitap',
      secilen: 'p',
      aday: 'kitapım',
      dogru_bicim: 'kitabım',
      neden: 'GÖVDE:yumuşama',
    })
    expect(kayitlar[23]).toMatchObject({
      bolge: 'bahce',
      kok: 'çiçek',
      ekler: 'AGT+PL',
      secilen: 'ler',
      aday: 'çiçekler',
      dogru_bicim: 'çiçekçi',
      neden: 'meyve:AGT',
    })
    expect(kayitlar.some((k) => k.aday === 'gözlükçüler' && k.sonuc === 'dogru')).toBe(true)
    // Uydurukçuklar'ın sınır adımı: iki biçim de doğru; seçilen karonun harfi.
    expect(
      kayitlar.filter((k) => k.dogru_bicim.includes('/')).map((k) => [k.kok, k.secilen, k.aday, k.dogru_bicim]),
    ).toEqual([
      ['pıtak', 'ğ', 'pıtağım', 'pıtakım/pıtağım'],
      ['zitep', 'p', 'zitepim', 'zitepim/zitebim'],
    ])
    expect(kayitlar[45]).toMatchObject({ kok: 'fıngıl', aday: 'fıngıller', neden: 'PL:kalınlık' })

    await page.waitForLoadState('networkidle')
    expect(hatalar).toEqual([])
    expect(disIstekler).toEqual([])
  })
})

test.describe('pilot.html', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('Yeni çocuk: oyunun ilerlemesi sıfırlanır, harita baştan açılır; ayarlar ve günlük kalır', async ({
    page,
  }) => {
    // Önceki çocuk: Koy ve Dükkân bitmiş, kartlar, Renksiz; günlükte bir satırı var.
    const bir = (n: number) => Array.from({ length: n }, (_, i) => i + 1)
    await page.goto('./')
    await page.evaluate(
      ([anahtar, gunluk]) => {
        localStorage.setItem(
          anahtar,
          JSON.stringify({
            bolgeler: {
              koy: { bitenler: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], kaldigi: 10 },
              dukkan: { bitenler: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], kaldigi: 10 },
            },
            kartlar: [
              {
                kelime: 'atlar',
                kok: 'at',
                etiketler: ['PL'],
                bolge: 'koy',
                tarih: '2026-10-01T09:00:00.000Z',
                sonKurulma: '2026-10-01T09:00:00.000Z',
              },
            ],
            ayarlar: { renkler: 'renksiz' },
          }),
        )
        localStorage.setItem(
          gunluk,
          JSON.stringify({
            cocuk: 'P01',
            satirlar: [
              {
                zaman: '2026-10-01T12:00:00.000+03:00',
                cocuk: 'P01',
                surum: 'pilot-1',
                bolge: 'koy',
                tur: 1,
                gorev: 1,
                kok: 'at',
                ekler: 'PL',
                dogru_bicim: 'atlar',
                secilen: 'lar',
                aday: 'atlar',
                sonuc: 'dogru',
                neden: '',
                deneme_no: 1,
                sure_ms: 4200,
                ses_modu: 'dokununca',
              },
            ],
          }),
        )
      },
      [ANAHTAR, GUNLUK] as const,
    )
    void bir

    // Geçersiz kod (ad) yazılmaz.
    await page.goto(PILOT)
    await kodAlani(page).fill('Ali')
    await dugme(page, 'Yeni çocuk').click()
    await expect(page.locator('#pilot-kod-hatasi')).toHaveText(
      'Kod bir harf ve iki ya da üç rakamdır (P01 gibi). Ad yazılmaz.',
    )
    await expect(page.locator('strong[data-cocuk]')).toHaveText('P01')

    await yeniCocuk(page, 'P02')
    await expect(page.locator('.pilot__ileti')).toContainText(
      "Oyunun ilerlemesi ve kartları silindi; çocuk Bukalemun Koyu'ndan başlar.",
    )
    // Günlük kalır: önceki çocuğun özeti yerinde.
    await expect(ozet(page, 'P01')).toBeVisible()
    await expect(page.locator('[data-gunluk-sayisi]')).toHaveText('1 deneme, 1 çocuk.')

    await page.getByRole('link', { name: 'Oyunu aç' }).click()
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(bolge(page, 'Bukalemun Koyu')).toHaveAccessibleName('Bukalemun Koyu, Açık')
    await expect(bolge(page, 'Dükkânı')).toHaveAccessibleName("Fıstıkçı Şahap'ın Dükkânı, Kilitli")
    await expect(bolge(page, 'Kök Bahçesi')).toHaveAccessibleName('Kök Bahçesi, Kilitli')
    await expect(bolge(page, 'Uydurukçuklar')).toHaveAccessibleName('Uydurukçuklar, Kilitli')
    // Ayarlar kaldı (Renksiz); kartlar silindi.
    await expect(page.locator('html')).toHaveAttribute('data-renkler', 'renksiz')
    await gezinme(page, 'Sözlük').tap()
    await expect(page.getByText('Sözlüğün henüz boş.')).toBeVisible()
    // Koy baştan.
    await gezinme(page, 'Harita').tap()
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(page.locator('.bolge-ustu__sira')).toHaveText('Görev 1 / 10')
  })

  test('kod yokken ve sınıf modunda hiçbir deneme yazılmaz; kod silinince günlük kapanır', async ({
    page,
  }) => {
    // Kod yok: koyun ilk görevi oynanır, günlük yazılmaz.
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    expect(await gunlugunSatirlari(page)).toBeNull()

    // Kod var, sınıf modu açık: yine yazılmaz; pilot.html uyarır.
    await yeniCocuk(page, 'P03')
    await page.goto('./?sinif=1')
    await expect(page.locator('html')).toHaveAttribute('data-sinif', 'acik')
    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'ler').tap()
    await kart(page).tap()
    await expect(page.locator('.neden__cumle')).toBeVisible()
    expect(await gunlugunSatirlari(page)).toEqual({ cocuk: 'P03', satirlar: [] })
    await page.goto(PILOT)
    await expect(page.locator('.pilot__uyari')).toContainText(['Sınıf modu açık: denemeler yazılmaz.'])

    // Sınıf modu kapalı: yazılır. Kod silinince kapanır, satır kalır.
    await page.goto('./?sinif=0')
    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    expect((await gunlugunSatirlari(page))?.satirlar).toHaveLength(1)
    await page.goto(PILOT)
    await dugme(page, 'Kodu sil').click()
    await expect(page.locator('.pilot__durum')).toContainText('Günlük kapalı: çocuk kodu yok.')
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    // Kalınan yer: 2. görev (ev); lar yanlıştır.
    await expect(page.locator('.bolge-ustu__sira')).toHaveText('Görev 2 / 10')
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(page.locator('.neden__cumle')).toBeVisible()
    expect(await gunlugunSatirlari(page)).toMatchObject({ cocuk: null, satirlar: [{ cocuk: 'P03' }] })
  })

  test('Günlüğü sil iki adımdır: odak önce Vazgeç; Sil satırları siler, kod kalır', async ({ page }) => {
    await page.goto(PILOT)
    await page.evaluate(
      (gunluk) =>
        localStorage.setItem(
          gunluk,
          JSON.stringify({
            cocuk: 'P04',
            satirlar: [
              {
                zaman: '2026-10-01T12:00:00.000+03:00',
                cocuk: 'P04',
                surum: 'pilot-1',
                bolge: 'koy',
                tur: 1,
                gorev: 1,
                kok: 'at',
                ekler: 'PL',
                dogru_bicim: 'atlar',
                secilen: 'ler',
                aday: 'atler',
                sonuc: 'yanlis',
                neden: 'PL:kalınlık',
                deneme_no: 1,
                sure_ms: 3000,
                ses_modu: 'sesli',
              },
            ],
          }),
        ),
      GUNLUK,
    )
    await page.reload()
    await expect(page.locator('[data-gunluk-sayisi]')).toHaveText('1 deneme, 1 çocuk.')

    await dugme(page, 'Günlüğü sil').click()
    await expect(page.getByText('Günlükteki bütün denemeler silinecek.')).toBeVisible()
    await expect(dugme(page, 'Vazgeç')).toBeFocused()
    await dugme(page, 'Vazgeç').click()
    await expect(dugme(page, 'Günlüğü sil')).toBeFocused()
    await expect(page.locator('[data-gunluk-sayisi]')).toHaveText('1 deneme, 1 çocuk.')

    await dugme(page, 'Günlüğü sil').click()
    await dugme(page, 'Sil').click()
    await expect(page.locator('.pilot__ileti')).toHaveText('Günlük silindi.')
    await expect(page.locator('[data-gunluk-sayisi]')).toHaveText('0 deneme, 0 çocuk.')
    await expect(page.getByText('Günlükte henüz deneme yok.')).toBeVisible()
    expect(await gunlugunSatirlari(page)).toEqual({ cocuk: 'P04', satirlar: [] })
    await expect(page.locator('strong[data-cocuk]')).toHaveText('P04')
  })

  test('Kopyala günlüğü sekmeyle ayrılmış metin olarak panoya koyar', async ({ page }) => {
    await page.addInitScript(() => {
      const pano: string[] = []
      ;(window as unknown as { pano: string[] }).pano = pano
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: (metin: string) => (pano.push(metin), Promise.resolve()) },
      })
    })
    await yeniCocuk(page, 'P05')
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await page.goto(PILOT)
    await dugme(page, 'Kopyala').click()
    await expect(page.locator('.pilot__ileti')).toHaveText('1 deneme panoya kopyalandı.')
    const [kopya] = await page.evaluate(() => (window as unknown as { pano: string[] }).pano)
    const satirlar = (kopya ?? '').split('\n')
    expect(satirlar[0]).toBe(SUTUNLAR.join('\t'))
    expect(satirlar[1]?.split('\t')).toHaveLength(SUTUNLAR.length)
    expect(satirlar[1]).toContain('\tP05\t')
  })

  test('depo dolunca oyun sürer, günlük durur; pilot.html söyler, satırlar silinmez', async ({
    page,
  }) => {
    await yeniCocuk(page, 'P06')
    // Günlüğün anahtarı artık yazılamıyor (dolu): oyunun kaydı yazılır.
    await page.addInitScript((anahtar) => {
      const yaz = Storage.prototype.setItem
      Storage.prototype.setItem = function (k: string, d: string) {
        if (k === anahtar) throw new DOMException('Depo dolu', 'QuotaExceededError')
        return yaz.call(this, k, d)
      }
    }, GUNLUK)
    const hatalar = hatalariTopla(page)
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await sonraki(page).tap()
    await expect(page.locator('.bolge-ustu__sira')).toHaveText('Görev 2 / 10')
    expect(await page.evaluate((a) => localStorage.getItem(a), DURMA)).not.toBeNull()
    expect(await gunlugunSatirlari(page)).toEqual({ cocuk: 'P06', satirlar: [] })
    await page.goto(PILOT)
    await expect(page.locator('.pilot__uyari').first()).toContainText(
      'Günlük durdu: cihazın deposu doldu',
    )
    expect(hatalar).toEqual([])
  })

  test('çevrim dışı da açılır; belgelere bağlanır; oyun pilot sayfasına bağlanmaz', async ({
    page,
    context,
    browserName,
  }) => {
    await page.goto('./')
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(page.locator('a[href*="pilot"]')).toHaveCount(0)
    expect(await page.content()).not.toContain('pilot.html')

    await page.goto(PILOT)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    for (const [ad, yol] of [
      ['Gözlem formu', 'belgeler/gozlem-formu.html'],
      ['Veli bilgilendirme ve onay formu', 'belgeler/veli-onay-formu.html'],
      ['Gözlemci yönergesi', 'belgeler/gozlemci-yonergesi.html'],
    ] as const) {
      await expect(page.getByRole('link', { name: ad })).toHaveAttribute('href', yol)
    }

    // Service worker gezinmeyi oyuna düşürmez: pilot sayfası ve belgeler önbellekte.
    test.skip(browserName === 'webkit', "Çevrim dışı açılış Chromium'da sınanır")
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)
    await context.setOffline(true)
    await page.goto(PILOT)
    await expect(pilotBasligi(page)).toBeVisible()
    await page.getByRole('link', { name: 'Gözlemci yönergesi' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Morfemusta pilotu · Gözlemci yönergesi',
    )
  })
})
