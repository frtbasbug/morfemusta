// Kök yazısı: kökün son ünlüsü bir etiketin içindedir (UnluEtiketi). Uyum bu ünlüye bakar;
// bukalemun da başını ona çevirir.

import { sonUnlu } from '../motor/index.ts'
import UnluEtiketi from './UnluEtiketi.tsx'
import './karakterler.css'
import './tema.css'

export default function KokYazisi({ kok }: { readonly kok: string }) {
  const metin = kok.normalize('NFC')
  const unlu = sonUnlu(metin)
  if (unlu === undefined) return <span className="kok-yazisi">{metin}</span>

  const konum = metin.lastIndexOf(unlu)
  return (
    <span className="kok-yazisi">
      <span className="kok-yazisi__okunan">{metin}</span>
      <span aria-hidden="true">
        {metin.slice(0, konum)}
        <UnluEtiketi unlu={unlu} />
        {metin.slice(konum + 1)}
      </span>
    </span>
  )
}
