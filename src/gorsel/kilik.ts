// Bukalemun ek, ekin yüzeydeki ünlüsünün kılığına girer (DESIGN.md, "Görsel dil"). Kılık
// ekle() sonucundaki ek parçasından okunur: ekin yüzeyindeki ilk ünlü. Ek yüzeyde ünlüsüz
// kalırsa (kedi + POSS.1SG → kedim) bukalemun saklanır; biçimi, saklanan ünlünün uyumla
// olacağı ünlününkidir (i). Bunu motorun kendi uyum kuralı verir; burada kural yazılmaz.
//
// Saf TypeScript'tir: React'i, DOM'u ya da CSS'i içe aktarmaz (bagimsizlik.test.ts ve
// tsconfig.motor.json denetler).

import {
  UNLULER,
  sablonuCoz,
  uyum,
  type EkParcasi,
  type Unlu,
  type UnluOzellikleri,
} from '../motor/index.ts'

export interface Kilik {
  /** Yüzeydeki ilk ünlü; ek ünlüsüzse saklanan ünlünün uyumla olacağı ünlü. */
  readonly unlu: Unlu
  readonly ozellikler: UnluOzellikleri
  /** Ek yüzeyde ünlüsüz kaldı: bukalemun zemine karışır. */
  readonly saklanan: boolean
  /** Bukalemunun üstündeki yazı: ekin yüzeyi ("lar", "ım", saklananda yalnız "m"). */
  readonly yazi: string
}

const unluMu = (harf: string): harf is Unlu => Object.hasOwn(UNLULER, harf)

export function bukalemunKiligi(parca: EkParcasi): Kilik {
  const yuzeydeki = [...parca.yuzey].find(unluMu)
  const unlu = yuzeydeki ?? saklananUnlu(parca)
  return {
    unlu,
    ozellikler: UNLULER[unlu],
    saklanan: yuzeydeki === undefined,
    yazi: parca.yuzey,
  }
}

/**
 * Yüzeye çıkmayan ayraçlı ünlünün ((I)) uyumla olacağı ünlü. Olağan uyum uygulanır; ince ek
 * (misafir kelime) hesaba katılmaz, çünkü ek parçası kökün sözlük işaretini taşımaz. Bugün
 * bu bir eksik değildir: sözlükteki ince-ek kökleri ünsüzle biter, (I) ise yalnız ünlüden
 * sonra saklanır (kilik.test.ts denetler).
 */
function saklananUnlu(parca: EkParcasi): Unlu {
  const birimler = sablonuCoz(parca.sablon)
  for (const olay of parca.olaylar) {
    if (olay.tur !== 'saklanma') continue
    const birim = birimler.find((b) => b.yazim === olay.birim)
    if (birim?.tur !== 'ayracli-unlu') continue
    const oncesi = parca.govde + parca.yuzey.slice(0, olay.konum)
    return uyum(oncesi, birim, olay.konum, false).sonuc
  }
  throw new Error(
    `${parca.govde} + ${parca.sablon}: ekin yüzeyinde ünlü yok, saklanan bir ünlüsü de yok`,
  )
}
