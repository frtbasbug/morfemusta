// Kök yazısı: kökün son ünlüsü bir etiketin içindedir, çünkü uyum ona bakar (DESIGN.md,
// "Görsel dil"). Etiketin zemini kalın ya da ince rengi; köşesi düz ünlüde 4px, yuvarlakta
// tam yuvarlak. Gövde büyüdükçe (top → toplar) etiket yeni son ünlüye geçer.

import { sonUnlu } from '../motor/index.ts'
import { UNLULER } from './cizim.ts'
import './tema.css'
import './karakterler.css'

export default function KokYazisi({ kok }: { kok: string }) {
  const metin = kok.normalize('NFC')
  const unlu = sonUnlu(metin)
  if (unlu === undefined) return <span className="kok-yazisi">{metin}</span>

  const yer = metin.lastIndexOf(unlu)
  const { kalin, yuvarlak } = UNLULER[unlu]
  return (
    <span className="kok-yazisi">
      {metin.slice(0, yer)}
      <span
        className="kok-yazisi__etiket"
        data-unlu={unlu}
        data-kalinlik={kalin ? 'kalin' : 'ince'}
        data-yuvarlaklik={yuvarlak ? 'yuvarlak' : 'duz'}
      >
        {unlu}
      </span>
      {metin.slice(yer + 1)}
    </span>
  )
}
