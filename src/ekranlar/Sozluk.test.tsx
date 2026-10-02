import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { bolgeBul, type Bolge } from '../oyun/bolgeler.ts'
import type { Gorev } from '../oyun/gorevler.ts'
import { BOS_ILERLEME, gorevBitti, sozlukGruplari, type Ilerleme } from '../oyun/ilerleme.ts'
import KokYazisi from '../gorsel/KokYazisi.tsx'
import UnluEtiketi from '../gorsel/UnluEtiketi.tsx'
import type { Unlu } from '../motor/index.ts'
import Sozluk from './Sozluk.tsx'

const etiketi = (unlu: Unlu) => renderToStaticMarkup(<UnluEtiketi unlu={unlu} />)

const KOY = bolgeBul('koy') as Bolge
const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])

const gorev = (sira: number) => KOY.gorevler[sira - 1] as Gorev
const sozluk = (ilerleme: Ilerleme, bolgeler?: readonly Bolge[]) =>
  renderToStaticMarkup(<Sozluk gruplar={sozlukGruplari(ilerleme, bolgeler)} />)

// atlar dün, toplarım ile kızım bugün kuruldu.
const DUN = new Date(2026, 8, 27, 16)
const BUGUN = new Date(2026, 8, 28, 10)
const ILERLEME = [
  [gorev(1), DUN],
  [gorev(10), BUGUN],
  [gorev(5), new Date(BUGUN.getTime() + 60_000)],
].reduce((i, [g, an]) => gorevBitti(i, KOY, g as Gorev, an as Date), BOS_ILERLEME)

describe('Sozluk', () => {
  it('başlık; boşsa kartın nasıl geleceği yazılır', () => {
    const bos = sozluk(BOS_ILERLEME)
    expect(bos).toMatch(/<h1 id="sozluk-baslik" class="ekran-basligi" tabindex="-1">Sözlük<\/h1>/)
    expect(bos).toContain(
      '<p class="sozluk__bos">Sözlüğün henüz boş. Bir kelime kurunca kartı buraya gelir.</p>',
    )
    expect(bos).not.toContain('<article')
  })

  it('kartlar bölgelere göre gruplu; grupta en yeni kart önde', () => {
    const html = sozluk(ILERLEME)
    expect(html).not.toContain('sozluk__bos')
    expect(eslesmeler(html, /<h2 id="sozluk-[a-z]+" class="sozluk__bolge">([^<]*)<\/h2>/g)).toEqual([
      'Bukalemun Koyu',
    ])
    expect(eslesmeler(html, /<h3 class="sozluk-karti__kelime">(?:<img[^>]*>)?([^<]*)<\/h3>/g)).toEqual([
      'kızım',
      'toplarım',
      'atlar',
    ])
  })

  it('bölge tablosunun sırasıyla: sonra kazanılan bölge de sırasında', () => {
    const ada: Bolge = { ...KOY, sira: 1, kimlik: 'ada', ad: 'Ada' }
    const tepe: Bolge = { ...KOY, sira: 2, kimlik: 'tepe', ad: 'Tepe' }
    const ilerleme = gorevBitti(gorevBitti(BOS_ILERLEME, tepe, gorev(1), DUN), ada, gorev(2), BUGUN)
    expect(eslesmeler(sozluk(ilerleme, [ada, tepe]), /class="sozluk__bolge">([^<]*)</g)).toEqual([
      'Ada',
      'Tepe',
    ])
  })

  it('kartta kelime, kök ve ekler (birleşen ek görünümüyle), bölge ve tarih', () => {
    const html = sozluk(ILERLEME)
    const toplarim = /<article class="sozluk-karti"><h3 class="sozluk-karti__kelime">(<img[^>]*>)toplarım<\/h3>(.*?)<\/article>/.exec(html)
    // Kökün resmi (top: ⚽) kelimenin yanında; süstür, alt yazısı boş.
    expect(toplarim?.[1]).toMatch(/^<img class="kok-resmi sozluk-karti__resim" src="[^"]*emoji\/26bd\.svg" alt="" data-emoji="⚽"/)
    // Kökün son ünlüsü ve eklerin ünlüleri etikette: uyum etiketlerin eninden okunur.
    expect(toplarim?.[2]).toBe(
      '<p class="sozluk-karti__parcalar"><span class="sozluk-karti__kok">' +
        renderToStaticMarkup(<KokYazisi kok="top" />) +
        '</span>' +
        '<span class="sozluk-karti__arti" aria-hidden="true">+</span>' +
        `<span class="ek-yazisi ek-yazisi--kalin ek-yazisi--duz">l${etiketi('a')}r</span>` +
        '<span class="sozluk-karti__arti" aria-hidden="true">+</span>' +
        `<span class="ek-yazisi ek-yazisi--kalin ek-yazisi--duz">${etiketi('ı')}m</span></p>` +
        '<p class="sozluk-karti__kunye"><span>Bukalemun Koyu</span><span aria-hidden="true"> · </span>' +
        '<time dateTime="2026-09-28">28 Eylül 2026</time></p>',
    )
    expect(html).toContain('<time dateTime="2026-09-27">27 Eylül 2026</time>')
  })

  it('uydurma kelimenin kartı çocuğun seçtiği biçimi gösterir; köşesinde küçük bir yaratık', () => {
    const UYDURUK = bolgeBul('uyduruk') as Bolge
    const givak = UYDURUK.gorevler[3] as Gorev
    const ilerleme = gorevBitti(BOS_ILERLEME, UYDURUK, givak, BUGUN, undefined, 'gıvağım')
    const html = sozluk(ilerleme)
    const kart = /<article class="sozluk-karti sozluk-karti--uydurma">(.*?)<\/article>/.exec(html)?.[1] ?? ''
    expect(kart).toMatch(/^<span class="sozluk-karti__yaratik"><svg class="yaratik [^"]*"[^>]*aria-hidden="true">/)
    expect(kart).toContain('<span class="gizli">Uydurma kelime</span>')
    // Uydurma kökte resim yok; yaratık var.
    expect(kart).toContain('<h3 class="sozluk-karti__kelime">gıvağım</h3>')
    expect(kart).not.toContain('kok-resmi')
    // Kök ve ek: gıvak + ım.
    expect(eslesmeler(kart, /class="kok-yazisi__okunan">([^<]*)</g)).toEqual(['gıvak'])
    // Sözlükteki kökün kartında işaret yok.
    expect(sozluk(ILERLEME)).not.toContain('sozluk-karti__yaratik')
  })
})
