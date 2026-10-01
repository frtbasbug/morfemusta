// Ayarlar: Ses (Kapalı / Dokununca / Sesli mod), Hareket (Sistem gibi / Azalt), Renkler (Renkli /
// Renksiz), ilerlemeyi sıfırlama ve Hakkında (lisanslar ve atıflar).
// Ayarlar cihazda saklanır; App onları belgenin köküne yazar (html[data-hareket],
// html[data-renkler]). Azalt, prefers-reduced-motion gibi davranır. Renksiz, galerideki Renksiz
// moddur; açıkken renkler büyüden sonra da gri kalır. Ses'in varsayılanı Dokununca'dır; Sesli
// mod okumayı henüz sökmemiş çocuk içindir (DESIGN.md, "Ses ve resim").
//
// Sıfırlama uygulamanın içinde iki adımdır; tarayıcının confirm penceresi kullanılmaz. Silinen:
// bütün ilerleme ve kartlar. Ayarlar kalır.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import UnluEtiketi from '../gorsel/UnluEtiketi.tsx'
import type { Ayarlar as AyarDegerleri } from '../oyun/ilerleme.ts'
import './Ayarlar.css'

interface Secenek<T extends string> {
  readonly deger: T
  readonly ad: string
}

const SES: readonly Secenek<AyarDegerleri['ses']>[] = [
  { deger: 'kapali', ad: 'Kapalı' },
  { deger: 'dokununca', ad: 'Dokununca' },
  { deger: 'sesli', ad: 'Sesli mod' },
]

const HAREKET: readonly Secenek<AyarDegerleri['hareket']>[] = [
  { deger: 'sistem', ad: 'Sistem gibi' },
  { deger: 'azalt', ad: 'Azalt' },
]

const RENKLER: readonly Secenek<AyarDegerleri['renkler']>[] = [
  { deger: 'renkli', ad: 'Renkli' },
  { deger: 'renksiz', ad: 'Renksiz' },
]

export default function Ayarlar({
  ayarlar,
  onAyar,
  onSifirla,
}: {
  readonly ayarlar: AyarDegerleri
  readonly onAyar: (degisen: Partial<AyarDegerleri>) => void
  readonly onSifirla: () => void
}) {
  const [soruluyor, setSoruluyor] = useState(false)
  const [silindi, setSilindi] = useState(false)
  const baslikRef = useRef<HTMLHeadingElement>(null)
  const sifirlaRef = useRef<HTMLButtonElement>(null)
  const vazgecRef = useRef<HTMLButtonElement>(null)
  const oncekiSoru = useRef(soruluyor)

  useEffect(() => {
    baslikRef.current?.focus()
  }, [])

  // Klavyeyle oynayan için odak: soru açılınca Vazgeç'e (güvenli seçenek), kapanınca geri
  // sıfırlama düğmesine. Soru değişmediyse (ilk açılış) odak başlıkta kalır.
  useEffect(() => {
    if (oncekiSoru.current === soruluyor) return
    oncekiSoru.current = soruluyor
    if (soruluyor) vazgecRef.current?.focus()
    else sifirlaRef.current?.focus()
  }, [soruluyor])

  return (
    <main className="ayarlar" aria-labelledby="ayarlar-baslik">
      <h1 id="ayarlar-baslik" className="ekran-basligi" ref={baslikRef} tabIndex={-1}>
        Ayarlar
      </h1>

      <SecimGrubu
        ad="ses"
        baslik="Ses"
        secenekler={SES}
        secili={ayarlar.ses}
        onSec={(ses) => onAyar({ ses })}
      />

      <SecimGrubu
        ad="hareket"
        baslik="Hareket"
        secenekler={HAREKET}
        secili={ayarlar.hareket}
        onSec={(hareket) => onAyar({ hareket })}
      />

      <SecimGrubu
        ad="renkler"
        baslik="Renkler"
        secenekler={RENKLER}
        secili={ayarlar.renkler}
        onSec={(renkler) => onAyar({ renkler })}
      >
        {/* Seçimin etkisi: kalın a ile ince e; Renksiz'de aynı gri, biçimlerinden ayrılır. */}
        <span className="ayar__ornek" aria-hidden="true">
          <UnluEtiketi unlu="a" />
          <UnluEtiketi unlu="e" />
        </span>
      </SecimGrubu>

      <section className="sifirlama" aria-labelledby="sifirlama-baslik">
        <h2 id="sifirlama-baslik" className="ayar__baslik">
          İlerleme
        </h2>
        {soruluyor ? (
          <div className="sifirlama__soru" role="group" aria-labelledby="sifirlama-uyari">
            <p id="sifirlama-uyari" className="sifirlama__uyari">
              Bütün ilerleme ve kartlar silinecek.
            </p>
            <div className="sifirlama__dugmeler">
              <button
                ref={vazgecRef}
                type="button"
                className="ayar__dugme"
                onClick={() => setSoruluyor(false)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="ayar__dugme ayar__dugme--sil"
                onClick={() => {
                  onSifirla()
                  setSilindi(true)
                  setSoruluyor(false)
                }}
              >
                Sil
              </button>
            </div>
          </div>
        ) : (
          <button
            ref={sifirlaRef}
            type="button"
            className="ayar__dugme"
            onClick={() => {
              setSilindi(false)
              setSoruluyor(true)
            }}
          >
            İlerlemeyi sıfırla
          </button>
        )}
        <p className="sifirlama__durum" role="status">
          {silindi ? 'İlerleme ve kartlar silindi.' : ''}
        </p>
      </section>

      <Hakkinda />
    </main>
  )
}

/** Tek seçimli ayar: büyük, dokunması kolay iki seçenek (radyo düğmeleri). */
function SecimGrubu<T extends string>({
  ad,
  baslik,
  secenekler,
  secili,
  onSec,
  children,
}: {
  ad: string
  baslik: string
  secenekler: readonly Secenek<T>[]
  secili: T
  onSec: (deger: T) => void
  children?: ReactNode
}) {
  return (
    <fieldset className="ayar">
      <legend className="ayar__baslik">{baslik}</legend>
      <div className="ayar__secenekler">
        {secenekler.map(({ deger, ad: yazi }) => (
          <label key={deger} className="ayar__secenek">
            <input
              type="radio"
              name={ad}
              value={deger}
              checked={deger === secili}
              onChange={() => onSec(deger)}
            />
            <span>{yazi}</span>
          </label>
        ))}
      </div>
      {children}
    </fieldset>
  )
}

/**
 * Hakkında: oyunun, seslerin, emojilerin ve yazı tiplerinin lisansları. Bağlantı yok: çocuk
 * oyundan dışarı çıkmaz; adresler yazı olarak durur.
 */
function Hakkinda() {
  return (
    <section className="hakkinda" aria-labelledby="hakkinda-baslik">
      <h2 id="hakkinda-baslik" className="ayar__baslik">
        Hakkında
      </h2>
      <p>
        Morfemusta, ilkokul çocukları için kâr amacı gütmeyen bir Türkçe biçimbilim oyunudur. Kodu
        MIT lisanslıdır. Hiçbir veri cihazdan çıkmaz.
      </p>
      <dl className="hakkinda__liste">
        <dt>Sesler</dt>
        <dd>
          Sesler yapay zekâyla, Google Cloud Text-to-Speech'in Chirp 3: HD Callirrhoe sesiyle
          önceden üretildi. Kodun MIT lisansı ses dosyalarını kapsamaz.
        </dd>
        <dt>Emojiler</dt>
        <dd>
          Twemoji (Twitter, Inc. ve katkıcıları; github.com/jdecked/twemoji, sürüm 16.0.1).
          Grafikler CC BY 4.0 lisanslıdır.
        </dd>
        <dt>Yazı tipleri</dt>
        <dd>Andika (SIL International) ve Baloo 2 (Ek Type): SIL Open Font License 1.1.</dd>
      </dl>
    </section>
  )
}
