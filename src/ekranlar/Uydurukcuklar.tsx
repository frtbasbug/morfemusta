// Uydurukçuklar (DESIGN.md, "Uydurukçuklar"): uydurma yaratıklarla wug görevleri. Ortada adı
// uydurma bir kök olan yaratık, altında adı (KokYazisi); kıyıda bukalemunlar. Çocuk Bukalemun
// Koyu'ndaki gibi doğru bukalemunu yaratığa taşır: sürükle-bırak (Pointer Events), dokun-dokun
// (önce bukalemun, sonra yaratık) ya da klavye (Tab ve Enter).
//
// Doğruysa bukalemun yaratığın adına yapışır ve büyü olur (resimsiz): çoğulda yaratık üçe
// çoğalır, iyelikte cebe girer, bulunmada küçük bir yıldız üstünde durur, yönelmede yıldız ona
// doğru uçar. Kök p, ç, t ya da k ile bitip iyelik alınca önce Dükkân'ın tezgâhı gelir: taş da
// jöle de doğrudur (İkisi de olur: gıvakım, gıvağım.); kurulan biçim çocuğun seçtiğidir.
// Yanlışsa bukalemun eğilir, düşer, kıyıya döner; nedeni yazılır, ilgili iki ses vurgulanır.
// Ceza ve süre yok; puan yalnız artar (sınır adımında iki karo da ilk deneme sayılır). Görev
// bitince sıradaki görev kendiliğinden gelir ya da Düğmeyle ayarında Sıradaki düğmesiyle; ilk
// görevde ilk dakika eli (akis.tsx). Yaratığın ağzı hiçbir durumda değişmez (DESIGN.md, "Üç
// kural").
//
// Oyunun durumu src/oyun/uyduruk.ts'teki indirgeyicidedir; bu dosya görünümü ve hareketleri
// yazar (hareket.ts; hareket azaltmada hiçbiri oynamaz, yalnız durum değişir). Kabuk öteki
// bölgelerinkiyle aynıdır: çocuk kaldığı görevden sürdürür (baslangic: bütün tablodaki yer;
// ekran onun turunu oynar), her görev bitince kabuk ilerlemeyi ve çocuğun kurduğu biçimi
// kaydeder (onGorevBitti), tur bitince ortak akşam ekranı açılır.

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
import type { EkParcasi, Karo as KaroTuru, Unlu } from '../motor/index.ts'
import Bukalemun from '../gorsel/Bukalemun.tsx'
import { CEP_DIKISI, CEP_GOVDESI } from '../gorsel/cep.ts'
import { BUKALEMUN_KUTUSU, UNLULER, bukalemunCizimi } from '../gorsel/cizim.ts'
import EkYazisi from '../gorsel/EkYazisi.tsx'
import Karo from '../gorsel/Karo.tsx'
import { karoAdi, karoTuru } from '../gorsel/karo.ts'
import { bukalemunKiligi } from '../gorsel/kilik.ts'
import { EtiketliKok } from '../gorsel/KokYazisi.tsx'
import KurulanKelime from '../gorsel/KurulanKelime.tsx'
import UnluEtiketi from '../gorsel/UnluEtiketi.tsx'
import Yaratik, { Yildiz } from '../gorsel/Yaratik.tsx'
import '../gorsel/tema.css'
import { useDenemeGunlugu } from '../kabuk/gunluk.tsx'
import type { Bolge } from '../oyun/bolgeler.ts'
import { ilgiliSesler, karoHarfi, TEZGAH } from '../oyun/dukkan.ts'
import { turunYeri, type Gorev } from '../oyun/gorevler.ts'
import { gorevinSonBicimi, nedenKodlari } from '../oyun/gunluk.ts'
import type { SozlukKarti } from '../oyun/ilerleme.ts'
import {
  UYDURUK_BUYULERI,
  denemeyiDegerlendir,
  dogruMu,
  kurulanBicim,
  oynananGorev,
  sinirCumlesi,
  uydurukBaslangici,
  uydurukIndirgeyici,
  type Deneme,
  type UydurukBuyusu,
} from '../oyun/uyduruk.ts'
import { Hoparlor, useSes, useSesliSoyleyis } from '../ses/Ses.tsx'
import { yildizSayisi } from '../oyun/puan.ts'
import AksamEkrani from './AksamEkrani.tsx'
import { useAkis } from './akis.tsx'
import BolgeUstu from './BolgeUstu.tsx'
import { bekle, hareketAzMi, hareketleriKes, kaydir, oynat, type Nokta } from './hareket.ts'
import { parlat } from './parilti.ts'
import { SiradakiSimgesi } from './simgeler.tsx'
import './Uydurukcuklar.css'

/** Sürükleme sayılan en kısa yol (px); daha kısası dokunmadır. */
const SURUKLEME_ESIGI = 8
/** Yaratığın çevresinde bırakmanın yine de onda sayıldığı pay (px). */
const BIRAKMA_PAYI = 24
const DURAGAN: Nokta = { x: 0, y: 0 }
/** Yaratığın ölçeği: 72×76'lık ünlü karakteri 130×137 px (alçak ekranda CSS küçültür). */
const YARATIK_BOYU = 1.8

type Tasinan = { readonly tur: 'bukalemun'; readonly yuzey: string } | { readonly tur: 'karo'; readonly karo: KaroTuru }

interface Surukleme {
  readonly tasinan: Tasinan
  readonly isaretci: number
  readonly baslangic: Nokta
  kayma: Nokta
  suruklendi: boolean
}

export default function Uydurukcuklar({
  bolge,
  baslangic = 0,
  bugunkuKartlar = [],
  onGorevBitti,
  onHarita,
}: {
  /** Bölge tablosundaki satırı: ad, akşam ve görevler (bütün turlar). */
  readonly bolge: Bolge
  /** Kalınan görevin bütün tablodaki yeri (0'dan); ekran onun turunu oynar. */
  readonly baslangic?: number
  /** Bölgede bugün kurulan kelimelerin kartları: akşam ekranında listelenir. */
  readonly bugunkuKartlar?: readonly SozlukKarti[]
  /**
   * Bir görev bitti (büyü oldu): kabuk ilerlemeyi ve kartı kaydeder. Kelime çocuğun kurduğu
   * biçimdir (gıvağım ya da gıvakım).
   */
  readonly onGorevBitti?: (gorev: Gorev, kartEkleri: undefined, kelime: string) => void
  /** Haritaya dönüş; verilmezse düğmesi çıkmaz. */
  readonly onHarita?: () => void
}) {
  const [durum, gonder] = useReducer(uydurukIndirgeyici, baslangic, (yer) => {
    const tur = turunYeri(bolge.gorevler, yer)
    return uydurukBaslangici(tur.gorevler, tur.yer)
  })
  const gorev = oynananGorev(durum)
  const { adim, sinir, evre } = durum
  // Yuvada görünen karo: jöle seçilince önce kökün taşı, sonra erir. Yeni görevde boşalır.
  const [yuvadaki, setYuvadaki] = useState<KaroTuru | null>(null)

  const baslikRef = useRef<HTMLHeadingElement>(null)
  const hedefRef = useRef<HTMLButtonElement>(null)
  const yaratiklarRef = useRef<HTMLDivElement>(null)
  const yuvaRef = useRef<HTMLSpanElement>(null)
  const yayRef = useRef<SVGSVGElement>(null)
  const sonrakiRef = useRef<HTMLButtonElement>(null)
  const bukalemunlar = useRef(new Map<string, HTMLButtonElement>())
  const karolar = useRef(new Map<KaroTuru, HTMLButtonElement>())
  const surukleme = useRef<Surukleme | null>(null)
  const tiklamayiYut = useRef(false)
  const bagli = useRef(false)
  const gorulenGorev = useRef(durum.gorevYeri)
  const { soyle, sonuc, buyu: buyuSesi } = useSes()
  const kaydet = useDenemeGunlugu(bolge.kimlik, gorev)

  function sonrakiGorev() {
    setYuvadaki(null)
    gonder({ tur: 'sonraki' })
  }

  const akis = useAkis({
    bolge: bolge.kimlik,
    gorev,
    gorevYeri: durum.gorevYeri,
    bitti: evre === 'bitti',
    onSonraki: sonrakiGorev,
    gorevMetni: gorev?.kok ?? '',
    elKaynagi: () => {
      const ilk = durum.adim?.secenekler[0]
      return ilk ? bukalemunlar.current.get(ilk.yuzey) : null
    },
    elHedefi: () => hedefRef.current,
    secimde: evre === 'secim' && durum.secili === null,
  })

  // Sesli mod: görev başlayınca yaratığın adı (kök) söylenir; bölgeye girişte önce bölgenin
  // adı.
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

  // Klavyeyle oynayan için odak: görev bitince Sıradaki'ye (Düğmeyle), yeni görevde kıyıdaki ilk
  // bukalemuna, sınır adımında tezgâhtaki taşa. Akşam ekranı odağı kendi başlığına alır.
  useEffect(() => {
    if (evre === 'bitti') sonrakiRef.current?.focus()
    if (evre === 'sinir') karolar.current.get(TEZGAH[0] ?? 'taş')?.focus()
  }, [evre])

  useEffect(() => {
    if (gorulenGorev.current === durum.gorevYeri) return
    gorulenGorev.current = durum.gorevYeri
    const ilk = durum.adim?.secenekler[0]
    if (ilk) bukalemunlar.current.get(ilk.yuzey)?.focus()
  }, [durum.gorevYeri, durum.adim])

  if (evre === 'kapanis' || !gorev || !adim) {
    return (
      <AksamEkrani
        baslik={bolge.aksam}
        kartlar={bugunkuKartlar}
        puan={akis.puan.puan}
        yildiz={yildizSayisi(akis.puan)}
        onHarita={onHarita}
      />
    )
  }

  const secimde = evre === 'secim'
  const sinirda = evre === 'sinir'
  const { birlesen, buyu, kurulan } = durum
  const cepli = UYDURUK_BUYULERI[adim.etiket] === 'cebe girer'
  const tezgahta = sinir !== null && birlesen !== null
  const cepte = buyu === 'cebe girer'

  // --- Taşıma: bukalemun ------------------------------------------------------------------

  /** Bukalemun yaratığa taşındı: doğruysa oturur, yanlışsa düşer. */
  async function tasi(yuzey: string, kayma: Nokta = DURAGAN) {
    if (!gorev || !adim || evre !== 'secim') return
    const secenek = adim.secenekler.find((s) => s.yuzey === yuzey)
    if (!secenek) return
    const deneme = denemeyiDegerlendir(gorev, adim, yuzey)
    // Pilotun günlüğü: her seçim bir satır (kod yokken ve sınıf modunda yazılmaz).
    kaydet('ek', {
      dogruBicim: adim.bicim,
      secilen: yuzey,
      aday: deneme.aday,
      dogru: dogruMu(deneme),
      neden: nedenKodlari(deneme.nedenler),
    })
    // Sınır adımı varsa görevin son yerleştirmesi karodur.
    akis.dene('ek', dogruMu(deneme), !sinir)
    flushSync(() => gonder({ tur: 'dene', yuzey }))
    const oge = bukalemunlar.current.get(yuzey)
    if (dogruMu(deneme)) await otur(oge, secenek.parca, kayma)
    else await dusus(oge, kayma, deneme.cumle)
  }

  /**
   * Sesli mod: seçilen bukalemunun (zelüye, zelüe) ya da karonun (gıvakım, gıvağım) kuracağı
   * kelime.
   */
  function adayiSoyle(tasinan: Tasinan) {
    if (!gorev || !adim) return
    if (tasinan.tur === 'bukalemun') soyle(adim.parca.govde + tasinan.yuzey)
    else soyle(kurulanBicim(gorev, sinir, tasinan.karo).bicim)
  }

  /** Bukalemunun yaratığın adının sonuna yapışacağı yer: kaymaya göre (translate). */
  function yapismaNoktasi(oge: HTMLElement, kayma: Nokta): Nokta {
    const ad = hedefRef.current?.querySelector('.uyduruk__ad')?.getBoundingClientRect()
    if (!ad) return kayma
    const kutu = oge.getBoundingClientRect()
    const taban = { x: kutu.left - kayma.x, y: kutu.top - kayma.y }
    const sagSinir = document.documentElement.clientWidth - 4
    const sol = Math.max(4, Math.min(ad.right - 4, sagSinir - kutu.width))
    const ust = ad.top + ad.height / 2 - kutu.height * 0.58
    return { x: sol - taban.x, y: ust - taban.y }
  }

  /** Doğru bukalemun: adın sonuna uçar, yay parlar, zıplar ve eke karışır. */
  async function otur(oge: HTMLButtonElement | undefined, parca: EkParcasi, kayma: Nokta) {
    if (oge && !hareketAzMi()) {
      const hedef = yapismaNoktasi(oge, kayma)
      oge.style.transform = kaydir(hedef)
      await oynat(oge, [{ transform: kaydir(kayma) }, { transform: kaydir(hedef) }], {
        duration: 200,
        easing: 'cubic-bezier(.3, .7, .4, 1)',
      })
      // Sevinç zıplamayla anlatılır; ağız değişmez. Yay parlarken zıplar, sonra eke karışır.
      const yukarida = (dy: number) => kaydir({ x: hedef.x, y: hedef.y - dy })
      await Promise.all([
        yayiParlat(oge, parca),
        (async () => {
          await oynat(
            oge,
            [
              { transform: yukarida(0) },
              { transform: yukarida(22), offset: 0.3 },
              { transform: yukarida(0), offset: 0.6 },
              { transform: yukarida(10), offset: 0.8 },
              { transform: yukarida(0) },
            ],
            { duration: 400, easing: 'ease-in-out' },
          )
          oge.style.opacity = '0'
          await oynat(
            oge,
            [
              { transform: kaydir(hedef), opacity: 1 },
              { transform: `${kaydir(hedef)} scale(0.4)`, opacity: 0 },
            ],
            { duration: 120, easing: 'ease-in' },
          )
        })(),
      ])
    }
    if (!bagli.current || !gorev) return
    flushSync(() => gonder({ tur: 'birlesti' }))
    // Doğru: efekt ve parıltı. Sınır adımı yoksa kelime kuruldu, ardından söylenir; varsa
    // kelimeyi çocuğun seçeceği karo kurar.
    sonuc('dogru', !sinir && adim ? adim.bicim : [])
    akis.dogruGorundu()
    parlat(hedefRef.current?.querySelector('.uyduruk__ad'))
    if (oge) {
      oge.style.transform = ''
      oge.style.opacity = ''
    }
    const ekBelirir = oynat(
      hedefRef.current?.querySelector('.ek-yazisi'),
      [
        { transform: 'scale(0.3)', opacity: 0 },
        { transform: 'scale(1.15)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      { duration: 220, easing: 'ease-out' },
    )
    // Sınır adımı varsa tezgâh gelir; çocuk karoyu seçince büyü olur. Yoksa büyü ekin
    // belirişine bindirilir.
    if (sinir) {
      await ekBelirir
      return
    }
    await Promise.all([
      ekBelirir,
      (async () => {
        await bekle(100)
        await buyuyuOynat(null)
      })(),
    ])
  }

  /** Kökteki ünlünün etiketi ile bukalemunun gözü arasında bir yay parlar. */
  async function yayiParlat(oge: HTMLElement, parca: EkParcasi) {
    const yay = yayRef.current
    const etiket = hedefRef.current?.querySelector('.uyduruk__ad .unlu-etiketi')
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
    yay.classList.toggle('uyduruk__yay--ince', !ozellikler.kalin)
    yay.classList.add('uyduruk__yay--gorunur')
    await Promise.all(
      yollar.map((yol) =>
        oynat(
          yol,
          [
            { strokeDasharray: uzunluk, strokeDashoffset: uzunluk },
            { strokeDasharray: uzunluk, strokeDashoffset: '0' },
          ],
          { duration: 180, easing: 'ease-out' },
        ),
      ),
    )
    const parlak = { strokeWidth: '22', opacity: 0.6 }
    const sonuk = { strokeWidth: '14', opacity: 0.35 }
    await oynat(yay.querySelector('.uyduruk__yay-hale'), [sonuk, parlak, sonuk], {
      duration: 240,
      easing: 'ease-in-out',
    })
    yay.classList.remove('uyduruk__yay--gorunur')
    await oynat(yay, [{ opacity: 1 }, { opacity: 0 }], { duration: 100 })
    for (const yol of yollar) yol.removeAttribute('d')
  }

  /** Yanlış bukalemun: -12 derece eğilir, düşer, kıyıya döner; neden görünür. */
  async function dusus(oge: HTMLButtonElement | undefined, kayma: Nokta, cumle: string) {
    if (oge && !hareketAzMi()) {
      const hedef = yapismaNoktasi(oge, kayma)
      oge.style.transform = kaydir(hedef)
      await oynat(oge, [{ transform: kaydir(kayma) }, { transform: kaydir(hedef) }], {
        duration: 200,
        easing: 'cubic-bezier(.3, .7, .4, 1)',
      })
      oge.style.transformOrigin = '45% 85%'
      const egik = `${kaydir(hedef)} rotate(-12deg)`
      oge.style.transform = egik
      await oynat(oge, [{ transform: `${kaydir(hedef)} rotate(0deg)` }, { transform: egik }], {
        duration: 140,
        easing: 'ease-out',
      })
      await bekle(160)
      const dusmus = `${kaydir({ x: hedef.x - 16, y: hedef.y + 150 })} rotate(-34deg)`
      oge.style.transform = dusmus
      oge.style.opacity = '0'
      await oynat(
        oge,
        [
          { transform: egik, opacity: 1 },
          { transform: dusmus, opacity: 0 },
        ],
        { duration: 340, easing: 'cubic-bezier(.5, 0, .9, .5)' },
      )
    }
    if (!bagli.current) return
    flushSync(() => gonder({ tur: 'dustu' }))
    sonuc('yanlis', cumle)
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
      { duration: 260, easing: 'ease-out' },
    )
  }

  // --- Taşıma: sınırdaki karo -------------------------------------------------------------

  /** Karo yuvaya taşındı: iki karo da doğrudur. Jöle seçildiyse kökün taşı erir. */
  async function karoyuTasi(karo: KaroTuru, kayma: Nokta = DURAGAN) {
    if (!gorev || !sinir || evre !== 'sinir') return
    // Pilotun günlüğü: iki karo da doğrudur; doğru biçim ikisi (gıvakım/gıvağım).
    kaydet('sinir', {
      dogruBicim: gorevinSonBicimi(bolge.kimlik, gorev.kok, gorev.etiketler),
      secilen: karoHarfi(sinir, karo),
      aday: kurulanBicim(gorev, sinir, karo).bicim,
      dogru: true,
      neden: '',
    })
    // İki karo da doğru: sınır adımı hep ilk denemedir.
    akis.dene('sinir', true, true)
    flushSync(() => gonder({ tur: 'karoDene', karo }))
    const oge = karolar.current.get(karo)
    if (oge && !hareketAzMi()) {
      const yuva = yuvaRef.current?.getBoundingClientRect()
      const kutu = oge.querySelector('.karo')?.getBoundingClientRect() ?? oge.getBoundingClientRect()
      const hedef = yuva
        ? {
            x: yuva.left + yuva.width / 2 - (kutu.left - kayma.x + kutu.width / 2),
            y: yuva.top + yuva.height / 2 - (kutu.top - kayma.y + kutu.height / 2),
          }
        : kayma
      oge.style.transform = kaydir(hedef)
      await oynat(oge, [{ transform: kaydir(kayma) }, { transform: kaydir(hedef) }], {
        duration: 200,
        easing: 'cubic-bezier(.3, .7, .4, 1)',
      })
    }
    if (!bagli.current) return
    const eriyecek = karo !== sinir.asil
    flushSync(() => setYuvadaki(eriyecek ? sinir.asil : karo))
    // İki karo da doğru: efekt ve parıltı, ardından (sesli modda) kelime ve İkisi de olur.
    sonuc('dogru', [kurulanBicim(gorev, sinir, karo).bicim, sinirCumlesi(gorev)])
    akis.dogruGorundu()
    parlat(hedefRef.current?.querySelector('.uyduruk__ad'))
    if (oge) oge.style.transform = ''
    const yuva = yuvaRef.current
    if (eriyecek) {
      await bekle(120)
      await oynat(
        yuva,
        [
          { transform: 'scale(1, 1)' },
          { transform: 'scale(1.18, 0.7)', offset: 0.7 },
          { transform: 'scale(1.25, 0.5)' },
        ],
        { duration: 260, easing: 'ease-in' },
      )
      if (!bagli.current) return
      flushSync(() => setYuvadaki(karo))
      await oynat(
        yuva,
        [
          { transform: 'scale(1.25, 0.5)' },
          { transform: 'scale(0.92, 1.1)', offset: 0.6 },
          { transform: 'scale(1, 1)' },
        ],
        { duration: 220, easing: 'ease-out' },
      )
    } else {
      await oynat(yuva, [{ transform: 'scale(1.1)' }, { transform: 'scale(1)' }], {
        duration: 180,
        easing: 'ease-out',
      })
    }
    await bekle(60)
    if (!bagli.current) return
    flushSync(() => gonder({ tur: 'buyuye' }))
    await buyuyuOynat(karo)
  }

  // --- Büyü -------------------------------------------------------------------------------

  /** Büyü yaratığa olur; sonra görev biter ve kabuk hemen kaydeder. */
  async function buyuyuOynat(karo: KaroTuru | null) {
    if (!gorev || !adim) return
    const tur = UYDURUK_BUYULERI[adim.etiket]
    if (tur) buyuSesi()
    if (tur === 'cebe girer') await cebeKoy()
    else {
      flushSync(() => gonder({ tur: 'etki' }))
      if (tur) await buyuHareketi(tur)
    }
    await bekle(tur ? 80 : 0)
    if (!bagli.current) return
    flushSync(() => gonder({ tur: 'bitti' }))
    // Görev bitti: kabuk hemen kaydeder; kart çocuğun kurduğu biçimdir.
    onGorevBitti?.(gorev, undefined, kurulanBicim(gorev, sinir, karo).bicim)
  }

  async function buyuHareketi(tur: UydurukBuyusu) {
    const grup = yaratiklarRef.current
    if (tur === 'çoğalır') {
      const kopyalar = [...(grup?.querySelectorAll('.uyduruk__kopya') ?? [])]
      await Promise.all(
        kopyalar.map((kopya) =>
          oynat(
            kopya,
            [
              { transform: 'none', opacity: 0 },
              { transform: getComputedStyle(kopya).transform, opacity: 1 },
            ],
            { duration: 320, easing: 'cubic-bezier(.3, .7, .4, 1.3)' },
          ),
        ),
      )
      return
    }
    const yildiz = grup?.querySelector('.uyduruk__yildiz')
    if (!yildiz) return
    if (tur === 'yıldız üstünde') {
      // Bulunma: yıldız yukarıdan iner, yaratığın üstünde durur.
      await oynat(
        yildiz,
        [
          { transform: 'translate(-50%, -2.5rem)', opacity: 0 },
          { transform: 'translate(-50%, 0.3rem)', opacity: 1, offset: 0.75 },
          { transform: 'translate(-50%, 0)', opacity: 1 },
        ],
        { duration: 380, easing: 'ease-out' },
      )
      return
    }
    // Yönelme: yıldız ekranın sağından yaratığa doğru uçar.
    const kutu = yildiz.getBoundingClientRect()
    const uzak = document.documentElement.clientWidth - kutu.left
    await oynat(
      yildiz,
      [
        { transform: `translate(${uzak}px, -3rem) rotate(90deg)`, opacity: 0 },
        { transform: `translate(${uzak * 0.5}px, -2.5rem) rotate(45deg)`, opacity: 1, offset: 0.4 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 420, easing: 'cubic-bezier(.4, 0, .3, 1)' },
    )
  }

  /** İyelik: yaratık cebe girer (FLIP; cebin önü onu örter). */
  async function cebeKoy() {
    const once = yaratiklarRef.current?.getBoundingClientRect()
    flushSync(() => gonder({ tur: 'etki' }))
    const grup = yaratiklarRef.current
    if (!once || !grup || hareketAzMi()) return
    const sonra = grup.getBoundingClientRect()
    const olcek = sonra.width / grup.offsetWidth
    const kx = (once.left + once.width / 2 - (sonra.left + sonra.width / 2)) / olcek
    const ky = (once.top + once.height / 2 - (sonra.top + sonra.height / 2)) / olcek
    await oynat(
      grup,
      [
        { transform: `translate(${kx}px, ${ky}px) scale(${once.width / sonra.width})` },
        { transform: 'none' },
      ],
      { duration: 380, easing: 'cubic-bezier(.45, 0, .3, 1)' },
    )
  }

  /** Yaratığın dışına bırakılan bukalemun ya da karo yerine döner. */
  async function geriDon(oge: HTMLElement, kayma: Nokta) {
    oge.style.transform = ''
    await oynat(oge, [{ transform: kaydir(kayma) }, { transform: 'none' }], {
      duration: 200,
      easing: 'ease-out',
    })
  }

  // --- Sürükle-bırak (Pointer Events) -----------------------------------------------------

  const tasinabilir = (tasinan: Tasinan) =>
    tasinan.tur === 'bukalemun' ? secimde : sinirda

  function hedefinUstunde(x: number, y: number): boolean {
    const kutu = hedefRef.current?.getBoundingClientRect()
    return (
      kutu !== undefined &&
      x >= kutu.left - BIRAKMA_PAYI &&
      x <= kutu.right + BIRAKMA_PAYI &&
      y >= kutu.top - BIRAKMA_PAYI &&
      y <= kutu.bottom + BIRAKMA_PAYI
    )
  }

  function tutmaBasladi(e: PointerEvent<HTMLButtonElement>, tasinan: Tasinan) {
    tiklamayiYut.current = false
    if (!tasinabilir(tasinan) || !e.isPrimary || e.button !== 0) return
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
      tasinan,
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
      e.currentTarget.classList.add('uyduruk__tasinan')
      adayiSoyle(s.tasinan)
    }
    e.currentTarget.style.transform = kaydir(s.kayma)
    hedefRef.current?.classList.toggle(
      'uyduruk__hedef--ustunde',
      hedefinUstunde(e.clientX, e.clientY),
    )
  }

  function tutmaBitti(e: PointerEvent<HTMLButtonElement>, iptal: boolean) {
    const s = surukleme.current
    if (!s || s.isaretci !== e.pointerId) return
    surukleme.current = null
    const oge = e.currentTarget
    oge.classList.remove('uyduruk__tasinan')
    hedefRef.current?.classList.remove('uyduruk__hedef--ustunde')
    if (!s.suruklendi) return
    // Sürüklemenin sonundaki tıklama seçim sayılmaz.
    tiklamayiYut.current = true
    if (iptal || !hedefinUstunde(e.clientX, e.clientY)) void geriDon(oge, s.kayma)
    else if (s.tasinan.tur === 'bukalemun') void tasi(s.tasinan.yuzey, s.kayma)
    else void karoyuTasi(s.tasinan.karo, s.kayma)
  }

  const tutma = (tasinan: Tasinan) => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => tutmaBasladi(e, tasinan),
    onPointerMove: tutmaSurdu,
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => tutmaBitti(e, false),
    onPointerCancel: (e: PointerEvent<HTMLButtonElement>) => tutmaBitti(e, true),
  })

  // --- Dokun-dokun ve klavye ----------------------------------------------------------------

  /** Klavyenin tıklamasında detail 0'dır; o hiç yutulmaz. */
  function tiklamaYutulsunMu(e: MouseEvent<HTMLButtonElement>): boolean {
    const yut = tiklamayiYut.current && e.detail !== 0
    tiklamayiYut.current = false
    return yut
  }

  function bukalemunaDokunuldu(e: MouseEvent<HTMLButtonElement>, yuzey: string) {
    if (tiklamaYutulsunMu(e) || !secimde) return
    const secilecek = durum.secili !== yuzey
    gonder({ tur: 'sec', yuzey })
    if (secilecek) adayiSoyle({ tur: 'bukalemun', yuzey })
    // Seçilen bukalemun yaratığa götürülmeyi bekler: odak yaratığa geçer.
    if (secilecek) hedefRef.current?.focus()
  }

  function karoyaDokunuldu(e: MouseEvent<HTMLButtonElement>, karo: KaroTuru) {
    if (tiklamaYutulsunMu(e) || !sinirda) return
    const secilecek = durum.seciliKaro !== karo
    gonder({ tur: 'karoSec', karo })
    if (secilecek) adayiSoyle({ tur: 'karo', karo })
    if (secilecek) hedefRef.current?.focus()
  }

  function hedefeDokunuldu() {
    if (secimde && durum.secili !== null) void tasi(durum.secili)
    else if (sinirda && durum.seciliKaro !== null) void karoyuTasi(durum.seciliKaro)
  }

  function tusaBasildi(e: KeyboardEvent) {
    if (e.key !== 'Escape') return
    if (durum.secili !== null) {
      const secili = durum.secili
      gonder({ tur: 'sec', yuzey: secili })
      bukalemunlar.current.get(secili)?.focus()
    } else if (durum.seciliKaro !== null) {
      const secili = durum.seciliKaro
      gonder({ tur: 'karoSec', karo: secili })
      karolar.current.get(secili)?.focus()
    }
  }

  // --- Görünüm ----------------------------------------------------------------------------

  const hedefAdi = kurulan
    ? kurulan.bicim
    : tezgahta && sinir
      ? `${sinir.sol} … ${sinir.sag}`
      : birlesen
        ? birlesen.govde + birlesen.yuzey
        : gorev.kok
  const seciliVar = durum.secili !== null || durum.seciliKaro !== null
  const yuva = (
    <span ref={yuvaRef} className={yuvadaki ? 'uyduruk__yuva uyduruk__yuva--dolu' : 'uyduruk__yuva'} aria-hidden="true">
      {yuvadaki && sinir && <Karo karo={yuvadaki} harf={karoHarfi(sinir, yuvadaki)} />}
    </span>
  )
  const adYazisi = (
    <span className="uyduruk__ad" aria-hidden="true">
      {tezgahta && sinir && birlesen ? (
        <>
          <EtiketliKok kok={gorev.kok.slice(0, -1)} />
          {yuva}
          <EkYazisi parca={birlesen} />
        </>
      ) : birlesen ? (
        <>
          <EtiketliKok kok={birlesen.govde} />
          <EkYazisi parca={birlesen} />
        </>
      ) : (
        <EtiketliKok kok={gorev.kok} />
      )}
    </span>
  )
  const yaratiklar = (
    <div className="uyduruk__yaratiklar" ref={yaratiklarRef}>
      {buyu === 'çoğalır' &&
        [1, 2].map((n) => (
          <span key={n} className={`uyduruk__kopya uyduruk__kopya--${n}`} aria-hidden="true">
            <Yaratik kok={gorev.kok} boyut={YARATIK_BOYU} adsiz />
          </span>
        ))}
      <span className="uyduruk__yaratik" aria-hidden="true">
        <Yaratik kok={gorev.kok} boyut={YARATIK_BOYU} adsiz />
      </span>
      {(buyu === 'yıldız üstünde' || buyu === 'yıldız gelir') && (
        <span
          className={`uyduruk__yildiz uyduruk__yildiz--${buyu === 'yıldız üstünde' ? 'ustte' : 'yanda'}`}
        >
          {buyu === 'yıldız gelir' && <span className="uyduruk__iz" aria-hidden="true" />}
          <Yildiz boyut={1.1} />
        </span>
      )}
    </div>
  )

  return (
    <main className="uyduruk" data-evre={evre} onKeyDown={tusaBasildi}>
      <BolgeUstu
        ad={bolge.ad}
        gorevYeri={durum.gorevYeri}
        gorevSayisi={durum.gorevler.length}
        tur={gorev.tur}
        puan={akis.puan.puan}
        onHarita={onHarita}
        baslikRef={baslikRef}
      />
      <p id="uyduruk-yonerge" className="gizli">
        {tezgahta
          ? 'Bir karoyu yaratığın adındaki boş yuvaya taşı: sürükle, ya da önce karoya sonra yaratığa dokun. Taş sert, jöle yumuşak.'
          : 'Bir bukalemunu yaratığa taşı: sürükle, ya da önce bukalemuna sonra yaratığa dokun.'}
      </p>

      <section className="uyduruk__sahne" aria-label="Yaratık">
        {!cepte && (
          <div className="uyduruk__hedefyeri">
            <Hoparlor
              metin={kurulan ? kurulan.bicim : birlesen && !tezgahta ? adim.bicim : gorev.kok}
              sinif="hoparlor--kose"
            />
            <button
              ref={hedefRef}
              type="button"
              className={seciliVar ? 'uyduruk__hedef uyduruk__hedef--bekliyor' : 'uyduruk__hedef'}
              aria-label={hedefAdi}
              aria-describedby="uyduruk-yonerge"
              onClick={hedefeDokunuldu}
            >
              {yaratiklar}
              {adYazisi}
            </button>
          </div>
        )}
        <div className="uyduruk__alt">
          <div className="uyduruk__neden" role="status">
            {durum.yanlis && <NedenYazisi deneme={durum.yanlis} />}
            {tezgahta && durum.karo && (
              <p className="uyduruk__cumle sesli-cumle">
                <Hoparlor metin={sinirCumlesi(gorev)} />
                <span>{sinirCumlesi(gorev)}</span>
              </p>
            )}
          </div>
          {evre === 'bitti' && !akis.kendiliginden && (
            <button ref={sonrakiRef} type="button" className="uyduruk__dugme" onClick={sonrakiGorev}>
              <SiradakiSimgesi />
              Sıradaki
            </button>
          )}
          <p className="gizli" role="status">
            {evre === 'bitti' ? (kurulan?.bicim ?? '') : akis.duyuru}
          </p>
        </div>
      </section>

      <svg
        className="uyduruk__dalga"
        viewBox="0 0 320 12"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 6Q20 0 40 6T80 6T120 6T160 6T200 6T240 6T280 6T320 6" />
      </svg>

      {tezgahta && sinir ? (
        <ul className="uyduruk__tezgah" aria-label="Tezgâh">
          {TEZGAH.map((karo) => {
            const harf = karoHarfi(sinir, karo)
            const siniflar = [
              'uyduruk__karo',
              durum.karo === karo && 'uyduruk__karo--oturdu',
            ]
            return (
              <li key={`${durum.gorevYeri}:${karo}`} className="uyduruk__karo-yeri">
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
                  aria-pressed={durum.seciliKaro === karo}
                  aria-disabled={!sinirda}
                  onClick={(e) => karoyaDokunuldu(e, karo)}
                  {...tutma({ tur: 'karo', karo })}
                >
                  <Karo karo={karo} harf={harf} />
                  <span className="uyduruk__karo-turu" aria-hidden="true">
                    {karoTuru(karo)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul className="uyduruk__kiyi" aria-label="Bukalemunlar">
          {adim.secenekler.map((secenek) => {
            const { yuzey } = secenek
            const siniflar = [
              'uyduruk__bukalemun',
              durum.deneme?.yuzey === yuzey && 'uyduruk__bukalemun--etkin',
              birlesen?.yuzey === yuzey && 'uyduruk__bukalemun--birlesti',
            ]
            return (
              <li key={`${durum.gorevYeri}:${yuzey}`} className="uyduruk__yer">
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
                  {...tutma({ tur: 'bukalemun', yuzey })}
                >
                  <Bukalemun parca={secenek.parca} />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {cepli && (
        <div className="uyduruk__cep" aria-hidden="true">
          {cepte && <div className="uyduruk__cep-yuva">{yaratiklar}</div>}
          <svg className="uyduruk__cep-on" viewBox="0 0 200 64" preserveAspectRatio="none">
            <path className="uyduruk__cep-govde" d={CEP_GOVDESI} />
            <path className="uyduruk__cep-dikis" d={CEP_DIKISI} />
          </svg>
          {cepte && kurulan && (
            <span className="uyduruk__cep-yazi">
              <KurulanKelime kok={gorev.kok} etiketler={gorev.etiketler} kelime={kurulan.bicim} />
            </span>
          )}
        </div>
      )}

      <svg className="uyduruk__yay" ref={yayRef} aria-hidden="true">
        <path className="uyduruk__yay-hale" />
        <path className="uyduruk__yay-yolu" />
      </svg>
    </main>
  )
}

const unluMu = (harf: string | undefined): harf is Unlu =>
  harf !== undefined && Object.hasOwn(UNLULER, harf)

/** Yanlış taşımanın nedeni: aday (üstü çizili), ilgili iki sesi vurgulu; altında cümle. */
function NedenYazisi({ deneme }: { deneme: Deneme }): ReactNode {
  const ilgili = ilgiliSesler(deneme.nedenler[0])
  const harfler = [...deneme.aday]
  return (
    <>
      <p className="uyduruk__aday" aria-hidden="true">
        {harfler.map((harf, i) => {
          if (!ilgili?.includes(i)) return harf
          return unluMu(harf) ? (
            <UnluEtiketi key={i} unlu={harf} />
          ) : (
            <span key={i} className="uyduruk__ses">
              {harf}
            </span>
          )
        })}
      </p>
      {deneme.cumle && (
        <p className="uyduruk__cumle sesli-cumle">
          <Hoparlor metin={deneme.cumle} />
          <span>{deneme.cumle}</span>
        </p>
      )}
    </>
  )
}
