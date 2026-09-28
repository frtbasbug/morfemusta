// Bukalemun ek: ekin yüzeydeki ünlüsünün kılığına girer (kilik.ts). -lAr'da (a/e hep düz ve
// geniş) yalnız kalınlığı ve rengi değişir; -(I)m'de (ı/i/u/ü hep dar) biçimi de değişir.
// Başı solda, köke dönük: uyum geriye bakar.
//
// Ek yüzeyde ünlüsüz kalırsa (kedim) bukalemun zemine karışır: gövde, ibik, göz tümseği,
// kuyruk ve bacaklar zemin renginde, dış hatları kesik; gözü görünür kalır, üstünde yalnız
// "m" yazar. Saklanan ünlü söylenmez; ağzı çizilmez. Uymayan ek (evlar) eğik durur.

import type { EkParcasi } from '../motor/index.ts'
import {
  BUKALEMUN_KUTUSU,
  BUKALEMUN_YARICAPLARI,
  bukalemunCizimi,
  ozellikAdlari,
} from './cizim.ts'
import { bukalemunKiligi } from './kilik.ts'
import './karakterler.css'
import './tema.css'

export default function Bukalemun({
  parca,
  uyumsuz = false,
  boyut = 1,
}: {
  /** ekle() sonucundaki ek parçası; kılık ekin yüzeydeki ilk ünlüsünden gelir. */
  readonly parca: EkParcasi
  /** Ek köke uymuyor (evlar): bukalemun -12 derece eğik durur. */
  readonly uyumsuz?: boolean
  /** Ölçek: 1'de 132×82 px. Yalnız ölçekler; çizim değişmez. */
  readonly boyut?: number
}) {
  const kilik = bukalemunKiligi(parca)
  const cizim = bukalemunCizimi(kilik.ozellikler)
  const { en, boy } = BUKALEMUN_KUTUSU
  const { goz, yazi } = cizim
  const uzuvlar = cizim.kuyruk + cizim.bacaklar

  const siniflar = [
    'bukalemun',
    kilik.ozellikler.kalin ? 'bukalemun--kalin' : 'bukalemun--ince',
    kilik.saklanan && 'bukalemun--saklanan',
    uyumsuz && 'bukalemun--uyumsuz',
  ]
  const ad = [
    `${kilik.yazi} bukalemunu`,
    uyumsuz && 'uymuyor',
    `${kilik.saklanan ? 'saklanan ' : ''}${kilik.unlu}: ${ozellikAdlari(kilik.ozellikler)}`,
  ]

  return (
    <svg
      className={siniflar.filter(Boolean).join(' ')}
      viewBox={`0 0 ${en} ${boy}`}
      width={en * boyut}
      height={boy * boyut}
      role="img"
      aria-label={ad.filter(Boolean).join(', ')}
    >
      <path className="bukalemun__uzuv-alti" d={uzuvlar} />
      <path className="bukalemun__uzuv" d={uzuvlar} />
      <path className="bukalemun__ibik" d={cizim.ibik} />
      <path className="bukalemun__govde" d={cizim.govde} />
      <circle className="bukalemun__goz-tumsegi" cx={goz.x} cy={goz.y} r={goz.r} />
      <circle
        className="bukalemun__goz-aki"
        cx={goz.x}
        cy={goz.y}
        r={BUKALEMUN_YARICAPLARI.gozAki}
      />
      <circle className="bukalemun__bebek" cx={goz.x} cy={goz.y} r={BUKALEMUN_YARICAPLARI.bebek} />
      {!kilik.saklanan && <path className="bukalemun__agiz" d={cizim.agiz} />}
      <text className="bukalemun__yazi" x={yazi.x} y={yazi.y} textAnchor="middle">
        {kilik.yazi}
      </text>
    </svg>
  )
}
