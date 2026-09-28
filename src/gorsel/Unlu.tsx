// Ünlü karakteri: üç özelliği bedenindedir. Kalınlık gövdenin eni, yuvarlaklık gövdenin
// biçimi, genişlik ağızdır (cizim.ts). Karakter yalnız bu üç özellikten üretilir; ünlüye
// özel süs yoktur (DESIGN.md, "Görsel dil").

import type { Unlu as UnluHarfi } from '../motor/index.ts'
import {
  UNLULER,
  UNLU_KUTUSU,
  UNLU_YARICAPLARI,
  ozellikAdlari,
  unluCizimi,
} from './cizim.ts'
import './karakterler.css'
import './tema.css'

export default function Unlu({
  unlu,
  boyut = 1,
}: {
  readonly unlu: UnluHarfi
  /** Ölçek: 1'de 72×76 px. Yalnız ölçekler; çizim değişmez. */
  readonly boyut?: number
}) {
  const ozellikler = UNLULER[unlu]
  const cizim = unluCizimi(ozellikler)
  const { en, boy } = UNLU_KUTUSU
  const r = UNLU_YARICAPLARI
  return (
    <svg
      className={`unlu unlu--${ozellikler.kalin ? 'kalin' : 'ince'}`}
      viewBox={`0 0 ${en} ${boy}`}
      width={en * boyut}
      height={boy * boyut}
      role="img"
      aria-label={`${unlu}: ${ozellikAdlari(ozellikler)}`}
    >
      <path className="unlu__govde" d={cizim.govde} />
      {cizim.yanakX.map((x, i) => (
        <circle key={i} className="unlu__yanak" cx={x} cy={cizim.yanakY} r={r.yanak} />
      ))}
      {cizim.gozX.map((x, i) => (
        <g key={i}>
          <circle className="unlu__goz-aki" cx={x} cy={cizim.gozY} r={r.gozAki} />
          <circle className="unlu__bebek" cx={x} cy={cizim.bebekY} r={r.bebek} />
        </g>
      ))}
      <path className="unlu__agiz" d={cizim.agiz} />
    </svg>
  )
}
