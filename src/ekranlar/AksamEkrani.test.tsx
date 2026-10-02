import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { bolgeBul, type Bolge } from '../oyun/bolgeler.ts'
import { BOS_ILERLEME, bugununKartlari, gorevBitti } from '../oyun/ilerleme.ts'
import UnluEtiketi from '../gorsel/UnluEtiketi.tsx'
import type { Unlu } from '../motor/index.ts'
import AksamEkrani from './AksamEkrani.tsx'

const etiketi = (unlu: Unlu) => renderToStaticMarkup(<UnluEtiketi unlu={unlu} />)

const KOY = bolgeBul('koy') as Bolge
const BUGUN = new Date(2026, 8, 28, 10)
const KARTLAR = bugununKartlari(
  KOY.gorevler.slice(0, 3).reduce((i, g) => gorevBitti(i, KOY, g, BUGUN), BOS_ILERLEME),
  'koy',
  BUGUN,
)

describe('AksamEkrani', () => {
  const html = renderToStaticMarkup(
    <AksamEkrani baslik="Koyda akşam oldu" kartlar={KARTLAR} onHarita={() => {}} />,
  )

  it('başlık verilen akşam; altında bugün kurulan kelimeler, ekleri renkli', () => {
    expect(html).toMatch(/<h1 id="aksam-baslik" class="aksam__baslik" tabindex="-1">Koyda akşam oldu<\/h1>/)
    expect(html).toContain('<p class="aksam__metin">Bugün kurduğun kelimeler:</p>')
    expect([...html.matchAll(/<span class="sonuc-kelime__okunan">([^<]*)<\/span>/g)].map((m) => m[1])).toEqual([
      'atlar',
      'evler',
      'kuşlar',
    ])
    // Kökün ve ekin ünlüsü etikette: evler'de ikisi de ince (dar), atlar'da ikisi de kalın.
    expect(html).toContain(
      `<span aria-hidden="true">${etiketi('e')}v<span class="ek-yazisi ek-yazisi--ince ek-yazisi--duz">l${etiketi('e')}r</span></span>`,
    )
  })

  it('tek düğme: Haritaya dön', () => {
    // Yazının yanında harita simgesi: sesli modda düğme simgesinden tanınır.
    expect(
      [...html.matchAll(/<button[^>]*>(<svg class="simge"[^]*?<\/svg>)?([^<]*)<\/button>/g)].map(
        (m) => [m[1] !== undefined, m[2]],
      ),
    ).toEqual([[true, 'Haritaya dön']])
  })

  it('puan verilmezse yok; süre hiç yok', () => {
    expect(html).not.toMatch(/puan|seri|süre|skor|dakika|saniye/i)
  })

  it('turun puanı ve 1–3 yıldız: dolu yıldızlar boyalı, adı yazıyla', () => {
    const puanli = (yildiz: 1 | 2 | 3) =>
      renderToStaticMarkup(
        <AksamEkrani baslik="Koyda akşam oldu" kartlar={KARTLAR} puan={105} yildiz={yildiz} />,
      )
    const uc = puanli(3)
    expect(uc).toContain('<span>Puan: 105</span>')
    expect(uc).toContain('role="img" aria-label="3 yıldızdan 3"')
    for (const yildiz of [1, 2, 3] as const) {
      const dolular = puanli(yildiz).match(/simge--yildiz simge--dolu/g) ?? []
      const hepsi = puanli(yildiz).match(/simge--yildiz/g) ?? []
      expect([dolular.length, hepsi.length]).toEqual([yildiz, 3])
    }
    // Süre ve sıralama yine yok.
    expect(uc).not.toMatch(/süre|skor|dakika|saniye|sıra/i)
  })

  it('bugün kelime yoksa liste de yok', () => {
    const bos = renderToStaticMarkup(<AksamEkrani baslik="Koyda akşam oldu" kartlar={[]} />)
    expect(bos).not.toContain('Bugün kurduğun kelimeler:')
    expect(bos).not.toContain('<button')
  })
})
