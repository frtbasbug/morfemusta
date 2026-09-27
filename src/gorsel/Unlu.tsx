// Ünlü karakteri: sekiz ünlünün her biri yalnız üç özelliğinden, koddan çizilir (DESIGN.md,
// "Görsel dil"). Gövde eni kalınlığı, gövde biçimi yuvarlaklığı, ağız genişliği gösterir.
// Renk kalınlığı gösterir ama hiçbir zaman tek başına değil. Ağız duygu göstermez.

import type { Unlu as UnluSesi } from '../motor/index.ts'
import { UNLU, UNLULER, unluCizimi } from './cizim.ts'
import { ozellikAdlari } from './kilik.ts'
import './tema.css'
import './karakterler.css'

export default function Unlu({
  unlu,
  boyut = UNLU.en,
}: {
  unlu: UnluSesi
  /** Genişlik (px). Yalnız ölçekler; yükseklik orantılıdır. */
  boyut?: number
}) {
  const ozellikler = UNLULER[unlu]
  const cizim = unluCizimi(ozellikler)
  return (
    <svg
      className="unlu"
      viewBox={`0 0 ${UNLU.en} ${UNLU.boy}`}
      width={boyut}
      height={(boyut * UNLU.boy) / UNLU.en}
      role="img"
      aria-label={`${unlu}: ${ozellikAdlari(ozellikler)}`}
      data-unlu={unlu}
      data-kalinlik={ozellikler.kalin ? 'kalin' : 'ince'}
    >
      <path className="karakter__govde" d={cizim.govde} />
      {cizim.yanakX.map((x) => (
        <circle key={x} className="karakter__yanak" cx={x} cy={cizim.yanakY} r={UNLU.yanak} />
      ))}
      {cizim.gozX.map((x) => (
        <g key={x}>
          <circle className="karakter__goz-aki" cx={x} cy={cizim.gozY} r={UNLU.gozAki} />
          <circle className="karakter__bebek" cx={x} cy={cizim.bebekY} r={UNLU.bebek} />
        </g>
      ))}
      <path className="karakter__agiz" d={cizim.agiz} />
    </svg>
  )
}
