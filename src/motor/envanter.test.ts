import { describe, expect, it } from 'vitest'
import { csvOku } from './csv.ts'
import { EK_ENVANTERI, ekEnvanteriniOku } from './envanter.ts'
import { sablonuCoz } from './sablon.ts'

describe('ek envanteri (icerik/ekler.csv)', () => {
  it('Oturum 2 envanterini taşır', () => {
    expect([...EK_ENVANTERI.values()].map((ek) => [ek.etiket, ek.sablon, ek.tur])).toEqual([
      ['PL', '-lAr', 'çekim'],
      ['POSS.1SG', '-(I)m', 'çekim'],
      ['POSS.2SG', '-(I)n', 'çekim'],
      ['POSS.3SG', '-(s)I', 'çekim'],
      ['POSS.1PL', '-(I)mIz', 'çekim'],
      ['POSS.2PL', '-(I)nIz', 'çekim'],
      ['POSS.3PL', '-lArI', 'çekim'],
      ['ACC', '-(y)I', 'çekim'],
      ['DAT', '-(y)A', 'çekim'],
      ['LOC', '-DA', 'çekim'],
      ['ABL', '-DAn', 'çekim'],
      ['GEN', '-(n)In', 'çekim'],
      ['INS', '-(y)lA', 'çekim'],
      ['AGT', '-CI', 'yapım'],
    ])
  })

  it('başlığı yanlış dosyayı reddeder', () => {
    expect(() => ekEnvanteriniOku('etiket,sablon\nPL,-lAr\n')).toThrow('CSV başlığı')
  })

  it('bilinmeyen türü reddeder', () => {
    expect(() => ekEnvanteriniOku('etiket,sablon,tur\nPL,-lAr,cekim\n')).toThrow(
      '2. satır: tür "çekim" ya da "yapım" olur',
    )
  })

  it('aynı etiketin ikinci tanımını reddeder', () => {
    expect(() => ekEnvanteriniOku('etiket,sablon,tur\nPL,-lAr,çekim\nPL,-lAr,çekim\n')).toThrow(
      '3. satır: "PL" etiketi ikinci kez',
    )
  })
})

describe('şablon', () => {
  it('birimlere ayrılır', () => {
    expect(sablonuCoz('-(I)mIz').map((b) => [b.tur, b.yazim])).toEqual([
      ['ayracli-unlu', '(I)'],
      ['harf', 'm'],
      ['unlu', 'I'],
      ['harf', 'z'],
    ])
    expect(sablonuCoz('-(y)lA').map((b) => b.tur)).toEqual(['ayracli-unsuz', 'harf', 'unlu'])
    expect(sablonuCoz('-DAn').map((b) => b.tur)).toEqual(['unsuz', 'unlu', 'harf'])
  })

  it.each([
    ['lAr', '"-" ile başlar'],
    ['-', 'şablon boş'],
    ['-(yI', 'ayraç içinde tek bir ses'],
    ['-(e)m', 'ayraç içinde "e" olamaz'],
    ['-lXr', '"X" tanınmıyor'],
  ])('bozuk şablonu reddeder: %s', (sablon, neden) => {
    expect(() => sablonuCoz(sablon)).toThrow(neden)
  })
})

describe('CSV okuyucusu', () => {
  it('tırnaklı alanları, CRLF satır sonlarını, BOM\'u ve boş satırları okur', () => {
    const metin = '﻿a,b\r\n"x, y","say ""ek"""\r\n\r\nz,\r\n'
    expect(csvOku(metin, ['a', 'b'])).toEqual([
      { satirNo: 2, alanlar: { a: 'x, y', b: 'say "ek"' } },
      { satirNo: 4, alanlar: { a: 'z', b: '' } },
    ])
  })

  it('alan sayısı tutmayan satırı numarasıyla bildirir', () => {
    expect(() => csvOku('a,b\n1,2\n3\n', ['a', 'b'])).toThrow('3. satır: 2 alan beklenirken 1')
  })

  it('kapanmamış tırnağı reddeder', () => {
    expect(() => csvOku('a\n"x\n', ['a'])).toThrow('tırnak kapanmamış')
  })
})
