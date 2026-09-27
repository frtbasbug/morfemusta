import { describe, expect, it } from 'vitest'
import altinTablo from '../../tests/altin-bicimler.csv?raw'
import { csvOku } from './csv.ts'
import {
  ekEnvanteriniOku,
  ekle,
  govdeOlayiMi,
  kokSozlugunuOku,
  olasiBicimler,
  type EkParcasi,
  type Olay,
} from './index.ts'

const aciklamalar = (olaylar: readonly Olay[]) => olaylar.map((olay) => olay.aciklama)

/** Parçanın gövde olaylarını sondan başa geri alır: ekin geldiği kelimeyi verir. */
function govdeOlaylariniGeriAl(parca: EkParcasi): string {
  let govde = parca.govde
  for (const olay of [...parca.olaylar].reverse()) {
    if (!govdeOlayiMi(olay)) continue
    const { konum } = olay
    switch (olay.tur) {
      case 'yumuşama':
        govde = govde.slice(0, konum) + olay.bakilan + govde.slice(konum + 1)
        break
      case 'ünlü düşmesi':
        govde = govde.slice(0, konum) + olay.dusen + govde.slice(konum)
        break
      case 'ikizleşme':
      case 'su':
        govde = govde.slice(0, konum) + govde.slice(konum + 1)
        break
    }
  }
  return govde
}

describe('ekle: parçalar', () => {
  it('her ek için etiketi, şablonu, türü, gövdeyi, yüzeyi ve olayları verir', () => {
    expect(ekle('ev', ['PL'])).toEqual({
      bicim: 'evler',
      parcalar: [
        {
          etiket: 'PL',
          sablon: '-lAr',
          tur: 'çekim',
          govde: 'ev',
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

  it('(I) ünlüden sonra saklanır', () => {
    const [parca] = ekle('kedi', ['POSS.1SG']).parcalar
    expect(parca?.yuzey).toBe('m')
    expect(parca?.olaylar).toEqual([
      { tur: 'saklanma', birim: '(I)', konum: 0, aciklama: 'saklanma: (I)' },
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

  it('ayraçlı ünsüz ünsüzden sonra saklanır', () => {
    expect(ekle('ev', ['ACC']).parcalar[0]?.olaylar).toEqual([
      { tur: 'saklanma', birim: '(y)', konum: 0, aciklama: 'saklanma: (y)' },
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

    // Zamir n'den sonra ek ünsüzden sonra gelmiş olur: (y) saklanır.
    const [, belirtme] = ekle('ev', ['POSS.3SG', 'ACC']).parcalar
    expect(belirtme?.yuzey).toBe('ni')
    expect(aciklamalar(belirtme?.olaylar ?? [])).toEqual([
      'zamir n',
      'saklanma: (y)',
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

  it('çoğuldan sonra 3. çoğul iyelik yalnız -I olarak gelir', () => {
    const [, iyelik] = ekle('ev', ['PL', 'POSS.3PL']).parcalar
    expect(iyelik?.yuzey).toBe('i')
    expect(iyelik?.olaylar).toEqual([
      {
        tur: 'çoğul tekrarlanmaz',
        birim: '-lAr',
        konum: 0,
        aciklama: 'çoğul tekrarlanmaz: -lArI → -I',
      },
      expect.objectContaining({ tur: 'uyum', bakilan: 'e', sonuc: 'i', konum: 0 }),
    ])

    // Çoğulsuz POSS.3PL tam şablonla gelir; kısalan -I'dan sonra zamir n yine gelir.
    expect(ekle('ev', ['POSS.3PL']).bicim).toBe('evleri')
    expect(ekle('masa', ['PL', 'POSS.3PL', 'DAT']).bicim).toBe('masalarına')
  })

  it('zamir n yalnız hemen ardından gelen durum ekine gelir', () => {
    expect(ekle('ev', ['POSS.1SG', 'LOC']).bicim).toBe('evimde')
    expect(ekle('ev', ['PL', 'LOC']).bicim).toBe('evlerde')
  })
})

describe('ekle: gövde olayları', () => {
  it('yumuşama: ünlüyle başlayan ek sert son ünsüzü yumuşatır', () => {
    const [parca] = ekle('kitap', ['ACC']).parcalar
    expect(parca?.govde).toBe('kitab')
    expect(parca?.yuzey).toBe('ı')
    expect(parca?.olaylar).toEqual([
      {
        tur: 'yumuşama',
        bakilan: 'p',
        sonuc: 'b',
        konum: 4,
        aciklama: 'yumuşama: p→b',
      },
      { tur: 'saklanma', birim: '(y)', konum: 0, aciklama: 'saklanma: (y)' },
      expect.objectContaining({ tur: 'uyum', sonuc: 'ı', konum: 0 }),
    ])
  })

  it.each([
    ['ağaç', 'DAT', 'ağaca', 'yumuşama: ç→c'],
    ['armut', 'ACC', 'armudu', 'yumuşama: t→d'],
    ['çocuk', 'POSS.1SG', 'çocuğum', 'yumuşama: k→ğ'],
    ['köpek', 'GEN', 'köpeğin', 'yumuşama: k→ğ'],
    ['renk', 'ACC', 'rengi', 'yumuşama: nk→ng'],
    ['kalp', 'ACC', 'kalbi', 'yumuşama: p→b'],
  ])('%s + %s → %s (%s)', (kok, etiket, bicim, aciklama) => {
    const sonuc = ekle(kok, [etiket])
    expect(sonuc.bicim).toBe(bicim)
    expect(aciklamalar(sonuc.parcalar[0]?.olaylar ?? [])[0]).toBe(aciklama)
  })

  it('ünsüzle başlayan ekten önce ve yumusama=hayır kökte gövde değişmez', () => {
    for (const [kok, etiket] of [
      ['kitap', 'LOC'],
      ['çocuk', 'PL'],
      ['top', 'ACC'],
      ['saç', 'POSS.1SG'],
    ] as const) {
      const [parca] = ekle(kok, [etiket]).parcalar
      expect(parca?.govde).toBe(kok)
      expect(parca?.olaylar.filter(govdeOlayiMi)).toEqual([])
    }
  })

  it('ünlü düşmesi: kökün son ünlüsü düşer; konum düştüğü yerdir', () => {
    const [parca] = ekle('ağız', ['POSS.1SG']).parcalar
    expect(parca?.govde).toBe('ağz')
    expect(parca?.olaylar[0]).toEqual({
      tur: 'ünlü düşmesi',
      dusen: 'ı',
      konum: 2,
      aciklama: 'ünlü düşmesi',
    })
    expect(ekle('burun', ['PL']).parcalar[0]?.olaylar.filter(govdeOlayiMi)).toEqual([])
  })

  it('ünlü düşmesinde uyum düşen ünlüye bakar', () => {
    const sozluk = kokSozlugunuOku(
      'kok,kategori,yumusama,unlu_dusmesi,istisna\nvakit,zaman,hayır,evet,\n',
    )
    const sonuc = ekle('vakit', ['POSS.1SG'], { sozluk })
    expect(sonuc.bicim).toBe('vaktim')
    expect(sonuc.parcalar[0]?.olaylar[1]).toMatchObject({ tur: 'uyum', bakilan: 'i', sonuc: 'i' })
  })

  it('ikizleşme: son ünsüz ikizleşir; konum eklenen ikizdir', () => {
    const [parca] = ekle('sır', ['POSS.1SG']).parcalar
    expect(parca?.govde).toBe('sırr')
    expect(parca?.olaylar[0]).toEqual({
      tur: 'ikizleşme',
      sonuc: 'r',
      konum: 3,
      aciklama: 'ikizleşme',
    })
    expect(ekle('hak', ['DAT']).bicim).toBe('hakka')
  })

  it('su: parantezli sesle başlayan ek gelince gövde y alır', () => {
    const [iyelik] = ekle('su', ['POSS.3SG']).parcalar
    expect(iyelik?.govde).toBe('suy')
    expect(aciklamalar(iyelik?.olaylar ?? [])).toEqual([
      'su: y',
      'saklanma: (s)',
      'uyum: kalınlık ve yuvarlaklık kopyalandı',
    ])
    expect(iyelik?.olaylar[0]).toEqual({ tur: 'su', sonuc: 'y', konum: 2, aciklama: 'su: y' })

    expect(ekle('su', ['DAT']).bicim).toBe('suya')
    expect(ekle('su', ['INS']).bicim).toBe('suyla')
    expect(ekle('su', ['LOC']).bicim).toBe('suda')
    expect(ekle('su', ['PROP']).parcalar[0]?.olaylar.filter(govdeOlayiMi)).toEqual([])
  })

  it('-lIk ya da -CIk ile biten türemiş gövdenin k\'si ünlüyle başlayan ekten önce ğ olur', () => {
    const [, iyelik] = ekle('göz', ['LIK', 'POSS.1SG']).parcalar
    expect(iyelik?.govde).toBe('gözlüğ')
    expect(iyelik?.olaylar[0]).toEqual({
      tur: 'yumuşama',
      bakilan: 'k',
      sonuc: 'ğ',
      konum: 5,
      aciklama: 'yumuşama: k→ğ',
    })
    expect(ekle('kulak', ['DIM', 'ACC']).bicim).toBe('kulakçığı')
    expect(ekle('kitap', ['LIK', 'LOC']).bicim).toBe('kitaplıkta')
  })
})

describe('ekle: ince ek', () => {
  it('köke gelen ilk ekin ünlüsü incedir; A hiçbir şey kopyalamaz', () => {
    expect(ekle('saat', ['PL']).parcalar[0]?.olaylar).toEqual([
      {
        tur: 'ince ek',
        birim: 'A',
        arkafonem: 'A',
        bakilan: 'a',
        sonuc: 'e',
        kopyalanan: [],
        konum: 1,
        aciklama: 'ince ek',
      },
    ])
  })

  it('I yine yuvarlaklığı kopyalar', () => {
    const olay = ekle('gol', ['ACC']).parcalar[0]?.olaylar.find((o) => o.tur === 'ince ek')
    expect(olay).toMatchObject({ bakilan: 'o', sonuc: 'ü', kopyalanan: ['yuvarlaklık'] })
  })

  it('ilk ekin bütün ünlüleri incedir; sonraki ekler normal uyumla ilerler', () => {
    const saatleri = ekle('saat', ['POSS.3PL'])
    expect(saatleri.bicim).toBe('saatleri')
    expect(saatleri.parcalar[0]?.olaylar.map((o) => o.tur)).toEqual(['ince ek', 'ince ek'])

    const saatlerde = ekle('saat', ['PL', 'LOC'])
    expect(saatlerde.bicim).toBe('saatlerde')
    expect(aciklamalar(saatlerde.parcalar[1]?.olaylar ?? [])).toEqual(['uyum: kalınlık kopyalandı'])
  })
})

describe('ekle: sözlük işaretleri yalnız köke gelen ilk eke uygulanır', () => {
  it.each([
    ['kitap', ['PL', 'ACC'], 'kitapları'],
    ['ağaç', ['AGT', 'ACC'], 'ağaççıyı'],
    ['ağız', ['PL', 'POSS.1SG'], 'ağızlarım'],
    ['sır', ['PL', 'ACC'], 'sırları'],
    ['su', ['PL', 'ACC'], 'suları'],
    ['su', ['PRIV', 'ACC'], 'susuzu'],
    ['gol', ['POSS.3SG', 'LOC'], 'golünde'],
    ['hayal', ['PL', 'POSS.1SG'], 'hayallerim'],
  ])('%s + %j → %s', (kok, etiketler, beklenen) => {
    expect(ekle(kok, etiketler).bicim).toBe(beklenen)
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

  it('ekle kökü bozmayan biçimi verir; gövde olayı yoktur', () => {
    const sonuc = ekle('pıtak', ['ACC'])
    expect(sonuc.bicim).toBe('pıtakı')
    expect(sonuc.parcalar[0]?.olaylar.filter(govdeOlayiMi)).toEqual([])
  })

  it('olasiBicimler iki biçimi verir; ilki ekle\'ninkidir', () => {
    expect(olasiBicimler('pıtak', ['ACC'])).toEqual(['pıtakı', 'pıtağı'])
    expect(olasiBicimler('pıtak', ['POSS.3SG', 'LOC'])).toEqual(['pıtakında', 'pıtağında'])
    expect(olasiBicimler('dobut', ['ACC'])).toEqual(['dobutu', 'dobudu'])
    expect(olasiBicimler('zeç', ['DAT'])).toEqual(['zeçe', 'zece'])
    expect(olasiBicimler('mip', ['POSS.1SG'])).toEqual(['mipim', 'mibim'])
    expect(olasiBicimler('zonk', ['ACC'])).toEqual(['zonku', 'zongu'])
  })

  it('ünsüzle başlayan ekte, sonu yumuşamayan kökte ve sonraki eklerde tek biçim çıkar', () => {
    expect(olasiBicimler('pıtak', ['LOC'])).toEqual(['pıtakta'])
    expect(olasiBicimler('pıtak', ['PL', 'ACC'])).toEqual(['pıtakları'])
    expect(olasiBicimler('mömüş', ['ACC'])).toEqual(['mömüşü'])
    expect(olasiBicimler('zelü', ['ACC'])).toEqual(['zelüyü'])
  })

  it('türemiş gövdenin yumuşaması uydurma kökte de kategoriktir', () => {
    expect(olasiBicimler('pıtak', ['LIK', 'ACC'])).toEqual(['pıtaklığı'])
    expect(olasiBicimler('fıngıl', ['DIM', 'POSS.1SG'])).toEqual(['fıngılcığım'])
  })

  it('ünlü düşmesi, ikizleşme, ince ek ve su yalnız sözlükte işaretli kökte olur', () => {
    const bosSozluk = kokSozlugunuOku('kok,kategori,yumusama,unlu_dusmesi,istisna\n')
    const uydurmaSay = (kok: string, etiketler: string[]) =>
      ekle(kok, etiketler, { sozluk: bosSozluk }).bicim
    expect(uydurmaSay('burun', ['POSS.1SG'])).toBe('burunum')
    expect(uydurmaSay('sır', ['POSS.1SG'])).toBe('sırım')
    expect(uydurmaSay('saat', ['PL'])).toBe('saatlar')
    expect(uydurmaSay('su', ['POSS.3SG'])).toBe('susu')
    expect(olasiBicimler('kitap', ['ACC'], { sozluk: bosSozluk })).toEqual(['kitapı', 'kitabı'])
  })
})

describe('olasiBicimler', () => {
  it('sözlükteki kökte tek biçim verir', () => {
    expect(olasiBicimler('kitap', ['ACC'])).toEqual(['kitabı'])
    expect(olasiBicimler('top', ['ACC'])).toEqual(['topu'])
    expect(olasiBicimler('ağız', ['POSS.1SG'])).toEqual(['ağzım'])
  })
})

describe('ekle: tutarlılık', () => {
  const satirlar = csvOku(altinTablo, ['kok', 'ekler', 'beklenen', 'kural'])

  it('gövde olayları geri alınınca önceki kelime çıkar; son parça biçimi verir', () => {
    for (const { alanlar } of satirlar) {
      const kok = alanlar.kok ?? ''
      const { bicim, parcalar } = ekle(kok, (alanlar.ekler ?? '').split('+'))
      let kelime = kok
      for (const parca of parcalar) {
        expect(govdeOlaylariniGeriAl(parca)).toBe(kelime)
        kelime = parca.govde + parca.yuzey
      }
      expect(kelime).toBe(bicim)
    }
  })

  it('olayın konumu olayın sonucunu gösterir: gövde olayında gövdede, öteki olayda yüzeyde', () => {
    for (const { alanlar } of satirlar) {
      for (const parca of ekle(alanlar.kok ?? '', (alanlar.ekler ?? '').split('+')).parcalar) {
        for (const olay of parca.olaylar) {
          if (olay.tur === 'saklanma' || olay.tur === 'çoğul tekrarlanmaz') {
            expect(olay.konum).toBeLessThanOrEqual(parca.yuzey.length)
          } else if (olay.tur === 'ünlü düşmesi') {
            expect(olay.konum).toBeLessThan(parca.govde.length)
          } else if (govdeOlayiMi(olay)) {
            expect(parca.govde[olay.konum]).toBe(olay.sonuc)
          } else {
            expect(parca.yuzey[olay.konum]).toBe(olay.sonuc)
          }
        }
      }
    }
  })

  it('gövde olayları ek olaylarından önce gelir', () => {
    for (const { alanlar } of satirlar) {
      for (const parca of ekle(alanlar.kok ?? '', (alanlar.ekler ?? '').split('+')).parcalar) {
        const turler = parca.olaylar.map(govdeOlayiMi)
        expect(turler).toEqual([...turler].sort((a, b) => Number(b) - Number(a)))
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
    expect(ekle('kuş', ['DIM'], { envanter }).bicim).toBe('kuşçuk')
    expect(() => ekle('kuş', ['PL'], { envanter })).toThrow('Bilinmeyen ek etiketi')
  })

  it('verilen sözlükle çalışır', () => {
    const sozluk = kokSozlugunuOku(
      'kok,kategori,yumusama,unlu_dusmesi,istisna\npıtak,uydurma,evet,,\n',
    )
    expect(olasiBicimler('pıtak', ['ACC'], { sozluk })).toEqual(['pıtağı'])
    expect(olasiBicimler('kitap', ['ACC'], { sozluk })).toEqual(['kitapı', 'kitabı'])
  })

  it('Unicode ayrışık yazılmış kökü de tanır', () => {
    expect(ekle('göz'.normalize('NFD'), ['PL']).bicim).toBe('gözler')
  })
})
