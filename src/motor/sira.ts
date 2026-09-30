// Ek sırası: yapım ekleri gövdeyi büyütür, çekim ekleri tepeye meyve gibi asılır; meyvenin
// üstüne gövde çıkmaz (DESIGN.md, "Kök Bahçesi"). Türkçe ismin ek dizisi şu sıradadır:
//
//   1. yapım ekleri (ekler.csv'deki tür sütunu); kendi aralarında sıra serbesttir
//   2. en çok bir çoğul (PL)
//   3. en çok bir iyelik (POSS.*)
//   4. en sonda en çok bir hâl eki (ACC, DAT, LOC, ABL, GEN, INS)
//
// Dizi soldan sağa okunur; ilk bozukluk döner:
//
//   meyve:<ETİKET>  çekim ekinden sonra gelen yapım eki (göz + PL + LIK → meyve:LIK)
//   çekim:<ETİKET>  çekim eki kendi yerinden önce ya da ikinci kez gelmiş
//                   (kitap + POSS.1SG + PL → çekim:PL; ev + ACC + DAT → çekim:DAT)
//
// Sözleşmesi tests/ek-sirasi.csv'dir. ekle ve olasiBicimler sırası bozuk dizide hata atar.

import { EK_ENVANTERI, type EkEnvanteri } from './envanter.ts'

export type EkSirasiHatasi = `meyve:${string}` | `çekim:${string}`

/** Hâl ekleri: dizinin en sonunda, en çok biri. */
const HAL_EKLERI: ReadonlySet<string> = new Set(['ACC', 'DAT', 'LOC', 'ABL', 'GEN', 'INS'])

/** Çekim ekinin dizideki yeri: çoğul 1, iyelik 2, hâl 3. */
function cekimYeri(etiket: string): number {
  if (etiket === 'PL') return 1
  if (etiket.startsWith('POSS.')) return 2
  if (HAL_EKLERI.has(etiket)) return 3
  throw new Error(`"${etiket}" çekim ekinin sırası bilinmiyor`)
}

/**
 * Ek dizisinin ilk sıra bozukluğu; sıra doğruysa undefined. Bilinmeyen etikette hata verir.
 *
 *     ekSirasiHatasi(['LIK', 'AGT', 'PL'])   // undefined
 *     ekSirasiHatasi(['PL', 'LIK'])          // "meyve:LIK"
 *     ekSirasiHatasi(['POSS.1SG', 'PL'])     // "çekim:PL"
 */
export function ekSirasiHatasi(
  etiketler: readonly string[],
  envanter: EkEnvanteri = EK_ENVANTERI,
): EkSirasiHatasi | undefined {
  // Son çekim ekinin yeri; çekim henüz yoksa 0.
  let sonYer = 0
  for (const etiket of etiketler) {
    const ek = envanter.get(etiket)
    if (!ek) throw new Error(`Bilinmeyen ek etiketi: "${etiket}"`)
    if (ek.tur === 'yapım') {
      if (sonYer > 0) return `meyve:${etiket}`
      continue
    }
    const yer = cekimYeri(etiket)
    if (yer <= sonYer) return `çekim:${etiket}`
    sonYer = yer
  }
  return undefined
}
