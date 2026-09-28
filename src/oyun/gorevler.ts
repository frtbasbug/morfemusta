// Oyun görevleri icerik/gorevler/*.csv dosyalarından okunur (CLAUDE.md, 4. kural). Hangi
// bölgenin hangi tabloyu oynadığını bölge tablosu söyler (bolgeler.ts). Görev yalnız kökü ve
// ekleri verir; doğru biçim her zaman motordan gelir (ekle, olasiBicimler), görev dosyasına
// yazılmaz.
//
//   sira      1'den başlayıp birer artar
//   kok       kök (Bukalemun Koyu'nda sözlükten; gorevler.test.ts denetler)
//   ekler     Leipzig kısaltmaları, eklenme sırasıyla, + ile: PL+POSS.1SG
//   renksiz   evet: kalın ve ince aynı gri, büyüyle renkler geri gelir; boş: renkli

import { EK_ENVANTERI, csvOku, ekle, type EkEnvanteri } from '../motor/index.ts'

export interface Gorev {
  /** Görevin sırası: 1, 2, 3 ... */
  readonly sira: number
  readonly kok: string
  /** Ekler, eklenme sırasıyla: ["PL", "POSS.1SG"]. Birden çoksa görev zincirlidir. */
  readonly etiketler: readonly string[]
  /** Kalın ve ince aynı gri (renk körlüğü denetimi); büyü olunca renkler geri gelir. */
  readonly renksiz: boolean
}

const BASLIKLAR = ['sira', 'kok', 'ekler', 'renksiz'] as const

export function gorevleriOku(csvMetni: string, envanter: EkEnvanteri = EK_ENVANTERI): Gorev[] {
  const gorevler: Gorev[] = []
  for (const { satirNo, alanlar } of csvOku(csvMetni.normalize('NFC'), BASLIKLAR)) {
    const hata = (neden: string) => new Error(`Görev tablosu, ${satirNo}. satır: ${neden}`)
    const sira = gorevler.length + 1
    const kok = alanlar.kok ?? ''
    const ekler = alanlar.ekler ?? ''
    const renksiz = alanlar.renksiz ?? ''

    if (alanlar.sira !== String(sira)) throw hata(`sıra ${sira} olur, "${alanlar.sira}" değil`)
    if (kok === '') throw hata('kök boş')
    if (ekler === '') throw hata('ek yok')
    const etiketler = ekler.split('+')
    for (const etiket of etiketler) {
      if (!envanter.has(etiket)) throw hata(`bilinmeyen ek etiketi: "${etiket}"`)
    }
    if (renksiz !== '' && renksiz !== 'evet') {
      throw hata(`renksiz boş ya da "evet" olur, "${renksiz}" değil`)
    }
    // Kök motorun kabul edeceği bir kök mü (alfabe, ünlü): hata satır numarasıyla bildirilir.
    try {
      ekle(kok, etiketler, envanter)
    } catch (e) {
      throw hata(e instanceof Error ? e.message : String(e))
    }
    gorevler.push({ sira, kok, etiketler, renksiz: renksiz === 'evet' })
  }
  return gorevler
}
