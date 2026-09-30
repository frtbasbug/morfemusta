// Uydurukçuklar'ın yaratığı: adındaki son ünlünün karakteri (cizim.ts, unluCizimi), üstünde
// kök başına sabit tohumlu küçük süsler: boynuz ve benek (DESIGN.md, "Uydurukçuklar"). Süs
// ünlüden değil kökten gelir: sekiz ünlünün hepsine aynı işlevle eklenir, karakterin üç
// özelliğini değiştirmez. Ağız hiçbir zaman değişmez; süs ağza ve gözlere değmez. Süslerin
// renkleri belirteçlerdendir (karakterler.css); kalın ve ince renkleri süste kullanılmaz.
//
// Saf TypeScript'tir: React'i, DOM'u ya da CSS'i içe aktarmaz (bagimsizlik.test.ts ve
// tsconfig.motor.json denetler). cizim.ts'in sayılarına dokunmaz; ünlünün gövdesini ondan okur.

import { sonUnlu, type Unlu, type UnluOzellikleri } from '../motor/index.ts'
import { UNLU_KUTUSU, unluGovdesi } from './cizim.ts'

/** Ünlü gövdesinin merkezi (unluCizimi ile aynı: 72×76 kutuda). */
const MERKEZ = { x: 36, y: 40 } as const

export type BoynuzTuru = 'yok' | 'iki' | 'tek'

export interface Benek {
  readonly x: number
  readonly y: number
  readonly r: number
}

export interface YaratikSusleri {
  readonly boynuz: BoynuzTuru
  /** Boynuzların yolu; gövdeden önce çizilir, dipleri gövdenin altında kalır. Yoksa boş. */
  readonly boynuzlar: string
  /** Gövdenin alt yarısında, yanakların altında küçük benekler. */
  readonly benekler: readonly Benek[]
}

const f = (n: number): number => Math.round(n * 10) / 10

/** Kökün sayısal tohumu (FNV-1a, 32 bit): aynı kök hep aynı süsleri alır. */
export function kokTohumu(kok: string): number {
  let h = 0x811c9dc5
  for (const harf of kok.normalize('NFC')) {
    h ^= harf.codePointAt(0) ?? 0
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/** Yaratığın ünlüsü: adındaki son ünlü (pıtak → a, zelü → ü). */
export function yaratikUnlusu(kok: string): Unlu {
  const unlu = sonUnlu(kok.normalize('NFC'))
  if (unlu === undefined) throw new Error(`"${kok}" kökünde ünlü yok`)
  return unlu
}

/** Gövdenin, merkezden dx uzaklıktaki üst kenarı (y). */
function ustKenar({ kalin, yuvarlak }: UnluOzellikleri, dx: number): number {
  const { en, boy } = unluGovdesi({ kalin })
  if (!yuvarlak) return MERKEZ.y - boy / 2
  const oran = Math.min(1, Math.abs(dx) / (en / 2))
  return MERKEZ.y - (boy / 2) * Math.sqrt(1 - oran ** 2)
}

// Beneklerin yerleri: gövde eninin kesri ve y. Hepsi yanakların (y 45) ve ağzın altında,
// gövdenin içinde kalır (düzde de yuvarlakta da; yaratik.test.ts denetler).
const BENEK_YERLERI: readonly (readonly [number, number])[] = [
  [-0.27, 58],
  [0.27, 58],
  [-0.1, 63],
  [0.12, 62.5],
]

/**
 * Kökün süsleri: tohumdan boynuz türü (yok, iki, tek) ve benek sayısı (0, 2, 3); en az biri
 * vardır. Geometri ünlünün gövdesine göre kurulur.
 */
export function yaratikSusleri(kok: string, ozellikler: UnluOzellikleri): YaratikSusleri {
  const tohum = kokTohumu(kok)
  const boynuz: BoynuzTuru = (['yok', 'iki', 'tek'] as const)[tohum % 3] ?? 'yok'
  let benekSayisi = [0, 2, 3][(tohum >>> 4) % 3] ?? 0
  if (boynuz === 'yok' && benekSayisi === 0) benekSayisi = 2
  const baslangic = (tohum >>> 8) % BENEK_YERLERI.length

  const { en } = unluGovdesi(ozellikler)
  const r = ozellikler.kalin ? 3 : 2.4
  const benekler = Array.from({ length: benekSayisi }, (_, i) => {
    const [kesir, y] = BENEK_YERLERI[(baslangic + i) % BENEK_YERLERI.length] ?? [0, 60]
    return { x: f(MERKEZ.x + kesir * en), y, r }
  })

  const boynuzYolu = (dx: number, egim: number, taban: number, boy: number): string => {
    const x = MERKEZ.x + dx
    const dip = ustKenar(ozellikler, dx) + 3
    return (
      `M${f(x - taban / 2)} ${f(dip)}L${f(x + egim)} ${f(dip - boy)}` +
      `L${f(x + taban / 2)} ${f(dip)}Z`
    )
  }
  const taban = ozellikler.kalin ? 10 : 8
  const boynuzlar =
    boynuz === 'iki'
      ? boynuzYolu(-en * 0.24, -2.5, taban, 10) + boynuzYolu(en * 0.24, 2.5, taban, 10)
      : boynuz === 'tek'
        ? boynuzYolu(0, 0, taban, 12)
        : ''
  return { boynuz, boynuzlar, benekler }
}

/** Büyünün yıldızı: beş köşeli, 28×28 kutuda. */
export const YILDIZ_KUTUSU = { en: 28, boy: 28 } as const

export const YILDIZ_YOLU: string = (() => {
  const noktalar = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? 12 : 5.2
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    return `${f(14 + r * Math.cos(a))} ${f(14 + r * Math.sin(a))}`
  })
  return `M${noktalar.join('L')}Z`
})()

/** Yaratığın kutusu: ünlü karakterininki (72×76). */
export const YARATIK_KUTUSU = UNLU_KUTUSU
