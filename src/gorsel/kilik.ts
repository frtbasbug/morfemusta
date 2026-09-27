// Motorun sonucundan karakterin görünüşüne: bukalemunun kılığı ve özelliklerin adları.
// Saf TypeScript'tir; uyumu kendisi hesaplamaz, motora sorar.

import {
  sablonuCoz,
  uyum,
  type EkParcasi,
  type Unlu,
  type UnluOzellikleri,
} from '../motor/index.ts'
import { UNLULER } from './cizim.ts'

const unluMu = (harf: string): harf is Unlu => Object.hasOwn(UNLULER, harf)

/** Üç özelliğin adları, karakterlerin aria-label'ında: "kalın, düz, geniş". */
export function ozellikAdlari({ kalin, yuvarlak, genis }: UnluOzellikleri): string {
  return [kalin ? 'kalın' : 'ince', yuvarlak ? 'yuvarlak' : 'düz', genis ? 'geniş' : 'dar'].join(
    ', ',
  )
}

export interface Kilik {
  /** Bukalemunun üstündeki yazı: ekin yüzey biçimi ("lar", "ım", "m"). */
  readonly yazi: string
  /** Bukalemunun kılığına girdiği ünlü. */
  readonly unlu: Unlu
  /** Ekin ünlüsü yüzeye çıkmadı (kedim): bukalemun zemine karışır. */
  readonly saklanan: boolean
}

/**
 * Bukalemun ekin yüzeydeki ilk ünlüsünün kılığına girer. Ek ünlüsüz kalırsa (kedi + -(I)m →
 * m) bukalemun saklanır; biçimi, saklanan ünlüye uyumun seçeceği ünlününkidir (i).
 *
 *     bukalemunKiligi(ekle('göz', ['PL']).parcalar[0])        // ler, e
 *     bukalemunKiligi(ekle('kedi', ['POSS.1SG']).parcalar[0]) // m, i, saklanan
 */
export function bukalemunKiligi(parca: EkParcasi): Kilik {
  const ilkUnlu = [...parca.yuzey].find(unluMu)
  if (ilkUnlu !== undefined) return { yazi: parca.yuzey, unlu: ilkUnlu, saklanan: false }

  for (const olay of parca.olaylar) {
    if (olay.tur !== 'saklanma') continue
    const birim = sablonuCoz(parca.sablon).find((b) => b.yazim === olay.birim)
    if (birim?.tur !== 'ayracli-unlu') continue
    // Saklanan (I) ünlüden sonra gelir. İnce ek ise ünsüzle biten misafir kelimelerde olur
    // (saat, gol); bu yüzden saklanan ünlüye düzenli uyum bakar.
    const oncesi = parca.govde + parca.yuzey.slice(0, olay.konum)
    const { sonuc } = uyum(oncesi, birim, olay.konum, false)
    return { yazi: parca.yuzey, unlu: sonuc, saklanan: true }
  }
  throw new Error(`"${parca.yuzey}" (${parca.sablon}) ekinde ne yüzey ünlüsü ne saklanan ünlü var`)
}
