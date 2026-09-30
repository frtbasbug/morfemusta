// Karakter Galerisi: görsel dilin örnek çizelgesi (galeri.html). Önce sekiz ünlü okul
// çizelgesi düzeninde ve aynı düzende kök etiketleri; sonra -lAr ve -(I)m bukalemunları,
// saklanan ünlü ve uymayan ek. Oyundan bağlantı almaz. Renksiz düğmesi kalın ve ince
// renklerini aynı griye çevirir: sekiz ünlü ve etiketleri o zaman yalnız biçimlerinden
// ayırt edilir.

import { useState, type ReactNode } from 'react'
import { unluBul, type Unlu } from '../motor/index.ts'
import Agac, { BahceIsareti, Halka, Meyve } from '../gorsel/Agac.tsx'
import Bukalemun from '../gorsel/Bukalemun.tsx'
import { unluGovdesi } from '../gorsel/cizim.ts'
import KokYazisi from '../gorsel/KokYazisi.tsx'
import DukkanIsareti from '../gorsel/DukkanIsareti.tsx'
import Karo from '../gorsel/Karo.tsx'
import { karoAdi, karoTuru } from '../gorsel/karo.ts'
import UnluEtiketi from '../gorsel/UnluEtiketi.tsx'
import UnluKarti from '../gorsel/UnluKarti.tsx'
import Yaratik, { UydurukIsareti, Yildiz } from '../gorsel/Yaratik.tsx'
import './KarakterGalerisi.css'
import {
  GALERI_AGACI,
  GALERI_BOLUMLERI,
  GALERI_KAROLARI,
  GALERI_YARATIKLARI,
  type GaleriOrnegi,
} from './ornekler.ts'

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

const KALIN_GOVDE = unluGovdesi({ kalin: true })
const INCE_GOVDE = unluGovdesi({ kalin: false })

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
        <UnluCizelgesi
          aciklama="Satırlar kalın ve ince; sütunlar düz ve yuvarlak, altlarında geniş ve dar."
          hucre={(unlu) => <UnluKarti unlu={unlu} />}
        />
      </section>

      <section className="galeri__bolum" aria-labelledby="bolum-etiket">
        <h2 id="bolum-etiket">Kök etiketi</h2>
        <UnluCizelgesi
          aciklama={
            'Kökün son ünlüsü, gövdesinin küçük bir kopyasında durur: en/boy oranı ' +
            `karakterinki gibi (kalında ${KALIN_GOVDE.en}:${KALIN_GOVDE.boy}, incede ` +
            `${INCE_GOVDE.en}:${INCE_GOVDE.boy}); düzde köşeli, yuvarlakta elips. Uyuma yalnız ` +
            'kalınlık ve yuvarlaklık girer; etiket ikisini renksiz de gösterir.'
          }
          hucre={(unlu) => <UnluEtiketi unlu={unlu} />}
          sinif="cizelge--etiket"
        />
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

      <section className="galeri__bolum" aria-labelledby="bolum-karolar">
        <h2 id="bolum-karolar">Ünsüz karoları</h2>
        <p className="galeri__aciklama">
          Fıstıkçı Şahap'ın Dükkânı'nda sınırdaki ünsüz: sert ünsüz taş, yumuşak ünsüz jöle.
          Taş köşeleri yontulmuş bir çokgen, üstünde bir çatlak; jöle yuvarlak bir damla, üstünde
          bir parıltı. Renksiz'de de biçimleri ayrılır. Tezgâhta taş hep solda, jöle hep sağda.
        </p>
        <ul className="karolar">
          {GALERI_KAROLARI.map(({ karo, harf }) => (
            <li key={karo} className="karolar__karo" role="img" aria-label={karoAdi(harf, karo)}>
              <Karo karo={karo} harf={harf} />
              <span className="karolar__tur" aria-hidden="true">
                {karoTuru(karo)}
              </span>
            </li>
          ))}
        </ul>
        <p className="galeri__aciklama">Haritadaki işareti: iki küçük karo, yazısız.</p>
        <div className="karolar__isaret" role="img" aria-label="Dükkânın harita işareti">
          <DukkanIsareti />
        </div>
      </section>

      <section className="galeri__bolum" aria-labelledby="bolum-agac">
        <h2 id="bolum-agac">Kök Bahçesi</h2>
        <p className="galeri__aciklama">
          Yapım eki gövdeyi bir halka büyütür, çekim eki tepeye meyve gibi asılır; meyvenin
          üstüne gövde çıkmaz. Kök ağacın dibinde; halka yatay bir bant, meyve bir daire.
          Renksiz'de de biçimleri ayrılır. Kalın ve ince renkleri yalnız ek yazılarında.
        </p>
        <div className="agaclar">
          <div className="agaclar__agac" role="img" aria-label={`Ağaç: ${GALERI_AGACI.bicim}`}>
            <Agac
              kok={GALERI_AGACI.kok}
              halkalar={GALERI_AGACI.halkalar.map((parca) => ({ parca }))}
              meyve={{ parca: GALERI_AGACI.meyve, sayi: 3 }}
            />
          </div>
          <ul className="agaclar__parcalar">
            <li role="img" aria-label={`Halka: ${GALERI_AGACI.halkalar[0]?.yuzey ?? ''}`}>
              {GALERI_AGACI.halkalar[0] && <Halka parca={GALERI_AGACI.halkalar[0]} />}
            </li>
            <li role="img" aria-label={`Meyve: ${GALERI_AGACI.meyve.yuzey}`}>
              <Meyve parca={GALERI_AGACI.meyve} />
            </li>
            <li role="img" aria-label="Bahçenin harita işareti">
              <BahceIsareti />
            </li>
          </ul>
        </div>
      </section>

      <section className="galeri__bolum" aria-labelledby="bolum-yaratik">
        <h2 id="bolum-yaratik">Uydurukçuklar</h2>
        <p className="galeri__aciklama">
          Uydurma kelime kanıttır. Yaratık adındaki son ünlünün karakteridir; üstünde kök başına
          sabit tohumlu küçük süsler (boynuz, benek). Süs ünlüden değil kökten gelir; ağız
          hiçbir zaman değişmez. Bulunmada yıldız yaratığın üstünde durur, yönelmede ona doğru
          uçar.
        </p>
        <ul className="yaratiklar">
          {GALERI_YARATIKLARI.map((kok) => (
            <li key={kok} className="yaratiklar__yaratik">
              <Yaratik kok={kok} />
              <KokYazisi kok={kok} />
            </li>
          ))}
        </ul>
        <ul className="yaratiklar__parcalar">
          <li role="img" aria-label="Büyünün yıldızı">
            <Yildiz boyut={1.4} />
          </li>
          {GALERI_YARATIKLARI[0] && (
            <li role="img" aria-label="Uydurukçuklar'ın harita işareti">
              <UydurukIsareti kok={GALERI_YARATIKLARI[0]} />
            </li>
          )}
        </ul>
      </section>
    </main>
  )
}

/** Okul çizelgesi: her hücrede bir ünlü, hücrenin çizimi verilir (kart ya da etiket). */
function UnluCizelgesi({
  aciklama,
  hucre,
  sinif,
}: {
  aciklama: string
  hucre: (unlu: Unlu) => ReactNode
  sinif?: string
}) {
  return (
    <table className={sinif ? `cizelge ${sinif}` : 'cizelge'}>
      <caption className="galeri__aciklama">{aciklama}</caption>
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
                return <td key={unlu}>{hucre(unlu)}</td>
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
