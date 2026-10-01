// Köklerin resmi: icerik/emoji.csv'deki kökler emojisiyle görünür (DESIGN.md, "Ses ve resim").
// Emojiler tek bir açık lisanslı setten, Twemoji'den (grafikler CC BY 4.0), SVG olarak pakete
// girer: yalnız tablodakiler, public/emoji/ altında (scripts/emoji-indir.mjs indirir). Uydurma
// kökte emoji yoktur; yaratık vardır. Saf TypeScript'tir: DOM'a dokunmaz.
//
//   kok     sözlükteki kök (emoji.test.ts denetler)
//   emoji   tek bir emoji; dosyanın adı kod noktalarından gelir (emojiDosyasi)

import metin from '../../icerik/emoji.csv?raw'
import { csvOku } from '../motor/index.ts'

/** Twemoji dosyasının adı: kod noktaları küçük onaltılıkla, tireyle; ZWJ yoksa FE0F atılır. */
export function emojiDosyasi(emoji: string): string {
  const noktalar = [...emoji].map((k) => k.codePointAt(0) ?? 0)
  const zwjVar = noktalar.includes(0x200d)
  return (
    noktalar
      .filter((n) => zwjVar || n !== 0xfe0f)
      .map((n) => n.toString(16))
      .join('-') + '.svg'
  )
}

export interface KokResmi {
  readonly emoji: string
  /** public/emoji/ altındaki dosya: 1f40e.svg. */
  readonly dosya: string
}

export function emojiTablosunuOku(csv: string): Map<string, KokResmi> {
  const tablo = new Map<string, KokResmi>()
  for (const { satirNo, alanlar } of csvOku(csv.normalize('NFC'), ['kok', 'emoji'])) {
    const kok = alanlar.kok ?? ''
    const emoji = alanlar.emoji ?? ''
    if (kok === '' || emoji === '') throw new Error(`Emoji tablosu, ${satirNo}. satır: boş alan`)
    if (tablo.has(kok)) throw new Error(`Emoji tablosu, ${satirNo}. satır: "${kok}" iki kez`)
    tablo.set(kok, { emoji, dosya: emojiDosyasi(emoji) })
  }
  return tablo
}

/** Kökten resmine: at → 🐎 (1f40e.svg). */
export const EMOJILER: ReadonlyMap<string, KokResmi> = emojiTablosunuOku(metin)
