// Sesin arayüzdeki bağlantısı: ayar (Kapalı / Dokununca / Sesli mod), sesli modun söyleyişi,
// efektler ve hoparlör düğmesi (DESIGN.md, "Ses ve resim").
//
//   - Kapalı: hiçbir ses çalmaz, efekt de yok; hoparlör görünmez.
//   - Dokununca: kelimenin ya da cümlenin yanındaki küçük hoparlöre dokununca çalar; doğruda,
//     yanlışta ve büyüde kısa efektler (efekt.ts).
//   - Sesli mod: ekranlar görev, seçim ve sonuçta söyler (soyle); sonuçta önce efekt, hemen
//     ardından kelime ya da cümle (sonuc). Hoparlör de durur (yeniden dinlemek için).
//
// Sağlayıcı olmadan (birim testleri, galeri) ayar Kapalı'dır.

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { HoparlorSimgesi } from '../ekranlar/simgeler.tsx'
import type { Ayarlar } from '../oyun/ilerleme.ts'
import { cal, sesVarMi, sus } from './calar.ts'
import { efektCal, efektSuresi, efektlereIzinVer, type EfektTuru } from './efekt.ts'
import './Ses.css'

export type SesAyari = Ayarlar['ses']

const SesBaglami = createContext<SesAyari>('kapali')

export function SesSaglayici({ ayar, children }: { ayar: SesAyari; children: ReactNode }) {
  // Kapalı'ya geçince çalan ses de susar; efektler çalmaz, Web Audio açılmaz.
  useEffect(() => {
    efektlereIzinVer(ayar !== 'kapali')
    if (ayar === 'kapali') sus()
  }, [ayar])
  return <SesBaglami.Provider value={ayar}>{children}</SesBaglami.Provider>
}

/** Sonucun sesi: efekt ve (sesli modda) ardından söylenecek metin. */
export interface SonucPlani {
  readonly efekt: EfektTuru | null
  readonly metinler: readonly string[]
  /** Metnin gecikmesi (ms): efekt bitince başlar. */
  readonly gecikme: number
}

/**
 * Doğru ya da yanlış sonucun sesi, ayara göre: Kapalı'da hiçbir şey; Dokununca'da yalnız efekt;
 * sesli modda efekt, hemen ardından kelime (doğru) ya da neden cümlesi (yanlış).
 */
export function sonucPlani(
  ayar: SesAyari,
  tur: EfektTuru,
  metinler: string | readonly string[] = [],
): SonucPlani {
  if (ayar === 'kapali') return { efekt: null, metinler: [], gecikme: 0 }
  return {
    efekt: tur,
    metinler: ayar === 'sesli' ? (typeof metinler === 'string' ? [metinler] : metinler) : [],
    gecikme: Math.round(efektSuresi(tur) * 1000),
  }
}

export interface Ses {
  readonly ayar: SesAyari
  /** Sesli modda metni (ya da metinleri sırayla) söyler; öteki ayarlarda hiçbir şey yapmaz. */
  readonly soyle: (metinler: string | readonly string[]) => void
  /**
   * Sonuç: doğru ya da yanlış. Kapalı değilse efekt çalar; sesli modda ardından metni söyler
   * (sonucPlani). Efekt çalan konuşmayı kesmez.
   */
  readonly sonuc: (tur: 'dogru' | 'yanlis', metinler?: string | readonly string[]) => void
  /** Büyü (çoğalma, cebe girme, halka, yıldız): Kapalı değilse kısa bir parıltı sesi. */
  readonly buyu: () => void
}

export function useSes(): Ses {
  const ayar = useContext(SesBaglami)
  return {
    ayar,
    soyle: (metinler) => {
      if (ayar === 'sesli') void cal(metinler)
    },
    sonuc: (tur, metinler) => {
      const plan = sonucPlani(ayar, tur, metinler)
      if (plan.efekt) efektCal(plan.efekt)
      if (plan.metinler.length > 0) void cal(plan.metinler, plan.gecikme)
    },
    buyu: () => {
      if (ayar !== 'kapali') efektCal('buyu')
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
