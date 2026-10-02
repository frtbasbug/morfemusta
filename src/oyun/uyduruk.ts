// Uydurukçuklar'ın oyun mantığı: wug görevleri. Saf TypeScript'tir; DOM'a ve React'e dokunmaz.
// Ekran (src/ekranlar/Uydurukcuklar.tsx) durumu bu indirgeyiciyle değiştirir, hareketleri
// kendisi canlandırır.
//
// Her görevde adı uydurma bir kök olan bir yaratık var (fıngıl, gıvak, zelü). Çocuk Bukalemun
// Koyu'ndaki gibi doğru bukalemunu yaratığa taşır: çoğalt (PL), sahiplen (POSS.1SG), bir yere
// koy (LOC), ona gönder (DAT). Kıyıya ekin bütün kılıkları gelir; -(y)A'da kaynaştırmalı ve
// kaynaştırmasız olanlar birlikte (ya, ye, a, e). Yalnız kategorik kurallar puanlanır: ünlü
// uyumu, benzeşme, kaynaştırma. Doğruluk motordan gelir (koy.ts'teki deneme: neden).
//
// Kök p, ç, t ya da k ile bitip ek ünlüyle başlarsa (gıvak + ım) doğru bukalemun oturunca
// Dükkân'daki gibi bir sınır adımı gelir: taş da jöle de doğrudur (gıvakım, gıvağım). Kurulan
// biçim çocuğun seçtiğidir; Sözlük kartı onu saklar.

import {
  olasiBicimler,
  olasiEklemeler,
  sinirSecenekleri,
  type EklemeSonucu,
  type EkParcasi,
  type Karo,
  type Sinir,
} from '../motor/index.ts'
import type { Gorev } from './gorevler.ts'
import { adimiKur, denemeyiDegerlendir, dogruMu, type Adim, type Deneme } from './koy.ts'

export { denemeyiDegerlendir, dogruMu, type Adim, type Deneme }

/** Ekin büyüsü: yaratığa olan, resimsiz. */
export type UydurukBuyusu = 'çoğalır' | 'cebe girer' | 'yıldız üstünde' | 'yıldız gelir'

/**
 * Büyüler: PL yaratığı üçe çoğaltır; POSS.1SG cebe koyar (Koy'daki cep); LOC'ta küçük bir
 * yıldız yaratığın üstünde durur (bulunma); DAT'ta yıldız yaratığa doğru uçar (yönelme).
 */
export const UYDURUK_BUYULERI: Readonly<Record<string, UydurukBuyusu>> = {
  PL: 'çoğalır',
  'POSS.1SG': 'cebe girer',
  LOC: 'yıldız üstünde',
  DAT: 'yıldız gelir',
}

/**
 * Görevin tek adımı: kök + tek ek. Kıyıda neden'in kabul ettiği bütün kılıklar: kaynaştırmalı
 * ve kaynaştırmasız (ya, ye, a, e), D yuvasında taş ve jöle (da, de, ta, te); benzeşme de sınanır.
 */
export function uydurukAdimi(gorev: Gorev): Adim {
  if (gorev.etiketler.length !== 1) {
    throw new Error(`${gorev.sira}. görevde (${gorev.kok}) tek bir ek olmalı`)
  }
  return adimiKur(gorev, 0, { kaynastirma: true, unsuz: true })
}

/**
 * Görevin sınır adımı: gövde sınırında iki karo da doğruysa (uydurma kök p, ç, t ya da k ile
 * biter, ek ünlüyle başlar: gıva_ım) o sınır; yoksa null.
 */
export function uydurukSiniri(gorev: Gorev): Sinir | null {
  const sinir = sinirSecenekleri(gorev.kok, gorev.etiketler).find((s) => s.yer === 'gövde')
  return sinir && sinir.dogrular.length === 2 ? sinir : null
}

/** Sınır adımının cümlesi: İkisi de olur: gıvakım, gıvağım. */
export function sinirCumlesi(gorev: Gorev): string {
  return `İkisi de olur: ${olasiBicimler(gorev.kok, gorev.etiketler).join(', ')}.`
}

/**
 * Kurulan biçim ve parçaları: sınır adımında çocuğun seçtiği karoyla (taş: gıvakım, jöle:
 * gıvağım), yoksa motorun biçimi.
 */
export function kurulanBicim(gorev: Gorev, sinir: Sinir | null, karo: Karo | null): EklemeSonucu {
  const eklemeler = olasiEklemeler(gorev.kok, gorev.etiketler)
  const [varsayilan] = eklemeler
  if (!varsayilan) throw new Error(`${gorev.kok} + ${gorev.etiketler.join('+')}: biçim yok`)
  if (!sinir || !karo) return varsayilan
  const harf = karo === 'taş' ? sinir.tas : sinir.jole
  return eklemeler.find((e) => e.parcalar[0]?.govde.at(-1) === harf) ?? varsayilan
}

/**
 * Oyunun evresi:
 *   secim    çocuk bir bukalemun seçiyor ya da taşıyor
 *   deneme   bir taşıma canlandırılıyor; seçim kapalı
 *   sinir    doğru bukalemun oturdu; tezgâh geldi, çocuk taş ya da jöle seçiyor
 *   oturdu   karo yuvaya oturdu; jöleyse taş erir
 *   buyu     kelime kuruldu; büyü canlandırılıyor
 *   bitti    görev bitti; Sıradaki düğmesi
 *   kapanis  turun görevleri bitti; akşam ekranı
 */
export type Evre = 'secim' | 'deneme' | 'sinir' | 'oturdu' | 'buyu' | 'bitti' | 'kapanis'

export interface UydurukDurumu {
  /** Turun görevleri. */
  readonly gorevler: readonly Gorev[]
  /** Oynanan görevin turdaki yeri (0'dan); görevler bitince gorevler.length. */
  readonly gorevYeri: number
  readonly adim: Adim | null
  /** Görevin sınır adımı; yoksa null. */
  readonly sinir: Sinir | null
  readonly evre: Evre
  /** Dokun-dokun ya da klavyeyle seçilen bukalemunun yüzeyi. */
  readonly secili: string | null
  readonly deneme: Deneme | null
  /** Son yanlış taşıma: nedeni kelimenin altında görünür, yeni taşımaya kadar kalır. */
  readonly yanlis: Deneme | null
  /** Doğru bukalemun oturdu: ekin doğru parçası (kelimede bukalemunun renginde kalır). */
  readonly birlesen: EkParcasi | null
  /** Sınır adımında seçilen karo (dokun-dokun, klavye). */
  readonly seciliKaro: Karo | null
  /** Yuvaya oturan karo. */
  readonly karo: Karo | null
  /** Kurulan biçim: sınır adımı varsa çocuğun seçtiği. Büyüden önce null. */
  readonly kurulan: EklemeSonucu | null
  /** Büyü oldu: yaratığa olan. */
  readonly buyu: UydurukBuyusu | null
}

export type UydurukEylemi =
  | { readonly tur: 'sec'; readonly yuzey: string }
  | { readonly tur: 'dene'; readonly yuzey: string }
  /** Yanlış taşımanın düşüşü bitti: bukalemun kıyıda, neden görünür. */
  | { readonly tur: 'dustu' }
  /** Doğru bukalemun oturdu: sınır adımı ya da büyü. */
  | { readonly tur: 'birlesti' }
  | { readonly tur: 'karoSec'; readonly karo: Karo }
  /** Karo yuvaya taşındı: iki karo da doğrudur, oturur. */
  | { readonly tur: 'karoDene'; readonly karo: Karo }
  /** Karonun oturuşu canlandırıldı: büyüye geçilir. */
  | { readonly tur: 'buyuye' }
  /** Büyü yaratığa oldu. */
  | { readonly tur: 'etki' }
  /** Büyü bitti: görev biter. */
  | { readonly tur: 'bitti' }
  /** Sıradaki görev; görevler bittiyse akşam. */
  | { readonly tur: 'sonraki' }

function gorevinBasi(gorevler: readonly Gorev[], gorevYeri: number): UydurukDurumu {
  const gorev = gorevler[gorevYeri]
  return {
    gorevler,
    gorevYeri,
    adim: gorev ? uydurukAdimi(gorev) : null,
    sinir: gorev ? uydurukSiniri(gorev) : null,
    evre: gorev ? 'secim' : 'kapanis',
    secili: null,
    deneme: null,
    yanlis: null,
    birlesen: null,
    seciliKaro: null,
    karo: null,
    kurulan: null,
    buyu: null,
  }
}

/**
 * Turun başı ya da kalınan görev: gorevYeri görevin turdaki yeridir (0'dan). Turda olmayan bir
 * yer verilirse tur baştan başlar.
 */
export function uydurukBaslangici(gorevler: readonly Gorev[], gorevYeri = 0): UydurukDurumu {
  const gecerli = Number.isInteger(gorevYeri) && gorevYeri >= 0 && gorevYeri < gorevler.length
  return gorevinBasi(gorevler, gecerli ? gorevYeri : 0)
}

export function oynananGorev(durum: UydurukDurumu): Gorev | undefined {
  return durum.gorevler[durum.gorevYeri]
}

/** Durumun izin vermediği eylem durumu değiştirmez. */
export function uydurukIndirgeyici(durum: UydurukDurumu, eylem: UydurukEylemi): UydurukDurumu {
  const gorev = oynananGorev(durum)
  const { adim, sinir } = durum
  if (!gorev || !adim) return durum
  const secenekVar = (yuzey: string) => adim.secenekler.some((s) => s.yuzey === yuzey)

  switch (eylem.tur) {
    case 'sec':
      if (durum.evre !== 'secim' || !secenekVar(eylem.yuzey)) return durum
      return { ...durum, secili: durum.secili === eylem.yuzey ? null : eylem.yuzey }

    case 'dene':
      if (durum.evre !== 'secim' || !secenekVar(eylem.yuzey)) return durum
      return {
        ...durum,
        evre: 'deneme',
        secili: null,
        yanlis: null,
        deneme: denemeyiDegerlendir(gorev, adim, eylem.yuzey),
      }

    case 'dustu':
      if (durum.evre !== 'deneme' || !durum.deneme || dogruMu(durum.deneme)) return durum
      return { ...durum, evre: 'secim', yanlis: durum.deneme, deneme: null }

    case 'birlesti':
      if (durum.evre !== 'deneme' || !durum.deneme || !dogruMu(durum.deneme)) return durum
      return sinir
        ? { ...durum, evre: 'sinir', deneme: null, birlesen: adim.parca }
        : {
            ...durum,
            evre: 'buyu',
            deneme: null,
            birlesen: adim.parca,
            kurulan: kurulanBicim(gorev, null, null),
          }

    case 'karoSec':
      if (durum.evre !== 'sinir') return durum
      return { ...durum, seciliKaro: durum.seciliKaro === eylem.karo ? null : eylem.karo }

    case 'karoDene':
      if (durum.evre !== 'sinir' || !sinir) return durum
      return {
        ...durum,
        evre: 'oturdu',
        seciliKaro: null,
        karo: eylem.karo,
        kurulan: kurulanBicim(gorev, sinir, eylem.karo),
      }

    case 'buyuye':
      if (durum.evre !== 'oturdu') return durum
      return { ...durum, evre: 'buyu' }

    case 'etki':
      if (durum.evre !== 'buyu') return durum
      return { ...durum, buyu: UYDURUK_BUYULERI[adim.etiket] ?? null }

    case 'bitti':
      if (durum.evre !== 'buyu') return durum
      return { ...durum, evre: 'bitti' }

    case 'sonraki':
      if (durum.evre !== 'bitti') return durum
      return gorevinBasi(durum.gorevler, durum.gorevYeri + 1)
  }
}
