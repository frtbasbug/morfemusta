// Sözlük (DESIGN.md, "Sözlük"): doğru kurulan her kelime bir karttır. Kartlar bölgelere göre
// gruplu, bölge tablosunun sırasıyla; her grupta en yeni kart önde. Kartta kelime, kök ve
// ekler (Bukalemun Koyu'ndaki birleşen ek görünümüyle: kökün son ünlüsü ve ekin ünlüsü
// etikette, uyum etiketlerin eninden okunur), bölge ve tarih. Ekler ve biçim motordan gelir
// (ekle); kartta yalnız kök ve ek etiketleri saklıdır.

import { Fragment, useEffect, useRef } from 'react'
import { ekle } from '../motor/index.ts'
import EkYazisi from '../gorsel/EkYazisi.tsx'
import KokYazisi from '../gorsel/KokYazisi.tsx'
import type { Bolge } from '../oyun/bolgeler.ts'
import type { SozlukGrubu, SozlukKarti } from '../oyun/ilerleme.ts'
import './Sozluk.css'

const TARIH = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

/** Yerel gün, <time> için: 2026-09-28. */
function gunYazisi(an: Date): string {
  const iki = (n: number) => String(n).padStart(2, '0')
  return `${an.getFullYear()}-${iki(an.getMonth() + 1)}-${iki(an.getDate())}`
}

export default function Sozluk({ gruplar }: { readonly gruplar: readonly SozlukGrubu[] }) {
  const baslikRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    baslikRef.current?.focus()
  }, [])

  return (
    <main className="sozluk" aria-labelledby="sozluk-baslik">
      <h1 id="sozluk-baslik" className="ekran-basligi" ref={baslikRef} tabIndex={-1}>
        Sözlük
      </h1>
      {gruplar.length === 0 ? (
        <p className="sozluk__bos">Sözlüğün henüz boş. Bir kelime kurunca kartı buraya gelir.</p>
      ) : (
        gruplar.map(({ bolge, kartlar }) => (
          <section
            key={bolge.kimlik}
            className="sozluk__grup"
            aria-labelledby={`sozluk-${bolge.kimlik}`}
          >
            <h2 id={`sozluk-${bolge.kimlik}`} className="sozluk__bolge">
              {bolge.ad}
            </h2>
            <ul className="sozluk__kartlar">
              {kartlar.map((kart) => (
                <li key={kart.kelime}>
                  <Kart kart={kart} bolge={bolge} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  )
}

/** Sözlük kartı: kelime; kök ve ekler; bölge ve tarih. */
function Kart({ kart, bolge }: { kart: SozlukKarti; bolge: Bolge }) {
  const { parcalar } = ekle(kart.kok, kart.etiketler)
  const tarih = new Date(kart.tarih)
  return (
    <article className="sozluk-karti">
      <h3 className="sozluk-karti__kelime">{kart.kelime}</h3>
      <p className="sozluk-karti__parcalar">
        <span className="sozluk-karti__kok">
          <KokYazisi kok={kart.kok} />
        </span>
        {parcalar.map((parca) => (
          <Fragment key={parca.etiket}>
            <span className="sozluk-karti__arti" aria-hidden="true">
              +
            </span>
            <EkYazisi parca={parca} />
          </Fragment>
        ))}
      </p>
      <p className="sozluk-karti__kunye">
        <span>{bolge.ad}</span>
        <span aria-hidden="true"> · </span>
        <time dateTime={gunYazisi(tarih)}>{TARIH.format(tarih)}</time>
      </p>
    </article>
  )
}
