// Altın tablo: tests/altin-bicimler.csv. Her satır ayrı bir testtir.
// Tablo yalnız kullanıcının onayıyla değişir; testi geçirmek için tabloya dokunulmaz.
//
// Beklenen sütununda | ile ayrılmış biçimler varsa (pıtağı|pıtakı) olasiBicimler tam bu
// kümeyi döner. Tek biçimli satırda ekle o biçimi verir, olasiBicimler de yalnız onu döner.

import { describe, expect, it } from 'vitest'
import altinTablo from '../../tests/altin-bicimler.csv?raw'
import { csvOku } from './csv.ts'
import { ekle, olasiBicimler } from './index.ts'

const satirlar = csvOku(altinTablo, ['kok', 'ekler', 'beklenen', 'kural']).map(
  ({ satirNo, alanlar }) => ({
    satirNo,
    kok: alanlar.kok ?? '',
    ekler: alanlar.ekler ?? '',
    beklenen: alanlar.beklenen ?? '',
    kural: alanlar.kural ?? '',
  }),
)

const sirali = (bicimler: readonly string[]) => [...bicimler].sort()

describe('altın biçimler', () => {
  it('tabloda 202 satır var', () => {
    expect(satirlar).toHaveLength(202)
  })

  it.each(satirlar)(
    'satır $satirNo: $kok + $ekler → $beklenen ($kural)',
    ({ kok, ekler, beklenen }) => {
      const etiketler = ekler.split('+')
      const beklenenler = beklenen.split('|')
      const bicim = ekle(kok, etiketler).bicim
      if (beklenenler.length === 1) {
        expect(bicim).toBe(beklenen)
        expect(olasiBicimler(kok, etiketler)).toEqual([beklenen])
      } else {
        expect(sirali(olasiBicimler(kok, etiketler))).toEqual(sirali(beklenenler))
        expect(beklenenler).toContain(bicim)
      }
    },
  )
})
