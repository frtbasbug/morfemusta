// Sesbilgisi tabloları: sekiz ünlünün özellikleri ve sert ünsüzler (DESIGN.md,
// "Ünlü karakterleri").

export type Unlu = 'a' | 'e' | 'ı' | 'i' | 'o' | 'ö' | 'u' | 'ü'

/** Her ünlü üç ikili özellik taşır. */
export interface UnluOzellikleri {
  /** kalın (true) / ince (false) */
  readonly kalin: boolean
  /** yuvarlak (true) / düz (false) */
  readonly yuvarlak: boolean
  /** geniş (true) / dar (false) */
  readonly genis: boolean
}

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

/** Sert ünsüzler: "fıstıkçı şahap". */
export const SERT_UNSUZLER: ReadonlySet<string> = new Set('fstkçşhp')

export type YumusayanUnsuz = 'p' | 'ç' | 't' | 'k'

/**
 * Ünsüz yumuşaması: ünlüyle başlayan ekten önce p→b, ç→c, t→d, k→ğ (kitabı, ağacı, armudu,
 * çocuğu). n'den sonra k, g olur (rengi); bunu ekle.ts uygular.
 */
export const YUMUSAMA: Readonly<Record<YumusayanUnsuz, 'b' | 'c' | 'd' | 'ğ'>> = {
  p: 'b',
  ç: 'c',
  t: 'd',
  k: 'ğ',
}

/** Türk alfabesinin 29 küçük harfi. */
export const ALFABE: ReadonlySet<string> = new Set('abcçdefgğhıijklmnoöprsştuüvyz')

export function unluMu(ses: string | undefined): ses is Unlu {
  return ses !== undefined && Object.hasOwn(UNLULER, ses)
}

export function sertMi(ses: string | undefined): boolean {
  return ses !== undefined && SERT_UNSUZLER.has(ses)
}

export function yumusayanMi(ses: string | undefined): ses is YumusayanUnsuz {
  return ses !== undefined && Object.hasOwn(YUMUSAMA, ses)
}

/** Özellikleri verilen ünlüyü bulur; üç özellik birlikte tek bir ünlüyü belirler. */
export function unluBul(ozellikler: UnluOzellikleri): Unlu {
  for (const [unlu, o] of Object.entries(UNLULER) as [Unlu, UnluOzellikleri][]) {
    if (
      o.kalin === ozellikler.kalin &&
      o.yuvarlak === ozellikler.yuvarlak &&
      o.genis === ozellikler.genis
    ) {
      return unlu
    }
  }
  throw new Error('Özellik tablosu eksik: bu özelliklerde ünlü yok')
}

/** Metnin son ünlüsünün yeri; ünlü yoksa -1. */
export function sonUnluKonumu(metin: string): number {
  for (let i = metin.length - 1; i >= 0; i--) {
    if (unluMu(metin[i])) return i
  }
  return -1
}

/** Metnin son ünlüsü; ünlü yoksa undefined. */
export function sonUnlu(metin: string): Unlu | undefined {
  const ses = metin[sonUnluKonumu(metin)]
  return unluMu(ses) ? ses : undefined
}

/** Metnin son sesi (son harfi). */
export function sonSes(metin: string): string | undefined {
  return metin.at(-1)
}
