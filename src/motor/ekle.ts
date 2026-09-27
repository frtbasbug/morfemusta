// Kök + ekler → yüzey biçimi. Ekler sırayla eklenir; her ekin şablonu, o ana kadar kurulan
// gövdeye bakılarak soldan sağa çözülür. Ünlüyle başlayan bir ek gövdeyi de değiştirebilir:
// kitap → kitabı, ağız → ağzım. Oyun olayları canlandıracağı için her ek, sonucun yanında
// hangi kuralların uygulandığını da taşır.
//
// Oturum 2: ünlü uyumu, -DA/-DAn/-CI benzeşmesi, kaynaştırma (y, s, n), zamir n, çoğuldan
// sonra 3. çoğul iyelik (evleri).
// Oturum 3: ünsüz yumuşaması, ünlü düşmesi, sözlük istisnaları (ince ek, ikizleşme, su) ve
// uydurma kelime.
//
// "Ünlüyle başlayan ek", parantezli sesler çözüldükten sonra yüzeyde ünlüyle başlayan ektir:
// -(y)I ünsüzden sonra "ı" (kitabı), ünlüden sonra "yı" (kediyi).
//
// Sözlük işaretleri (icerik/kokler.csv) yalnız çıplak köke, yani köke gelen ilk eke
// uygulanır. Sözlükte olmayan kök uydurmadır: uyum, benzeşme ve kaynaştırma onda da
// kategoriktir; ünlü düşmesi, ikizleşme ve ince ek yalnız sözlükte işaretli köklerde olur.
// Sonu p, ç, t ya da k olan uydurma kökte ünlüyle başlayan ekten önce iki biçim de kabul
// edilir: ekle kökü bozmayanı verir (pıtakı), olasiBicimler ikisini de (pıtakı, pıtağı).

import { EK_ENVANTERI, type EkEnvanteri, type EkTanimi, type EkTuru } from './envanter.ts'
import type { Birim, UnluArkafonemi, UnsuzArkafonemi } from './sablon.ts'
import {
  ALFABE,
  UNLULER,
  YUMUSAMA,
  sertMi,
  sonSes,
  sonUnlu,
  sonUnluKonumu,
  unluBul,
  unluMu,
  yumusayanMi,
  type Unlu,
  type YumusayanUnsuz,
} from './ses.ts'
import { KOK_SOZLUGU, type KokGirdisi, type KokSozlugu } from './sozluk.ts'

export type KopyalananOzellik = 'kalınlık' | 'yuvarlaklık'

interface OlayTemeli {
  /**
   * Olayın yeri (0'dan başlar). Gövde olaylarında parçanın gövdesinde, ek olaylarında ekin
   * yüzey biçiminde. Saklanan bir birim ya da düşen bir ünlü için, yüzeye çıksaydı duracağı
   * yer.
   */
  readonly konum: number
  /** Kısa açıklama: "uyum: kalınlık kopyalandı", "benzeşme: D→t", "yumuşama: k→ğ". */
  readonly aciklama: string
}

interface UnluSecimi {
  /** Şablondaki birim: "A", "I" ya da "(I)". */
  readonly birim: string
  readonly arkafonem: UnluArkafonemi
  /** Gövdenin o ana kadarki son ünlüsü. */
  readonly bakilan: Unlu
  readonly sonuc: Unlu
  readonly kopyalanan: readonly KopyalananOzellik[]
}

/** Ekin kendi yüzeyinde olan olaylar; konum, parçanın yüzeyindedir. */
export type EkOlayi =
  | (OlayTemeli & UnluSecimi & { readonly tur: 'uyum' })
  | (OlayTemeli &
      UnluSecimi & {
        /**
         * Misafir kelime (istisna=ince-ek): köke gelen ilk ekin ünlüsü incedir, kalınlık
         * kopyalanmaz; I yine yuvarlaklığı kopyalar (saatler, harfi, golü).
         */
        readonly tur: 'ince ek'
      })
  | (OlayTemeli & {
      readonly tur: 'kaynaştırma'
      /** "(y)", "(s)" ya da "(n)". */
      readonly birim: string
      readonly sonuc: string
    })
  | (OlayTemeli & {
      readonly tur: 'saklanma'
      /** Yüzeye çıkmayan ayraçlı birim: ünlüden sonra "(I)", ünsüzden sonra "(y)" gibi. */
      readonly birim: string
    })
  | (OlayTemeli & {
      readonly tur: 'benzeşme'
      readonly birim: UnsuzArkafonemi
      /** Önceki sert ünsüz. */
      readonly bakilan: string
      readonly sonuc: 't' | 'ç'
    })
  | (OlayTemeli & {
      readonly tur: 'zamir n'
      readonly sonuc: 'n'
    })
  | (OlayTemeli & {
      readonly tur: 'çoğul tekrarlanmaz'
      /** Şablondan yüzeye çıkmayan çoğul kısmı: "-lAr". */
      readonly birim: string
    })

/** Ekin geldiği gövdede olan olaylar; konum, parçanın gövdesindedir. */
export type GovdeOlayi =
  | (OlayTemeli & {
      readonly tur: 'yumuşama'
      /** Gövdenin sert son ünsüzü. */
      readonly bakilan: YumusayanUnsuz
      /** Yumuşak karşılığı; n'den sonra k, g olur (rengi). */
      readonly sonuc: 'b' | 'c' | 'd' | 'ğ' | 'g'
    })
  | (OlayTemeli & {
      readonly tur: 'ünlü düşmesi'
      /** Gövdeden düşen ünlü. */
      readonly dusen: Unlu
    })
  | (OlayTemeli & {
      readonly tur: 'ikizleşme'
      /** İkizlenen ünsüz; konum eklenen ikizi gösterir (sırrım). */
      readonly sonuc: string
    })
  | (OlayTemeli & {
      /** Gövde y alır: suyu, suya. */
      readonly tur: 'su'
      readonly sonuc: 'y'
    })

export type Olay = GovdeOlayi | EkOlayi

const GOVDE_OLAYLARI: ReadonlySet<Olay['tur']> = new Set<Olay['tur']>([
  'yumuşama',
  'ünlü düşmesi',
  'ikizleşme',
  'su',
])

/** Olay gövdede mi (konumu parçanın gövdesinde), ekin yüzeyinde mi? */
export function govdeOlayiMi(olay: Olay): olay is GovdeOlayi {
  return GOVDE_OLAYLARI.has(olay.tur)
}

export interface EkParcasi {
  readonly etiket: string
  readonly sablon: string
  readonly tur: EkTuru
  /**
   * Ekin eklendiği gövde, ekin yol açtığı değişikliklerle: "kitab" (kitabı), "ağz" (ağzım),
   * "suy" (suyu). Değişiklik yoksa o ana kadar kurulan kelimedir.
   */
  readonly govde: string
  /** Ekin yüzey biçimi: "ler", "im", "ta", "nde" ... */
  readonly yuzey: string
  /** Uygulanan olaylar: önce gövde olayları, sonra şablondaki sırasıyla ek olayları. */
  readonly olaylar: readonly Olay[]
}

export interface EklemeSonucu {
  readonly bicim: string
  readonly parcalar: readonly EkParcasi[]
}

/** Motorun okuduğu içerik; verilmeyen, icerik/*.csv'deki envanter ve sözlüktür. */
export interface Kaynaklar {
  readonly envanter?: EkEnvanteri
  readonly sozluk?: KokSozlugu
}

// 3. kişi iyelikten sonra bu durum ekleri zamir n'si alır: evini, evine, evinde, evinden.
// Araç eki almaz (eviyle). İlgi ekinin n'si kendi kaynaştırmasıdır: -(n)In → kedisinin.
const ZAMIR_N_ONCESI: ReadonlySet<string> = new Set(['POSS.3SG', 'POSS.3PL'])

// Çoğuldan sonra 3. çoğul iyelik yalnız -I olarak gelir: evleri (*evlerleri).
// POSS.3PL şablonunun başındaki çoğul kısmı (PL'nin şablonu) yüzeye çıkmaz.
const COGUL = 'PL'
const COGUL_IYELIK = 'POSS.3PL'
const ZAMIR_N_ALAN: ReadonlySet<string> = new Set(['ACC', 'DAT', 'LOC', 'ABL'])

// -lIk ya da -CIk ile biten türemiş gövdenin k'si ünlüyle başlayan ekten önce hep ğ olur:
// gözlüğüm, kediciğim. Kök uydurma olsa da.
const YUMUSAYAN_YAPIM_EKLERI: ReadonlySet<string> = new Set(['-lIk', '-CIk'])

const UYUM_KOPYALAR: Readonly<Record<UnluArkafonemi, readonly KopyalananOzellik[]>> = {
  A: ['kalınlık'],
  I: ['kalınlık', 'yuvarlaklık'],
}

const INCE_EK_KOPYALAR: Readonly<Record<UnluArkafonemi, readonly KopyalananOzellik[]>> = {
  A: [],
  I: ['yuvarlaklık'],
}

const SERT_KARSILIK: Readonly<Record<UnsuzArkafonemi, { sert: 't' | 'ç'; yumusak: string }>> = {
  D: { sert: 't', yumusak: 'd' },
  C: { sert: 'ç', yumusak: 'c' },
}

/**
 * Köke ekleri sırayla ekler ve varsayılan biçimi verir. Uydurma kökte bu, kökü bozmayan
 * biçimdir.
 *
 *     ekle('kitap', ['ACC']).bicim  // "kitabı"
 *     ekle('pıtak', ['ACC']).bicim  // "pıtakı"
 */
export function ekle(
  kok: string,
  etiketler: readonly string[],
  kaynaklar: Kaynaklar = {},
): EklemeSonucu {
  return turet(kok, etiketler, kaynaklar, false)
}

/**
 * Kabul edilen bütün biçimler; ilki ekle'nin verdiği varsayılan biçimdir. İkinci bir biçim
 * yalnız sonu p, ç, t ya da k olan uydurma kökte, köke gelen ilk ek ünlüyle başlıyorsa çıkar.
 *
 *     olasiBicimler('pıtak', ['ACC'])  // ["pıtakı", "pıtağı"]
 *     olasiBicimler('kitap', ['ACC'])  // ["kitabı"]
 */
export function olasiBicimler(
  kok: string,
  etiketler: readonly string[],
  kaynaklar: Kaynaklar = {},
): string[] {
  const varsayilan = turet(kok, etiketler, kaynaklar, false).bicim
  const yumusamis = turet(kok, etiketler, kaynaklar, true).bicim
  return varsayilan === yumusamis ? [varsayilan] : [varsayilan, yumusamis]
}

/** Köke gelen ilk ekin bilmesi gerekenler; sonraki eklerde yoktur. */
interface CiplakKok {
  /** Sözlük girdisi; uydurma kökte undefined. */
  readonly girdi: KokGirdisi | undefined
  /** Uydurma kökün sert son ünsüzü ünlüyle başlayan ekten önce yumuşasın mı (pıtağı). */
  readonly uydurmaYumusasin: boolean
}

function turet(
  kok: string,
  etiketler: readonly string[],
  { envanter = EK_ENVANTERI, sozluk = KOK_SOZLUGU }: Kaynaklar,
  uydurmaYumusasin: boolean,
): EklemeSonucu {
  const temizKok = kok.normalize('NFC')
  if (temizKok === '') throw new Error('Kök boş')
  for (const harf of temizKok) {
    if (!ALFABE.has(harf)) {
      throw new Error(`"${kok}" kökünde alfabe dışı harf var: "${harf}" (yalnız küçük harf)`)
    }
  }
  const girdi = sozluk.get(temizKok)

  let kelime = temizKok
  let onceki: EkTanimi | undefined
  const parcalar: EkParcasi[] = []
  for (const etiket of etiketler) {
    const ek = envanter.get(etiket)
    if (!ek) throw new Error(`Bilinmeyen ek etiketi: "${etiket}"`)
    const ciplakKok = onceki === undefined ? { girdi, uydurmaYumusasin } : undefined
    const cogulTekrari = onceki?.etiket === COGUL && etiket === COGUL_IYELIK
    const atlanan = cogulTekrari ? cogulKismi(envanter, ek) : 0
    const parca = ekiEkle(kelime, ek, onceki, ciplakKok, atlanan)
    parcalar.push(parca)
    kelime = parca.govde + parca.yuzey
    onceki = ek
  }
  return { bicim: kelime, parcalar }
}

/** POSS.3PL şablonunun başında PL şablonunun kaç birim tuttuğu (-lArI'da -lAr: 3). */
function cogulKismi(envanter: EkEnvanteri, iyelik: EkTanimi): number {
  const cogul = envanter.get(COGUL)
  const birimler = cogul?.birimler ?? []
  const onEk = birimler.every((b, i) => iyelik.birimler[i]?.yazim === b.yazim)
  if (!cogul || birimler.length === 0 || !onEk || birimler.length >= iyelik.birimler.length) {
    throw new Error(`${iyelik.etiket} şablonu (${iyelik.sablon}) ${COGUL} şablonuyla başlamıyor`)
  }
  return birimler.length
}

/**
 * Tek bir eki o ana kadar kurulan kelimeye ekler; gövdede olanları da uygular.
 *
 * @param atlanan Şablonun başından yüzeye çıkmayan birim sayısı (çoğul tekrarlanmaz).
 */
function ekiEkle(
  kelime: string,
  ek: EkTanimi,
  onceki: EkTanimi | undefined,
  ciplakKok: CiplakKok | undefined,
  atlanan: number,
): EkParcasi {
  const girdi = ciplakKok?.girdi
  const govdeOlaylari: GovdeOlayi[] = []
  let govde = kelime
  const uygula = (degisim: [string, GovdeOlayi] | undefined) => {
    if (!degisim) return
    govde = degisim[0]
    govdeOlaylari.push(degisim[1])
  }

  // su: parantezli sesle başlayan ek gelince gövde y alır (suyu, suyum); ünsüzle başlayan
  // ekte almaz (sular, sulu).
  const ilkBirim = ek.birimler[0]
  if (
    girdi?.istisna === 'su' &&
    (ilkBirim?.tur === 'ayracli-unsuz' || ilkBirim?.tur === 'ayracli-unlu')
  ) {
    uygula([govde + 'y', { tur: 'su', sonuc: 'y', konum: govde.length, aciklama: 'su: y' }])
  }

  // Ek, gövde değişmeden önce çözülür: ünlüyle başlayıp başlamadığı ancak böyle bilinir, uyum
  // da düşecek ünlüye bakar (vakit → vaktim, vaktım değil).
  const zamirN =
    onceki !== undefined && ZAMIR_N_ONCESI.has(onceki.etiket) && ZAMIR_N_ALAN.has(ek.etiket)
  const { yuzey, olaylar } = ekiCoz(govde, ek, zamirN, atlanan, girdi?.istisna === 'ince-ek')

  if (unluMu(yuzey[0])) {
    if (ciplakKok) {
      if (girdi?.unluDusmesi) uygula(unluDusur(govde))
      if (girdi?.istisna === 'ikiz') uygula(ikizlestir(govde))
      if (girdi ? girdi.yumusama === true : ciplakKok.uydurmaYumusasin) uygula(yumusat(govde))
    } else if (onceki !== undefined && YUMUSAYAN_YAPIM_EKLERI.has(onceki.sablon)) {
      uygula(yumusat(govde))
    }
  }

  return {
    etiket: ek.etiket,
    sablon: ek.sablon,
    tur: ek.tur,
    govde,
    yuzey,
    olaylar: [...govdeOlaylari, ...olaylar],
  }
}

/** Ünsüz yumuşaması: sert son ünsüz yumuşar (kitab-ı); n'den sonra k, g olur (reng-i). */
function yumusat(govde: string): [string, GovdeOlayi] | undefined {
  const son = sonSes(govde)
  if (!yumusayanMi(son)) return undefined
  const nk = son === 'k' && govde.at(-2) === 'n'
  const sonuc = nk ? 'g' : YUMUSAMA[son]
  const konum = govde.length - 1
  return [
    govde.slice(0, konum) + sonuc,
    {
      tur: 'yumuşama',
      bakilan: son,
      sonuc,
      konum,
      aciklama: nk ? 'yumuşama: nk→ng' : `yumuşama: ${son}→${sonuc}`,
    },
  ]
}

/** Ünlü düşmesi: kökün son ünlüsü düşer (ağız → ağz-ım). */
function unluDusur(govde: string): [string, GovdeOlayi] {
  const konum = sonUnluKonumu(govde)
  const dusen = sonUnlu(govde)
  if (dusen === undefined) throw new Error(`"${govde}" gövdesinde düşecek ünlü yok`)
  return [
    govde.slice(0, konum) + govde.slice(konum + 1),
    { tur: 'ünlü düşmesi', dusen, konum, aciklama: 'ünlü düşmesi' },
  ]
}

/** İkizleşme: son ünsüz ikizleşir (sır → sırr-ım). */
function ikizlestir(govde: string): [string, GovdeOlayi] {
  const son = sonSes(govde) ?? ''
  return [govde + son, { tur: 'ikizleşme', sonuc: son, konum: govde.length, aciklama: 'ikizleşme' }]
}

function ekiCoz(
  govde: string,
  ek: EkTanimi,
  zamirN: boolean,
  atlanan: number,
  ince: boolean,
): { yuzey: string; olaylar: EkOlayi[] } {
  let yuzey = ''
  const olaylar: EkOlayi[] = []
  let birimler = ek.birimler

  if (atlanan > 0) {
    const cogulYazimi = `-${birimler.slice(0, atlanan).map((b) => b.yazim).join('')}`
    birimler = birimler.slice(atlanan)
    const kalan = `-${birimler.map((b) => b.yazim).join('')}`
    olaylar.push({
      tur: 'çoğul tekrarlanmaz',
      birim: cogulYazimi,
      konum: 0,
      aciklama: `çoğul tekrarlanmaz: ${ek.sablon} → ${kalan}`,
    })
  }

  if (zamirN) {
    olaylar.push({ tur: 'zamir n', sonuc: 'n', konum: 0, aciklama: 'zamir n' })
    yuzey = 'n'
  }

  for (const birim of birimler) {
    const oncesi = govde + yuzey
    const konum = yuzey.length
    switch (birim.tur) {
      case 'harf':
        yuzey += birim.ses
        break

      case 'unlu': {
        const olay = unluSec(oncesi, birim, konum, ince)
        olaylar.push(olay)
        yuzey += olay.sonuc
        break
      }

      case 'ayracli-unlu':
        // (I) ünlüden sonra saklanır.
        if (unluMu(sonSes(oncesi))) {
          olaylar.push(saklanma(birim, konum))
        } else {
          const olay = unluSec(oncesi, birim, konum, ince)
          olaylar.push(olay)
          yuzey += olay.sonuc
        }
        break

      case 'ayracli-unsuz':
        // (y), (s), (n) yalnız ünlüden sonra çıkar.
        if (unluMu(sonSes(oncesi))) {
          olaylar.push({
            tur: 'kaynaştırma',
            birim: birim.yazim,
            sonuc: birim.ses,
            konum,
            aciklama: `kaynaştırma: ${birim.ses}`,
          })
          yuzey += birim.ses
        } else {
          olaylar.push(saklanma(birim, konum))
        }
        break

      case 'unsuz': {
        // D ve C sert ünsüzden sonra t ve ç olur.
        const sonHarf = sonSes(oncesi)
        const karsilik = SERT_KARSILIK[birim.arkafonem]
        if (sonHarf !== undefined && sertMi(sonHarf)) {
          olaylar.push({
            tur: 'benzeşme',
            birim: birim.arkafonem,
            bakilan: sonHarf,
            sonuc: karsilik.sert,
            konum,
            aciklama: `benzeşme: ${birim.arkafonem}→${karsilik.sert}`,
          })
          yuzey += karsilik.sert
        } else {
          yuzey += karsilik.yumusak
        }
        break
      }
    }
  }

  return { yuzey, olaylar }
}

/** Ayraçlı birim yüzeye çıkmaz: ünlüden sonra (I), ünsüzden sonra (y), (s), (n). */
function saklanma(birim: Birim, konum: number): EkOlayi {
  return { tur: 'saklanma', birim: birim.yazim, konum, aciklama: `saklanma: ${birim.yazim}` }
}

/**
 * Ünlü uyumu: ekin ünlüsü, o ana kadar kurulan gövdenin son ünlüsüne bakar.
 * A yalnız kalınlığı kopyalar ve geniş, düz kalır (a/e); I kalınlığı ve yuvarlaklığı
 * kopyalar ve dar kalır (ı/i/u/ü). İnce ekte kalınlık kopyalanmaz, ünlü incedir; I yine
 * yuvarlaklığı kopyalar (golü).
 */
function unluSec(
  oncesi: string,
  birim: Extract<Birim, { arkafonem: UnluArkafonemi }>,
  konum: number,
  ince: boolean,
): Extract<EkOlayi, { tur: 'uyum' | 'ince ek' }> {
  const { arkafonem } = birim
  const bakilan = sonUnlu(oncesi)
  if (bakilan === undefined) {
    throw new Error(`"${oncesi}" gövdesinde ünlü yok; ${birim.yazim} uyumla çözülemez`)
  }
  const o = UNLULER[bakilan]
  const kalin = ince ? false : o.kalin
  const sonuc =
    arkafonem === 'A'
      ? unluBul({ kalin, yuvarlak: false, genis: true })
      : unluBul({ kalin, yuvarlak: o.yuvarlak, genis: false })
  const secim = { birim: birim.yazim, arkafonem, bakilan, sonuc, konum }
  if (ince) {
    return {
      tur: 'ince ek',
      ...secim,
      kopyalanan: INCE_EK_KOPYALAR[arkafonem],
      aciklama: 'ince ek',
    }
  }
  const kopyalanan = UYUM_KOPYALAR[arkafonem]
  return {
    tur: 'uyum',
    ...secim,
    kopyalanan,
    aciklama: `uyum: ${kopyalanan.join(' ve ')} kopyalandı`,
  }
}
