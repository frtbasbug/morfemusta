// Neden tablosu: tests/neden.csv. Her satır ayrı bir testtir. Tablo yalnız kullanıcının
// onayıyla değişir; testi geçirmek için tabloya dokunulmaz.
//
// neden sütunu boşsa aday doğrudur. Değilse ETİKET:özellik öğeleri ; ile ayrılır, iki özellik
// + ile birleşir (POSS.1SG:kalınlık+yuvarlaklık). Uyum farkı yoksa tek neden: diğer.

import { describe, expect, it } from 'vitest'
import nedenTablosu from '../../tests/neden.csv?raw'
import { csvOku } from './csv.ts'
import { ekle, neden, nedenCumlesi, olasiBicimler, yuzeySecenekleri, type Neden } from './index.ts'

const satirlar = csvOku(nedenTablosu, ['kok', 'ekler', 'parcalar', 'aday', 'neden']).map(
  ({ satirNo, alanlar }) => ({
    satirNo,
    kok: alanlar.kok ?? '',
    ekler: alanlar.ekler ?? '',
    parcalar: alanlar.parcalar ?? '',
    aday: alanlar.aday ?? '',
    neden: alanlar.neden ?? '',
  }),
)

/** Nedenleri tablodaki yazımla verir: PL:kalınlık;POSS.1SG:kalınlık+yuvarlaklık. */
const tablodaki = (nedenler: readonly Neden[]) =>
  nedenler
    .map((n) => (n.tur === 'diğer' ? 'diğer' : `${n.etiket}:${n.ozellikler.join('+')}`))
    .join(';')

const tekEk = (kok: string, etiket: string) => {
  const [parca] = ekle(kok, [etiket]).parcalar
  if (!parca) throw new Error(`${kok} + ${etiket}: parça yok`)
  return parca
}

describe('neden tablosu', () => {
  it('tabloda 37 satır var', () => {
    expect(satirlar).toHaveLength(37)
  })

  it.each(satirlar)(
    'satır $satirNo: $kok + $parcalar → $aday: "$neden"',
    ({ kok, ekler, parcalar, aday, neden: beklenen }) => {
      const etiketler = ekler.split('+')
      const secilenler = parcalar.split('+')
      expect(kok + secilenler.join('')).toBe(aday)
      const nedenler = neden(kok, etiketler, secilenler)
      expect(tablodaki(nedenler)).toBe(beklenen)
      // Neden yoksa aday motorun kabul ettiği biçimlerdendir; varsa değildir.
      expect(olasiBicimler(kok, etiketler).includes(aday)).toBe(nedenler.length === 0)
    },
  )
})

describe('neden: ayrıntılar', () => {
  it('bakılan ve seçilen ünlüyü, adaydaki yerleriyle verir', () => {
    expect(neden('ev', ['PL'], ['lar'])).toEqual([
      {
        tur: 'uyum',
        etiket: 'PL',
        ozellikler: ['kalınlık'],
        bakilan: 'e',
        bakilanKonumu: 0,
        bakilanKokte: true,
        beklenen: 'e',
        secilen: 'a',
        secilenKonumu: 3,
      },
    ])
  })

  it('yerel uyum: toplarim\'de i, lar\'ın a\'sına bakar; bakılan kökte değil', () => {
    expect(neden('top', ['PL', 'POSS.1SG'], ['lar', 'im'])).toEqual([
      {
        tur: 'uyum',
        etiket: 'POSS.1SG',
        ozellikler: ['kalınlık'],
        bakilan: 'a',
        bakilanKonumu: 4,
        bakilanKokte: false,
        beklenen: 'ı',
        secilen: 'i',
        secilenKonumu: 6,
      },
    ])
  })

  it('yerel uyum: toplerim\'de im önündeki e\'ye uyar, suçlanmaz', () => {
    const nedenler = neden('top', ['PL', 'POSS.1SG'], ['ler', 'im'])
    expect(nedenler).toHaveLength(1)
    expect(nedenler[0]).toMatchObject({ etiket: 'PL', bakilan: 'o', beklenen: 'a', secilen: 'e' })
  })

  it('yumuşama ve ünlü düşmesi uyum farkı değildir: diğer', () => {
    expect(olasiBicimler('kitap', ['POSS.1SG'])).toEqual(['kitabım'])
    expect(neden('kitap', ['POSS.1SG'], ['ım'])).toEqual([{ tur: 'diğer' }])
    expect(neden('ağız', ['POSS.1SG'], ['ım'])).toEqual([{ tur: 'diğer' }])
  })

  it('misafir kelimede doğru yüzey boş liste döner: saatler', () => {
    expect(neden('saat', ['PL'], ['ler'])).toEqual([])
  })

  it('kök ve yüzeyler NFC\'ye çevrilir', () => {
    expect(neden('göz'.normalize('NFD'), ['PL'], ['ler'])).toEqual([])
    expect(tablodaki(neden('gül', ['POSS.1SG'], ['üm'.normalize('NFD')]))).toBe('')
  })

  it('her ek için bir yüzey ister', () => {
    expect(() => neden('top', ['PL', 'POSS.1SG'], ['lar'])).toThrow('2 ek için 1 yüzey verildi')
  })

  it('ekin kılıklarından biri olmayan yüzeyi reddeder', () => {
    expect(() => neden('at', ['PL'], ['lr'])).toThrow('"lr", PL ekinin (-lAr) kılıklarından biri değil')
    expect(() => neden('at', ['PL'], ['lır'])).toThrow('kılıklarından biri değil: lar, ler')
    expect(() => neden('kız', ['POSS.1SG'], ['am'])).toThrow('ım, im, um, üm')
  })
})

describe('yuzeySecenekleri', () => {
  it('-lAr: lar, ler', () => {
    expect(yuzeySecenekleri(tekEk('at', 'PL'))).toEqual(['lar', 'ler'])
    expect(yuzeySecenekleri(tekEk('göz', 'PL'))).toEqual(['lar', 'ler'])
  })

  it('-(I)m ünsüzden sonra: ım, im, um, üm', () => {
    expect(yuzeySecenekleri(tekEk('kız', 'POSS.1SG'))).toEqual(['ım', 'im', 'um', 'üm'])
    expect(yuzeySecenekleri(tekEk('gül', 'POSS.1SG'))).toEqual(['ım', 'im', 'um', 'üm'])
  })

  it('ünlüsüz kalan ekin tek kılığı var: kedim', () => {
    expect(yuzeySecenekleri(tekEk('kedi', 'POSS.1SG'))).toEqual(['m'])
  })

  it('misafir kelimede de iki kılık: saat + PL', () => {
    expect(yuzeySecenekleri(tekEk('saat', 'PL'))).toEqual(['lar', 'ler'])
  })

  it('iki ünlülü ekte her yuva ayrı değişir: -(I)mIz, 16 kılık', () => {
    const secenekler = yuzeySecenekleri(tekEk('ev', 'POSS.1PL'))
    expect(secenekler).toHaveLength(16)
    expect(secenekler.slice(0, 4)).toEqual(['ımız', 'ımiz', 'ımuz', 'ımüz'])
    expect(secenekler).toContain('imiz')
  })

  it('doğru yüzey her zaman kılıkların içindedir', () => {
    for (const kok of ['at', 'ev', 'kuş', 'göz', 'kız', 'el', 'top', 'gül']) {
      for (const etiket of ['PL', 'POSS.1SG', 'ACC', 'LOC']) {
        const parca = tekEk(kok, etiket)
        expect(yuzeySecenekleri(parca), `${kok} + ${etiket}`).toContain(parca.yuzey)
      }
    }
  })
})

describe('nedenCumlesi', () => {
  const cumle = (kok: string, ekler: string, parcalar: string) =>
    nedenCumlesi(neden(kok, ekler.split('+'), parcalar.split('+')))

  it('kalınlık: e ince, a kalın', () => {
    expect(cumle('ev', 'PL', 'lar')).toBe('e ince, a kalın. Kalınlıkları uyuşmuyor.')
    expect(cumle('at', 'PL', 'ler')).toBe('a kalın, e ince. Kalınlıkları uyuşmuyor.')
  })

  it('yuvarlaklık: o yuvarlak, ı düz', () => {
    expect(cumle('top', 'POSS.1SG', 'ım')).toBe('o yuvarlak, ı düz. Yuvarlaklıkları uyuşmuyor.')
    expect(cumle('kız', 'POSS.1SG', 'um')).toBe('ı düz, u yuvarlak. Yuvarlaklıkları uyuşmuyor.')
  })

  it('ikisi: ö ince ve yuvarlak, ı kalın ve düz', () => {
    expect(cumle('göz', 'POSS.1SG', 'ım')).toBe(
      'ö ince ve yuvarlak, ı kalın ve düz. İkisi de uyuşmuyor.',
    )
  })

  it('bakılan ünlü önceki ekteyse: Bukalemun en yakın ünlüye bakar.', () => {
    expect(cumle('top', 'PL+POSS.1SG', 'lar+im')).toBe(
      'a kalın, i ince. Kalınlıkları uyuşmuyor. Bukalemun en yakın ünlüye bakar.',
    )
    expect(cumle('top', 'PL+POSS.1SG', 'lar+üm')).toBe(
      'a kalın ve düz, ü ince ve yuvarlak. İkisi de uyuşmuyor. ' +
        'Bukalemun en yakın ünlüye bakar.',
    )
  })

  it('yalnız ilk neden: toplerum\'da çoğulun kalınlığı', () => {
    expect(cumle('top', 'PL+POSS.1SG', 'ler+um')).toBe('o kalın, e ince. Kalınlıkları uyuşmuyor.')
  })

  it('neden yoksa ya da diğer ise cümle boş', () => {
    expect(nedenCumlesi([])).toBe('')
    expect(cumle('at', 'PL', 'lar')).toBe('')
    expect(cumle('saat', 'PL', 'lar')).toBe('')
  })

  it('tablodaki her uyum nedeni için bir cümle var', () => {
    for (const satir of satirlar.filter((s) => s.neden !== '' && s.neden !== 'diğer')) {
      expect(cumle(satir.kok, satir.ekler, satir.parcalar), satir.aday).toMatch(/uyuşmuyor\.( |$)/)
    }
  })
})
