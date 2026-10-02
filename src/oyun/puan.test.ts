import { describe, expect, it } from 'vitest'
import {
  BOS_TUR_PUANI,
  dogruYerlesti,
  turPuaniniCoz,
  yanlisYerlesti,
  yildiziCoz,
  yildizSayisi,
  type TurPuani,
} from './puan.ts'

// Puan kuralları (DESIGN.md, "Akış ve puan"): yalnız artar; ilk denemede +10, sonra +5, yanlış 0;
// üst üste üç ilk denemede doğru +5 ve şenlik; yanlış seriyi sıfırlar.

/** Bir dizi yerleştirme: i ilk denemede doğru, s sonraki denemede doğru, y yanlış. */
function oyna(dizi: string, tur: TurPuani = BOS_TUR_PUANI) {
  const senlikler: number[] = []
  dizi.split('').forEach((adim, sira) => {
    if (adim === 'y') {
      tur = yanlisYerlesti(tur)
      return
    }
    const sonuc = dogruYerlesti(tur, adim === 'i')
    if (sonuc.senlik) senlikler.push(sira)
    tur = sonuc.tur
  })
  return { tur, senlikler }
}

describe('puan', () => {
  it('ilk denemede doğru +10', () => {
    expect(dogruYerlesti(BOS_TUR_PUANI, true)).toEqual({
      tur: { puan: 10, ilk: 1, yer: 1, seri: 1 },
      kazanc: 10,
      senlik: false,
    })
  })

  it('sonraki denemede doğru +5; ilk deneme sayılmaz', () => {
    expect(dogruYerlesti(BOS_TUR_PUANI, false)).toEqual({
      tur: { puan: 5, ilk: 0, yer: 1, seri: 0 },
      kazanc: 5,
      senlik: false,
    })
  })

  it('yanlış 0: puan düşmez, yalnız seri sıfırlanır', () => {
    const tur = { puan: 20, ilk: 2, yer: 2, seri: 2 }
    expect(yanlisYerlesti(tur)).toEqual({ puan: 20, ilk: 2, yer: 2, seri: 0 })
    // Seri zaten 0'sa kayıt aynı kalır.
    const sifir = { puan: 5, ilk: 0, yer: 1, seri: 0 }
    expect(yanlisYerlesti(sifir)).toBe(sifir)
    // Yanlışlar art arda gelse de puan hiç düşmez.
    expect(oyna('iyyyyy').tur.puan).toBe(10)
  })

  it('üst üste üç ilk denemede doğru: +5 ve şenlik; seri yeniden sayılır', () => {
    const { tur, senlikler } = oyna('iiiiii')
    // 6 × 10 + 2 × 5.
    expect(tur).toEqual({ puan: 70, ilk: 6, yer: 6, seri: 0 })
    expect(senlikler).toEqual([2, 5])
    expect(dogruYerlesti({ puan: 20, ilk: 2, yer: 2, seri: 2 }, true)).toMatchObject({
      kazanc: 15,
      senlik: true,
    })
  })

  it('yanlış seriyi sıfırlar: yanlıştan sonra ilk denemede üç doğru yeniden gerekir', () => {
    // i i y s i i i: yanlıştan sonraki doğru +5 ve seri 0; sonra üç ilk deneme şenlik.
    const { tur, senlikler } = oyna('iiysiii')
    expect(senlikler).toEqual([6])
    expect(tur).toEqual({ puan: 10 + 10 + 5 + 10 + 10 + 15, ilk: 5, yer: 6, seri: 0 })
  })

  it('zincirde ve ağaçta her adım ayrı yerleştirmedir (her biri kendi puanını alır)', () => {
    // Bahçe'nin gözlükçüler ağacı: üç ek, üçü de ilk denemede: 30 ve şenlik.
    expect(oyna('iii')).toEqual({ tur: { puan: 35, ilk: 3, yer: 3, seri: 0 }, senlikler: [2] })
    // Zincirin ikinci adımında bir yanlış: ilk adım +10, ikinci +5.
    expect(oyna('iys').tur).toEqual({ puan: 15, ilk: 1, yer: 2, seri: 0 })
  })

  it("Uydurukçuklar'ın sınır adımı: iki karo da doğru, hep ilk deneme (+10, seriye girer)", () => {
    // Bukalemun ve karo, ikisi de ilk denemede (ekran sınır adımını hep ilk deneme bildirir).
    const bukalemun = dogruYerlesti(BOS_TUR_PUANI, true)
    const karo = dogruYerlesti(bukalemun.tur, true)
    expect(karo.tur).toEqual({ puan: 20, ilk: 2, yer: 2, seri: 2 })
    // Bukalemun yanlıştan sonra doğruysa karo yine ilk denemedir.
    const sonra = dogruYerlesti(yanlisYerlesti(BOS_TUR_PUANI), false)
    expect(dogruYerlesti(sonra.tur, true).tur).toEqual({ puan: 15, ilk: 1, yer: 2, seri: 1 })
  })
})

describe('yıldız', () => {
  it('ilk denemede doğru oranı en az %90 ise 3, en az %60 ise 2, değilse 1', () => {
    expect(yildizSayisi({ ilk: 10, yer: 10 })).toBe(3)
    expect(yildizSayisi({ ilk: 9, yer: 10 })).toBe(3)
    expect(yildizSayisi({ ilk: 89, yer: 100 })).toBe(2)
    expect(yildizSayisi({ ilk: 6, yer: 10 })).toBe(2)
    expect(yildizSayisi({ ilk: 59, yer: 100 })).toBe(1)
    expect(yildizSayisi({ ilk: 0, yer: 10 })).toBe(1)
  })

  it('sınırlar tam sayıyla: 9 / 10 ve 27 / 30 üç, 6 / 10 ve 3 / 5 iki', () => {
    expect(yildizSayisi({ ilk: 27, yer: 30 })).toBe(3)
    expect(yildizSayisi({ ilk: 3, yer: 5 })).toBe(2)
    expect(yildizSayisi({ ilk: 10, yer: 11 })).toBe(3)
    expect(yildizSayisi({ ilk: 7, yer: 11 })).toBe(2)
  })

  it('yerleştirme yoksa bir yıldız (en az bir)', () => {
    expect(yildizSayisi({ ilk: 0, yer: 0 })).toBe(1)
  })
})

describe('kayıttan okuma', () => {
  it('geçerli tur puanı alınır; bozuksa null', () => {
    expect(turPuaniniCoz({ puan: 40, ilk: 4, yer: 5, seri: 1 })).toEqual({
      puan: 40,
      ilk: 4,
      yer: 5,
      seri: 1,
    })
    for (const bozuk of [
      null,
      [],
      'puan',
      { puan: -5, ilk: 0, yer: 0, seri: 0 },
      { puan: 1.5, ilk: 0, yer: 0, seri: 0 },
      { puan: 10, ilk: 2, yer: 1, seri: 0 },
      { puan: 10, ilk: 1, yer: 1 },
    ]) {
      expect(turPuaniniCoz(bozuk)).toBeNull()
    }
    // Seri en çok iki kalır (üçüncüsü şenliktir).
    expect(turPuaniniCoz({ puan: 30, ilk: 3, yer: 3, seri: 7 })?.seri).toBe(2)
  })

  it('yıldız 1, 2 ya da 3; değilse null', () => {
    expect([1, 2, 3].map(yildiziCoz)).toEqual([1, 2, 3])
    for (const bozuk of [0, 4, 2.5, '3', null]) expect(yildiziCoz(bozuk)).toBeNull()
  })
})
