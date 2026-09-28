import { describe, expect, it } from 'vitest'
import { KOK_SOZLUGU, ekle, type EkParcasi } from '../motor/index.ts'
import { bukalemunKiligi } from './kilik.ts'

/** Tek ekli biçimin ek parçası. */
const parca = (kok: string, etiket: string): EkParcasi => {
  const [ilk] = ekle(kok, [etiket]).parcalar
  if (!ilk) throw new Error(`${kok} + ${etiket}: parça yok`)
  return ilk
}

describe('bukalemunun kılığı: ekin yüzeydeki ilk ünlüsü', () => {
  it.each([
    ['kuş', 'PL', 'lar', 'a'],
    ['göz', 'PL', 'ler', 'e'],
    ['kız', 'POSS.1SG', 'ım', 'ı'],
    ['ev', 'POSS.1SG', 'im', 'i'],
    ['yol', 'POSS.1SG', 'um', 'u'],
    ['göz', 'POSS.1SG', 'üm', 'ü'],
  ])('%s + %s → %s: %s', (kok, etiket, yazi, unlu) => {
    expect(bukalemunKiligi(parca(kok, etiket))).toMatchObject({ unlu, yazi, saklanan: false })
  })

  it('özellikler ünlününkidir', () => {
    expect(bukalemunKiligi(parca('kuş', 'PL')).ozellikler).toEqual({
      kalin: true,
      yuvarlak: false,
      genis: true,
    })
    expect(bukalemunKiligi(parca('göz', 'POSS.1SG')).ozellikler).toEqual({
      kalin: false,
      yuvarlak: true,
      genis: false,
    })
  })

  it('ekin başında ünsüz de olsa ilk ünlüye bakar: kedi-yi, ev-i-nde', () => {
    expect(bukalemunKiligi(parca('kedi', 'ACC'))).toMatchObject({ unlu: 'i', yazi: 'yi' })
    const [, bulunma] = ekle('ev', ['POSS.3SG', 'LOC']).parcalar
    expect(bukalemunKiligi(bulunma!)).toMatchObject({ unlu: 'e', yazi: 'nde' })
  })

  it('saklanan (I) varken yüzeyde ünlü kalırsa o gösterilir: kedi + POSS.1PL → miz', () => {
    expect(bukalemunKiligi(parca('kedi', 'POSS.1PL'))).toMatchObject({
      unlu: 'i',
      yazi: 'miz',
      saklanan: false,
    })
  })

  it('elle kurulmuş parçada da yüzeye bakar (uymayan evlar)', () => {
    const evlar: EkParcasi = {
      etiket: 'PL',
      sablon: '-lAr',
      tur: 'çekim',
      govde: 'ev',
      yuzey: 'lar',
      olaylar: [],
    }
    expect(bukalemunKiligi(evlar)).toMatchObject({ unlu: 'a', yazi: 'lar', saklanan: false })
  })
})

describe('saklanan ünlü: ek yüzeyde ünlüsüz kalınca', () => {
  it.each([
    ['kedi', 'POSS.1SG', 'm', 'i'],
    ['anne', 'POSS.1SG', 'm', 'i'],
    ['araba', 'POSS.1SG', 'm', 'ı'],
    ['kuzu', 'POSS.1SG', 'm', 'u'],
    ['köprü', 'POSS.1SG', 'm', 'ü'],
    ['kedi', 'POSS.2SG', 'n', 'i'],
  ])('%s + %s → %s: uyum %s seçerdi', (kok, etiket, yazi, unlu) => {
    expect(bukalemunKiligi(parca(kok, etiket))).toMatchObject({ unlu, yazi, saklanan: true })
  })

  it('biçimi uyumun seçeceği ünlününkidir: kedim → i (ince, düz, dar)', () => {
    expect(bukalemunKiligi(parca('kedi', 'POSS.1SG')).ozellikler).toEqual({
      kalin: false,
      yuvarlak: false,
      genis: false,
    })
  })

  it('yüzeyde de saklananda da ünlü yoksa hata verir', () => {
    const bozuk: EkParcasi = { ...parca('kedi', 'POSS.1SG'), olaylar: [] }
    expect(() => bukalemunKiligi(bozuk)).toThrow(/ünlü yok/)
  })

  // Saklanan ünlüde ince ek hesaba katılmaz (kilik.ts). Bu, ince-ek köklerinin ilk ekinde
  // (I)'nın hiç saklanmamasına dayanır; sözlüğe ünlüyle biten bir ince-ek kökü gelirse bu
  // test kırılır ve kılık yeniden düşünülür.
  it('sözlükteki hiçbir ince-ek kökünde ilk ekin (I)\'sı saklanmaz', () => {
    const inceEkKokleri = [...KOK_SOZLUGU.values()].filter((g) => g.istisna === 'ince-ek')
    expect(inceEkKokleri.length).toBeGreaterThan(0)
    for (const { kok } of inceEkKokleri) {
      expect(bukalemunKiligi(parca(kok, 'POSS.1SG')).saklanan, kok).toBe(false)
    }
  })
})
