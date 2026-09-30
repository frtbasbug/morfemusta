// Kök Bahçesi'nin ağacı (agac.ts): dibinde kök (KokYazisi), üst üste gövde halkaları (her
// halkada ekin yazısı, birleşen ek görünümünde), tepede yuvarlak bir taç, tacın ucunda meyve
// (üstünde ekin yazısı). SVG'de yalnız geometri yazılır; dolgu, çizgi ve kalınlıklar
// karakterler.css'teki sınıflardan ve tema.css belirteçlerinden gelir. Kalın ve ince renkleri
// yalnız ek yazılarında kalır.
//
// Ağaç süstür (aria-hidden): adını onu taşıyan öğe verir (kelimenin o anki hâli).

import type { EkParcasi } from '../motor/index.ts'
import {
  AGAC_CIZIMI,
  HALKA_KUTUSU,
  ISARET_KUTUSU,
  KOK_KUTUSU,
  MEYVE_KUTUSU,
  TAC_KUTUSU,
} from './agac.ts'
import EkYazisi, { type EkYuvasi } from './EkYazisi.tsx'
import KokYazisi from './KokYazisi.tsx'
import './karakterler.css'
import './tema.css'

export interface AgacHalkasi {
  readonly parca: EkParcasi
  /** Ekin yüzeyinde bir sesin yerine konan öğe (meyve gelince erir: kalemlik → kalemliğ). */
  readonly yuva?: EkYuvasi
}

export interface AgacMeyvesi {
  readonly parca: EkParcasi
  /** Kaç meyve: çoğulda üç. */
  readonly sayi: number
}

export default function Agac({
  kok,
  halkalar = [],
  meyve = null,
}: {
  readonly kok: string
  /** Gövdenin halkaları, aşağıdan yukarı: ilk yapım eki köke en yakın. */
  readonly halkalar?: readonly AgacHalkasi[]
  /** Tepedeki meyve; yoksa ya da cebe girdiyse null. */
  readonly meyve?: AgacMeyvesi | null
}) {
  const { tac } = AGAC_CIZIMI
  return (
    <span className="agac" aria-hidden="true">
      <span className="agac__tac">
        <svg viewBox={`0 0 ${TAC_KUTUSU.en} ${TAC_KUTUSU.boy}`} width={TAC_KUTUSU.en} height={TAC_KUTUSU.boy}>
          <path className="agac__yaprak" d={tac} />
        </svg>
        {meyve && (
          <span className="agac__meyveler">
            {Array.from({ length: meyve.sayi }, (_, i) => (
              <Meyve
                key={i}
                parca={meyve.parca}
                kopya={meyve.sayi > 1 && i !== Math.floor(meyve.sayi / 2)}
              />
            ))}
          </span>
        )}
      </span>
      <span className="agac__halkalar">
        {[...halkalar].reverse().map((halka, i) => (
          <Halka key={halkalar.length - 1 - i} parca={halka.parca} yuva={halka.yuva} />
        ))}
      </span>
      <span className="agac__kok">
        <svg viewBox={`0 0 ${KOK_KUTUSU.en} ${KOK_KUTUSU.boy}`} width={KOK_KUTUSU.en} height={KOK_KUTUSU.boy}>
          <path className="agac__govde" d={AGAC_CIZIMI.kok.govde} />
          <path className="agac__cizgi" d={AGAC_CIZIMI.kok.cizgiler} />
        </svg>
        <span className="agac__kok-yazisi">
          <KokYazisi kok={kok} />
        </span>
      </span>
    </span>
  )
}

/** Gövdenin bir halkası: yatay bir bant, üstünde ekin yazısı (birleşen ek görünümü). */
export function Halka({ parca, yuva }: { readonly parca: EkParcasi; readonly yuva?: EkYuvasi }) {
  return (
    <span className="agac__halka" data-etiket={parca.etiket}>
      <svg
        viewBox={`0 0 ${HALKA_KUTUSU.en} ${HALKA_KUTUSU.boy}`}
        width={HALKA_KUTUSU.en}
        height={HALKA_KUTUSU.boy}
        aria-hidden="true"
      >
        <path className="agac__govde" d={AGAC_CIZIMI.halka} />
      </svg>
      <span className="agac__ek">
        <EkYazisi parca={parca} yuva={yuva} />
      </span>
    </span>
  )
}

/** Meyve: sapıyla bir daire, üstünde ekin yazısı. Çoğulun kopyaları da yazılıdır. */
export function Meyve({ parca, kopya = false }: { readonly parca: EkParcasi; readonly kopya?: boolean }) {
  const { sap, cx, cy, r } = AGAC_CIZIMI.meyve
  return (
    <span className={kopya ? 'meyve meyve--kopya' : 'meyve'} data-etiket={parca.etiket}>
      <svg
        viewBox={`0 0 ${MEYVE_KUTUSU.en} ${MEYVE_KUTUSU.boy}`}
        width={MEYVE_KUTUSU.en}
        height={MEYVE_KUTUSU.boy}
        aria-hidden="true"
      >
        <path className="meyve__sap" d={sap} />
        <circle className="meyve__govde" cx={cx} cy={cy} r={r} />
      </svg>
      <span className="meyve__ek">
        <EkYazisi parca={parca} />
      </span>
    </span>
  )
}

/** Kök Bahçesi'nin harita işareti: küçük bir ağaç, yazısız (süs). */
export function BahceIsareti() {
  const { govde, tac } = AGAC_CIZIMI.isaret
  return (
    <svg
      className="bahce-isareti"
      viewBox={`0 0 ${ISARET_KUTUSU.en} ${ISARET_KUTUSU.boy}`}
      width={ISARET_KUTUSU.en}
      height={ISARET_KUTUSU.boy}
      aria-hidden="true"
      focusable="false"
    >
      <path className="agac__govde" d={govde} />
      <circle className="agac__yaprak" cx={tac.cx} cy={tac.cy} r={tac.r} />
    </svg>
  )
}
