// Oyunun söyleyebileceği her metin, bölge bölge (DESIGN.md, "Ses ve resim"). Sesler önceden
// üretilir (scripts/ses-uret.py) ve cihazda çalar; ses-listesi.json her metnin dosyasını
// gösterir. Metinler oyunun mantığından ve motordan gelir, ekranların kullandığı işlevlerle:
// ekran bir metni söylemek istediğinde aynı metin burada da vardır (metinler.test.ts).
//
//   arayuz   bölge adları, haritanın iletileri, akşam ekranının ara yazısı
//   koy      her görevin kökü, her bukalemunun kuracağı aday (atlar, atler), doğru biçimler,
//            yanlış adayların neden cümleleri
//   dukkan   kök, iki karonun adayı (kitapım, kitabım), doğru biçim, neden cümleleri
//   bahce    hedef, kelimenin her hâli (kök, gövde kelimeleri), ekler, neden cümleleri
//   uyduruk  kök, her bukalemunun adayı (zelüye, zelüe), doğru biçimler (gıvakım, gıvağım),
//            İkisi de olur cümleleri, neden cümleleri
//
// Her bölgenin grubunda akşam ekranının başlığı da vardır. Saf TypeScript'tir.

import { ekle, olasiBicimler } from '../motor/index.ts'
import {
  bahceGorevi,
  denemeyiDegerlendir as bahceDenemesi,
  simdikiKelime,
} from '../oyun/bahce.ts'
import { BOLGELER, HAZIRLANIYOR_ILETISI, kilitIletisi, type Bolge } from '../oyun/bolgeler.ts'
import {
  TEZGAH,
  denemeyiDegerlendir as dukkanDenemesi,
  gorevinSiniri,
} from '../oyun/dukkan.ts'
import type { Gorev } from '../oyun/gorevler.ts'
import { adimiKur, denemeyiDegerlendir, type Adim } from '../oyun/koy.ts'
import { sinirCumlesi, uydurukAdimi, uydurukSiniri } from '../oyun/uyduruk.ts'

/** Akşam ekranında başlığın altındaki yazı. */
export const BUGUN_KURULANLAR = 'Bugün kurduğun kelimeler:'

export interface SesGrubu {
  /** arayuz ya da bölgenin kimliği. */
  readonly kimlik: string
  readonly ad: string
  /** Metinler, oyunda geçtikleri sırayla; grupta her biri bir kez. */
  readonly metinler: readonly string[]
}

/** Bir adımın metinleri: her kılığın adayı, yanlışsa cümlesi; sonra doğru biçim. */
function adimMetinleri(gorev: Gorev, adim: Adim): string[] {
  const metinler: string[] = []
  for (const { yuzey } of adim.secenekler) {
    const deneme = denemeyiDegerlendir(gorev, adim, yuzey)
    metinler.push(deneme.aday)
    if (deneme.cumle) metinler.push(deneme.cumle)
  }
  metinler.push(adim.bicim)
  return metinler
}

function koyMetinleri(gorev: Gorev): string[] {
  return [
    gorev.kok,
    ...gorev.etiketler.flatMap((_, sira) => adimMetinleri(gorev, adimiKur(gorev, sira))),
  ]
}

function dukkanMetinleri(gorev: Gorev): string[] {
  const sinir = gorevinSiniri(gorev)
  return [
    gorev.kok,
    ...TEZGAH.flatMap((karo) => {
      const { aday, cumle } = dukkanDenemesi(gorev, sinir, karo)
      return cumle ? [aday, cumle] : [aday]
    }),
    ekle(gorev.kok, gorev.etiketler).bicim,
  ]
}

function bahceMetinleri(gorev: Gorev): string[] {
  const bahce = bahceGorevi(gorev)
  const metinler = [bahce.hedef]
  bahce.parcalar.forEach((_, kurulan) => {
    metinler.push(simdikiKelime(bahce, kurulan))
    // Sepette kalanlar: sıradaki ve ondan sonrakiler.
    for (const parca of bahce.parcalar.slice(kurulan)) {
      metinler.push(parca.yuzey)
      const { cumle } = bahceDenemesi(bahce, kurulan, parca.sira)
      if (cumle) metinler.push(cumle)
    }
  })
  metinler.push(simdikiKelime(bahce, bahce.parcalar.length))
  return metinler
}

function uydurukMetinleri(gorev: Gorev): string[] {
  const metinler = [gorev.kok, ...adimMetinleri(gorev, uydurukAdimi(gorev))]
  metinler.push(...olasiBicimler(gorev.kok, gorev.etiketler))
  if (uydurukSiniri(gorev)) metinler.push(sinirCumlesi(gorev))
  return metinler
}

/** Bölgelerin görev metinleri, bölge kimliğiyle. Yeni bölge buraya da eklenir. */
const GOREV_METINLERI: Readonly<Record<string, (gorev: Gorev) => string[]>> = {
  koy: koyMetinleri,
  dukkan: dukkanMetinleri,
  bahce: bahceMetinleri,
  uyduruk: uydurukMetinleri,
}

const tekil = (metinler: readonly string[]): string[] => [
  ...new Set(metinler.map((m) => m.normalize('NFC')).filter((m) => m !== '')),
]

export function sesMetinleri(bolgeler: readonly Bolge[] = BOLGELER): SesGrubu[] {
  const arayuz: SesGrubu = {
    kimlik: 'arayuz',
    ad: 'Arayüz',
    metinler: tekil([
      ...bolgeler.map((b) => b.ad),
      ...bolgeler.slice(1).map((_, i) => kilitIletisi(bolgeler[i])),
      HAZIRLANIYOR_ILETISI,
      BUGUN_KURULANLAR,
    ]),
  }
  const gruplar = bolgeler.map((bolge): SesGrubu => {
    const gorevMetinleri = Object.hasOwn(GOREV_METINLERI, bolge.kimlik)
      ? GOREV_METINLERI[bolge.kimlik]
      : undefined
    if (bolge.gorevler.length > 0 && !gorevMetinleri) {
      throw new Error(`${bolge.kimlik} bölgesinin ses metinleri yazılmadı`)
    }
    return {
      kimlik: bolge.kimlik,
      ad: bolge.ad,
      metinler: tekil([bolge.aksam, ...bolge.gorevler.flatMap((g) => gorevMetinleri?.(g) ?? [])]),
    }
  })
  return [arayuz, ...gruplar]
}
