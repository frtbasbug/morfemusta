// sinirSecenekleri: kök + eklerde çocuğun seçeceği ünsüz sınırları (taş ya da jöle).

import { describe, expect, it } from 'vitest'
import { ekle, sinirSecenekleri, unsuzYuvalari, type Sinir } from './index.ts'

/** Sınırın kısa yazımı: yer, sol_sağ, taş/jöle, doğrular. */
const kisa = ({ yer, sol, sag, tas, jole, dogrular }: Sinir) =>
  `${yer} ${sol}_${sag} ${tas}/${jole} ${dogrular.join('+')}`

const sinirlar = (kok: string, ekler: string) =>
  sinirSecenekleri(kok, ekler.split('+')).map(kisa)

describe('sinirSecenekleri', () => {
  it('gövde sınırı: kök p, ç, t, k ile biter, ek ünlüyle başlar', () => {
    expect(sinirlar('kitap', 'POSS.1SG')).toEqual(['gövde kita_ım p/b jöle'])
    expect(sinirlar('köpek', 'POSS.1SG')).toEqual(['gövde köpe_im k/ğ jöle'])
    expect(sinirlar('ağaç', 'ACC')).toEqual(['gövde ağa_ı ç/c jöle'])
    expect(sinirlar('fıstık', 'ACC')).toEqual(['gövde fıstı_ı k/ğ jöle'])
  })

  it('yumuşamayan kökte doğru karo taş: topum, sütü, sepeti', () => {
    expect(sinirlar('top', 'POSS.1SG')).toEqual(['gövde to_um p/b taş'])
    expect(sinirlar('süt', 'ACC')).toEqual(['gövde sü_ü t/d taş'])
    expect(sinirlar('sepet', 'ACC')).toEqual(['gövde sepe_i t/d taş'])
  })

  it('n\'den sonra k\'nin jölesi g: renk + ACC', () => {
    expect(sinirlar('renk', 'ACC')).toEqual(['gövde ren_i k/g jöle'])
  })

  it('uydurma kökte gövde sınırında iki karo da doğru: pıtakı, pıtağı', () => {
    expect(sinirlar('pıtak', 'ACC')).toEqual(['gövde pıta_ı k/ğ taş+jöle'])
  })

  it('ek başı: D ve C yuvası; sert ünsüzden sonra taş, değilse jöle', () => {
    expect(sinirlar('kitap', 'LOC')).toEqual(['ek başı kitap_a t/d taş'])
    expect(sinirlar('ev', 'LOC')).toEqual(['ek başı ev_e t/d jöle'])
    expect(sinirlar('balık', 'AGT')).toEqual(['ek başı balık_ı ç/c taş'])
    expect(sinirlar('su', 'AGT')).toEqual(['ek başı su_u ç/c jöle'])
    expect(sinirlar('kitap', 'ABL')).toEqual(['ek başı kitap_an t/d taş'])
  })

  it('ünsüzle biten sert olmayan kökte, ünlüyle başlayan ekte sınır yok', () => {
    expect(sinirlar('ev', 'ACC')).toEqual([])
    expect(sinirlar('at', 'PL')).toEqual([])
  })

  it('ikizleşen kökte gövde sınırı yok: hakkı', () => {
    expect(ekle('hak', ['ACC']).bicim).toBe('hakkı')
    expect(sinirlar('hak', 'ACC')).toEqual([])
  })

  it('zincirde her sınır, kelimedeki sırasıyla', () => {
    expect(sinirlar('kitap', 'POSS.1SG+LOC')).toEqual([
      'gövde kita_ımda p/b jöle',
      'ek başı kitabım_a t/d jöle',
    ])
    expect(sinirlar('kitap', 'PL+LOC')).toEqual(['ek başı kitaplar_a t/d jöle'])
  })

  it('zamir n\'den sonraki ek başı: evinde', () => {
    expect(sinirlar('ev', 'POSS.3SG+LOC')).toEqual(['ek başı evin_e t/d jöle'])
  })

  it('asıl karo: gövdede taş, ek başında jöle; yuvanın yeri ve ekin parçası', () => {
    const [govde] = sinirSecenekleri('kitap', ['POSS.1SG'])
    expect(govde).toMatchObject({ asil: 'taş', konum: 4, etiket: 'POSS.1SG', ekSirasi: 0 })
    expect(govde?.parca).toMatchObject({ govde: 'kitab', yuzey: 'ım' })
    const [ekBasi] = sinirSecenekleri('kitap', ['LOC'])
    expect(ekBasi).toMatchObject({ asil: 'jöle', konum: 5, etiket: 'LOC' })
    expect(ekBasi?.parca).toMatchObject({ govde: 'kitap', yuzey: 'ta' })
  })
})

describe('unsuzYuvalari', () => {
  const yuvalar = (kok: string, ekler: string[]) =>
    ekle(kok, ekler).parcalar.map((p) => unsuzYuvalari(p).map((y) => `${y.konum}${y.arkafonem}`))

  it('D ve C yuvaları, ekin yüzeyindeki yerleriyle', () => {
    expect(yuvalar('kitap', ['LOC'])).toEqual([['0D']])
    expect(yuvalar('kedi', ['DIM'])).toEqual([['0C']])
    expect(yuvalar('ev', ['PL', 'ACC'])).toEqual([[], []])
    expect(yuvalar('ev', ['POSS.3SG', 'ABL'])).toEqual([[], ['1D']])
    expect(yuvalar('ev', ['PL', 'POSS.3PL', 'LOC'])).toEqual([[], [], ['1D']])
  })
})
