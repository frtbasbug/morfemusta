import { describe, expect, it } from 'vitest'
import { UNLULER as MOTORUN_UNLULERI, type Unlu, type UnluOzellikleri } from '../motor/index.ts'
import cizimKaynagi from './cizim.ts?raw'
import { BUKALEMUN, UNLU, UNLULER, bukalemunCizimi, unluCizimi } from './cizim.ts'

type Nokta = readonly [number, number]

/** SVG yayı (dönme 0), uç noktalardan merkeze çevrilip örneklenir (SVG 1.1, F.6.5). */
function yayNoktalari(
  [x1, y1]: Nokta,
  [rx0, ry0]: Nokta,
  buyukYay: boolean,
  saatYonu: boolean,
  [x2, y2]: Nokta,
): Nokta[] {
  const x1p = (x1 - x2) / 2
  const y1p = (y1 - y2) / 2
  const olcek = Math.max(1, Math.sqrt(x1p ** 2 / rx0 ** 2 + y1p ** 2 / ry0 ** 2))
  const rx = rx0 * olcek
  const ry = ry0 * olcek
  const pay = rx ** 2 * ry ** 2 - rx ** 2 * y1p ** 2 - ry ** 2 * x1p ** 2
  const payda = rx ** 2 * y1p ** 2 + ry ** 2 * x1p ** 2
  const k = (buyukYay !== saatYonu ? 1 : -1) * Math.sqrt(Math.max(0, pay / payda))
  const cxp = (k * rx * y1p) / ry
  const cyp = (-k * ry * x1p) / rx
  const cx = cxp + (x1 + x2) / 2
  const cy = cyp + (y1 + y2) / 2
  const aci = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
  const ux = (x1p - cxp) / rx
  const uy = (y1p - cyp) / ry
  const bas = aci(1, 0, ux, uy)
  let fark = aci(ux, uy, (-x1p - cxp) / rx, (-y1p - cyp) / ry)
  if (!saatYonu && fark > 0) fark -= 2 * Math.PI
  if (saatYonu && fark < 0) fark += 2 * Math.PI
  return Array.from({ length: 65 }, (_, j) => {
    const t = bas + (fark * j) / 64
    return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)] as const
  })
}

/** Yolun noktaları: M, L, H, V, Q, A, Z (mutlak) komutları; eğriler örneklenir. */
function yolNoktalari(yol: string): Nokta[] {
  const simgeler = yol.match(/[A-Z]|-?\d*\.?\d+/g) ?? []
  let i = 0
  const sayi = () => {
    const simge = simgeler[i++]
    const deger = Number(simge)
    if (simge === undefined || Number.isNaN(deger)) throw new Error(`Yolda sayı bekleniyordu: ${yol}`)
    return deger
  }
  const noktalar: Nokta[] = []
  let simdiki: Nokta = [0, 0]
  let baslangic: Nokta = [0, 0]
  while (i < simgeler.length) {
    const komut = simgeler[i++]
    switch (komut) {
      case 'M':
        simdiki = baslangic = [sayi(), sayi()]
        noktalar.push(simdiki)
        break
      case 'L':
        simdiki = [sayi(), sayi()]
        noktalar.push(simdiki)
        break
      case 'H':
        simdiki = [sayi(), simdiki[1]]
        noktalar.push(simdiki)
        break
      case 'V':
        simdiki = [simdiki[0], sayi()]
        noktalar.push(simdiki)
        break
      case 'Q': {
        const [x0, y0] = simdiki
        const [kx, ky] = [sayi(), sayi()]
        const [x, y] = [sayi(), sayi()]
        for (let j = 1; j <= 64; j++) {
          const t = j / 64
          noktalar.push([
            (1 - t) ** 2 * x0 + 2 * (1 - t) * t * kx + t ** 2 * x,
            (1 - t) ** 2 * y0 + 2 * (1 - t) * t * ky + t ** 2 * y,
          ])
        }
        simdiki = [x, y]
        break
      }
      case 'A': {
        const yaricap: Nokta = [sayi(), sayi()]
        if (sayi() !== 0) throw new Error('Dönmeli yay beklenmiyor')
        const buyukYay = sayi() === 1
        const saatYonu = sayi() === 1
        const bitis: Nokta = [sayi(), sayi()]
        noktalar.push(...yayNoktalari(simdiki, yaricap, buyukYay, saatYonu, bitis))
        simdiki = bitis
        break
      }
      case 'Z':
        simdiki = baslangic
        break
      default:
        throw new Error(`Beklenmeyen yol komutu "${komut}": ${yol}`)
    }
  }
  return noktalar
}

/** Yolun sınır kutusu. */
function kutu(yol: string) {
  const noktalar = yolNoktalari(yol)
  const xler = noktalar.map(([x]) => x)
  const yler = noktalar.map(([, y]) => y)
  const [sol, sag, ust, alt] = [Math.min(...xler), Math.max(...xler), Math.min(...yler), Math.max(...yler)]
  return { sol, sag, ust, alt, en: sag - sol, boy: alt - ust }
}

const OZELLIKLER = Object.entries(UNLULER) as [Unlu, UnluOzellikleri][]

describe('sekiz ünlünün özellik tablosu', () => {
  it('DESIGN.md\'deki tablodur: kalın/ince, düz/yuvarlak, geniş/dar', () => {
    expect(UNLULER).toEqual({
      a: { kalin: true, yuvarlak: false, genis: true },
      ı: { kalin: true, yuvarlak: false, genis: false },
      o: { kalin: true, yuvarlak: true, genis: true },
      u: { kalin: true, yuvarlak: true, genis: false },
      e: { kalin: false, yuvarlak: false, genis: true },
      i: { kalin: false, yuvarlak: false, genis: false },
      ö: { kalin: false, yuvarlak: true, genis: true },
      ü: { kalin: false, yuvarlak: true, genis: false },
    })
  })

  it('motorun tablosunun aynısıdır', () => {
    expect(UNLULER).toEqual(MOTORUN_UNLULERI)
  })

  it('üç ikili özelliğin sekiz bileşiminin her biri tek bir ünlüdür', () => {
    const bilesimler = OZELLIKLER.map(([, o]) => `${o.kalin}-${o.yuvarlak}-${o.genis}`)
    expect(new Set(bilesimler).size).toBe(8)
  })
})

describe('çizimler', () => {
  it.each(OZELLIKLER)('%s: iki çizimde de NaN ya da sonsuz sayı yok', (_unlu, ozellikler) => {
    for (const cizim of [unluCizimi(ozellikler), bukalemunCizimi(ozellikler)]) {
      const metin = JSON.stringify(cizim)
      expect(metin).not.toMatch(/NaN|Infinity|null|undefined/)
      for (const sayi of metin.match(/-?\d*\.?\d+/g) ?? []) {
        expect(Number.isFinite(Number(sayi))).toBe(true)
      }
      for (const yol of Object.values(cizim).filter((d): d is string => typeof d === 'string')) {
        expect(yolNoktalari(yol).length).toBeGreaterThan(0)
      }
    }
  })

  it.each(OZELLIKLER)('%s: çizim kutusunun içinde kalır, çizgi kalınlıklarıyla', (_unlu, oz) => {
    const icinde = (yol: string, yariCizgi: number, en: number, boy: number) => {
      const k = kutu(yol)
      expect(k.sol - yariCizgi).toBeGreaterThanOrEqual(0)
      expect(k.ust - yariCizgi).toBeGreaterThanOrEqual(0)
      expect(k.sag + yariCizgi).toBeLessThanOrEqual(en)
      expect(k.alt + yariCizgi).toBeLessThanOrEqual(boy)
    }
    const unlu = unluCizimi(oz)
    icinde(unlu.govde, 1.5, UNLU.en, UNLU.boy)
    icinde(unlu.agiz, 0, UNLU.en, UNLU.boy)

    const bukalemun = bukalemunCizimi(oz)
    icinde(bukalemun.govde, 1.5, BUKALEMUN.en, BUKALEMUN.boy)
    icinde(bukalemun.ibik, 1.25, BUKALEMUN.en, BUKALEMUN.boy)
    // Kuyruk ve bacaklar 11'lik mürekkep çizginin ortasındadır.
    icinde(bukalemun.kuyruk, 5.5, BUKALEMUN.en, BUKALEMUN.boy)
    icinde(bukalemun.bacaklar, 5.5, BUKALEMUN.en, BUKALEMUN.boy)
    icinde(bukalemun.agiz, 0, BUKALEMUN.en, BUKALEMUN.boy)
    const { x, y, r } = bukalemun.goz
    expect(x - r - 1.5).toBeGreaterThanOrEqual(0)
    expect(y - r - 1.5).toBeGreaterThanOrEqual(0)
  })

  it('kalın ünlünün gövdesi inceden geniştir: 58 ve 34; boyları 56', () => {
    for (const [, oz] of OZELLIKLER.filter(([, o]) => o.kalin)) {
      const kalin = kutu(unluCizimi(oz).govde)
      const ince = kutu(unluCizimi({ ...oz, kalin: false }).govde)
      expect(kalin.en).toBeGreaterThan(ince.en)
      expect(kalin.en).toBeCloseTo(58, 1)
      expect(ince.en).toBeCloseTo(34, 1)
      expect(kalin.boy).toBeCloseTo(56, 1)
      expect(ince.boy).toBeCloseTo(56, 1)
    }
  })

  it('kalın bukalemun inceden kalındır: boyu 54 ve 38; eni hep 92', () => {
    for (const [, oz] of OZELLIKLER.filter(([, o]) => o.kalin)) {
      const kalin = kutu(bukalemunCizimi(oz).govde)
      const ince = kutu(bukalemunCizimi({ ...oz, kalin: false }).govde)
      expect(kalin.boy).toBeCloseTo(54, 1)
      expect(ince.boy).toBeCloseTo(38, 1)
      expect(kalin.en).toBeCloseTo(92, 1)
      expect(ince.en).toBeCloseTo(92, 1)
    }
  })

  it('düz ve yuvarlak gövde yolları farklıdır; biçimi yalnız yuvarlaklık seçer', () => {
    for (const [, oz] of OZELLIKLER.filter(([, o]) => !o.yuvarlak)) {
      const yuvarlak = { ...oz, yuvarlak: true }
      expect(unluCizimi(oz).govde).not.toBe(unluCizimi(yuvarlak).govde)
      expect(bukalemunCizimi(oz).govde).not.toBe(bukalemunCizimi(yuvarlak).govde)
      // Düz gövde yay köşeli dikdörtgendir (H ve V çizgileri), yuvarlak gövde elips.
      expect(unluCizimi(oz).govde).toMatch(/H.*V/)
      expect(unluCizimi(yuvarlak).govde).not.toMatch(/[HV]/)
      // Genişlik/darlık gövdeyi değiştirmez, yalnız ağzı.
      const oteki = { ...oz, genis: !oz.genis }
      expect(unluCizimi(oteki).govde).toBe(unluCizimi(oz).govde)
      expect(unluCizimi(oteki).agiz).not.toBe(unluCizimi(oz).agiz)
    }
  })

  it('geniş ünlünün ağzı açık yarım ay, darınki ince yarıktır', () => {
    const genis = kutu(unluCizimi(UNLULER.a).agiz)
    const dar = kutu(unluCizimi(UNLULER.ı).agiz)
    expect(genis.boy).toBeCloseTo(9, 1)
    expect(dar.boy).toBeCloseTo(3, 1)
  })
})

describe('tuvaldeki sayılar', () => {
  // Başvuru kodunun çıktısı; sayılar ve yollar değiştirilmez.
  it('a ünlüsü', () => {
    expect(unluCizimi(UNLULER.a)).toEqual({
      govde: 'M14 12H58A7 7 0 0 1 65 19V61A7 7 0 0 1 58 68H14A7 7 0 0 1 7 61V19A7 7 0 0 1 14 12Z',
      gozX: [24.4, 47.6],
      gozY: 33,
      bebekY: 33.8,
      yanakX: [16.9, 55.1],
      yanakY: 45,
      agiz: 'M20.9 48Q36 66 51.1 48Z',
    })
  })

  it('ü bukalemunu', () => {
    expect(bukalemunCizimi(UNLULER.ü)).toEqual({
      govde: 'M12 49A46 19 0 1 0 104 49A46 19 0 1 0 12 49Z',
      ibik:
        'M46.9 32.6L50.4 24.3L53.9 32.1ZM55.7 32L59.2 24L62.7 32.1ZM64.5 32.2L68 24.5L71.5 32.8Z' +
        'M73.3 33.1L76.8 25.7L80.3 34.4ZM82.1 34.8L85.6 27.8L89.1 37Z',
      bacaklar: 'M39.6 62.4V76M76.4 62.4V76',
      kuyruk:
        'M98 51L112 51L114.2 51.5L116.2 52.5L117.8 54L119 55.7L119.6 57.7L119.8 59.7L119.4 61.6' +
        'L118.6 63.4L117.4 64.8L115.9 65.8L114.2 66.4L112.5 66.5L110.9 66.3L109.4 65.6L108.2 64.6' +
        'L107.3 63.4L106.8 62L106.7 60.6L106.9 59.3L107.4 58.1L108.2 57.1L109.2 56.4L110.3 56' +
        'L111.4 55.9L112.4 56.1L113.3 56.5L114 57.1L114.5 57.8L114.8 58.6L114.9 59.4L114.7 60.2' +
        'L114.4 60.8',
      agiz: 'M16.8 52.9H27.8A1.4 1.4 0 0 1 27.8 55.7H16.8A1.4 1.4 0 0 1 16.8 52.9Z',
      goz: { x: 33, y: 36.1, r: 7 },
      yazi: { x: 62, y: 55 },
    })
  })
})

describe('bağımsızlık', () => {
  // Motor gibi: React'e, DOM'a ve CSS'e bağımlı değildir; motordan yalnız tür alır.
  it('yalnız motorun türlerini içe aktarır', () => {
    const iceAktarmalar = cizimKaynagi.match(/^[ \t]*(?:import|export)\b.*\bfrom\b.*$/gm) ?? []
    expect(iceAktarmalar).toEqual(["import type { Unlu, UnluOzellikleri } from '../motor/index.ts'"])
  })
})
