// Bukalemun Koyu'nun oyun mantığı: görev adımları, seçenekler ve oyunun durumu. Saf
// TypeScript'tir; DOM'a ve React'e dokunmaz. Ekran (src/ekranlar/BukalemunKoyu.tsx) durumu
// bu indirgeyiciyle değiştirir, hareketleri kendisi canlandırır.
//
// Her görev bir kök ve bir ya da birkaç ekten oluşur. Her ek bir adımdır: kıyıya o ekin
// bukalemunları (kılıkları) gelir, çocuk birini köke taşır. Doğruluk motordan gelir: aday,
// motorun doğru biçimindeki gövdeye seçilen yüzeyin eklenmesidir (kitab + ım → kitabım;
// kalemliğ + im → kalemliğim); olasiBicimler içindeyse neden yoktur. Zincirli görevde (top +
// PL + POSS.1SG) ilk ek tutunca gövde toplar olur, ikinci adım o gövdeye yapılır.

import {
  ekle,
  neden,
  nedenCumlesi,
  olasiBicimler,
  sinirSecenekleri,
  yuzeySecenekleri,
  type EkParcasi,
  type Neden,
} from '../motor/index.ts'
import type { Gorev } from './gorevler.ts'
import { tohumluKaristir } from './karistir.ts'

/** Kıyıdaki bir bukalemun: ekin seçilebilecek bir yüzeyi. */
export interface Secenek {
  /** Ekin yüzeyi: "lar", "ım". Adımda tektir. */
  readonly yuzey: string
  /**
   * Bukalemunun kılığını veren ek parçası. Doğru seçenekte motorunkidir; ötekilerde yalnız
   * yüzeyi değişmiş, olaysız bir kopyasıdır (motor uymayan biçim üretmez).
   */
  readonly parca: EkParcasi
}

export interface Adim {
  /** Görevdeki ek sırası (0'dan başlar). */
  readonly sira: number
  readonly etiket: string
  /** Ekin geleceği kelime: kök ya da önceki eklerle kurulmuş gövde (toplar). */
  readonly govde: string
  /** Önceki eklerin doğru yüzeyleri: toplar için ["lar"]. */
  readonly oncekiYuzeyler: readonly string[]
  /** Bu ekle kurulan doğru biçimin son parçası: ekle(kök, bu ana kadarki ekler). */
  readonly parca: EkParcasi
  /** Doğru biçim: parca.govde + parca.yuzey. */
  readonly bicim: string
  /** Seçenekler, sabit tohumla karışık sırada. */
  readonly secenekler: readonly Secenek[]
}

/**
 * Seçeneklerin sırasını belirleyen tohum: görevin ve adımın sırasından. Bukalemun Koyu'nda
 * bu tohumla doğru bukalemun dört yerin dördüne de düşer, kalın ve ince -lAr da iki yana
 * (koy.test.ts denetler).
 */
export function secenekTohumu(gorevSirasi: number, adimSirasi: number): number {
  return gorevSirasi * 100 + adimSirasi
}

/**
 * Görevin sıradaki ek adımı. Kaynaştırma açıksa (Uydurukçuklar) kıyıya kaynaştırmalı ve
 * kaynaştırmasız kılıklar birlikte gelir: -(y)A için ya, ye, a, e (yuzeySecenekleri).
 */
export function adimiKur(
  gorev: Gorev,
  sira: number,
  { kaynastirma = false }: { readonly kaynastirma?: boolean } = {},
): Adim {
  const etiket = gorev.etiketler[sira]
  if (etiket === undefined) throw new Error(`${gorev.sira}. görevde ${sira + 1}. ek yok`)
  const onceki = ekle(gorev.kok, gorev.etiketler.slice(0, sira))
  const sonuc = ekle(gorev.kok, gorev.etiketler.slice(0, sira + 1))
  const parca = sonuc.parcalar[sira]
  if (!parca) throw new Error(`${gorev.kok} + ${etiket}: motor ek parçası vermedi`)
  const yuzeyler = tohumluKaristir(
    yuzeySecenekleri(parca, { kaynastirma }),
    secenekTohumu(gorev.sira, sira),
  )
  return {
    sira,
    etiket,
    govde: onceki.bicim,
    oncekiYuzeyler: onceki.parcalar.map((p) => p.yuzey),
    parca,
    bicim: sonuc.bicim,
    secenekler: yuzeyler.map((yuzey) => ({
      yuzey,
      parca: yuzey === parca.yuzey ? parca : { ...parca, yuzey, olaylar: [] },
    })),
  }
}

/** Bir bukalemunun köke taşınması. */
export interface Deneme {
  readonly yuzey: string
  /**
   * Motorun doğru biçimindeki gövde ve seçilen yüzey: atler, toplarim, kitabım. Gövdeyi ek
   * değiştirir (kitap + ım → kitab-ım; kalemlik + im → kalemliğ-im); bütün kılıklar aynı
   * sesle başladığı için gövde her kılıkta aynıdır.
   */
  readonly aday: string
  /** Boşsa deneme doğrudur. */
  readonly nedenler: readonly Neden[]
  /** Çocuğa gösterilecek cümle (nedenCumlesi); doğruysa boş. */
  readonly cumle: string
}

/**
 * neden'e verilecek gövde: gövde sınırında motorun seçtiği karo (kitap + ım → kitab), yoksa
 * kök. Yumuşama yalnız ünlüyle başlayan ekten önce olur; nedenin ünlü ve ek başı konumları
 * adaydakilerle aynı kalır. Sonraki bir ekin gövdesindeki yumuşama (kalemliğ) nedene girmez:
 * orada neden yalnız yanlış kılıkta aranır.
 */
function nedeninGovdesi(kok: string, etiketler: readonly string[]): string {
  const sinir = sinirSecenekleri(kok, etiketler).find((s) => s.yer === 'gövde')
  const govde = ekle(kok, etiketler).parcalar[0]?.govde
  return sinir && govde === kok.slice(0, -1) + sinir.jole ? govde : kok
}

export function denemeyiDegerlendir(gorev: Gorev, adim: Adim, yuzey: string): Deneme {
  const etiketler = gorev.etiketler.slice(0, adim.sira + 1)
  const aday = adim.parca.govde + yuzey
  const nedenler = olasiBicimler(gorev.kok, etiketler).includes(aday)
    ? []
    : neden(gorev.kok, etiketler, [...adim.oncekiYuzeyler, yuzey], nedeninGovdesi(gorev.kok, etiketler))
  return { yuzey, aday, nedenler, cumle: nedenCumlesi(nedenler) }
}

export const dogruMu = (deneme: Deneme): boolean => deneme.nedenler.length === 0

/** Ekin büyüsü: kelimenin anlamı ekranda resimsiz görünür (DESIGN.md, "Bukalemun Koyu"). */
export type AnlamEtkisi = 'çoğalır' | 'cebe girer'

export const ANLAM_ETKILERI: Readonly<Record<string, AnlamEtkisi>> = {
  PL: 'çoğalır',
  'POSS.1SG': 'cebe girer',
}

/**
 * Oyunun evresi:
 *   secim    çocuk bir bukalemun seçiyor ya da taşıyor
 *   deneme   bir taşıma canlandırılıyor; seçim kapalı
 *   buyu     doğru: kelime birleşti, büyü ve anlam etkisi canlandırılıyor
 *   bitti    görev bitti; Sıradaki düğmesi
 *   kapanis  bütün görevler bitti; kapanış kartı
 */
export type Evre = 'secim' | 'deneme' | 'buyu' | 'bitti' | 'kapanis'

export interface KoyDurumu {
  readonly gorevler: readonly Gorev[]
  /** Oynanan görevin yeri (0'dan başlar); görevler bitince gorevler.length. */
  readonly gorevYeri: number
  /** Oynanan adım; kapanışta null. */
  readonly adim: Adim | null
  readonly evre: Evre
  /** Dokun-dokun ya da klavyeyle seçilen bukalemunun yüzeyi. */
  readonly secili: string | null
  /** Canlandırılan taşıma. */
  readonly deneme: Deneme | null
  /** Son yanlış taşıma: nedeni kelimenin altında görünür, yeni taşımaya kadar kalır. */
  readonly yanlis: Deneme | null
  /** Büyüden sonra kelime: ekle'nin parçası (gövde ve bukalemunun renginde kalan ek). */
  readonly birlesen: EkParcasi | null
  /** Çoğul büyüsü oldu: kelime kartı üçe çoğaldı. */
  readonly cogaldi: boolean
  /** İyelik büyüsü oldu: kelime kartı cebe girdi. */
  readonly cepte: boolean
  /** Görev renksiz ve büyü henüz olmadı: kalın ve ince aynı gri. */
  readonly renksiz: boolean
}

export type KoyEylemi =
  /** Dokun-dokun ya da klavye: bukalemunu seçer; seçiliyse bırakır. */
  | { readonly tur: 'sec'; readonly yuzey: string }
  /** Bukalemun köke taşındı. */
  | { readonly tur: 'dene'; readonly yuzey: string }
  /** Yanlış taşımanın düşüşü bitti: bukalemun kıyıda, neden görünür. */
  | { readonly tur: 'dustu' }
  /** Doğru taşımanın büyüsü: kelime birleşir, renkler geri gelir. */
  | { readonly tur: 'birlesti' }
  /** Anlam etkisi: kart üçe çoğalır ya da cebe girer. */
  | { readonly tur: 'etki' }
  /** Büyü bitti: zincirde sıradaki ek, değilse görev biter. */
  | { readonly tur: 'adimBitti' }
  /** Sıradaki görev; görevler bittiyse kapanış. */
  | { readonly tur: 'sonraki' }

function gorevinBasi(gorevler: readonly Gorev[], gorevYeri: number): KoyDurumu {
  const gorev = gorevler[gorevYeri]
  return {
    gorevler,
    gorevYeri,
    adim: gorev ? adimiKur(gorev, 0) : null,
    evre: gorev ? 'secim' : 'kapanis',
    secili: null,
    deneme: null,
    yanlis: null,
    birlesen: null,
    cogaldi: false,
    cepte: false,
    renksiz: gorev?.renksiz ?? false,
  }
}

/**
 * Oyunun başı. Bölgeye dönen çocuk kaldığı görevden sürdürür: gorevYeri o görevin yeridir
 * (0'dan). Görevlerde olmayan bir yer verilirse oyun baştan başlar.
 */
export function koyBaslangici(gorevler: readonly Gorev[], gorevYeri = 0): KoyDurumu {
  const gecerli = Number.isInteger(gorevYeri) && gorevYeri >= 0 && gorevYeri < gorevler.length
  return gorevinBasi(gorevler, gecerli ? gorevYeri : 0)
}

export function oynananGorev(durum: KoyDurumu): Gorev | undefined {
  return durum.gorevler[durum.gorevYeri]
}

/** Durumun izin vermediği eylem durumu değiştirmez. */
export function koyIndirgeyici(durum: KoyDurumu, eylem: KoyEylemi): KoyDurumu {
  const gorev = oynananGorev(durum)
  const { adim } = durum
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
      return { ...durum, evre: 'buyu', deneme: null, birlesen: adim.parca, renksiz: false }

    case 'etki': {
      if (durum.evre !== 'buyu') return durum
      const etki = ANLAM_ETKILERI[adim.etiket]
      return {
        ...durum,
        cogaldi: durum.cogaldi || etki === 'çoğalır',
        cepte: durum.cepte || etki === 'cebe girer',
      }
    }

    case 'adimBitti':
      if (durum.evre !== 'buyu') return durum
      if (adim.sira + 1 < gorev.etiketler.length) {
        return { ...durum, evre: 'secim', adim: adimiKur(gorev, adim.sira + 1), birlesen: null }
      }
      return { ...durum, evre: 'bitti' }

    case 'sonraki':
      if (durum.evre !== 'bitti') return durum
      return gorevinBasi(durum.gorevler, durum.gorevYeri + 1)
  }
}
