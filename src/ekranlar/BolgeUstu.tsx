// Bölge ekranının üst çubuğu: Harita düğmesi (harita simgesi), bölgenin adı, görev sırası
// ("3 / 10"). Bukalemun Koyu ve Fıstıkçı Şahap'ın Dükkânı aynı çubuğu kullanır.

import type { Ref } from 'react'
import { HaritaSimgesi } from './simgeler.tsx'
import './BolgeUstu.css'

export default function BolgeUstu({
  ad,
  gorevYeri,
  gorevSayisi,
  onHarita,
  baslikRef,
}: {
  readonly ad: string
  /** Oynanan görevin yeri (0'dan). */
  readonly gorevYeri: number
  readonly gorevSayisi: number
  /** Haritaya dönüş; verilmezse düğmesi çıkmaz. */
  readonly onHarita: (() => void) | undefined
  readonly baslikRef?: Ref<HTMLHeadingElement>
}) {
  return (
    <header className="bolge-ustu">
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
      <p className="bolge-ustu__sira">
        <span className="gizli">Görev </span>
        {gorevYeri + 1} / {gorevSayisi}
      </p>
    </header>
  )
}
