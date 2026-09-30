// Uydurukçuklar'ın yaratığı: adındaki son ünlünün karakteri, kök başına sabit tohumlu küçük
// süslerle (boynuz, benek; yaratik.ts). Gövde, gözler, yanaklar ve ağız ünlü karakterinin
// kendisidir (cizim.ts): üç özellik bedeninde okunur, ağız hiçbir durumda değişmez.

import {
  UNLULER,
  UNLU_YARICAPLARI,
  ozellikAdlari,
  unluCizimi,
} from './cizim.ts'
import {
  YARATIK_KUTUSU,
  YILDIZ_KUTUSU,
  YILDIZ_YOLU,
  yaratikSusleri,
  yaratikUnlusu,
} from './yaratik.ts'
import './karakterler.css'
import './tema.css'

const yuvarla = (n: number): number => Math.round(n * 100) / 100

export default function Yaratik({
  kok,
  boyut = 1,
  adsiz = false,
}: {
  /** Yaratığın adı: uydurma kök (pıtak). Ünlüsü adındaki son ünlüdür. */
  readonly kok: string
  /** Ölçek: 1'de 72×76 px. */
  readonly boyut?: number
  /** Süs olarak (haritadaki işaret): ekran okuyucudan gizli. */
  readonly adsiz?: boolean
}) {
  const unlu = yaratikUnlusu(kok)
  const ozellikler = UNLULER[unlu]
  const cizim = unluCizimi(ozellikler)
  const susler = yaratikSusleri(kok, ozellikler)
  const { en, boy } = YARATIK_KUTUSU
  const r = UNLU_YARICAPLARI
  const erisim = adsiz
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': `${kok}: ${unlu}, ${ozellikAdlari(ozellikler)}` } as const)
  return (
    <svg
      className={`yaratik unlu unlu--${ozellikler.kalin ? 'kalin' : 'ince'}`}
      data-boynuz={susler.boynuz}
      viewBox={`0 0 ${en} ${boy}`}
      width={yuvarla(en * boyut)}
      height={yuvarla(boy * boyut)}
      {...erisim}
    >
      {susler.boynuzlar && <path className="yaratik__boynuz" d={susler.boynuzlar} />}
      <path className="unlu__govde" d={cizim.govde} />
      {susler.benekler.map((b, i) => (
        <circle key={i} className="yaratik__benek" cx={b.x} cy={b.y} r={b.r} />
      ))}
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

/** Büyünün yıldızı (bulunma ve yönelme): süstür, ekran okuyucudan gizli. */
export function Yildiz({ boyut = 1 }: { readonly boyut?: number }) {
  const { en, boy } = YILDIZ_KUTUSU
  return (
    <svg
      className="yildiz"
      viewBox={`0 0 ${en} ${boy}`}
      width={en * boyut}
      height={boy * boyut}
      aria-hidden="true"
    >
      <path className="yildiz__govde" d={YILDIZ_YOLU} />
    </svg>
  )
}

/** Haritadaki işaret: ölçek; 72×76'lık yaratık 30×32 olur. */
export const UYDURUK_ISARETI_OLCEGI = 0.42

/** Uydurukçuklar'ın haritadaki işareti: küçük bir yaratık, yazısız (süs). */
export function UydurukIsareti({ kok }: { readonly kok: string }) {
  return (
    <span className="uyduruk-isareti">
      <Yaratik kok={kok} boyut={UYDURUK_ISARETI_OLCEGI} adsiz />
    </span>
  )
}
