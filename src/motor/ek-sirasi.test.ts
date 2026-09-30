// Ek sırası tablosu: tests/ek-sirasi.csv. Her satır ayrı bir testtir. Tablo yalnız
// kullanıcının onayıyla değişir; testi geçirmek için tabloya dokunulmaz.
//
// bicim doluysa sıra doğrudur ve ekle o biçimi verir; hata doluysa ekSirasiHatasi o hatayı
// döner, ekle ve olasiBicimler hata atar.

import { describe, expect, it } from 'vitest'
import siraTablosu from '../../tests/ek-sirasi.csv?raw'
import { csvOku } from './csv.ts'
import { ekSirasiHatasi, ekle, olasiBicimler } from './index.ts'

const satirlar = csvOku(siraTablosu, ['kok', 'ekler', 'bicim', 'hata']).map(
  ({ satirNo, alanlar }) => ({
    satirNo,
    kok: alanlar.kok ?? '',
    ekler: alanlar.ekler ?? '',
    bicim: alanlar.bicim ?? '',
    hata: alanlar.hata ?? '',
  }),
)

describe('ek sırası tablosu', () => {
  it('tabloda 27 satır var; her satırda ya biçim ya hata yazılı', () => {
    expect(satirlar).toHaveLength(27)
    for (const { bicim, hata } of satirlar) expect(bicim === '').not.toBe(hata === '')
  })

  it.each(satirlar)('satır $satirNo: $kok + $ekler → $bicim$hata', ({ kok, ekler, bicim, hata }) => {
    const etiketler = ekler.split('+')
    if (bicim !== '') {
      expect(ekSirasiHatasi(etiketler)).toBeUndefined()
      expect(ekle(kok, etiketler).bicim).toBe(bicim)
    } else {
      expect(ekSirasiHatasi(etiketler)).toBe(hata)
      expect(() => ekle(kok, etiketler)).toThrow(`ek sırası bozuk (${hata})`)
      expect(() => olasiBicimler(kok, etiketler)).toThrow(`ek sırası bozuk (${hata})`)
    }
  })
})

describe('ekSirasiHatasi', () => {
  it('boş dizide ve tek ekte sıra doğrudur', () => {
    expect(ekSirasiHatasi([])).toBeUndefined()
    expect(ekSirasiHatasi(['PL'])).toBeUndefined()
    expect(ekSirasiHatasi(['AGT'])).toBeUndefined()
  })

  it('yapım ekleri kendi aralarında serbest sıralanır, tekrar edebilir', () => {
    expect(ekSirasiHatasi(['AGT', 'LIK'])).toBeUndefined()
    expect(ekSirasiHatasi(['LIK', 'AGT', 'LIK', 'DIM'])).toBeUndefined()
  })

  it('çekim eki bir basamak atlayabilir', () => {
    expect(ekSirasiHatasi(['PL', 'LOC'])).toBeUndefined()
    expect(ekSirasiHatasi(['AGT', 'POSS.1SG'])).toBeUndefined()
    expect(ekSirasiHatasi(['LIK', 'GEN'])).toBeUndefined()
  })

  it('soldan sağa ilk bozukluk döner', () => {
    // PL hâlden sonra (çekim:PL), AGT de meyvenin üstünde: önce gelen PL.
    expect(ekSirasiHatasi(['ACC', 'PL', 'AGT'])).toBe('çekim:PL')
    expect(ekSirasiHatasi(['PL', 'AGT', 'PL'])).toBe('meyve:AGT')
  })

  it('bilinmeyen etikette hata verir', () => {
    expect(() => ekSirasiHatasi(['XYZ'])).toThrow('Bilinmeyen ek etiketi: "XYZ"')
  })
})
