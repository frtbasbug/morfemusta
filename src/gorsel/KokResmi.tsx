// Kökün resmi: icerik/emoji.csv'deki kök emojisiyle görünür (Twemoji SVG, public/emoji/). Tabloda
// olmayan kökün (uydurma kök dahil) resmi yoktur; bileşen hiçbir şey çizmez. Resim yazıyı
// süsler: boyu yazının boyudur (em). Süstür, ekran okuyucudan gizlidir (alt boş): kelimenin
// adı değişmez. Emoji data-emoji'de durur.

import { EMOJILER } from './emoji.ts'
import './KokResmi.css'

export default function KokResmi({ kok, sinif }: { readonly kok: string; readonly sinif?: string }) {
  const resim = EMOJILER.get(kok.normalize('NFC'))
  if (!resim) return null
  return (
    <img
      className={sinif ? `kok-resmi ${sinif}` : 'kok-resmi'}
      src={`${import.meta.env.BASE_URL}emoji/${resim.dosya}`}
      alt=""
      data-emoji={resim.emoji}
      data-kok={kok}
      loading="lazy"
      draggable={false}
    />
  )
}
