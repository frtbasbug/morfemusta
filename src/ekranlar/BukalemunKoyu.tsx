// Bukalemun Koyu: ilk oyun ekranı (DESIGN.md, "Bukalemun Koyu"). Ekranın ortasında kelime
// kartı, altındaki kıyıda bukalemunlar. Çocuk doğru bukalemunu köke taşır: sürükle-bırak
// (Pointer Events), dokun-dokun (önce bukalemun, sonra kelime) ya da klavye (Tab ve Enter).
//
// Doğruysa büyü olur: kökteki ünlü ile bukalemun arasında bir yay parlar, bukalemun sevinçle
// zıplar, kelime birleşir ve ek bukalemunun renginde kalır. Sonra anlam resimsiz görünür:
// çoğulda kart üçe çoğalır, iyelikte ekranın altındaki cebe girer. Yanlışsa bukalemun eğilir,
// düşer, kıyıya döner; nedeni kelimenin altında yazılır, ilgili iki ünlü etiketlenir. Ceza,
// puan ve süre yok. Ağız hiçbir durumda değişmez (DESIGN.md, "Üç kural").
//
// Oyunun durumu src/oyun/koy.ts'teki indirgeyicidedir; bu dosya görünümü ve hareketleri yazar.
// Hareketler Web Animations API iledir (hareket.ts); hareket azaltma açıksa hiçbiri oynamaz,
// yalnız renk ve yazı değişir.
//
// Bölgenin adı ve akşamı bölge tablosundandır (icerik/bolgeler.csv). Çocuk kaldığı görevden
// sürdürür (baslangic); her görev bitince kabuk ilerlemeyi kaydeder (onGorevBitti). Görevler
// bitince akşam olur: ortak akşam ekranı, o bölgede bugün kurulan kelimelerle.

import {
  useEffect,
  useReducer,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { flushSync } from 'react-dom'
import type { EkParcasi } from '../motor/index.ts'
import Bukalemun from '../gorsel/Bukalemun.tsx'
import { CEP_DIKISI, CEP_GOVDESI } from '../gorsel/cep.ts'
import { BUKALEMUN_KUTUSU, bukalemunCizimi } from '../gorsel/cizim.ts'
import EkYazisi from '../gorsel/EkYazisi.tsx'
import { bukalemunKiligi } from '../gorsel/kilik.ts'
import KokYazisi from '../gorsel/KokYazisi.tsx'
import KurulanKelime from '../gorsel/KurulanKelime.tsx'
import UnluEtiketi from '../gorsel/UnluEtiketi.tsx'
import '../gorsel/tema.css'
import type { Bolge } from '../oyun/bolgeler.ts'
import type { Gorev } from '../oyun/gorevler.ts'
import type { SozlukKarti } from '../oyun/ilerleme.ts'
import {
  ANLAM_ETKILERI,
  denemeyiDegerlendir,
  dogruMu,
  koyBaslangici,
  koyIndirgeyici,
  oynananGorev,
  type Deneme,
  type Secenek,
} from '../oyun/koy.ts'
import AksamEkrani from './AksamEkrani.tsx'
import BolgeUstu from './BolgeUstu.tsx'
import { bekle, hareketAzMi, hareketleriKes, kaydir, oynat, type Nokta } from './hareket.ts'
import './BukalemunKoyu.css'

/** Sürükleme sayılan en kısa yol (px); daha kısası dokunmadır. */
const SURUKLEME_ESIGI = 8
/** Kelime kartının çevresinde bırakmanın yine de kartta sayıldığı pay (px). */
const BIRAKMA_PAYI = 24
const DURAGAN: Nokta = { x: 0, y: 0 }


interface Surukleme {
  readonly yuzey: string
  readonly isaretci: number
  readonly baslangic: Nokta
  kayma: Nokta
  suruklendi: boolean
}

export default function BukalemunKoyu({
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
  /** Bir görev bitti (son ekin büyüsü oldu): kabuk ilerlemeyi ve kartı kaydeder. */
  readonly onGorevBitti?: (gorev: Gorev) => void
  /** Haritaya dönüş; verilmezse düğmesi çıkmaz. */
  readonly onHarita?: () => void
}) {
  const { gorevler } = bolge
  const [durum, gonder] = useReducer(koyIndirgeyici, baslangic, (yer) =>
    koyBaslangici(gorevler, yer),
  )
  const gorev = oynananGorev(durum)
  const { adim, evre } = durum

  const baslikRef = useRef<HTMLHeadingElement>(null)
  const kartRef = useRef<HTMLButtonElement>(null)
  const kartlarRef = useRef<HTMLDivElement>(null)
  const yayRef = useRef<SVGSVGElement>(null)
  const sonrakiRef = useRef<HTMLButtonElement>(null)
  const bukalemunlar = useRef(new Map<string, HTMLButtonElement>())
  const surukleme = useRef<Surukleme | null>(null)
  const tiklamayiYut = useRef(false)
  const bagli = useRef(false)
  const gorulenGorev = useRef(durum.gorevYeri)

  useEffect(() => {
    bagli.current = true
    baslikRef.current?.focus()
    return () => {
      bagli.current = false
    }
  }, [])

  // Klavyeyle oynayan için odak: görev bitince Sıradaki'ye, yeni görevde kıyıdaki ilk
  // bukalemuna. Akşam ekranı odağı kendi başlığına alır.
  useEffect(() => {
    if (evre === 'bitti') sonrakiRef.current?.focus()
  }, [evre])

  useEffect(() => {
    if (gorulenGorev.current === durum.gorevYeri) return
    gorulenGorev.current = durum.gorevYeri
    const ilk = durum.adim?.secenekler[0]
    if (ilk) bukalemunlar.current.get(ilk.yuzey)?.focus()
  }, [durum.gorevYeri, durum.adim])

  if (evre === 'kapanis' || !gorev || !adim) {
    return <AksamEkrani baslik={bolge.aksam} kartlar={bugunkuKartlar} onHarita={onHarita} />
  }

  const secimde = evre === 'secim'
  const { birlesen } = durum
  const kelime = birlesen ? birlesen.govde + birlesen.yuzey : adim.govde
  const kelimeYazisi = <KelimeYazisi govde={birlesen?.govde ?? adim.govde} ek={birlesen} />

  // --- Taşıma ---------------------------------------------------------------------------

  /** Bukalemun köke taşındı: doğruysa büyü, yanlışsa düşüş. */
  async function tasi(yuzey: string, kayma: Nokta = DURAGAN) {
    if (!gorev || !adim || evre !== 'secim') return
    const secenek = adim.secenekler.find((s) => s.yuzey === yuzey)
    if (!secenek) return
    const dogru = dogruMu(denemeyiDegerlendir(gorev, adim, yuzey))
    const etki = ANLAM_ETKILERI[adim.etiket]
    flushSync(() => gonder({ tur: 'dene', yuzey }))
    const oge = bukalemunlar.current.get(yuzey)
    if (dogru) await buyu(oge, secenek, kayma, etki)
    else await dusus(oge, kayma)
  }

  /** Bukalemunun kelimenin sonuna yapışacağı yer: kaymaya göre (translate). */
  function yapismaNoktasi(oge: HTMLElement, kayma: Nokta): Nokta {
    const kelimeOgesi = kartRef.current?.querySelector('.kelime') ?? kartRef.current
    const kelimeKutusu = kelimeOgesi?.getBoundingClientRect()
    if (!kelimeKutusu) return kayma
    const kutu = oge.getBoundingClientRect()
    const taban = { x: kutu.left - kayma.x, y: kutu.top - kayma.y }
    const sagSinir = document.documentElement.clientWidth - 4
    const sol = Math.max(4, Math.min(kelimeKutusu.right - 4, sagSinir - kutu.width))
    const ust = kelimeKutusu.top + kelimeKutusu.height / 2 - kutu.height * 0.58
    return { x: sol - taban.x, y: ust - taban.y }
  }

  /** Bukalemun kıyıdan (ya da bırakıldığı yerden) kelimenin sonuna uçar. */
  async function kelimeyeUc(oge: HTMLElement, kayma: Nokta): Promise<Nokta> {
    const hedef = yapismaNoktasi(oge, kayma)
    oge.style.transform = kaydir(hedef)
    await oynat(oge, [{ transform: kaydir(kayma) }, { transform: kaydir(hedef) }], {
      duration: 340,
      easing: 'cubic-bezier(.3, .7, .4, 1)',
    })
    return hedef
  }

  /** Doğru taşıma: yay parlar, bukalemun zıplar, kelime birleşir; sonra anlam etkisi. */
  async function buyu(
    oge: HTMLButtonElement | undefined,
    secenek: Secenek,
    kayma: Nokta,
    etki: string | undefined,
  ) {
    if (oge && !hareketAzMi()) {
      const hedef = await kelimeyeUc(oge, kayma)
      await yayiParlat(oge, secenek.parca)
      // Sevinç zıplamayla anlatılır; ağız değişmez.
      const yukarida = (dy: number) => kaydir({ x: hedef.x, y: hedef.y - dy })
      await oynat(
        oge,
        [
          { transform: yukarida(0) },
          { transform: yukarida(22), offset: 0.25 },
          { transform: yukarida(0), offset: 0.5 },
          { transform: yukarida(12), offset: 0.72 },
          { transform: yukarida(0) },
        ],
        { duration: 560, easing: 'ease-in-out' },
      )
      // Kelimeye karışır.
      oge.style.opacity = '0'
      await oynat(
        oge,
        [
          { transform: kaydir(hedef), opacity: 1 },
          { transform: `${kaydir(hedef)} scale(0.4)`, opacity: 0 },
        ],
        { duration: 180, easing: 'ease-in' },
      )
    }
    if (!bagli.current) return
    flushSync(() => gonder({ tur: 'birlesti' }))
    await oynat(
      kartRef.current?.querySelector('.ek-yazisi'),
      [
        { transform: 'scale(0.3)', opacity: 0 },
        { transform: 'scale(1.15)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      { duration: 300, easing: 'ease-out' },
    )
    await bekle(200)
    if (!bagli.current) return
    if (etki === 'cebe girer') {
      await cebeKoy()
    } else {
      flushSync(() => gonder({ tur: 'etki' }))
      if (etki === 'çoğalır') await cogalt()
    }
    await bekle(etki ? 400 : 0)
    if (!bagli.current) return
    flushSync(() => gonder({ tur: 'adimBitti' }))
    // Son ekin büyüsü oldu: görev bitti, kabuk kaydeder.
    if (gorev && adim && adim.sira + 1 === gorev.etiketler.length) onGorevBitti?.(gorev)
  }

  /** Kökteki ünlünün etiketi ile bukalemunun gözü arasında bir yay parlar. */
  async function yayiParlat(oge: HTMLElement, parca: EkParcasi) {
    const yay = yayRef.current
    const etiket = kartRef.current?.querySelector('.unlu-etiketi')
    if (!yay || !etiket) return
    const e = etiket.getBoundingClientRect()
    const b = oge.getBoundingClientRect()
    const { ozellikler } = bukalemunKiligi(parca)
    const { goz } = bukalemunCizimi(ozellikler)
    const bas = { x: e.left + e.width / 2, y: e.top }
    const son = {
      x: b.left + (goz.x / BUKALEMUN_KUTUSU.en) * b.width,
      y: b.top + (goz.y / BUKALEMUN_KUTUSU.boy) * b.height,
    }
    const tepe = {
      x: (bas.x + son.x) / 2,
      y: Math.min(bas.y, son.y) - Math.max(36, Math.abs(son.x - bas.x) * 0.4),
    }
    const yollar = [...yay.querySelectorAll('path')]
    const d = `M${bas.x} ${bas.y}Q${tepe.x} ${tepe.y} ${son.x} ${son.y}`
    for (const yol of yollar) yol.setAttribute('d', d)
    const uzunluk = `${yollar[0]?.getTotalLength() ?? 0}`
    yay.classList.toggle('koy__yay--ince', !ozellikler.kalin)
    yay.classList.add('koy__yay--gorunur')
    await Promise.all(
      yollar.map((yol) =>
        oynat(
          yol,
          [
            { strokeDasharray: uzunluk, strokeDashoffset: uzunluk },
            { strokeDasharray: uzunluk, strokeDashoffset: '0' },
          ],
          { duration: 320, easing: 'ease-out' },
        ),
      ),
    )
    // Parlama: hale iki kez kalınlaşıp saydamlaşır (bulanıklık yok).
    const parlak = { strokeWidth: '22', opacity: 0.6 }
    const sonuk = { strokeWidth: '14', opacity: 0.35 }
    await oynat(yay.querySelector('.koy__yay-hale'), [sonuk, parlak, sonuk, parlak, sonuk], {
      duration: 520,
      easing: 'ease-in-out',
    })
    yay.classList.remove('koy__yay--gorunur')
    await oynat(yay, [{ opacity: 1 }, { opacity: 0 }], { duration: 180 })
    for (const yol of yollar) yol.removeAttribute('d')
  }

  /** Çoğul: iki kopya kartın arkasından iki yana açılır. */
  async function cogalt() {
    const kopyalar = [...(kartlarRef.current?.querySelectorAll('.kelime-karti--kopya') ?? [])]
    await Promise.all(
      kopyalar.map((kopya) =>
        oynat(
          kopya,
          [
            { transform: 'none', opacity: 0 },
            { transform: getComputedStyle(kopya).transform, opacity: 1 },
          ],
          { duration: 420, easing: 'cubic-bezier(.3, .7, .4, 1.3)' },
        ),
      ),
    )
  }

  /**
   * İyelik: kart ekranın altındaki cebe girer. Kart önce ceptedeki yerine konur, sonra eski
   * yerinden oraya kayar (FLIP); cebin önü kartın altını örter.
   */
  async function cebeKoy() {
    const once = kartlarRef.current?.getBoundingClientRect()
    flushSync(() => gonder({ tur: 'etki' }))
    const grup = kartlarRef.current
    if (!once || !grup || hareketAzMi()) return
    const sonra = grup.getBoundingClientRect()
    // Cepteki yuva ölçeklidir: kaymalar yuvanın ölçeğinde yazılır.
    const olcek = sonra.width / grup.offsetWidth
    const kx = (once.left + once.width / 2 - (sonra.left + sonra.width / 2)) / olcek
    const ky = (once.top + once.height / 2 - (sonra.top + sonra.height / 2)) / olcek
    await oynat(
      grup,
      [
        { transform: `translate(${kx}px, ${ky}px) scale(${once.width / sonra.width})` },
        { transform: 'none' },
      ],
      { duration: 600, easing: 'cubic-bezier(.45, 0, .3, 1)' },
    )
  }

  /** Yanlış taşıma: bukalemun -12 derece eğilir, düşer, kıyıya döner; neden görünür. */
  async function dusus(oge: HTMLButtonElement | undefined, kayma: Nokta) {
    if (oge && !hareketAzMi()) {
      const hedef = await kelimeyeUc(oge, kayma)
      // Dönme noktası %45 %85 (DESIGN.md, "Uymayan ek").
      oge.style.transformOrigin = '45% 85%'
      const egik = `${kaydir(hedef)} rotate(-12deg)`
      oge.style.transform = egik
      await oynat(oge, [{ transform: `${kaydir(hedef)} rotate(0deg)` }, { transform: egik }], {
        duration: 180,
        easing: 'ease-out',
      })
      await bekle(280)
      const dusmus = `${kaydir({ x: hedef.x - 16, y: hedef.y + 150 })} rotate(-34deg)`
      oge.style.transform = dusmus
      oge.style.opacity = '0'
      await oynat(
        oge,
        [
          { transform: egik, opacity: 1 },
          { transform: dusmus, opacity: 0 },
        ],
        { duration: 460, easing: 'cubic-bezier(.5, 0, .9, .5)' },
      )
    }
    if (!bagli.current) return
    flushSync(() => gonder({ tur: 'dustu' }))
    if (!oge) return
    oge.style.transform = ''
    oge.style.transformOrigin = ''
    oge.style.opacity = ''
    await oynat(
      oge,
      [
        { transform: 'translateY(2.5rem)', opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 320, easing: 'ease-out' },
    )
  }

  /** Kelimenin dışına bırakılan bukalemun yerine döner. */
  async function geriDon(oge: HTMLElement, kayma: Nokta) {
    oge.style.transform = ''
    await oynat(oge, [{ transform: kaydir(kayma) }, { transform: 'none' }], {
      duration: 240,
      easing: 'ease-out',
    })
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

  function tutmaBasladi(e: PointerEvent<HTMLButtonElement>, yuzey: string) {
    tiklamayiYut.current = false
    if (!secimde || !e.isPrimary || e.button !== 0) return
    const oge = e.currentTarget
    hareketleriKes(oge)
    oge.style.transform = ''
    oge.style.opacity = ''
    try {
      oge.setPointerCapture(e.pointerId)
    } catch {
      // İşaretçi artık yok; sürükleme yine de öğenin olaylarıyla sürer.
    }
    surukleme.current = {
      yuzey,
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
      e.currentTarget.classList.add('kiyi__bukalemun--tasiniyor')
    }
    e.currentTarget.style.transform = kaydir(s.kayma)
    kartRef.current?.classList.toggle('kelime-karti--ustunde', kartinUstunde(e.clientX, e.clientY))
  }

  function tutmaBitti(e: PointerEvent<HTMLButtonElement>, iptal: boolean) {
    const s = surukleme.current
    if (!s || s.isaretci !== e.pointerId) return
    surukleme.current = null
    const oge = e.currentTarget
    oge.classList.remove('kiyi__bukalemun--tasiniyor')
    kartRef.current?.classList.remove('kelime-karti--ustunde')
    if (!s.suruklendi) return
    // Sürüklemenin sonundaki tıklama seçim sayılmaz.
    tiklamayiYut.current = true
    if (!iptal && kartinUstunde(e.clientX, e.clientY)) void tasi(s.yuzey, s.kayma)
    else void geriDon(oge, s.kayma)
  }

  // --- Dokun-dokun ve klavye ----------------------------------------------------------------

  function bukalemunaDokunuldu(e: MouseEvent<HTMLButtonElement>, yuzey: string) {
    // Klavyenin tıklamasında detail 0'dır; o hiç yutulmaz.
    const yut = tiklamayiYut.current && e.detail !== 0
    tiklamayiYut.current = false
    if (yut || !secimde) return
    const secilecek = durum.secili !== yuzey
    gonder({ tur: 'sec', yuzey })
    // Seçilen bukalemun kelimeye götürülmeyi bekler: odak kelime kartına geçer.
    if (secilecek) kartRef.current?.focus()
  }

  function kartaDokunuldu() {
    if (secimde && durum.secili !== null) void tasi(durum.secili)
  }

  function tusaBasildi(e: KeyboardEvent) {
    if (e.key !== 'Escape' || durum.secili === null) return
    const secili = durum.secili
    gonder({ tur: 'sec', yuzey: secili })
    bukalemunlar.current.get(secili)?.focus()
  }

  // --- Görünüm ----------------------------------------------------------------------------

  const kartlar = (etkilesimli: boolean) => (
    <div className="kartlar" ref={kartlarRef}>
      {durum.cogaldi &&
        [1, 2].map((n) => (
          <div
            key={n}
            className={`kelime-karti kelime-karti--kopya kelime-karti--kopya-${n}`}
            aria-hidden="true"
          >
            {kelimeYazisi}
          </div>
        ))}
      {etkilesimli ? (
        <button
          ref={kartRef}
          type="button"
          className={durum.secili !== null ? 'kelime-karti kelime-karti--hedef' : 'kelime-karti'}
          aria-label={kelime}
          aria-describedby="koy-yonerge"
          onClick={kartaDokunuldu}
        >
          {kelimeYazisi}
        </button>
      ) : (
        <div className="kelime-karti">{kelimeYazisi}</div>
      )}
    </div>
  )

  return (
    <main className={durum.renksiz ? 'koy renksiz' : 'koy'} onKeyDown={tusaBasildi}>
      <BolgeUstu
        ad={bolge.ad}
        gorevYeri={durum.gorevYeri}
        gorevSayisi={gorevler.length}
        onHarita={onHarita}
        baslikRef={baslikRef}
      />
      <p id="koy-yonerge" className="gizli">
        Bir bukalemunu kelimeye taşı: sürükle, ya da önce bukalemuna sonra kelimeye dokun.
      </p>

      <section className="koy__deniz" aria-label="Kelime">
        <div className="koy__sahne">{!durum.cepte && kartlar(true)}</div>
        <div className="koy__alt">
          <div className="neden" role="status">
            {durum.yanlis && <NedenYazisi deneme={durum.yanlis} />}
          </div>
          {evre === 'bitti' && (
            <button
              ref={sonrakiRef}
              type="button"
              className="koy__dugme"
              onClick={() => gonder({ tur: 'sonraki' })}
            >
              Sıradaki
            </button>
          )}
          <p className="gizli" role="status">
            {evre === 'bitti' ? kelime : ''}
          </p>
        </div>
      </section>

      <svg
        className="koy__dalga"
        viewBox="0 0 320 12"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 6Q20 0 40 6T80 6T120 6T160 6T200 6T240 6T280 6T320 6" />
      </svg>

      <ul className="kiyi" aria-label="Bukalemunlar">
        {adim.secenekler.map((secenek) => {
          const { yuzey } = secenek
          const siniflar = [
            'kiyi__bukalemun',
            durum.deneme?.yuzey === yuzey && 'kiyi__bukalemun--etkin',
            birlesen?.yuzey === yuzey && 'kiyi__bukalemun--birlesti',
          ]
          return (
            <li key={`${durum.gorevYeri}:${adim.sira}:${yuzey}`} className="kiyi__yer">
              <button
                ref={(oge) => {
                  if (!oge) return
                  bukalemunlar.current.set(yuzey, oge)
                  return () => {
                    if (bukalemunlar.current.get(yuzey) === oge) bukalemunlar.current.delete(yuzey)
                  }
                }}
                type="button"
                className={siniflar.filter(Boolean).join(' ')}
                aria-pressed={durum.secili === yuzey}
                aria-disabled={!secimde}
                onClick={(e) => bukalemunaDokunuldu(e, yuzey)}
                onPointerDown={(e) => tutmaBasladi(e, yuzey)}
                onPointerMove={tutmaSurdu}
                onPointerUp={(e) => tutmaBitti(e, false)}
                onPointerCancel={(e) => tutmaBitti(e, true)}
              >
                <Bukalemun parca={secenek.parca} />
              </button>
            </li>
          )
        })}
      </ul>

      <div className="cep" aria-hidden="true">
        {durum.cepte && <div className="cep__yuva">{kartlar(false)}</div>}
        <svg className="cep__on" viewBox="0 0 200 64" preserveAspectRatio="none">
          <path className="cep__govde" d={CEP_GOVDESI} />
          <path className="cep__dikis" d={CEP_DIKISI} />
        </svg>
        {durum.cepte && (
          <span className="cep__yazi">
            <KurulanKelime kok={gorev.kok} etiketler={gorev.etiketler.slice(0, adim.sira + 1)} />
          </span>
        )}
      </div>

      <svg className="koy__yay" ref={yayRef} aria-hidden="true">
        <path className="koy__yay-hale" />
        <path className="koy__yay-yolu" />
      </svg>
    </main>
  )
}

/** Kelime kartındaki yazı: gövde (son ünlüsü etikette) ve büyüden sonra bukalemunun eki. */
function KelimeYazisi({ govde, ek }: { govde: string; ek: EkParcasi | null }) {
  return (
    <span className="kelime" aria-hidden="true">
      <KokYazisi kok={govde} />
      {ek && <EkYazisi parca={ek} />}
    </span>
  )
}

/** Yanlış taşımanın nedeni: aday, ilgili iki ünlüsü etiketli; altında cümle. */
function NedenYazisi({ deneme }: { deneme: Deneme }) {
  const [ilk] = deneme.nedenler
  const { aday } = deneme
  return (
    <>
      <p className="neden__aday" aria-hidden="true">
        {ilk?.tur === 'uyum' ? (
          <>
            {aday.slice(0, ilk.bakilanKonumu)}
            <UnluEtiketi unlu={ilk.bakilan} />
            {aday.slice(ilk.bakilanKonumu + 1, ilk.secilenKonumu)}
            <UnluEtiketi unlu={ilk.secilen} />
            {aday.slice(ilk.secilenKonumu + 1)}
          </>
        ) : (
          aday
        )}
      </p>
      {deneme.cumle && <p className="neden__cumle">{deneme.cumle}</p>}
    </>
  )
}
