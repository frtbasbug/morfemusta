// Uydurma kök denetimi (Uydurukçuklar, Oturum 9). Uydurma kelime kanıttır (DESIGN.md,
// "İlkeler"): çocuk kuralı gerçek kelimede ezberden değil, uydurma kelimede sezgisinden kurar.
// Bunun için uydurma kök Türkçe gibi okunmalı, gerçek bir kelime olmamalı, çocuğa uygunsuz bir
// diziyi hiçbir biçiminde taşımamalıdır. Denetim sırayla sınar, ilk bozukluğu döner:
//
//   ses     iki hece; ilk ses b c ç d f g h k m n p s ş t v y z'den biri; ilk hece ünsüz +
//           ünlü; iki ünlü arasında bir ya da iki ünsüz (ikiyse ilki l r n m s ş z y'den
//           biri, ikisi aynı değil, n'den sonra b ya da p yok); sonda ünlü ya da p ç t k s ş z
//           l r m n y'den tek bir ünsüz; ikinci hecede o ve ö yok; iki hece aynı ünsüz ve
//           ünlüyle başlamaz; ğ ve j yok. Kök içi ünlü uyumu aranmaz: karışık kök (zelü) en
//           yakın ünlü kuralını sınar.
//   sözlük  kök sözlükte (icerik/kokler.csv): gerçek kelimedir.
//   yasak   kök ya da oyun biçimleri (PL, POSS.1SG, LOC, DAT, ACC; uydurma kökün iki biçimi de)
//           yasaklı bir dizi içerir (icerik/yasakli-diziler.csv). "başta" dizileri yalnız
//           kökün başında aranır.
//   ek      kök, başka bir kök ile envanterdeki bir ekin en az iki harflik yüzeyi gibi okunur
//           (kuş + lar → kuşlar; tuz + luk → tuzluk).
//
// Uydurma kökler ve yasaklı diziler yalnız kullanıcının onayıyla değişir (CLAUDE.md).

import yasakliDizilerMetni from '../../icerik/yasakli-diziler.csv?raw'
import { csvOku } from './csv.ts'
import { olasiBicimler, olasiEklemeler } from './ekle.ts'
import { EK_ENVANTERI, type EkEnvanteri } from './envanter.ts'
import { ALFABE, unluMu } from './ses.ts'
import { KOK_SOZLUGU, type KokSozlugu } from './sozluk.ts'

export type YasakYeri = 'her yerde' | 'başta'

export interface YasakliDizi {
  readonly dizi: string
  readonly yer: YasakYeri
}

export type UydurmaBozuklugunTuru = 'ses' | 'sözlük' | 'yasak' | 'ek'

export interface UydurmaBozuklugu {
  readonly tur: UydurmaBozuklugunTuru
  /** Kısa açıklama: "ikinci hecede o", "kuş + lar". */
  readonly aciklama: string
}

/** Oyunun uydurma köke getirdiği ekler; yasaklı dizi bunların biçimlerinde de aranır. */
export const OYUN_EKLERI: readonly string[] = ['PL', 'POSS.1SG', 'LOC', 'DAT', 'ACC']

/** Kökün ilk sesi olabilecek ünsüzler. */
const ILK_SESLER: ReadonlySet<string> = new Set('bcçdfghkmnpsştvyz')
/** İki ünlü arasında iki ünsüz varsa ilki bunlardan biridir. */
const ARA_ILK_UNSUZLER: ReadonlySet<string> = new Set('lrnmsşzy')
/** Kökün sonundaki ünsüz bunlardan biridir (ünlüyle de bitebilir). */
const SON_UNSUZLER: ReadonlySet<string> = new Set('pçtksşzlrmny')
/** Kökte hiç bulunmayan sesler. */
const YASAK_SESLER: ReadonlySet<string> = new Set('ğj')
/** İkinci hecede bulunmayan ünlüler. */
const IKINCI_HECEDE_YOK: ReadonlySet<string> = new Set('oö')

export function yasakliDizileriOku(csvMetni: string): YasakliDizi[] {
  const diziler: YasakliDizi[] = []
  for (const { satirNo, alanlar } of csvOku(csvMetni.normalize('NFC'), ['dizi', 'yer'])) {
    const dizi = alanlar.dizi ?? ''
    const yer = alanlar.yer ?? ''
    const hata = (neden: string) => new Error(`Yasaklı diziler, ${satirNo}. satır: ${neden}`)
    if (dizi === '') throw hata('dizi boş')
    for (const harf of dizi) {
      if (!ALFABE.has(harf)) throw hata(`"${dizi}" dizisinde alfabe dışı harf var: "${harf}"`)
    }
    if (yer !== 'her yerde' && yer !== 'başta') {
      throw hata(`yer "her yerde" ya da "başta" olur, "${yer}" değil`)
    }
    if (diziler.some((d) => d.dizi === dizi)) throw hata(`"${dizi}" ikinci kez yazılmış`)
    diziler.push({ dizi, yer })
  }
  return diziler
}

/** icerik/yasakli-diziler.csv. */
export const YASAKLI_DIZILER: readonly YasakliDizi[] = yasakliDizileriOku(yasakliDizilerMetni)

/** Kökün ses yapısındaki ilk bozukluk; yoksa undefined. */
function sesBozuklugu(kok: string): string | undefined {
  const harfler = [...kok]
  const disi = harfler.find((h) => !ALFABE.has(h))
  if (disi !== undefined) return `alfabe dışı harf: ${disi}`
  const yasak = harfler.find((h) => YASAK_SESLER.has(h))
  if (yasak !== undefined) return `${yasak} var`

  const unluYerleri = harfler.flatMap((h, i) => (unluMu(h) ? [i] : []))
  if (unluYerleri.length !== 2) return `${unluYerleri.length} hece`
  const [ilkUnlu = 0, ikinciUnlu = 0] = unluYerleri

  const [ilk = ''] = harfler
  if (!ILK_SESLER.has(ilk)) return `ilk ses ${ilk}`
  if (ilkUnlu !== 1) return 'ilk hece ünsüz + ünlü değil'

  const ara = harfler.slice(ilkUnlu + 1, ikinciUnlu)
  if (ara.length < 1 || ara.length > 2) return `iki ünlü arasında ${ara.length} ünsüz`
  if (ara.length === 2) {
    const [a = '', b = ''] = ara
    if (!ARA_ILK_UNSUZLER.has(a)) return `ünlü arasında ${a}${b}: ilki ${a}`
    if (a === b) return `ünlü arasında ${a}${b}: ikisi aynı`
    if (a === 'n' && (b === 'b' || b === 'p')) return `ünlü arasında n${b}`
  }

  const son = harfler.slice(ikinciUnlu + 1)
  if (son.length > 1) return `sonda ${son.join('')}`
  const [sonUnsuz] = son
  if (sonUnsuz !== undefined && !SON_UNSUZLER.has(sonUnsuz)) return `sonda ${sonUnsuz}`

  const ikinci = harfler[ikinciUnlu] ?? ''
  if (IKINCI_HECEDE_YOK.has(ikinci)) return `ikinci hecede ${ikinci}`

  const ikinciHeceBasi = `${harfler[ikinciUnlu - 1] ?? ''}${ikinci}`
  if (ikinciHeceBasi === `${ilk}${harfler[1] ?? ''}`) return `iki hece ${ikinciHeceBasi} ile başlıyor`
  return undefined
}

/** Kökte ya da oyun biçimlerinde bulunan ilk yasaklı dizi; yoksa undefined. */
function yasakliDizi(
  kok: string,
  diziler: readonly YasakliDizi[],
  envanter: EkEnvanteri,
  sozluk: KokSozlugu,
): string | undefined {
  const bicimler = [kok, ...OYUN_EKLERI.flatMap((e) => olasiBicimler(kok, [e], envanter, sozluk))]
  for (const { dizi, yer } of diziler) {
    if (yer === 'başta' ? kok.startsWith(dizi) : bicimler.some((b) => b.includes(dizi))) {
      return dizi
    }
  }
  return undefined
}

/** Kökü başka bir kök + ek gibi okutan ilk çözümleme (kuş + lar); yoksa undefined. */
function ekGibi(kok: string, envanter: EkEnvanteri, sozluk: KokSozlugu): string | undefined {
  for (const oncekiKok of sozluk.keys()) {
    // Yumuşayan gövde (kitab) kökün son harfini değiştirir: baştaki ortak parça yeter.
    if (oncekiKok === kok || !kok.startsWith(oncekiKok.slice(0, -1))) continue
    for (const etiket of envanter.keys()) {
      let eklemeler
      try {
        eklemeler = olasiEklemeler(oncekiKok, [etiket], envanter, sozluk)
      } catch {
        continue
      }
      for (const { bicim, parcalar } of eklemeler) {
        const yuzey = parcalar[0]?.yuzey ?? ''
        if (bicim === kok && [...yuzey].length >= 2) return `${oncekiKok} + ${yuzey}`
      }
    }
  }
  return undefined
}

/**
 * Uydurma kökün denetimi: sırayla ses, sözlük, yasak ve ek; ilk bozukluğu döner, kök
 * geçerliyse undefined.
 *
 *     uydurmaDenetimi('pıtak')   // undefined
 *     uydurmaDenetimi('potok')   // { tur: 'ses', aciklama: 'ikinci hecede o' }
 *     uydurmaDenetimi('kalem')   // { tur: 'sözlük', ... }
 *     uydurmaDenetimi('kuşlar')  // { tur: 'ek', aciklama: 'kuş + lar' }
 */
export function uydurmaDenetimi(
  kok: string,
  envanter: EkEnvanteri = EK_ENVANTERI,
  sozluk: KokSozlugu = KOK_SOZLUGU,
  diziler: readonly YasakliDizi[] = YASAKLI_DIZILER,
): UydurmaBozuklugu | undefined {
  const temiz = kok.normalize('NFC')
  const ses = sesBozuklugu(temiz)
  if (ses !== undefined) return { tur: 'ses', aciklama: ses }
  if (sozluk.has(temiz)) return { tur: 'sözlük', aciklama: `${temiz} sözlükte` }
  const yasak = yasakliDizi(temiz, diziler, envanter, sozluk)
  if (yasak !== undefined) return { tur: 'yasak', aciklama: yasak }
  const ek = ekGibi(temiz, envanter, sozluk)
  if (ek !== undefined) return { tur: 'ek', aciklama: ek }
  return undefined
}
