// Kök + ekler → yüzey biçimi. Ekler sırayla eklenir; her ekin şablonu, o ana kadar kurulan
// gövdeye bakılarak soldan sağa çözülür. Oyun olayları canlandıracağı için her ek, sonucun
// yanında hangi kuralların uygulandığını da taşır.
//
// Kapsam (Oturum 2): ünlü uyumu, -DA/-DAn/-CI benzeşmesi, kaynaştırma (y, s, n), zamir n.
// Ünsüz yumuşaması, ünlü düşmesi ve sözlük istisnaları henüz yok.

import { EK_ENVANTERI, type EkEnvanteri, type EkTanimi, type EkTuru } from './envanter.ts'
import type { Birim, UnluArkafonemi, UnsuzArkafonemi } from './sablon.ts'
import { ALFABE, UNLULER, sertMi, sonSes, sonUnlu, unluBul, unluMu, type Unlu } from './ses.ts'

export type KopyalananOzellik = 'kalınlık' | 'yuvarlaklık'

interface OlayTemeli {
  /**
   * Olayın, ekin yüzey biçimindeki yeri (0'dan başlar). Saklanan bir birim için,
   * saklanmasaydı duracağı yer.
   */
  readonly konum: number
  /** Kısa açıklama: "uyum: kalınlık kopyalandı", "benzeşme: D→t", "zamir n". */
  readonly aciklama: string
}

export type Olay =
  | (OlayTemeli & {
      readonly tur: 'uyum'
      /** Şablondaki birim: "A", "I" ya da "(I)". */
      readonly birim: string
      readonly arkafonem: UnluArkafonemi
      /** Gövdenin o ana kadarki son ünlüsü. */
      readonly bakilan: Unlu
      readonly sonuc: Unlu
      readonly kopyalanan: readonly KopyalananOzellik[]
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

export interface EkParcasi {
  readonly etiket: string
  readonly sablon: string
  readonly tur: EkTuru
  /** Ekin yüzey biçimi: "ler", "im", "ta", "nde" ... */
  readonly yuzey: string
  /** Uygulanan olaylar, şablondaki sırasıyla. */
  readonly olaylar: readonly Olay[]
}

export interface EklemeSonucu {
  readonly bicim: string
  readonly parcalar: readonly EkParcasi[]
}

// 3. kişi iyelikten sonra bu durum ekleri zamir n'si alır: evini, evine, evinde, evinden.
// Araç eki almaz (eviyle). İlgi ekinin n'si kendi kaynaştırmasıdır: -(n)In → kedisinin.
const ZAMIR_N_ONCESI: ReadonlySet<string> = new Set(['POSS.3SG', 'POSS.3PL'])
const ZAMIR_N_ALAN: ReadonlySet<string> = new Set(['ACC', 'DAT', 'LOC', 'ABL'])

const UYUM_KOPYALAR: Readonly<Record<UnluArkafonemi, readonly KopyalananOzellik[]>> = {
  A: ['kalınlık'],
  I: ['kalınlık', 'yuvarlaklık'],
}

const SERT_KARSILIK: Readonly<Record<UnsuzArkafonemi, { sert: 't' | 'ç'; yumusak: string }>> = {
  D: { sert: 't', yumusak: 'd' },
  C: { sert: 'ç', yumusak: 'c' },
}

/**
 * Köke ekleri sırayla ekler.
 *
 *     ekle('kitap', ['LOC']).bicim  // "kitapta"
 */
export function ekle(
  kok: string,
  etiketler: readonly string[],
  envanter: EkEnvanteri = EK_ENVANTERI,
): EklemeSonucu {
  const temizKok = kok.normalize('NFC')
  if (temizKok === '') throw new Error('Kök boş')
  for (const harf of temizKok) {
    if (!ALFABE.has(harf)) {
      throw new Error(`"${kok}" kökünde alfabe dışı harf var: "${harf}" (yalnız küçük harf)`)
    }
  }

  let govde = temizKok
  let onceki: string | undefined
  const parcalar: EkParcasi[] = []
  for (const etiket of etiketler) {
    const ek = envanter.get(etiket)
    if (!ek) throw new Error(`Bilinmeyen ek etiketi: "${etiket}"`)
    const zamirN = onceki !== undefined && ZAMIR_N_ONCESI.has(onceki) && ZAMIR_N_ALAN.has(etiket)
    const parca = ekiCoz(govde, ek, zamirN)
    parcalar.push(parca)
    govde += parca.yuzey
    onceki = etiket
  }
  return { bicim: govde, parcalar }
}

function ekiCoz(govde: string, ek: EkTanimi, zamirN: boolean): EkParcasi {
  let yuzey = ''
  const olaylar: Olay[] = []

  if (zamirN) {
    olaylar.push({ tur: 'zamir n', sonuc: 'n', konum: 0, aciklama: 'zamir n' })
    yuzey = 'n'
  }

  for (const birim of ek.birimler) {
    const oncesi = govde + yuzey
    const konum = yuzey.length
    switch (birim.tur) {
      case 'harf':
        yuzey += birim.ses
        break

      case 'unlu': {
        const olay = uyum(oncesi, birim, konum)
        olaylar.push(olay)
        yuzey += olay.sonuc
        break
      }

      case 'ayracli-unlu':
        // (I) ünlüden sonra saklanır.
        if (unluMu(sonSes(oncesi))) {
          olaylar.push(saklanma(birim, konum))
        } else {
          const olay = uyum(oncesi, birim, konum)
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

  return { etiket: ek.etiket, sablon: ek.sablon, tur: ek.tur, yuzey, olaylar }
}

/** Ayraçlı birim yüzeye çıkmaz: ünlüden sonra (I), ünsüzden sonra (y), (s), (n). */
function saklanma(birim: Birim, konum: number): Olay {
  return { tur: 'saklanma', birim: birim.yazim, konum, aciklama: `saklanma: ${birim.yazim}` }
}

/**
 * Ünlü uyumu: ekin ünlüsü, o ana kadar kurulan gövdenin son ünlüsüne bakar.
 * A yalnız kalınlığı kopyalar ve geniş, düz kalır (a/e); I kalınlığı ve yuvarlaklığı
 * kopyalar ve dar kalır (ı/i/u/ü).
 */
function uyum(
  oncesi: string,
  birim: Extract<Birim, { arkafonem: UnluArkafonemi }>,
  konum: number,
): Extract<Olay, { tur: 'uyum' }> {
  const { arkafonem } = birim
  const bakilan = sonUnlu(oncesi)
  if (bakilan === undefined) {
    throw new Error(`"${oncesi}" gövdesinde ünlü yok; ${birim.yazim} uyumla çözülemez`)
  }
  const o = UNLULER[bakilan]
  const sonuc =
    arkafonem === 'A'
      ? unluBul({ kalin: o.kalin, yuvarlak: false, genis: true })
      : unluBul({ kalin: o.kalin, yuvarlak: o.yuvarlak, genis: false })
  const kopyalanan = UYUM_KOPYALAR[arkafonem]
  return {
    tur: 'uyum',
    birim: birim.yazim,
    arkafonem,
    bakilan,
    sonuc,
    kopyalanan,
    konum,
    aciklama: `uyum: ${kopyalanan.join(' ve ')} kopyalandı`,
  }
}
