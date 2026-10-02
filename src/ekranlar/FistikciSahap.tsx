// Fıstıkçı Şahap'ın Dükkânı (DESIGN.md, "Fıstıkçı Şahap'ın Dükkânı"). Bu bölgede çocuk ünlüyü
// değil, sınırdaki ünsüzü seçer: taş mı (sert), jöle mi (yumuşak)? Kelime ortada, sınır boş
// bir yuvadır; ek birleşen ek görünümündedir. Tezgâhta taş hep solda, jöle hep sağda. Çocuk
// karoyu yuvaya taşır: sürükle-bırak (Pointer Events), dokun-dokun (önce karo, sonra kelime)
// ya da klavye (Tab ve Enter).
//
// Doğruysa karo yuvaya oturur ve kelime dükkânın rafına dizilir. Ses değişiyorsa değişim
// görünür: yumuşamada kökün taşı jöleye erir (kitap → kitabım), benzeşmede ekin jölesi taşa
// döner (-da → kitapta); değişmiyorsa (topum, evde) karo yalnız yerine oturur. Yanlışsa karo
// seker ve tezgâha döner; nedeni kelimenin altında yazılır, ilgili iki ses vurgulanır. Ceza,
// puan ve süre yok.
//
// Oyunun durumu src/oyun/dukkan.ts'teki indirgeyicidedir; bu dosya görünümü ve hareketleri
// yazar. Hareketler Web Animations API iledir (hareket.ts); hareket azaltma açıksa hiçbiri
// oynamaz, yalnız durum değişir. Kabuk Bukalemun Koyu'nunkiyle aynıdır: çocuk kaldığı
// görevden sürdürür (baslangic), her görev bitince kabuk ilerlemeyi ve kartı kaydeder
// (onGorevBitti), görevler bitince ortak akşam ekranı açılır.
//
// Ses (DESIGN.md, "Ses ve resim"): sesli modda görev başlayınca kök söylenir; karo seçilince ya
// da sürüklenmeye başlayınca kuracağı kelime (kitapım, kitabım); doğruda efekt ve ardından
// kurulan kelime, yanlışta efekt ve neden cümlesi (Dokununca'da yalnız efektler). Doğruda
// kelimenin çevresinde yıldızcıklar parlar. Kökün resmi (emoji) kelime kartında.

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'
import { ekle, type Karo as KaroTuru, type Sinir } from '../motor/index.ts'
import EkYazisi from '../gorsel/EkYazisi.tsx'
import Karo from '../gorsel/Karo.tsx'
import { karoAdi, karoTuru } from '../gorsel/karo.ts'
import KokResmi from '../gorsel/KokResmi.tsx'
import { EtiketliKok } from '../gorsel/KokYazisi.tsx'
import UnluEtiketi from '../gorsel/UnluEtiketi.tsx'
import { UNLULER } from '../gorsel/cizim.ts'
import '../gorsel/tema.css'
import { useDenemeGunlugu } from '../kabuk/gunluk.tsx'
import type { Bolge } from '../oyun/bolgeler.ts'
import type { Gorev } from '../oyun/gorevler.ts'
import { nedenKodlari } from '../oyun/gunluk.ts'
import type { SozlukKarti } from '../oyun/ilerleme.ts'
import {
  TEZGAH,
  dogruMu,
  denemeyiDegerlendir,
  dukkanBaslangici,
  dukkanIndirgeyici,
  karoHarfi,
  oynananGorev,
  raftakiler,
  sesDegisti,
  type Deneme,
} from '../oyun/dukkan.ts'
import { Hoparlor, useSes, useSesliSoyleyis } from '../ses/Ses.tsx'
import AksamEkrani from './AksamEkrani.tsx'
import BolgeUstu from './BolgeUstu.tsx'
import { bekle, hareketAzMi, hareketleriKes, kaydir, oynat, type Nokta } from './hareket.ts'
import { parlat } from './parilti.ts'
import { SiradakiSimgesi } from './simgeler.tsx'
import './FistikciSahap.css'

/** Sürükleme sayılan en kısa yol (px); daha kısası dokunmadır. */
const SURUKLEME_ESIGI = 8
/** Kelime kartının çevresinde bırakmanın yine de kartta sayıldığı pay (px). */
const BIRAKMA_PAYI = 24
const DURAGAN: Nokta = { x: 0, y: 0 }

interface Surukleme {
  readonly karo: KaroTuru
  readonly isaretci: number
  readonly baslangic: Nokta
  kayma: Nokta
  suruklendi: boolean
}

export default function FistikciSahap({
  bolge,
  baslangic = 0,
  bugunkuKartlar = [],
  onGorevBitti,
  onHarita,
}: {
  /** Bölge tablosundaki satırı: ad, akşam ve görevler. */
  readonly bolge: Bolge
  /** Kalınan görevin yeri (0'dan); yalnız açılışta okunur. */
  readonly baslangic?: number
  /** Bölgede bugün kurulan kelimelerin kartları: akşam ekranında listelenir. */
  readonly bugunkuKartlar?: readonly SozlukKarti[]
  /** Bir görev bitti (kelime rafa dizildi): kabuk ilerlemeyi ve kartı kaydeder. */
  readonly onGorevBitti?: (gorev: Gorev) => void
  /** Haritaya dönüş; verilmezse düğmesi çıkmaz. */
  readonly onHarita?: () => void
}) {
  const { gorevler } = bolge
  const [durum, gonder] = useReducer(dukkanIndirgeyici, baslangic, (yer) =>
    dukkanBaslangici(gorevler, yer),
  )
  const gorev = oynananGorev(durum)
  const { sinir, evre } = durum
  // Yuvada görünen karo: doğru taşımada önce asıl ses (kökün taşı, ekin jölesi), değişim
  // canlandırılınca oturan karo. Yeni görevde boşalır.
  const [yuvadaki, setYuvadaki] = useState<KaroTuru | null>(null)

  const baslikRef = useRef<HTMLHeadingElement>(null)
  const kartRef = useRef<HTMLButtonElement>(null)
  const yuvaRef = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<HTMLUListElement>(null)
  const sonrakiRef = useRef<HTMLButtonElement>(null)
  const karolar = useRef(new Map<KaroTuru, HTMLButtonElement>())
  const surukleme = useRef<Surukleme | null>(null)
  const tiklamayiYut = useRef(false)
  const bagli = useRef(false)
  const gorulenGorev = useRef(durum.gorevYeri)
  const { soyle, sonuc } = useSes()
  const kaydet = useDenemeGunlugu(bolge.kimlik, gorev)

  // Sesli mod: görev başlayınca kök söylenir; bölgeye girişte önce bölgenin adı.
  const [acilisYeri] = useState(durum.gorevYeri)
  useSesliSoyleyis(
    gorev && evre !== 'kapanis'
      ? [...(durum.gorevYeri === acilisYeri ? [bolge.ad] : []), gorev.kok]
      : [],
    durum.gorevYeri,
  )

  useEffect(() => {
    bagli.current = true
    baslikRef.current?.focus()
    return () => {
      bagli.current = false
    }
  }, [])

  // Klavyeyle oynayan için odak: görev bitince Sıradaki'ye, yeni görevde tezgâhtaki taşa.
  // Akşam ekranı odağı kendi başlığına alır.
  useEffect(() => {
    if (evre === 'bitti') sonrakiRef.current?.focus()
  }, [evre])

  useEffect(() => {
    if (gorulenGorev.current === durum.gorevYeri) return
    gorulenGorev.current = durum.gorevYeri
    karolar.current.get(TEZGAH[0] ?? 'taş')?.focus()
  }, [durum.gorevYeri])

  if (evre === 'kapanis' || !gorev || !sinir) {
    return <AksamEkrani baslik={bolge.aksam} kartlar={bugunkuKartlar} onHarita={onHarita} />
  }

  const secimde = evre === 'secim'
  const kelime = ekle(gorev.kok, gorev.etiketler).bicim
  const oturan = durum.oturan
  const yuvaIcerigi = yuvadaki ? <Karo karo={yuvadaki} harf={karoHarfi(sinir, yuvadaki)} /> : null

  // --- Taşıma ---------------------------------------------------------------------------

  /** Karo yuvaya taşındı: doğruysa oturur, yanlışsa seker. */
  async function tasi(karo: KaroTuru, kayma: Nokta = DURAGAN) {
    if (!gorev || !sinir || evre !== 'secim') return
    const deneme = denemeyiDegerlendir(gorev, sinir, karo)
    // Pilotun günlüğü: seçilen karonun harfi ve kurduğu kelime.
    kaydet('sinir', {
      dogruBicim: kelime,
      secilen: karoHarfi(sinir, karo),
      aday: deneme.aday,
      dogru: dogruMu(deneme),
      neden: nedenKodlari(deneme.nedenler),
    })
    flushSync(() => gonder({ tur: 'dene', karo }))
    const oge = karolar.current.get(karo)
    if (dogruMu(deneme)) await otur(oge, karo, kayma)
    else await sek(oge, kayma, deneme.cumle)
  }

  /** Sesli mod: karonun kuracağı kelime (kitapım, kitabım). */
  function adayiSoyle(karo: KaroTuru) {
    if (gorev && sinir) soyle(denemeyiDegerlendir(gorev, sinir, karo).aday)
  }

  /** Karonun yuvanın üstüne geleceği kayma (translate). */
  function yuvaNoktasi(oge: HTMLElement, kayma: Nokta): Nokta {
    const yuva = yuvaRef.current?.getBoundingClientRect()
    if (!yuva) return kayma
    const kutu = oge.querySelector('.karo')?.getBoundingClientRect() ?? oge.getBoundingClientRect()
    const x = yuva.left + yuva.width / 2 - (kutu.left - kayma.x + kutu.width / 2)
    const y = yuva.top + yuva.height / 2 - (kutu.top - kayma.y + kutu.height / 2)
    return { x, y }
  }

  /** Karo tezgâhtan (ya da bırakıldığı yerden) yuvaya uçar. */
  async function yuvayaUc(oge: HTMLElement, kayma: Nokta): Promise<Nokta> {
    const hedef = yuvaNoktasi(oge, kayma)
    oge.style.transform = kaydir(hedef)
    await oynat(oge, [{ transform: kaydir(kayma) }, { transform: kaydir(hedef) }], {
      duration: 320,
      easing: 'cubic-bezier(.3, .7, .4, 1)',
    })
    return hedef
  }

  /**
   * Doğru taşıma: karo yuvaya oturur. Ses değişiyorsa yuvada önce asıl ses görünür, sonra
   * değişir: kökün taşı jöleye erir, ekin jölesi taşa döner. Kelime sonra rafa dizilir.
   */
  async function otur(oge: HTMLButtonElement | undefined, karo: KaroTuru, kayma: Nokta) {
    if (!sinir || !gorev) return
    if (oge && !hareketAzMi()) await yuvayaUc(oge, kayma)
    if (!bagli.current) return
    const degisir = sesDegisti(sinir, karo)
    flushSync(() => {
      setYuvadaki(degisir ? sinir.asil : karo)
      gonder({ tur: 'oturdu' })
    })
    // Doğru: efekt, ardından (sesli modda) kurulan kelime; kelimenin çevresinde parıltı.
    sonuc('dogru', denemeyiDegerlendir(gorev, sinir, karo).aday)
    parlat(kartRef.current?.querySelector('.dukkan__kelime'))
    if (oge) oge.style.transform = ''
    const yuva = yuvaRef.current
    if (degisir) {
      await bekle(380)
      // Taş erir: yayvanlaşıp çöker; jöle taşa döner: sıkışıp sertleşir.
      await oynat(
        yuva,
        karo === 'jöle'
          ? [
              { transform: 'scale(1, 1)' },
              { transform: 'scale(1.18, 0.7)', offset: 0.7 },
              { transform: 'scale(1.25, 0.5)' },
            ]
          : [
              { transform: 'scale(1) rotate(0deg)' },
              { transform: 'scale(0.86) rotate(-5deg)', offset: 0.5 },
              { transform: 'scale(0.8) rotate(4deg)' },
            ],
        { duration: 420, easing: 'ease-in' },
      )
      if (!bagli.current) return
      flushSync(() => setYuvadaki(karo))
      await oynat(
        yuva,
        karo === 'jöle'
          ? [
              { transform: 'scale(1.25, 0.5)' },
              { transform: 'scale(0.92, 1.1)', offset: 0.6 },
              { transform: 'scale(1, 1)' },
            ]
          : [
              { transform: 'scale(0.8)' },
              { transform: 'scale(1.08)', offset: 0.6 },
              { transform: 'scale(1)' },
            ],
        { duration: 360, easing: 'ease-out' },
      )
    } else {
      await oynat(yuva, [{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }], {
        duration: 220,
        easing: 'ease-out',
      })
    }
    await bekle(450)
    if (!bagli.current) return
    flushSync(() => gonder({ tur: 'rafa' }))
    // Görev bitti: kabuk hemen kaydeder. Sıradaki ve Harita artık tıklanabilir; raf hareketi
    // süsür, kayıt onu beklemez (sayfa bu arada kapanabilir).
    onGorevBitti?.(gorev)
    await oynat(
      rafRef.current?.lastElementChild,
      [
        { transform: 'translateY(-2.5rem) scale(0.6)', opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 380, easing: 'cubic-bezier(.3, .7, .4, 1.3)' },
    )
  }

  /** Yanlış taşıma: karo yuvanın üstünde seker, tezgâha döner; neden görünür. */
  async function sek(oge: HTMLButtonElement | undefined, kayma: Nokta, cumle: string) {
    if (oge && !hareketAzMi()) {
      const hedef = await yuvayaUc(oge, kayma)
      const yan = (dx: number, dy = 0) => kaydir({ x: hedef.x + dx, y: hedef.y + dy })
      await oynat(
        oge,
        [
          { transform: yan(0) },
          { transform: yan(-10, -8), offset: 0.2 },
          { transform: yan(9, -4), offset: 0.45 },
          { transform: yan(-6, -2), offset: 0.7 },
          { transform: yan(0) },
        ],
        { duration: 420, easing: 'ease-in-out' },
      )
      oge.style.transform = ''
      await oynat(oge, [{ transform: yan(0) }, { transform: 'none' }], {
        duration: 360,
        easing: 'cubic-bezier(.3, .7, .4, 1)',
      })
    }
    if (!bagli.current) return
    flushSync(() => gonder({ tur: 'sekti' }))
    sonuc('yanlis', cumle)
    if (oge) oge.style.transform = ''
  }

  /** Kelimenin dışına bırakılan karo yerine döner. */
  async function geriDon(oge: HTMLElement, kayma: Nokta) {
    oge.style.transform = ''
    await oynat(oge, [{ transform: kaydir(kayma) }, { transform: 'none' }], {
      duration: 240,
      easing: 'ease-out',
    })
  }

  function sonrakiGorev() {
    setYuvadaki(null)
    gonder({ tur: 'sonraki' })
  }

  // --- Sürükle-bırak (Pointer Events) -----------------------------------------------------

  function kartinUstunde(x: number, y: number): boolean {
    const kutu = kartRef.current?.getBoundingClientRect()
    return (
      kutu !== undefined &&
      x >= kutu.left - BIRAKMA_PAYI &&
      x <= kutu.right + BIRAKMA_PAYI &&
      y >= kutu.top - BIRAKMA_PAYI &&
      y <= kutu.bottom + BIRAKMA_PAYI
    )
  }

  function tutmaBasladi(e: PointerEvent<HTMLButtonElement>, karo: KaroTuru) {
    tiklamayiYut.current = false
    if (!secimde || !e.isPrimary || e.button !== 0) return
    const oge = e.currentTarget
    hareketleriKes(oge)
    oge.style.transform = ''
    try {
      oge.setPointerCapture(e.pointerId)
    } catch {
      // İşaretçi artık yok; sürükleme yine de öğenin olaylarıyla sürer.
    }
    surukleme.current = {
      karo,
      isaretci: e.pointerId,
      baslangic: { x: e.clientX, y: e.clientY },
      kayma: DURAGAN,
      suruklendi: false,
    }
  }

  function tutmaSurdu(e: PointerEvent<HTMLButtonElement>) {
    const s = surukleme.current
    if (!s || s.isaretci !== e.pointerId) return
    s.kayma = { x: e.clientX - s.baslangic.x, y: e.clientY - s.baslangic.y }
    if (!s.suruklendi) {
      if (Math.hypot(s.kayma.x, s.kayma.y) < SURUKLEME_ESIGI) return
      s.suruklendi = true
      e.currentTarget.classList.add('tezgah__karo--tasiniyor')
      adayiSoyle(s.karo)
    }
    e.currentTarget.style.transform = kaydir(s.kayma)
    kartRef.current?.classList.toggle('dukkan__kart--ustunde', kartinUstunde(e.clientX, e.clientY))
  }

  function tutmaBitti(e: PointerEvent<HTMLButtonElement>, iptal: boolean) {
    const s = surukleme.current
    if (!s || s.isaretci !== e.pointerId) return
    surukleme.current = null
    const oge = e.currentTarget
    oge.classList.remove('tezgah__karo--tasiniyor')
    kartRef.current?.classList.remove('dukkan__kart--ustunde')
    if (!s.suruklendi) return
    // Sürüklemenin sonundaki tıklama seçim sayılmaz.
    tiklamayiYut.current = true
    if (!iptal && kartinUstunde(e.clientX, e.clientY)) void tasi(s.karo, s.kayma)
    else void geriDon(oge, s.kayma)
  }

  // --- Dokun-dokun ve klavye ----------------------------------------------------------------

  function karoyaDokunuldu(e: MouseEvent<HTMLButtonElement>, karo: KaroTuru) {
    // Klavyenin tıklamasında detail 0'dır; o hiç yutulmaz.
    const yut = tiklamayiYut.current && e.detail !== 0
    tiklamayiYut.current = false
    if (yut || !secimde) return
    const secilecek = durum.secili !== karo
    gonder({ tur: 'sec', karo })
    if (secilecek) adayiSoyle(karo)
    // Seçilen karo yuvaya götürülmeyi bekler: odak kelime kartına geçer.
    if (secilecek) kartRef.current?.focus()
  }

  function kartaDokunuldu() {
    if (secimde && durum.secili !== null) void tasi(durum.secili)
  }

  function tusaBasildi(e: KeyboardEvent) {
    if (e.key !== 'Escape' || durum.secili === null) return
    const secili = durum.secili
    gonder({ tur: 'sec', karo: secili })
    karolar.current.get(secili)?.focus()
  }

  // --- Görünüm ----------------------------------------------------------------------------

  const kartAdi = oturan ? oturan.aday : `${sinir.sol} … ${sinir.sag}`
  const raf = raftakiler(durum)
  const degisim = evre === 'bitti' && oturan && sesDegisti(sinir, oturan.karo)

  return (
    <main className="dukkan" onKeyDown={tusaBasildi}>
      <BolgeUstu
        ad={bolge.ad}
        gorevYeri={durum.gorevYeri}
        gorevSayisi={gorevler.length}
        onHarita={onHarita}
        baslikRef={baslikRef}
      />
      <p id="dukkan-yonerge" className="gizli">
        Bir karoyu kelimedeki boş yuvaya taşı: sürükle, ya da önce karoya sonra kelimeye dokun. Taş
        sert, jöle yumuşak.
      </p>

      <section className="dukkan__sahne" aria-label="Kelime">
        <div className="dukkan__kartyeri">
          <KokResmi kok={gorev.kok} sinif="dukkan__resim" />
          <Hoparlor metin={oturan ? oturan.aday : gorev.kok} sinif="hoparlor--kose" />
          <button
            ref={kartRef}
            type="button"
            className={durum.secili !== null ? 'dukkan__kart dukkan__kart--hedef' : 'dukkan__kart'}
            aria-label={kartAdi}
            aria-describedby="dukkan-yonerge"
            onClick={kartaDokunuldu}
          >
            <KelimeYuvasi
              sinir={sinir}
              kok={gorev.kok}
              etiketler={gorev.etiketler}
              yuva={
                <span
                  ref={yuvaRef}
                  className={yuvaIcerigi ? 'yuva yuva--dolu' : 'yuva'}
                  aria-hidden="true"
                >
                  {yuvaIcerigi}
                </span>
              }
            />
          </button>
        </div>
        <div className="dukkan__alt">
          <div className="dukkan__neden" role="status">
            {durum.yanlis && <NedenYazisi deneme={durum.yanlis} />}
            {degisim && (
              <p className="dukkan__degisim">
                {sinir.yer === 'gövde'
                  ? `${gorev.kok} → ${oturan.aday}`
                  : `-${asilEk(sinir)} → ${oturan.aday}`}
              </p>
            )}
          </div>
          {evre === 'bitti' && (
            <button ref={sonrakiRef} type="button" className="dukkan__dugme" onClick={sonrakiGorev}>
              <SiradakiSimgesi />
              Sıradaki
            </button>
          )}
          <p className="gizli" role="status">
            {evre === 'bitti' ? kelime : ''}
          </p>
        </div>
      </section>

      <ul className="tezgah" aria-label="Tezgâh">
        {TEZGAH.map((karo) => {
          const harf = karoHarfi(sinir, karo)
          const siniflar = [
            'tezgah__karo',
            durum.deneme?.karo === karo && 'tezgah__karo--etkin',
            oturan?.karo === karo && 'tezgah__karo--oturdu',
          ]
          return (
            <li key={`${durum.gorevYeri}:${karo}`} className="tezgah__yer">
              <button
                ref={(oge) => {
                  if (!oge) return
                  karolar.current.set(karo, oge)
                  return () => {
                    if (karolar.current.get(karo) === oge) karolar.current.delete(karo)
                  }
                }}
                type="button"
                className={siniflar.filter(Boolean).join(' ')}
                aria-label={karoAdi(harf, karo)}
                aria-pressed={durum.secili === karo}
                aria-disabled={!secimde}
                onClick={(e) => karoyaDokunuldu(e, karo)}
                onPointerDown={(e) => tutmaBasladi(e, karo)}
                onPointerMove={tutmaSurdu}
                onPointerUp={(e) => tutmaBitti(e, false)}
                onPointerCancel={(e) => tutmaBitti(e, true)}
              >
                <Karo karo={karo} harf={harf} />
                <span className="tezgah__tur" aria-hidden="true">
                  {karoTuru(karo)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <section className="raf" aria-label="Raf">
        <ul className="raf__kelimeler" ref={rafRef}>
          {raf.map((k, i) => (
            <li key={`${i}:${k}`} className="raf__kelime">
              {k}
            </li>
          ))}
        </ul>
        <div className="raf__tahta" aria-hidden="true" />
      </section>
    </main>
  )
}

/** Ekin kendi (kuraldan önceki) yüzeyi: ek başında jöle (kitap + da → kitapta). */
function asilEk(sinir: Sinir): string {
  const yer = sinir.konum - sinir.parca.govde.length
  const { yuzey } = sinir.parca
  return yuzey.slice(0, yer) + sinir.jole + yuzey.slice(yer + 1)
}

/**
 * Kelime kartındaki yazı: kök (son ünlüsü etikette), ekler birleşen ek görünümünde; sınırda
 * yuva. Gövde sınırında yuva kökün son sesinin yerindedir (kita_ım), ek başında ekin kutusunun
 * içinde (kitap + _a).
 */
function KelimeYuvasi({
  sinir,
  kok,
  etiketler,
  yuva,
}: {
  sinir: Sinir
  kok: string
  etiketler: readonly string[]
  yuva: ReactNode
}) {
  const { parcalar } = ekle(kok, etiketler)
  const ilk = parcalar[0]
  const govde = ilk?.govde ?? kok
  return (
    <span className="dukkan__kelime" aria-hidden="true">
      {sinir.yer === 'gövde' ? (
        <>
          <EtiketliKok kok={govde.slice(0, -1)} />
          {yuva}
        </>
      ) : (
        <EtiketliKok kok={govde} />
      )}
      {parcalar.map((parca, i) =>
        sinir.yer === 'ek başı' && i === sinir.ekSirasi ? (
          <EkYazisi
            key={parca.etiket}
            parca={parca}
            yuva={{ konum: sinir.konum - parca.govde.length, icerik: yuva }}
          />
        ) : (
          <EkYazisi key={parca.etiket} parca={parca} />
        ),
      )}
    </span>
  )
}

const unluMu = (harf: string | undefined): harf is keyof typeof UNLULER =>
  harf !== undefined && Object.hasOwn(UNLULER, harf)

/** Yanlış taşımanın nedeni: aday, ilgili iki sesi vurgulu; altında cümle. */
function NedenYazisi({ deneme }: { deneme: Deneme }) {
  const { aday, ilgili } = deneme
  const harfler = [...aday]
  return (
    <>
      <p className="dukkan__aday" aria-hidden="true">
        {harfler.map((harf, i) => {
          if (!ilgili?.includes(i)) return harf
          return unluMu(harf) ? (
            <UnluEtiketi key={i} unlu={harf} />
          ) : (
            <span key={i} className="dukkan__ses">
              {harf}
            </span>
          )
        })}
      </p>
      {deneme.cumle && (
        <p className="dukkan__cumle sesli-cumle">
          <Hoparlor metin={deneme.cumle} />
          <span>{deneme.cumle}</span>
        </p>
      )}
    </>
  )
}
