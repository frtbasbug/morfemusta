// Akşam ekranı: bölge turunun sonundaki kapanış kartı; bütün bölgelerin ortak bileşeni. Başlık
// bölge tablosunun aksam sütunundan gelir ("Koyda akşam oldu"); altında o bölgede bugün kurulan
// kelimeler, ekleri birleşen ek görünümünde. Tek düğme: Haritaya dön. Puan, seri ve süre yok
// (DESIGN.md, "Kısa oturum, doğal durak"). Sesli modda başlık ve kelimeler söylenir; Dokununca'da
// başlığın hoparlörü aynısını çalar. Haritaya dön düğmesinde yazının yanında harita simgesi var:
// sesli modda düğme simgesinden tanınır.

import { useEffect, useRef } from 'react'
import KurulanKelime from '../gorsel/KurulanKelime.tsx'
import type { SozlukKarti } from '../oyun/ilerleme.ts'
import { BUGUN_KURULANLAR } from '../ses/metinler.ts'
import { Hoparlor, useSesliSoyleyis } from '../ses/Ses.tsx'
import SinifIsareti from './SinifIsareti.tsx'
import { HaritaSimgesi, HilalSimgesi } from './simgeler.tsx'
import './AksamEkrani.css'

export default function AksamEkrani({
  baslik,
  kartlar,
  onHarita,
}: {
  /** Bölge tablosunun aksam sütunu. */
  readonly baslik: string
  /** O bölgede bugün kurulan kelimelerin kartları, kurulma sırasıyla (bugununKartlari). */
  readonly kartlar: readonly SozlukKarti[]
  /** Haritaya dönüş; verilmezse düğmesi çıkmaz. */
  readonly onHarita?: () => void
}) {
  const baslikRef = useRef<HTMLHeadingElement>(null)
  const soylenecek = [
    baslik,
    ...(kartlar.length > 0 ? [BUGUN_KURULANLAR, ...kartlar.map((k) => k.kelime)] : []),
  ]
  useSesliSoyleyis(soylenecek, baslik)

  useEffect(() => {
    baslikRef.current?.focus()
  }, [])

  return (
    <main className="aksam" aria-labelledby="aksam-baslik">
      <SinifIsareti kose />
      <section className="aksam__kart">
        <HilalSimgesi sinif="aksam__hilal" />
        <div className="aksam__baslik-satiri">
          <h1 id="aksam-baslik" className="aksam__baslik" ref={baslikRef} tabIndex={-1}>
            {baslik}
          </h1>
          <Hoparlor metin={soylenecek} />
        </div>
        {kartlar.length > 0 && (
          <>
            <p className="aksam__metin">{BUGUN_KURULANLAR}</p>
            <ul className="aksam__kelimeler">
              {kartlar.map((kart) => (
                <li key={kart.kelime}>
                  <KurulanKelime kok={kart.kok} etiketler={kart.etiketler} kelime={kart.kelime} />
                </li>
              ))}
            </ul>
          </>
        )}
        {onHarita && (
          <button type="button" className="aksam__dugme" onClick={onHarita}>
            <HaritaSimgesi />
            Haritaya dön
          </button>
        )}
      </section>
    </main>
  )
}
