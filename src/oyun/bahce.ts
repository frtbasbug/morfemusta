// Kök Bahçesi'nin oyun mantığı: görevin hedefi, sepetteki parçalar, gövde kelimeleri, büyüler
// ve oyunun durumu. Saf TypeScript'tir; DOM'a ve React'e dokunmaz. Ekran
// (src/ekranlar/KokBahcesi.tsx) durumu bu indirgeyiciyle değiştirir, hareketleri kendisi
// canlandırır.
//
// Her görev bir ağaçtır: dibinde kök, tabelada hedef kelime (gözlükçüler). Sepette hedefin
// ekleri durur, motorun verdiği yüzeyleriyle (ekle'nin parçaları) ve sabit tohumla karışık
// sırada. Çocuk ekleri sırayla ağaca taşır. Yapım eki gövdeyi bir halka büyütür, yeni kelime
// kart olarak düşer (gövde kelimesi: gözlük, gözlükçü). Çekim eki meyve olur, tepeye asılır;
// kart düşürmez, yeni kelime yapmaz. Meyvenin üstüne gövde çıkmaz (DESIGN.md, "Kök Bahçesi").
// Bu bölgede çocuk ünlü ya da ünsüz seçmez: ekin kılığını motor verir.
//
// Seçilen parça sıradakiyse doğrudur. Değilse iki neden var:
//   meyve  çekim eki seçildi, geride yapım eki var: ek sırası bozulur (ekSirasiHatasi,
//          kurulan + seçilen + kalanlar dizisinde meyve:<ETİKET> verir)
//   önce   başka bir yapım eki seçildi: hedefte sırası sonra
// Ceza, puan ve süre yok.

import { ekSirasiHatasi, ekle, type EkParcasi, type EkTuru } from '../motor/index.ts'
import type { Gorev } from './gorevler.ts'
import { tohumluKaristir } from './karistir.ts'

/** Sepetteki bir ek: hedefteki yeri, türü ve motorun verdiği yüzeyi. */
export interface BahceParcasi {
  /** Hedefteki sırası (0'dan). Sepette parçanın kimliğidir. */
  readonly sira: number
  readonly etiket: string
  readonly tur: EkTuru
  /** Motorun yüzeyi: çü, lük, ler. */
  readonly yuzey: string
  /** ekle'nin parçası: bukalemunun ve ek yazısının kılığı buradan gelir. */
  readonly parca: EkParcasi
}

/** Bir yapım ekiyle kurulan gövde: halka büyür, kelime kart olarak düşer. */
export interface GovdeKelimesi {
  /** Yapım ekinin hedefteki sırası. */
  readonly sira: number
  /** Kökten bu ekle birlikte ekler: ["LIK", "AGT"]. Sözlük kartı bunları saklar. */
  readonly etiketler: readonly string[]
  /** Motorun biçimi: gözlükçü. */
  readonly bicim: string
}

export interface BahceGorevi {
  readonly gorev: Gorev
  /** Tabeladaki hedef kelime: ekle(kök, bütün ekler). */
  readonly hedef: string
  /** Hedefin ekleri, sırasıyla. */
  readonly parcalar: readonly BahceParcasi[]
  /** Her yapım adımının biçimi, sırasıyla. */
  readonly govdeler: readonly GovdeKelimesi[]
  /** Sepetteki sıra: parçaların sıraları, sabit tohumla karışık. */
  readonly sepet: readonly number[]
}

/**
 * Sepetin sırasını belirleyen tohum. Bu tohumla sıradaki parça sepette hep aynı yerde durmaz:
 * ilk adımda da, bütün adımlarda da (bahce.test.ts denetler).
 */
export const sepetTohumu = (gorevSirasi: number): number => gorevSirasi * 100 + 1

/**
 * Görevin ağacı. Her görevde en az bir yapım, en çok bir çekim eki olur ve çekim en sondadır;
 * değilse hata verir (görev tablosu yalnız onayla değişir, bahce.test.ts denetler).
 */
export function bahceGorevi(gorev: Gorev): BahceGorevi {
  const { kok, etiketler } = gorev
  const hata = (neden: string) =>
    new Error(`${gorev.sira}. ağaç (${kok} + ${etiketler.join('+')}): ${neden}`)
  const sonuc = ekle(kok, etiketler)
  const parcalar = sonuc.parcalar.map(
    (parca, sira): BahceParcasi => ({
      sira,
      etiket: parca.etiket,
      tur: parca.tur,
      yuzey: parca.yuzey,
      parca,
    }),
  )
  const cekimler = parcalar.filter((p) => p.tur === 'çekim')
  if (!parcalar.some((p) => p.tur === 'yapım')) throw hata('yapım eki yok')
  if (cekimler.length > 1) throw hata('birden çok çekim eki var')
  const [cekim] = cekimler
  if (cekim && cekim.sira !== parcalar.length - 1) throw hata('çekim eki en sonda değil')

  const govdeler = parcalar
    .filter((p) => p.tur === 'yapım')
    .map(({ sira }) => {
      const ekler = etiketler.slice(0, sira + 1)
      return { sira, etiketler: ekler, bicim: ekle(kok, ekler).bicim }
    })
  return {
    gorev,
    hedef: sonuc.bicim,
    parcalar,
    govdeler,
    sepet: tohumluKaristir(
      parcalar.map((p) => p.sira),
      sepetTohumu(gorev.sira),
    ),
  }
}

/** Sözlük'e düşen kartların ekleri: yalnız gövde kelimeleri (çiçekçi; çiçekçiler değil). */
export const kartEtiketleri = (bahce: BahceGorevi): (readonly string[])[] =>
  bahce.govdeler.map((g) => g.etiketler)

/** Ağaca taşınan ilk n parçayla kelimenin o anki hâli: göz, gözlük, gözlükçü ... */
export function simdikiKelime(bahce: BahceGorevi, kurulan: number): string {
  const { kok, etiketler } = bahce.gorev
  return kurulan <= 0 ? kok : ekle(kok, etiketler.slice(0, kurulan)).bicim
}

// --- Neden ---------------------------------------------------------------------------------

/**
 * Yanlış seçimin nedeni:
 *   meyve  çekim eki seçildi, geride yapım eki var; once, önce gelmesi gereken yapım eki
 *   önce   başka bir yapım eki seçildi; once sıradaki, sonra seçilen
 */
export type BahceNedeni =
  | { readonly tur: 'meyve'; readonly meyve: BahceParcasi; readonly once: BahceParcasi }
  | { readonly tur: 'önce'; readonly once: BahceParcasi; readonly sonra: BahceParcasi }

/** Bir parçanın ağaca taşınması. */
export interface Deneme {
  /** Seçilen parçanın sırası. */
  readonly sira: number
  /** Doğruysa null. */
  readonly neden: BahceNedeni | null
  /** Çocuğa gösterilecek cümle; doğruysa boş. */
  readonly cumle: string
}

/**
 * Cümleler; ekler ve hedef görevden gelir:
 *   meyve  Meyvenin üstüne gövde çıkmaz: önce çi.
 *   önce   yolculuk: önce cu, sonra luk.
 */
export function bahceCumlesi(bahce: BahceGorevi, neden: BahceNedeni | null): string {
  if (!neden) return ''
  if (neden.tur === 'meyve') return `Meyvenin üstüne gövde çıkmaz: önce ${neden.once.yuzey}.`
  return `${bahce.hedef}: önce ${neden.once.yuzey}, sonra ${neden.sonra.yuzey}.`
}

/** Aynı ek mi: etiketi ve yüzeyi aynı (göz + LIK + AGT + LIK'teki iki lük gibi). */
const ayniEk = (a: BahceParcasi, b: BahceParcasi): boolean =>
  a.etiket === b.etiket && a.yuzey === b.yuzey

/**
 * Parçayı ağaca taşır. kurulan, ağaçtaki parça sayısıdır; ağaçtakiler hedefin ilk kurulan
 * ekidir. Seçilen parça sıradakiyle aynı ekse doğrudur.
 */
export function denemeyiDegerlendir(bahce: BahceGorevi, kurulan: number, sira: number): Deneme {
  const siradaki = bahce.parcalar[kurulan]
  const secilen = bahce.parcalar[sira]
  if (!siradaki || !secilen) throw new Error(`${sira}. parça ya da sıradaki parça yok`)
  if (ayniEk(secilen, siradaki)) return { sira, neden: null, cumle: '' }

  // Kalanlar hedefteki sırasıyla; seçilenin bir eşi çıkarılır.
  const kalanlar = bahce.parcalar.slice(kurulan)
  const yeri = kalanlar.findIndex((p) => ayniEk(p, secilen))
  const digerleri = kalanlar.filter((_, i) => i !== yeri)
  let neden: BahceNedeni = { tur: 'önce', once: siradaki, sonra: secilen }
  if (secilen.tur === 'çekim') {
    const dizi = [
      ...bahce.parcalar.slice(0, kurulan).map((p) => p.etiket),
      secilen.etiket,
      ...digerleri.map((p) => p.etiket),
    ]
    const hata = ekSirasiHatasi(dizi)
    const once = hata?.startsWith('meyve:')
      ? digerleri.find((p) => `meyve:${p.etiket}` === hata)
      : undefined
    if (once) neden = { tur: 'meyve', meyve: secilen, once }
  }
  return { sira, neden, cumle: bahceCumlesi(bahce, neden) }
}

export const dogruMu = (deneme: Deneme): boolean => deneme.neden === null

/**
 * Seçilen parçayla kurulan kelime (deneme günlüğünde aday): ağaçtaki ekler ve seçilen ek,
 * motorla (yol + luk → yolluk; çiçek + ler → çiçekler). Doğru seçimde sıradaki gövdedir.
 * Motor kuramazsa (olmamalı: ağaçta yalnız yapım ekleri var) yan yana yazılır.
 */
export function denemeninAdayi(bahce: BahceGorevi, kurulan: number, sira: number): string {
  const secilen = bahce.parcalar[sira]
  if (!secilen) return simdikiKelime(bahce, kurulan)
  const { kok, etiketler } = bahce.gorev
  try {
    return ekle(kok, [...etiketler.slice(0, kurulan), secilen.etiket]).bicim
  } catch {
    return simdikiKelime(bahce, kurulan) + secilen.yuzey
  }
}

/**
 * Nedenin kodu (deneme günlüğü): meyve:AGT (motorun ek sırası kodu, ekSirasiHatasi: önce gelmesi
 * gereken yapım eki) ya da önce:AGT (sıradaki yapım eki). Doğruysa boş.
 */
export function nedenKodu(neden: BahceNedeni | null): string {
  if (!neden) return ''
  return `${neden.tur}:${neden.once.etiket}`
}

// --- Büyüler -------------------------------------------------------------------------------

/**
 * Ekin büyüsü (DESIGN.md, "Kök Bahçesi"; resimsiz, kartlarla):
 *   halka        yapım eki gövdeye bir halka ekler, yeni kelime kart olarak düşer (-lIk, -CI)
 *   küçültür     -CIk: düşen kart küçüktür
 *   katar        -lI: önceki gövdenin küçük kartı yeni kartın üstüne konur (tat → tatlı)
 *   eksiltir     -sIz: önceki gövdenin küçük kartı silinir, yerinde kesikli boş çerçeve kalır
 *   meyve        çekim eki tepeye asılır; kart düşmez
 *   çoğaltır     -lAr: meyve üç olur
 *   cebe koyar   -(I)m: meyve cebe girer
 */
export type Buyu = 'halka' | 'küçültür' | 'katar' | 'eksiltir' | 'meyve' | 'çoğaltır' | 'cebe koyar'

const EK_BUYULERI: Readonly<Record<string, Buyu>> = {
  DIM: 'küçültür',
  PROP: 'katar',
  PRIV: 'eksiltir',
  PL: 'çoğaltır',
  'POSS.1SG': 'cebe koyar',
}

export function buyusu(parca: BahceParcasi): Buyu {
  return (
    (Object.hasOwn(EK_BUYULERI, parca.etiket) ? EK_BUYULERI[parca.etiket] : undefined) ??
    (parca.tur === 'yapım' ? 'halka' : 'meyve')
  )
}

/** Meyve gelince gövdenin sonu değişti mi: kalemlik → kalemliğim (taş jöleye erir). */
export interface GovdeDegisimi {
  /** Meyveden önceki kelime: kalemlik. */
  readonly once: string
  /** Meyveyle kelime: kalemliğim. */
  readonly sonra: string
  /** Gövdenin sonundaki taş ve jöle: k / ğ. */
  readonly tas: string
  readonly jole: string
}

/** Parçanın gövdesinde yumuşama varsa değişim; yoksa null. */
export function govdeDegisimi(bahce: BahceGorevi, sira: number): GovdeDegisimi | null {
  const parca = bahce.parcalar[sira]
  const olay = parca?.parca.olaylar.find((o) => o.tur === 'yumuşama')
  if (!parca || !olay || olay.tur !== 'yumuşama') return null
  return {
    once: simdikiKelime(bahce, sira),
    sonra: simdikiKelime(bahce, sira + 1),
    tas: olay.bakilan,
    jole: olay.sonuc,
  }
}

// --- Oyunun durumu -------------------------------------------------------------------------

/**
 * Oyunun evresi:
 *   secim    çocuk sepetten bir ek seçiyor ya da taşıyor
 *   deneme   bir taşıma canlandırılıyor; seçim kapalı
 *   buyu     doğru: ek dala tutundu; halka büyüyor ya da meyve asılıyor
 *   bitti    ağaç tamam; Sıradaki düğmesi
 *   kapanis  bütün ağaçlar bitti; akşam ekranı
 */
export type Evre = 'secim' | 'deneme' | 'buyu' | 'bitti' | 'kapanis'

export interface BahceDurumu {
  readonly gorevler: readonly Gorev[]
  /** Oynanan görevin yeri (0'dan başlar); görevler bitince gorevler.length. */
  readonly gorevYeri: number
  /** Oynanan ağaç; kapanışta null. */
  readonly bahce: BahceGorevi | null
  readonly evre: Evre
  /** Ağaçtaki parça sayısı: hedefin ilk kurulan eki ağaçta. */
  readonly kurulan: number
  /** Sepetten çıkan parçaların sıraları (ağaçta). */
  readonly kullanilanlar: readonly number[]
  /** Dokun-dokun ya da klavyeyle seçilen parçanın sırası. */
  readonly secili: number | null
  /** Canlandırılan taşıma. */
  readonly deneme: Deneme | null
  /** Son yanlış taşıma: cümlesi görünür, yeni taşımaya kadar kalır. */
  readonly yanlis: Deneme | null
}

export type BahceEylemi =
  /** Dokun-dokun ya da klavye: parçayı seçer; seçiliyse bırakır. */
  | { readonly tur: 'sec'; readonly sira: number }
  /** Parça ağaca taşındı. */
  | { readonly tur: 'dene'; readonly sira: number }
  /** Yanlış taşıma: ek dala tutunamadı, sallanıp sepete döndü; cümle görünür. */
  | { readonly tur: 'dondu' }
  /** Doğru taşıma: ek dala tutundu; halka ya da meyve ağaçta. */
  | { readonly tur: 'tutundu' }
  /** Büyü bitti: sıradaki ek, ağaç tamamsa görev biter. */
  | { readonly tur: 'buyuBitti' }
  /** Sıradaki ağaç; ağaçlar bittiyse kapanış. */
  | { readonly tur: 'sonraki' }

function gorevinBasi(gorevler: readonly Gorev[], gorevYeri: number): BahceDurumu {
  const gorev = gorevler[gorevYeri]
  return {
    gorevler,
    gorevYeri,
    bahce: gorev ? bahceGorevi(gorev) : null,
    evre: gorev ? 'secim' : 'kapanis',
    kurulan: 0,
    kullanilanlar: [],
    secili: null,
    deneme: null,
    yanlis: null,
  }
}

/**
 * Oyunun başı. Bölgeye dönen çocuk kaldığı görevden sürdürür: gorevYeri o görevin yeridir
 * (0'dan). Görevlerde olmayan bir yer verilirse oyun baştan başlar.
 */
export function bahceBaslangici(gorevler: readonly Gorev[], gorevYeri = 0): BahceDurumu {
  const gecerli = Number.isInteger(gorevYeri) && gorevYeri >= 0 && gorevYeri < gorevler.length
  return gorevinBasi(gorevler, gecerli ? gorevYeri : 0)
}

export function oynananGorev(durum: BahceDurumu): Gorev | undefined {
  return durum.gorevler[durum.gorevYeri]
}

/** Sepette kalan parçalar, sepetteki sırasıyla. */
export function sepettekiler(durum: BahceDurumu): BahceParcasi[] {
  const { bahce } = durum
  if (!bahce) return []
  return bahce.sepet
    .filter((sira) => !durum.kullanilanlar.includes(sira))
    .flatMap((sira) => bahce.parcalar[sira] ?? [])
}

/** Ağaca taşınmış parçalar, hedefteki sırasıyla: halkalar ve meyve. */
export function agactakiler(durum: BahceDurumu): BahceParcasi[] {
  return durum.bahce?.parcalar.slice(0, durum.kurulan) ?? []
}

/** Durumun izin vermediği eylem durumu değiştirmez. */
export function bahceIndirgeyici(durum: BahceDurumu, eylem: BahceEylemi): BahceDurumu {
  const { bahce } = durum
  if (!bahce) return durum
  const sepette = (sira: number) => sepettekiler(durum).some((p) => p.sira === sira)

  switch (eylem.tur) {
    case 'sec':
      if (durum.evre !== 'secim' || !sepette(eylem.sira)) return durum
      return { ...durum, secili: durum.secili === eylem.sira ? null : eylem.sira }

    case 'dene':
      if (durum.evre !== 'secim' || !sepette(eylem.sira)) return durum
      return {
        ...durum,
        evre: 'deneme',
        secili: null,
        yanlis: null,
        deneme: denemeyiDegerlendir(bahce, durum.kurulan, eylem.sira),
      }

    case 'dondu':
      if (durum.evre !== 'deneme' || !durum.deneme || dogruMu(durum.deneme)) return durum
      return { ...durum, evre: 'secim', yanlis: durum.deneme, deneme: null }

    case 'tutundu':
      if (durum.evre !== 'deneme' || !durum.deneme || !dogruMu(durum.deneme)) return durum
      return {
        ...durum,
        evre: 'buyu',
        kurulan: durum.kurulan + 1,
        kullanilanlar: [...durum.kullanilanlar, durum.deneme.sira],
        deneme: null,
      }

    case 'buyuBitti':
      if (durum.evre !== 'buyu') return durum
      return { ...durum, evre: durum.kurulan < bahce.parcalar.length ? 'secim' : 'bitti' }

    case 'sonraki':
      if (durum.evre !== 'bitti') return durum
      return gorevinBasi(durum.gorevler, durum.gorevYeri + 1)
  }
}
