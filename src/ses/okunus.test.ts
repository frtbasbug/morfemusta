import { describe, expect, it } from 'vitest'
import tablo from '../../icerik/ses-okunus.csv?raw'
import { HARF_ADLARI, OKUNUS_TABLOSU, okunus, okunusTablosunuOku } from './okunus.ts'

describe('okunuş: tek harf adıyla söylenir', () => {
  it.each([
    ['p', 'pe'],
    ['b', 'be'],
    ['ğ', 'yumuşak ge'],
    ['ç', 'çe'],
    ['ş', 'şe'],
    ['k', 'ke'],
    ['a', 'a'],
    ['ı', 'ı'],
    ['ö', 'ö'],
    ['ü', 'ü'],
  ])('%s → %s', (harf, ad) => {
    expect(okunus(harf)).toBe(ad)
  })

  it('Türk alfabesinin 29 harfinin adı var; ünlüler kendisi', () => {
    expect(Object.keys(HARF_ADLARI)).toHaveLength(29)
    for (const unlu of 'aıoueiöü') expect(HARF_ADLARI[unlu]).toBe(unlu)
  })

  it('cümlede yalnız tek harfler değişir; kelimeler olduğu gibi kalır', () => {
    expect(okunus('p ünlüden önce jöle olur: b.')).toBe('pe ünlüden önce jöle olur: be.')
    expect(okunus('k ünlüden önce jöle olur: ğ.')).toBe('ke ünlüden önce jöle olur: yumuşak ge.')
    expect(okunus('top inatçı: p taş kalır.')).toBe('top inatçı: pe taş kalır.')
    expect(okunus('e ince, a kalın. Kalınlıkları uyuşmuyor.')).toBe(
      'e ince, a kalın. Kalınlıkları uyuşmuyor.',
    )
    expect(okunus('Meyvenin üstüne gövde çıkmaz: önce m.')).toBe(
      'Meyvenin üstüne gövde çıkmaz: önce me.',
    )
    expect(okunus('atlar')).toBe('atlar')
  })

  it('ok ve tire okunmaz', () => {
    expect(okunus('-da → kitapta')).toBe('da kitapta')
    expect(okunus('kitap → kitabım')).toBe('kitap kitabım')
  })

  it('okunuş tablosundaki metin tablodaki gibi okunur', () => {
    const ozel = okunusTablosunuOku('metin,okunus\nfıngıl,fıŋ-gıl\n')
    expect(okunus('fıngıl', ozel)).toBe('fıŋ-gıl')
    expect(okunus('fıngıllar', ozel)).toBe('fıngıllar')
  })

  it('okunuş tablosu: başlık kurulu; boş alan ve tekrar satır numarasıyla hata verir', () => {
    expect(tablo.split(/\r?\n/)[0]).toBe('metin,okunus')
    expect(OKUNUS_TABLOSU).toBeInstanceOf(Map)
    expect(() => okunusTablosunuOku('metin,okunus\nat,\n')).toThrow('2. satır')
    expect(() => okunusTablosunuOku('metin,okunus\nat,at\nat,et\n')).toThrow('3. satır')
  })
})
