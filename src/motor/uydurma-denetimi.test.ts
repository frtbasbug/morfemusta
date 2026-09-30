// Uydurma kök denetiminin sözleşmesi: tests/uydurma-denetimi.csv. Her satır ayrı bir testtir.
// Tablo yalnız kullanıcının onayıyla değişir; testi geçirmek için tabloya dokunulmaz. sonuc
// boşsa kök geçerlidir; değilse ilk bozukluğun türüdür: ses, sözlük, yasak ya da ek.
// Görev tablosunun 100 kökü src/oyun/uyduruk.test.ts'te sınanır.

import { describe, expect, it } from 'vitest'
import denetimTablosu from '../../tests/uydurma-denetimi.csv?raw'
import { csvOku } from './csv.ts'
import { YASAKLI_DIZILER, uydurmaDenetimi, yasakliDizileriOku } from './index.ts'

const satirlar = csvOku(denetimTablosu, ['kok', 'sonuc']).map(({ satirNo, alanlar }) => ({
  satirNo,
  kok: alanlar.kok ?? '',
  sonuc: alanlar.sonuc ?? '',
}))

describe('uydurma kök denetimi tablosu', () => {
  it('tabloda 15 satır var', () => {
    expect(satirlar).toHaveLength(15)
  })

  it.each(satirlar)('satır $satirNo: $kok → "$sonuc"', ({ kok, sonuc }) => {
    expect(uydurmaDenetimi(kok)?.tur ?? '').toBe(sonuc)
  })
})

describe('uydurma kök denetimi: kurallar', () => {
  const ses = (kok: string) => {
    const b = uydurmaDenetimi(kok)
    return b?.tur === 'ses' ? b.aciklama : undefined
  }

  it('iki hece', () => {
    expect(ses('pıtakı')).toBe('3 hece')
    expect(ses('pıt')).toBe('1 hece')
  })

  it('ilk ses b c ç d f g h k m n p s ş t v y z; ilk hece ünsüz + ünlü', () => {
    expect(ses('lopat')).toBe('ilk ses l')
    expect(ses('rıpak')).toBe('ilk ses r')
    expect(ses('apak')).toBe('ilk ses a')
    expect(ses('ptaki')).toBe('ilk hece ünsüz + ünlü değil')
  })

  it('iki ünlü arasında bir ya da iki ünsüz; ikiyse kurallı', () => {
    expect(ses('pıak')).toBe('iki ünlü arasında 0 ünsüz')
    expect(ses('pıstrak')).toBe('iki ünlü arasında 3 ünsüz')
    expect(ses('pıtkak')).toBe('ünlü arasında tk: ilki t')
    expect(ses('pıllak')).toBe('ünlü arasında ll: ikisi aynı')
    expect(ses('pınbak')).toBe('ünlü arasında nb')
    expect(ses('pınpak')).toBe('ünlü arasında np')
    expect(ses('pundar')).toBeUndefined()
    expect(ses('kolgan')).toBeUndefined()
  })

  it('sonda ünlü ya da p ç t k s ş z l r m n y; ğ ve j yok', () => {
    expect(ses('pıtab')).toBe('sonda b')
    expect(ses('pıtaks')).toBe('sonda ks')
    expect(ses('pıtağ')).toBe('ğ var')
    expect(ses('jıtak')).toBe('j var')
    expect(ses('zelü')).toBeUndefined()
  })

  it('ikinci hecede o ve ö yok; iki hece aynı ünsüz ve ünlüyle başlamaz', () => {
    expect(ses('potok')).toBe('ikinci hecede o')
    expect(ses('zelö')).toBe('ikinci hecede ö')
    expect(ses('tata')).toBe('iki hece ta ile başlıyor')
    expect(ses('tatı')).toBeUndefined()
  })

  it('kök içi ünlü uyumu aranmaz', () => {
    expect(uydurmaDenetimi('zelü')).toBeUndefined()
    expect(uydurmaDenetimi('datip')).toBeUndefined()
  })

  it('yasak: kökte, oyun biçimlerinde; başta dizileri yalnız kökün başında', () => {
    expect(uydurmaDenetimi('sikep')).toEqual({ tur: 'yasak', aciklama: 'sik' })
    expect(uydurmaDenetimi('malap')).toEqual({ tur: 'yasak', aciklama: 'mal' })
    // Kök temiz, oyun biçimi değil: zemem + e → zememe.
    expect(uydurmaDenetimi('zemem')).toEqual({ tur: 'yasak', aciklama: 'meme' })
    // "mal" yalnız başta yasaktır.
    expect(uydurmaDenetimi('tamal')).toBeUndefined()
  })

  it('ek: başka bir kök + en az iki harflik ek yüzeyi', () => {
    expect(uydurmaDenetimi('kuşlar')).toEqual({ tur: 'ek', aciklama: 'kuş + lar' })
    expect(uydurmaDenetimi('tuzluk')).toEqual({ tur: 'ek', aciklama: 'tuz + luk' })
  })

  it('yasaklı diziler tablosu okunur; bozuk satır numarasıyla bildirilir', () => {
    expect(YASAKLI_DIZILER.length).toBe(43)
    expect(YASAKLI_DIZILER.filter((d) => d.yer === 'başta').map((d) => d.dizi)).toEqual([
      'am',
      'öl',
      'mal',
    ])
    expect(() => yasakliDizileriOku('dizi,yer\nab,ortada\n')).toThrow(/2\. satır/)
    expect(() => yasakliDizileriOku('dizi,yer\nAb,başta\n')).toThrow(/alfabe dışı/)
  })
})
