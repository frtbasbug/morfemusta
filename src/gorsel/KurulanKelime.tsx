// Kurulan kelime (cepte, akşam ekranında): gövde düz yazıyla, ekler birleşen ek görünümünde
// (EkYazisi). Biçim ve parçalar motordan gelir (ekle). Ekler gövdeyi değiştirdiyse (yumuşama,
// düşme) ekler ayrı renklenemez; kelime düz yazılır. Ekran okuyucu kelimeyi tek parça okur.

import { ekle, type EkParcasi } from '../motor/index.ts'
import EkYazisi from './EkYazisi.tsx'
import './karakterler.css'
import './tema.css'

export default function KurulanKelime({
  kok,
  etiketler,
}: {
  readonly kok: string
  readonly etiketler: readonly string[]
}) {
  const { bicim, parcalar } = ekle(kok, etiketler)
  const [ilk] = parcalar
  // Her ek, önceki eklerle kurulmuş gövdeye eklendiyse ekler ayrı ayrı renklenir.
  const oncekiler = (i: number) => parcalar.slice(0, i).map((p) => p.yuzey).join('')
  const ayrik = ilk !== undefined && parcalar.every((p, i) => p.govde === ilk.govde + oncekiler(i))
  if (!ilk || !ayrik) return <span className="sonuc-kelime">{bicim}</span>
  return <SonucKelimesi govde={ilk.govde} ekler={parcalar} />
}

/** Sonuç kelimesi: gövde düz yazıyla, ekler bukalemunlarının renginde. */
function SonucKelimesi({ govde, ekler }: { govde: string; ekler: readonly EkParcasi[] }) {
  return (
    <span className="sonuc-kelime">
      <span className="sonuc-kelime__okunan">{govde + ekler.map((p) => p.yuzey).join('')}</span>
      <span aria-hidden="true">
        {govde}
        {ekler.map((parca) => (
          <EkYazisi key={parca.etiket} parca={parca} />
        ))}
      </span>
    </span>
  )
}
