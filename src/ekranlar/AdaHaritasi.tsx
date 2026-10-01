// Ada haritası: açılış ekranı (DESIGN.md, "Ada haritası"). Adanın çizimi süstür: kodla
// çizilmiş bir SVG, ekran okuyucudan gizli. Bölgeler üstünde gerçek düğmelerdir; bölge
// tablosundaki sırayla (icerik/bolgeler.csv) bir yol boyunca dizilir.
//
// Durum yalnız renkle değil, simge ve yazıyla da görünür: açık (üçgen), tamam (tamam işareti),
// kilitli (kilit), hazırlanıyor (kum saati). Kilitli ya da hazırlanan bölgeye dokununca başlığın
// altında nedeni yazılır. Kalın ve ince renkleri haritada kullanılmaz: onlar yalnız dilbilgisel
// anlam taşır. Her bölgenin işareti süstür, yazısızdır: koyda bukalemun, dükkânda taş ve jöle,
// bahçede ağaç, Uydurukçuklar'da yaratık.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ekle } from '../motor/index.ts'
import { BahceIsareti } from '../gorsel/Agac.tsx'
import Bukalemun from '../gorsel/Bukalemun.tsx'
import DukkanIsareti from '../gorsel/DukkanIsareti.tsx'
import { UydurukIsareti } from '../gorsel/Yaratik.tsx'
import { HAZIRLANIYOR_ILETISI, kilitIletisi, type Bolge } from '../oyun/bolgeler.ts'
import type { BolgeDurumu, HaritaBolgesi } from '../oyun/ilerleme.ts'
import { cal } from '../ses/calar.ts'
import { Hoparlor, useSes } from '../ses/Ses.tsx'
import type { Nokta } from './hareket.ts'
import { AcikSimgesi, KilitSimgesi, KumSaatiSimgesi, TamamSimgesi } from './simgeler.tsx'
import './AdaHaritasi.css'

/** Çizimin kutusu (viewBox). Düğmeler aynı kutuda, yüzde konumlarla durur. */
export const HARITA_KUTUSU = { en: 320, boy: 440 } as const

/** Bölgelerin çizimdeki yerleri, tablodaki sırayla; yol bunlardan geçer. */
export const BOLGE_YERLERI: readonly Nokta[] = [
  { x: 94, y: 356 },
  { x: 222, y: 262 },
  { x: 98, y: 168 },
  { x: 218, y: 78 },
]

/** Kıyının noktaları, saat yönünde; sol altta koy (denizin girdiği yer). */
const KIYI: readonly Nokta[] = [
  { x: 160, y: 38 },
  { x: 250, y: 50 },
  { x: 294, y: 110 },
  { x: 300, y: 200 },
  { x: 292, y: 292 },
  { x: 266, y: 372 },
  { x: 214, y: 414 },
  { x: 150, y: 420 },
  { x: 118, y: 404 },
  { x: 92, y: 396 },
  { x: 66, y: 406 },
  { x: 40, y: 390 },
  { x: 26, y: 336 },
  { x: 20, y: 262 },
  { x: 30, y: 176 },
  { x: 54, y: 96 },
  { x: 100, y: 52 },
]

/** Denizde dalgalar. */
const DALGALAR = [
  'M12 20q7-6 14 0t14 0',
  'M270 16q7-6 14 0t14 0',
  'M280 428q7-6 14 0t14 0',
  'M10 432q7-6 14 0t14 0',
]

/** Karada küçük ağaçlar, ikişer (bölge düğmelerinden uzakta). */
const AGACLAR: readonly Nokta[] = [
  { x: 64, y: 96 },
  { x: 256, y: 170 },
  { x: 62, y: 266 },
  { x: 244, y: 364 },
]

const DURUM_ADLARI: Readonly<Record<BolgeDurumu, string>> = {
  acik: 'Açık',
  tamam: 'Tamam',
  kilitli: 'Kilitli',
  hazirlaniyor: 'Hazırlanıyor',
}

const DURUM_SIMGELERI: Readonly<Record<BolgeDurumu, () => ReactNode>> = {
  acik: AcikSimgesi,
  tamam: TamamSimgesi,
  kilitli: KilitSimgesi,
  hazirlaniyor: KumSaatiSimgesi,
}

const yuvarla = (n: number) => Math.round(n * 10) / 10

/**
 * Noktalardan geçen yumuşak yol (Catmull-Rom, kübik Bézier'e çevrilmiş). Kapalıysa son nokta
 * ilkine bağlanır.
 */
export function yumusakYol(noktalar: readonly Nokta[], kapali = false): string {
  const n = noktalar.length
  const [ilk] = noktalar
  if (!ilk) return ''
  const nokta = (i: number): Nokta =>
    (kapali ? noktalar[(i + n) % n] : noktalar[Math.max(0, Math.min(n - 1, i))]) ?? ilk
  let d = `M${ilk.x} ${ilk.y}`
  for (let i = 0; i < (kapali ? n : n - 1); i++) {
    const [a, b, c, e] = [nokta(i - 1), nokta(i), nokta(i + 1), nokta(i + 2)]
    const k1 = { x: yuvarla(b.x + (c.x - a.x) / 6), y: yuvarla(b.y + (c.y - a.y) / 6) }
    const k2 = { x: yuvarla(c.x - (e.x - b.x) / 6), y: yuvarla(c.y - (e.y - b.y) / 6) }
    d += `C${k1.x} ${k1.y} ${k2.x} ${k2.y} ${c.x} ${c.y}`
  }
  return kapali ? `${d}Z` : d
}

const KIYI_YOLU = yumusakYol(KIYI, true)

/**
 * Bölgenin haritadaki işareti:
 *   koy     koyun ilk görevinin bukalemunu, küçük ve yazısız (süs; ek yazısı bu boyda okunmaz)
 *   dukkan  yan yana küçük bir taş ve bir jöle karosu, yazısız
 *   bahce   küçük bir ağaç, yazısız
 *   uyduruk küçük bir yaratık: ilk görevin yaratığı (fıngıl), yazısız
 */
function isaret(bolge: Bolge): ReactNode {
  if (bolge.kimlik === 'dukkan') return <DukkanIsareti />
  if (bolge.kimlik === 'bahce') return <BahceIsareti />
  if (bolge.kimlik === 'uyduruk') {
    const [gorev] = bolge.gorevler
    return gorev ? <UydurukIsareti kok={gorev.kok} /> : null
  }
  if (bolge.kimlik !== 'koy') return null
  const [gorev] = bolge.gorevler
  const [etiket] = gorev?.etiketler ?? []
  if (!gorev || etiket === undefined) return null
  const [parca] = ekle(gorev.kok, [etiket]).parcalar
  return parca ? <Bukalemun parca={parca} boyut={0.42} yazisiz /> : null
}

export default function AdaHaritasi({
  bolgeler,
  onBolge,
}: {
  /** Bölgeler ve durumları, tablodaki sırayla (bolgeDurumlari). */
  readonly bolgeler: readonly HaritaBolgesi[]
  /** Açık ya da tamam bir bölgeye dokunuldu. */
  readonly onBolge: (bolge: Bolge) => void
}) {
  const [ileti, setIleti] = useState<{ metin: string; durum: BolgeDurumu } | null>(null)
  const baslikRef = useRef<HTMLHeadingElement>(null)
  const { ayar } = useSes()

  useEffect(() => {
    baslikRef.current?.focus()
  }, [])

  function dokunuldu({ bolge, durum, onceki }: HaritaBolgesi) {
    const metin =
      durum === 'kilitli'
        ? kilitIletisi(onceki)
        : durum === 'hazirlaniyor'
          ? HAZIRLANIYOR_ILETISI
          : null
    if (metin === null) {
      // Açık bölgenin adını sesli modda bölge ekranı söyler (girişte, kökten önce).
      onBolge(bolge)
      return
    }
    setIleti({ metin, durum })
    // Sesli mod: bölgenin adı ve iletisi.
    if (ayar === 'sesli') void cal([bolge.ad, metin])
  }

  const IletiSimgesi = ileti ? DURUM_SIMGELERI[ileti.durum] : null
  const yerler = BOLGE_YERLERI.slice(0, bolgeler.length)

  return (
    <main className="harita" aria-labelledby="harita-baslik">
      <h1 id="harita-baslik" className="harita__baslik" ref={baslikRef} tabIndex={-1}>
        Morfemusta Adası
      </h1>
      <p className="harita__ileti" role="status">
        {ileti && IletiSimgesi && (
          <span className="harita__balon">
            <IletiSimgesi />
            {ileti.metin}
            <Hoparlor metin={ileti.metin} />
          </span>
        )}
      </p>

      <div className="harita__alan">
        <div className="harita__cerceve">
          <svg
            className="harita__cizim"
            viewBox={`0 0 ${HARITA_KUTUSU.en} ${HARITA_KUTUSU.boy}`}
            aria-hidden="true"
            focusable="false"
          >
            {DALGALAR.map((d) => (
              <path key={d} className="ada__dalga" d={d} />
            ))}
            <path className="ada__kopuk" d={KIYI_YOLU} />
            <path className="ada__kara" d={KIYI_YOLU} />
            {AGACLAR.flatMap(({ x, y }) =>
              [
                { x: x - 8, y: y + 2, r: 6 },
                { x: x + 7, y: y - 2, r: 7.5 },
              ].map((agac) => (
                <g key={`${agac.x},${agac.y}`} className="ada__agac">
                  <path d={`M${agac.x} ${agac.y + agac.r}v6`} />
                  <circle cx={agac.x} cy={agac.y} r={agac.r} />
                </g>
              )),
            )}
            <path className="ada__yol" d={yumusakYol(yerler)} />
          </svg>

          <ol className="harita__bolgeler">
            {bolgeler.map((haritaBolgesi, i) => {
              const { bolge, durum } = haritaBolgesi
              const yer = BOLGE_YERLERI[i]
              if (!yer) return null
              const Simge = DURUM_SIMGELERI[durum]
              const bolgeIsareti = isaret(bolge)
              return (
                <li
                  key={bolge.kimlik}
                  className="harita__yer"
                  style={{
                    left: `${(yer.x / HARITA_KUTUSU.en) * 100}%`,
                    top: `${(yer.y / HARITA_KUTUSU.boy) * 100}%`,
                  }}
                >
                  <button
                    type="button"
                    className={`bolge bolge--${durum}`}
                    data-bolge={bolge.kimlik}
                    // Adı görünen yazının aynısı; virgül ekran okuyucuya durak verir.
                    aria-label={`${bolge.ad}, ${DURUM_ADLARI[durum]}`}
                    onClick={() => dokunuldu(haritaBolgesi)}
                  >
                    {bolgeIsareti && (
                      <span className="bolge__isaret" aria-hidden="true">
                        {bolgeIsareti}
                      </span>
                    )}
                    <span className="bolge__yazi">
                      <span className="bolge__ad">{bolge.ad}</span>
                      <span className="bolge__durum">
                        <Simge />
                        {DURUM_ADLARI[durum]}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </main>
  )
}
