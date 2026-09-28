// Yanlış biçimin nedeni: çocuğun köke taktığı bukalemunlar (ekin seçilen yüzeyleri) neden
// uymuyor? Bukalemun Koyu'nda düşen bukalemunun altına yazılan cümle buradan gelir.
//
// Aday, kök ile seçilen yüzeylerin art arda yazılmasıdır (at + ler → atler). Aday
// olasiBicimler içindeyse neden yoktur. Değilse ekler soldan sağa yerel uyumla sınanır: ekin
// her ünlüsü, adayda kendinden önceki son ünlüye bakılarak beklenir (istisnasız, olağan uyum)
// ve seçilen ünlüyle karşılaştırılır; uyuşmayan özellikler (kalınlık, yuvarlaklık) yazılır.
// Yerel sınama yüzünden toplerim yalnız çoğulun kalınlığını alır: im, önündeki e'ye uyar.
// Uyum farkı bulunamazsa aday başka bir yüzden yanlıştır (istisna: saatlar; yumuşama:
// kitapım) ve tek neden "diğer"dir.

import { ekle, olasiBicimler, uyum, type EkParcasi, type KopyalananOzellik } from './ekle.ts'
import { EK_ENVANTERI, type EkEnvanteri } from './envanter.ts'
import { sablonuCoz, type Birim, type UnluArkafonemi } from './sablon.ts'
import { ALFABE, UNLULER, sonUnluKonumu, unluMu, type Unlu } from './ses.ts'
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

/** Uyum farkı yok, aday yine de yanlış: istisna ya da yumuşama. */
export interface DigerNeden {
  readonly tur: 'diğer'
}

export type Neden = UyumNedeni | DigerNeden

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
 *     yuzeySecenekleri(ekle('at', ['PL']).parcalar[0])         // ["lar", "ler"]
 *     yuzeySecenekleri(ekle('kız', ['POSS.1SG']).parcalar[0])  // ["ım", "im", "um", "üm"]
 */
export function yuzeySecenekleri(parca: EkParcasi): string[] {
  let secenekler = [parca.yuzey]
  for (const { konum, unluler } of unluYuvalari(parca)) {
    secenekler = secenekler.flatMap((yuzey) =>
      unluler.map((unlu) => yuzey.slice(0, konum) + unlu + yuzey.slice(konum + 1)),
    )
  }
  return secenekler
}

function farkliOzellikler(beklenen: Unlu, secilen: Unlu): KopyalananOzellik[] {
  const b = UNLULER[beklenen]
  const s = UNLULER[secilen]
  const farklar: KopyalananOzellik[] = []
  if (b.kalin !== s.kalin) farklar.push('kalınlık')
  if (b.yuvarlak !== s.yuvarlak) farklar.push('yuvarlaklık')
  return farklar
}

/**
 * Kök + ekler için seçilen yüzeyler (parcalar, her ek için bir yüzey: "lar", "um") neden
 * uymuyor? Aday doğruysa boş liste döner. Seçilen yüzey ekin kılıklarından biri değilse
 * (yuzeySecenekleri) hata verir.
 *
 *     neden('ev', ['PL'], ['lar'])                   // [PL: kalınlık; e'ye bakar, a seçilmiş]
 *     neden('top', ['PL', 'POSS.1SG'], ['ler', 'im']) // [PL: kalınlık]; im, e'ye uyar
 *     neden('saat', ['PL'], ['lar'])                 // [diğer]: saatler misafir kelime
 */
export function neden(
  kok: string,
  etiketler: readonly string[],
  parcalar: readonly string[],
  envanter: EkEnvanteri = EK_ENVANTERI,
  sozluk: KokSozlugu = KOK_SOZLUGU,
): Neden[] {
  if (parcalar.length !== etiketler.length) {
    throw new Error(`${etiketler.length} ek için ${parcalar.length} yüzey verildi`)
  }
  const temizKok = kok.normalize('NFC')
  const secilenler = parcalar.map((parca) => parca.normalize('NFC'))
  const aday = temizKok + secilenler.join('')
  if (olasiBicimler(temizKok, etiketler, envanter, sozluk).includes(aday)) return []

  // Ekin yüzeyindeki ünlü yuvaları doğru biçimin parçalarından okunur: ünlü seçimi ekin
  // ünsüzlerini değiştirmez, kılıklar yalnız bu yuvalarda ayrılır.
  const { parcalar: dogruParcalar } = ekle(temizKok, etiketler, envanter, sozluk)
  const nedenler: Neden[] = []
  let bas = temizKok.length
  dogruParcalar.forEach((parca, i) => {
    const secilen = secilenler[i] ?? ''
    const kiliklar = yuzeySecenekleri(parca)
    if (!kiliklar.includes(secilen)) {
      throw new Error(
        `"${secilen}", ${parca.etiket} ekinin (${parca.sablon}) kılıklarından biri değil: ` +
          kiliklar.join(', '),
      )
    }
    for (const { konum, birim } of unluYuvalari(parca)) {
      const oncesi = aday.slice(0, bas + konum)
      const { bakilan, sonuc: beklenen } = uyum(oncesi, birim, konum, false)
      const secilenUnlu = secilen[konum]
      if (!unluMu(secilenUnlu)) throw new Error(`"${secilen}" yüzeyinde ${konum}. ses ünlü değil`)
      const ozellikler = farkliOzellikler(beklenen, secilenUnlu)
      if (ozellikler.length === 0) continue
      const bakilanKonumu = sonUnluKonumu(oncesi)
      nedenler.push({
        tur: 'uyum',
        etiket: parca.etiket,
        ozellikler,
        bakilan,
        bakilanKonumu,
        bakilanKokte: bakilanKonumu < temizKok.length,
        beklenen,
        secilen: secilenUnlu,
        secilenKonumu: bas + konum,
      })
    }
    bas += secilen.length
  })
  return nedenler.length > 0 ? nedenler : [{ tur: 'diğer' }]
}

const kalinlikAdi = (unlu: Unlu): string => (UNLULER[unlu].kalin ? 'kalın' : 'ince')
const yuvarlaklikAdi = (unlu: Unlu): string => (UNLULER[unlu].yuvarlak ? 'yuvarlak' : 'düz')

/**
 * Çocuğa gösterilecek cümle, yalnız ilk neden için. Önce bakılan ünlü, sonra seçilen ünlü:
 *
 *     e ince, a kalın. Kalınlıkları uyuşmuyor.
 *     o yuvarlak, ı düz. Yuvarlaklıkları uyuşmuyor.
 *     ö ince ve yuvarlak, ı kalın ve düz. İkisi de uyuşmuyor.
 *
 * Bakılan ünlü kökte değil de önceki bir ekteyse sona "Bukalemun en yakın ünlüye bakar."
 * eklenir. Neden yoksa ya da ilk neden "diğer"se cümle boştur.
 */
export function nedenCumlesi(nedenler: readonly Neden[]): string {
  const ilk = nedenler[0]
  if (ilk === undefined || ilk.tur !== 'uyum') return ''
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
