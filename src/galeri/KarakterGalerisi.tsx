// Karakter Galerisi: görsel dilin örnek çizelgesi (galeri.html). Önce sekiz ünlü okul
// çizelgesi düzeninde, sonra -lAr ve -(I)m bukalemunları, saklanan ünlü ve uymayan ek.
// Oyundan bağlantı almaz. Renksiz düğmesi kalın ve ince renklerini aynı griye çevirir:
// sekiz ünlü o zaman yalnız bedenlerinden ayırt edilir.

import { useState } from 'react'
import { unluBul } from '../motor/index.ts'
import Bukalemun from '../gorsel/Bukalemun.tsx'
import KokYazisi from '../gorsel/KokYazisi.tsx'
import UnluKarti from '../gorsel/UnluKarti.tsx'
import './KarakterGalerisi.css'
import { GALERI_BOLUMLERI, type GaleriOrnegi } from './ornekler.ts'

// Okul çizelgesi: satırlar kalın ve ince; üstte düz ve yuvarlak, altlarında geniş ve dar.
const SATIRLAR = [
  { ad: 'kalın', kalin: true },
  { ad: 'ince', kalin: false },
] as const
const SUTUN_GRUPLARI = [
  { ad: 'düz', yuvarlak: false },
  { ad: 'yuvarlak', yuvarlak: true },
] as const
const SUTUNLAR = [
  { ad: 'geniş', genis: true },
  { ad: 'dar', genis: false },
] as const

export default function KarakterGalerisi() {
  const [renksiz, setRenksiz] = useState(false)

  return (
    <main className={renksiz ? 'galeri renksiz' : 'galeri'}>
      <header className="galeri__ust">
        <p className="galeri__logo">Morfemusta</p>
        <h1 className="galeri__baslik">Karakter Galerisi</h1>
        <p className="galeri__aciklama">
          Görsel dil, B · Canlı. Her özellik tek bir çizim boyutuna bağlı: kalınlık gövdenin
          eni, yuvarlaklık gövdenin biçimi, genişlik ağız.
        </p>
        <button
          type="button"
          className="galeri__renksiz"
          aria-pressed={renksiz}
          onClick={() => setRenksiz((onceki) => !onceki)}
        >
          Renksiz
        </button>
      </header>

      <section className="galeri__bolum" aria-labelledby="bolum-unluler">
        <h2 id="bolum-unluler">Sekiz ünlü</h2>
        <UnluCizelgesi />
      </section>

      {GALERI_BOLUMLERI.map((bolum) => (
        <section key={bolum.id} className="galeri__bolum" aria-labelledby={`bolum-${bolum.id}`}>
          <h2 id={`bolum-${bolum.id}`}>{bolum.baslik}</h2>
          <p className="galeri__aciklama">{bolum.aciklama}</p>
          <ul className="ornekler">
            {bolum.ornekler.map((ornek) => (
              <OrnekSatiri key={`${ornek.kok}+${ornek.etiket}`} ornek={ornek} />
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}

function UnluCizelgesi() {
  return (
    <table className="cizelge">
      <caption className="galeri__aciklama">
        Satırlar kalın ve ince; sütunlar düz ve yuvarlak, altlarında geniş ve dar.
      </caption>
      <colgroup>
        <col className="cizelge__satir-sutunu" />
      </colgroup>
      {SUTUN_GRUPLARI.map((grup) => (
        <colgroup key={grup.ad} span={SUTUNLAR.length} />
      ))}
      <thead>
        <tr>
          <td />
          {SUTUN_GRUPLARI.map((grup) => (
            <th key={grup.ad} colSpan={SUTUNLAR.length} scope="colgroup" className="cizelge__grup">
              {grup.ad}
            </th>
          ))}
        </tr>
        <tr>
          <td />
          {SUTUN_GRUPLARI.flatMap((grup) =>
            SUTUNLAR.map((sutun) => (
              <th key={`${grup.ad}-${sutun.ad}`} scope="col">
                {sutun.ad}
              </th>
            )),
          )}
        </tr>
      </thead>
      <tbody>
        {SATIRLAR.map((satir) => (
          <tr key={satir.ad}>
            <th scope="row">{satir.ad}</th>
            {SUTUN_GRUPLARI.flatMap((grup) =>
              SUTUNLAR.map((sutun) => {
                const unlu = unluBul({
                  kalin: satir.kalin,
                  yuvarlak: grup.yuvarlak,
                  genis: sutun.genis,
                })
                return (
                  <td key={unlu}>
                    <UnluKarti unlu={unlu} />
                  </td>
                )
              }),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Örnek satırı: kök, bukalemun, ok, sonuç. */
function OrnekSatiri({ ornek }: { ornek: GaleriOrnegi }) {
  return (
    <li className="ornek">
      <span className="ornek__kok">
        <KokYazisi kok={ornek.kok} />
      </span>
      <span className="ornek__bukalemun">
        <Bukalemun parca={ornek.parca} uyumsuz={ornek.uyumsuz} />
      </span>
      <svg className="ornek__ok" viewBox="0 0 28 16" width="28" height="16" aria-hidden="true">
        <path d="M3 8H24M18 3L24 8L18 13" />
      </svg>
      {ornek.uyumsuz ? (
        <s className="ornek__sonuc ornek__sonuc--uymayan">{ornek.sonuc}</s>
      ) : (
        <span className="ornek__sonuc">{ornek.sonuc}</span>
      )}
    </li>
  )
}
