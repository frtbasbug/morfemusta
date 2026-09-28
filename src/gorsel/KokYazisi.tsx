// Kök yazısı: kökün son ünlüsü bir etiketin içindedir. Uyum bu ünlüye bakar; bukalemun da
// başını ona çevirir. Etiketin zemini kalın ya da ince rengi, köşesi düz ünlüde 4px,
// yuvarlakta tam yuvarlak (karakterler.css).

import { UNLULER, sonUnlu } from '../motor/index.ts'
import './karakterler.css'
import './tema.css'

export default function KokYazisi({ kok }: { readonly kok: string }) {
  const metin = kok.normalize('NFC')
  const unlu = sonUnlu(metin)
  if (unlu === undefined) return <span className="kok-yazisi">{metin}</span>

  const konum = metin.lastIndexOf(unlu)
  const { kalin, yuvarlak } = UNLULER[unlu]
  const etiket = [
    'kok-yazisi__unlu',
    kalin ? 'kok-yazisi__unlu--kalin' : 'kok-yazisi__unlu--ince',
    yuvarlak ? 'kok-yazisi__unlu--yuvarlak' : 'kok-yazisi__unlu--duz',
  ].join(' ')

  return (
    <span className="kok-yazisi">
      <span className="kok-yazisi__okunan">{metin}</span>
      <span aria-hidden="true">
        {metin.slice(0, konum)}
        <span className={etiket}>{unlu}</span>
        {metin.slice(konum + 1)}
      </span>
    </span>
  )
}
