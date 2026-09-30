// Ünsüz sınırı: Fıstıkçı Şahap'ın Dükkânı'nda çocuk ünlüyü değil, sınırdaki ünsüzü seçer.
// Sert ünsüz taştır, yumuşak ünsüz jöle (DESIGN.md, "Terimler resimdir"). İki tür sınır var:
//
//   gövde    kök p, ç, t ya da k ile biter, köke gelen ilk ek ünlüyle başlar: yumuşama.
//            kita_ım: p (taş) mı, b (jöle) mi? Kökün kendi sesi taştır.
//   ek başı  ek D ya da C ile başlar: benzeşme. kitap_a: t (taş) mı, d (jöle) mi? Ekin
//            kendi başı (-da, -cı) jöledir; sert ünsüzden sonra taşa döner.
//
// Doğru karo her zaman motordan gelir (ekle, olasiEklemeler). Sözlükteki kökte gövde sınırı
// sözlük işaretine bağlıdır (kitabım, topum); uydurma kökte iki karo da doğrudur (pıtakı,
// pıtağı). Ek başı her kökte kurala bağlıdır (Oturum 3).

import { ekle, olasiEklemeler, yumusakKarsilik, type EkParcasi } from './ekle.ts'
import { EK_ENVANTERI, type EkEnvanteri } from './envanter.ts'
import { sablonuCoz, type UnsuzArkafonemi } from './sablon.ts'
import { sertMi, sonSes, unluMu, yumusayanMi } from './ses.ts'
import { KOK_SOZLUGU, type KokSozlugu } from './sozluk.ts'

/** Sınırdaki ünsüzün resmi: sert ünsüz taş, yumuşak ünsüz jöle. */
export type Karo = 'taş' | 'jöle'

export type SinirYeri = 'gövde' | 'ek başı'

export interface Sinir {
  readonly yer: SinirYeri
  /** Sınırın ekinin etiketi; gövde sınırında köke gelen ilk ek. */
  readonly etiket: string
  /** Sınırın ekinin sırası (0'dan). Gövde sınırında 0. */
  readonly ekSirasi: number
  /** Yuvanın doğru biçimdeki yeri (0'dan). */
  readonly konum: number
  /** Yuvanın solundaki ve sağındaki parçalar (doğru biçimden): kita + ım, kitap + a. */
  readonly sol: string
  readonly sag: string
  /** Taş ve jöle harfleri: p / b, t / d, ç / c, k / ğ. */
  readonly tas: string
  readonly jole: string
  /** Doğru karolar: çoğunlukla biri; uydurma kökün gövde sınırında ikisi. */
  readonly dogrular: readonly Karo[]
  /**
   * Kuraldan önceki ses: gövdede kökün kendi sesi (taş, kitap), ek başında ekin kendi başı
   * (jöle, -da). Doğru karo bundan farklıysa ses değişmiştir (kitabım, kitapta).
   */
  readonly asil: Karo
  /** Sınırın ekinin doğru parçası (ekle): gövdesi ve yüzeyiyle. */
  readonly parca: EkParcasi
}

/** Ek başındaki bir ünsüz arkafonemi (D, C): yüzeydeki yeri ve karşılıkları. */
export interface UnsuzYuvasi {
  /** Ekin yüzeyindeki yeri (0'dan). */
  readonly konum: number
  readonly arkafonem: UnsuzArkafonemi
  readonly tas: 't' | 'ç'
  readonly jole: 'd' | 'c'
}

const KARSILIK: Readonly<Record<UnsuzArkafonemi, { tas: 't' | 'ç'; jole: 'd' | 'c' }>> = {
  D: { tas: 't', jole: 'd' },
  C: { tas: 'ç', jole: 'c' },
}

/**
 * Ek parçasının yüzeyindeki D ve C yuvaları. Şablon, parçanın olaylarına bakılarak yüzeyle
 * eşlenir: zamir n başa bir ses ekler, saklanan ayraçlı birim ve tekrarlanmayan çoğul yer
 * tutmaz.
 */
export function unsuzYuvalari(parca: EkParcasi): UnsuzYuvasi[] {
  let birimler = sablonuCoz(parca.sablon)
  const cogul = parca.olaylar.find((o) => o.tur === 'çoğul tekrarlanmaz')
  if (cogul) birimler = birimler.slice(sablonuCoz(cogul.birim).length)
  const saklananlar = parca.olaylar.filter((o) => o.tur === 'saklanma')
  let konum = parca.olaylar.some((o) => o.tur === 'zamir n') ? 1 : 0
  const yuvalar: UnsuzYuvasi[] = []
  for (const birim of birimler) {
    const saklandi = saklananlar.some((o) => o.birim === birim.yazim && o.konum === konum)
    if (saklandi) continue
    if (birim.tur === 'unsuz') {
      yuvalar.push({ konum, arkafonem: birim.arkafonem, ...KARSILIK[birim.arkafonem] })
    }
    konum++
  }
  if (konum !== parca.yuzey.length) {
    throw new Error(`${parca.sablon} şablonu "${parca.yuzey}" yüzeyiyle eşlenemedi`)
  }
  return yuvalar
}

const karoOf = (harf: string | undefined, tas: string): Karo => (harf === tas ? 'taş' : 'jöle')

/**
 * Kök + eklerde çocuğun seçeceği ünsüz sınırları, kelimedeki sırasıyla. Gövde sınırı yalnız
 * köke gelen ilk ekte olur: kök p, ç, t ya da k ile biter, ek yüzeyde ünlüyle başlar (ikizleşen
 * kökte yok: hakkı). Ek başı, her ekin D ve C yuvasıdır.
 *
 *     sinirSecenekleri('kitap', ['POSS.1SG'])  // [gövde: kita + ım, p / b, doğru jöle]
 *     sinirSecenekleri('kitap', ['LOC'])       // [ek başı: kitap + a, t / d, doğru taş]
 *     sinirSecenekleri('pıtak', ['ACC'])       // [gövde: pıta + ı, k / ğ, ikisi de doğru]
 */
export function sinirSecenekleri(
  kok: string,
  etiketler: readonly string[],
  envanter: EkEnvanteri = EK_ENVANTERI,
  sozluk: KokSozlugu = KOK_SOZLUGU,
): Sinir[] {
  const temizKok = kok.normalize('NFC')
  const { bicim, parcalar } = ekle(temizKok, etiketler, envanter, sozluk)
  const olasilar = olasiEklemeler(temizKok, etiketler, envanter, sozluk)
  const sinirlar: Sinir[] = []

  const ilk = parcalar[0]
  const tas = sonSes(temizKok)
  const jole = yumusakKarsilik(temizKok)
  const ikiz = ilk?.olaylar.some((o) => o.tur === 'ikizleşme') ?? false
  if (ilk && yumusayanMi(tas) && jole !== undefined && unluMu(ilk.yuzey[0]) && !ikiz) {
    const konum = ilk.govde.length - 1
    const dogrular = new Set(olasilar.map((o) => karoOf(o.parcalar[0]?.govde.at(-1), tas)))
    sinirlar.push({
      yer: 'gövde',
      etiket: ilk.etiket,
      ekSirasi: 0,
      konum,
      sol: bicim.slice(0, konum),
      sag: bicim.slice(konum + 1),
      tas,
      jole,
      dogrular: (['taş', 'jöle'] as const).filter((k) => dogrular.has(k)),
      asil: 'taş',
      parca: ilk,
    })
  }

  parcalar.forEach((parca, ekSirasi) => {
    for (const yuva of unsuzYuvalari(parca)) {
      const konum = parca.govde.length + yuva.konum
      const dogrular = new Set(olasilar.map((o) => karoOf(o.bicim[konum], yuva.tas)))
      sinirlar.push({
        yer: 'ek başı',
        etiket: parca.etiket,
        ekSirasi,
        konum,
        sol: bicim.slice(0, konum),
        sag: bicim.slice(konum + 1),
        tas: yuva.tas,
        jole: yuva.jole,
        dogrular: (['taş', 'jöle'] as const).filter((k) => dogrular.has(k)),
        asil: 'jöle',
        parca,
      })
    }
  })
  return sinirlar.sort((a, b) => a.konum - b.konum)
}

/** Ek başının kurala göre beklenen karosu: sert ünsüzden sonra taş, değilse jöle. */
export function ekBasiBeklenen(oncekiSes: string | undefined): Karo {
  return sertMi(oncekiSes) ? 'taş' : 'jöle'
}
