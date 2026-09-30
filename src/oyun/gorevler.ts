// Oyun görevleri icerik/gorevler/*.csv dosyalarından okunur (CLAUDE.md, 4. kural). Hangi
// bölgenin hangi tabloyu oynadığını bölge tablosu söyler (bolgeler.ts). Görev yalnız kökü ve
// ekleri verir; doğru biçim her zaman motordan gelir (ekle, olasiBicimler), görev dosyasına
// yazılmaz.
//
//   tur       isteğe bağlı: Uydurukçuklar'ın tablosunda (tur,sira,kok,ekler) turun numarası;
//             1'den başlar, birer artar. Turlu tabloda sira turun içindeki sıradır; Gorev'in
//             sirası ise bütün tablodaki sırasıdır (1, 2 ... 100). Tursuz tabloda tek tur var.
//   sira      1'den başlayıp birer artar
//   kok       kök (Bukalemun Koyu'nda sözlükten; gorevler.test.ts denetler)
//   ekler     Leipzig kısaltmaları, eklenme sırasıyla, + ile: PL+POSS.1SG
//   renksiz   evet: kalın ve ince aynı gri, büyüyle renkler geri gelir; boş: renkli.
//             Sütun isteğe bağlıdır: Fıstıkçı Şahap'ın Dükkânı'nın, Kök Bahçesi'nin ve
//             Uydurukçuklar'ın tablosunda yoktur; yoksa her görev renklidir.

import { EK_ENVANTERI, csvOku, ekle, type EkEnvanteri } from '../motor/index.ts'

export interface Gorev {
  /**
   * Görevin bütün tablodaki sırası: 1, 2, 3 ... İlerleme bunu saklar (bitenler). Turlu
   * tabloda turun içindeki sıra ayrıca turdakiSira'dadır.
   */
  readonly sira: number
  /** Görevin turu (1'den); tursuz tabloda hep 1. */
  readonly tur: number
  /** Görevin turdaki sırası (1'den); tursuz tabloda sira ile aynı. */
  readonly turdakiSira: number
  readonly kok: string
  /** Ekler, eklenme sırasıyla: ["PL", "POSS.1SG"]. Birden çoksa görev zincirlidir. */
  readonly etiketler: readonly string[]
  /** Kalın ve ince aynı gri (renk körlüğü denetimi); büyü olunca renkler geri gelir. */
  readonly renksiz: boolean
}

const BASLIKLAR = ['sira', 'kok', 'ekler', 'renksiz'] as const
const RENKSIZ_SUTUNSUZ = ['sira', 'kok', 'ekler'] as const
const TURLU = ['tur', 'sira', 'kok', 'ekler'] as const

export function gorevleriOku(csvMetni: string, envanter: EkEnvanteri = EK_ENVANTERI): Gorev[] {
  const metin = csvMetni.normalize('NFC')
  const ilkSatir = metin.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0]
  const basliklar =
    ilkSatir === RENKSIZ_SUTUNSUZ.join(',')
      ? RENKSIZ_SUTUNSUZ
      : ilkSatir === TURLU.join(',')
        ? TURLU
        : BASLIKLAR
  const gorevler: Gorev[] = []
  for (const { satirNo, alanlar } of csvOku(metin, basliklar)) {
    const hata = (neden: string) => new Error(`Görev tablosu, ${satirNo}. satır: ${neden}`)
    const sira = gorevler.length + 1
    const kok = alanlar.kok ?? ''
    const ekler = alanlar.ekler ?? ''
    const renksiz = alanlar.renksiz ?? ''

    // Turlu tabloda sıra her turda 1'den başlar; yeni tur bir öncekinden bir fazladır.
    const onceki = gorevler.at(-1)
    let tur = 1
    let turdakiSira = sira
    if (alanlar.tur !== undefined) {
      const yeniTur = alanlar.sira === '1'
      tur = yeniTur ? (onceki?.tur ?? 0) + 1 : (onceki?.tur ?? 1)
      turdakiSira = yeniTur ? 1 : (onceki?.turdakiSira ?? 0) + 1
      if (alanlar.tur !== String(tur)) throw hata(`tur ${tur} olur, "${alanlar.tur}" değil`)
      if (alanlar.sira !== String(turdakiSira)) {
        throw hata(`sıra ${turdakiSira} olur, "${alanlar.sira}" değil`)
      }
    } else if (alanlar.sira !== String(sira)) {
      throw hata(`sıra ${sira} olur, "${alanlar.sira}" değil`)
    }
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
    gorevler.push({ sira, tur, turdakiSira, kok, etiketler, renksiz: renksiz === 'evet' })
  }
  return gorevler
}

/** Görevler turlarına göre, tur sırasıyla; tursuz tabloda tek tur. */
export function turlar(gorevler: readonly Gorev[]): Gorev[][] {
  const gruplar: Gorev[][] = []
  for (const gorev of gorevler) {
    const grup = gruplar[gorev.tur - 1]
    if (grup) grup.push(gorev)
    else gruplar[gorev.tur - 1] = [gorev]
  }
  return gruplar
}

/**
 * Bütün tablodaki bir yerin (0'dan) turu: turun görevleri ve yerin turdaki yeri. Tablo dışı
 * bir yer ilk turun başıdır.
 */
export function turunYeri(
  gorevler: readonly Gorev[],
  yer: number,
): { readonly gorevler: readonly Gorev[]; readonly yer: number } {
  const gorev = gorevler[yer] ?? gorevler[0]
  if (!gorev) return { gorevler: [], yer: 0 }
  const turunGorevleri = gorevler.filter((g) => g.tur === gorev.tur)
  return { gorevler: turunGorevleri, yer: gorev.turdakiSira - 1 }
}
