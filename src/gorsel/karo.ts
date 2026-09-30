// Ünsüz karosu: Fıstıkçı Şahap'ın Dükkânı'nda sınırdaki ünsüzün resmi (DESIGN.md, "Ünsüz
// karoları"). Terimler resimdir: sert ünsüz taş, yumuşak ünsüz jöle. İkisi 72×72'lik bir
// kutuda, biçimleriyle ayrılır; renk (--tas, --jole) ayrımı yalnız pekiştirir, Renksiz'de de
// biçim yeter.
//
//   taş   köşeleri yontulmuş bir çokgen; üstünde kısa bir çatlak (--cizik)
//   jöle  yuvarlak bir damla; üstünde --zemin renginde küçük bir parıltı
//
// İkisinin de çizgisi 3 mürekkep, harf ortada 30px Andika. Saf TypeScript'tir: React'i, DOM'u
// ya da CSS'i içe aktarmaz (bagimsizlik.test.ts ve tsconfig.motor.json denetler). Renkler ve
// çizgi kalınlıkları tema.css'tedir.

import type { Karo } from '../motor/index.ts'

/** Karonun kutusu (viewBox). */
export const KARO_KUTUSU = { en: 72, boy: 72 } as const

/** Taşın çatlağı ya da jölenin parıltısı. */
export type KaroIzi =
  | { readonly tur: 'çatlak'; readonly d: string }
  | {
      readonly tur: 'parıltı'
      readonly cx: number
      readonly cy: number
      readonly rx: number
      readonly ry: number
      /** Derece; elips merkezi çevresinde döner. */
      readonly aci: number
    }

export interface KaroCizimi {
  /** Gövdenin yolu. */
  readonly govde: string
  readonly iz: KaroIzi
  /** Harfin ortası: gövdenin görsel ortası. */
  readonly harf: { readonly x: number; readonly y: number }
}

// Taş: sekiz köşeli, yontukları eşit değil (el yapımı taş); kutunun içinde 6–66.
const TAS_GOVDESI = 'M17 7L53 6L65 18L66 51L55 65L17 66L6 54L7 19Z'
const TAS_CATLAGI = 'M53 11L47 19L51 24L45 31'

// Jöle: altı geniş, üstü daralan yuvarlak damla; kutunun içinde 8–66.
const JOLE_GOVDESI = 'M36 8C50 8 64 27 64 45C64 59 52 66 36 66C20 66 8 59 8 45C8 27 22 8 36 8Z'

export function karoCizimi(karo: Karo): KaroCizimi {
  return karo === 'taş'
    ? { govde: TAS_GOVDESI, iz: { tur: 'çatlak', d: TAS_CATLAGI }, harf: { x: 36, y: 38 } }
    : {
        govde: JOLE_GOVDESI,
        iz: { tur: 'parıltı', cx: 24, cy: 29, rx: 5.5, ry: 3.2, aci: -40 },
        harf: { x: 36, y: 44 },
      }
}

/** Karonun türünün adı: taş sert, jöle yumuşak (tezgâhtaki küçük yazı da budur). */
export const karoTuru = (karo: Karo): 'sert' | 'yumuşak' => (karo === 'taş' ? 'sert' : 'yumuşak')

/** Karonun erişilebilir adı: harf ve türü ("p, sert"). */
export const karoAdi = (harf: string, karo: Karo): string => `${harf}, ${karoTuru(karo)}`
