import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BOLGELER, bolgeBul, type Bolge } from '../oyun/bolgeler.ts'
import { BOS_ILERLEME, bolgeDurumlari, gorevBitti, type Ilerleme } from '../oyun/ilerleme.ts'
import AdaHaritasi, { BOLGE_YERLERI, HARITA_KUTUSU, yumusakYol } from './AdaHaritasi.tsx'

const KOY = bolgeBul('koy') as Bolge
const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])
/** renderToStaticMarkup kesme işaretini kaçışlar: Şahap&#x27;ın. */
const metin = (html: string | undefined) => html?.replaceAll('&#x27;', "'")

const harita = (ilerleme: Ilerleme) =>
  renderToStaticMarkup(<AdaHaritasi bolgeler={bolgeDurumlari(ilerleme)} onBolge={() => {}} />)

/** Bölge düğmeleri: kimlik, durum sınıfı, ad ve durum yazısı, sırayla. */
const dugmeler = (html: string) =>
  [
    ...html.matchAll(
      /<button type="button" class="bolge bolge--([a-z]+)" data-bolge="([a-z]+)" aria-label="([^"]*)">(.*?)<\/button>/g,
    ),
  ].map(([, durum, kimlik, adi, icerik]) => ({
    kimlik,
    durum,
    adi: metin(adi),
    ad: metin(/<span class="bolge__ad">([^<]*)<\/span>/.exec(icerik ?? '')?.[1]),
    yazi: /<span class="bolge__durum"><svg[^>]*>.*?<\/svg>([^<]*)<\/span>/.exec(icerik ?? '')?.[1],
    isaret: /class="bolge__isaret" aria-hidden="true"/.test(icerik ?? ''),
  }))

const KOY_BITTI = KOY.gorevler.reduce(
  (i, g) => gorevBitti(i, KOY, g, new Date(2026, 8, 28, 10)),
  BOS_ILERLEME,
)

describe('AdaHaritasi', () => {
  const ilk = harita(BOS_ILERLEME)

  it('açılış ekranı: adanın adı birinci düzey başlık', () => {
    expect(ilk).toMatch(/^<main class="harita" aria-labelledby="harita-baslik">/)
    expect(ilk).toMatch(/<h1 id="harita-baslik" class="harita__baslik" tabindex="-1">Morfemusta Adası<\/h1>/)
  })

  it('adanın çizimi süstür: ekran okuyucudan gizli', () => {
    expect(ilk).toMatch(/<svg class="harita__cizim" viewBox="0 0 320 440" aria-hidden="true"/)
  })

  it('bölgeler gerçek düğmeler, tablodaki sırayla, sıralı bir listede', () => {
    expect(ilk).toContain('<ol class="harita__bolgeler">')
    expect(dugmeler(ilk).map((d) => d.ad)).toEqual(BOLGELER.map((b) => b.ad))
  })

  it('ilk açılışta yalnız Bukalemun Koyu açık; ötekiler kilitli (simge ve yazıyla)', () => {
    expect(dugmeler(ilk).map(({ kimlik, durum, yazi }) => [kimlik, durum, yazi])).toEqual([
      ['koy', 'acik', 'Açık'],
      ['dukkan', 'kilitli', 'Kilitli'],
      ['bahce', 'kilitli', 'Kilitli'],
      ['uyduruk', 'kilitli', 'Kilitli'],
    ])
  })

  it('koy bitince: koy tamam, dükkân hazırlanıyor, ötekiler kilitli', () => {
    expect(dugmeler(harita(KOY_BITTI)).map(({ durum, yazi }) => [durum, yazi])).toEqual([
      ['tamam', 'Tamam'],
      ['hazirlaniyor', 'Hazırlanıyor'],
      ['kilitli', 'Kilitli'],
      ['kilitli', 'Kilitli'],
    ])
  })

  it('her durumun kendi simgesi var: renkten başka biçim de', () => {
    const simgeler = (html: string) =>
      eslesmeler(html, /<span class="bolge__durum">(<svg[^>]*>.*?<\/svg>)/g)
    const [acik, kilitli] = simgeler(ilk)
    const [tamam, hazirlaniyor] = simgeler(harita(KOY_BITTI))
    expect(new Set([acik, kilitli, tamam, hazirlaniyor]).size).toBe(4)
    for (const simge of [acik, kilitli, tamam, hazirlaniyor]) {
      expect(simge).toMatch(/^<svg class="simge" [^>]*aria-hidden="true"/)
    }
  })

  it('düğmenin adı görünen yazının aynısı: bölgenin adı ve durumu', () => {
    expect(dugmeler(ilk).map((d) => d.adi)).toEqual([
      'Bukalemun Koyu, Açık',
      "Fıstıkçı Şahap'ın Dükkânı, Kilitli",
      'Kök Bahçesi, Kilitli',
      'Uydurukçuklar, Kilitli',
    ])
    for (const { adi, ad, yazi } of dugmeler(harita(KOY_BITTI))) expect(adi).toBe(`${ad}, ${yazi}`)
  })

  it('koyun işareti küçük, yazısız bir bukalemun (ilk görevinin); öteki bölgelerin işareti yok', () => {
    expect(dugmeler(ilk).map((d) => d.isaret)).toEqual([true, false, false, false])
    const isaret = /<span class="bolge__isaret" aria-hidden="true">(<svg.*?<\/svg>)<\/span>/.exec(ilk)?.[1]
    expect(isaret).toMatch(
      /^<svg class="bukalemun bukalemun--kalin" viewBox="0 0 132 82" width="55.44" height="34.44" role="img" aria-label="lar bukalemunu, a: kalın, düz, geniş">/,
    )
    // Ek yazısı 0.42 ölçekte okunmaz: işaret süstür, yazısı yok.
    expect(isaret).not.toMatch(/<text|bukalemun__yazi/)
  })

  it('ileti yeri boş: kilitli bölgeye dokununca nedeni burada yazılır', () => {
    expect(ilk).toContain('<p class="harita__ileti" role="status"></p>')
  })

  it('hiçbir yerde puan, seri ya da süre yok', () => {
    expect(ilk).not.toMatch(/puan|seri|süre|skor/i)
  })
})

describe('haritanın yerleşimi', () => {
  it('her bölgenin haritada bir yeri var; yerler kutunun içinde', () => {
    expect(BOLGE_YERLERI.length).toBeGreaterThanOrEqual(BOLGELER.length)
    for (const { x, y } of BOLGE_YERLERI) {
      expect(x).toBeGreaterThan(0)
      expect(x).toBeLessThan(HARITA_KUTUSU.en)
      expect(y).toBeGreaterThan(0)
      expect(y).toBeLessThan(HARITA_KUTUSU.boy)
    }
  })

  it('düğmeler yerlerinde: yüzde konum çizimin kutusundan', () => {
    const [koy] = BOLGE_YERLERI
    expect(harita(BOS_ILERLEME)).toContain(
      `style="left:${((koy?.x ?? 0) / 320) * 100}%;top:${((koy?.y ?? 0) / 440) * 100}%"`,
    )
  })

  it('yol bölgelerden sırayla geçer', () => {
    const noktalar = [
      { x: 10, y: 20 },
      { x: 50, y: 60 },
      { x: 90, y: 20 },
    ]
    const yol = yumusakYol(noktalar)
    expect(yol.startsWith('M10 20C')).toBe(true)
    expect(eslesmeler(yol, / (-?[\d.]+ -?[\d.]+)(?=C|$)/g)).toEqual(['50 60', '90 20'])
    expect(yumusakYol(noktalar, true).endsWith(' 10 20Z')).toBe(true)
    expect(yumusakYol([])).toBe('')
  })
})
