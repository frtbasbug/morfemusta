// Altın tablo: tests/altin-bicimler.csv. Her satır ayrı bir testtir.
// Tablo yalnız kullanıcının onayıyla değişir; testi geçirmek için tabloya dokunulmaz.

import { describe, expect, it } from 'vitest'
import altinTablo from '../../tests/altin-bicimler.csv?raw'
import { csvOku } from './csv.ts'
import { ekle } from './index.ts'

const satirlar = csvOku(altinTablo, ['kok', 'ekler', 'beklenen', 'kural']).map(
  ({ satirNo, alanlar }) => ({
    satirNo,
    kok: alanlar.kok ?? '',
    ekler: alanlar.ekler ?? '',
    beklenen: alanlar.beklenen ?? '',
    kural: alanlar.kural ?? '',
  }),
)

describe('altın biçimler', () => {
  it('tabloda 102 satır var', () => {
    expect(satirlar).toHaveLength(102)
  })

  it.each(satirlar)(
    'satır $satirNo: $kok + $ekler → $beklenen ($kural)',
    ({ kok, ekler, beklenen }) => {
      expect(ekle(kok, ekler.split('+')).bicim).toBe(beklenen)
    },
  )
})
