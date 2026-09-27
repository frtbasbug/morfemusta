// Biçim Denetim Sayfası'nın verisi: sözlükteki her kök, işaretleri ve sekiz ekle biçimleri.
// Sayfa ve scripts/zeyrek-denetimi.py (scripts/denetim-bicimleri.mjs üzerinden) aynı veriyi
// kullanır. Saf TypeScript'tir; DOM'a dokunmaz.

import {
  EK_ENVANTERI,
  KOK_SOZLUGU,
  ekle,
  type KokGirdisi,
  type KokSozlugu,
} from '../motor/index.ts'

export const DENETIM_ETIKETLERI = [
  'PL',
  'ACC',
  'DAT',
  'LOC',
  'POSS.1SG',
  'POSS.3SG',
  'GEN',
  'PROP',
] as const

export type DenetimEtiketi = (typeof DENETIM_ETIKETLERI)[number]

export interface DenetimSatiri {
  readonly girdi: KokGirdisi
  /** Sözlükteki işaretler, okunur adlarıyla: "yumuşar", "ünlü düşer", "ince ek" ... */
  readonly isaretler: readonly string[]
  /** DENETIM_ETIKETLERI sırasıyla. */
  readonly bicimler: readonly { readonly etiket: DenetimEtiketi; readonly bicim: string }[]
}

/** icerik/kokler.csv sütunlarındaki işaretlerin sayfadaki adları. */
export function isaretAdlari(girdi: KokGirdisi): string[] {
  const adlar: string[] = []
  if (girdi.yumusama === true) adlar.push('yumuşar')
  if (girdi.yumusama === false) adlar.push('yumuşamaz')
  if (girdi.unluDusmesi) adlar.push('ünlü düşer')
  if (girdi.istisna === 'ince-ek') adlar.push('ince ek')
  if (girdi.istisna === 'ikiz') adlar.push('ikiz')
  if (girdi.istisna === 'su') adlar.push('su')
  return adlar
}

/** Sözlükteki her kök için bir satır, sözlükteki sırasıyla. */
export function denetimSatirlari(sozluk: KokSozlugu = KOK_SOZLUGU): DenetimSatiri[] {
  return [...sozluk.values()].map((girdi) => ({
    girdi,
    isaretler: isaretAdlari(girdi),
    bicimler: DENETIM_ETIKETLERI.map((etiket) => ({
      etiket,
      bicim: ekle(girdi.kok, [etiket], EK_ENVANTERI, sozluk).bicim,
    })),
  }))
}
