// Bölge ekranlarının akışı (DESIGN.md, "Akış ve puan"): puan, kendiliğinden geçiş ve ilk dakika
// eli. Dört bölge ekranı aynı kancayı (useAkis) kullanır; kabuk (App.tsx) bağlamı verir.
//
//   - Puan yalnız artar: her doğru yerleştirme ilk denemede +10, sonra +5; yanlış 0. Üst üste üç
//     ilk denemede doğru +5 ve kısa bir şenlik (parıltı ve efekt; hareket azaltmada yalnız efekt).
//     Saf kurallar src/oyun/puan.ts'te. Görev bitince turun puanı kayda yazılır (onPuan).
//   - Kendiliğinden geçiş (ayarlar.gecis): görevin son doğru yerleştirmesinden GECIS_SURESI sonra
//     sıradaki görev kendisi gelir; sesli modda kurulan kelimenin sesi bitmeden gelmez. Bu arada
//     ekrana dokunan (ya da tuşa basan) hemen geçer, ses de susar; büyü sürüyorsa sonuna atlar
//     (hareket.ts, hizlandir). Yanlışta geçiş yok. Düğmeyle'de ekran Sıradaki düğmesini gösterir.
//   - Yeni görev ekran okuyucuya duyurulur (duyuru); odak yeni görevin ilk seçilebilir öğesine
//     ekranların kendisinde geçer.
//   - İlk dakika eli: bölgenin ilk görevinde, bölgeye ilk girişte yarı saydam bir el ilk
//     bukalemunu (Dükkân'da ilk karoyu) hedefe doğru sürükler ve bırakmadan kaybolur; hamleyi
//     gösterir, cevabı vermez. Sesli modda el çıkarken bölgenin cümlesi söylenir. İlk üç görevde
//     8 saniye hiçbir şeye dokunulmazsa el yeniden çıkar. Çocuk o bölgede bir doğru yapınca el
//     kapanır ve kayda yazılır (onElKapandi); bir daha çıkmaz. Hareket azaltmada el kıpırdamadan
//     durur.

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Gorev } from '../oyun/gorevler.ts'
import type { Gecis } from '../oyun/ilerleme.ts'
import {
  BOS_TUR_PUANI,
  dogruYerlesti,
  yanlisYerlesti,
  type TurPuani,
} from '../oyun/puan.ts'
import { cal, sesBitince, sus } from '../ses/calar.ts'
import { EL_CUMLELERI } from '../ses/metinler.ts'
import { useSes } from '../ses/Ses.tsx'
import { hareketAzMi, hizlandir, hizliKapat } from './hareket.ts'
import { parlat } from './parilti.ts'
import './akis.css'

/** Son doğru yerleştirmeden sıradaki görevin gelişine (ms); oynanabilirliği 1,5 saniyenin içinde. */
export const GECIS_SURESI = 1400
/** Sesli modda kelimenin sesi en çok bu kadar beklenir (ms): biten olayı gelmeyen ses takılmasın. */
export const SES_BEKLEME_SINIRI = 8000
/** İlk dakika eli: hiçbir şeye dokunulmazsa bu kadar sonra yeniden çıkar (ms). */
export const EL_BEKLEMESI = 8000
/** El yalnız bölgenin ilk bu kadar görevinde (turdaki sıra) çıkar. */
export const EL_GOREVLERI = 3
/** Elin hamlesi (ms). */
export const EL_SURESI = 1300
/** Hareket azaltmada el bu kadar kıpırdamadan durur (ms). */
export const EL_DURUSU = 2500

/** Kabuğun bölge ekranına verdiği akış bağlamı. */
export interface AkisBaglami {
  readonly gecis: Gecis
  /** Bölgeye girilince süren turun puanı (biten görevlerinki); yeni turda 0. */
  readonly baslangicPuani: TurPuani
  /** İlk dakika eli bu bölgede kapandı mı. */
  readonly elKapali: boolean
  /** Görev bitti: turun o ana kadarki puanı kayda yazılsın. */
  readonly onPuan: (gorev: Gorev, puan: TurPuani) => void
  /** Çocuk bölgede bir doğru yaptı: el kapansın, kayda yazılsın. */
  readonly onElKapandi: () => void
}

/** Sağlayıcı olmadan (birim testleri, galeri): kendiliğinden geçiş, el kapalı, kayıt yok. */
const VARSAYILAN: AkisBaglami = {
  gecis: 'kendiliginden',
  baslangicPuani: BOS_TUR_PUANI,
  elKapali: true,
  onPuan: () => {},
  onElKapandi: () => {},
}

const Baglam = createContext<AkisBaglami>(VARSAYILAN)

export function AkisSaglayici({ deger, children }: { deger: AkisBaglami; children: ReactNode }) {
  return <Baglam.Provider value={deger}>{children}</Baglam.Provider>
}

/** Dokunuşu geçiş saymayan öğeler: hoparlör (yeniden dinlemek) ve Harita düğmesi. */
const GECIS_SAYILMAZ = '.hoparlor, .bolge-ustu__harita'

export interface AkisSecenekleri {
  readonly bolge: string
  /** Oynanan görev; akşam ekranında yok. */
  readonly gorev: Gorev | undefined
  /** Oynanan görevin yeri (0'dan): değişince yeni görev başlamıştır. */
  readonly gorevYeri: number
  /** Görev bitti (evre bitti): sıradaki görev bekleniyor. */
  readonly bitti: boolean
  /** Sıradaki görev (ya da akşam ekranı). */
  readonly onSonraki: () => void
  /** Yeni görevin duyurusu: kök (Bahçe'de hedef). */
  readonly gorevMetni: string
  /** İlk dakika eli: hamlenin başı (ilk bukalemun ya da karo) ve hedefi. */
  readonly elKaynagi: () => Element | null | undefined
  readonly elHedefi: () => Element | null | undefined
  /** Çocuk seçim yapabiliyor mu (el yalnız o zaman çıkar). */
  readonly secimde: boolean
}

export interface Akis {
  /** Sıradaki görev kendisi gelir (Kendiliğinden); değilse ekran Sıradaki düğmesini gösterir. */
  readonly kendiliginden: boolean
  /** Turun puanı. */
  readonly puan: TurPuani
  /** Yeni görevin duyurusu (ekran okuyucu); ilk görevde boş. */
  readonly duyuru: string
  /**
   * Bir yerleştirme oldu (taşıma anı). adim görevin içindeki seçim yeridir (zincirde ekin sırası,
   * sınır adımında "sinir"); aynı adımda önceki yanlış varsa ilk deneme değildir. sonAdim:
   * görevin son yerleştirmesi (doğruysa geçişin süresi buradan sayılır).
   */
  readonly dene: (adim: string, dogru: boolean, sonAdim: boolean) => void
  /** Doğru sonucun görünüp duyulduğu an (efekt): seri tamamlandıysa şenlik burada. */
  readonly dogruGorundu: () => void
}

export function useAkis({
  bolge,
  gorev,
  gorevYeri,
  bitti,
  onSonraki,
  gorevMetni,
  elKaynagi,
  elHedefi,
  secimde,
}: AkisSecenekleri): Akis {
  const baglam = useContext(Baglam)
  const { ayar, senlik } = useSes()
  const kendiliginden = baglam.gecis === 'kendiliginden'

  const [puan, setPuan] = useState(baglam.baslangicPuani)
  const puanRef = useRef(puan)
  const yanlisAdimlar = useRef(new Set<string>())
  const senlikBekliyor = useRef(false)
  const [duyuru, setDuyuru] = useState('')

  // Geçiş: son doğru yerleştirmenin anı; dokunuş geldiyse büyü bitince hemen geçilir.
  const sonDogru = useRef<number | null>(null)
  const atla = useRef(false)
  const bittiRef = useRef(bitti)
  bittiRef.current = bitti
  const sonrakiRef = useRef(onSonraki)
  sonrakiRef.current = onSonraki
  const dinleyiciKaldir = useRef<(() => void) | null>(null)

  const gec = () => {
    dinleyiciKaldir.current?.()
    sonDogru.current = null
    atla.current = false
    hizliKapat()
    sonrakiRef.current()
  }

  // Yeni görev: adımların yanlışları sıfırlanır; ilk görev değilse duyurulur.
  const gorulenYer = useRef(gorevYeri)
  useEffect(() => {
    yanlisAdimlar.current.clear()
    if (gorulenYer.current === gorevYeri) return
    gorulenYer.current = gorevYeri
    setDuyuru(gorev ? `Sıradaki görev: ${gorevMetni}` : '')
    // gorevMetni ve gorev görevle birlikte değişir.
  }, [gorevYeri])

  // Ekrandan çıkınca dinleyiciler kalkar, hareketler yeniden oynar.
  useEffect(
    () => () => {
      dinleyiciKaldir.current?.()
      hizliKapat()
    },
    [],
  )

  // Görev bitti: puan kayda; Kendiliğinden'de süre dolunca (sesli modda ses de bitince) ya da
  // dokunuş geldiyse hemen sıradaki görev.
  useEffect(() => {
    if (!bitti) return
    if (gorev) baglam.onPuan(gorev, puanRef.current)
    if (!kendiliginden) return
    if (atla.current) {
      gec()
      return
    }
    let iptal = false
    const gecen = sonDogru.current === null ? GECIS_SURESI : performance.now() - sonDogru.current
    const zaman = setTimeout(
      async () => {
        if (ayar === 'sesli') {
          await Promise.race([
            sesBitince(),
            new Promise((coz) => setTimeout(coz, SES_BEKLEME_SINIRI)),
          ])
        }
        if (!iptal) gec()
      },
      Math.max(0, GECIS_SURESI - gecen),
    )
    return () => {
      iptal = true
      clearTimeout(zaman)
    }
    // Yalnız görevin bitişi; öteki değerler o anınkilerdir.
  }, [bitti])

  /** Son doğru yerleştirmeden sonra dokunuş: hemen geç (ses susar; büyü sürüyorsa sonuna). */
  function dokunusuBekle() {
    dinleyiciKaldir.current?.()
    const dokunuldu = (olay: Event) => {
      const hedef = olay.target
      if (hedef instanceof Element && hedef.closest(GECIS_SAYILMAZ)) return
      if (olay instanceof KeyboardEvent && olay.key !== 'Enter' && olay.key !== ' ') return
      dinleyiciKaldir.current?.()
      sus()
      if (bittiRef.current) {
        gec()
      } else {
        atla.current = true
        hizlandir()
      }
    }
    document.addEventListener('pointerdown', dokunuldu, true)
    document.addEventListener('keydown', dokunuldu, true)
    dinleyiciKaldir.current = () => {
      document.removeEventListener('pointerdown', dokunuldu, true)
      document.removeEventListener('keydown', dokunuldu, true)
      dinleyiciKaldir.current = null
    }
  }

  const el = useIlkDakikaEli({
    bolge,
    gorev,
    gorevYeri,
    secimde,
    kapali: baglam.elKapali,
    kaynak: elKaynagi,
    hedef: elHedefi,
  })

  return {
    kendiliginden,
    puan,
    duyuru,
    dene(adim, dogru, sonAdim) {
      el.gizle()
      if (!dogru) {
        yanlisAdimlar.current.add(adim)
        puanRef.current = yanlisYerlesti(puanRef.current)
        setPuan(puanRef.current)
        return
      }
      const sonuc = dogruYerlesti(puanRef.current, !yanlisAdimlar.current.has(adim))
      puanRef.current = sonuc.tur
      setPuan(sonuc.tur)
      if (sonuc.senlik) senlikBekliyor.current = true
      if (!baglam.elKapali) baglam.onElKapandi()
      el.kapat()
      if (sonAdim) {
        sonDogru.current = performance.now()
        atla.current = false
        if (kendiliginden) dokunusuBekle()
      }
    },
    dogruGorundu() {
      if (!senlikBekliyor.current) return
      senlikBekliyor.current = false
      // Doğrunun efektinden hemen sonra: kısa üçlü ve puanın çevresinde parıltı.
      setTimeout(() => {
        senlik()
        parlat(document.querySelector('.bolge-ustu__puan'))
      }, 300)
    },
  }
}

// --- İlk dakika eli -----------------------------------------------------------------------

/** Elin çizimi (48×48): işaret parmağı uzanmış bir el; yalnız geometri, renk CSS'te. */
const EL_YOLU =
  'M19 4.5c-2 0-3.5 1.5-3.5 3.5v17l-3.2-3.3c-1.5-1.5-3.8-1.5-5.2-.1-1.3 1.3-1.3 3.4 0 4.8' +
  'l9.4 10.4c2.6 2.9 6.2 4.7 10 4.7h3c6.4 0 11.5-5.1 11.5-11.5V21c0-1.9-1.6-3.5-3.5-3.5S34 19.1' +
  ' 34 21v-1.5c0-1.9-1.6-3.5-3.5-3.5S27 17.6 27 19.5V18c0-1.9-1.6-3.5-3.5-3.5S22.5 15 22.5 15V8' +
  'c0-2-1.5-3.5-3.5-3.5z'

interface ElSecenekleri {
  readonly bolge: string
  readonly gorev: Gorev | undefined
  readonly gorevYeri: number
  readonly secimde: boolean
  readonly kapali: boolean
  readonly kaynak: () => Element | null | undefined
  readonly hedef: () => Element | null | undefined
}

/** İlk dakika eli: çıkışını, yeniden çıkışını ve kapanışını yönetir. */
function useIlkDakikaEli({
  bolge,
  gorev,
  gorevYeri,
  secimde,
  kapali,
  kaynak,
  hedef,
}: ElSecenekleri) {
  const { ayar } = useSes()
  // Bu açılışta kapandı mı (kayıt bağlamı bir sonraki çizimde gelir).
  const kapandi = useRef(kapali)
  if (kapali) kapandi.current = true
  const kaynakRef = useRef(kaynak)
  kaynakRef.current = kaynak
  const hedefRef = useRef(hedef)
  hedefRef.current = hedef
  const sahne = useRef<HTMLElement | null>(null)
  const ilkGosterildi = useRef(false)

  const turdakiSira = gorev?.turdakiSira ?? Number.POSITIVE_INFINITY
  const etkin = !kapandi.current && secimde && turdakiSira <= EL_GOREVLERI

  const gizle = () => {
    sahne.current?.remove()
    sahne.current = null
  }

  useEffect(() => {
    if (!etkin) return
    let iptal = false
    let bekleme: ReturnType<typeof setTimeout> | undefined
    const goster = () => {
      if (iptal || kapandi.current) return
      const kaynakOgesi = kaynakRef.current()
      const hedefOgesi = hedefRef.current()
      if (!kaynakOgesi || !hedefOgesi) return
      gizle()
      sahne.current = eliCiz(kaynakOgesi, hedefOgesi, () => {
        if (iptal) return
        sahne.current = null
        bekle()
      })
      const cumle = EL_CUMLELERI[bolge]
      if (ayar === 'sesli' && cumle) void cal(cumle)
    }
    const bekle = () => {
      clearTimeout(bekleme)
      bekleme = setTimeout(goster, EL_BEKLEMESI)
    }
    // Dokunuş ya da tuş: el kaybolur, bekleme baştan.
    const dokunuldu = () => {
      gizle()
      bekle()
    }
    document.addEventListener('pointerdown', dokunuldu, true)
    document.addEventListener('keydown', dokunuldu, true)
    if (!ilkGosterildi.current && turdakiSira === 1) {
      ilkGosterildi.current = true
      // Sesli modda bölgenin adı ve kök söylendikten sonra.
      const acilis =
        ayar === 'sesli'
          ? Promise.race([sesBitince(), new Promise((coz) => setTimeout(coz, SES_BEKLEME_SINIRI))])
          : new Promise((coz) => setTimeout(coz, 600))
      void acilis.then(() => {
        if (!iptal) goster()
      })
    } else {
      bekle()
    }
    return () => {
      iptal = true
      clearTimeout(bekleme)
      document.removeEventListener('pointerdown', dokunuldu, true)
      document.removeEventListener('keydown', dokunuldu, true)
      gizle()
    }
    // Ses ayarı ve bölge açılış boyunca sabittir.
  }, [etkin, gorevYeri])

  return {
    gizle,
    /** Çocuk bir doğru yaptı: el bu bölgede bir daha çıkmaz. */
    kapat() {
      kapandi.current = true
      gizle()
    },
  }
}

/**
 * Eli çizer: belgenin gövdesine sabit, ekran okuyucudan gizli bir kap; içinde kaynağın yarı
 * saydam bir kopyası ve el. El kaynaktan hedefe doğru yolun dörtte üçünü gider, bırakmadan
 * kaybolur. Hareket azaltmada kaynağın üstünde kıpırdamadan durur, sonra kalkar. Bitince bitti
 * çağrılır.
 */
function eliCiz(kaynak: Element, hedef: Element, bitti: () => void): HTMLElement {
  const k = kaynak.getBoundingClientRect()
  const h = hedef.getBoundingClientRect()
  const kap = document.createElement('div')
  kap.className = 'ilk-el'
  kap.setAttribute('aria-hidden', 'true')
  kap.dataset.bolge = 'el'
  Object.assign(kap.style, {
    left: `${k.left}px`,
    top: `${k.top}px`,
    width: `${k.width}px`,
    height: `${k.height}px`,
  })
  const kopya = kaynak.cloneNode(true) as Element
  const hayalet = document.createElement('div')
  hayalet.className = 'ilk-el__hayalet'
  // Kopyadaki kimlikler ve adlar belgede ikinci kez geçmesin.
  for (const oge of [kopya, ...kopya.querySelectorAll('*')]) {
    oge.removeAttribute('id')
    oge.removeAttribute('aria-label')
  }
  hayalet.append(...kopya.childNodes)
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  el.setAttribute('viewBox', '0 0 48 48')
  el.setAttribute('class', 'ilk-el__el')
  const yol = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  yol.setAttribute('d', EL_YOLU)
  el.append(yol)
  kap.append(hayalet, el)
  document.body.append(kap)

  let bitmis = false
  const bitir = () => {
    if (bitmis) return
    bitmis = true
    kap.remove()
    bitti()
  }
  if (hareketAzMi()) {
    setTimeout(bitir, EL_DURUSU)
    return kap
  }
  const dx = (h.left + h.width / 2 - (k.left + k.width / 2)) * 0.75
  const dy = (h.top + h.height / 2 - (k.top + k.height / 2)) * 0.75
  const hareket = kap.animate(
    [
      { transform: 'translate(0, 0)', opacity: 0 },
      { transform: 'translate(0, 0)', opacity: 1, offset: 0.18 },
      { transform: `translate(${dx * 0.85}px, ${dy * 0.85}px)`, opacity: 1, offset: 0.78 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
    ],
    { duration: EL_SURESI, easing: 'ease-in-out', fill: 'forwards' },
  )
  void hareket.finished.then(bitir, bitir)
  return kap
}
