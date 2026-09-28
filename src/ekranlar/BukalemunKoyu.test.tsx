import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BUKALEMUN_KOYU_GOREVLERI, type Gorev } from '../oyun/gorevler.ts'
import { adimiKur } from '../oyun/koy.ts'
import BukalemunKoyu from './BukalemunKoyu.tsx'

const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])

const gorev = (sira: number): Gorev => {
  const bulunan = BUKALEMUN_KOYU_GOREVLERI.find((g) => g.sira === sira)
  if (!bulunan) throw new Error(`${sira}. görev yok`)
  return bulunan
}

/** Kıyıdaki bukalemun düğmelerinin adları (içlerindeki çizimin adı), sırayla. */
const kiyidakiler = (html: string) =>
  eslesmeler(html, /<button type="button" class="kiyi__bukalemun"[^>]*>.*?aria-label="([^"]*)"/g)

describe('BukalemunKoyu', () => {
  const html = renderToStaticMarkup(<BukalemunKoyu onAnaSayfa={() => {}} />)

  it('başlık, ana sayfa düğmesi ve görev sırası', () => {
    expect(html).toMatch(/^<main class="koy">/)
    expect(html).toMatch(/<h1 class="koy__baslik" tabindex="-1">Bukalemun Koyu<\/h1>/)
    expect(html).toContain('aria-label="Ana sayfa"')
    expect(html).toContain('<p class="koy__sira"><span class="gizli">Görev </span>1 / 10</p>')
  })

  it('ortada kök: kelime kartı, son ünlüsü etikette', () => {
    expect(html).toMatch(/<button type="button" class="kelime-karti" aria-label="at" aria-describedby="koy-yonerge">/)
    expect(html).toContain('<span class="kok-yazisi__okunan">at</span>')
    expect(html).toMatch(/<span class="unlu-etiketi unlu-etiketi--kalin unlu-etiketi--duz"[^>]*>a<\/span>/)
  })

  it('kıyıda bukalemunlar, kendi ünlülerinin kılığında, sabit tohumlu sırayla', () => {
    const sira = adimiKur(gorev(1), 0).secenekler.map((s) => s.yuzey)
    expect(kiyidakiler(html).map((ad) => ad?.split(' ')[0])).toEqual(sira)
    expect(kiyidakiler(html)).toEqual(
      expect.arrayContaining(['lar bukalemunu, a: kalın, düz, geniş', 'ler bukalemunu, e: ince, düz, geniş']),
    )
    expect(eslesmeler(html, /class="kiyi__bukalemun" (aria-pressed="[^"]*" aria-disabled="[^"]*")/g)).toEqual([
      'aria-pressed="false" aria-disabled="false"',
      'aria-pressed="false" aria-disabled="false"',
    ])
  })

  it('başta neden, Sıradaki ve cepte kart yok; cep ve yay ekran okuyucudan gizli', () => {
    expect(html).toContain('<div class="neden" role="status"></div>')
    expect(html).not.toContain('Sıradaki')
    expect(html).toMatch(/<div class="cep" aria-hidden="true"><svg class="cep__on"/)
    expect(html).not.toContain('cep__yuva')
    expect(html).toMatch(/<svg class="koy__yay" aria-hidden="true">/)
  })

  it('renksiz görev (9.) renksiz sınıfıyla açılır', () => {
    const renksiz = renderToStaticMarkup(<BukalemunKoyu gorevler={[gorev(9)]} />)
    expect(renksiz).toMatch(/^<main class="koy renksiz">/)
    expect(renksiz).toContain('aria-label="gül"')
    expect(kiyidakiler(renksiz)).toHaveLength(4)
  })

  it('zincirli görev (10.) ilk ekle başlar: top, lar ve ler', () => {
    const top = renderToStaticMarkup(<BukalemunKoyu gorevler={[gorev(10)]} />)
    expect(top).toContain('aria-label="top"')
    expect(kiyidakiler(top).map((ad) => ad?.split(' ')[0]).sort()).toEqual(['lar', 'ler'])
  })

  it('ana sayfa verilmezse düğmesi yok; görev yoksa kapanış kartı', () => {
    expect(renderToStaticMarkup(<BukalemunKoyu />)).not.toContain('Ana sayfa')
    const kapanis = renderToStaticMarkup(<BukalemunKoyu gorevler={[]} />)
    expect(kapanis).toContain('Koyda akşam oldu')
  })

  it('hiçbir yerde puan ya da süre yok', () => {
    expect(html).not.toMatch(/puan|süre|skor/i)
  })
})
