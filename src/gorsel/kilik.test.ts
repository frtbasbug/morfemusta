import { describe, expect, it } from 'vitest'
import { ekle, type EkParcasi } from '../motor/index.ts'
import { UNLULER } from './cizim.ts'
import { bukalemunKiligi, ozellikAdlari } from './kilik.ts'

const parca = (kok: string, etiketler: string[], sira = 0): EkParcasi => {
  const sonuc = ekle(kok, etiketler).parcalar[sira]
  if (!sonuc) throw new Error(`${kok} + ${etiketler.join('+')}: ${sira}. parça yok`)
  return sonuc
}

describe('ozellikAdlari', () => {
  it.each([
    ['a', 'kalın, düz, geniş'],
    ['ı', 'kalın, düz, dar'],
    ['o', 'kalın, yuvarlak, geniş'],
    ['u', 'kalın, yuvarlak, dar'],
    ['e', 'ince, düz, geniş'],
    ['i', 'ince, düz, dar'],
    ['ö', 'ince, yuvarlak, geniş'],
    ['ü', 'ince, yuvarlak, dar'],
  ] as const)('%s: %s', (unlu, adlar) => {
    expect(ozellikAdlari(UNLULER[unlu])).toBe(adlar)
  })
})

describe('bukalemunKiligi', () => {
  it.each([
    ['kuş', 'PL', 'lar', 'a'],
    ['göz', 'PL', 'ler', 'e'],
    ['kız', 'POSS.1SG', 'ım', 'ı'],
    ['ev', 'POSS.1SG', 'im', 'i'],
    ['yol', 'POSS.1SG', 'um', 'u'],
    ['göz', 'POSS.1SG', 'üm', 'ü'],
    ['kedi', 'DAT', 'ye', 'e'],
    ['saat', 'PL', 'ler', 'e'],
  ])('%s + %s: bukalemun ekin ilk yüzey ünlüsünün kılığında (%s → %s)', (kok, etiket, yazi, unlu) => {
    expect(bukalemunKiligi(parca(kok, [etiket]))).toEqual({ yazi, unlu, saklanan: false })
  })

  it('zincirde her bukalemun kendi ekinin ünlüsünü alır: top + PL + POSS.1SG', () => {
    expect(bukalemunKiligi(parca('top', ['PL', 'POSS.1SG'], 0))).toMatchObject({ unlu: 'a' })
    expect(bukalemunKiligi(parca('top', ['PL', 'POSS.1SG'], 1))).toMatchObject({ unlu: 'ı' })
  })

  it.each([
    ['kedi', 'i'],
    ['araba', 'ı'],
    ['köprü', 'ü'],
    ['ütü', 'ü'],
  ])(
    '%s + POSS.1SG: ek ünlüsüz kalır; bukalemun saklanır, biçimi uyumun seçeceği %s',
    (kok, unlu) => {
      expect(bukalemunKiligi(parca(kok, ['POSS.1SG']))).toEqual({ yazi: 'm', unlu, saklanan: true })
    },
  )

  it('saklanan (I)\'dan sonra ünlü varsa bukalemun o ünlünün kılığındadır: kedimiz', () => {
    expect(bukalemunKiligi(parca('kedi', ['POSS.1PL']))).toEqual({
      yazi: 'miz',
      unlu: 'i',
      saklanan: false,
    })
  })

  it('ne yüzey ünlüsü ne saklanan ünlü olan eki reddeder', () => {
    const ciplak: EkParcasi = {
      etiket: 'X',
      sablon: '-m',
      tur: 'çekim',
      govde: 'ev',
      yuzey: 'm',
      olaylar: [],
    }
    expect(() => bukalemunKiligi(ciplak)).toThrow(/ne yüzey ünlüsü ne saklanan ünlü/)
  })
})
