// Sabit tohumlu karıştırma: seçeneklerin sırası her görevde karışıktır, ama her açılışta
// aynıdır. Sayı üreteci mulberry32, karıştırma Fisher–Yates.

/** Tohumdan [0, 1) aralığında sayılar üreten, her çağrıda aynı diziyi veren üreteç. */
function uretec(tohum: number): () => number {
  let durum = tohum >>> 0
  return () => {
    durum = (durum + 0x6d2b79f5) >>> 0
    let t = durum
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Dizinin karıştırılmış bir kopyası; aynı tohum hep aynı sırayı verir. Dizi değişmez. */
export function tohumluKaristir<T>(dizi: readonly T[], tohum: number): T[] {
  const sonuc = [...dizi]
  const sayi = uretec(tohum)
  for (let i = sonuc.length - 1; i > 0; i--) {
    const j = Math.floor(sayi() * (i + 1))
    const gecici = sonuc[i] as T
    sonuc[i] = sonuc[j] as T
    sonuc[j] = gecici
  }
  return sonuc
}
