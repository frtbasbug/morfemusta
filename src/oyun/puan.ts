// Puan ve yıldız (DESIGN.md, "Akış ve puan"). Saf TypeScript'tir; DOM'a ve React'e dokunmaz.
//
// Puan yalnız artar; yanlış puan düşürmez (eksi puan yok). Her doğru yerleştirme (zincirde ve
// ağaçta her adım ayrı) ilk denemede +10, sonraki denemelerde +5'tir; yanlış 0. Uydurukçuklar'ın
// sınır adımında iki karo da doğrudur: o adım hep ilk denemedir. Üst üste üç ilk denemede doğru
// +5 ve kısa bir şenliktir; yanlış seriyi sıfırlar, puanı düşürmez. Yıldız turun sonunda ilk
// denemede doğru oranından gelir: en az %90 üç, en az %60 iki, değilse bir yıldız.

/** İlk denemede doğru yerleştirmenin puanı. */
export const ILK_DENEME_PUANI = 10
/** Yanlıştan sonraki doğru yerleştirmenin puanı. */
export const SONRAKI_DENEME_PUANI = 5
/** Seri: üst üste bu kadar ilk denemede doğru. */
export const SERI_UZUNLUGU = 3
/** Serinin ek puanı. */
export const SERI_PUANI = 5

/** Bir bölge turunun puanı: tur bitene kadar biten görevlerinkiyle birikir. */
export interface TurPuani {
  /** Turun puanı. */
  readonly puan: number
  /** İlk denemede doğru yerleştirmeler. */
  readonly ilk: number
  /** Bütün doğru yerleştirmeler (her adım bir kez). */
  readonly yer: number
  /** Üst üste ilk denemede doğru yerleştirmeler (seri tamamlanınca 0'dan sayılır). */
  readonly seri: number
}

export const BOS_TUR_PUANI: TurPuani = { puan: 0, ilk: 0, yer: 0, seri: 0 }

/** Yerleştirmenin sonucu: yeni puan, kazanılan puan ve seri tamamlandıysa şenlik. */
export interface Yerlestirme {
  readonly tur: TurPuani
  readonly kazanc: number
  readonly senlik: boolean
}

/**
 * Doğru yerleştirme. İlk denemedeyse +10 ve seri bir artar; seri üçe varınca +5 ve şenlik, seri
 * yeniden 0'dan sayılır. Yanlıştan sonraysa +5; seri bu adımın yanlışıyla zaten sıfırlandı.
 */
export function dogruYerlesti(tur: TurPuani, ilkDeneme: boolean): Yerlestirme {
  if (!ilkDeneme) {
    return {
      tur: { ...tur, puan: tur.puan + SONRAKI_DENEME_PUANI, yer: tur.yer + 1, seri: 0 },
      kazanc: SONRAKI_DENEME_PUANI,
      senlik: false,
    }
  }
  const seri = tur.seri + 1
  const senlik = seri >= SERI_UZUNLUGU
  const kazanc = ILK_DENEME_PUANI + (senlik ? SERI_PUANI : 0)
  return {
    tur: { puan: tur.puan + kazanc, ilk: tur.ilk + 1, yer: tur.yer + 1, seri: senlik ? 0 : seri },
    kazanc,
    senlik,
  }
}

/** Yanlış yerleştirme: puan değişmez, seri sıfırlanır. */
export function yanlisYerlesti(tur: TurPuani): TurPuani {
  return tur.seri === 0 ? tur : { ...tur, seri: 0 }
}

export type Yildiz = 1 | 2 | 3

/** Turun yıldızı: ilk denemede doğru oranı en az %90 ise 3, en az %60 ise 2, değilse 1. */
export function yildizSayisi(tur: Pick<TurPuani, 'ilk' | 'yer'>): Yildiz {
  if (tur.yer <= 0) return 1
  // Kesirle değil tam sayıyla karşılaştırılır: %90 sınırında kayan nokta hatası olmasın.
  if (tur.ilk * 10 >= tur.yer * 9) return 3
  if (tur.ilk * 10 >= tur.yer * 6) return 2
  return 1
}

const sayiMi = (x: unknown): x is number =>
  typeof x === 'number' && Number.isSafeInteger(x) && x >= 0

/** Kayıttan okunan tur puanı; bozuksa null (tur puanı baştan). */
export function turPuaniniCoz(ham: unknown): TurPuani | null {
  if (typeof ham !== 'object' || ham === null || Array.isArray(ham)) return null
  const { puan, ilk, yer, seri } = ham as Record<string, unknown>
  if (!sayiMi(puan) || !sayiMi(ilk) || !sayiMi(yer) || !sayiMi(seri) || ilk > yer) return null
  return { puan, ilk, yer, seri: Math.min(seri, SERI_UZUNLUGU - 1) }
}

/** Kayıttan okunan yıldız; bozuksa null. */
export function yildiziCoz(ham: unknown): Yildiz | null {
  return ham === 1 || ham === 2 || ham === 3 ? ham : null
}
