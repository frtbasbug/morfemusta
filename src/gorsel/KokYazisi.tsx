// Kök yazısı: kökün son ünlüsü bir etiketin içindedir (UnluEtiketi). Uyum bu ünlüye bakar;
// bukalemun da başını ona çevirir.

import { sonUnlu } from '../motor/index.ts'
import UnluEtiketi from './UnluEtiketi.tsx'
import './karakterler.css'
import './tema.css'

export default function KokYazisi({ kok }: { readonly kok: string }) {
  const metin = kok.normalize('NFC')
  if (sonUnlu(metin) === undefined) return <span className="kok-yazisi">{metin}</span>

  return (
    <span className="kok-yazisi">
      <span className="kok-yazisi__okunan">{metin}</span>
      <span aria-hidden="true">
        <EtiketliKok kok={metin} />
      </span>
    </span>
  )
}

/**
 * Kökün görünen yazısı: son ünlüsü etikette. Ekran okuyucuya ayrıca okunan bir yazının
 * yanında, gizli yerde kullanılır (KokYazisi, KurulanKelime).
 */
export function EtiketliKok({ kok }: { readonly kok: string }) {
  const metin = kok.normalize('NFC')
  const unlu = sonUnlu(metin)
  if (unlu === undefined) return metin
  const konum = metin.lastIndexOf(unlu)
  return (
    <>
      {metin.slice(0, konum)}
      <UnluEtiketi unlu={unlu} />
      {metin.slice(konum + 1)}
    </>
  )
}
