// Bölge tablosu: icerik/bolgeler.csv. Tablo yalnız kullanıcının onayıyla değişir; testi
// geçirmek için tabloya dokunulmaz (CLAUDE.md, 13. kural).

import { describe, expect, it } from 'vitest'
import { BOLGELER, GOREV_TABLOLARI, bolgeBul, bolgeleriOku } from './bolgeler.ts'
import { gorevleriOku } from './gorevler.ts'

const BASLIK = 'sira,kimlik,ad,aksam,gorevler\n'
const TABLOLAR = { 'icerik/gorevler/deneme.csv': 'sira,kok,ekler,renksiz\n1,ev,PL,\n' }

const gorevDosyalari = import.meta.glob<string>('../../icerik/gorevler/*.csv', {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe('adanın bölgeleri', () => {
  it('dört bölge, tablodaki sırayla, adları ve akşamlarıyla', () => {
    expect(BOLGELER.map(({ sira, kimlik, ad, aksam }) => ({ sira, kimlik, ad, aksam }))).toEqual([
      { sira: 1, kimlik: 'koy', ad: 'Bukalemun Koyu', aksam: 'Koyda akşam oldu' },
      {
        sira: 2,
        kimlik: 'dukkan',
        ad: "Fıstıkçı Şahap'ın Dükkânı",
        aksam: 'Dükkânda akşam oldu',
      },
      { sira: 3, kimlik: 'bahce', ad: 'Kök Bahçesi', aksam: 'Bahçede akşam oldu' },
      { sira: 4, kimlik: 'uyduruk', ad: 'Uydurukçuklar', aksam: 'Uydurukçuklarda akşam oldu' },
    ])
  })

  it('koyun ve dükkânın içeriği var: görevleri kendi tablolarından', () => {
    expect(BOLGELER.map((b) => b.gorevler.length)).toEqual([10, 10, 0, 0])
    const koy = GOREV_TABLOLARI['icerik/gorevler/bukalemun-koyu.csv'] ?? ''
    expect(bolgeBul('koy')?.gorevler).toEqual(gorevleriOku(koy))
    const dukkan = GOREV_TABLOLARI['icerik/gorevler/fistikci-sahap.csv'] ?? ''
    expect(bolgeBul('dukkan')?.gorevler).toEqual(gorevleriOku(dukkan))
  })

  it('her görev tablosu yoluyla bilinir, metni dosyanınkidir', () => {
    const dosyalar = Object.entries(gorevDosyalari).map(([yol, metin]) => [
      yol.replace(/^\.\.\/\.\.\//, ''),
      metin,
    ])
    expect(dosyalar.length).toBeGreaterThan(0)
    expect(Object.fromEntries(dosyalar)).toEqual(GOREV_TABLOLARI)
  })

  it('bolgeBul kimlikle bulur; tabloda olmayan bölge yok', () => {
    expect(bolgeBul('bahce')?.ad).toBe('Kök Bahçesi')
    expect(bolgeBul('yok')).toBeUndefined()
    expect(bolgeBul('constructor')).toBeUndefined()
  })
})

describe('bolgeleriOku', () => {
  it('satırı okur: görev tablosu yolundan, boşsa içerik yok', () => {
    const bolgeler = bolgeleriOku(
      `${BASLIK}1,ada,Ada,Adada akşam oldu,icerik/gorevler/deneme.csv\n2,tepe,Tepe,Tepede akşam oldu,\n`,
      TABLOLAR,
    )
    expect(bolgeler).toEqual([
      {
        sira: 1,
        kimlik: 'ada',
        ad: 'Ada',
        aksam: 'Adada akşam oldu',
        gorevler: [{ sira: 1, kok: 'ev', etiketler: ['PL'], renksiz: false }],
      },
      { sira: 2, kimlik: 'tepe', ad: 'Tepe', aksam: 'Tepede akşam oldu', gorevler: [] },
    ])
  })

  it('yanlış satırı numarasıyla bildirir', () => {
    const oku = (govde: string) => () => bolgeleriOku(BASLIK + govde, TABLOLAR)
    expect(oku('2,ada,Ada,Akşam,\n')).toThrow('Bölge tablosu, 2. satır: sıra 1 olur')
    expect(oku('1,Ada,Ada,Akşam,\n')).toThrow('kimlik küçük ASCII harflerle yazılır, "Ada" değil')
    expect(oku('1,dükkan,Ada,Akşam,\n')).toThrow('kimlik küçük ASCII harflerle')
    expect(oku('1,ada,Ada,Akşam,\n2,ada,Tepe,Akşam,\n')).toThrow('3. satır: "ada" kimliği ikinci kez')
    expect(oku('1,ada,,Akşam,\n')).toThrow('ad boş')
    expect(oku('1,ada,Ada,,\n')).toThrow('akşam boş')
    expect(oku('1,ada,Ada,Akşam,icerik/gorevler/yok.csv\n')).toThrow(
      'bilinmeyen görev tablosu: "icerik/gorevler/yok.csv"',
    )
    expect(oku('1,ada,Ada,Akşam,constructor\n')).toThrow('bilinmeyen görev tablosu')
  })

  it('görev tablosunun hatası bölge satırıyla bildirilir', () => {
    const bozuk = { 'icerik/gorevler/bozuk.csv': 'sira,kok,ekler,renksiz\n1,ev,PLU,\n' }
    expect(() =>
      bolgeleriOku(`${BASLIK}1,ada,Ada,Akşam,icerik/gorevler/bozuk.csv\n`, bozuk),
    ).toThrow('Bölge tablosu, 2. satır: icerik/gorevler/bozuk.csv: Görev tablosu, 2. satır')
    const bos = { 'icerik/gorevler/bos.csv': 'sira,kok,ekler,renksiz\n' }
    expect(() => bolgeleriOku(`${BASLIK}1,ada,Ada,Akşam,icerik/gorevler/bos.csv\n`, bos)).toThrow(
      'görev yok',
    )
  })

  it('boş tablo ve yanlış başlık hata verir', () => {
    expect(() => bolgeleriOku(BASLIK)).toThrow('Bölge tablosu boş')
    expect(() => bolgeleriOku('sira,kimlik,ad\n1,ada,Ada\n')).toThrow('CSV başlığı')
  })
})
