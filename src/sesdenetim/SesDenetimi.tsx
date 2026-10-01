// Ses Denetim Sayfası (ses.html): oyunun bütün sesleri, bölge bölge (sesMetinleri). Her sesin
// çal düğmesi ve Hatalı işareti var; okunuşu yazısından farklıysa altında yazılır. İşaretler
// yalnız bu cihazda, localStorage'da (ISARET_ANAHTARI) saklanır; hiçbir yere gönderilmez.
// İşaret sesin sürümüne bağlıdır (metin → sürüm): ses yeniden üretilince eski işaret görünmez.
// Listeyi kopyala, Hatalı işaretli metinleri satır satır panoya koyar: yanlış okunanların
// okunuşu icerik/ses-okunus.csv'ye yazılır (kullanıcının onayıyla). Geliştirici aracıdır; oyun
// bu sayfaya bağlantı vermez.

import { useEffect, useMemo, useState } from 'react'
import liste from '../ses/ses-listesi.json'
import { SESLER, cal } from '../ses/calar.ts'
import { sesMetinleri } from '../ses/metinler.ts'
import { HoparlorSimgesi } from '../ekranlar/simgeler.tsx'
import './SesDenetimi.css'

/** Sesin okunuşu: listenin tamamından (oyunun paketinde okunuş yok). */
const okunusu = (metin: string): string | undefined =>
  (liste.metinler as Record<string, { okunus: string } | undefined>)[metin]?.okunus

/** İşaretlerin anahtarı: oyunun kaydından (morfemusta.v1) ayrı. v1 sürümsüzdü, okunmaz. */
export const ISARET_ANAHTARI = 'morfemusta.ses-denetimi.v2'

/** Hatalı işaretleri: metin → işaretlendiğinde sesin sürümü. Sırası işaretleme sırasıdır. */
type Isaretler = Readonly<Record<string, string>>

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
        {toplam} metin; {sesli} sesi var. Ses: {liste.ses} ({liste.saglayici}), hız {liste.hiz}.{' '}
        {liste.bicim}
      </p>

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
                    {kayit && okunusu(metin) !== metin && (
                      <small className="ses-denetimi__okunus">okunuş: {okunusu(metin)}</small>
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
