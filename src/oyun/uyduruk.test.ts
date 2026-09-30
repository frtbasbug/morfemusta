import { describe, expect, it } from 'vitest'
import { olasiBicimler, uydurmaDenetimi } from '../motor/index.ts'
import { bolgeBul } from './bolgeler.ts'
import { turlar, turunYeri, type Gorev } from './gorevler.ts'
import { ilgiliSesler } from './dukkan.ts'
import {
  UYDURUK_BUYULERI,
  dogruMu,
  kurulanBicim,
  oynananGorev,
  sinirCumlesi,
  uydurukAdimi,
  uydurukBaslangici,
  uydurukIndirgeyici,
  uydurukSiniri,
  type UydurukDurumu,
  type UydurukEylemi,
} from './uyduruk.ts'
import { denemeyiDegerlendir } from './koy.ts'

const GOREVLER = bolgeBul('uyduruk')?.gorevler ?? []
const TURLAR = turlar(GOREVLER)

/** Doğru biçimin yüzeyi: seçeneklerden, motorun kabul ettiği. */
const dogruYuzey = (gorev: Gorev): string => {
  const adim = uydurukAdimi(gorev)
  const dogru = adim.secenekler.find((s) => dogruMu(denemeyiDegerlendir(gorev, adim, s.yuzey)))
  if (!dogru) throw new Error(`${gorev.kok}: doğru seçenek yok`)
  return dogru.yuzey
}

/** Görevin şekli: ek, sınır adımı, kaynaştırma (kök ünlüyle biter), ek başında taş. */
const sekil = (gorev: Gorev) => {
  const adim = uydurukAdimi(gorev)
  return {
    etiket: gorev.etiketler.join('+'),
    sinir: uydurukSiniri(gorev) !== null,
    unluyleBiter: /[aeıioöuü]$/.test(gorev.kok),
    benzesme: adim.parca.olaylar.some((o) => o.tur === 'benzeşme'),
    secenekSayisi: adim.secenekler.length,
  }
}

describe('Uydurukçuklar görev tablosu', () => {
  it('10 tur × 10 görev; sıra bütün tabloda 1–100, turdaki sıra 1–10', () => {
    expect(TURLAR).toHaveLength(10)
    for (const [i, tur] of TURLAR.entries()) {
      expect(tur.map((g) => g.turdakiSira)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(tur.every((g) => g.tur === i + 1)).toBe(true)
    }
    expect(GOREVLER.map((g) => g.sira)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1))
    expect(new Set(GOREVLER.map((g) => g.kok)).size).toBe(100)
  })

  it.each(GOREVLER.map((g) => [g.kok, g] as const))('%s uydurma kök denetiminden geçer', (_kok, g) => {
    expect(uydurmaDenetimi(g.kok)).toBeUndefined()
  })

  it('her turda aynı on görev şekli', () => {
    const ilk = TURLAR[0]?.map(sekil)
    expect(ilk?.map((s) => s.etiket)).toEqual([
      'PL',
      'PL',
      'POSS.1SG',
      'POSS.1SG',
      'LOC',
      'LOC',
      'LOC',
      'DAT',
      'DAT',
      'POSS.1SG',
    ])
    for (const tur of TURLAR) expect(tur.map(sekil)).toEqual(ilk)
  })

  it.each(GOREVLER.map((g) => [g.kok, g.etiketler.join('+'), g] as const))(
    '%s + %s: doğru biçim seçeneklerden kurulur',
    (_kok, _ekler, gorev) => {
      const adim = uydurukAdimi(gorev)
      const yuzey = dogruYuzey(gorev)
      expect(olasiBicimler(gorev.kok, gorev.etiketler)).toContain(adim.parca.govde + yuzey)
      // Tek bir doğru bukalemun var; ötekilerin nedeni var.
      const dogrular = adim.secenekler.filter((s) =>
        dogruMu(denemeyiDegerlendir(gorev, adim, s.yuzey)),
      )
      expect(dogrular).toHaveLength(1)
      // Sınır adımında iki karo da motorun kabul ettiği biçimi kurar.
      const sinir = uydurukSiniri(gorev)
      if (sinir) {
        const bicimler = (['taş', 'jöle'] as const).map((k) => kurulanBicim(gorev, sinir, k).bicim)
        expect(bicimler).toEqual(olasiBicimler(gorev.kok, gorev.etiketler))
      }
    },
  )

  it('seçenekler: LOC dört (da, de, ta, te); benzeşme de sınanır', () => {
    for (const g of GOREVLER.filter((g) => g.etiketler[0] === 'LOC')) {
      expect(uydurukAdimi(g).secenekler.map((s) => s.yuzey).sort()).toHaveLength(4)
    }
    const momus = GOREVLER.find((g) => g.kok === 'mömüş') as Gorev
    expect(uydurukAdimi(momus).secenekler.map((s) => s.yuzey).sort()).toEqual(['da', 'de', 'ta', 'te'])
    expect(GOREVLER.filter((g) => uydurukAdimi(g).secenekler.length === 2).map((g) => g.etiketler[0])).toEqual(
      Array(20).fill('PL'),
    )
  })

  it('seçenekler: PL iki, POSS.1SG, LOC ve DAT dört (DAT: ya, ye, a, e)', () => {
    const [, , , , , , , zelu] = GOREVLER
    expect(zelu?.kok).toBe('zelü')
    expect(
      uydurukAdimi(zelu as Gorev)
        .secenekler.map((s) => s.yuzey)
        .sort(),
    ).toEqual(['a', 'e', 'ya', 'ye'])
  })

  it('doğru bukalemun her yerde durmaz: sabit tohum, karışık yer', () => {
    const yerler = (sayi: number) =>
      new Set(
        GOREVLER.filter((g) => uydurukAdimi(g).secenekler.length === sayi).map((g) =>
          uydurukAdimi(g).secenekler.findIndex((s) => s.yuzey === dogruYuzey(g)),
        ),
      )
    expect(yerler(4).size).toBe(4)
    expect(yerler(2).size).toBe(2)
    // Aynı görev hep aynı sırayı verir.
    const [fingil] = GOREVLER
    expect(uydurukAdimi(fingil as Gorev).secenekler.map((s) => s.yuzey)).toEqual(
      uydurukAdimi(fingil as Gorev).secenekler.map((s) => s.yuzey),
    )
  })
})

describe('turunYeri: bütün tablodaki yerden tur', () => {
  it('kalınan yer turun içindeki yere çevrilir', () => {
    expect(turunYeri(GOREVLER, 0)).toMatchObject({ yer: 0 })
    const ikinci = turunYeri(GOREVLER, 10)
    expect(ikinci.yer).toBe(0)
    expect(ikinci.gorevler[0]?.kok).toBe('pıbız')
    expect(turunYeri(GOREVLER, 13).yer).toBe(3)
    expect(turunYeri(GOREVLER, 999).gorevler[0]?.kok).toBe('fıngıl')
  })
})

describe('Uydurukçuklar: nedenler ve sınır', () => {
  const gorev = (kok: string) => GOREVLER.find((g) => g.kok === kok) as Gorev

  it('zelü + e: kaynaştırma; ilgili iki ses ü ve e', () => {
    const zelu = gorev('zelü')
    const deneme = denemeyiDegerlendir(zelu, uydurukAdimi(zelu), 'e')
    expect(deneme.aday).toBe('zelüe')
    expect(deneme.cumle).toBe('İki ünlü yan yana gelmez: araya y girer.')
    expect(ilgiliSesler(deneme.nedenler[0])).toEqual([3, 4])
  })

  it('mömüş + de: sertleşme; zolku + ta: ünlüden sonra jöle kalır; ilgili iki ses', () => {
    const momus = gorev('mömüş')
    const de = denemeyiDegerlendir(momus, uydurukAdimi(momus), 'de')
    expect(de.cumle).toBe('ş taş, ekin başı da taş olur: t.')
    expect(ilgiliSesler(de.nedenler[0])).toEqual([4, 5])
    const zolku = gorev('zolku')
    const ta = denemeyiDegerlendir(zolku, uydurukAdimi(zolku), 'ta')
    expect(ta.cumle).toBe('Ünlüden sonra ekin başı jöle kalır: d.')
    expect(ilgiliSesler(ta.nedenler[0])).toEqual([4, 5])
  })

  it('kıbı + ye: kalınlık; ilgili iki ses ı ve e', () => {
    const kibi = gorev('kıbı')
    const deneme = denemeyiDegerlendir(kibi, uydurukAdimi(kibi), 'ye')
    expect(deneme.cumle).toBe('ı kalın, e ince. Kalınlıkları uyuşmuyor.')
    expect(ilgiliSesler(deneme.nedenler[0])).toEqual([3, 5])
  })

  it('pıtak + ım: sınır adımı, iki karo da doğru; cümle ve kurulan biçim', () => {
    const pitak = gorev('pıtak')
    expect(uydurukSiniri(pitak)).toMatchObject({ yer: 'gövde', tas: 'k', jole: 'ğ' })
    expect(sinirCumlesi(pitak)).toBe('İkisi de olur: pıtakım, pıtağım.')
    expect(kurulanBicim(pitak, uydurukSiniri(pitak), 'jöle').bicim).toBe('pıtağım')
    expect(kurulanBicim(pitak, uydurukSiniri(pitak), 'taş').bicim).toBe('pıtakım')
    // Sınır adımı yalnız p, ç, t, k ile biten kökte: pobul, mömüş ve kenek (LOC) yok.
    expect(uydurukSiniri(gorev('pobul'))).toBeNull()
    expect(uydurukSiniri(gorev('mömüş'))).toBeNull()
    expect(uydurukSiniri(gorev('kenek'))).toBeNull()
  })

  it('büyüler: çoğalır, cebe girer, yıldız üstünde, yıldız gelir', () => {
    expect(UYDURUK_BUYULERI).toEqual({
      PL: 'çoğalır',
      'POSS.1SG': 'cebe girer',
      LOC: 'yıldız üstünde',
      DAT: 'yıldız gelir',
    })
  })
})

describe('uydurukIndirgeyici', () => {
  const ilkTur = TURLAR[0] ?? []
  const uygula = (durum: UydurukDurumu, ...eylemler: UydurukEylemi[]) =>
    eylemler.reduce(uydurukIndirgeyici, durum)

  it('yanlış bukalemun düşer, neden kalır; doğrusu büyü ve bitti', () => {
    const bas = uydurukBaslangici(ilkTur, 7)
    expect(oynananGorev(bas)?.kok).toBe('zelü')
    const yanlis = uygula(bas, { tur: 'dene', yuzey: 'e' }, { tur: 'dustu' })
    expect(yanlis.evre).toBe('secim')
    expect(yanlis.yanlis?.cumle).toBe('İki ünlü yan yana gelmez: araya y girer.')
    // Yanlışta birleşme olmaz.
    expect(uygula(yanlis, { tur: 'birlesti' })).toBe(yanlis)
    const dogru = uygula(yanlis, { tur: 'dene', yuzey: 'ye' }, { tur: 'birlesti' })
    expect(dogru).toMatchObject({ evre: 'buyu', yanlis: null })
    expect(dogru.kurulan?.bicim).toBe('zelüye')
    const bitti = uygula(dogru, { tur: 'etki' }, { tur: 'bitti' })
    expect(bitti).toMatchObject({ evre: 'bitti', buyu: 'yıldız gelir' })
    expect(uygula(bitti, { tur: 'sonraki' }).gorevYeri).toBe(8)
  })

  it('sınır adımı: doğru bukalemundan sonra tezgâh; seçilen karo biçimi belirler', () => {
    const bas = uydurukBaslangici(ilkTur, 3)
    const sinirda = uygula(bas, { tur: 'dene', yuzey: 'ım' }, { tur: 'birlesti' })
    expect(sinirda).toMatchObject({ evre: 'sinir', kurulan: null })
    expect(uygula(sinirda, { tur: 'karoSec', karo: 'jöle' }).seciliKaro).toBe('jöle')
    const oturdu = uygula(sinirda, { tur: 'karoDene', karo: 'jöle' })
    expect(oturdu).toMatchObject({ evre: 'oturdu', karo: 'jöle' })
    expect(oturdu.kurulan?.bicim).toBe('pıtağım')
    const bitti = uygula(oturdu, { tur: 'buyuye' }, { tur: 'etki' }, { tur: 'bitti' })
    expect(bitti).toMatchObject({ evre: 'bitti', buyu: 'cebe girer' })
    expect(
      uygula(sinirda, { tur: 'karoDene', karo: 'taş' }).kurulan?.bicim,
    ).toBe('pıtakım')
    // Sınır adımı olmayan görevde karo eylemi durumu değiştirmez.
    const pobul = uygula(uydurukBaslangici(ilkTur, 2), { tur: 'dene', yuzey: 'um' }, { tur: 'birlesti' })
    expect(pobul.evre).toBe('buyu')
    expect(uygula(pobul, { tur: 'karoDene', karo: 'taş' })).toBe(pobul)
  })

  it('tur biter: akşam; turda olmayan yer baştan', () => {
    const son = uydurukBaslangici(ilkTur, 9)
    expect(oynananGorev(son)?.kok).toBe('zitep')
    const kapanis = uygula(
      son,
      { tur: 'dene', yuzey: 'im' },
      { tur: 'birlesti' },
      { tur: 'karoDene', karo: 'taş' },
      { tur: 'buyuye' },
      { tur: 'bitti' },
      { tur: 'sonraki' },
    )
    expect(kapanis.evre).toBe('kapanis')
    expect(uydurukBaslangici(ilkTur, 12).gorevYeri).toBe(0)
  })
})
