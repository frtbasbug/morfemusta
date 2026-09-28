import { describe, expect, it } from 'vitest'
import type { Unlu, UnluOzellikleri } from '../motor/index.ts'
import { UNLULER, bukalemunCizimi, unluCizimi } from './cizim.ts'

const SEKIZ_UNLU = Object.entries(UNLULER) as [Unlu, UnluOzellikleri][]

/** Özellikleri verilen ünlünün, yalnız bir özelliği karşıt olan eşi. */
const karsiti = (o: UnluOzellikleri, ozellik: keyof UnluOzellikleri): UnluOzellikleri => ({
  ...o,
  [ozellik]: !o[ozellik],
})

// Yolların uç noktaları (yalnız mutlak M, L, H, V, Q, A ve Z; başvuru kodu yalnız bunları
// yazar). Köşesi yuvarlatılmış dikdörtgenin sınırları uç noktalardadır; elipsin eni de
// (soldan sağa iki yarım yay). Elipsin boyu yayın ry'sinden okunur.
function uclar(yol: string): { x: number; y: number }[] {
  const noktalar: { x: number; y: number }[] = []
  let x = 0
  let y = 0
  for (const [, komut, degerler] of yol.matchAll(/([MLHVQAZ])([^MLHVQAZ]*)/g)) {
    const s = (degerler ?? '').trim().split(/[\s,]+/).filter(Boolean).map(Number)
    switch (komut) {
      case 'H':
        x = s[0]!
        break
      case 'V':
        y = s[0]!
        break
      case 'Z':
        continue
      default:
        x = s.at(-2)!
        y = s.at(-1)!
    }
    noktalar.push({ x, y })
  }
  return noktalar
}

function govdeKutusu(yol: string): { en: number; boy: number } {
  const noktalar = uclar(yol)
  const xler = noktalar.map((n) => n.x)
  const en = Math.max(...xler) - Math.min(...xler)
  if (yol.includes('H')) {
    const yler = noktalar.map((n) => n.y)
    return { en, boy: Math.max(...yler) - Math.min(...yler) }
  }
  const ry = Number(/A[\d.]+ ([\d.]+)/.exec(yol)?.[1])
  return { en, boy: 2 * ry }
}

/** Nesnedeki her sayı sonlu, her yol sayılardan ve komutlardan oluşur. */
function bozukDegerler(deger: unknown, yer = ''): string[] {
  if (typeof deger === 'number') return Number.isFinite(deger) ? [] : [`${yer}: ${deger}`]
  if (typeof deger === 'string') return /^[MLHVQAZ\d .-]+$/.test(deger) ? [] : [`${yer}: ${deger}`]
  if (typeof deger === 'object' && deger !== null) {
    return Object.entries(deger).flatMap(([ad, ic]) => bozukDegerler(ic, `${yer}.${ad}`))
  }
  return [`${yer}: ${String(deger)}`]
}

describe('ünlü tablosu', () => {
  it('sekiz ünlünün özellikleri', () => {
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

  it('sekiz ünlü, üç ikili özelliğin sekiz bileşimidir', () => {
    const bilesimler = new Set(SEKIZ_UNLU.map(([, o]) => `${o.kalin} ${o.yuvarlak} ${o.genis}`))
    expect(bilesimler.size).toBe(8)
  })
})

describe('başvuru koduyla aynı sayılar ve yollar', () => {
  it.each(SEKIZ_UNLU)('%s: ünlü karakteri', (_unlu, o) => {
    expect(unluCizimi(o)).toEqual(basvuru.unluCizimi(o))
  })

  it.each(SEKIZ_UNLU)('%s: bukalemun', (_unlu, o) => {
    expect(bukalemunCizimi(o)).toEqual(basvuru.bukalemunCizimi(o))
  })

  it('a: yollar tuvaldekiyle aynı', () => {
    expect(unluCizimi(UNLULER.a)).toEqual({
      govde: 'M14 12H58A7 7 0 0 1 65 19V61A7 7 0 0 1 58 68H14A7 7 0 0 1 7 61V19A7 7 0 0 1 14 12Z',
      gozX: [24.4, 47.6],
      gozY: 33,
      bebekY: 33.8,
      yanakX: [16.9, 55.1],
      yanakY: 45,
      agiz: 'M20.9 48Q36 66 51.1 48Z',
    })
    expect(unluCizimi(UNLULER.ö).govde).toBe('M19 40A17 28 0 1 0 53 40A17 28 0 1 0 19 40Z')
  })
})

describe('sekiz bileşimin hiçbirinde NaN yok', () => {
  it.each(SEKIZ_UNLU)('%s', (_unlu, o) => {
    expect(bozukDegerler(unluCizimi(o), 'ünlü')).toEqual([])
    expect(bozukDegerler(bukalemunCizimi(o), 'bukalemun')).toEqual([])
  })
})

describe('kalın / ince: gövde eni', () => {
  it.each(SEKIZ_UNLU.filter(([, o]) => o.kalin))(
    '%s: kalın gövde, ince eşininkinden geniş (58 / 34); yükseklik ikisinde de 56',
    (_unlu, o) => {
      const kalin = govdeKutusu(unluCizimi(o).govde)
      const ince = govdeKutusu(unluCizimi(karsiti(o, 'kalin')).govde)
      expect(kalin.en).toBeGreaterThan(ince.en)
      expect([kalin.en, ince.en]).toEqual([58, 34])
      expect([kalin.boy, ince.boy]).toEqual([56, 56])
    },
  )

  it.each(SEKIZ_UNLU.filter(([, o]) => o.kalin))(
    '%s: kalın bukalemun inceden kalın (54 / 38); eni hep 92',
    (_unlu, o) => {
      const kalin = govdeKutusu(bukalemunCizimi(o).govde)
      const ince = govdeKutusu(bukalemunCizimi(karsiti(o, 'kalin')).govde)
      expect([kalin.boy, ince.boy]).toEqual([54, 38])
      expect([kalin.en, ince.en]).toEqual([92, 92])
    },
  )
})

describe('düz / yuvarlak: gövde biçimi', () => {
  it.each(SEKIZ_UNLU.filter(([, o]) => !o.yuvarlak))(
    '%s: düz ve yuvarlak eşinin gövde yolları farklı',
    (_unlu, o) => {
      const yuvarlak = karsiti(o, 'yuvarlak')
      expect(unluCizimi(o).govde).not.toBe(unluCizimi(yuvarlak).govde)
      expect(bukalemunCizimi(o).govde).not.toBe(bukalemunCizimi(yuvarlak).govde)
      // Düz gövde köşesi yuvarlatılmış dikdörtgendir (düz kenarlı), yuvarlak gövde elips.
      expect(unluCizimi(o).govde).toMatch(/H.*V/)
      expect(unluCizimi(yuvarlak).govde).not.toMatch(/[HV]/)
    },
  )
})

describe('geniş / dar: ağız', () => {
  it.each(SEKIZ_UNLU.filter(([, o]) => o.genis))(
    '%s: geniş ve dar eşinin ağız yolları farklı; gövde aynı',
    (_unlu, o) => {
      const dar = karsiti(o, 'genis')
      expect(unluCizimi(o).agiz).not.toBe(unluCizimi(dar).agiz)
      expect(unluCizimi(o).govde).toBe(unluCizimi(dar).govde)
      expect(bukalemunCizimi(o).agiz).not.toBe(bukalemunCizimi(dar).agiz)
      expect(bukalemunCizimi(o).govde).toBe(bukalemunCizimi(dar).govde)
    },
  )
})

// Başvuru kodu (tuvaldeki çizimleri üreten kod), yalnız tür eklenmiş hâliyle. cizim.ts bundan
// yeniden biçimlenerek taşındı; iki kod aynı sayıları ve yolları vermeli.
const basvuru = (() => {
  const f = (n: number) => Math.round(n * 10) / 10;
  const dikdortgen = (cx: number, cy: number, w: number, h: number, r: number) => {
    const x = cx - w / 2, y = cy - h / 2;
    return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${r} ${r} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${r} ${r} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${r} ${r} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${r} ${r} 0 0 1 ${f(x + r)} ${f(y)}Z`;
  };
  const elips = (cx: number, cy: number, rx: number, ry: number) => `M${f(cx - rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)}Z`;
  const govde = (yuvarlak: boolean, cx: number, cy: number, w: number, h: number, r: number) => (yuvarlak ? elips(cx, cy, w / 2, h / 2) : dikdortgen(cx, cy, w, h, r));
  const yarik = (x1: number, x2: number, y: number, t: number) => `M${f(x1)} ${f(y - t)}H${f(x2)}A${t} ${t} 0 0 1 ${f(x2)} ${f(y + t)}H${f(x1)}A${t} ${t} 0 0 1 ${f(x1)} ${f(y - t)}Z`;

  function unluCizimi({ kalin, yuvarlak, genis }: UnluOzellikleri) {
    const cx = 36, cy = 40, H = 56, W = kalin ? 58 : 34;
    const my = cy + 8, mw = genis ? W * 0.52 : W * 0.3;
    return {
      govde: govde(yuvarlak, cx, cy, W, H, 7),
      gozX: [f(cx - W * 0.2), f(cx + W * 0.2)], gozY: cy - 7, bebekY: cy - 6.2,
      yanakX: [f(cx - W * 0.33), f(cx + W * 0.33)], yanakY: cy + 5,
      agiz: genis ? `M${f(cx - mw / 2)} ${my}Q${cx} ${my + 18} ${f(cx + mw / 2)} ${my}Z` : yarik(cx - mw / 2, cx + mw / 2, my, 1.5),
    };
  }

  function bukalemunCizimi({ kalin, yuvarlak, genis }: UnluOzellikleri) {
    const W = 92, H = kalin ? 54 : 38, sol = 12, alt = 68, r = 10;
    const cy = alt - H / 2, cx = sol + W / 2, sag = sol + W, rx = W / 2, ry = H / 2;
    const yariEn = (dy: number) => {
      if (yuvarlak) return rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2));
      const a = Math.abs(dy), sinir = ry - r;
      return a <= sinir ? rx : rx - r + Math.sqrt(Math.max(0, r * r - (a - sinir) ** 2));
    };
    const yariBoy = (dx: number) => {
      if (yuvarlak) return ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2));
      const a = Math.abs(dx), sinir = rx - r;
      return a <= sinir ? ry : ry - r + Math.sqrt(Math.max(0, r * r - (a - sinir) ** 2));
    };
    const solKenar = (y: number) => cx - yariEn(y - cy);
    let ibik = '';
    const n = 5, x0 = sol + 34, x1 = sag - 14, ara = (x1 - x0) / n, tw = ara * 0.8, th = kalin ? 7 : 6;
    for (let i = 0; i < n; i++) {
      const a = x0 + i * ara + (ara - tw) / 2, b = a + tw, m = (a + b) / 2;
      ibik += `M${f(a)} ${f(cy - yariBoy(a - cx) + 2)}L${f(m)} ${f(cy - yariBoy(m - cx) - th)}L${f(b)} ${f(cy - yariBoy(b - cx) + 2)}Z`;
    }
    const b1 = sol + W * 0.3, b2 = sol + W * 0.7;
    const bacaklar = `M${f(b1)} ${f(cy + yariBoy(b1 - cx) - 4)}V${alt + 8}M${f(b2)} ${f(cy + yariBoy(b2 - cx) - 4)}V${alt + 8}`;
    const R0 = kalin ? 11 : 9, sx = sag + 8, sy = cy + 2 + R0;
    let kuyruk = `M${f(sag - 6)} ${f(cy + 2)}L${f(sx)} ${f(cy + 2)}`;
    for (let i = 1; i <= 32; i++) {
      const t = i / 32, a = -Math.PI / 2 + t * 2.6 * Math.PI, rr = R0 * (1 - 0.72 * t);
      kuyruk += `L${f(sx + rr * Math.cos(a))} ${f(sy + rr * Math.sin(a))}`;
    }
    const gx = sol + 21, gy = cy - yariBoy(gx - cx) + 3;
    const my = cy + H * 0.14;
    const agiz = genis
      ? `M${f(solKenar(my - 3) + 1.5)} ${f(my - 3)}L${f(solKenar(my) + 16)} ${f(my + 1)}L${f(solKenar(my + 5) + 1.5)} ${f(my + 5)}Z`
      : yarik(solKenar(my) + 3, solKenar(my) + 14, my, 1.4);
    return {
      govde: govde(yuvarlak, cx, cy, W, H, r), ibik, bacaklar, kuyruk, agiz,
      goz: { x: f(gx), y: f(gy), r: kalin ? 8 : 7 },
      yazi: { x: f(cx + 4), y: f(cy + 6) },
    };
  }

  return { unluCizimi, bukalemunCizimi }
})()
