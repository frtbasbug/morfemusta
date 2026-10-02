import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import {
  ANAHTAR,
  agac,
  bahceGorevi,
  bolge,
  bukalemun,
  disIstekleriTopla,
  dokun,
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

/**
 * Sesler gerçekten çalmaz: play sarılır, hemen biter (sesli mod sırayla ilerler). Çalınan sesin
 * metni (data-metin) kaydedilir.
 */
const sesleriSustur = (sayfa: Page) =>
  sayfa.addInitScript(() => {
    const kayit: string[] = []
    ;(window as unknown as { calinanlar: string[] }).calinanlar = kayit
    HTMLMediaElement.prototype.play = function () {
      const metin = this.dataset.metin
      if (metin) kayit.push(metin)
      setTimeout(() => this.dispatchEvent(new Event('ended')), 0)
      return Promise.resolve()
    }
  })

const calinanlar = (sayfa: Page) =>
  sayfa.evaluate(() => [...(window as unknown as { calinanlar: string[] }).calinanlar])

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

/**
 * Bölgelerin sesleri (ön belleğe girmeyenler) morfemusta-ses önbelleğine inene dek bekler
 * (calar.ts, bolgeSesleriniIndir; adreste içeriğin sürümü).
 */
async function bolgeSesleriInsin(sayfa: Page, bolgeler: readonly string[]) {
  const liste = JSON.parse(readFileSync('src/ses/ses-listesi.json', 'utf8')) as {
    metinler: Record<string, { dosya: string; surum: string; bolgeler: string[] }>
  }
  const beklenen = [
    ...new Set(
      Object.values(liste.metinler)
        .filter((k) => !k.bolgeler.includes('arayuz') && !k.bolgeler.includes('koy'))
        .filter((k) => k.bolgeler.some((b) => bolgeler.includes(b)))
        .map((k) => `/ses/${k.dosya}?v=${k.surum}`),
    ),
  ]
  await expect
    .poll(
      () =>
        sayfa.evaluate(async (adresler) => {
          const onbellek = await caches.open('morfemusta-ses')
          const olanlar = (await onbellek.keys()).map((istek) => istek.url)
          return adresler.filter((a) => !olanlar.some((u) => u.endsWith(a))).length
        }, beklenen),
      { timeout: 60_000 },
    )
    .toBe(0)
}

/**
 * Sayfanın süren isteklerini sayar; `sessiz()` hiçbiri kalmayınca ve yarım saniye yenisi
 * başlamayınca döner (sesli modda çalınacak seslerin fetch'i de gezinmeyle kesilmesin).
 */
function istekSayaci(sayfa: Page) {
  const suren = new Set<object>()
  let son = Date.now()
  const bitti = (istek: object) => {
    suren.delete(istek)
    son = Date.now()
  }
  sayfa.on('request', (istek) => {
    suren.add(istek)
    son = Date.now()
  })
  sayfa.on('requestfinished', bitti)
  sayfa.on('requestfailed', bitti)
  return {
    sessiz: () =>
      expect.poll(() => suren.size === 0 && Date.now() - son >= 500, { timeout: 30_000 }).toBe(true),
  }
}

const haritayaDon = async (sayfa: Page) => {
  // Bahçe'nin 15 kartıyla düğme iPhone 13'te ekranın altından taşar; sayfa olağan kayar.
  await dokun(sayfa.getByRole('button', { name: 'Haritaya dön' }))
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
    const istekler = istekSayaci(page)

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
    await dokun(bolge(page, 'Bukalemun Koyu'))
    await dokun(bukalemun(page, 'ler'))
    await dokun(kart(page))
    await expect(page.locator('.neden__cumle')).toBeVisible()
    await gorevleriOyna(page, 0, 9)
    await expect(page.getByRole('heading', { level: 1, name: 'Koyda akşam oldu' })).toBeVisible()
    await haritayaDon(page)

    // Fıstıkçı Şahap'ın Dükkânı: 1. görevde taş (yanlış: kitapım).
    await dokun(bolge(page, 'Dükkânı'))
    await secilebilir(karo(page, 'taş'))
    await dokun(karo(page, 'taş'))
    await dokun(dukkanKarti(page))
    await expect(page.locator('.dukkan__cumle')).toHaveText('Ek ünlüyle başlayınca p yumuşar: b olur.')
    for (let yer = 0; yer < 10; yer++) {
      await dukkanGorevi(page, yer)
      await dokun(sonraki(page))
    }
    await expect(page.getByRole('heading', { level: 1, name: 'Dükkânda akşam oldu' })).toBeVisible()
    await haritayaDon(page)

    // Kök Bahçesi: 1. ağaçta önce ler (meyvenin üstüne gövde çıkmaz).
    await dokun(bolge(page, 'Kök Bahçesi'))
    await secilebilir(bukalemun(page, 'ler'))
    await dokun(bukalemun(page, 'ler'))
    await dokun(agac(page))
    await expect(page.locator('.bahce__neden')).toContainText('Meyvenin üstüne gövde çıkmaz: önce çi.')
    for (let yer = 0; yer < 10; yer++) {
      await bahceGorevi(page, yer)
      await dokun(sonraki(page))
    }
    await expect(page.getByRole('heading', { level: 1, name: 'Bahçede akşam oldu' })).toBeVisible()
    await haritayaDon(page)

    // Uydurukçuklar'ın 1. turu: 1. görevde ler (yanlış: fıngıller).
    await dokun(bolge(page, 'Uydurukçuklar'))
    await secilebilir(bukalemun(page, 'ler'))
    await dokun(bukalemun(page, 'ler'))
    await dokun(yaratik(page))
    await expect(page.locator('.uyduruk__neden')).toBeVisible()
    for (let yer = 0; yer < 10; yer++) {
      if (yer === 3) {
        // 4. görev: gıvak (pıtak'ın yerine). Sesli modda kök söylenir; jöle → gıvağım.
        await expect(yaratik(page)).toContainText('gıvak')
        await expect.poll(() => calinanlar(page)).toContain('gıvak')
      }
      await uydurukGorevi(page, yer)
      if (yer === 3) {
        await expect(page.locator('.uyduruk__cep .sonuc-kelime__okunan')).toHaveText('gıvağım')
        await expect.poll(() => calinanlar(page)).toContain('gıvağım')
      }
      await dokun(sonraki(page))
    }
    await expect(
      page.getByRole('heading', { level: 1, name: 'Uydurukçuklarda akşam oldu' }),
    ).toBeVisible()

    // pilot.html: çocuk başına özet. Önce bölgelerin arka planda inen sesleri biter: WebKit
    // gezinmeyle kesilen fetch'i konsola hata olarak yazar ("access control checks").
    await bolgeSesleriInsin(page, ['dukkan', 'bahce', 'uyduruk'])
    await istekler.sessiz()
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
    expect(dosya.suggestedFilename()).toMatch(/^ekle-bakalim-pilot-\d{4}-\d{2}-\d{2}\.csv$/)
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
      expect(k.surum).toBe('pilot-1.1')
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
      ['gıvak', 'ğ', 'gıvağım', 'gıvakım/gıvağım'],
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
    await dokun(gezinme(page, 'Sözlük'))
    await expect(page.getByText('Sözlüğün henüz boş.')).toBeVisible()
    // Koy baştan.
    await dokun(gezinme(page, 'Harita'))
    await dokun(bolge(page, 'Bukalemun Koyu'))
    await expect(page.locator('.bolge-ustu__sira')).toHaveText('Görev 1 / 10')
  })

  test('kod yokken ve sınıf modunda hiçbir deneme yazılmaz; kod silinince günlük kapanır', async ({
    page,
  }) => {
    // Kod yok: koyun ilk görevi oynanır, günlük yazılmaz.
    await page.goto('./')
    await dokun(bolge(page, 'Bukalemun Koyu'))
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    await expect(sonraki(page)).toBeVisible()
    expect(await gunlugunSatirlari(page)).toBeNull()

    // Kod var, sınıf modu açık: yine yazılmaz; pilot.html uyarır.
    await yeniCocuk(page, 'P03')
    await page.goto('./?sinif=1')
    await expect(page.locator('html')).toHaveAttribute('data-sinif', 'acik')
    await dokun(bolge(page, 'Bukalemun Koyu'))
    await dokun(bukalemun(page, 'ler'))
    await dokun(kart(page))
    await expect(page.locator('.neden__cumle')).toBeVisible()
    expect(await gunlugunSatirlari(page)).toEqual({ cocuk: 'P03', satirlar: [] })
    await page.goto(PILOT)
    await expect(page.locator('.pilot__uyari')).toContainText(['Sınıf modu açık: denemeler yazılmaz.'])

    // Sınıf modu kapalı: yazılır. Kod silinince kapanır, satır kalır.
    await page.goto('./?sinif=0')
    await dokun(bolge(page, 'Bukalemun Koyu'))
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    await expect(sonraki(page)).toBeVisible()
    expect((await gunlugunSatirlari(page))?.satirlar).toHaveLength(1)
    await page.goto(PILOT)
    await dugme(page, 'Kodu sil').click()
    await expect(page.locator('.pilot__durum')).toContainText('Günlük kapalı: çocuk kodu yok.')
    await page.goto('./')
    await dokun(bolge(page, 'Bukalemun Koyu'))
    // Kalınan yer: 2. görev (ev); lar yanlıştır.
    await expect(page.locator('.bolge-ustu__sira')).toHaveText('Görev 2 / 10')
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
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
    await dokun(bolge(page, 'Bukalemun Koyu'))
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
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

  test('Paylaş CSV\'yi dosya olarak paylaşır (aynı ad ve içerik); günlük boşken yol tarifi', async ({
    page,
  }) => {
    // Web Share API taklidi: dosyayı paylaşabilen telefon tarayıcısı; paylaşılan dosya saklanır.
    await page.addInitScript(() => {
      const paylasilan: { ad: string; tur: string; baytlar: number[]; baslik?: string }[] = []
      ;(window as unknown as { paylasilan: typeof paylasilan }).paylasilan = paylasilan
      Object.defineProperty(navigator, 'canShare', {
        configurable: true,
        value: (veri?: ShareData) => (veri?.files ?? []).every((f) => f.type === 'text/csv'),
      })
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async (veri: ShareData) => {
          for (const dosya of veri.files ?? []) {
            paylasilan.push({
              ad: dosya.name,
              tur: dosya.type,
              baytlar: [...new Uint8Array(await dosya.arrayBuffer())],
              baslik: veri.title,
            })
          }
        },
      })
    })
    await page.goto(PILOT)
    await expect(pilotBasligi(page)).toBeVisible()
    // Günlük boş: Paylaş öteki düğmeler gibi kapalı; yanında yol tarifi.
    await expect(dugme(page, 'Paylaş')).toBeDisabled()
    await expect(page.locator('[data-yol-tarifi]')).toHaveText(
      "Günlük boş: önce çocuk kodunu yazıp Yeni çocuk'a, sonra Oyunu aç'a dokunun.",
    )

    await yeniCocuk(page, 'P08')
    await page.goto('./')
    await dokun(bolge(page, 'Bukalemun Koyu'))
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    await expect(sonraki(page)).toBeVisible()
    await page.goto(PILOT)
    await expect(page.locator('[data-yol-tarifi]')).toHaveCount(0)
    await dugme(page, 'Paylaş').click()
    await expect(page.locator('.pilot__ileti')).toHaveText('1 deneme CSV olarak paylaşıldı.')
    const paylasilan = await page.evaluate(
      () =>
        (window as unknown as { paylasilan: { ad: string; tur: string; baytlar: number[]; baslik?: string }[] })
          .paylasilan,
    )
    expect(paylasilan).toHaveLength(1)
    const [dosya] = paylasilan
    expect(dosya?.ad).toMatch(/^ekle-bakalim-pilot-\d{4}-\d{2}-\d{2}\.csv$/)
    expect(dosya?.baslik).toBe(dosya?.ad)
    expect(dosya?.tur).toBe('text/csv')
    // İndirilen CSV'nin aynısı: UTF-8 imi, noktalı virgül, CRLF.
    const baytlar = Uint8Array.from(dosya?.baytlar ?? [])
    expect([...baytlar.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    const indirme = page.waitForEvent('download')
    await dugme(page, 'CSV indir').click()
    const indirilen = await indirme
    expect(indirilen.suggestedFilename()).toBe(dosya?.ad)
    expect([...readFileSync((await indirilen.path())!)]).toEqual([...baytlar])
    const satirlar = new TextDecoder('utf-8').decode(baytlar.subarray(3)).split('\r\n')
    expect(satirlar[0]).toBe(SUTUNLAR.join(';'))
    expect(csvSatiri(satirlar[1] ?? '')).toHaveLength(SUTUNLAR.length)
    expect(satirlar[1]).toContain(';P08;pilot-1.1;koy;')
  })

  test('Paylaş, dosya paylaşamayan tarayıcıda görünmez; CSV indir ve Kopyala kalır', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
      Object.defineProperty(navigator, 'canShare', { configurable: true, value: undefined })
    })
    await page.goto(PILOT)
    await expect(pilotBasligi(page)).toBeVisible()
    await expect(dugme(page, 'CSV indir')).toBeVisible()
    await expect(dugme(page, 'Kopyala')).toBeVisible()
    await expect(dugme(page, 'Paylaş')).toHaveCount(0)
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
    await dokun(bolge(page, 'Bukalemun Koyu'))
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    await expect(sonraki(page)).toBeVisible()
    await dokun(sonraki(page))
    await expect(page.locator('.bolge-ustu__sira')).toHaveText('Görev 2 / 10')
    expect(await page.evaluate((a) => localStorage.getItem(a), DURMA)).not.toBeNull()
    expect(await gunlugunSatirlari(page)).toEqual({ cocuk: 'P06', satirlar: [] })
    await page.goto(PILOT)
    await expect(page.locator('.pilot__uyari').first()).toContainText(
      'Günlük durdu: cihazın deposu doldu',
    )
    expect(hatalar).toEqual([])
  })

  test('oyundan pilot sayfasına tek yol: Ayarlar → Hakkında → Yetişkinler için: Pilot sayfası', async ({
    page,
  }) => {
    await page.goto('./')
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(page.locator('a[href*="pilot"]')).toHaveCount(0)
    await page.goto('./#/ayarlar')
    const hakkinda = page.locator('.hakkinda')
    await expect(hakkinda).toContainText('Yetişkinler için: Pilot sayfası')
    await expect(hakkinda).toContainText('Sürüm: pilot-1.1')
    await expect(page.locator('a[href*="pilot"]')).toHaveCount(1)
    // Görünen her yerde yeni ad: eski ad (Morfemusta) yok.
    expect(await page.content()).not.toMatch(/Morfemusta/)
    await dokun(hakkinda.getByRole('link', { name: 'Pilot sayfası' }))
    await expect(pilotBasligi(page)).toBeVisible()
    expect(new URL(page.url()).pathname).toBe('/ekle-bakalim/pilot.html')
    await expect(page).toHaveTitle('Pilot · Ekle Bakalım')
    expect(await page.content()).not.toMatch(/Morfemusta/)
    await expect(page.locator('[data-surum]')).toHaveText(
      /^pilot-1\.1 \((?:[0-9a-f]{7}|bilinmiyor), \d{4}-\d{2}-\d{2}\)$/,
    )
  })

  test('çevrim dışı da açılır; belgelere bağlanır', async ({ page, context, browserName }) => {
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
      'Ekle Bakalım pilotu · Gözlemci yönergesi',
    )
  })
})
