// Ünsüz karosu (karo.ts): taş sert ünsüzün, jöle yumuşak ünsüzün resmidir. SVG'de yalnız
// geometri yazılır; dolgu, çizgi ve kalınlıklar karakterler.css'teki sınıflardan ve tema.css
// belirteçlerinden gelir. Kalın ve ince renkleri karoda kullanılmaz: onlar ünlülerindir.
//
// Karo süstür (aria-hidden): adını onu taşıyan öğe verir (karoAdi: "p, sert"). Süs olarak
// küçük çizilen karo (haritadaki dükkân işareti) yazısızdır.

import type { Karo as KaroTuru } from '../motor/index.ts'
import { KARO_KUTUSU, karoCizimi } from './karo.ts'
import './karakterler.css'
import './tema.css'

export default function Karo({
  karo,
  harf,
  boyut = 1,
  yazisiz = false,
}: {
  readonly karo: KaroTuru
  /** Karonun üstündeki harf: p, b, t, d ... */
  readonly harf?: string
  /** Ölçek: 1'de 72×72 px. Yalnız ölçekler; çizim değişmez. */
  readonly boyut?: number
  /** Harf çizilmez: süs olarak küçük çizilen karo (haritadaki işaret). */
  readonly yazisiz?: boolean
}) {
  const { en, boy } = KARO_KUTUSU
  const { govde, iz, harf: orta } = karoCizimi(karo)
  return (
    <svg
      className={karo === 'taş' ? 'karo karo--tas' : 'karo karo--jole'}
      viewBox={`0 0 ${en} ${boy}`}
      width={en * boyut}
      height={boy * boyut}
      aria-hidden="true"
      focusable="false"
    >
      <path className="karo__govde" d={govde} />
      {iz.tur === 'çatlak' ? (
        <path className="karo__catlak" d={iz.d} />
      ) : (
        <ellipse
          className="karo__parilti"
          cx={iz.cx}
          cy={iz.cy}
          rx={iz.rx}
          ry={iz.ry}
          transform={`rotate(${iz.aci} ${iz.cx} ${iz.cy})`}
        />
      )}
      {!yazisiz && harf !== undefined && (
        <text className="karo__harf" x={orta.x} y={orta.y}>
          {harf}
        </text>
      )}
    </svg>
  )
}
