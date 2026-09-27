import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ekle } from '../motor/index.ts'
import GaleriSayfasi from './GaleriSayfasi.tsx'
import { ORNEK_BOLUMLERI } from './ornekler.ts'

const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])

describe('GaleriSayfasi', () => {
  const html = renderToStaticMarkup(<GaleriSayfasi />)

  it('başlığı ve üstte Renksiz düğmesini gösterir', () => {
    expect(html).toMatch(/<h1[^>]*>Karakter Galerisi<\/h1>/)
    expect(html).toContain(
      '<button type="button" class="galeri__renksiz" aria-pressed="false">Renksiz</button>',
    )
    expect(html.indexOf('galeri__renksiz')).toBeLessThan(html.indexOf('<section'))
    expect(html).toMatch(/^<main class="galeri">/)
  })

  it('bölümler sırayla: sekiz ünlü, -lAr, -(I)m, saklanan, uymayan', () => {
    expect(eslesmeler(html, /<h2 id="[^"]*">([^<]*)<\/h2>/g)).toEqual([
      'Sekiz ünlü',
      '-lAr',
      '-(I)m',
      'Saklanan ünlü',
      'Uymayan ek',
    ])
  })

  it('sekiz ünlü okul çizelgesi düzeninde: üstte düz ve yuvarlak, altlarında geniş ve dar', () => {
    const cizelge = html.match(/<table class="cizelge">.*<\/table>/)?.[0] ?? ''
    expect(eslesmeler(cizelge, /<th scope="[^"]*"[^>]*>([^<]*)<\/th>/g)).toEqual([
      'Düz',
      'Yuvarlak',
      'Geniş',
      'Dar',
      'Geniş',
      'Dar',
      'Kalın',
      'İnce',
    ])
    expect(eslesmeler(cizelge, /<svg class="unlu"[^>]*data-unlu="([^"]*)"/g)).toEqual([
      'a',
      'ı',
      'o',
      'u',
      'e',
      'i',
      'ö',
      'ü',
    ])
    expect(eslesmeler(cizelge, /class="unlu-karti" data-kalinlik="([^"]*)"/g)).toEqual([
      ...Array(4).fill('kalin'),
      ...Array(4).fill('ince'),
    ])
  })

  it('sekiz bukalemun: her satırda kök, bukalemun, ok ve sonuç', () => {
    expect(eslesmeler(html, /<li class="ornek" data-sonuc="([^"]*)"/g)).toEqual([
      'kuşlar',
      'gözler',
      'kızım',
      'evim',
      'yolum',
      'gözüm',
      'kedim',
      'evlar',
    ])
    expect(eslesmeler(html, /<svg class="bukalemun[^"]*"[^>]*data-unlu="([^"]*)"/g)).toEqual([
      'a',
      'e',
      'ı',
      'i',
      'u',
      'ü',
      'i',
      'a',
    ])
    for (const satir of html.match(/<li class="ornek".*?<\/li>/g) ?? []) {
      expect(eslesmeler(satir, /class="(kok-yazisi|bukalemun|ornek__ok|ornek__bicim)\b/g)).toEqual(
        ['kok-yazisi', 'bukalemun', 'ornek__ok', 'ornek__bicim'],
      )
    }
  })

  it('saklanan ve uymayan durumlar yalnız kendi örneklerinde', () => {
    const kedim = html.match(/<li class="ornek" data-sonuc="kedim">.*?<\/li>/)?.[0] ?? ''
    expect(kedim).toContain('bukalemun bukalemun--saklanan')
    expect(html.match(/bukalemun--saklanan/g)).toHaveLength(1)

    const evlar = html.match(/<li class="ornek" data-sonuc="evlar">.*?<\/li>/)?.[0] ?? ''
    expect(evlar).toContain('bukalemun bukalemun--uyumsuz')
    expect(evlar).toContain('<s class="ornek__bicim ornek__bicim--uyumsuz">evlar</s>')
    expect(html.match(/bukalemun--uyumsuz/g)).toHaveLength(1)
    expect(html.match(/<s /g)).toHaveLength(1)
  })
})

describe('galerinin örnekleri', () => {
  const ornekler = ORNEK_BOLUMLERI.flatMap((bolum) => bolum.ornekler)

  it('biçimler ve bukalemun parçaları ekle()\'den gelir; yalnız uymayan örnek elle kurulur', () => {
    const uymayanlar = ornekler.filter((ornek) => ornek.uyumsuz)
    expect(uymayanlar.map(({ kok, sonuc }) => [kok, sonuc])).toEqual([['ev', 'evlar']])
    for (const ornek of ornekler.filter((o) => !o.uyumsuz)) {
      const sonuc = ekle(ornek.kok, [ornek.parca.etiket])
      expect(ornek.sonuc).toBe(sonuc.bicim)
      expect(ornek.parca).toEqual(sonuc.parcalar[0])
    }
  })

  it('motor ev + PL için lar vermez', () => {
    expect(ekle('ev', ['PL']).bicim).toBe('evler')
  })
})
