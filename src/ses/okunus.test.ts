import { describe, expect, it } from 'vitest'
import tablo from '../../icerik/ses-okunus.csv?raw'
import {
  HARF_ADLARI,
  OKUNUS_TABLOSU,
  SOZCUK_TABLOSU,
  okunus,
  okunusTablosunuOku,
  sozcukOkunuslari,
  sozcukTablosunuOku,
} from './okunus.ts'

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
    expect(okunus('Ek ünlüyle başlayınca p yumuşar: b olur.')).toBe('Ek ünlüyle başlayınca pe yumuşar: be olur.')
    expect(okunus('Ek ünlüyle başlayınca k yumuşar: ğ olur.')).toBe('Ek ünlüyle başlayınca ke yumuşar: yumuşak ge olur.')
    expect(okunus('top inatçıdır: p yumuşamaz.')).toBe('top inatçıdır: pe yumuşamaz.')
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

describe('sözcük tablosu (icerik/ses-sozcuk.csv): sözcüğün IPA okunuşu', () => {
  it('onaylı ilk satır: Bukalemun, bukaleˈmun', () => {
    expect(SOZCUK_TABLOSU).toEqual([{ sozcuk: 'Bukalemun', ipa: 'bukaleˈmun' }])
  })

  it('yalnız bütün sözcük eşleşir; büyük-küçük harf tablodaki gibi', () => {
    const bukalemun = [{ sozcuk: 'Bukalemun', ipa: 'bukaleˈmun' }]
    expect(sozcukOkunuslari('Bukalemun Koyu')).toEqual(bukalemun)
    expect(sozcukOkunuslari('Önce Bukalemun Koyu bitmeli.')).toEqual(bukalemun)
    expect(sozcukOkunuslari('Bukalemunlar geldi')).toEqual([])
    expect(sozcukOkunuslari('bukalemun')).toEqual([])
    expect(sozcukOkunuslari('Kök Bahçesi')).toEqual([])
  })

  it('boş alan, iki kez yazılan ya da birden çok sözcük hata verir', () => {
    expect(() => sozcukTablosunuOku('sozcuk,ipa\nat,\n')).toThrow('2. satır')
    expect(() => sozcukTablosunuOku('sozcuk,ipa\nat,at\nat,et\n')).toThrow('3. satır')
    expect(() => sozcukTablosunuOku('sozcuk,ipa\nKök Bahçesi,x\n')).toThrow('tek sözcük')
  })
})
