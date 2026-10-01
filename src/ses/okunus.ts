// Bir metnin sesli okunuşu: ses üretecine (scripts/ses-uret.py) verilen yazı. Saf TypeScript'tir.
//
//   - Tek harf adıyla söylenir: p → pe, b → be, ğ → yumuşak ge; ünlüler kendisidir (a, ı, ü).
//     "p ünlüden önce jöle olur: b." → "pe ünlüden önce jöle olur: be."
//   - Ok ve tire okunmaz: "-da → kitapta" → "da kitapta".
//   - Yanlış okunan bir metnin okunuşu icerik/ses-okunus.csv'ye yazılır (metin,okunus); tablo
//     yalnız kullanıcının onayıyla değişir. Tablodaki okunuş olduğu gibi kullanılır.

import tabloMetni from '../../icerik/ses-okunus.csv?raw'
import { csvOku } from '../motor/index.ts'

/** Türk alfabesinin harf adları; ünlüler kendisidir. */
export const HARF_ADLARI: Readonly<Record<string, string>> = {
  a: 'a',
  b: 'be',
  c: 'ce',
  ç: 'çe',
  d: 'de',
  e: 'e',
  f: 'fe',
  g: 'ge',
  ğ: 'yumuşak ge',
  h: 'he',
  ı: 'ı',
  i: 'i',
  j: 'je',
  k: 'ke',
  l: 'le',
  m: 'me',
  n: 'ne',
  o: 'o',
  ö: 'ö',
  p: 'pe',
  r: 're',
  s: 'se',
  ş: 'şe',
  t: 'te',
  u: 'u',
  ü: 'ü',
  v: 've',
  y: 'ye',
  z: 'ze',
}

export function okunusTablosunuOku(csv: string): Map<string, string> {
  const tablo = new Map<string, string>()
  for (const { satirNo, alanlar } of csvOku(csv.normalize('NFC'), ['metin', 'okunus'])) {
    const metin = alanlar.metin ?? ''
    const okunus = alanlar.okunus ?? ''
    if (metin === '' || okunus === '') {
      throw new Error(`Okunuş tablosu, ${satirNo}. satır: boş alan`)
    }
    if (tablo.has(metin)) throw new Error(`Okunuş tablosu, ${satirNo}. satır: "${metin}" iki kez`)
    tablo.set(metin, okunus)
  }
  return tablo
}

/** icerik/ses-okunus.csv: yanlış okunan metinlerin okunuşu. */
export const OKUNUS_TABLOSU: ReadonlyMap<string, string> = okunusTablosunuOku(tabloMetni)

const TR_KUCUK = (harf: string) => harf.toLocaleLowerCase('tr-TR')

/** Metnin okunuşu: tablodaysa oradaki; değilse tek harfler adıyla, ok ve tire atılarak. */
export function okunus(metin: string, tablo: ReadonlyMap<string, string> = OKUNUS_TABLOSU): string {
  const nfc = metin.normalize('NFC')
  const yazili = tablo.get(nfc)
  if (yazili !== undefined) return yazili
  return nfc
    .replace(/[→-]/g, ' ')
    .replace(/\p{L}+/gu, (kelime) =>
      kelime.length === 1 ? (HARF_ADLARI[TR_KUCUK(kelime)] ?? kelime) : kelime,
    )
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,:;!?])/g, '$1')
    .trim()
}
