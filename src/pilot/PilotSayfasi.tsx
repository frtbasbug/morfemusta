// Pilot sayfası (pilot.html; DESIGN.md, "Pilot"): yetişkin içindir, oyundan bağlantı almaz,
// adresle açılır, arama motorlarına kapalıdır. Deneme günlüğü (src/oyun/gunluk.ts) yalnız bu
// cihazdadır; hiçbir şey kendiliğinden gönderilmez: yetişkin CSV'yi elle indirir ya da kopyalar.
//
//   Çocuk     kod alanı ve Yeni çocuk (kodu yazar, günlük açılır; oyunun ilerlemesi, kartları
//             ve kalınan yeri sıfırlanır, ayarlar ve günlük kalır); Kodu sil (günlük kapanır)
//   Özet      çocuk başına: bölge başına biten görev, ilk denemede doğru oranı, en sık üç neden
//   Günlük    CSV indir (UTF-8 imli, noktalı virgüllü: Türkçe Excel), Kopyala (sekmeli),
//             Günlüğü sil (iki adım: Vazgeç / Sil; odak önce Vazgeç'te)
//   Belgeler  gözlem formu, veli bilgilendirme ve onay formu, gözlemci yönergesi (A4, yazdırılır)
//
// Depo dolup günlük durduysa, sınıf modu açıksa ya da kayıt okunamıyorsa sayfanın başında söylenir.
// Oyun başka sekmede açıksa yazdıkları hemen görünür (storage olayı; görünür olunca da okunur).

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { cihazDeposu } from '../kabuk/depo.ts'
import {
  DURMA_ANAHTARI,
  GUNLUK_ANAHTARI,
  cocukKodunuCoz,
  cocukOzetleri,
  csvDosyaAdi,
  csvMetni,
  depoDoluMu,
  gunluguOku,
  gunluguSil,
  koduSil,
  kopyaMetni,
  oranYazisi,
  yeniCocuk,
  type Gunluk,
  type PilotDeposu,
} from '../oyun/gunluk.ts'
import { ANAHTAR, ilerlemeyiYukle, type Ayarlar } from '../oyun/ilerleme.ts'
import { surumYazisi } from '../surum.ts'

/** Üç belge, pilot.html'e göre yolları. */
export const BELGELER = [
  {
    yol: 'belgeler/gozlem-formu.html',
    ad: 'Gözlem formu',
    aciklama: 'çocuk başına bir sayfa',
  },
  {
    yol: 'belgeler/veli-onay-formu.html',
    ad: 'Veli bilgilendirme ve onay formu',
    aciklama: 'her veliye bir sayfa',
  },
  {
    yol: 'belgeler/gozlemci-yonergesi.html',
    ad: 'Gözlemci yönergesi',
    aciklama: 'her gözlemciye bir sayfa',
  },
] as const

const SES_ADLARI: Readonly<Record<Ayarlar['ses'], string>> = {
  kapali: 'Kapalı',
  dokununca: 'Dokununca',
  sesli: 'Sesli mod',
}

/** Sayfanın gördüğü durum: günlük, oyunun ayarları ve deponun doluluğu. */
interface Durum {
  readonly gunluk: Gunluk
  readonly ayarlar: Ayarlar
  readonly dolu: boolean
}

const durumuOku = (depo: PilotDeposu | null): Durum => ({
  gunluk: gunluguOku(depo),
  ayarlar: ilerlemeyiYukle(depo).ayarlar,
  dolu: depoDoluMu(depo),
})

/** Tarayıcının localStorage'ı (removeItem de var); erişim kapalıysa null. */
const tarayicininDeposu = (): PilotDeposu | null => cihazDeposu() as PilotDeposu | null

async function panoyaYaz(metin: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(metin)
    return true
  } catch {
    // Pano izni yoksa eski yol: seçili bir metin alanından kopyala.
    try {
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
    } catch {
      return false
    }
  }
}

/** CSV'yi indirir: UTF-8 imli metin, dosya adında yerel gün. */
function indir(metin: string, ad: string) {
  const adres = URL.createObjectURL(new Blob([metin], { type: 'text/csv;charset=utf-8' }))
  const bag = document.createElement('a')
  bag.href = adres
  bag.download = ad
  document.body.append(bag)
  bag.click()
  bag.remove()
  // İndirme başlasın diye adres biraz sonra bırakılır.
  setTimeout(() => URL.revokeObjectURL(adres), 10_000)
}

export default function PilotSayfasi({ depo: verilenDepo }: { readonly depo?: PilotDeposu | null }) {
  const [depo] = useState(() => (verilenDepo === undefined ? tarayicininDeposu() : verilenDepo))
  const [durum, setDurum] = useState(() => durumuOku(depo))
  const [kod, setKod] = useState('')
  const [kodHatasi, setKodHatasi] = useState('')
  const [ileti, setIleti] = useState('')
  const [soruluyor, setSoruluyor] = useState(false)
  const [elleKopya, setElleKopya] = useState<string | null>(null)
  const baslikRef = useRef<HTMLHeadingElement>(null)
  const silRef = useRef<HTMLButtonElement>(null)
  const vazgecRef = useRef<HTMLButtonElement>(null)
  const elleKopyaRef = useRef<HTMLTextAreaElement>(null)
  const oncekiSoru = useRef(soruluyor)

  const tazele = useCallback(() => setDurum(durumuOku(depo)), [depo])

  useEffect(() => {
    baslikRef.current?.focus()
  }, [])

  // Oyun başka sekmede yazınca (storage), sayfa görünür olunca ve geri tuşuyla dönülünce yeniden
  // okunur.
  useEffect(() => {
    const depoDegisti = (olay: StorageEvent) => {
      if (olay.key === null || [GUNLUK_ANAHTARI, DURMA_ANAHTARI, ANAHTAR].includes(olay.key)) {
        tazele()
      }
    }
    const gorundu = () => {
      if (document.visibilityState === 'visible') tazele()
    }
    window.addEventListener('storage', depoDegisti)
    document.addEventListener('visibilitychange', gorundu)
    window.addEventListener('pageshow', tazele)
    return () => {
      window.removeEventListener('storage', depoDegisti)
      document.removeEventListener('visibilitychange', gorundu)
      window.removeEventListener('pageshow', tazele)
    }
  }, [tazele])

  // Odak: soru açılınca Vazgeç'e (güvenli seçenek), kapanınca Günlüğü sil'e.
  useEffect(() => {
    if (oncekiSoru.current === soruluyor) return
    oncekiSoru.current = soruluyor
    if (soruluyor) vazgecRef.current?.focus()
    else silRef.current?.focus()
  }, [soruluyor])

  // Pano kullanılamadıysa metin seçili bir alanda görünür: yetişkin elle kopyalar.
  useEffect(() => {
    if (elleKopya !== null) elleKopyaRef.current?.select()
  }, [elleKopya])

  const { gunluk, ayarlar, dolu } = durum
  const { satirlar } = gunluk
  const ozetler = cocukOzetleri(satirlar)
  const silinecekVar = satirlar.length > 0 || gunluk.durum === 'bozuk' || gunluk.durdu !== null

  function yeniCocukGir(olay: FormEvent) {
    olay.preventDefault()
    const yeni = cocukKodunuCoz(kod)
    if (!yeni) {
      setKodHatasi('Kod bir harf ve iki ya da üç rakamdır (P01 gibi). Ad yazılmaz.')
      return
    }
    setKodHatasi('')
    const oncekiDenemeler = satirlar.some((s) => s.cocuk === yeni)
    const sonuc = yeniCocuk(depo, yeni)
    tazele()
    if (!sonuc.kod) {
      setIleti('Kod yazılamadı: cihazın deposuna erişilemiyor ya da depo dolu.')
      return
    }
    setKod('')
    setIleti(
      [
        `Yeni çocuk: ${yeni}. Günlük açık.`,
        sonuc.ilerleme
          ? "Oyunun ilerlemesi ve kartları silindi; çocuk Bukalemun Koyu'ndan başlar."
          : 'Oyunun ilerlemesi silinemedi (depo dolu).',
        oncekiDenemeler ? 'Bu kodun önceki denemeleri günlükte; yenileri onlara eklenir.' : '',
      ]
        .filter(Boolean)
        .join(' '),
    )
  }

  function koduKaldir() {
    const oldu = koduSil(depo)
    tazele()
    setIleti(oldu ? 'Kod silindi: günlük kapalı. Denemeler günlükte kalır.' : 'Kod silinemedi.')
  }

  function csvIndir() {
    indir(csvMetni(satirlar), csvDosyaAdi(new Date()))
    setIleti(`${satirlar.length} deneme CSV olarak indirildi.`)
  }

  async function kopyala() {
    const metin = kopyaMetni(satirlar)
    if (await panoyaYaz(metin)) {
      setElleKopya(null)
      setIleti(`${satirlar.length} deneme panoya kopyalandı.`)
    } else {
      setElleKopya(metin)
      setIleti('Panoya kopyalanamadı: aşağıdaki metni seçip kopyalayın.')
    }
  }

  function sil() {
    const oldu = gunluguSil(depo)
    tazele()
    setSoruluyor(false)
    setElleKopya(null)
    setIleti(oldu ? 'Günlük silindi.' : 'Günlük silinemedi: cihazın deposuna erişilemiyor.')
  }

  return (
    <main className="pilot" aria-labelledby="pilot-baslik">
      <header className="pilot__ust">
        <h1 id="pilot-baslik" ref={baslikRef} tabIndex={-1}>
          Pilot
        </h1>
        <p className="pilot__surum">
          Sürüm: <span data-surum="">{surumYazisi()}</span>
        </p>
        <p className="pilot__not">
          Yetişkin içindir. Deneme günlüğü yalnız bu cihazda durur; hiçbir şey kendiliğinden
          gönderilmez. Günü bitirirken CSV'yi indirin.
        </p>
      </header>

      <Uyarilar gunluk={gunluk} ayarlar={ayarlar} dolu={dolu} />

      <section className="pilot__bolum" aria-labelledby="cocuk-baslik">
        <h2 id="cocuk-baslik">Çocuk</h2>
        <p className="pilot__durum">
          {gunluk.cocuk ? (
            <>
              Günlük açık. Çocuk kodu: <strong data-cocuk="">{gunluk.cocuk}</strong>
            </>
          ) : (
            'Günlük kapalı: çocuk kodu yok. Kod girilmeden deneme yazılmaz.'
          )}
        </p>
        <form className="pilot__form" onSubmit={yeniCocukGir} noValidate>
          <label className="pilot__etiket" htmlFor="pilot-kod">
            Çocuk kodu
          </label>
          <div className="pilot__satir">
            <input
              id="pilot-kod"
              className="pilot__kod"
              type="text"
              value={kod}
              onChange={(olay) => setKod(olay.target.value)}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={4}
              placeholder="P01"
              aria-describedby="pilot-kod-aciklama pilot-kod-hatasi"
              aria-invalid={kodHatasi !== ''}
            />
            <button type="submit" className="pilot__dugme">
              Yeni çocuk
            </button>
          </div>
          <p id="pilot-kod-aciklama" className="pilot__aciklama">
            Bir harf ve iki ya da üç rakam (P01). Ad yazılmaz. Yeni çocuk: oyunun ilerlemesi,
            kartları ve kalınan yeri silinir, çocuk Bukalemun Koyu'ndan başlar; ayarlar ve
            günlük kalır.
          </p>
          <p id="pilot-kod-hatasi" className="pilot__hata" role="alert">
            {kodHatasi}
          </p>
        </form>
        <div className="pilot__dugmeler">
          <a className="pilot__dugme" href="./">
            Oyunu aç
          </a>
          {gunluk.cocuk && (
            <button type="button" className="pilot__dugme pilot__dugme--ikincil" onClick={koduKaldir}>
              Kodu sil
            </button>
          )}
        </div>
        <p className="pilot__aciklama" data-ayarlar="">
          Oyunun ayarları: Ses: {SES_ADLARI[ayarlar.ses]} · Sınıf modu:{' '}
          {ayarlar.sinif === 'acik' ? 'Açık' : 'Kapalı'}. Ses modu oyunun Ayarlar'ından seçilir
          (1–2. sınıfa Sesli mod).
        </p>
      </section>

      <section className="pilot__bolum" aria-labelledby="ozet-baslik">
        <h2 id="ozet-baslik">Özet</h2>
        {ozetler.length === 0 ? (
          <p>Günlükte henüz deneme yok.</p>
        ) : (
          ozetler.map((ozet) => (
            <article
              key={ozet.cocuk}
              className="pilot__ozet"
              aria-labelledby={`ozet-${ozet.cocuk}`}
              data-cocuk={ozet.cocuk}
            >
              <h3 id={`ozet-${ozet.cocuk}`}>{ozet.cocuk}</h3>
              <table className="pilot__tablo">
                <caption className="gizli">{ozet.cocuk}: bölge başına özet</caption>
                <thead>
                  <tr>
                    <th scope="col">Bölge</th>
                    <th scope="col">Biten görev</th>
                    <th scope="col">İlk denemede doğru</th>
                  </tr>
                </thead>
                <tbody>
                  {ozet.bolgeler.map(({ bolge, bitenGorev, ilkDeneme }) => (
                    <tr key={bolge.kimlik} data-bolge={bolge.kimlik}>
                      <th scope="row">{bolge.ad}</th>
                      <td>{bitenGorev}</td>
                      <td>{oranYazisi(ilkDeneme)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr data-bolge="toplam">
                    <th scope="row">Toplam</th>
                    <td>{ozet.bitenGorev}</td>
                    <td>{oranYazisi(ozet.ilkDeneme)}</td>
                  </tr>
                </tfoot>
              </table>
              <p className="pilot__nedenler-baslik">En sık nedenler</p>
              {ozet.nedenler.length === 0 ? (
                <p className="pilot__aciklama">Yanlış seçim yok.</p>
              ) : (
                <ol className="pilot__nedenler">
                  {ozet.nedenler.map(({ neden, sayi }) => (
                    <li key={neden}>
                      <code>{neden}</code> ({sayi})
                    </li>
                  ))}
                </ol>
              )}
              <p className="pilot__aciklama">{ozet.secim} seçim.</p>
            </article>
          ))
        )}
        <p className="pilot__aciklama">
          Biten görev: son seçimi doğru olan görev (bir kez sayılır). İlk denemede doğru: her seçim
          yerinin ilk denemesi; Uydurukçuklar'ın sınır adımında iki karo da doğru olduğundan
          sayılmaz. Nedenler motorun kodlarıdır; bir seçimin birden çok nedeni ayrı ayrı sayılır.
        </p>
      </section>

      <section className="pilot__bolum" aria-labelledby="gunluk-baslik">
        <h2 id="gunluk-baslik">Günlük</h2>
        <p data-gunluk-sayisi="">
          {satirlar.length} deneme, {ozetler.length} çocuk.
        </p>
        <div className="pilot__dugmeler">
          <button
            type="button"
            className="pilot__dugme"
            onClick={csvIndir}
            disabled={satirlar.length === 0}
          >
            CSV indir
          </button>
          <button
            type="button"
            className="pilot__dugme"
            onClick={() => void kopyala()}
            disabled={satirlar.length === 0}
          >
            Kopyala
          </button>
          {!soruluyor && (
            <button
              ref={silRef}
              type="button"
              className="pilot__dugme pilot__dugme--ikincil"
              onClick={() => setSoruluyor(true)}
              disabled={!silinecekVar}
            >
              Günlüğü sil
            </button>
          )}
        </div>
        {soruluyor && (
          <div className="pilot__soru" role="group" aria-labelledby="pilot-sil-uyari">
            <p id="pilot-sil-uyari">
              Günlükteki bütün denemeler silinecek. Önce CSV'yi indirin. Kod kalır.
            </p>
            <div className="pilot__dugmeler">
              <button
                ref={vazgecRef}
                type="button"
                className="pilot__dugme"
                onClick={() => setSoruluyor(false)}
              >
                Vazgeç
              </button>
              <button type="button" className="pilot__dugme pilot__dugme--sil" onClick={sil}>
                Sil
              </button>
            </div>
          </div>
        )}
        <p className="pilot__ileti" role="status">
          {ileti}
        </p>
        {elleKopya !== null && (
          <textarea
            ref={elleKopyaRef}
            className="pilot__elle-kopya"
            aria-label="Günlük (sekmeyle ayrılmış)"
            readOnly
            value={elleKopya}
          />
        )}
        <p className="pilot__aciklama">
          CSV: UTF-8, noktalı virgülle ayrılmış (Türkçe Excel doğrudan açar). Kopyala: sekmeyle
          ayrılmış; tabloya yapıştırılınca her alan bir hücreye düşer.
        </p>
      </section>

      <section className="pilot__bolum" aria-labelledby="belgeler-baslik">
        <h2 id="belgeler-baslik">Belgeler</h2>
        <ul className="pilot__belgeler">
          {BELGELER.map(({ yol, ad, aciklama }) => (
            <li key={yol}>
              <a href={yol}>{ad}</a>
              <span className="pilot__aciklama">({aciklama})</span>
            </li>
          ))}
        </ul>
        <p className="pilot__aciklama">
          Tarayıcıdan yazdırın ya da PDF olarak kaydedin: A4, siyah beyaz, her biri tek sayfa.
        </p>
      </section>
    </main>
  )
}

/** Sayfanın başındaki uyarılar: günlük durdu, depo dolu, sınıf modu, okunamayan kayıt. */
function Uyarilar({ gunluk, ayarlar, dolu }: Durum) {
  const uyarilar: string[] = []
  if (gunluk.durum === 'erisilemiyor') {
    uyarilar.push("Bu tarayıcıda cihazın deposuna erişilemiyor: günlük yazılamaz.")
  }
  if (gunluk.durdu !== null) {
    const an = new Date(gunluk.durdu)
    uyarilar.push(
      `Günlük durdu: cihazın deposu doldu${
        Number.isNaN(an.getTime())
          ? ''
          : ` (${an.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })})`
      }. Yeni denemeler yazılmıyor; oyun sürüyor. CSV'yi indirip günlüğü silin.`,
    )
  } else if (dolu) {
    uyarilar.push(
      "Cihazın deposu dolu: yeni denemeler yazılamaz; oyun sürer. CSV'yi indirip günlüğü silin.",
    )
  }
  if (ayarlar.sinif === 'acik') {
    uyarilar.push("Sınıf modu açık: denemeler yazılmaz. Oyunun Ayarlar'ından kapatın.")
  }
  if (gunluk.durum === 'bozuk') {
    uyarilar.push('Günlük okunamıyor: kayıt bozuk. CSV\'ye alınamaz; Günlüğü sil ile temizlenebilir.')
  }
  if (gunluk.okunamayan > 0) {
    uyarilar.push(`${gunluk.okunamayan} satır okunamadı: CSV'ye girmez.`)
  }
  if (uyarilar.length === 0) return null
  return (
    <ul className="pilot__uyarilar" aria-label="Uyarılar">
      {uyarilar.map((uyari) => (
        <li key={uyari} className="pilot__uyari">
          {uyari}
        </li>
      ))}
    </ul>
  )
}

