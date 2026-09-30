import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { bolgeBul, type Bolge } from '../oyun/bolgeler.ts'
import type { Gorev } from '../oyun/gorevler.ts'
import { BOS_ILERLEME, bugununKartlari, gorevBitti } from '../oyun/ilerleme.ts'
import { adimiKur } from '../oyun/koy.ts'
import BukalemunKoyu from './BukalemunKoyu.tsx'

const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])

const KOY = bolgeBul('koy') as Bolge

const gorev = (sira: number): Gorev => {
  const bulunan = KOY.gorevler.find((g) => g.sira === sira)
  if (!bulunan) throw new Error(`${sira}. görev yok`)
  return bulunan
}

/** Koyun yalnız verilen görevlerle bir kopyası. */
const koy = (...siralar: number[]): Bolge => ({ ...KOY, gorevler: siralar.map(gorev) })

/** Kıyıdaki bukalemun düğmelerinin adları (içlerindeki çizimin adı), sırayla. */
const kiyidakiler = (html: string) =>
  eslesmeler(html, /<button type="button" class="kiyi__bukalemun"[^>]*>.*?aria-label="([^"]*)"/g)

describe('BukalemunKoyu', () => {
  const html = renderToStaticMarkup(<BukalemunKoyu bolge={KOY} onHarita={() => {}} />)

  it('başlık bölge tablosundan; Harita düğmesi ve görev sırası', () => {
    expect(html).toMatch(/^<main class="koy">/)
    expect(html).toMatch(/<h1 class="bolge-ustu__baslik" tabindex="-1">Bukalemun Koyu<\/h1>/)
    expect(html).toMatch(/<button type="button" class="bolge-ustu__harita" aria-label="Harita">/)
    expect(html).not.toContain('Ana sayfa')
    expect(html).toContain('<p class="bolge-ustu__sira"><span class="gizli">Görev </span>1 / 10</p>')
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

  it('kalınan görevden sürdürür: 4. görev, göz', () => {
    const dorduncu = renderToStaticMarkup(<BukalemunKoyu bolge={KOY} baslangic={3} />)
    expect(dorduncu).toContain('<span class="gizli">Görev </span>4 / 10</p>')
    expect(dorduncu).toContain('aria-label="göz"')
  })

  it('renksiz görev (9.) renksiz sınıfıyla açılır', () => {
    const renksiz = renderToStaticMarkup(<BukalemunKoyu bolge={koy(9)} />)
    expect(renksiz).toMatch(/^<main class="koy renksiz">/)
    expect(renksiz).toContain('aria-label="gül"')
    expect(kiyidakiler(renksiz)).toHaveLength(4)
  })

  it('zincirli görev (10.) ilk ekle başlar: top, lar ve ler', () => {
    const top = renderToStaticMarkup(<BukalemunKoyu bolge={koy(10)} />)
    expect(top).toContain('aria-label="top"')
    expect(kiyidakiler(top).map((ad) => ad?.split(' ')[0]).sort()).toEqual(['lar', 'ler'])
  })

  it('Harita verilmezse düğmesi yok', () => {
    expect(renderToStaticMarkup(<BukalemunKoyu bolge={KOY} />)).not.toContain('bolge-ustu__harita')
  })

  it('görev yoksa akşam ekranı: başlık bölge tablosunun aksam sütunundan, bugünün kelimeleri', () => {
    const bugun = new Date(2026, 8, 28, 10)
    const ilerleme = [gorev(1), gorev(10)].reduce((i, g) => gorevBitti(i, KOY, g, bugun), BOS_ILERLEME)
    const aksam = renderToStaticMarkup(
      <BukalemunKoyu
        bolge={{ ...KOY, gorevler: [] }}
        bugunkuKartlar={bugununKartlari(ilerleme, 'koy', bugun)}
        onHarita={() => {}}
      />,
    )
    expect(aksam).toMatch(/<h1 id="aksam-baslik" class="aksam__baslik" tabindex="-1">Koyda akşam oldu<\/h1>/)
    expect(eslesmeler(aksam, /<span class="sonuc-kelime__okunan">([^<]*)<\/span>/g)).toEqual([
      'atlar',
      'toplarım',
    ])
    expect(aksam).toContain('Haritaya dön')
  })

  it('hiçbir yerde puan ya da süre yok', () => {
    expect(html).not.toMatch(/puan|süre|skor/i)
  })
})
