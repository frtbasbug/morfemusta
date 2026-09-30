// Fıstıkçı Şahap'ın Dükkânı'nın haritadaki işareti: yan yana küçük bir taş ve bir jöle karosu,
// yazısız (süs; adı düğmenin yazısıdır). Haritada ve Karakter Galerisi'nde aynıdır.

import Karo from './Karo.tsx'
import './karakterler.css'

/** İşaretteki karoların ölçeği: 72 px'lik karo 27 px olur. */
export const DUKKAN_ISARETI_OLCEGI = 0.375

export default function DukkanIsareti() {
  return (
    <span className="dukkan-isareti">
      <Karo karo="taş" boyut={DUKKAN_ISARETI_OLCEGI} yazisiz />
      <Karo karo="jöle" boyut={DUKKAN_ISARETI_OLCEGI} yazisiz />
    </span>
  )
}
