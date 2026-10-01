// Ses Denetim Sayfası (ses.html): oyunun bütün sesleri, bölge bölge (sesMetinleri). Her sesin
// çal düğmesi ve Hatalı işareti var; okunuşu yazısından farklıysa altında yazılır. İşaretler
// yalnız bu cihazda, localStorage'da (ISARET_ANAHTARI) saklanır; hiçbir yere gönderilmez.
// İşaret sesin sürümüne bağlıdır (metin → sürüm): ses yeniden üretilince eski işaret görünmez.
// Listeyi kopyala, Hatalı işaretli metinleri satır satır panoya koyar: yanlış okunanların
// okunuşu icerik/ses-okunus.csv'ye yazılır (kullanıcının onayıyla).
//
// Üstte aynı beş cümle iki hızda örnek olarak durur (ses-listesi.json'daki ornekler): biraz
// yavaş (oyunun hızı) ve olağan. Geliştirici aracıdır; oyun bu sayfaya bağlantı vermez.

import { useEffect, useMemo, useState } from 'react'
import liste from '../ses/ses-listesi.json'
import { SESLER, cal, dosyaCal } from '../ses/calar.ts'
import { sesMetinleri } from '../ses/metinler.ts'
import { HoparlorSimgesi } from '../ekranlar/simgeler.tsx'
import './SesDenetimi.css'

/** İşaretlerin anahtarı: oyunun kaydından (morfemusta.v1) ayrı. v1 sürümsüzdü, okunmaz. */
export const ISARET_ANAHTARI = 'morfemusta.ses-denetimi.v2'

/** Hatalı işaretleri: metin → işaretlendiğinde sesin sürümü. Sırası işaretleme sırasıdır. */
type Isaretler = Readonly<Record<string, string>>

interface Ornek {
  readonly hiz: number
  readonly ad: string
  readonly metin: string
  readonly dosya: string
  readonly surum: string
}

const ORNEKLER = liste.ornekler as readonly Ornek[]
const HIZ_ADLARI: Readonly<Record<string, string>> = {
  yavas: 'Biraz yavaş (oyunun hızı)',
  olagan: 'Olağan',
}

/** Yalnız sesin bugünkü sürümüne konan işaretler okunur; eskileri atılır. */
function isaretleriOku(): Isaretler {
  try {
    const ham: unknown = JSON.parse(localStorage.getItem(ISARET_ANAHTARI) ?? '{}')
    if (typeof ham !== 'object' || ham === null || Array.isArray(ham)) return {}
    return Object.fromEntries(
      Object.entries(ham).filter(
        ([metin, surum]) => typeof surum === 'string' && SESLER[metin]?.surum === surum,
      ),
    )
  } catch {
    return {}
  }
}

function isaretleriYaz(isaretler: Isaretler) {
  try {
    localStorage.setItem(ISARET_ANAHTARI, JSON.stringify(isaretler))
  } catch {
    // Depo yoksa işaretler yalnız bu açılışta kalır.
  }
}

async function panoyaYaz(metin: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(metin)
    return true
  } catch {
    // Pano izni yoksa eski yol: seçili bir metin alanından kopyala.
    const alan = document.createElement('textarea')
    alan.value = metin
    alan.setAttribute('readonly', '')
    alan.style.position = 'fixed'
    alan.style.opacity = '0'
    document.body.append(alan)
    alan.select()
    const oldu = document.execCommand('copy')
    alan.remove()
    return oldu
  }
}

export default function SesDenetimi() {
  const gruplar = useMemo(() => sesMetinleri(), [])
  const [isaretler, setIsaretler] = useState<Isaretler>(isaretleriOku)
  const hatalilar = Object.keys(isaretler)
  const [durum, setDurum] = useState('')
  const toplam = new Set(gruplar.flatMap((g) => g.metinler)).size
  const sesli = [...new Set(gruplar.flatMap((g) => g.metinler))].filter((m) => SESLER[m]).length

  useEffect(() => {
    isaretleriYaz(isaretler)
  }, [isaretler])

  function isaretle(metin: string, hatali: boolean) {
    const surum = SESLER[metin]?.surum
    setIsaretler((onceki) => {
      const { [metin]: _, ...kalan } = onceki
      return hatali && surum ? { ...kalan, [metin]: surum } : kalan
    })
  }

  async function kopyala() {
    const oldu = await panoyaYaz(hatalilar.join('\n'))
    setDurum(oldu ? `${hatalilar.length} metin panoya kopyalandı.` : 'Kopyalanamadı.')
  }

  return (
    <main className="ses-denetimi">
      <h1>Ses Denetimi</h1>
      <p className="ses-denetimi__ozet">
        {toplam} metin; {sesli} sesi var. Ses: {liste.ses} ({liste.saglayici}). {liste.bicim}
      </p>

      <section aria-labelledby="ornekler-baslik">
        <h2 id="ornekler-baslik">Örnekler: aynı beş cümle iki hızda</h2>
        {ORNEKLER.length === 0 ? (
          <p>Örnek yok: sesler henüz üretilmedi (scripts/ses-uret.py).</p>
        ) : (
          Object.keys(HIZ_ADLARI).map((ad) => (
            <div key={ad} className="ses-denetimi__hiz">
              <h3>
                {HIZ_ADLARI[ad]} ({ORNEKLER.find((o) => o.ad === ad)?.hiz})
              </h3>
              <ul>
                {ORNEKLER.filter((o) => o.ad === ad).map((ornek) => (
                  <li key={ornek.dosya}>
                    <button
                      type="button"
                      className="ses-denetimi__cal"
                      aria-label={`Çal: ${ornek.metin} (${HIZ_ADLARI[ad]})`}
                      onClick={() => void dosyaCal(ornek.dosya, ornek.metin, ornek.surum)}
                    >
                      <HoparlorSimgesi />
                    </button>
                    <span>{ornek.metin}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <div className="ses-denetimi__arac">
        <button type="button" onClick={() => void kopyala()}>
          Listeyi kopyala
        </button>
        <span>{hatalilar.length} hatalı</span>
        <span role="status">{durum}</span>
      </div>

      {gruplar.map((grup) => (
        <section key={grup.kimlik} aria-labelledby={`grup-${grup.kimlik}`}>
          <h2 id={`grup-${grup.kimlik}`}>
            {grup.ad} <small>({grup.metinler.length})</small>
          </h2>
          <ul className="ses-denetimi__liste">
            {grup.metinler.map((metin) => {
              const kayit = SESLER[metin]
              const hatali = hatalilar.includes(metin)
              return (
                <li key={metin} className={hatali ? 'ses-denetimi__satir--hatali' : undefined}>
                  <button
                    type="button"
                    className="ses-denetimi__cal"
                    aria-label={`Çal: ${metin}`}
                    disabled={!kayit}
                    onClick={() => void cal(metin)}
                  >
                    <HoparlorSimgesi />
                  </button>
                  <span className="ses-denetimi__metin">
                    {metin}
                    {kayit && kayit.okunus !== metin && (
                      <small className="ses-denetimi__okunus">okunuş: {kayit.okunus}</small>
                    )}
                    {!kayit && <small className="ses-denetimi__okunus">ses yok</small>}
                  </span>
                  <label className="ses-denetimi__isaret">
                    <input
                      type="checkbox"
                      checked={hatali}
                      onChange={(e) => isaretle(metin, e.currentTarget.checked)}
                    />
                    Hatalı
                  </label>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </main>
  )
}
