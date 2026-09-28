import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { KOK_SOZLUGU, ekle } from '../motor/index.ts'
import KarakterGalerisi from './KarakterGalerisi.tsx'
import { GALERI_BOLUMLERI, UYMAYAN_ORNEK } from './ornekler.ts'

const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])

describe('KarakterGalerisi', () => {
  const html = renderToStaticMarkup(<KarakterGalerisi />)
  const karakterAdlari = eslesmeler(html, /role="img" aria-label="([^"]*)"/g)

  it('başlığı ve başta basılı olmayan Renksiz düğmesini verir', () => {
    expect(html).toMatch(/^<main class="galeri">/)
    expect(html).toMatch(/<h1 class="galeri__baslik">Karakter Galerisi<\/h1>/)
    expect(html).toMatch(
      /<button type="button" class="galeri__renksiz" aria-pressed="false">Renksiz<\/button>/,
    )
  })

  it('sekiz ünlü okul çizelgesi düzeninde: kalın satırında a ı o u, ince satırında e i ö ü', () => {
    expect(karakterAdlari.filter((ad) => !ad?.includes('bukalemun'))).toEqual([
      'a: kalın, düz, geniş',
      'ı: kalın, düz, dar',
      'o: kalın, yuvarlak, geniş',
      'u: kalın, yuvarlak, dar',
      'e: ince, düz, geniş',
      'i: ince, düz, dar',
      'ö: ince, yuvarlak, geniş',
      'ü: ince, yuvarlak, dar',
    ])
    const cizelge = /<table class="cizelge">(.*?)<\/table>/.exec(html)?.[1] ?? ''
    expect(eslesmeler(cizelge, /scope="colgroup"[^>]*>([^<]*)</g)).toEqual(['düz', 'yuvarlak'])
    expect(eslesmeler(cizelge, /<th scope="col">([^<]*)</g)).toEqual([
      'geniş',
      'dar',
      'geniş',
      'dar',
    ])
    expect(eslesmeler(cizelge, /<th scope="row">([^<]*)</g)).toEqual(['kalın', 'ince'])
    expect(cizelge.match(/class="unlu-karti /g)).toHaveLength(8)
  })

  it('bölümler sırayla: sekiz ünlü, kök etiketi, -lAr, -(I)m, saklanan, uymayan', () => {
    expect(eslesmeler(html, /<h2 id="[^"]*">([^<]*)<\/h2>/g)).toEqual([
      'Sekiz ünlü',
      'Kök etiketi',
      '-lAr',
      '-(I)m',
      'Saklanan ünlü',
      'Uymayan ek',
    ])
  })

  it('kök etiketleri ünlülerle aynı çizelge düzeninde: a ı o u, e i ö ü', () => {
    const cizelge = /<table class="cizelge cizelge--etiket">(.*?)<\/table>/.exec(html)?.[1] ?? ''
    expect(eslesmeler(cizelge, /class="unlu-etiketi ([^"]*)"[^>]*>([^<]*)</g)).toEqual([
      'unlu-etiketi--kalin unlu-etiketi--duz',
      'unlu-etiketi--kalin unlu-etiketi--duz',
      'unlu-etiketi--kalin unlu-etiketi--yuvarlak',
      'unlu-etiketi--kalin unlu-etiketi--yuvarlak',
      'unlu-etiketi--ince unlu-etiketi--duz',
      'unlu-etiketi--ince unlu-etiketi--duz',
      'unlu-etiketi--ince unlu-etiketi--yuvarlak',
      'unlu-etiketi--ince unlu-etiketi--yuvarlak',
    ])
    expect(eslesmeler(cizelge, /class="unlu-etiketi [^"]*"[^>]*>([^<]*)</g)).toEqual([
      'a',
      'ı',
      'o',
      'u',
      'e',
      'i',
      'ö',
      'ü',
    ])
    expect(cizelge).toContain('(kalında 58:56, incede 34:56)')
  })

  it('sekiz bukalemun: -lAr, -(I)m, saklanan, uymayan', () => {
    expect(karakterAdlari.filter((ad) => ad?.includes('bukalemun'))).toEqual([
      'lar bukalemunu, a: kalın, düz, geniş',
      'ler bukalemunu, e: ince, düz, geniş',
      'ım bukalemunu, ı: kalın, düz, dar',
      'im bukalemunu, i: ince, düz, dar',
      'um bukalemunu, u: kalın, yuvarlak, dar',
      'üm bukalemunu, ü: ince, yuvarlak, dar',
      'm bukalemunu, saklanan i: ince, düz, dar',
      'lar bukalemunu, uymuyor, a: kalın, düz, geniş',
    ])
  })

  it('her örnek satırı sırayla kök, bukalemun, ok ve sonuç verir', () => {
    const satirlar = eslesmeler(html, /<li class="ornek">(.*?)<\/li>/g)
    expect(satirlar).toHaveLength(8)
    for (const satir of satirlar) {
      expect(
        eslesmeler(satir ?? '', /class="(kok-yazisi|bukalemun|ornek__ok|ornek__sonuc)[ "]/g),
      ).toEqual(['kok-yazisi', 'bukalemun', 'ornek__ok', 'ornek__sonuc'])
    }
    expect(eslesmeler(html, /class="kok-yazisi__okunan">([^<]*)</g)).toEqual([
      'kuş',
      'göz',
      'kız',
      'ev',
      'yol',
      'göz',
      'kedi',
      'ev',
    ])
    expect(eslesmeler(html, /class="ornek__sonuc[^"]*">([^<]*)</g)).toEqual([
      'kuşlar',
      'gözler',
      'kızım',
      'evim',
      'yolum',
      'gözüm',
      'kedim',
      'evlar',
    ])
  })

  it('uymayan sonucun üstü çizilidir', () => {
    expect(html).toContain('<s class="ornek__sonuc ornek__sonuc--uymayan">evlar</s>')
    expect(html.match(/<s /g)).toHaveLength(1)
  })
})

describe('galeri örnekleri', () => {
  const ornekler = GALERI_BOLUMLERI.flatMap((bolum) => bolum.ornekler)

  it('bölümler sırayla: -lAr, -(I)m, saklanan ünlü, uymayan ek', () => {
    expect(GALERI_BOLUMLERI.map((bolum) => bolum.baslik)).toEqual([
      '-lAr',
      '-(I)m',
      'Saklanan ünlü',
      'Uymayan ek',
    ])
  })

  it('kökler sözlükte (uydurma değil)', () => {
    for (const { kok } of ornekler) expect(KOK_SOZLUGU.has(kok), kok).toBe(true)
  })

  it('biçimler ve ek parçaları motordan gelir', () => {
    for (const ornek of ornekler.filter((o) => !o.uyumsuz)) {
      const sonuc = ekle(ornek.kok, [ornek.etiket])
      expect(ornek.sonuc).toBe(sonuc.bicim)
      expect(ornek.parca).toEqual(sonuc.parcalar[0])
    }
  })

  it('yalnız uymayan örnek elle kurulur; motor onu üretmez', () => {
    expect(ornekler.filter((o) => o.uyumsuz)).toEqual([UYMAYAN_ORNEK])
    expect(UYMAYAN_ORNEK.sonuc).toBe(UYMAYAN_ORNEK.parca.govde + UYMAYAN_ORNEK.parca.yuzey)
    expect(ekle('ev', ['PL']).bicim).toBe('evler')
  })
})
