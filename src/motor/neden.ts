// Yanlış biçimin nedeni: çocuğun kurduğu aday neden uymuyor? Bukalemun Koyu'nda düşen
// bukalemunun, Fıstıkçı Şahap'ın Dükkânı'nda seken karonun altına yazılan cümle buradan gelir.
//
// Aday, gövde ile seçilen yüzeylerin art arda yazılmasıdır (at + ler → atler; kitab + ım →
// kitabım). Gövde kökün kendisidir ya da gövde sınırında yumuşamış hâli (kitab). Aday
// olasiBicimler içindeyse neden yoktur. Değilse sırayla üç şey sınanır; bulunan nedenler bu
// sırayla dizilir:
//
//   1. gövde sınırı (sinir.ts): kökün son ünsüzü taş mı, jöle mi? Taş seçildi, jöle olmalıydı:
//      yumuşama (kitapım). Jöle seçildi, taş olmalıydı: tek heceli kökte inatçı (tobum), çok
//      heceli kökte yumuşamaz (sepedi).
//   2. ek başı: (y), (n) ve (s) ile başlayan ekte kaynaştırma, adayda önceki sese göre (yerel):
//      ünlüden sonra ayraçlı ünsüz girer, ünsüzden sonra girmez. Girmedi, girmeliydi: eksik
//      (zelüe); girdi, girmemeliydi: fazla (fıngılya). Sonra D ve C, yine önceki sese göre:
//      sert ünsüzden sonra taş, değilse jöle. Jöle seçildi, taş olmalıydı: sertleşme
//      (kitapda). Taş seçildi, jöle olmalıydı: yumuşak (evte, suçu).
//   3. ünlü uyumu: ekin her ünlüsü, adayda kendinden önceki son ünlüye bakılarak beklenir
//      (istisnasız, olağan uyum) ve seçilen ünlüyle karşılaştırılır; uyuşmayan özellikler
//      (kalınlık, yuvarlaklık) yazılır. Yerel sınama yüzünden toplerim yalnız çoğulun
//      kalınlığını alır: im, önündeki e'ye uyar.
//
// Hiçbiri bulunamazsa aday başka bir yüzden yanlıştır (istisna: saatlar; ünlü düşmesi:
// ağızım) ve tek neden "diğer"dir.

import {
  ekle,
  govdeOlayiMi,
  olasiBicimler,
  uyum,
  type EkOlayi,
  type EkParcasi,
  type KopyalananOzellik,
  type Olay,
} from './ekle.ts'
import { EK_ENVANTERI, type EkEnvanteri } from './envanter.ts'
import { sablonuCoz, type Birim, type UnluArkafonemi } from './sablon.ts'
import { ALFABE, UNLULER, sonUnluKonumu, unluMu, type Unlu } from './ses.ts'
import { ekBasiBeklenen, sinirSecenekleri, unsuzYuvalari, type Karo } from './sinir.ts'
import { KOK_SOZLUGU, type KokSozlugu } from './sozluk.ts'

/** Uyumla seçilen ünlünün yerel uyumla beklenenden farkı. */
export interface UyumNedeni {
  readonly tur: 'uyum'
  /** Uymayan ekin etiketi: PL, POSS.1SG. */
  readonly etiket: string
  /** Uyuşmayan özellikler, bu sırayla: kalınlık, yuvarlaklık. */
  readonly ozellikler: readonly KopyalananOzellik[]
  /** Adayda seçilen ünlüden önceki son ünlü: bukalemunun baktığı ünlü. */
  readonly bakilan: Unlu
  /** bakılan ünlünün adaydaki yeri (0'dan başlar). */
  readonly bakilanKonumu: number
  /** bakılan ünlü kökte mi; değilse önceki bir ektedir (toplarim'de lar'ın a'sı). */
  readonly bakilanKokte: boolean
  /** Yerel uyumun beklediği ünlü. */
  readonly beklenen: Unlu
  /** Seçilen yüzeydeki ünlü. */
  readonly secilen: Unlu
  /** seçilen ünlünün adaydaki yeri. */
  readonly secilenKonumu: number
}

/**
 * Gövde sınırında yanlış karo:
 *   yumuşama   taş seçildi, jöle olmalıydı (kitapım)
 *   inatçı     tek heceli, yumuşamayan kökte jöle seçildi (tobum)
 *   yumuşamaz  çok heceli, yumuşamayan kökte jöle seçildi (sepedi)
 */
export interface GovdeNedeni {
  readonly tur: 'gövde'
  readonly ad: 'yumuşama' | 'inatçı' | 'yumuşamaz'
  readonly kok: string
  /** Kökün son ünsüzü (taş) ve yumuşak karşılığı (jöle): p / b. */
  readonly tas: string
  readonly jole: string
  readonly secilen: Karo
  /** Seçilen ünsüzün adaydaki yeri; ardındaki ses ekin ünlüsüdür. */
  readonly secilenKonumu: number
}

/**
 * Ek başında yanlış karo:
 *   sertleşme  jöle seçildi, taş olmalıydı (kitapda)
 *   yumuşak    taş seçildi, jöle olmalıydı (evte, suçu)
 */
export interface EkBasiNedeni {
  readonly tur: 'ek başı'
  readonly ad: 'sertleşme' | 'yumuşak'
  /** Ekin etiketi: LOC, AGT. */
  readonly etiket: string
  /** Adayda ek başından önceki ses: bakılan (p, v, u). */
  readonly bakilan: string
  readonly bakilanKonumu: number
  /** Kuralın beklediği harf (t, d, ç, c) ve seçilen harf. */
  readonly beklenen: string
  readonly secilen: string
  readonly secilenKonumu: number
}

/**
 * (y), (n) ya da (s) ile başlayan ekte kaynaştırma (Oturum 9):
 *   eksik  önceki ses ünlü, ayraçlı ünsüz girmedi (zelüe, kediin)
 *   fazla  önceki ses ünsüz, ayraçlı ünsüz girdi (fıngılya, fıngılnın)
 */
export interface KaynastirmaNedeni {
  readonly tur: 'kaynaştırma'
  readonly durum: 'eksik' | 'fazla'
  /** Ekin etiketi: DAT, GEN. */
  readonly etiket: string
  /** Ayraçlı ünsüz: y, n ya da s. */
  readonly harf: string
  /** Adayda ekten önceki ses (ü, l) ve yeri. */
  readonly bakilan: string
  readonly bakilanKonumu: number
  /** Adayda ekin ilk sesinin yeri: eksikte ekin ünlüsü (e), fazlada giren ünsüz (y). */
  readonly secilenKonumu: number
}

/** Hiçbir sınamada fark yok, aday yine de yanlış: istisna ya da ünlü düşmesi. */
export interface DigerNeden {
  readonly tur: 'diğer'
}

export type Neden = GovdeNedeni | EkBasiNedeni | KaynastirmaNedeni | UyumNedeni | DigerNeden

type UnluBirimi = Extract<Birim, { arkafonem: UnluArkafonemi }>

/** Ek yüzeyinde uyumla seçilen bir ünlünün yeri ve şablondaki birimi. */
interface UnluYuvasi {
  /** Yüzeydeki yeri (0'dan başlar). */
  readonly konum: number
  readonly birim: UnluBirimi
  /** Bu yuvaya gelebilecek ünlüler, alfabe sırasıyla: A'da a, e; I'da ı, i, u, ü. */
  readonly unluler: readonly Unlu[]
}

const ALFABE_SIRASI = [...ALFABE]

/**
 * Bir ünlü biriminin yüzeyde alabileceği ünlüler. Kural burada yazılmaz: uyum işlevinin her
 * ünlüden sonra verdiği sonuçlar toplanır (A → a, e; I → ı, i, u, ü).
 */
function yuvaUnluleri(birim: UnluBirimi): Unlu[] {
  const bakilanlar = Object.keys(UNLULER) as Unlu[]
  const unluler = new Set(bakilanlar.map((u) => uyum(u, birim, 0, false).sonuc))
  return [...unluler].sort((a, b) => ALFABE_SIRASI.indexOf(a) - ALFABE_SIRASI.indexOf(b))
}

/** Ek parçasının yüzeyinde uyumla (ya da ince ekle) seçilmiş ünlülerin yuvaları. */
function unluYuvalari(parca: EkParcasi): UnluYuvasi[] {
  const birimler = sablonuCoz(parca.sablon)
  return parca.olaylar.flatMap((olay) => {
    if (olay.tur !== 'uyum' && olay.tur !== 'ince ek') return []
    const birim = birimler.find(
      (b): b is UnluBirimi =>
        (b.tur === 'unlu' || b.tur === 'ayracli-unlu') && b.yazim === olay.birim,
    )
    if (!birim) throw new Error(`${parca.sablon} şablonunda ${olay.birim} birimi yok`)
    return [{ konum: olay.konum, birim, unluler: yuvaUnluleri(birim) }]
  })
}

/**
 * Bukalemunun kılıkları: ekin, uyumla seçilen her ünlüsü yerine o birimin alabileceği bütün
 * ünlüler konarak elde edilen yüzeyler, alfabe sırasıyla. Doğru yüzey (parca.yuzey) de
 * içlerindedir. Ek yüzeyde ünlüsüz kalırsa (kedim) tek kılık vardır.
 *
 * Seçenekler (Uydurukçuklar): kaynaştırma açıksa kaynaştırmalı ve kaynaştırmasız kılıklar
 * birlikte gelir (ya, ye, a, e); ünsüz açıksa D ve C yuvalarında taş ve jöle de (da, de, ta,
 * te): neden'in kabul ettiği bütün yüzeyler.
 *
 *     yuzeySecenekleri(ekle('at', ['PL']).parcalar[0])         // ["lar", "ler"]
 *     yuzeySecenekleri(ekle('kız', ['POSS.1SG']).parcalar[0])  // ["ım", "im", "um", "üm"]
 */
export function yuzeySecenekleri(
  parca: EkParcasi,
  {
    kaynastirma = false,
    unsuz = false,
  }: { readonly kaynastirma?: boolean; readonly unsuz?: boolean } = {},
): string[] {
  const karsit = kaynastirma ? kaynastirmaKarsiti(parca) : undefined
  const parcalar = [parca, ...(karsit ? [karsit] : [])]
  return [...new Set(parcalar.flatMap(unsuz ? kabulYuzeyleri : unluKiliklari))]
}

function unluKiliklari(parca: EkParcasi): string[] {
  let secenekler = [parca.yuzey]
  for (const { konum, unluler } of unluYuvalari(parca)) {
    secenekler = secenekler.flatMap((yuzey) =>
      unluler.map((unlu) => yuzey.slice(0, konum) + unlu + yuzey.slice(konum + 1)),
    )
  }
  return secenekler
}

/**
 * Ekin kaynaştırma karşıtı: (y), (n) ya da (s) ile başlayan ekte ayraçlı ünsüz yüzeye çıktıysa
 * onsuz, çıkmadıysa onunla kurulan parça (zelü + ye → e; fıngıl + a → ya). Olayların yerleri
 * yeni yüzeye göre kayar; ünlü ve ünsüz yuvaları ondan okunur. Ek bu türden değilse ya da
 * zamir n ya da tekrarlanmayan çoğul almışsa undefined.
 */
export function kaynastirmaKarsiti(parca: EkParcasi): EkParcasi | undefined {
  const bulunan = kaynastirmaOlayi(parca)
  if (!bulunan) return undefined
  const { olay, ses } = bulunan
  const yazim = olay.birim
  const { konum } = olay
  const cikti = olay.tur === 'kaynaştırma'
  const kay = cikti ? -1 : 1
  const olaylar = parca.olaylar.map((o): Olay => {
    if (o === olay) {
      return cikti
        ? { tur: 'saklanma', birim: yazim, konum, aciklama: `saklanma: ${yazim}` }
        : { tur: 'kaynaştırma', birim: yazim, sonuc: ses, konum, aciklama: `kaynaştırma: ${ses}` }
    }
    if (govdeOlayiMi(o) || o.konum < konum || (cikti && o.konum === konum)) return o
    return { ...o, konum: o.konum + kay }
  })
  const yuzey = cikti
    ? parca.yuzey.slice(0, konum) + parca.yuzey.slice(konum + 1)
    : parca.yuzey.slice(0, konum) + ses + parca.yuzey.slice(konum)
  return { ...parca, yuzey, olaylar }
}

function farkliOzellikler(beklenen: Unlu, secilen: Unlu): KopyalananOzellik[] {
  const b = UNLULER[beklenen]
  const s = UNLULER[secilen]
  const farklar: KopyalananOzellik[] = []
  if (b.kalin !== s.kalin) farklar.push('kalınlık')
  if (b.yuvarlak !== s.yuvarlak) farklar.push('yuvarlaklık')
  return farklar
}

type KaynastirmaOlayi = Extract<EkOlayi, { tur: 'kaynaştırma' | 'saklanma' }>

/**
 * (y), (n) ya da (s) ile başlayan ekte ayraçlı ünsüzün olayı: yüzeye çıktıysa kaynaştırma,
 * çıkmadıysa saklanma. Ek bu türden değilse, zamir n ya da tekrarlanmayan çoğul almışsa
 * undefined.
 */
function kaynastirmaOlayi(parca: EkParcasi): { olay: KaynastirmaOlayi; ses: string } | undefined {
  const [ilkBirim] = sablonuCoz(parca.sablon)
  if (ilkBirim?.tur !== 'ayracli-unsuz') return undefined
  if (parca.olaylar.some((o) => o.tur === 'zamir n' || o.tur === 'çoğul tekrarlanmaz')) {
    return undefined
  }
  const olay = parca.olaylar.find(
    (o): o is KaynastirmaOlayi =>
      (o.tur === 'kaynaştırma' || o.tur === 'saklanma') && o.birim === ilkBirim.yazim,
  )
  return olay ? { olay, ses: ilkBirim.ses } : undefined
}

/** Ekin kabul edilen yüzeyleri: ünlü kılıkları, D ve C yuvalarında taş ya da jöle. */
function kabulYuzeyleri(parca: EkParcasi): string[] {
  let yuzeyler = unluKiliklari(parca)
  for (const { konum, tas, jole } of unsuzYuvalari(parca)) {
    yuzeyler = yuzeyler.flatMap((y) =>
      [tas, jole].map((harf) => y.slice(0, konum) + harf + y.slice(konum + 1)),
    )
  }
  return [...new Set(yuzeyler)]
}

const heceSayisi = (kelime: string): number => [...kelime].filter((h) => unluMu(h)).length

/**
 * Gövde ve seçilen yüzeyler (parcalar, her ek için bir yüzey: "lar", "um") neden uymuyor?
 * Aday doğruysa boş liste döner. Gövde kökün kendisi ya da gövde sınırında yumuşamış hâli
 * olmalıdır (kitap, kitab); seçilen yüzey ekin kılıklarından biri olmalıdır (ünlüleri
 * yuzeySecenekleri'nden, D ve C yuvası taş ya da jöle). Değilse hata verir.
 *
 *     neden('ev', ['PL'], ['lar'])                    // [PL: kalınlık; e'ye bakar, a seçilmiş]
 *     neden('top', ['PL', 'POSS.1SG'], ['ler', 'im'])  // [PL: kalınlık]; im, e'ye uyar
 *     neden('kitap', ['POSS.1SG'], ['ım'])             // [gövde: yumuşama]
 *     neden('top', ['POSS.1SG'], ['um'], 'tob')        // [gövde: inatçı]
 *     neden('kitap', ['LOC'], ['da'])                  // [LOC: sertleşme]
 *     neden('saat', ['PL'], ['lar'])                  // [diğer]: saatler misafir kelime
 */
export function neden(
  kok: string,
  etiketler: readonly string[],
  parcalar: readonly string[],
  govde: string = kok,
  envanter: EkEnvanteri = EK_ENVANTERI,
  sozluk: KokSozlugu = KOK_SOZLUGU,
): Neden[] {
  if (parcalar.length !== etiketler.length) {
    throw new Error(`${etiketler.length} ek için ${parcalar.length} yüzey verildi`)
  }
  const temizKok = kok.normalize('NFC')
  const temizGovde = govde.normalize('NFC')
  const secilenler = parcalar.map((parca) => parca.normalize('NFC'))

  const govdeSiniri = sinirSecenekleri(temizKok, etiketler, envanter, sozluk).find(
    (s) => s.yer === 'gövde',
  )
  const yumusamis = govdeSiniri ? temizKok.slice(0, -1) + govdeSiniri.jole : undefined
  if (temizGovde !== temizKok && temizGovde !== yumusamis) {
    const gecerli = yumusamis ? `${temizKok} ya da ${yumusamis}` : temizKok
    throw new Error(`"${govde}", ${temizKok} + ${etiketler.join('+')} için gövde olamaz: ${gecerli}`)
  }

  const aday = temizGovde + secilenler.join('')
  if (olasiBicimler(temizKok, etiketler, envanter, sozluk).includes(aday)) return []

  const govdeNedenleri: GovdeNedeni[] = []
  const ekBasiNedenleri: (KaynastirmaNedeni | EkBasiNedeni)[] = []
  const uyumNedenleri: UyumNedeni[] = []

  // 1. Gövde sınırı.
  if (govdeSiniri) {
    const secilen: Karo = temizGovde === temizKok ? 'taş' : 'jöle'
    if (!govdeSiniri.dogrular.includes(secilen)) {
      const ad =
        secilen === 'taş' ? 'yumuşama' : heceSayisi(temizKok) === 1 ? 'inatçı' : 'yumuşamaz'
      govdeNedenleri.push({
        tur: 'gövde',
        ad,
        kok: temizKok,
        tas: govdeSiniri.tas,
        jole: govdeSiniri.jole,
        secilen,
        secilenKonumu: temizGovde.length - 1,
      })
    }
  }

  // Ekin yuvaları doğru biçimin parçalarından okunur: seçim ekin öteki seslerini değiştirmez,
  // kılıklar yalnız bu yuvalarda ayrılır.
  const { parcalar: dogruParcalar } = ekle(temizKok, etiketler, envanter, sozluk)
  let bas = temizGovde.length
  dogruParcalar.forEach((dogruParca, i) => {
    const secilen = secilenler[i] ?? ''
    // Seçilen yüzey doğru parçanın ya da kaynaştırma karşıtının kılığıdır (zelü + e).
    const karsit = kaynastirmaKarsiti(dogruParca)
    const parca = [dogruParca, ...(karsit ? [karsit] : [])].find((p) =>
      kabulYuzeyleri(p).includes(secilen),
    )
    if (!parca) {
      const kiliklar = [dogruParca, ...(karsit ? [karsit] : [])].flatMap(kabulYuzeyleri)
      throw new Error(
        `"${secilen}", ${dogruParca.etiket} ekinin (${dogruParca.sablon}) kılıklarından biri ` +
          `değil: ${kiliklar.join(', ')}`,
      )
    }

    // 2. Ek başı: önce kaynaştırma, sonra D ve C; yerel, adayda önceki sese göre.
    const kaynastirma = kaynastirmaOlayi(parca)
    if (kaynastirma) {
      const secilenKonumu = bas + kaynastirma.olay.konum
      const bakilanKonumu = secilenKonumu - 1
      const bakilan = aday[bakilanKonumu] ?? ''
      const girdi = kaynastirma.olay.tur === 'kaynaştırma'
      if (unluMu(bakilan) !== girdi) {
        ekBasiNedenleri.push({
          tur: 'kaynaştırma',
          durum: girdi ? 'fazla' : 'eksik',
          etiket: parca.etiket,
          harf: kaynastirma.ses,
          bakilan,
          bakilanKonumu,
          secilenKonumu,
        })
      }
    }
    for (const { konum, tas, jole } of unsuzYuvalari(parca)) {
      const secilenKonumu = bas + konum
      const bakilanKonumu = secilenKonumu - 1
      const bakilan = aday[bakilanKonumu] ?? ''
      const beklenen = ekBasiBeklenen(bakilan) === 'taş' ? tas : jole
      const secilenHarf = secilen[konum] ?? ''
      if (secilenHarf === beklenen) continue
      ekBasiNedenleri.push({
        tur: 'ek başı',
        ad: beklenen === tas ? 'sertleşme' : 'yumuşak',
        etiket: parca.etiket,
        bakilan,
        bakilanKonumu,
        beklenen,
        secilen: secilenHarf,
        secilenKonumu,
      })
    }

    // 3. Ünlü uyumu.
    for (const { konum, birim } of unluYuvalari(parca)) {
      const oncesi = aday.slice(0, bas + konum)
      const { bakilan, sonuc: beklenen } = uyum(oncesi, birim, konum, false)
      const secilenUnlu = secilen[konum]
      if (!unluMu(secilenUnlu)) throw new Error(`"${secilen}" yüzeyinde ${konum}. ses ünlü değil`)
      const ozellikler = farkliOzellikler(beklenen, secilenUnlu)
      if (ozellikler.length === 0) continue
      const bakilanKonumu = sonUnluKonumu(oncesi)
      uyumNedenleri.push({
        tur: 'uyum',
        etiket: parca.etiket,
        ozellikler,
        bakilan,
        bakilanKonumu,
        bakilanKokte: bakilanKonumu < temizGovde.length,
        beklenen,
        secilen: secilenUnlu,
        secilenKonumu: bas + konum,
      })
    }
    bas += secilen.length
  })
  const nedenler: Neden[] = [...govdeNedenleri, ...ekBasiNedenleri, ...uyumNedenleri]
  return nedenler.length > 0 ? nedenler : [{ tur: 'diğer' }]
}

const kalinlikAdi = (unlu: Unlu): string => (UNLULER[unlu].kalin ? 'kalın' : 'ince')
const yuvarlaklikAdi = (unlu: Unlu): string => (UNLULER[unlu].yuvarlak ? 'yuvarlak' : 'düz')

/**
 * Çocuğa gösterilecek cümle, yalnız ilk neden için. Harfler ve kök nedenden (görevden) gelir.
 *
 * Ünlü uyumu, önce bakılan ünlü, sonra seçilen ünlü:
 *
 *     e ince, a kalın. Kalınlıkları uyuşmuyor.
 *     o yuvarlak, ı düz. Yuvarlaklıkları uyuşmuyor.
 *     ö ince ve yuvarlak, ı kalın ve düz. İkisi de uyuşmuyor.
 *
 * Bakılan ünlü kökte değil de önceki bir ekteyse sona "Bukalemun en yakın ünlüye bakar."
 * eklenir.
 *
 * Gövde ve ek başı:
 *
 *     kaynaştırma  İki ünlü yan yana gelmez: araya y girer.   (eksik; n ve s'de harf değişir)
 *                  Ünsüzden sonra araya y girmez.             (fazla)
 *     yumuşama   p ünlüden önce jöle olur: b.
 *     inatçı     top inatçı: p taş kalır.
 *     yumuşamaz  sepet kelimesinde t taş kalır.
 *     sertleşme  p taş, ekin başı da taş olur: t.
 *     yumuşak    v jöle, ekin başı da jöle kalır: d.
 *                Ünlüden sonra ekin başı jöle kalır: c.   (önceki ses ünlüyse)
 *
 * Neden yoksa ya da ilk neden "diğer"se cümle boştur.
 */
export function nedenCumlesi(nedenler: readonly Neden[]): string {
  const ilk = nedenler[0]
  if (ilk === undefined) return ''
  switch (ilk.tur) {
    case 'diğer':
      return ''
    case 'gövde':
      switch (ilk.ad) {
        case 'yumuşama':
          return `${ilk.tas} ünlüden önce jöle olur: ${ilk.jole}.`
        case 'inatçı':
          return `${ilk.kok} inatçı: ${ilk.tas} taş kalır.`
        case 'yumuşamaz':
          return `${ilk.kok} kelimesinde ${ilk.tas} taş kalır.`
      }
      break
    case 'kaynaştırma':
      return ilk.durum === 'eksik'
        ? `İki ünlü yan yana gelmez: araya ${ilk.harf} girer.`
        : `Ünsüzden sonra araya ${ilk.harf} girmez.`
    case 'ek başı':
      if (ilk.ad === 'sertleşme') {
        return `${ilk.bakilan} taş, ekin başı da taş olur: ${ilk.beklenen}.`
      }
      return unluMu(ilk.bakilan)
        ? `Ünlüden sonra ekin başı jöle kalır: ${ilk.beklenen}.`
        : `${ilk.bakilan} jöle, ekin başı da jöle kalır: ${ilk.beklenen}.`
    case 'uyum':
      return uyumCumlesi(ilk)
  }
  return ''
}

function uyumCumlesi(ilk: UyumNedeni): string {
  const { bakilan: b, secilen: s, ozellikler } = ilk
  const kalinlik = ozellikler.includes('kalınlık')
  const yuvarlaklik = ozellikler.includes('yuvarlaklık')
  const cumle =
    kalinlik && yuvarlaklik
      ? `${b} ${kalinlikAdi(b)} ve ${yuvarlaklikAdi(b)}, ${s} ${kalinlikAdi(s)} ve ` +
        `${yuvarlaklikAdi(s)}. İkisi de uyuşmuyor.`
      : kalinlik
        ? `${b} ${kalinlikAdi(b)}, ${s} ${kalinlikAdi(s)}. Kalınlıkları uyuşmuyor.`
        : `${b} ${yuvarlaklikAdi(b)}, ${s} ${yuvarlaklikAdi(s)}. Yuvarlaklıkları uyuşmuyor.`
  return ilk.bakilanKokte ? cumle : `${cumle} Bukalemun en yakın ünlüye bakar.`
}
