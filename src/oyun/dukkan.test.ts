// Fıstıkçı Şahap'ın Dükkânı: görev tablosu (icerik/gorevler/fistikci-sahap.csv) ve oyunun
// durumu. Tablo yalnız kullanıcının onayıyla değişir; testi geçirmek için tabloya dokunulmaz.
// Doğru karo görev dosyasında yazılı değildir, motordan gelir.

import { describe, expect, it } from 'vitest'
import { KOK_SOZLUGU, ekle, olasiBicimler } from '../motor/index.ts'
import { bolgeBul } from './bolgeler.ts'
import {
  TEZGAH,
  denemeyiDegerlendir,
  dogruMu,
  dukkanBaslangici,
  dukkanIndirgeyici,
  gorevinSiniri,
  karoHarfi,
  raftakiler,
  sesDegisti,
  type DukkanDurumu,
  type DukkanEylemi,
} from './dukkan.ts'
import type { Gorev } from './gorevler.ts'

const gorevler = bolgeBul('dukkan')?.gorevler ?? []

describe('Fıstıkçı Şahap\'ın Dükkânı görevleri', () => {
  it('on görev, 1\'den 10\'a sırayla; hepsi renkli', () => {
    expect(gorevler.map((g) => g.sira)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(gorevler.some((g) => g.renksiz)).toBe(false)
  })

  it('kökler sözlükte (uydurma değil)', () => {
    for (const { kok } of gorevler) expect(KOK_SOZLUGU.has(kok), kok).toBe(true)
  })

  it.each(gorevler)('$sira. görev ($kok + $etiketler): tam bir sınır, tam bir doğru karo', (gorev) => {
    const sinir = gorevinSiniri(gorev)
    expect(sinir.dogrular).toHaveLength(1)
    const dogrular = TEZGAH.filter((karo) => dogruMu(denemeyiDegerlendir(gorev, sinir, karo)))
    expect(dogrular).toEqual(sinir.dogrular)
    // Doğru karoyla kurulan kelime motorun biçimidir.
    const [karo] = dogrular
    if (!karo) throw new Error('doğru karo yok')
    const { aday } = denemeyiDegerlendir(gorev, sinir, karo)
    expect(aday).toBe(ekle(gorev.kok, gorev.etiketler).bicim)
    expect(olasiBicimler(gorev.kok, gorev.etiketler)).toEqual([aday])
  })

  it('sınırlar, doğru karolar ve kelimeler', () => {
    const ozet = gorevler.map((gorev) => {
      const sinir = gorevinSiniri(gorev)
      const [karo] = sinir.dogrular
      return `${sinir.yer} ${sinir.sol}_${sinir.sag} ${karo} ${ekle(gorev.kok, gorev.etiketler).bicim}`
    })
    expect(ozet).toEqual([
      'gövde kita_ım jöle kitabım',
      'gövde köpe_im jöle köpeğim',
      'gövde ağa_ı jöle ağacı',
      'gövde to_um taş topum',
      'gövde sü_ü taş sütü',
      'ek başı kitap_a taş kitapta',
      'ek başı ev_e jöle evde',
      'ek başı balık_ı taş balıkçı',
      'gövde fıstı_ı jöle fıstığı',
      'ek başı fıstık_ı taş fıstıkçı',
    ])
  })

  it('her yanlış karonun nedeni ve cümlesi var (diğer yok)', () => {
    const cumleler = gorevler.map((gorev) => {
      const sinir = gorevinSiniri(gorev)
      const yanlis = TEZGAH.find((karo) => !sinir.dogrular.includes(karo))
      if (!yanlis) throw new Error('yanlış karo yok')
      const deneme = denemeyiDegerlendir(gorev, sinir, yanlis)
      expect(deneme.nedenler[0]?.tur, deneme.aday).not.toBe('diğer')
      return `${deneme.aday}: ${deneme.cumle}`
    })
    expect(cumleler).toEqual([
      'kitapım: p ünlüden önce jöle olur: b.',
      'köpekim: k ünlüden önce jöle olur: ğ.',
      'ağaçı: ç ünlüden önce jöle olur: c.',
      'tobum: top inatçı: p taş kalır.',
      'südü: süt inatçı: t taş kalır.',
      'kitapda: p taş, ekin başı da taş olur: t.',
      'evte: v jöle, ekin başı da jöle kalır: d.',
      'balıkcı: k taş, ekin başı da taş olur: ç.',
      'fıstıkı: k ünlüden önce jöle olur: ğ.',
      'fıstıkcı: k taş, ekin başı da taş olur: ç.',
    ])
  })

  it('ses değişimi: yumuşamada ve benzeşmede var; topum ve evde\'de yok', () => {
    const degisenler = gorevler.map((gorev) => {
      const sinir = gorevinSiniri(gorev)
      const [karo] = sinir.dogrular
      return karo ? sesDegisti(sinir, karo) : undefined
    })
    expect(degisenler).toEqual([true, true, true, false, false, true, false, true, true, true])
  })
})

describe('gorevinSiniri', () => {
  const gorev = (kok: string, etiketler: string[]): Gorev => ({ sira: 1, kok, etiketler, renksiz: false })

  it('sınırı olmayan ya da birden çok sınırı olan görev hata verir', () => {
    expect(() => gorevinSiniri(gorev('ev', ['PL']))).toThrow('tam bir ünsüz sınırı olmalı; 0 sınır')
    expect(() => gorevinSiniri(gorev('kitap', ['POSS.1SG', 'LOC']))).toThrow('2 sınır')
  })

  it('ilgili iki ses: gövdede seçilen ünsüz ve ünlü; ek başında önceki ses ve seçilen', () => {
    const kitabim = gorev('kitap', ['POSS.1SG'])
    expect(denemeyiDegerlendir(kitabim, gorevinSiniri(kitabim), 'taş').ilgili).toEqual([4, 5])
    const kitapta = gorev('kitap', ['LOC'])
    expect(denemeyiDegerlendir(kitapta, gorevinSiniri(kitapta), 'jöle').ilgili).toEqual([4, 5])
    expect(denemeyiDegerlendir(kitapta, gorevinSiniri(kitapta), 'taş').ilgili).toBeNull()
  })

  it('karonun harfi', () => {
    const sinir = gorevinSiniri(gorev('ağaç', ['ACC']))
    expect([karoHarfi(sinir, 'taş'), karoHarfi(sinir, 'jöle')]).toEqual(['ç', 'c'])
  })
})

describe('dukkanIndirgeyici', () => {
  const oyna = (durum: DukkanDurumu, ...eylemler: DukkanEylemi[]) =>
    eylemler.reduce(dukkanIndirgeyici, durum)

  it('başlangıç: ilk görev, seçimde; geçersiz yer baştan başlar', () => {
    const durum = dukkanBaslangici(gorevler)
    expect(durum).toMatchObject({ gorevYeri: 0, evre: 'secim', secili: null, yanlis: null })
    expect(durum.sinir?.sol).toBe('kita')
    expect(dukkanBaslangici(gorevler, 4).gorevYeri).toBe(4)
    expect(dukkanBaslangici(gorevler, 10).gorevYeri).toBe(0)
    expect(dukkanBaslangici(gorevler, -1).gorevYeri).toBe(0)
  })

  it('seç: karo seçilir, ikinci kez bırakılır', () => {
    const bas = dukkanBaslangici(gorevler)
    expect(oyna(bas, { tur: 'sec', karo: 'taş' }).secili).toBe('taş')
    expect(oyna(bas, { tur: 'sec', karo: 'taş' }, { tur: 'sec', karo: 'taş' }).secili).toBeNull()
  })

  it('yanlış: deneme, sekti; neden kalır, yeni denemeyle silinir', () => {
    const bas = dukkanBaslangici(gorevler)
    const sekti = oyna(bas, { tur: 'dene', karo: 'taş' }, { tur: 'sekti' })
    expect(sekti.evre).toBe('secim')
    expect(sekti.yanlis?.cumle).toBe('p ünlüden önce jöle olur: b.')
    // Yanlış denemede oturma olmaz.
    expect(oyna(bas, { tur: 'dene', karo: 'taş' }, { tur: 'oturdu' }).evre).toBe('deneme')
    expect(oyna(sekti, { tur: 'dene', karo: 'jöle' }).yanlis).toBeNull()
  })

  it('doğru: oturdu, rafa, sonraki; raf dolar', () => {
    const bas = dukkanBaslangici(gorevler)
    const oturdu = oyna(bas, { tur: 'dene', karo: 'jöle' }, { tur: 'oturdu' })
    expect(oturdu.evre).toBe('oturdu')
    expect(oturdu.oturan?.aday).toBe('kitabım')
    expect(oyna(oturdu, { tur: 'sekti' })).toBe(oturdu)
    expect(raftakiler(oturdu)).toEqual([])
    const bitti = oyna(oturdu, { tur: 'rafa' })
    expect(bitti.evre).toBe('bitti')
    expect(raftakiler(bitti)).toEqual(['kitabım'])
    const sonraki = oyna(bitti, { tur: 'sonraki' })
    expect(sonraki).toMatchObject({ gorevYeri: 1, evre: 'secim', oturan: null })
    expect(raftakiler(sonraki)).toEqual(['kitabım'])
  })

  it('on görev bitince kapanış', () => {
    let durum = dukkanBaslangici(gorevler)
    for (const gorev of gorevler) {
      const [karo] = gorevinSiniri(gorev).dogrular
      if (!karo) throw new Error('doğru karo yok')
      durum = oyna(durum, { tur: 'dene', karo }, { tur: 'oturdu' }, { tur: 'rafa' })
      expect(raftakiler(durum)).toHaveLength(gorev.sira)
      durum = oyna(durum, { tur: 'sonraki' })
    }
    expect(durum).toMatchObject({ evre: 'kapanis', sinir: null, gorevYeri: 10 })
    expect(oyna(durum, { tur: 'dene', karo: 'taş' })).toBe(durum)
  })

  it('seçim dışında seçim ve deneme yok', () => {
    const deneme = oyna(dukkanBaslangici(gorevler), { tur: 'dene', karo: 'jöle' })
    expect(oyna(deneme, { tur: 'sec', karo: 'taş' })).toBe(deneme)
    expect(oyna(deneme, { tur: 'dene', karo: 'taş' })).toBe(deneme)
    expect(oyna(deneme, { tur: 'sonraki' })).toBe(deneme)
  })
})
