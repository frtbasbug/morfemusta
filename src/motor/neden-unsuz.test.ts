// Ünsüz neden tablosu: tests/neden-unsuz.csv. Her satır ayrı bir testtir. Tablo yalnız
// kullanıcının onayıyla değişir; testi geçirmek için tabloya dokunulmaz.
//
// Aday, gövde ile seçilen yüzeyin art arda yazılmasıdır (kitab + ım). neden sütunu boşsa aday
// doğrudur. Değilse öğeler ; ile ayrılır: GÖVDE:yumuşama, GÖVDE:inatçı, GÖVDE:yumuşamaz,
// ETİKET:sertleşme, ETİKET:yumuşak (neden-yazimi.ts).

import { describe, expect, it } from 'vitest'
import unsuzTablosu from '../../tests/neden-unsuz.csv?raw'
import { csvOku } from './csv.ts'
import { neden, nedenCumlesi, olasiBicimler, type Neden } from './index.ts'
import { nedenYazimi } from './neden-yazimi.ts'

const satirlar = csvOku(unsuzTablosu, ['kok', 'ekler', 'govde', 'parca', 'aday', 'neden']).map(
  ({ satirNo, alanlar }) => ({
    satirNo,
    kok: alanlar.kok ?? '',
    ekler: alanlar.ekler ?? '',
    govde: alanlar.govde ?? '',
    parca: alanlar.parca ?? '',
    aday: alanlar.aday ?? '',
    neden: alanlar.neden ?? '',
  }),
)

const tablodaki = (nedenler: readonly Neden[]) => nedenler.map(nedenYazimi).join(';')

describe('ünsüz neden tablosu', () => {
  it('tabloda 30 satır var', () => {
    expect(satirlar).toHaveLength(30)
  })

  it.each(satirlar)(
    'satır $satirNo: $govde + $parca → $aday: "$neden"',
    ({ kok, ekler, govde, parca, aday, neden: beklenen }) => {
      const etiketler = ekler.split('+')
      const secilenler = parca.split('+')
      expect(govde + secilenler.join('')).toBe(aday)
      const nedenler = neden(kok, etiketler, secilenler, govde)
      expect(tablodaki(nedenler)).toBe(beklenen)
      // Neden yoksa aday motorun kabul ettiği biçimlerdendir; varsa değildir.
      expect(olasiBicimler(kok, etiketler).includes(aday)).toBe(nedenler.length === 0)
    },
  )
})

describe('neden: gövde ve ek başı', () => {
  it('gövde nedeni: kök, taş ve jöle, seçilen karo ve adaydaki yeri', () => {
    expect(neden('kitap', ['POSS.1SG'], ['ım'])).toEqual([
      {
        tur: 'gövde',
        ad: 'yumuşama',
        kok: 'kitap',
        tas: 'p',
        jole: 'b',
        secilen: 'taş',
        secilenKonumu: 4,
      },
    ])
    expect(neden('top', ['POSS.1SG'], ['um'], 'tob')[0]).toMatchObject({
      ad: 'inatçı',
      secilen: 'jöle',
      secilenKonumu: 2,
    })
  })

  it('ek başı nedeni: bakılan ses, beklenen ve seçilen harf, yerleri', () => {
    expect(neden('kitap', ['LOC'], ['da'])).toEqual([
      {
        tur: 'ek başı',
        ad: 'sertleşme',
        etiket: 'LOC',
        bakilan: 'p',
        bakilanKonumu: 4,
        beklenen: 't',
        secilen: 'd',
        secilenKonumu: 5,
      },
    ])
  })

  it('n\'den sonra k, g olur: rengi', () => {
    expect(tablodaki(neden('renk', ['ACC'], ['i'], 'reng'))).toBe('')
    expect(neden('renk', ['ACC'], ['i'])[0]).toMatchObject({ ad: 'yumuşama', jole: 'g' })
  })

  it('sırayla: gövde, ek başı, ünlü uyumu', () => {
    // kitap + PL + LOC: gövde sınırı yok; ek başı (ler + ta) önce, uyum sonra (ler, sonra
    // ta'nın a'sı e'ye bakar).
    expect(tablodaki(neden('kitap', ['PL', 'LOC'], ['ler', 'ta']))).toBe(
      'LOC:yumuşak;PL:kalınlık;LOC:kalınlık',
    )
    // kitap + POSS.1SG: gövde önce, uyum sonra.
    expect(tablodaki(neden('kitap', ['POSS.1SG'], ['im']))).toBe(
      'GÖVDE:yumuşama;POSS.1SG:kalınlık',
    )
    // Ek başının ünlüsü de ayrıca sınanır: kitapde.
    expect(tablodaki(neden('kitap', ['LOC'], ['de']))).toBe('LOC:sertleşme;LOC:kalınlık')
  })

  it('ek başı yereldir: adayda önceki sese bakar', () => {
    // kitapım + da: önceki ses m, jöle kalır; gövde yine yumuşamalıydı.
    expect(tablodaki(neden('kitap', ['POSS.1SG', 'LOC'], ['ım', 'da']))).toBe('GÖVDE:yumuşama')
    expect(tablodaki(neden('kitap', ['POSS.1SG', 'LOC'], ['ım', 'da'], 'kitab'))).toBe('')
  })

  it('uydurma kökte gövde sınırında iki karo da doğrudur, ek başı kurala bağlıdır', () => {
    expect(neden('pıtak', ['ACC'], ['ı'])).toEqual([])
    expect(neden('pıtak', ['ACC'], ['ı'], 'pıtağ')).toEqual([])
    expect(tablodaki(neden('pıtak', ['LOC'], ['da']))).toBe('LOC:sertleşme')
  })

  it('gövde kök ya da yumuşamış hâli olur; başka gövde hata verir', () => {
    expect(() => neden('kitap', ['POSS.1SG'], ['ım'], 'kitab')).not.toThrow()
    expect(() => neden('kitap', ['POSS.1SG'], ['ım'], 'kitad')).toThrow(
      '"kitad", kitap + POSS.1SG için gövde olamaz: kitap ya da kitab',
    )
    // Gövde sınırı yoksa gövde değişmez: kitab + da.
    expect(() => neden('kitap', ['LOC'], ['da'], 'kitab')).toThrow('gövde olamaz: kitap')
    expect(() => neden('ev', ['PL'], ['ler'], 'eb')).toThrow('gövde olamaz: ev')
  })

  it('ek başında yalnız taş ya da jöle: öteki harf kılık değildir', () => {
    expect(() => neden('kitap', ['LOC'], ['ka'])).toThrow('kılıklarından biri değil')
    expect(() => neden('balık', ['AGT'], ['şı'])).toThrow('çı, cı')
  })

  it('gövde NFC\'ye çevrilir', () => {
    expect(neden('köpek', ['POSS.1SG'], ['im'], 'köpeğ'.normalize('NFD'))).toEqual([])
  })
})

describe('nedenCumlesi: gövde ve ek başı', () => {
  const cumle = (kok: string, ekler: string, parca: string, govde = kok) =>
    nedenCumlesi(neden(kok, ekler.split('+'), parca.split('+'), govde))

  it('yumuşama: Ek ünlüyle başlayınca p yumuşar: b olur.', () => {
    expect(cumle('kitap', 'POSS.1SG', 'ım')).toBe('Ek ünlüyle başlayınca p yumuşar: b olur.')
    expect(cumle('köpek', 'POSS.1SG', 'im')).toBe('Ek ünlüyle başlayınca k yumuşar: ğ olur.')
    expect(cumle('ağaç', 'ACC', 'ı')).toBe('Ek ünlüyle başlayınca ç yumuşar: c olur.')
  })

  it('inatçı: top inatçıdır: p yumuşamaz.', () => {
    expect(cumle('top', 'POSS.1SG', 'um', 'tob')).toBe('top inatçıdır: p yumuşamaz.')
    expect(cumle('süt', 'ACC', 'ü', 'süd')).toBe('süt inatçıdır: t yumuşamaz.')
  })

  it('yumuşamaz: sepet kelimesinde t yumuşamaz.', () => {
    expect(cumle('sepet', 'ACC', 'i', 'seped')).toBe('sepet kelimesinde t yumuşamaz.')
  })

  it('sertleşme: p sert, ekin başı da sert olur: t.', () => {
    expect(cumle('kitap', 'LOC', 'da')).toBe('p sert, ekin başı da sert olur: t.')
    expect(cumle('balık', 'AGT', 'cı')).toBe('k sert, ekin başı da sert olur: ç.')
  })

  it('yumuşak: v yumuşak, ekin başı da yumuşak kalır: d.', () => {
    expect(cumle('ev', 'LOC', 'te')).toBe('v yumuşak, ekin başı da yumuşak kalır: d.')
  })

  it('yumuşak, kökün sonu ünlüyse: Ünlüden sonra ekin başı yumuşak kalır: c.', () => {
    expect(cumle('su', 'AGT', 'çu')).toBe('Ünlüden sonra ekin başı yumuşak kalır: c.')
  })

  it('yalnız ilk neden: gövde, uyumdan önce', () => {
    expect(cumle('kitap', 'POSS.1SG', 'im')).toBe('Ek ünlüyle başlayınca p yumuşar: b olur.')
  })

  it('tablodaki her nedenin bir cümlesi var', () => {
    for (const s of satirlar.filter((s) => s.neden !== '')) {
      expect(cumle(s.kok, s.ekler, s.parca, s.govde), s.aday).not.toBe('')
    }
  })
})
