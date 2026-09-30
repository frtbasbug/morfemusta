// Sesin arayüzdeki bağlantısı: ayar (Kapalı / Dokununca / Sesli mod), sesli modun söyleyişi ve
// hoparlör düğmesi (DESIGN.md, "Ses ve resim").
//
//   - Kapalı: hiçbir ses çalmaz, hoparlör görünmez.
//   - Dokununca: kelimenin ya da cümlenin yanındaki küçük hoparlöre dokununca çalar.
//   - Sesli mod: ekranlar görev, seçim ve sonuçta söyler (soyle); hoparlör de durur (yeniden
//     dinlemek için).
//
// Sağlayıcı olmadan (birim testleri, galeri) ayar Kapalı'dır.

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { HoparlorSimgesi } from '../ekranlar/simgeler.tsx'
import type { Ayarlar } from '../oyun/ilerleme.ts'
import { cal, sesVarMi, sus } from './calar.ts'
import './Ses.css'

export type SesAyari = Ayarlar['ses']

const SesBaglami = createContext<SesAyari>('kapali')

export function SesSaglayici({ ayar, children }: { ayar: SesAyari; children: ReactNode }) {
  // Kapalı'ya geçince çalan ses de susar.
  useEffect(() => {
    if (ayar === 'kapali') sus()
  }, [ayar])
  return <SesBaglami.Provider value={ayar}>{children}</SesBaglami.Provider>
}

export interface Ses {
  readonly ayar: SesAyari
  /** Sesli modda metni (ya da metinleri sırayla) söyler; öteki ayarlarda hiçbir şey yapmaz. */
  readonly soyle: (metinler: string | readonly string[]) => void
}

export function useSes(): Ses {
  const ayar = useContext(SesBaglami)
  return {
    ayar,
    soyle: (metinler) => {
      if (ayar === 'sesli') void cal(metinler)
    },
  }
}

/**
 * Sesli modda, değer değişince (görev başlayınca, akşam olunca) bir kez söyler. Metin boşsa ya
 * da ayar sesli değilse söylemez.
 */
export function useSesliSoyleyis(metinler: readonly string[], anahtar: string | number): void {
  const ayar = useContext(SesBaglami)
  const metin = metinler.join('\n')
  useEffect(() => {
    if (ayar !== 'sesli' || metin === '') return
    void cal(metin.split('\n'))
  }, [ayar, anahtar, metin])
}

/**
 * Hoparlör: dokununca metni çalar. Ses kapalıysa ya da metnin sesi yoksa görünmez. Adı
 * "Dinle: <metin>"dir; simge ekran okuyucudan gizlidir.
 */
export function Hoparlor({
  metin,
  sinif,
}: {
  readonly metin: string | readonly string[]
  readonly sinif?: string
}) {
  const ayar = useContext(SesBaglami)
  const metinler = typeof metin === 'string' ? [metin] : metin
  if (ayar === 'kapali' || !metinler.some(sesVarMi)) return null
  return (
    <button
      type="button"
      className={sinif ? `hoparlor ${sinif}` : 'hoparlor'}
      aria-label={`Dinle: ${metinler.join(' ')}`}
      onClick={(e) => {
        e.stopPropagation()
        void cal(metinler)
      }}
    >
      <HoparlorSimgesi />
    </button>
  )
}
