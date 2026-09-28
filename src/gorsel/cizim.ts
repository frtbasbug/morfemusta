// Morfemusta görsel dili, B · Canlı: başvuru geometrisi. Sayılar tuvaldeki çizimlerin
// aynısıdır; başvuru kodu TypeScript'e taşınırken hiçbir sayı ve yol değişmedi
// (cizim.test.ts başvuru koduyla karşılaştırır).
//
// Terimler resimdir: her özellik tek bir çizim boyutuna bağlıdır (DESIGN.md, "Görsel dil").
//
//   kalın / ince      gövde eni (ünlüde 58 / 34); bukalemunda gövde kalınlığı (54 / 38)
//   düz / yuvarlak    gövde biçimi: köşesi yuvarlatılmış dikdörtgen / elips
//   geniş / dar       ağız: açık yarım ay / ince yarık
//
// Saf TypeScript'tir: React'i, DOM'u ya da CSS'i içe aktarmaz; yalnız motorun ünlü tablosunu
// kullanır (bagimsizlik.test.ts ve tsconfig.motor.json denetler). Renkler ve çizgi
// kalınlıkları tema.css'tedir.

import { UNLULER, type UnluOzellikleri } from '../motor/index.ts'

/** Sekiz ünlünün özellik tablosu. Motorunkidir (src/motor/ses.ts); ikinci bir tablo yok. */
export { UNLULER }

/** Üç özelliğin adları, çizelgedeki sırayla: "kalın, düz, geniş". */
export function ozellikAdlari({ kalin, yuvarlak, genis }: UnluOzellikleri): string {
  const adlar = [kalin ? 'kalın' : 'ince', yuvarlak ? 'yuvarlak' : 'düz', genis ? 'geniş' : 'dar']
  return adlar.join(', ')
}

/** Ünlü karakterinin kutusu (viewBox). */
export const UNLU_KUTUSU = { en: 72, boy: 76 } as const

/** Ünlü karakterinde göz akı (çizgi 1.5), göz bebeği ve yanak yarıçapları. */
export const UNLU_YARICAPLARI = { gozAki: 5.4, bebek: 2.6, yanak: 3.4 } as const

/** Bukalemunun kutusu (viewBox). Başı solda, köke dönük: uyum geriye bakar. */
export const BUKALEMUN_KUTUSU = { en: 132, boy: 82 } as const

/**
 * Bukalemunda göz akı ve göz bebeği yarıçapları; ikisi de göz tümseğiyle aynı merkezdedir.
 * Göz tümseğinin yarıçapı (kalın 8, ince 7) çizimdedir: `goz.r`.
 */
export const BUKALEMUN_YARICAPLARI = { gozAki: 4.6, bebek: 2.4 } as const

export interface UnluCizimi {
  /** Düzde köşesi 7 yuvarlatılmış dikdörtgen, yuvarlakta elips. */
  readonly govde: string
  readonly gozX: readonly [number, number]
  readonly gozY: number
  readonly bebekY: number
  readonly yanakX: readonly [number, number]
  readonly yanakY: number
  /** Genişte açık yarım ay, darda ince yarık. */
  readonly agiz: string
}

export interface BukalemunCizimi {
  /** Düzde köşesi 10 yuvarlatılmış dikdörtgen, yuvarlakta elips; eni hep 92. */
  readonly govde: string
  /** Sırttaki beş diş. */
  readonly ibik: string
  readonly bacaklar: string
  /** Sağdaki sarmal kuyruk. */
  readonly kuyruk: string
  /** Başta, solda: genişte sola açılan ağız (üçgen), darda ince yarık. */
  readonly agiz: string
  /** Göz tümseğinin merkezi ve yarıçapı. */
  readonly goz: { readonly x: number; readonly y: number; readonly r: number }
  /** Ek yazısının yeri: ortalanmış, taban çizgisi. */
  readonly yazi: { readonly x: number; readonly y: number }
}

const f = (n: number): number => Math.round(n * 10) / 10

const dikdortgen = (cx: number, cy: number, w: number, h: number, r: number): string => {
  const x = cx - w / 2
  const y = cy - h / 2
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${r} ${r} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${r} ${r} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${r} ${r} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${r} ${r} 0 0 1 ${f(x + r)} ${f(y)}Z`
}

const elips = (cx: number, cy: number, rx: number, ry: number): string =>
  `M${f(cx - rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx + rx)} ${f(cy)}A${f(rx)} ${f(ry)} 0 1 0 ${f(cx - rx)} ${f(cy)}Z`

const govde = (
  yuvarlak: boolean,
  cx: number,
  cy: number,
  w: number,
  h: number,
  r: number,
): string => (yuvarlak ? elips(cx, cy, w / 2, h / 2) : dikdortgen(cx, cy, w, h, r))

const yarik = (x1: number, x2: number, y: number, t: number): string =>
  `M${f(x1)} ${f(y - t)}H${f(x2)}A${t} ${t} 0 0 1 ${f(x2)} ${f(y + t)}H${f(x1)}A${t} ${t} 0 0 1 ${f(x1)} ${f(y - t)}Z`

/**
 * Ünlü gövdesinin eni ve boyu: kalında 58 × 56, incede 34 × 56. Kök etiketi de gövdenin küçük
 * bir kopyası olarak bu orandadır (UnluEtiketi).
 */
export function unluGovdesi({ kalin }: Pick<UnluOzellikleri, 'kalin'>): {
  readonly en: number
  readonly boy: number
} {
  return { en: kalin ? 58 : 34, boy: 56 }
}

/** Ünlü karakteri, 72×76 kutu. */
export function unluCizimi({ kalin, yuvarlak, genis }: UnluOzellikleri): UnluCizimi {
  const cx = 36
  const cy = 40
  const { en: W, boy: H } = unluGovdesi({ kalin })
  const my = cy + 8
  const mw = genis ? W * 0.52 : W * 0.3
  return {
    govde: govde(yuvarlak, cx, cy, W, H, 7),
    gozX: [f(cx - W * 0.2), f(cx + W * 0.2)],
    gozY: cy - 7,
    bebekY: cy - 6.2,
    yanakX: [f(cx - W * 0.33), f(cx + W * 0.33)],
    yanakY: cy + 5,
    agiz: genis
      ? `M${f(cx - mw / 2)} ${my}Q${cx} ${my + 18} ${f(cx + mw / 2)} ${my}Z`
      : yarik(cx - mw / 2, cx + mw / 2, my, 1.5),
  }
}

/**
 * Bukalemun ek, 132×82 kutu, başı solda (köke dönük). Çizim sırası: kuyruk ve bacaklar (11'lik
 * mürekkep, üstüne 5'lik renk), ibik, gövde, göz tümseği, göz, ağız, ek yazısı.
 */
export function bukalemunCizimi({ kalin, yuvarlak, genis }: UnluOzellikleri): BukalemunCizimi {
  const W = 92
  const H = kalin ? 54 : 38
  const sol = 12
  const alt = 68
  const r = 10
  const cy = alt - H / 2
  const cx = sol + W / 2
  const sag = sol + W
  const rx = W / 2
  const ry = H / 2

  // Gövdenin, merkezden dy uzaklıktaki yarı eni ve dx uzaklıktaki yarı boyu.
  const yariEn = (dy: number): number => {
    if (yuvarlak) return rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2))
    const a = Math.abs(dy)
    const sinir = ry - r
    return a <= sinir ? rx : rx - r + Math.sqrt(Math.max(0, r * r - (a - sinir) ** 2))
  }
  const yariBoy = (dx: number): number => {
    if (yuvarlak) return ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2))
    const a = Math.abs(dx)
    const sinir = rx - r
    return a <= sinir ? ry : ry - r + Math.sqrt(Math.max(0, r * r - (a - sinir) ** 2))
  }
  const solKenar = (y: number): number => cx - yariEn(y - cy)

  let ibik = ''
  const n = 5
  const x0 = sol + 34
  const x1 = sag - 14
  const ara = (x1 - x0) / n
  const tw = ara * 0.8
  const th = kalin ? 7 : 6
  for (let i = 0; i < n; i++) {
    const a = x0 + i * ara + (ara - tw) / 2
    const b = a + tw
    const m = (a + b) / 2
    ibik += `M${f(a)} ${f(cy - yariBoy(a - cx) + 2)}L${f(m)} ${f(cy - yariBoy(m - cx) - th)}L${f(b)} ${f(cy - yariBoy(b - cx) + 2)}Z`
  }

  const b1 = sol + W * 0.3
  const b2 = sol + W * 0.7
  const bacaklar = `M${f(b1)} ${f(cy + yariBoy(b1 - cx) - 4)}V${alt + 8}M${f(b2)} ${f(cy + yariBoy(b2 - cx) - 4)}V${alt + 8}`

  const R0 = kalin ? 11 : 9
  const sx = sag + 8
  const sy = cy + 2 + R0
  let kuyruk = `M${f(sag - 6)} ${f(cy + 2)}L${f(sx)} ${f(cy + 2)}`
  for (let i = 1; i <= 32; i++) {
    const t = i / 32
    const a = -Math.PI / 2 + t * 2.6 * Math.PI
    const rr = R0 * (1 - 0.72 * t)
    kuyruk += `L${f(sx + rr * Math.cos(a))} ${f(sy + rr * Math.sin(a))}`
  }

  const gx = sol + 21
  const gy = cy - yariBoy(gx - cx) + 3
  const my = cy + H * 0.14
  const agiz = genis
    ? `M${f(solKenar(my - 3) + 1.5)} ${f(my - 3)}L${f(solKenar(my) + 16)} ${f(my + 1)}L${f(solKenar(my + 5) + 1.5)} ${f(my + 5)}Z`
    : yarik(solKenar(my) + 3, solKenar(my) + 14, my, 1.4)

  return {
    govde: govde(yuvarlak, cx, cy, W, H, r),
    ibik,
    bacaklar,
    kuyruk,
    agiz,
    goz: { x: f(gx), y: f(gy), r: kalin ? 8 : 7 },
    yazi: { x: f(cx + 4), y: f(cy + 6) },
  }
}
