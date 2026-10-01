// Sınıf modu (etkileşimli tahta; DESIGN.md, "Koleksiyon ve modlar"): ekranlar modu bağlamdan
// okur. Açıkken küçük bir "Sınıf" işareti görünür: ilerleme kaydedilmiyor, yalnız o açılış
// boyunca bellekte duruyor (src/oyun/ilerleme.ts, oyunKaydi). İşaret bölge ekranının üst
// çubuğundadır; harita, Sözlük, Ayarlar ve akşam ekranında sağ üst köşede (kose). Ekran okuyucu
// "Sınıf modu: ilerleme kaydedilmiyor." okur.
//
// Sağlayıcı olmadan (birim testleri, galeri) sınıf modu kapalıdır.

import { createContext, useContext, type ReactNode } from 'react'
import { SinifSimgesi } from './simgeler.tsx'
import './SinifIsareti.css'

const SinifBaglami = createContext(false)

export function SinifSaglayici({ acik, children }: { acik: boolean; children: ReactNode }) {
  return <SinifBaglami.Provider value={acik}>{children}</SinifBaglami.Provider>
}

/** Sınıf modu açık mı. */
export const useSinifModu = (): boolean => useContext(SinifBaglami)

export default function SinifIsareti({ kose = false }: { readonly kose?: boolean }) {
  const acik = useSinifModu()
  if (!acik) return null
  return (
    <p className={kose ? 'sinif-isareti sinif-isareti--kose' : 'sinif-isareti'}>
      <SinifSimgesi />
      <span aria-hidden="true">Sınıf</span>
      <span className="gizli">Sınıf modu: ilerleme kaydedilmiyor.</span>
    </p>
  )
}
