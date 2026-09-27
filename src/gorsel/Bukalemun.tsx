// Bukalemun ek: ekin yüzeydeki ilk ünlüsünün kılığına girer (DESIGN.md, "Görsel dil"). Başı
// solda, köke dönüktür: uyum geriye bakar. Kılık ekle() sonucundaki parçadan gelir; ekin
// ünlüsü yüzeye çıkmadıysa bukalemun zemine karışır (saklanan). Uymayan ek eğik durur.

import type { EkParcasi } from '../motor/index.ts'
import { BUKALEMUN, UNLULER, bukalemunCizimi } from './cizim.ts'
import { bukalemunKiligi, ozellikAdlari } from './kilik.ts'
import './tema.css'
import './karakterler.css'

export default function Bukalemun({
  parca,
  uyumsuz = false,
  boyut = BUKALEMUN.en,
}: {
  /** Ekin ekle() sonucundaki parçası; yalnız uymayan örnek elle kurulur. */
  parca: EkParcasi
  /** Ek köke uymuyor (evlar): bukalemun -12 derece eğik durur. */
  uyumsuz?: boolean
  /**
   * Genişlik (px). Yalnız ölçekler; yükseklik orantılıdır. İnce bukalemunun üstündeki yazı
   * 18px'ten küçük olmasın diye 119'dan küçük verilmez.
   */
  boyut?: number
}) {
  const kilik = bukalemunKiligi(parca)
  const ozellikler = UNLULER[kilik.unlu]
  const cizim = bukalemunCizimi(ozellikler)
  const siniflar = [
    'bukalemun',
    kilik.saklanan && 'bukalemun--saklanan',
    uyumsuz && 'bukalemun--uyumsuz',
  ].filter(Boolean)
  const kilikAdi = kilik.saklanan ? `saklanan ${kilik.unlu}` : `${kilik.unlu} kılığında`
  const etiket = `${kilik.yazi} bukalemunu, ${kilikAdi}: ${ozellikAdlari(ozellikler)}`

  return (
    <svg
      className={siniflar.join(' ')}
      viewBox={`0 0 ${BUKALEMUN.en} ${BUKALEMUN.boy}`}
      width={boyut}
      height={(boyut * BUKALEMUN.boy) / BUKALEMUN.en}
      role="img"
      aria-label={uyumsuz ? `${etiket}; uymuyor` : etiket}
      data-unlu={kilik.unlu}
      data-kalinlik={ozellikler.kalin ? 'kalin' : 'ince'}
    >
      <g className="bukalemun__alt-cizgi">
        <path d={cizim.kuyruk} />
        <path d={cizim.bacaklar} />
      </g>
      <g className="bukalemun__ust-cizgi">
        <path d={cizim.kuyruk} />
        <path d={cizim.bacaklar} />
      </g>
      <path className="bukalemun__ibik" d={cizim.ibik} />
      <path className="karakter__govde" d={cizim.govde} />
      <circle className="bukalemun__goz-tumsegi" cx={cizim.goz.x} cy={cizim.goz.y} r={cizim.goz.r} />
      <circle className="karakter__goz-aki" cx={cizim.goz.x} cy={cizim.goz.y} r={BUKALEMUN.gozAki} />
      <circle className="karakter__bebek" cx={cizim.goz.x} cy={cizim.goz.y} r={BUKALEMUN.bebek} />
      {/* Saklanan bukalemunun yalnız kesik çizgili dış hattı ve gözü görünür. */}
      {!kilik.saklanan && <path className="karakter__agiz" d={cizim.agiz} />}
      <text className="bukalemun__yazi" x={cizim.yazi.x} y={cizim.yazi.y} textAnchor="middle">
        {kilik.yazi}
      </text>
    </svg>
  )
}
