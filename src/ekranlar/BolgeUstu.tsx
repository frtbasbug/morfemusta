// Bölge ekranının üst çubuğu: Harita düğmesi (harita simgesi), bölgenin adı, görev sırası
// ("3 / 10"). Turlu bölgede (Uydurukçuklar) sıranın önünde tur numarası da yazar ("2. tur · 3 /
// 10"; dar ekranda tur üstte, sıra altta). Sınıf modunda sıranın yanında "Sınıf" işareti durur.
// Dört bölge ekranı aynı çubuğu kullanır.

import type { Ref } from 'react'
import SinifIsareti, { useSinifModu } from './SinifIsareti.tsx'
import { HaritaSimgesi } from './simgeler.tsx'
import './BolgeUstu.css'

export default function BolgeUstu({
  ad,
  gorevYeri,
  gorevSayisi,
  tur,
  onHarita,
  baslikRef,
}: {
  readonly ad: string
  /** Oynanan görevin yeri (0'dan). */
  readonly gorevYeri: number
  readonly gorevSayisi: number
  /** Turlu bölgede oynanan tur (1'den); tursuz bölgede verilmez. */
  readonly tur?: number
  /** Haritaya dönüş; verilmezse düğmesi çıkmaz. */
  readonly onHarita: (() => void) | undefined
  readonly baslikRef?: Ref<HTMLHeadingElement>
}) {
  const sinif = useSinifModu()
  return (
    <header className={sinif ? 'bolge-ustu bolge-ustu--sinif' : 'bolge-ustu'}>
      {onHarita ? (
        <button type="button" className="bolge-ustu__harita" aria-label="Harita" onClick={onHarita}>
          <HaritaSimgesi />
        </button>
      ) : (
        <span />
      )}
      <h1 className="bolge-ustu__baslik" ref={baslikRef} tabIndex={-1}>
        {ad}
      </h1>
      <div className="bolge-ustu__sag">
        <SinifIsareti />
        <p className="bolge-ustu__sira">
          {tur !== undefined && (
            <span className="bolge-ustu__tur">
              {tur}. tur<span className="bolge-ustu__ayrac"> · </span>
            </span>
          )}
          <span className="gizli">Görev </span>
          {gorevYeri + 1} / {gorevSayisi}
        </p>
      </div>
    </header>
  )
}
