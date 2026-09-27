// Morfemusta görsel dil, B · Canlı: başvuru geometrisi. Sayılar tuvaldeki çizimlerin aynısı.
//
// Tuvaldeki başvuru kodunun TypeScript'e taşınmış hâlidir; sayılar ve yollar değiştirilmez.
// Her karakter yalnız üç özellikten üretilir (DESIGN.md, "Görsel dil"). Saf TypeScript'tir:
// React'e ve DOM'a bağımlı değildir (motor gibi); bileşenler yolları buradan alır.

import type { Unlu, UnluOzellikleri } from '../motor/index.ts'

// Motorun tablosunun aynısı olmalı; cizim.test.ts denetler.
export const UNLULER: Readonly<Record<Unlu, UnluOzellikleri>> = {
  a: { kalin: true, yuvarlak: false, genis: true },
  ı: { kalin: true, yuvarlak: false, genis: false },
  o: { kalin: true, yuvarlak: true, genis: true },
  u: { kalin: true, yuvarlak: true, genis: false },
  e: { kalin: false, yuvarlak: false, genis: true },
  i: { kalin: false, yuvarlak: false, genis: false },
  ö: { kalin: false, yuvarlak: true, genis: true },
  ü: { kalin: false, yuvarlak: true, genis: false },
}

/** Ünlü karakterinin kutusu (viewBox) ve yuvarlak parçalarının yarıçapları. */
export const UNLU = { en: 72, boy: 76, gozAki: 5.4, bebek: 2.6, yanak: 3.4 } as const

/** Bukalemunun kutusu (viewBox) ve gözünün yarıçapları; göz tümseğininki çizimde. */
export const BUKALEMUN = { en: 132, boy: 82, gozAki: 4.6, bebek: 2.4 } as const

const f = (n: number): number => Math.round(n * 10) / 10
const dikdortgen = (cx: number, cy: number, w: number, h: number, r: number): string => {
  const x = cx - w / 2, y = cy - h / 2
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${r} ${r} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${r} ${r} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${r} ${r} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${r} ${r} 0 0 1 ${f(x + r)} ${f(y)}Z`
}
const elips = (cx: number, cy: number, rx: number, ry: number): string =>
  `M${f(cx - rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)}Z`
const govde = (yuvarlak: boolean, cx: number, cy: number, w: number, h: number, r: number): string =>
  yuvarlak ? elips(cx, cy, w / 2, h / 2) : dikdortgen(cx, cy, w, h, r)
const yarik = (x1: number, x2: number, y: number, t: number): string =>
  `M${f(x1)} ${f(y - t)}H${f(x2)}A${t} ${t} 0 0 1 ${f(x2)} ${f(y + t)}H${f(x1)}A${t} ${t} 0 0 1 ${f(x1)} ${f(y - t)}Z`

export interface UnluCizimi {
  /** Gövde yolu: düz ünlüde köşesi 7 yuvarlatılmış dikdörtgen, yuvarlakta elips. */
  readonly govde: string
  readonly gozX: readonly [number, number]
  readonly gozY: number
  readonly bebekY: number
  readonly yanakX: readonly [number, number]
  readonly yanakY: number
  /** Ağız yolu: geniş ünlüde açık yarım ay, darda ince yarık. */
  readonly agiz: string
}

// Ünlü karakteri, 72×76 kutu. Göz akı r 5.4 (çizgi 1.5), göz bebeği r 2.6, yanak r 3.4.
export function unluCizimi({ kalin, yuvarlak, genis }: UnluOzellikleri): UnluCizimi {
  const cx = 36, cy = 40, H = 56, W = kalin ? 58 : 34
  const my = cy + 8, mw = genis ? W * 0.52 : W * 0.3
  return {
    govde: govde(yuvarlak, cx, cy, W, H, 7),
    gozX: [f(cx - W * 0.2), f(cx + W * 0.2)], gozY: cy - 7, bebekY: cy - 6.2,
    yanakX: [f(cx - W * 0.33), f(cx + W * 0.33)], yanakY: cy + 5,
    agiz: genis ? `M${f(cx - mw / 2)} ${my}Q${cx} ${my + 18} ${f(cx + mw / 2)} ${my}Z` : yarik(cx - mw / 2, cx + mw / 2, my, 1.5),
  }
}

export interface BukalemunCizimi {
  readonly govde: string
  readonly ibik: string
  readonly bacaklar: string
  readonly kuyruk: string
  readonly agiz: string
  /** Göz tümseği: merkezi ve yarıçapı (kalın 8, ince 7). Göz akı ve bebek aynı merkezdedir. */
  readonly goz: { readonly x: number; readonly y: number; readonly r: number }
  /** Ek yazısının yeri (ortalanır). */
  readonly yazi: { readonly x: number; readonly y: number }
}

// Bukalemun ek, 132×82 kutu, başı solda (köke dönük). Göz tümseği r kalın 8 / ince 7, göz akı r 4.6, bebek r 2.4.
// Çizim sırası: kuyruk ve bacaklar (11'lik mürekkep, üstüne 5'lik renk), ibik, gövde, göz tümseği, göz, ağız, ek yazısı.
export function bukalemunCizimi({ kalin, yuvarlak, genis }: UnluOzellikleri): BukalemunCizimi {
  const W = 92, H = kalin ? 54 : 38, sol = 12, alt = 68, r = 10
  const cy = alt - H / 2, cx = sol + W / 2, sag = sol + W, rx = W / 2, ry = H / 2
  const yariEn = (dy: number): number => {
    if (yuvarlak) return rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2))
    const a = Math.abs(dy), sinir = ry - r
    return a <= sinir ? rx : rx - r + Math.sqrt(Math.max(0, r * r - (a - sinir) ** 2))
  }
  const yariBoy = (dx: number): number => {
    if (yuvarlak) return ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2))
    const a = Math.abs(dx), sinir = rx - r
    return a <= sinir ? ry : ry - r + Math.sqrt(Math.max(0, r * r - (a - sinir) ** 2))
  }
  const solKenar = (y: number): number => cx - yariEn(y - cy)
  let ibik = ''
  const n = 5, x0 = sol + 34, x1 = sag - 14, ara = (x1 - x0) / n, tw = ara * 0.8, th = kalin ? 7 : 6
  for (let i = 0; i < n; i++) {
    const a = x0 + i * ara + (ara - tw) / 2, b = a + tw, m = (a + b) / 2
    ibik += `M${f(a)} ${f(cy - yariBoy(a - cx) + 2)}L${f(m)} ${f(cy - yariBoy(m - cx) - th)}L${f(b)} ${f(cy - yariBoy(b - cx) + 2)}Z`
  }
  const b1 = sol + W * 0.3, b2 = sol + W * 0.7
  const bacaklar = `M${f(b1)} ${f(cy + yariBoy(b1 - cx) - 4)}V${alt + 8}M${f(b2)} ${f(cy + yariBoy(b2 - cx) - 4)}V${alt + 8}`
  const R0 = kalin ? 11 : 9, sx = sag + 8, sy = cy + 2 + R0
  let kuyruk = `M${f(sag - 6)} ${f(cy + 2)}L${f(sx)} ${f(cy + 2)}`
  for (let i = 1; i <= 32; i++) {
    const t = i / 32, a = -Math.PI / 2 + t * 2.6 * Math.PI, rr = R0 * (1 - 0.72 * t)
    kuyruk += `L${f(sx + rr * Math.cos(a))} ${f(sy + rr * Math.sin(a))}`
  }
  const gx = sol + 21, gy = cy - yariBoy(gx - cx) + 3
  const my = cy + H * 0.14
  const agiz = genis
    ? `M${f(solKenar(my - 3) + 1.5)} ${f(my - 3)}L${f(solKenar(my) + 16)} ${f(my + 1)}L${f(solKenar(my + 5) + 1.5)} ${f(my + 5)}Z`
    : yarik(solKenar(my) + 3, solKenar(my) + 14, my, 1.4)
  return {
    govde: govde(yuvarlak, cx, cy, W, H, r), ibik, bacaklar, kuyruk, agiz,
    goz: { x: f(gx), y: f(gy), r: kalin ? 8 : 7 },
    yazi: { x: f(cx + 4), y: f(cy + 6) },
  }
}
