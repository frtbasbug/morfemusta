import { describe, expect, it } from 'vitest'
import altinTablo from '../../tests/altin-bicimler.csv?raw'
import { csvOku } from './csv.ts'
import { ekEnvanteriniOku, ekle, type Olay } from './index.ts'

const aciklamalar = (olaylar: readonly Olay[]) => olaylar.map((olay) => olay.aciklama)

describe('ekle: parçalar', () => {
  it('her ek için etiketi, şablonu, türü, yüzeyi ve olayları verir', () => {
    expect(ekle('ev', ['PL'])).toEqual({
      bicim: 'evler',
      parcalar: [
        {
          etiket: 'PL',
          sablon: '-lAr',
          tur: 'çekim',
          yuzey: 'ler',
          olaylar: [
            {
              tur: 'uyum',
              birim: 'A',
              arkafonem: 'A',
              bakilan: 'e',
              sonuc: 'e',
              kopyalanan: ['kalınlık'],
              konum: 1,
              aciklama: 'uyum: kalınlık kopyalandı',
            },
          ],
        },
      ],
    })
  })

  it('ek yoksa kökü olduğu gibi verir', () => {
    expect(ekle('ev', [])).toEqual({ bicim: 'ev', parcalar: [] })
  })

  it('yapım ekini türüyle işaretler', () => {
    expect(ekle('yol', ['AGT', 'PL']).parcalar.map((p) => [p.yuzey, p.tur])).toEqual([
      ['cu', 'yapım'],
      ['lar', 'çekim'],
    ])
  })
})

describe('ekle: olaylar', () => {
  it('I kalınlığı ve yuvarlaklığı kopyalar', () => {
    const [parca] = ekle('göz', ['POSS.1SG']).parcalar
    expect(parca?.olaylar).toEqual([
      {
        tur: 'uyum',
        birim: '(I)',
        arkafonem: 'I',
        bakilan: 'ö',
        sonuc: 'ü',
        kopyalanan: ['kalınlık', 'yuvarlaklık'],
        konum: 0,
        aciklama: 'uyum: kalınlık ve yuvarlaklık kopyalandı',
      },
    ])
  })

  it('ekin ikinci ünlüsü ekin kendi ilk ünlüsüne bakar', () => {
    const [parca] = ekle('yol', ['POSS.3PL']).parcalar
    expect(parca?.yuzey).toBe('ları')
    expect(parca?.olaylar.map((o) => (o.tur === 'uyum' ? [o.bakilan, o.sonuc] : o.tur))).toEqual([
      ['o', 'a'],
      ['a', 'ı'],
    ])
  })

  it('(I) ünlüden sonra düşer', () => {
    const [parca] = ekle('kedi', ['POSS.1SG']).parcalar
    expect(parca?.yuzey).toBe('m')
    expect(parca?.olaylar).toEqual([
      { tur: 'düşme', birim: '(I)', konum: 0, aciklama: 'düşme: (I)' },
    ])
  })

  it('ayraçlı ünsüz ünlüden sonra kaynaştırma olarak çıkar', () => {
    expect(aciklamalar(ekle('kedi', ['DAT']).parcalar[0]?.olaylar ?? [])).toEqual([
      'kaynaştırma: y',
      'uyum: kalınlık kopyalandı',
    ])
    expect(aciklamalar(ekle('elma', ['POSS.3SG']).parcalar[0]?.olaylar ?? [])).toEqual([
      'kaynaştırma: s',
      'uyum: kalınlık ve yuvarlaklık kopyalandı',
    ])
    expect(aciklamalar(ekle('kuzu', ['GEN']).parcalar[0]?.olaylar ?? [])).toEqual([
      'kaynaştırma: n',
      'uyum: kalınlık ve yuvarlaklık kopyalandı',
    ])
  })

  it('ayraçlı ünsüz ünsüzden sonra düşer', () => {
    expect(ekle('ev', ['ACC']).parcalar[0]?.olaylar).toEqual([
      { tur: 'düşme', birim: '(y)', konum: 0, aciklama: 'düşme: (y)' },
      expect.objectContaining({ tur: 'uyum', sonuc: 'i', konum: 0 }),
    ])
  })

  it('D sert ünsüzden sonra t olur', () => {
    expect(ekle('kitap', ['LOC']).parcalar[0]?.olaylar).toEqual([
      {
        tur: 'benzeşme',
        birim: 'D',
        bakilan: 'p',
        sonuc: 't',
        konum: 0,
        aciklama: 'benzeşme: D→t',
      },
      expect.objectContaining({ tur: 'uyum', sonuc: 'a', konum: 1 }),
    ])
  })

  it('C sert ünsüzden sonra ç olur', () => {
    expect(aciklamalar(ekle('balık', ['AGT']).parcalar[0]?.olaylar ?? [])).toEqual([
      'benzeşme: C→ç',
      'uyum: kalınlık ve yuvarlaklık kopyalandı',
    ])
  })

  it('yumuşak ünsüzden ya da ünlüden sonra benzeşme olmaz', () => {
    expect(ekle('ev', ['LOC']).parcalar[0]?.olaylar.map((o) => o.tur)).toEqual(['uyum'])
    expect(ekle('kapı', ['AGT']).parcalar[0]?.olaylar.map((o) => o.tur)).toEqual(['uyum'])
  })

  it('3. kişi iyelikten sonra durum eki zamir n alır', () => {
    const [, bulunma] = ekle('ev', ['POSS.3SG', 'LOC']).parcalar
    expect(bulunma?.yuzey).toBe('nde')
    expect(bulunma?.olaylar[0]).toEqual({
      tur: 'zamir n',
      sonuc: 'n',
      konum: 0,
      aciklama: 'zamir n',
    })

    // Zamir n'den sonra ek ünsüzden sonra gelmiş olur: (y) düşer.
    const [, belirtme] = ekle('ev', ['POSS.3SG', 'ACC']).parcalar
    expect(belirtme?.yuzey).toBe('ni')
    expect(aciklamalar(belirtme?.olaylar ?? [])).toEqual([
      'zamir n',
      'düşme: (y)',
      'uyum: kalınlık ve yuvarlaklık kopyalandı',
    ])

    expect(ekle('yol', ['POSS.3PL', 'ABL']).bicim).toBe('yollarından')
  })

  it('araç eki zamir n almaz; ilgi ekinin n\'si kendi kaynaştırmasıdır', () => {
    const [, arac] = ekle('ev', ['POSS.3SG', 'INS']).parcalar
    expect(aciklamalar(arac?.olaylar ?? [])).toEqual([
      'kaynaştırma: y',
      'uyum: kalınlık kopyalandı',
    ])

    const [, ilgi] = ekle('kedi', ['POSS.3SG', 'GEN']).parcalar
    expect(aciklamalar(ilgi?.olaylar ?? [])).toEqual([
      'kaynaştırma: n',
      'uyum: kalınlık ve yuvarlaklık kopyalandı',
    ])
  })

  it('zamir n yalnız hemen ardından gelen durum ekine gelir', () => {
    expect(ekle('ev', ['POSS.1SG', 'LOC']).bicim).toBe('evimde')
    expect(ekle('ev', ['PL', 'LOC']).bicim).toBe('evlerde')
  })
})

describe('ekle: uydurma kelimeler', () => {
  // Uydurma kelimede kategorik kurallar işler (DESIGN.md, "Uydurma kelime kanıttır").
  it.each([
    ['fıngıl', ['PL'], 'fıngıllar'],
    ['mömüş', ['LOC'], 'mömüşte'],
    ['mömüş', ['POSS.1SG'], 'mömüşüm'],
    ['fıngıl', ['AGT'], 'fıngılcı'],
    ['pıtak', ['PL', 'ABL'], 'pıtaklardan'],
    ['zobu', ['DAT'], 'zobuya'],
  ])('%s + %j → %s', (kok, etiketler, beklenen) => {
    expect(ekle(kok, etiketler).bicim).toBe(beklenen)
  })
})

describe('ekle: tutarlılık', () => {
  const satirlar = csvOku(altinTablo, ['kok', 'ekler', 'beklenen', 'kural'])

  it('parçaların yüzeyleri köke eklenince biçimi verir', () => {
    for (const { alanlar } of satirlar) {
      const kok = alanlar.kok ?? ''
      const { bicim, parcalar } = ekle(kok, (alanlar.ekler ?? '').split('+'))
      expect(kok + parcalar.map((p) => p.yuzey).join('')).toBe(bicim)
    }
  })

  it('olayın konumu, ekin yüzeyinde olayın sonucunu gösterir', () => {
    for (const { alanlar } of satirlar) {
      for (const parca of ekle(alanlar.kok ?? '', (alanlar.ekler ?? '').split('+')).parcalar) {
        for (const olay of parca.olaylar) {
          if (olay.tur === 'düşme') {
            expect(olay.konum).toBeLessThanOrEqual(parca.yuzey.length)
          } else {
            expect(parca.yuzey[olay.konum]).toBe(olay.sonuc)
          }
        }
      }
    }
  })
})

describe('ekle: hatalar', () => {
  it('bilinmeyen etiketi reddeder', () => {
    expect(() => ekle('ev', ['DAT', 'VOC'])).toThrow('Bilinmeyen ek etiketi: "VOC"')
  })

  it('boş kökü ve alfabe dışı harfi reddeder', () => {
    expect(() => ekle('', ['PL'])).toThrow('Kök boş')
    expect(() => ekle('Ev', ['PL'])).toThrow('"E"')
    expect(() => ekle('kâr', ['PL'])).toThrow('"â"')
  })

  it('ünlüsüz gövdede uyumu çözemez', () => {
    expect(() => ekle('pst', ['PL'])).toThrow('ünlü yok')
  })

  it('verilen envanterle çalışır', () => {
    const envanter = ekEnvanteriniOku('etiket,sablon,tur\nDIM,-CIk,yapım\n')
    expect(ekle('kuş', ['DIM'], envanter).bicim).toBe('kuşçuk')
    expect(() => ekle('kuş', ['PL'], envanter)).toThrow('Bilinmeyen ek etiketi')
  })

  it('Unicode ayrışık yazılmış kökü de tanır', () => {
    expect(ekle('göz'.normalize('NFD'), ['PL']).bicim).toBe('gözler')
  })
})
