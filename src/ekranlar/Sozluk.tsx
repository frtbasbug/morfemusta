// Sözlük (DESIGN.md, "Sözlük"): doğru kurulan her kelime bir karttır. Kartlar bölgelere göre
// gruplu, bölge tablosunun sırasıyla; her grupta en yeni kart önde. Kartta kelime, kök ve
// ekler (Bukalemun Koyu'ndaki birleşen ek görünümüyle: kökün son ünlüsü ve ekin ünlüsü
// etikette, uyum etiketlerin eninden okunur), bölge ve tarih. Ekler ve biçim motordan gelir
// (ekle); kartta kelime, kök ve ek etiketleri saklıdır. Uydurma kökte kelime çocuğun seçtiği
// biçimdir (pıtağım ya da pıtakım); parçaları o biçimden okunur. Kökün resmi (emoji) kelimenin
// yanında; uydurma kökte resim yok, köşede yaratık var. Sesli modda karta dokununca kelime
// söylenir; Dokununca'da kartın hoparlörü çalar.
//
// Kök ve ek satırı kırılmaz: parçaları bir sütuna sığmayan kart (dar ekranda toplarım, topum)
// iki sütun genişliğinde durur (genisKartlar). Ölçü yerleşimden sonra alınır; ekran dönünce
// yeniden alınır.
//
// Sınıf modunda (geniş yatay ekran, Sinif.css) bölgeler yan yana durur. Kartlar çoğalıp sayfa
// kaymaya başlayınca Sözlük bölge bölge olur: üstte bölgelerin sekmeleri (kart sayılarıyla),
// seçili bölgenin kartları ekrana sığan sayfalarda, altta Önceki / Sonraki. Tahtada kaydırma
// yok; sayfanın boyu ölçülür (sayfaBoyu).

import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { KOK_SOZLUGU } from '../motor/index.ts'
import EkYazisi from '../gorsel/EkYazisi.tsx'
import KokResmi from '../gorsel/KokResmi.tsx'
import KokYazisi from '../gorsel/KokYazisi.tsx'
import { kurulanEkleme } from '../gorsel/KurulanKelime.tsx'
import Yaratik from '../gorsel/Yaratik.tsx'
import type { Bolge } from '../oyun/bolgeler.ts'
import type { SozlukGrubu, SozlukKarti } from '../oyun/ilerleme.ts'
import { Hoparlor, useSes } from '../ses/Ses.tsx'
import { useSinifModu } from './SinifIsareti.tsx'
import { OncekiSimgesi, SiradakiSimgesi } from './simgeler.tsx'
import './Sozluk.css'

const TARIH = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

/** Yerel gün, <time> için: 2026-09-28. */
function gunYazisi(an: Date): string {
  const iki = (n: number) => String(n).padStart(2, '0')
  return `${an.getFullYear()}-${iki(an.getMonth() + 1)}-${iki(an.getDate())}`
}

/**
 * Parçaları bir sütuna sığmayan kartları iki sütuna açar (data-genis). Liste en az iki sütunsa
 * geçerlidir; tek sütunda kart zaten bütün endedir. Parçalar bölünmez öğelerdir (kök, artı,
 * ek): doğal enleri toplanır, sütunun içine sığıp sığmadığına bakılır.
 */
function genisKartlar(liste: HTMLElement): void {
  // Önceki ölçümün geniş kartları önce kalkar: iki sütunluk kart tek sütunlu ızgarada örtük bir
  // ikinci sütun açar, sütun sayısı yanlış okunurdu (ekran daralınca).
  for (const yer of liste.children) if (yer instanceof HTMLElement) delete yer.dataset.genis
  const sutunlar = getComputedStyle(liste).gridTemplateColumns.split(' ').map(parseFloat)
  const sutun = sutunlar[0] ?? 0
  for (const yer of liste.children) {
    if (!(yer instanceof HTMLElement)) continue
    const kart = yer.firstElementChild
    const parcalar = kart?.querySelector<HTMLElement>('.sozluk-karti__parcalar')
    if (!(kart instanceof HTMLElement) || !parcalar) continue
    const aralik = parseFloat(getComputedStyle(parcalar).columnGap) || 0
    const ogeler = [...parcalar.children]
    const dogal =
      ogeler.reduce((toplam, oge) => toplam + oge.getBoundingClientRect().width, 0) +
      aralik * Math.max(0, ogeler.length - 1)
    const kenar = kart.offsetWidth - parcalar.clientWidth
    const genis = sutunlar.length > 1 && dogal + kenar > sutun + 0.5
    if (genis) yer.dataset.genis = ''
  }
}

/** Sınıf modunun geniş görünümü: Sinif.css'teki sorgu (etkileşimli tahta). */
const GENIS_EKRAN = '(min-width: 1024px) and (orientation: landscape)'

/** Medya sorgusu tutuyor mu; değişince yeniden çizilir. Tarayıcı dışında (birim testi) false. */
function useMedyaSorgusu(sorgu: string): boolean {
  const [tutuyor, setTutuyor] = useState(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(sorgu).matches,
  )
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const sorguListesi = window.matchMedia(sorgu)
    const degisti = () => setTutuyor(sorguListesi.matches)
    degisti()
    sorguListesi.addEventListener('change', degisti)
    return () => sorguListesi.removeEventListener('change', degisti)
  }, [sorgu])
  return tutuyor
}

/** Sayfa kayıyor mu (içerik ekrandan uzun). */
const sayfaKayiyor = (): boolean => {
  const kok = document.documentElement
  return kok.scrollHeight > kok.clientHeight + 1
}

/**
 * Bir sayfaya sığan kart sayısı: listenin sütunları ve satır boyu (bölge bölge görünümde satırlar
 * sabit boydadır, Sinif.css) ile listenin yüksekliğinden.
 */
function sayfaBoyu(liste: HTMLElement): number {
  const stil = getComputedStyle(liste)
  const sutun = stil.gridTemplateColumns.split(' ').filter(Boolean).length
  const satirBoyu = parseFloat(stil.gridAutoRows)
  const aralik = parseFloat(stil.rowGap) || 0
  if (!(satirBoyu > 0)) return Number.POSITIVE_INFINITY
  const satir = Math.floor((liste.clientHeight + aralik) / (satirBoyu + aralik))
  return Math.max(1, sutun) * Math.max(1, satir)
}

export default function Sozluk({ gruplar }: { readonly gruplar: readonly SozlukGrubu[] }) {
  const baslikRef = useRef<HTMLHeadingElement>(null)
  const anaRef = useRef<HTMLElement>(null)
  const sinif = useSinifModu()
  const genis = useMedyaSorgusu(GENIS_EKRAN)
  // Sınıf modunda yan yana bölgeler ekrana sığmadı: bölge bölge, sayfalı.
  const [sigmadi, setSigmadi] = useState(false)
  const bolumlu = sinif && genis && sigmadi && gruplar.length > 0

  useEffect(() => {
    baslikRef.current?.focus()
  }, [])

  // Kartların eni: yerleşimden sonra ve ekranın boyu değişince (döndürme, yazı tipi yüklenince).
  // Sınıf modunun geniş görünümünde sayfa kayarsa bölge bölge görünüme geçilir.
  useLayoutEffect(() => {
    const ana = anaRef.current
    if (!ana || bolumlu) return
    const olc = () => {
      for (const liste of ana.querySelectorAll<HTMLElement>('.sozluk__kartlar')) genisKartlar(liste)
      if (sinif && genis && sayfaKayiyor()) setSigmadi(true)
    }
    olc()
    const gozlemci = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(olc)
    gozlemci?.observe(ana)
    void document.fonts?.ready.then(olc)
    return () => gozlemci?.disconnect()
  }, [gruplar, bolumlu, sinif, genis])

  return (
    <main
      className={bolumlu ? 'sozluk sozluk--bolumlu' : 'sozluk'}
      aria-labelledby="sozluk-baslik"
      ref={anaRef}
    >
      <h1 id="sozluk-baslik" className="ekran-basligi" ref={baslikRef} tabIndex={-1}>
        Sözlük
      </h1>
      {bolumlu ? (
        <BolumluSozluk gruplar={gruplar} />
      ) : gruplar.length === 0 ? (
        <p className="sozluk__bos">Sözlüğün henüz boş. Bir kelime kurunca kartı buraya gelir.</p>
      ) : (
        gruplar.map(({ bolge, kartlar }) => (
          <section
            key={bolge.kimlik}
            className="sozluk__grup"
            aria-labelledby={`sozluk-${bolge.kimlik}`}
            // Sınıf modunda gruplar yan yana durur, kart sayısıyla orantılı genişlikte (Sinif.css).
            style={{ '--kart-sayisi': kartlar.length } as CSSProperties}
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

/**
 * Sınıf modunda sığmayan Sözlük: bölgelerin sekmeleri (kart sayılarıyla) ve seçili bölgenin
 * kartları sayfa sayfa. Sayfanın boyu listenin ölçüsünden (sayfaBoyu); sayfa çubuğunun yeri hep
 * ayrılmıştır, tek sayfada düğmeler görünmez.
 */
function BolumluSozluk({ gruplar }: { readonly gruplar: readonly SozlukGrubu[] }) {
  const [secili, setSecili] = useState<string | null>(null)
  const [sayfa, setSayfa] = useState(0)
  const [boy, setBoy] = useState(Number.POSITIVE_INFINITY)
  const listeRef = useRef<HTMLUListElement>(null)
  const grup = gruplar.find((g) => g.bolge.kimlik === secili) ?? gruplar[0]

  useLayoutEffect(() => {
    const liste = listeRef.current
    if (!liste) return
    const olc = () => setBoy(sayfaBoyu(liste))
    olc()
    const gozlemci = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(olc)
    gozlemci?.observe(liste)
    void document.fonts?.ready.then(olc)
    return () => gozlemci?.disconnect()
  }, [])

  if (!grup) return null
  const sayfaSayisi = Number.isFinite(boy) ? Math.max(1, Math.ceil(grup.kartlar.length / boy)) : 1
  const gecerli = Math.min(sayfa, sayfaSayisi - 1)
  const gorunen = Number.isFinite(boy)
    ? grup.kartlar.slice(gecerli * boy, (gecerli + 1) * boy)
    : grup.kartlar
  const { bolge } = grup

  return (
    <>
      <div className="sozluk__sekmeler" role="group" aria-label="Bölgeler">
        {gruplar.map((g) => (
          <button
            key={g.bolge.kimlik}
            type="button"
            className="sozluk__sekme"
            aria-pressed={g.bolge.kimlik === bolge.kimlik}
            onClick={() => {
              setSecili(g.bolge.kimlik)
              setSayfa(0)
            }}
          >
            {g.bolge.ad}
            <span className="sozluk__sayi">{g.kartlar.length}</span>
          </button>
        ))}
      </div>
      <section className="sozluk__grup" aria-labelledby={`sozluk-${bolge.kimlik}`}>
        <h2 id={`sozluk-${bolge.kimlik}`} className="gizli">
          {bolge.ad}
        </h2>
        <ul className="sozluk__kartlar" ref={listeRef}>
          {gorunen.map((kart) => (
            <li key={kart.kelime}>
              <Kart kart={kart} bolge={bolge} />
            </li>
          ))}
        </ul>
        <nav
          className={sayfaSayisi > 1 ? 'sozluk__sayfalar' : 'sozluk__sayfalar sozluk__sayfalar--tek'}
          aria-label="Sayfalar"
        >
          <button
            type="button"
            className="sozluk__sayfa-dugmesi"
            disabled={gecerli === 0}
            onClick={() => setSayfa(gecerli - 1)}
          >
            <OncekiSimgesi />
            Önceki
          </button>
          <span className="sozluk__sayfa" aria-live="polite">
            {gecerli + 1} / {sayfaSayisi}
          </span>
          <button
            type="button"
            className="sozluk__sayfa-dugmesi"
            disabled={gecerli + 1 >= sayfaSayisi}
            onClick={() => setSayfa(gecerli + 1)}
          >
            Sonraki
            <SiradakiSimgesi />
          </button>
        </nav>
      </section>
    </>
  )
}

/**
 * Sözlük kartı: kelime; kök ve ekler; bölge ve tarih. Uydurma kelimenin (kökü sözlükte yok)
 * kartının köşesinde küçük bir yaratık işareti var.
 */
function Kart({ kart, bolge }: { kart: SozlukKarti; bolge: Bolge }) {
  const { parcalar } = kurulanEkleme(kart.kok, kart.etiketler, kart.kelime)
  const tarih = new Date(kart.tarih)
  const uydurma = !KOK_SOZLUGU.has(kart.kok)
  const { soyle } = useSes()
  return (
    <article
      className={uydurma ? 'sozluk-karti sozluk-karti--uydurma' : 'sozluk-karti'}
      onClick={() => soyle(kart.kelime)}
    >
      {uydurma && (
        <span className="sozluk-karti__yaratik">
          <Yaratik kok={kart.kok} boyut={0.36} adsiz />
          <span className="gizli">Uydurma kelime</span>
        </span>
      )}
      <h3 className="sozluk-karti__kelime">
        <KokResmi kok={kart.kok} sinif="sozluk-karti__resim" />
        {kart.kelime}
      </h3>
      <Hoparlor metin={kart.kelime} sinif="sozluk-karti__hoparlor" />
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
