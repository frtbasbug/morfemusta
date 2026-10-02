// Kurulan kelime (cepte, akşam ekranında): gövdenin son ünlüsü etikette, ekler birleşen ek
// görünümünde (EkYazisi; ekin ünlüsü de etikette). Uyum etiketlerin eninden okunur,
// Renksiz'de de. Biçim ve parçalar motordan gelir (ekle; uydurma kökte çocuğun seçtiği biçim
// olasiEklemeler'den). Sonraki ek önceki eki değiştirdiyse
// (kedi + cik + im: kediciğim) ekler ayrılamaz; kelime düz yazılır. Ekran okuyucu kelimeyi tek
// parça okur.

import { ekle, olasiEklemeler, type EkParcasi } from '../motor/index.ts'
import EkYazisi from './EkYazisi.tsx'
import { EtiketliKok } from './KokYazisi.tsx'
import './karakterler.css'
import './tema.css'

export default function KurulanKelime({
  kok,
  etiketler,
  kelime,
}: {
  readonly kok: string
  readonly etiketler: readonly string[]
  /**
   * Kurulan biçim, motorun kabul ettiklerinden biriyse (uydurma kökte çocuğun seçtiği gıvağım);
   * verilmezse ya da tutmazsa ekle'ninki.
   */
  readonly kelime?: string
}) {
  const { bicim, parcalar } = kurulanEkleme(kok, etiketler, kelime)
  const [ilk] = parcalar
  // Her ek, önceki eklerle kurulmuş gövdeye eklendiyse ekler ayrı ayrı renklenir.
  const oncekiler = (i: number) => parcalar.slice(0, i).map((p) => p.yuzey).join('')
  const ayrik = ilk !== undefined && parcalar.every((p, i) => p.govde === ilk.govde + oncekiler(i))
  if (!ilk || !ayrik) return <span className="sonuc-kelime">{bicim}</span>
  return <SonucKelimesi govde={ilk.govde} ekler={parcalar} />
}

/**
 * Kelimenin eklenişi: motorun kabul ettiği biçimlerden kelimeyle aynı olanı (gıvağım: gövde
 * gıvağ); yoksa ekle'ninki. Sözlük kartı da kullanır.
 */
export function kurulanEkleme(kok: string, etiketler: readonly string[], kelime?: string) {
  if (kelime === undefined) return ekle(kok, etiketler)
  return olasiEklemeler(kok, etiketler).find((e) => e.bicim === kelime) ?? ekle(kok, etiketler)
}

/** Sonuç kelimesi: gövdenin son ünlüsü etikette, ekler bukalemunlarının renginde. */
function SonucKelimesi({ govde, ekler }: { govde: string; ekler: readonly EkParcasi[] }) {
  return (
    <span className="sonuc-kelime">
      <span className="sonuc-kelime__okunan">{govde + ekler.map((p) => p.yuzey).join('')}</span>
      <span aria-hidden="true">
        <EtiketliKok kok={govde} />
        {ekler.map((parca) => (
          <EkYazisi key={parca.etiket} parca={parca} />
        ))}
      </span>
    </span>
  )
}
