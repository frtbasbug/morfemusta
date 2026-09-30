import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { bolgeBul, type Bolge } from '../oyun/bolgeler.ts'
import FistikciSahap from './FistikciSahap.tsx'

const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])
/** renderToStaticMarkup kesme işaretini kaçışlar: Şahap&#x27;ın. */
const metin = (html: string) => html.replaceAll('&#x27;', "'")

const DUKKAN = bolgeBul('dukkan') as Bolge

describe('FistikciSahap', () => {
  const html = metin(renderToStaticMarkup(<FistikciSahap bolge={DUKKAN} onHarita={() => {}} />))

  it('başlık bölge tablosundan; Harita düğmesi ve görev sırası', () => {
    expect(html).toMatch(/^<main class="dukkan">/)
    expect(html).toContain('<h1 class="bolge-ustu__baslik" tabindex="-1">Fıstıkçı Şahap\'ın Dükkânı</h1>')
    expect(html).toContain('<p class="bolge-ustu__sira"><span class="gizli">Görev </span>1 / 10</p>')
  })

  it('kelime ortada, sınır boş bir yuva: kita_ım; ek birleşen ek görünümünde', () => {
    expect(html).toContain('aria-label="kita … ım"')
    expect(html).toContain('<span class="yuva" aria-hidden="true"></span>')
    expect(html).toMatch(/<span class="yuva"[^>]*><\/span><span class="ek-yazisi ek-yazisi--kalin ek-yazisi--duz">/)
  })

  it('tezgâhta taş solda, jöle sağda; adları harf ve türü, altlarında sert / yumuşak', () => {
    expect(eslesmeler(html, /class="tezgah__karo"[^>]*aria-label="([^"]*)"/g)).toEqual([
      'p, sert',
      'b, yumuşak',
    ])
    expect(eslesmeler(html, /<svg class="karo ([^"]*)"/g)).toEqual(['karo--tas', 'karo--jole'])
    expect(eslesmeler(html, /class="tezgah__tur" aria-hidden="true">([^<]*)</g)).toEqual([
      'sert',
      'yumuşak',
    ])
  })

  it('ek başında yuva ekin kutusunun içinde: kitap + _a', () => {
    const ek = metin(renderToStaticMarkup(<FistikciSahap bolge={DUKKAN} baslangic={5} />))
    expect(ek).toContain('aria-label="kitap … a"')
    expect(ek).toMatch(/<span class="ek-yazisi [^"]*"><span class="yuva" aria-hidden="true"><\/span>/)
    expect(eslesmeler(ek, /class="tezgah__karo"[^>]*aria-label="([^"]*)"/g)).toEqual([
      't, sert',
      'd, yumuşak',
    ])
  })

  it('raf boş başlar; kalınan görevden sürdürülünce önceki kelimeler rafta', () => {
    expect(html).toContain('<ul class="raf__kelimeler"></ul>')
    const sonra = renderToStaticMarkup(<FistikciSahap bolge={DUKKAN} baslangic={3} />)
    expect(eslesmeler(sonra, /<li class="raf__kelime">([^<]*)</g)).toEqual([
      'kitabım',
      'köpeğim',
      'ağacı',
    ])
  })

  it('hiçbir yerde puan, seri ya da süre yok', () => {
    expect(html).not.toMatch(/puan|seri|süre|skor/i)
  })
})
