// Karakter Galerisi: görsel dilin (B · Canlı) vitrini. Önce sekiz ünlü okul çizelgesi
// düzeninde, sonra bukalemun ek örnekleri: kök, bukalemun, ok, sonuç. Oyundan bağlantı
// almaz; tasarımı gözle denetlemek için ayrı bir giriş sayfasıdır (galeri.html).
//
// Renksiz düğmesi kalın ve ince renkleri aynı griye çevirir: sekiz ünlü yalnız bedenlerinden
// ayırt edilebilmeli (renk körlüğü).

import { useState } from 'react'
import Bukalemun from '../gorsel/Bukalemun.tsx'
import KokYazisi from '../gorsel/KokYazisi.tsx'
import Unlu from '../gorsel/Unlu.tsx'
import { unluBul } from '../motor/index.ts'
import './GaleriSayfasi.css'
import { ORNEK_BOLUMLERI, type Ornek } from './ornekler.ts'

// Okul çizelgesi: üstte düz ve yuvarlak, altlarında geniş ve dar; satırlar kalın ve ince.
const SUTUNLAR = [
  { yuvarlak: false, genis: true },
  { yuvarlak: false, genis: false },
  { yuvarlak: true, genis: true },
  { yuvarlak: true, genis: false },
] as const

const SATIRLAR = [
  { ad: 'Kalın', kalin: true },
  { ad: 'İnce', kalin: false },
] as const

function UnluCizelgesi() {
  return (
    <table className="cizelge">
      <colgroup>
        <col className="cizelge__satir-basi" />
      </colgroup>
      <colgroup span={2} />
      <colgroup span={2} />
      <thead>
        <tr>
          <td rowSpan={2} />
          <th scope="colgroup" colSpan={2}>
            Düz
          </th>
          <th scope="colgroup" colSpan={2}>
            Yuvarlak
          </th>
        </tr>
        <tr>
          {SUTUNLAR.map(({ yuvarlak, genis }) => (
            <th key={`${yuvarlak}-${genis}`} scope="col">
              {genis ? 'Geniş' : 'Dar'}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {SATIRLAR.map(({ ad, kalin }) => (
          <tr key={ad}>
            <th scope="row">{ad}</th>
            {SUTUNLAR.map((sutun) => {
              const unlu = unluBul({ kalin, ...sutun })
              return (
                <td key={unlu}>
                  <div className="unlu-karti" data-kalinlik={kalin ? 'kalin' : 'ince'}>
                    <Unlu unlu={unlu} />
                    {/* Harf, karakterin aria-label'ında da var. */}
                    <span className="unlu-karti__harf" aria-hidden="true">
                      {unlu}
                    </span>
                  </div>
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Ok() {
  return (
    <svg className="ornek__ok" viewBox="0 0 28 16" width="28" height="16" aria-hidden="true">
      <path d="M2 8H25M18 2L25 8L18 14" />
    </svg>
  )
}

function OrnekSatiri({ ornek }: { ornek: Ornek }) {
  return (
    <li className="ornek" data-sonuc={ornek.sonuc}>
      <KokYazisi kok={ornek.kok} />
      <Bukalemun parca={ornek.parca} uyumsuz={ornek.uyumsuz} />
      <span className="ornek__sonuc">
        <Ok />
        {ornek.uyumsuz ? (
          <s className="ornek__bicim ornek__bicim--uyumsuz">{ornek.sonuc}</s>
        ) : (
          <span className="ornek__bicim">{ornek.sonuc}</span>
        )}
      </span>
    </li>
  )
}

export default function GaleriSayfasi() {
  const [renksiz, setRenksiz] = useState(false)

  return (
    <main className={renksiz ? 'galeri renksiz' : 'galeri'}>
      <header className="galeri__ust">
        <h1 className="galeri__baslik">Karakter Galerisi</h1>
        <button
          type="button"
          className="galeri__renksiz"
          aria-pressed={renksiz}
          onClick={() => setRenksiz((onceki) => !onceki)}
        >
          Renksiz
        </button>
      </header>
      <p className="galeri__aciklama">
        Görsel dil B · Canlı. Her karakter üç özellikten, koddan çizilir: gövde eni kalın ya da
        ince, gövde biçimi düz ya da yuvarlak, ağız geniş ya da dar. Renk kalınlığı gösterir ama
        hiçbir zaman tek başına değil.
      </p>

      <section className="galeri__bolum" aria-labelledby="bolum-unluler">
        <h2 id="bolum-unluler">Sekiz ünlü</h2>
        <UnluCizelgesi />
      </section>

      {ORNEK_BOLUMLERI.map((bolum) => (
        <section
          key={bolum.kimlik}
          className="galeri__bolum"
          aria-labelledby={`bolum-${bolum.kimlik}`}
        >
          <h2 id={`bolum-${bolum.kimlik}`}>{bolum.baslik}</h2>
          <p className="galeri__aciklama">{bolum.aciklama}</p>
          <ul className="ornekler">
            {bolum.ornekler.map((ornek) => (
              <OrnekSatiri key={`${ornek.kok}-${ornek.sonuc}`} ornek={ornek} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
