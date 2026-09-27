import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ekle, type EkParcasi, type Unlu as UnluSesi } from '../motor/index.ts'
import Bukalemun from './Bukalemun.tsx'
import { UNLULER, bukalemunCizimi, unluCizimi } from './cizim.ts'
import KokYazisi from './KokYazisi.tsx'
import Unlu from './Unlu.tsx'

const ilkParca = (kok: string, etiket: string): EkParcasi => {
  const parca = ekle(kok, [etiket]).parcalar[0]
  if (!parca) throw new Error(`${kok} + ${etiket}: parça yok`)
  return parca
}

const oznitelik = (html: string, ad: string) => html.match(new RegExp(`${ad}="([^"]*)"`))?.[1]
const yollar = (html: string) => [...html.matchAll(/ d="([^"]*)"/g)].map((m) => m[1])

// Renkler CSS değişkenlerinden gelir: işaretlemede renk ve boyama özniteliği olmaz.
const renkYok = (html: string) => {
  expect(html).not.toMatch(/#[0-9a-f]{3,8}\b|rgb\(|hsl\(/i)
  expect(html).not.toMatch(/\s(fill|stroke|color|style)=/)
}

const UNLU_ETIKETLERI: [UnluSesi, string][] = [
  ['a', 'a: kalın, düz, geniş'],
  ['ı', 'ı: kalın, düz, dar'],
  ['o', 'o: kalın, yuvarlak, geniş'],
  ['u', 'u: kalın, yuvarlak, dar'],
  ['e', 'e: ince, düz, geniş'],
  ['i', 'i: ince, düz, dar'],
  ['ö', 'ö: ince, yuvarlak, geniş'],
  ['ü', 'ü: ince, yuvarlak, dar'],
]

describe('Unlu', () => {
  it.each(UNLU_ETIKETLERI)('%s: role=img, aria-label ve 72×76 viewBox', (unlu, etiket) => {
    const html = renderToStaticMarkup(<Unlu unlu={unlu} />)
    expect(html).toMatch(/^<svg [^>]*role="img"/)
    expect(oznitelik(html, 'aria-label')).toBe(etiket)
    expect(oznitelik(html, 'viewBox')).toBe('0 0 72 76')
    expect(oznitelik(html, 'width')).toBe('72')
    expect(oznitelik(html, 'height')).toBe('76')
    expect(oznitelik(html, 'data-kalinlik')).toBe(UNLULER[unlu].kalin ? 'kalin' : 'ince')
    renkYok(html)
  })

  it('çizimi cizim.ts\'ten alır: gövde, iki yanak, iki göz ve ağız', () => {
    const html = renderToStaticMarkup(<Unlu unlu="ö" />)
    const cizim = unluCizimi(UNLULER.ö)
    expect(yollar(html)).toEqual([cizim.govde, cizim.agiz])
    expect(html.match(/class="karakter__yanak"/g)).toHaveLength(2)
    expect(html.match(/class="karakter__goz-aki"/g)).toHaveLength(2)
    expect(html.match(/class="karakter__bebek"/g)).toHaveLength(2)
  })

  it('boyut yalnız ölçekler', () => {
    const olagan = renderToStaticMarkup(<Unlu unlu="u" />)
    const buyuk = renderToStaticMarkup(<Unlu unlu="u" boyut={144} />)
    expect(oznitelik(buyuk, 'width')).toBe('144')
    expect(oznitelik(buyuk, 'height')).toBe('152')
    expect(buyuk.replace(/ (width|height)="[^"]*"/g, '')).toBe(
      olagan.replace(/ (width|height)="[^"]*"/g, ''),
    )
  })
})

describe('Bukalemun', () => {
  it.each([
    ['kuş', 'PL', 'lar', 'lar bukalemunu, a kılığında: kalın, düz, geniş'],
    ['göz', 'PL', 'ler', 'ler bukalemunu, e kılığında: ince, düz, geniş'],
    ['kız', 'POSS.1SG', 'ım', 'ım bukalemunu, ı kılığında: kalın, düz, dar'],
    ['ev', 'POSS.1SG', 'im', 'im bukalemunu, i kılığında: ince, düz, dar'],
    ['yol', 'POSS.1SG', 'um', 'um bukalemunu, u kılığında: kalın, yuvarlak, dar'],
    ['göz', 'POSS.1SG', 'üm', 'üm bukalemunu, ü kılığında: ince, yuvarlak, dar'],
  ])('%s + %s: ekin ilk yüzey ünlüsünün kılığında (%s)', (kok, etiket, yazi, ariaEtiketi) => {
    const html = renderToStaticMarkup(<Bukalemun parca={ilkParca(kok, etiket)} />)
    expect(html).toMatch(/^<svg [^>]*role="img"/)
    expect(oznitelik(html, 'aria-label')).toBe(ariaEtiketi)
    expect(oznitelik(html, 'viewBox')).toBe('0 0 132 82')
    expect(oznitelik(html, 'class')).toBe('bukalemun')
    expect(html).toContain(`>${yazi}</text>`)
    renkYok(html)
  })

  it('çizim sırası: kuyruk ve bacaklar (alt, üst), ibik, gövde, göz tümseği, göz, ağız, yazı', () => {
    const html = renderToStaticMarkup(<Bukalemun parca={ilkParca('yol', 'POSS.1SG')} />)
    const cizim = bukalemunCizimi(UNLULER.u)
    expect(yollar(html)).toEqual([
      cizim.kuyruk,
      cizim.bacaklar,
      cizim.kuyruk,
      cizim.bacaklar,
      cizim.ibik,
      cizim.govde,
      cizim.agiz,
    ])
    const siniflar = [...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1])
    expect(siniflar).toEqual([
      'bukalemun',
      'bukalemun__alt-cizgi',
      'bukalemun__ust-cizgi',
      'bukalemun__ibik',
      'karakter__govde',
      'bukalemun__goz-tumsegi',
      'karakter__goz-aki',
      'karakter__bebek',
      'karakter__agiz',
      'bukalemun__yazi',
    ])
    expect(html).toContain(`cx="${cizim.goz.x}" cy="${cizim.goz.y}" r="${cizim.goz.r}"`)
    expect(html).toContain(`x="${cizim.yazi.x}" y="${cizim.yazi.y}" text-anchor="middle"`)
  })

  it('saklanan: kedi + POSS.1SG; biçimi uyumun seçeceği i, üstünde yalnız m, ağzı yok', () => {
    const html = renderToStaticMarkup(<Bukalemun parca={ilkParca('kedi', 'POSS.1SG')} />)
    expect(oznitelik(html, 'class')).toBe('bukalemun bukalemun--saklanan')
    expect(oznitelik(html, 'data-unlu')).toBe('i')
    expect(oznitelik(html, 'aria-label')).toBe('m bukalemunu, saklanan i: ince, düz, dar')
    expect(yollar(html)).toContain(bukalemunCizimi(UNLULER.i).govde)
    expect(html).not.toContain('karakter__agiz')
    expect(html).toContain('karakter__goz-aki')
    expect(html).toContain('>m</text>')
  })

  it('uymayan ek prop\'la seçilir: ev + lar', () => {
    const lar: EkParcasi = { ...ilkParca('ev', 'PL'), yuzey: 'lar', olaylar: [] }
    const html = renderToStaticMarkup(<Bukalemun parca={lar} uyumsuz />)
    expect(oznitelik(html, 'class')).toBe('bukalemun bukalemun--uyumsuz')
    expect(oznitelik(html, 'data-unlu')).toBe('a')
    expect(oznitelik(html, 'aria-label')).toBe(
      'lar bukalemunu, a kılığında: kalın, düz, geniş; uymuyor',
    )
  })

  it('boyut yalnız ölçekler', () => {
    const olagan = renderToStaticMarkup(<Bukalemun parca={ilkParca('kuş', 'PL')} />)
    const buyuk = renderToStaticMarkup(<Bukalemun parca={ilkParca('kuş', 'PL')} boyut={264} />)
    expect(oznitelik(olagan, 'width')).toBe('132')
    expect(oznitelik(olagan, 'height')).toBe('82')
    expect(oznitelik(buyuk, 'width')).toBe('264')
    expect(oznitelik(buyuk, 'height')).toBe('164')
    expect(buyuk.replace(/ (width|height)="[^"]*"/g, '')).toBe(
      olagan.replace(/ (width|height)="[^"]*"/g, ''),
    )
  })
})

describe('KokYazisi', () => {
  it.each([
    ['göz', 'g', 'ö', 'z', 'ince', 'yuvarlak'],
    ['kuş', 'k', 'u', 'ş', 'kalin', 'yuvarlak'],
    ['kız', 'k', 'ı', 'z', 'kalin', 'duz'],
    ['ev', '', 'e', 'v', 'ince', 'duz'],
    ['kedi', 'ked', 'i', '', 'ince', 'duz'],
    ['toplar', 'topl', 'a', 'r', 'kalin', 'duz'],
  ])('%s: son ünlü etikette', (kok, bas, unlu, son, kalinlik, yuvarlaklik) => {
    const html = renderToStaticMarkup(<KokYazisi kok={kok} />)
    expect(html).toBe(
      `<span class="kok-yazisi">${bas}` +
        `<span class="kok-yazisi__etiket" data-unlu="${unlu}" data-kalinlik="${kalinlik}"` +
        ` data-yuvarlaklik="${yuvarlaklik}">${unlu}</span>${son}</span>`,
    )
  })

  it('NFC\'ye çevirir: ayrışık ö de etiketlenir', () => {
    const html = renderToStaticMarkup(<KokYazisi kok={'göz'} />)
    expect(html).toContain('data-unlu="ö"')
  })
})
