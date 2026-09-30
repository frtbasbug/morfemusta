// Kaynaştırma neden tablosu: tests/neden-kaynastirma.csv. Her satır ayrı bir testtir. Tablo
// yalnız kullanıcının onayıyla değişir; testi geçirmek için tabloya dokunulmaz.
//
// Aday, kök ile seçilen yüzeyin art arda yazılmasıdır (zelü + e). neden sütunu boşsa aday
// doğrudur. Değilse öğeler ; ile ayrılır: ETİKET:kaynaştırma, ETİKET:kalınlık ...
// (neden-yazimi.ts). Kaynaştırma ek başı nedenleriyle aynı adımdadır, ünlü uyumundan önce.

import { describe, expect, it } from 'vitest'
import kaynastirmaTablosu from '../../tests/neden-kaynastirma.csv?raw'
import { csvOku } from './csv.ts'
import {
  ekle,
  kaynastirmaKarsiti,
  neden,
  nedenCumlesi,
  olasiBicimler,
  yuzeySecenekleri,
  type Neden,
} from './index.ts'
import { nedenYazimi } from './neden-yazimi.ts'

const satirlar = csvOku(kaynastirmaTablosu, ['kok', 'ekler', 'parca', 'aday', 'neden']).map(
  ({ satirNo, alanlar }) => ({
    satirNo,
    kok: alanlar.kok ?? '',
    ekler: alanlar.ekler ?? '',
    parca: alanlar.parca ?? '',
    aday: alanlar.aday ?? '',
    neden: alanlar.neden ?? '',
  }),
)

const tablodaki = (nedenler: readonly Neden[]) => nedenler.map(nedenYazimi).join(';')

describe('kaynaştırma neden tablosu', () => {
  it('tabloda 22 satır var', () => {
    expect(satirlar).toHaveLength(22)
  })

  it.each(satirlar)(
    'satır $satirNo: $kok + $parca → $aday: "$neden"',
    ({ kok, ekler, parca, aday, neden: beklenen }) => {
      const etiketler = ekler.split('+')
      const secilenler = parca.split('+')
      expect(kok + secilenler.join('')).toBe(aday)
      const nedenler = neden(kok, etiketler, secilenler)
      expect(tablodaki(nedenler)).toBe(beklenen)
      expect(olasiBicimler(kok, etiketler).includes(aday)).toBe(nedenler.length === 0)
    },
  )
})

describe('neden: kaynaştırma', () => {
  it('eksik: önceki ses ünlü; ilgili iki ses yan yana iki ünlü', () => {
    expect(neden('zelü', ['DAT'], ['e'])).toEqual([
      {
        tur: 'kaynaştırma',
        durum: 'eksik',
        etiket: 'DAT',
        harf: 'y',
        bakilan: 'ü',
        bakilanKonumu: 3,
        secilenKonumu: 4,
      },
    ])
  })

  it('fazla: önceki ses ünsüz; ilgili iki ses ünsüz ve giren y', () => {
    expect(neden('fıngıl', ['DAT'], ['ya'])).toEqual([
      {
        tur: 'kaynaştırma',
        durum: 'fazla',
        etiket: 'DAT',
        harf: 'y',
        bakilan: 'l',
        bakilanKonumu: 5,
        secilenKonumu: 6,
      },
    ])
  })

  it('uyum kaynaştırmadan sonra, seçilen yüzeydeki ünlünün yerinde sınanır', () => {
    const [kaynastirma, uyum] = neden('fıngıl', ['DAT'], ['ye'])
    expect(kaynastirma?.tur).toBe('kaynaştırma')
    expect(uyum).toMatchObject({ tur: 'uyum', bakilan: 'ı', secilen: 'e', secilenKonumu: 7 })
    expect(neden('zelü', ['DAT'], ['a'])[1]).toMatchObject({
      tur: 'uyum',
      bakilan: 'ü',
      secilen: 'a',
      secilenKonumu: 4,
    })
  })

  it('cümleler: eksikte harf ekin ayraçlı ünsüzüdür (y, n, s); fazla', () => {
    expect(nedenCumlesi(neden('zelü', ['DAT'], ['e']))).toBe(
      'İki ünlü yan yana gelmez: araya y girer.',
    )
    expect(nedenCumlesi(neden('kedi', ['GEN'], ['in']))).toBe(
      'İki ünlü yan yana gelmez: araya n girer.',
    )
    expect(nedenCumlesi(neden('kedi', ['POSS.3SG'], ['i']))).toBe(
      'İki ünlü yan yana gelmez: araya s girer.',
    )
    expect(nedenCumlesi(neden('fıngıl', ['DAT'], ['ya']))).toBe('Ünsüzden sonra araya y girmez.')
  })

  it('kaynaştırma karşıtı: ayraçlı ünsüzü çıkan ek onsuz, çıkmayan onunla', () => {
    const [zelu] = ekle('zelü', ['DAT']).parcalar
    const [fingil] = ekle('fıngıl', ['DAT']).parcalar
    expect(kaynastirmaKarsiti(zelu!)?.yuzey).toBe('e')
    expect(kaynastirmaKarsiti(fingil!)?.yuzey).toBe('ya')
    // Ayraçlı ünsüzle başlamayan ek ve zamir n alan ek karşıtsızdır.
    expect(kaynastirmaKarsiti(ekle('zelü', ['LOC']).parcalar[0]!)).toBeUndefined()
    expect(kaynastirmaKarsiti(ekle('ev', ['POSS.3SG', 'DAT']).parcalar[1]!)).toBeUndefined()
  })

  it('seçenekler: kaynaştırmalı ve kaynaştırmasız kılıklar birlikte', () => {
    const [zelu] = ekle('zelü', ['DAT']).parcalar
    expect(yuzeySecenekleri(zelu!)).toEqual(['ya', 'ye'])
    expect(yuzeySecenekleri(zelu!, { kaynastirma: true })).toEqual(['ya', 'ye', 'a', 'e'])
    const [fingil] = ekle('fıngıl', ['DAT']).parcalar
    expect(yuzeySecenekleri(fingil!, { kaynastirma: true })).toEqual(['a', 'e', 'ya', 'ye'])
    // Kaynaştırmasız ekte seçenek değişmez.
    const [loc] = ekle('mömüş', ['LOC']).parcalar
    expect(yuzeySecenekleri(loc!, { kaynastirma: true })).toEqual(['ta', 'te'])
  })

  it('kılık dışı yüzey yine hata verir', () => {
    expect(() => neden('zelü', ['DAT'], ['yi'])).toThrow(/kılıklarından biri değil/)
  })
})
