// Fıstıkçı Şahap'ın Dükkânı'nın oyun mantığı: görevin sınırı, karolar ve oyunun durumu. Saf
// TypeScript'tir; DOM'a ve React'e dokunmaz. Ekran (src/ekranlar/FistikciSahap.tsx) durumu bu
// indirgeyiciyle değiştirir, hareketleri kendisi canlandırır.
//
// Her görevin tam bir ünsüz sınırı vardır (sinirSecenekleri): kelimede boş bir yuva. Tezgâhta
// iki karo durur, taş hep solda, jöle hep sağda. Çocuk birini yuvaya taşır. Doğruluk motordan
// gelir: aday (yuvanın solu + seçilen harf + sağı) olasiBicimler içindeyse neden yoktur. Ceza,
// puan ve süre yok.

import {
  ekle,
  neden,
  nedenCumlesi,
  sinirSecenekleri,
  type Karo,
  type Neden,
  type Sinir,
} from '../motor/index.ts'
import type { Gorev } from './gorevler.ts'

/** Tezgâhtaki karolar, sırasıyla: taş hep solda, jöle hep sağda. */
export const TEZGAH: readonly Karo[] = ['taş', 'jöle']

/** Görevin sınırı. Her görevin tam bir sınırı olmalı; yoksa ya da birden çoksa hata verir. */
export function gorevinSiniri(gorev: Gorev): Sinir {
  const sinirlar = sinirSecenekleri(gorev.kok, gorev.etiketler)
  const [sinir] = sinirlar
  if (sinirlar.length !== 1 || !sinir) {
    throw new Error(
      `${gorev.sira}. görevin (${gorev.kok} + ${gorev.etiketler.join('+')}) tam bir ünsüz ` +
        `sınırı olmalı; ${sinirlar.length} sınır var`,
    )
  }
  return sinir
}

/** Karonun harfi: sınırın taşı ya da jölesi. */
export const karoHarfi = (sinir: Sinir, karo: Karo): string =>
  karo === 'taş' ? sinir.tas : sinir.jole

/** Bir karonun yuvaya taşınması. */
export interface Deneme {
  readonly karo: Karo
  /** Kurulan kelime: yuvanın solu, karonun harfi, sağı (kitapım, kitabım). */
  readonly aday: string
  /** Boşsa deneme doğrudur. */
  readonly nedenler: readonly Neden[]
  /** Çocuğa gösterilecek cümle (nedenCumlesi); doğruysa boş. */
  readonly cumle: string
  /** Yanlışsa vurgulanan iki sesin adaydaki yerleri, soldan sağa. */
  readonly ilgili: readonly [number, number] | null
}

/**
 * Karoyu yuvaya koyar ve motorla sınar. Gövde sınırında gövde değişir (kitap / kitab), ekler
 * doğru yüzeyleriyle kalır; ek başında gövde kök kalır, sınırın ekinin yuvası değişir.
 */
export function denemeyiDegerlendir(gorev: Gorev, sinir: Sinir, karo: Karo): Deneme {
  const harf = karoHarfi(sinir, karo)
  const { parcalar } = ekle(gorev.kok, gorev.etiketler)
  let govde = gorev.kok
  const yuzeyler = parcalar.map((p) => p.yuzey)
  if (sinir.yer === 'gövde') {
    govde = gorev.kok.slice(0, -1) + harf
  } else {
    const yuzey = yuzeyler[sinir.ekSirasi] ?? ''
    const yer = sinir.konum - sinir.parca.govde.length
    yuzeyler[sinir.ekSirasi] = yuzey.slice(0, yer) + harf + yuzey.slice(yer + 1)
  }
  const nedenler = neden(gorev.kok, gorev.etiketler, yuzeyler, govde)
  return {
    karo,
    aday: sinir.sol + harf + sinir.sag,
    nedenler,
    cumle: nedenCumlesi(nedenler),
    ilgili: ilgiliSesler(nedenler[0]),
  }
}

/**
 * Nedenin ilgili iki sesi, adaydaki yerleriyle: gövdede seçilen ünsüz ve ardındaki ünlü (p
 * ünlüden önce); ek başında önceki ses ve seçilen ünsüz (p sert, ekin başı da sert);
 * kaynaştırmada ekten önceki ses ve ekin ilk sesi (zelü + e: ü ve e; fıngıl + ya: l ve y);
 * uyumda bakılan ve seçilen ünlü. Uydurukçuklar da kullanır.
 */
export function ilgiliSesler(ilk: Neden | undefined): readonly [number, number] | null {
  if (ilk?.tur === 'gövde') return [ilk.secilenKonumu, ilk.secilenKonumu + 1]
  if (ilk?.tur === 'ek başı') return [ilk.bakilanKonumu, ilk.secilenKonumu]
  if (ilk?.tur === 'kaynaştırma') return [ilk.bakilanKonumu, ilk.secilenKonumu]
  if (ilk?.tur === 'uyum') return [ilk.bakilanKonumu, ilk.secilenKonumu]
  return null
}

export const dogruMu = (deneme: Deneme): boolean => deneme.nedenler.length === 0

/** Karo yuvaya oturunca ses değişti mi: kökün taşı jöleye erir, ekin jölesi taşa döner. */
export const sesDegisti = (sinir: Sinir, karo: Karo): boolean => karo !== sinir.asil

/**
 * Oyunun evresi:
 *   secim    çocuk bir karo seçiyor ya da taşıyor
 *   deneme   bir taşıma canlandırılıyor; seçim kapalı
 *   oturdu   doğru: karo yuvaya oturdu, ses değişiyorsa değişim canlandırılıyor
 *   bitti    görev bitti; kelime rafta, Sıradaki düğmesi
 *   kapanis  bütün görevler bitti; akşam ekranı
 */
export type Evre = 'secim' | 'deneme' | 'oturdu' | 'bitti' | 'kapanis'

export interface DukkanDurumu {
  readonly gorevler: readonly Gorev[]
  /** Oynanan görevin yeri (0'dan başlar); görevler bitince gorevler.length. */
  readonly gorevYeri: number
  /** Oynanan görevin sınırı; kapanışta null. */
  readonly sinir: Sinir | null
  readonly evre: Evre
  /** Dokun-dokun ya da klavyeyle seçilen karo. */
  readonly secili: Karo | null
  /** Canlandırılan taşıma. */
  readonly deneme: Deneme | null
  /** Son yanlış taşıma: nedeni kelimenin altında görünür, yeni taşımaya kadar kalır. */
  readonly yanlis: Deneme | null
  /** Doğru taşıma: yuvaya oturan karo ve kurulan kelime. */
  readonly oturan: Deneme | null
}

export type DukkanEylemi =
  /** Dokun-dokun ya da klavye: karoyu seçer; seçiliyse bırakır. */
  | { readonly tur: 'sec'; readonly karo: Karo }
  /** Karo yuvaya taşındı. */
  | { readonly tur: 'dene'; readonly karo: Karo }
  /** Yanlış taşımanın sekmesi bitti: karo tezgâhta, neden görünür. */
  | { readonly tur: 'sekti' }
  /** Doğru taşıma: karo yuvaya oturdu. */
  | { readonly tur: 'oturdu' }
  /** Değişim canlandırıldı: kelime rafa dizildi, görev bitti. */
  | { readonly tur: 'rafa' }
  /** Sıradaki görev; görevler bittiyse kapanış. */
  | { readonly tur: 'sonraki' }

function gorevinBasi(gorevler: readonly Gorev[], gorevYeri: number): DukkanDurumu {
  const gorev = gorevler[gorevYeri]
  return {
    gorevler,
    gorevYeri,
    sinir: gorev ? gorevinSiniri(gorev) : null,
    evre: gorev ? 'secim' : 'kapanis',
    secili: null,
    deneme: null,
    yanlis: null,
    oturan: null,
  }
}

/**
 * Oyunun başı. Bölgeye dönen çocuk kaldığı görevden sürdürür: gorevYeri o görevin yeridir
 * (0'dan). Görevlerde olmayan bir yer verilirse oyun baştan başlar.
 */
export function dukkanBaslangici(gorevler: readonly Gorev[], gorevYeri = 0): DukkanDurumu {
  const gecerli = Number.isInteger(gorevYeri) && gorevYeri >= 0 && gorevYeri < gorevler.length
  return gorevinBasi(gorevler, gecerli ? gorevYeri : 0)
}

export function oynananGorev(durum: DukkanDurumu): Gorev | undefined {
  return durum.gorevler[durum.gorevYeri]
}

/**
 * Raftaki kelimeler: bu turda biten görevlerin kelimeleri, sırasıyla (ekle). Oynanan görev
 * bitince onun kelimesi de rafa dizilir.
 */
export function raftakiler(durum: DukkanDurumu): string[] {
  const biten = durum.evre === 'bitti' ? durum.gorevYeri + 1 : durum.gorevYeri
  return durum.gorevler.slice(0, biten).map((g) => ekle(g.kok, g.etiketler).bicim)
}

/** Durumun izin vermediği eylem durumu değiştirmez. */
export function dukkanIndirgeyici(durum: DukkanDurumu, eylem: DukkanEylemi): DukkanDurumu {
  const gorev = oynananGorev(durum)
  const { sinir } = durum
  if (!gorev || !sinir) return durum

  switch (eylem.tur) {
    case 'sec':
      if (durum.evre !== 'secim') return durum
      return { ...durum, secili: durum.secili === eylem.karo ? null : eylem.karo }

    case 'dene':
      if (durum.evre !== 'secim') return durum
      return {
        ...durum,
        evre: 'deneme',
        secili: null,
        yanlis: null,
        deneme: denemeyiDegerlendir(gorev, sinir, eylem.karo),
      }

    case 'sekti':
      if (durum.evre !== 'deneme' || !durum.deneme || dogruMu(durum.deneme)) return durum
      return { ...durum, evre: 'secim', yanlis: durum.deneme, deneme: null }

    case 'oturdu':
      if (durum.evre !== 'deneme' || !durum.deneme || !dogruMu(durum.deneme)) return durum
      return { ...durum, evre: 'oturdu', oturan: durum.deneme, deneme: null }

    case 'rafa':
      if (durum.evre !== 'oturdu') return durum
      return { ...durum, evre: 'bitti' }

    case 'sonraki':
      if (durum.evre !== 'bitti') return durum
      return gorevinBasi(durum.gorevler, durum.gorevYeri + 1)
  }
}
