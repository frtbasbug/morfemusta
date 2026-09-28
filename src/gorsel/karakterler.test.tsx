import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ekle, type EkParcasi, type Unlu as UnluHarfi } from '../motor/index.ts'
import Bukalemun from './Bukalemun.tsx'
import { UNLULER, bukalemunCizimi, unluCizimi } from './cizim.ts'
import KokYazisi from './KokYazisi.tsx'
import Unlu from './Unlu.tsx'
import UnluKarti from './UnluKarti.tsx'

const SEKIZ_UNLU = Object.keys(UNLULER) as UnluHarfi[]

const oznitelikler = (html: string, ad: string) =>
  [...html.matchAll(new RegExp(` ${ad}="([^"]*)"`, 'g'))].map((m) => m[1])

/** Çizim öğelerinin sınıfları, yazıldıkları (çizildikleri) sırayla. */
const cizimSirasi = (html: string, onEk: string) =>
  [...html.matchAll(new RegExp(`class="(${onEk}__[^"]+)"`, 'g'))].map((m) => m[1])

/** Boyut öznitelikleri çıkarılmış çizim: ölçek dışında her şey. */
const olceksiz = (html: string) => html.replace(/ width="[^"]*" height="[^"]*"/, '')

// Renkler CSS değişkenlerinden gelir: SVG'de renk, dolgu, çizgi ya da satır içi stil yazılmaz.
const RENK_YAZISI = /fill=|stroke=|style=|#[0-9a-f]{3,8}\b|rgb\(/i

const parca = (kok: string, etiket: string): EkParcasi => {
  const [ilk] = ekle(kok, [etiket]).parcalar
  if (!ilk) throw new Error(`${kok} + ${etiket}: parça yok`)
  return ilk
}

const EVLAR: EkParcasi = {
  etiket: 'PL',
  sablon: '-lAr',
  tur: 'çekim',
  govde: 'ev',
  yuzey: 'lar',
  olaylar: [],
}

describe('Unlu', () => {
  it.each([
    ['a', 'a: kalın, düz, geniş'],
    ['ı', 'ı: kalın, düz, dar'],
    ['o', 'o: kalın, yuvarlak, geniş'],
    ['u', 'u: kalın, yuvarlak, dar'],
    ['e', 'e: ince, düz, geniş'],
    ['i', 'i: ince, düz, dar'],
    ['ö', 'ö: ince, yuvarlak, geniş'],
    ['ü', 'ü: ince, yuvarlak, dar'],
  ] as const)('%s: role=img, aria-label "%s"', (unlu, ad) => {
    const html = renderToStaticMarkup(<Unlu unlu={unlu} />)
    expect(html).toMatch(/^<svg [^>]*role="img"/)
    expect(oznitelikler(html, 'aria-label')).toEqual([ad])
  })

  it('72×76 viewBox; boyut yalnız ölçekler', () => {
    const bir = renderToStaticMarkup(<Unlu unlu="a" />)
    const iki = renderToStaticMarkup(<Unlu unlu="a" boyut={2} />)
    expect(oznitelikler(bir, 'viewBox')).toEqual(['0 0 72 76'])
    expect([oznitelikler(bir, 'width'), oznitelikler(bir, 'height')]).toEqual([['72'], ['76']])
    expect([oznitelikler(iki, 'width'), oznitelikler(iki, 'height')]).toEqual([['144'], ['152']])
    expect(olceksiz(iki)).toBe(olceksiz(bir))
  })

  it.each(SEKIZ_UNLU)('%s: gövde ve ağız cizim.ts\'ten, renk sınıftan', (unlu) => {
    const html = renderToStaticMarkup(<Unlu unlu={unlu} />)
    const cizim = unluCizimi(UNLULER[unlu])
    expect(oznitelikler(html, 'd')).toEqual([cizim.govde, cizim.agiz])
    expect(oznitelikler(html, 'class')[0]).toBe(`unlu unlu--${UNLULER[unlu].kalin ? 'kalin' : 'ince'}`)
    expect(html).not.toMatch(RENK_YAZISI)
  })

  it('çizim sırası: gövde, yanaklar, gözler, ağız', () => {
    expect(cizimSirasi(renderToStaticMarkup(<Unlu unlu="o" />), 'unlu')).toEqual([
      'unlu__govde',
      'unlu__yanak',
      'unlu__yanak',
      'unlu__goz-aki',
      'unlu__bebek',
      'unlu__goz-aki',
      'unlu__bebek',
      'unlu__agiz',
    ])
  })

  it('sekiz ünlü renk olmadan da ayrı çizilir: gövde ve ağız sekiz ayrı bileşim', () => {
    const cizimler = SEKIZ_UNLU.map((unlu) =>
      oznitelikler(renderToStaticMarkup(<Unlu unlu={unlu} />), 'd').join(' | '),
    )
    expect(new Set(cizimler).size).toBe(8)
  })
})

describe('UnluKarti', () => {
  it('karakter ve altında harfi; zemin kalınlığa göre', () => {
    const a = renderToStaticMarkup(<UnluKarti unlu="a" />)
    expect(a).toMatch(/^<div class="unlu-karti unlu-karti--kalin"><svg /)
    expect(a).toContain('<span class="unlu-karti__harf" aria-hidden="true">a</span>')
    expect(renderToStaticMarkup(<UnluKarti unlu="ü" />)).toMatch(
      /^<div class="unlu-karti unlu-karti--ince">/,
    )
  })
})

describe('Bukalemun', () => {
  it('kuş + PL: lar, a kılığında (kalın, düz, geniş)', () => {
    const html = renderToStaticMarkup(<Bukalemun parca={parca('kuş', 'PL')} />)
    expect(html).toMatch(/^<svg [^>]*role="img"/)
    expect(oznitelikler(html, 'aria-label')).toEqual(['lar bukalemunu, a: kalın, düz, geniş'])
    expect(oznitelikler(html, 'class')[0]).toBe('bukalemun bukalemun--kalin')
    expect(oznitelikler(html, 'viewBox')).toEqual(['0 0 132 82'])
    expect(oznitelikler(html, 'd')).toContain(bukalemunCizimi(UNLULER.a).govde)
    expect(html).toContain('class="bukalemun__agiz"')
    expect(html).toMatch(/<text class="bukalemun__yazi" [^>]*text-anchor="middle">lar<\/text>/)
    expect(html).not.toMatch(RENK_YAZISI)
  })

  it('göz + PL: ler, e kılığında; -lAr\'da yalnız kalınlık değişir', () => {
    const html = renderToStaticMarkup(<Bukalemun parca={parca('göz', 'PL')} />)
    expect(oznitelikler(html, 'aria-label')).toEqual(['ler bukalemunu, e: ince, düz, geniş'])
    expect(oznitelikler(html, 'class')[0]).toBe('bukalemun bukalemun--ince')
    expect(oznitelikler(html, 'd')).toContain(bukalemunCizimi(UNLULER.e).govde)
  })

  it.each([
    ['kız', 'ım', 'ı'],
    ['ev', 'im', 'i'],
    ['yol', 'um', 'u'],
    ['göz', 'üm', 'ü'],
  ] as const)('%s + POSS.1SG: %s, %s kılığında; -(I)m\'de biçim de değişir', (kok, yazi, unlu) => {
    const html = renderToStaticMarkup(<Bukalemun parca={parca(kok, 'POSS.1SG')} />)
    expect(oznitelikler(html, 'aria-label')[0]).toMatch(new RegExp(`^${yazi} bukalemunu, ${unlu}: `))
    expect(oznitelikler(html, 'd')).toContain(bukalemunCizimi(UNLULER[unlu]).govde)
    expect(html).toContain(`>${yazi}</text>`)
  })

  it('çizim sırası: kuyruk ve bacaklar, ibik, gövde, göz tümseği, göz, ağız, ek yazısı', () => {
    expect(cizimSirasi(renderToStaticMarkup(<Bukalemun parca={parca('yol', 'POSS.1SG')} />), 'bukalemun')).toEqual([
      'bukalemun__uzuv-alti',
      'bukalemun__uzuv',
      'bukalemun__ibik',
      'bukalemun__govde',
      'bukalemun__goz-tumsegi',
      'bukalemun__goz-aki',
      'bukalemun__bebek',
      'bukalemun__agiz',
      'bukalemun__yazi',
    ])
  })

  it('saklanan: kedi + POSS.1SG → üstünde yalnız m; biçimi i\'ninki; ağzı yok, gözü var', () => {
    const html = renderToStaticMarkup(<Bukalemun parca={parca('kedi', 'POSS.1SG')} />)
    expect(oznitelikler(html, 'aria-label')).toEqual(['m bukalemunu, saklanan i: ince, düz, dar'])
    expect(oznitelikler(html, 'class')[0]).toBe('bukalemun bukalemun--ince bukalemun--saklanan')
    expect(oznitelikler(html, 'd')).toContain(bukalemunCizimi(UNLULER.i).govde)
    expect(html).toContain('>m</text>')
    expect(html).toContain('class="bukalemun__goz-aki"')
    expect(html).not.toContain('bukalemun__agiz')
  })

  it('uyumsuz durum prop\'la seçilir: ev + lar eğik durur', () => {
    const html = renderToStaticMarkup(<Bukalemun parca={EVLAR} uyumsuz />)
    expect(oznitelikler(html, 'class')[0]).toBe('bukalemun bukalemun--kalin bukalemun--uyumsuz')
    expect(oznitelikler(html, 'aria-label')).toEqual([
      'lar bukalemunu, uymuyor, a: kalın, düz, geniş',
    ])
    expect(renderToStaticMarkup(<Bukalemun parca={EVLAR} />)).not.toContain('uyumsuz')
  })

  it('132×82 viewBox; boyut yalnız ölçekler', () => {
    const bir = renderToStaticMarkup(<Bukalemun parca={parca('kuş', 'PL')} />)
    const yarim = renderToStaticMarkup(<Bukalemun parca={parca('kuş', 'PL')} boyut={0.5} />)
    expect([oznitelikler(bir, 'width'), oznitelikler(bir, 'height')]).toEqual([['132'], ['82']])
    expect([oznitelikler(yarim, 'width'), oznitelikler(yarim, 'height')]).toEqual([['66'], ['41']])
    expect(olceksiz(yarim)).toBe(olceksiz(bir))
  })
})

describe('KokYazisi', () => {
  const gorunen = (kok: string) =>
    /<span aria-hidden="true">(.*)<\/span><\/span>$/.exec(renderToStaticMarkup(<KokYazisi kok={kok} />))?.[1]

  it('son ünlü etikette: kuş → u (kalın, yuvarlak)', () => {
    expect(gorunen('kuş')).toBe(
      'k<span class="kok-yazisi__unlu kok-yazisi__unlu--kalin kok-yazisi__unlu--yuvarlak">u</span>ş',
    )
  })

  it('birden çok ünlüde yalnız sonuncusu: kedi → i (ince, düz)', () => {
    expect(gorunen('kedi')).toBe(
      'ked<span class="kok-yazisi__unlu kok-yazisi__unlu--ince kok-yazisi__unlu--duz">i</span>',
    )
  })

  it('ünlü başta da olabilir: ev → e', () => {
    expect(gorunen('ev')).toBe(
      '<span class="kok-yazisi__unlu kok-yazisi__unlu--ince kok-yazisi__unlu--duz">e</span>v',
    )
  })

  it('ekran okuyucu kökü tek kelime olarak okur', () => {
    expect(renderToStaticMarkup(<KokYazisi kok="göz" />)).toMatch(
      /^<span class="kok-yazisi"><span class="kok-yazisi__okunan">göz<\/span><span aria-hidden="true">/,
    )
  })
})
