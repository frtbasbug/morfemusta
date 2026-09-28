import { describe, expect, it } from 'vitest'
import { ekle } from '../motor/index.ts'
import { BUKALEMUN_KOYU_GOREVLERI, type Gorev } from './gorevler.ts'
import {
  adimiKur,
  koyBaslangici,
  koyIndirgeyici,
  oynananGorev,
  type KoyDurumu,
  type KoyEylemi,
} from './koy.ts'

const gorev = (sira: number): Gorev => {
  const bulunan = BUKALEMUN_KOYU_GOREVLERI.find((g) => g.sira === sira)
  if (!bulunan) throw new Error(`${sira}. görev yok`)
  return bulunan
}

const uygula = (durum: KoyDurumu, ...eylemler: KoyEylemi[]) =>
  eylemler.reduce(koyIndirgeyici, durum)

/** Doğru bukalemunu taşır ve büyüyü sonuna kadar oynatır. */
const dogruTasi = (durum: KoyDurumu) =>
  uygula(
    durum,
    { tur: 'dene', yuzey: durum.adim?.parca.yuzey ?? '' },
    { tur: 'birlesti' },
    { tur: 'etki' },
    { tur: 'adimBitti' },
  )

describe('adimiKur', () => {
  it('ilk adım: gövde kökün kendisi; doğru biçim ve parça motordan', () => {
    const adim = adimiKur(gorev(1), 0)
    expect(adim).toMatchObject({
      sira: 0,
      etiket: 'PL',
      govde: 'at',
      oncekiYuzeyler: [],
      bicim: 'atlar',
    })
    expect(adim.parca).toEqual(ekle('at', ['PL']).parcalar[0])
  })

  it('zincirde ikinci adım: gövde toplar, önceki yüzey lar', () => {
    const adim = adimiKur(gorev(10), 1)
    expect(adim).toMatchObject({
      sira: 1,
      etiket: 'POSS.1SG',
      govde: 'toplar',
      oncekiYuzeyler: ['lar'],
      bicim: 'toplarım',
    })
    expect(adim.parca.govde + adim.parca.yuzey).toBe(adim.bicim)
  })

  it('doğru seçenek motorun parçası; ötekiler yüzeyi değişmiş, olaysız kopya', () => {
    const adim = adimiKur(gorev(5), 0)
    for (const secenek of adim.secenekler) {
      if (secenek.yuzey === 'ım') {
        expect(secenek.parca).toBe(adim.parca)
      } else {
        expect(secenek.parca).toEqual({ ...adim.parca, yuzey: secenek.yuzey, olaylar: [] })
      }
    }
  })

  it('sıra karışık ama sabit: her kuruluşta aynı', () => {
    for (const g of BUKALEMUN_KOYU_GOREVLERI) {
      g.etiketler.forEach((_etiket, sira) => {
        const bir = adimiKur(g, sira).secenekler.map((s) => s.yuzey)
        expect(adimiKur(g, sira).secenekler.map((s) => s.yuzey)).toEqual(bir)
      })
    }
  })

  it('doğru bukalemun dört yerin dördüne de düşer; kalın -lAr iki yanda da olur', () => {
    const adimlar = BUKALEMUN_KOYU_GOREVLERI.flatMap((g) =>
      g.etiketler.map((_etiket, sira) => adimiKur(g, sira)),
    )
    const yerler = adimlar.map((a) => a.secenekler.findIndex((s) => s.yuzey === a.parca.yuzey))
    expect(new Set(yerler)).toEqual(new Set([0, 1, 2, 3]))
    const cogullar = adimlar.filter((a) => a.etiket === 'PL')
    expect(new Set(cogullar.map((a) => a.secenekler[0]?.yuzey))).toEqual(new Set(['lar', 'ler']))
    // Dört seçenekli adımların hiçbiri alfabe sırasında kalmaz.
    for (const adim of adimlar.filter((a) => a.secenekler.length === 4)) {
      expect(adim.secenekler.map((s) => s.yuzey)).not.toEqual(['ım', 'im', 'um', 'üm'])
    }
  })

  it('görevde olmayan adım hata verir', () => {
    expect(() => adimiKur(gorev(1), 1)).toThrow('1. görevde 2. ek yok')
  })
})

describe('koyIndirgeyici', () => {
  const baslangic = koyBaslangici(BUKALEMUN_KOYU_GOREVLERI)

  it('başlangıç: 1. görev, seçim evresi, renkli', () => {
    expect(baslangic).toMatchObject({
      gorevYeri: 0,
      evre: 'secim',
      secili: null,
      deneme: null,
      yanlis: null,
      birlesen: null,
      cogaldi: false,
      cepte: false,
      renksiz: false,
    })
    expect(baslangic.adim?.govde).toBe('at')
  })

  it('dokun-dokun: seçer, aynısına dokununca bırakır, başkasına geçer', () => {
    const secili = uygula(baslangic, { tur: 'sec', yuzey: 'lar' })
    expect(secili.secili).toBe('lar')
    expect(uygula(secili, { tur: 'sec', yuzey: 'lar' }).secili).toBeNull()
    expect(uygula(secili, { tur: 'sec', yuzey: 'ler' }).secili).toBe('ler')
    expect(uygula(baslangic, { tur: 'sec', yuzey: 'ım' })).toBe(baslangic)
  })

  it('yanlış taşıma: bukalemun düşer, neden cümlesi kalır', () => {
    const deneme = uygula(baslangic, { tur: 'sec', yuzey: 'ler' }, { tur: 'dene', yuzey: 'ler' })
    expect(deneme).toMatchObject({ evre: 'deneme', secili: null })
    expect(deneme.deneme).toMatchObject({ yuzey: 'ler', aday: 'atler' })
    // Yanlış taşımada büyü olmaz.
    expect(uygula(deneme, { tur: 'birlesti' })).toBe(deneme)

    const dustu = uygula(deneme, { tur: 'dustu' })
    expect(dustu).toMatchObject({ evre: 'secim', deneme: null })
    expect(dustu.yanlis).toMatchObject({
      aday: 'atler',
      cumle: 'a kalın, e ince. Kalınlıkları uyuşmuyor.',
    })
    // Neden yeni seçimde kalır, yeni taşımada silinir.
    expect(uygula(dustu, { tur: 'sec', yuzey: 'lar' }).yanlis).toBe(dustu.yanlis)
    expect(uygula(dustu, { tur: 'dene', yuzey: 'lar' }).yanlis).toBeNull()
  })

  it('doğru taşıma: kelime birleşir, kart üçe çoğalır, görev biter', () => {
    const deneme = uygula(baslangic, { tur: 'dene', yuzey: 'lar' })
    expect(uygula(deneme, { tur: 'dustu' })).toBe(deneme)

    const birlesti = uygula(deneme, { tur: 'birlesti' })
    expect(birlesti.evre).toBe('buyu')
    expect(birlesti.birlesen).toMatchObject({ govde: 'at', yuzey: 'lar' })
    expect(birlesti.cogaldi).toBe(false)

    const etki = uygula(birlesti, { tur: 'etki' })
    expect(etki).toMatchObject({ cogaldi: true, cepte: false })

    const bitti = uygula(etki, { tur: 'adimBitti' })
    expect(bitti.evre).toBe('bitti')
    // Bitince seçim ve taşıma kapalı.
    expect(uygula(bitti, { tur: 'sec', yuzey: 'lar' })).toBe(bitti)
    expect(uygula(bitti, { tur: 'dene', yuzey: 'lar' })).toBe(bitti)

    const sonraki = uygula(bitti, { tur: 'sonraki' })
    expect(sonraki).toMatchObject({ gorevYeri: 1, evre: 'secim', birlesen: null, cogaldi: false })
    expect(sonraki.adim?.govde).toBe('ev')
  })

  it('iyelik: kart cebe girer', () => {
    const kiz = koyBaslangici([gorev(5)])
    const etki = uygula(kiz, { tur: 'dene', yuzey: 'ım' }, { tur: 'birlesti' }, { tur: 'etki' })
    expect(etki).toMatchObject({ cogaldi: false, cepte: true })
  })

  it('renksiz görev: büyüye kadar renksiz, büyüyle renkler döner', () => {
    const gul = koyBaslangici([gorev(9)])
    expect(gul.renksiz).toBe(true)
    const deneme = uygula(gul, { tur: 'dene', yuzey: 'üm' })
    expect(deneme.renksiz).toBe(true)
    expect(uygula(deneme, { tur: 'birlesti' }).renksiz).toBe(false)
    // Yanlış taşıma renkleri getirmez.
    expect(uygula(gul, { tur: 'dene', yuzey: 'um' }, { tur: 'dustu' }).renksiz).toBe(true)
  })

  it('zincirli görev: ilk ek tutunca gövde toplar olur, sonra iyelik', () => {
    const top = koyBaslangici([gorev(10)])
    const ilk = dogruTasi(top)
    expect(ilk).toMatchObject({ evre: 'secim', birlesen: null, cogaldi: true, cepte: false })
    expect(ilk.adim).toMatchObject({ sira: 1, etiket: 'POSS.1SG', govde: 'toplar' })

    const yanlis = uygula(ilk, { tur: 'dene', yuzey: 'im' }, { tur: 'dustu' })
    expect(yanlis.yanlis?.cumle).toBe(
      'a kalın, i ince. Kalınlıkları uyuşmuyor. Bukalemun en yakın ünlüye bakar.',
    )

    const ikinci = dogruTasi(yanlis)
    expect(ikinci).toMatchObject({ evre: 'bitti', cogaldi: true, cepte: true })
    expect(ikinci.birlesen).toMatchObject({ govde: 'toplar', yuzey: 'ım' })
  })

  it('on görev doğru oynanınca kapanış', () => {
    let durum = baslangic
    const kelimeler: string[] = []
    for (let i = 0; i < 10; i++) {
      expect(durum.gorevYeri).toBe(i)
      while (durum.evre !== 'bitti') durum = dogruTasi(durum)
      const { birlesen } = durum
      kelimeler.push(birlesen ? birlesen.govde + birlesen.yuzey : '')
      durum = uygula(durum, { tur: 'sonraki' })
    }
    expect(durum).toMatchObject({ evre: 'kapanis', adim: null, gorevYeri: 10 })
    expect(oynananGorev(durum)).toBeUndefined()
    expect(kelimeler).toEqual(BUKALEMUN_KOYU_GOREVLERI.map((g) => ekle(g.kok, g.etiketler).bicim))
    // Kapanıştan sonra eylemler bir şey değiştirmez.
    expect(uygula(durum, { tur: 'sonraki' })).toBe(durum)
  })

  it('evreye uymayan eylem durumu değiştirmez', () => {
    expect(uygula(baslangic, { tur: 'dustu' })).toBe(baslangic)
    expect(uygula(baslangic, { tur: 'birlesti' })).toBe(baslangic)
    expect(uygula(baslangic, { tur: 'etki' })).toBe(baslangic)
    expect(uygula(baslangic, { tur: 'adimBitti' })).toBe(baslangic)
    expect(uygula(baslangic, { tur: 'sonraki' })).toBe(baslangic)
    const deneme = uygula(baslangic, { tur: 'dene', yuzey: 'lar' })
    expect(uygula(deneme, { tur: 'dene', yuzey: 'ler' })).toBe(deneme)
  })
})
