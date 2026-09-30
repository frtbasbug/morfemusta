// Kök Bahçesi (DESIGN.md, "Kök Bahçesi"). Her görev bir ağaçtır: dibinde kök, tabelada hedef
// kelime (gözlükçüler). Sepette hedefin ekleri bukalemun olarak durur, motorun yüzeyleriyle ve
// karışık sırada. Çocuk ekleri sırayla ağaca taşır: sürükle-bırak (Pointer Events),
// dokun-dokun (önce ek, sonra ağaç) ya da klavye (Tab ve Enter). Bu bölgede çocuk ünlü ya da
// ünsüz seçmez; ekin kılığını motor verir.
//
// Doğruysa yapım eki gövdeyi bir halka büyütür ve yeni kelime kart olarak düşer; çekim eki
// meyve olur, tepeye asılır, kart düşürmez. Büyüler kartlarda görünür: -CIk kartı küçültür,
// -lI önceki gövdenin küçük kartını yeni kartın üstüne koyar, -sIz onu siler (yerinde kesikli
// boş çerçeve kalır); -lAr meyveyi üçe çoğaltır, -(I)m meyveyi cebe koyar. Meyve gövdenin
// sonundaki taşı jöleye eritir (kalemlik → kalemliğim). Yanlışsa ek dala tutunamaz, sallanıp
// sepete döner; cümlesi görünür. Ceza, puan ve süre yok.
//
// Oyunun durumu src/oyun/bahce.ts'teki indirgeyicidedir; bu dosya görünümü ve hareketleri
// yazar. Hareketler Web Animations API iledir (hareket.ts); hareket azaltma açıksa hiçbiri
// oynamaz, yalnız durum değişir. Kabuk Bukalemun Koyu'nunkiyle aynıdır: çocuk kaldığı
// görevden sürdürür (baslangic), her görev bitince kabuk ilerlemeyi ve gövde kelimelerinin
// kartlarını kaydeder (onGorevBitti), görevler bitince ortak akşam ekranı açılır.

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react'
import { flushSync } from 'react-dom'
import Agac, { Meyve, type AgacHalkasi } from '../gorsel/Agac.tsx'
import { meyveSayisi } from '../gorsel/agac.ts'
import Bukalemun from '../gorsel/Bukalemun.tsx'
import { CEP_DIKISI, CEP_GOVDESI, CEP_KUTUSU } from '../gorsel/cep.ts'
import Karo from '../gorsel/Karo.tsx'
import KokYazisi from '../gorsel/KokYazisi.tsx'
import KurulanKelime from '../gorsel/KurulanKelime.tsx'
import '../gorsel/tema.css'
import {
  agactakiler,
  bahceBaslangici,
  bahceIndirgeyici,
  buyusu,
  denemeyiDegerlendir,
  dogruMu,
  govdeDegisimi,
  kartEtiketleri,
  oynananGorev,
  sepettekiler,
  simdikiKelime,
  type BahceGorevi,
  type BahceParcasi,
  type GovdeKelimesi,
} from '../oyun/bahce.ts'
import type { Bolge } from '../oyun/bolgeler.ts'
import type { Gorev } from '../oyun/gorevler.ts'
import type { SozlukKarti } from '../oyun/ilerleme.ts'
import AksamEkrani from './AksamEkrani.tsx'
import BolgeUstu from './BolgeUstu.tsx'
import { bekle, hareketAzMi, hareketleriKes, kaydir, oynat, type Nokta } from './hareket.ts'
import './KokBahcesi.css'

/** Sürükleme sayılan en kısa yol (px); daha kısası dokunmadır. */
const SURUKLEME_ESIGI = 8
/** Ağacın çevresinde bırakmanın yine de ağaçta sayıldığı pay (px). */
const BIRAKMA_PAYI = 24
const DURAGAN: Nokta = { x: 0, y: 0 }

interface Surukleme {
  readonly sira: number
  readonly isaretci: number
  readonly baslangic: Nokta
  kayma: Nokta
  suruklendi: boolean
}

export default function KokBahcesi({
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
  /**
   * Bir ağaç bitti: kabuk ilerlemeyi ve kartları kaydeder. Kartlar yalnız gövde kelimeleridir
   * (çiçekçi; çiçekçiler değil).
   */
  readonly onGorevBitti?: (gorev: Gorev, kartEkleri: readonly (readonly string[])[]) => void
  /** Haritaya dönüş; verilmezse düğmesi çıkmaz. */
  readonly onHarita?: () => void
}) {
  const { gorevler } = bolge
  const [durum, gonder] = useReducer(bahceIndirgeyici, baslangic, (yer) =>
    bahceBaslangici(gorevler, yer),
  )
  const gorev = oynananGorev(durum)
  const { bahce, evre, kurulan } = durum
  // Meyve gelince gövdenin sonundaki taş önce görünür, sonra jöleye erir.
  const [eriyor, setEriyor] = useState(false)
  // -sIz: önceki gövdenin küçük kartı önce görünür, sonra silinir (kartın sırası).
  const [silinen, setSilinen] = useState<number | null>(null)

  const baslikRef = useRef<HTMLHeadingElement>(null)
  const agacRef = useRef<HTMLButtonElement>(null)
  const kartlarRef = useRef<HTMLUListElement>(null)
  const cepRef = useRef<HTMLDivElement>(null)
  const sonrakiRef = useRef<HTMLButtonElement>(null)
  const bukalemunlar = useRef(new Map<number, HTMLButtonElement>())
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

  // Klavyeyle oynayan için odak: ağaç bitince Sıradaki'ye, yeni ağaçta sepetteki ilk eke.
  // Akşam ekranı odağı kendi başlığına alır.
  useEffect(() => {
    if (evre === 'bitti') sonrakiRef.current?.focus()
  }, [evre])

  useEffect(() => {
    if (gorulenGorev.current === durum.gorevYeri) return
    gorulenGorev.current = durum.gorevYeri
    const ilk = durum.bahce?.sepet[0]
    if (ilk !== undefined) bukalemunlar.current.get(ilk)?.focus()
  }, [durum.gorevYeri, durum.bahce])

  if (evre === 'kapanis' || !gorev || !bahce) {
    return <AksamEkrani baslik={bolge.aksam} kartlar={bugunkuKartlar} onHarita={onHarita} />
  }

  const secimde = evre === 'secim'
  const agacta = agactakiler(durum)
  const sepet = sepettekiler(durum)
  const simdiki = simdikiKelime(bahce, kurulan)
  const meyveParcasi = agacta.find((p) => p.tur === 'çekim')
  const degisim = meyveParcasi ? govdeDegisimi(bahce, meyveParcasi.sira) : null
  const cepli = bahce.parcalar.some((p) => buyusu(p) === 'cebe koyar')
  const meyveCepte = meyveParcasi !== undefined && buyusu(meyveParcasi) === 'cebe koyar'

  // --- Taşıma ---------------------------------------------------------------------------

  /** Ek ağaca taşındı: doğruysa dala tutunur, yanlışsa sallanıp sepete döner. */
  async function tasi(sira: number, kayma: Nokta = DURAGAN) {
    if (!gorev || !bahce || evre !== 'secim') return
    const parca = bahce.parcalar[sira]
    if (!parca) return
    const dogru = dogruMu(denemeyiDegerlendir(bahce, kurulan, sira))
    flushSync(() => gonder({ tur: 'dene', sira }))
    const oge = bukalemunlar.current.get(sira)
    if (dogru) await tutun(oge, parca, kayma)
    else await sallan(oge, kayma)
  }

  /** Bukalemunun ağaçta duracağı yer: tacın altı, gövdenin tepesi (translate). */
  function dalNoktasi(oge: HTMLElement, kayma: Nokta): Nokta {
    const tac = agacRef.current?.querySelector('.agac__tac')?.getBoundingClientRect()
    if (!tac) return kayma
    const kutu = oge.getBoundingClientRect()
    const taban = { x: kutu.left - kayma.x, y: kutu.top - kayma.y }
    return {
      x: tac.left + tac.width / 2 - kutu.width / 2 - taban.x,
      y: tac.bottom - kutu.height * 0.6 - taban.y,
    }
  }

  /** Bukalemun sepetten (ya da bırakıldığı yerden) ağaca uçar. */
  async function agacaUc(oge: HTMLElement, kayma: Nokta): Promise<Nokta> {
    const hedef = dalNoktasi(oge, kayma)
    oge.style.transform = kaydir(hedef)
    await oynat(oge, [{ transform: kaydir(kayma) }, { transform: kaydir(hedef) }], {
      duration: 340,
      easing: 'cubic-bezier(.3, .7, .4, 1)',
    })
    return hedef
  }

  /** Doğru taşıma: ek dala tutunur; halka büyür ya da meyve asılır; sonra büyü. */
  async function tutun(oge: HTMLButtonElement | undefined, parca: BahceParcasi, kayma: Nokta) {
    if (!gorev || !bahce) return
    const hareketli = !hareketAzMi()
    if (oge && hareketli) {
      const hedef = await agacaUc(oge, kayma)
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
    const buyu = buyusu(parca)
    const eriyecek = hareketli && govdeDegisimi(bahce, parca.sira) !== null
    flushSync(() => {
      if (eriyecek) setEriyor(true)
      if (buyu === 'eksiltir' && hareketli) setSilinen(parca.sira)
      gonder({ tur: 'tutundu' })
    })
    if (oge) {
      oge.style.transform = ''
      oge.style.opacity = ''
    }

    if (parca.tur === 'yapım') await halkaBuyut(buyu)
    else await meyveAs(buyu)
    if (eriyecek) await erit()

    await bekle(350)
    if (!bagli.current) return
    const bitti = kurulan + 1 === bahce.parcalar.length
    flushSync(() => gonder({ tur: 'buyuBitti' }))
    // Ağaç tamam: kabuk kaydeder; kartlar yalnız gövde kelimeleri.
    if (bitti) onGorevBitti?.(gorev, kartEtiketleri(bahce))
  }

  /** Yeni halka gövdenin tepesinde büyür, gövde kelimesi kart olarak düşer. */
  async function halkaBuyut(buyu: string) {
    const agac = agacRef.current
    await oynat(
      agac?.querySelector('.agac__halka'),
      [
        { transform: 'scaleY(0)', transformOrigin: '50% 100%' },
        { transform: 'scaleY(1.1)', transformOrigin: '50% 100%', offset: 0.7 },
        { transform: 'scaleY(1)', transformOrigin: '50% 100%' },
      ],
      { duration: 380, easing: 'ease-out' },
    )
    const kart = kartlarRef.current?.lastElementChild
    await oynat(
      kart?.querySelector('.bahce-karti'),
      [
        { transform: 'translateY(-3rem) rotate(-8deg)', opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 420, easing: 'cubic-bezier(.3, .7, .4, 1.3)' },
    )
    const kucuk = kart?.querySelector('.bahce-karti__onceki')
    if (buyu === 'katar') {
      // -lI katar: önceki gövdenin küçük kartı yeni kartın üstüne konur.
      await oynat(
        kucuk,
        [
          { transform: 'translateY(-2rem)', opacity: 0 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 360, easing: 'ease-out' },
      )
    } else if (buyu === 'eksiltir') {
      // -sIz eksiltir: küçük kart silinir, yerinde kesikli boş çerçeve kalır.
      await bekle(450)
      await oynat(
        kucuk?.firstElementChild,
        [
          { transform: 'none', opacity: 1 },
          { transform: 'scale(0.3)', opacity: 0 },
        ],
        { duration: 360, easing: 'ease-in' },
      )
      if (!bagli.current) return
      flushSync(() => setSilinen(null))
    }
  }

  /** Meyve tacın ucunda asılır; çoğulda üçe çoğalır, iyelikte cebe girer. */
  async function meyveAs(buyu: string) {
    if (buyu === 'cebe koyar') {
      await oynat(
        cepRef.current?.querySelector('.meyve'),
        [
          { transform: 'translateY(-6rem)', opacity: 0 },
          { transform: 'translateY(-6rem)', opacity: 1, offset: 0.25 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: 700, easing: 'cubic-bezier(.45, 0, .3, 1)' },
      )
      return
    }
    const meyveler = agacRef.current?.querySelector('.agac__meyveler')
    await oynat(
      meyveler?.querySelector('.meyve:not(.meyve--kopya)'),
      [
        { transform: 'scale(0.2)', opacity: 0 },
        { transform: 'scale(1.15)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      { duration: 360, easing: 'ease-out' },
    )
    const kopyalar = [...(meyveler?.querySelectorAll('.meyve--kopya') ?? [])]
    if (buyu !== 'çoğaltır' || kopyalar.length === 0) return
    await bekle(150)
    const orta = meyveler?.querySelector('.meyve:not(.meyve--kopya)')?.getBoundingClientRect()
    await Promise.all(
      kopyalar.map((kopya) => {
        const kutu = kopya.getBoundingClientRect()
        const dx = orta ? orta.left - kutu.left : 0
        return oynat(
          kopya,
          [
            { transform: `translateX(${dx}px)`, opacity: 0 },
            { transform: 'none', opacity: 1 },
          ],
          { duration: 420, easing: 'cubic-bezier(.3, .7, .4, 1.3)' },
        )
      }),
    )
  }

  /** Gövdenin sonundaki taş jöleye erir (Dükkân'daki gibi): kalemlik → kalemliğim. */
  async function erit() {
    const yuva = agacRef.current?.querySelector('.bahce__yuva')
    await bekle(300)
    await oynat(
      yuva,
      [
        { transform: 'scale(1, 1)' },
        { transform: 'scale(1.18, 0.7)', offset: 0.7 },
        { transform: 'scale(1.25, 0.5)' },
      ],
      { duration: 420, easing: 'ease-in' },
    )
    if (!bagli.current) return
    flushSync(() => setEriyor(false))
    await oynat(
      agacRef.current?.querySelector('.bahce__yuva'),
      [
        { transform: 'scale(1.25, 0.5)' },
        { transform: 'scale(0.92, 1.1)', offset: 0.6 },
        { transform: 'scale(1, 1)' },
      ],
      { duration: 360, easing: 'ease-out' },
    )
  }

  /** Yanlış taşıma: ek dala tutunamaz, sallanır, sepete döner; cümle görünür. */
  async function sallan(oge: HTMLButtonElement | undefined, kayma: Nokta) {
    if (oge && !hareketAzMi()) {
      const hedef = await agacaUc(oge, kayma)
      const egik = (aci: number, dy = 0) => `${kaydir({ x: hedef.x, y: hedef.y + dy })} rotate(${aci}deg)`
      oge.style.transformOrigin = '50% 10%'
      await oynat(
        oge,
        [
          { transform: egik(0) },
          { transform: egik(-14), offset: 0.2 },
          { transform: egik(11), offset: 0.45 },
          { transform: egik(-7), offset: 0.7 },
          { transform: egik(0, 6) },
        ],
        { duration: 520, easing: 'ease-in-out' },
      )
      oge.style.transform = ''
      oge.style.transformOrigin = ''
      await oynat(oge, [{ transform: egik(0, 6) }, { transform: 'none' }], {
        duration: 380,
        easing: 'cubic-bezier(.5, 0, .5, 1)',
      })
    }
    if (!bagli.current) return
    flushSync(() => gonder({ tur: 'dondu' }))
    if (oge) oge.style.transform = ''
  }

  /** Ağacın dışına bırakılan ek yerine döner. */
  async function geriDon(oge: HTMLElement, kayma: Nokta) {
    oge.style.transform = ''
    await oynat(oge, [{ transform: kaydir(kayma) }, { transform: 'none' }], {
      duration: 240,
      easing: 'ease-out',
    })
  }

  function sonrakiAgac() {
    setEriyor(false)
    setSilinen(null)
    gonder({ tur: 'sonraki' })
  }

  // --- Sürükle-bırak (Pointer Events) -----------------------------------------------------

  function agacinUstunde(x: number, y: number): boolean {
    const kutu = agacRef.current?.getBoundingClientRect()
    return (
      kutu !== undefined &&
      x >= kutu.left - BIRAKMA_PAYI &&
      x <= kutu.right + BIRAKMA_PAYI &&
      y >= kutu.top - BIRAKMA_PAYI &&
      y <= kutu.bottom + BIRAKMA_PAYI
    )
  }

  function tutmaBasladi(e: PointerEvent<HTMLButtonElement>, sira: number) {
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
      sira,
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
      e.currentTarget.classList.add('sepet__ek--tasiniyor')
    }
    e.currentTarget.style.transform = kaydir(s.kayma)
    agacRef.current?.classList.toggle('bahce__agac--ustunde', agacinUstunde(e.clientX, e.clientY))
  }

  function tutmaBitti(e: PointerEvent<HTMLButtonElement>, iptal: boolean) {
    const s = surukleme.current
    if (!s || s.isaretci !== e.pointerId) return
    surukleme.current = null
    const oge = e.currentTarget
    oge.classList.remove('sepet__ek--tasiniyor')
    agacRef.current?.classList.remove('bahce__agac--ustunde')
    if (!s.suruklendi) return
    // Sürüklemenin sonundaki tıklama seçim sayılmaz.
    tiklamayiYut.current = true
    if (!iptal && agacinUstunde(e.clientX, e.clientY)) void tasi(s.sira, s.kayma)
    else void geriDon(oge, s.kayma)
  }

  // --- Dokun-dokun ve klavye ----------------------------------------------------------------

  function ekeDokunuldu(e: MouseEvent<HTMLButtonElement>, sira: number) {
    // Klavyenin tıklamasında detail 0'dır; o hiç yutulmaz.
    const yut = tiklamayiYut.current && e.detail !== 0
    tiklamayiYut.current = false
    if (yut || !secimde) return
    const secilecek = durum.secili !== sira
    gonder({ tur: 'sec', sira })
    // Seçilen ek ağaca götürülmeyi bekler: odak ağaca geçer.
    if (secilecek) agacRef.current?.focus()
  }

  function agacaDokunuldu() {
    if (secimde && durum.secili !== null) void tasi(durum.secili)
  }

  function tusaBasildi(e: KeyboardEvent) {
    if (e.key !== 'Escape' || durum.secili === null) return
    const secili = durum.secili
    gonder({ tur: 'sec', sira: secili })
    bukalemunlar.current.get(secili)?.focus()
  }

  // --- Görünüm ----------------------------------------------------------------------------

  const halkalar: AgacHalkasi[] = agacta
    .filter((p) => p.tur === 'yapım')
    .map((p, i, dizi) => {
      // Meyve gövdenin sonunu değiştirdiyse son halkanın son sesi bir karodur: önce taş,
      // sonra jöle.
      if (!degisim || i !== dizi.length - 1) return { parca: p.parca }
      const karo = eriyor ? 'taş' : 'jöle'
      const harf = eriyor ? degisim.tas : degisim.jole
      return {
        parca: p.parca,
        yuva: {
          konum: p.yuzey.length - 1,
          icerik: (
            <span className="bahce__yuva">
              <Karo karo={karo} harf={harf} />
            </span>
          ),
        },
      }
    })
  const meyve =
    meyveParcasi && !meyveCepte
      ? { parca: meyveParcasi.parca, sayi: meyveSayisi(meyveParcasi.etiket) }
      : null
  const dusenler = bahce.govdeler.filter((g) => g.sira < kurulan)

  return (
    <main className="bahce" onKeyDown={tusaBasildi}>
      <BolgeUstu
        ad={bolge.ad}
        gorevYeri={durum.gorevYeri}
        gorevSayisi={gorevler.length}
        onHarita={onHarita}
        baslikRef={baslikRef}
      />
      <p id="bahce-yonerge" className="gizli">
        Sepetteki ekleri sırayla ağaca taşı: sürükle, ya da önce eke sonra ağaca dokun. Yapım
        eki gövdeyi büyütür, çekim eki meyve olur.
      </p>

      <section className="bahce__sahne" aria-label="Ağaç">
        <button
          ref={agacRef}
          type="button"
          className={durum.secili !== null ? 'bahce__agac bahce__agac--hedef' : 'bahce__agac'}
          aria-label={`Ağaç: ${simdiki}`}
          aria-describedby="bahce-yonerge"
          onClick={agacaDokunuldu}
        >
          <Agac kok={bahce.gorev.kok} halkalar={halkalar} meyve={meyve} />
        </button>

        <div className="bahce__yan">
          <p className="tabela">
            <span className="gizli">Hedef: </span>
            {bahce.hedef}
          </p>
          <p className="bahce__kelime" aria-hidden="true">
            {eriyor && degisim ? degisim.once : simdiki}
          </p>
          {cepli && (
            <div className="bahce__cep" ref={cepRef} aria-hidden="true">
              {meyveCepte && meyveParcasi && (
                <span className="bahce__cep-yuva">
                  <Meyve parca={meyveParcasi.parca} />
                </span>
              )}
              <svg
                className="bahce__cep-on"
                viewBox={`0 0 ${CEP_KUTUSU.en} ${CEP_KUTUSU.boy}`}
                preserveAspectRatio="none"
              >
                <path className="bahce__cep-govde" d={CEP_GOVDESI} />
                <path className="bahce__cep-dikis" d={CEP_DIKISI} />
              </svg>
            </div>
          )}
        </div>
      </section>

      <ul className="bahce__kartlar" ref={kartlarRef} aria-label="Düşen kartlar">
        {dusenler.map((govde) => (
          <DusenKart key={govde.sira} bahce={bahce} govde={govde} silinen={silinen} />
        ))}
      </ul>

      <div className="bahce__alt">
        <div className="bahce__neden" role="status">
          {durum.yanlis && <p className="bahce__cumle">{durum.yanlis.cumle}</p>}
          {degisim && !eriyor && (
            <p className="bahce__degisim">
              {degisim.once} → {degisim.sonra}
            </p>
          )}
        </div>
        {evre === 'bitti' && (
          <button ref={sonrakiRef} type="button" className="bahce__dugme" onClick={sonrakiAgac}>
            Sıradaki
          </button>
        )}
        <p className="gizli" role="status">
          {evre === 'bitti' ? bahce.hedef : ''}
        </p>
      </div>

      <ul className="sepet" aria-label="Sepet">
        {sepet.map((parca) => {
          const siniflar = [
            'sepet__ek',
            durum.deneme?.sira === parca.sira && 'sepet__ek--etkin',
          ]
          return (
            <li key={`${durum.gorevYeri}:${parca.sira}`} className="sepet__yer">
              <button
                ref={(oge) => {
                  if (!oge) return
                  bukalemunlar.current.set(parca.sira, oge)
                  return () => {
                    if (bukalemunlar.current.get(parca.sira) === oge) {
                      bukalemunlar.current.delete(parca.sira)
                    }
                  }
                }}
                type="button"
                className={siniflar.filter(Boolean).join(' ')}
                aria-pressed={durum.secili === parca.sira}
                aria-disabled={!secimde}
                onClick={(e) => ekeDokunuldu(e, parca.sira)}
                onPointerDown={(e) => tutmaBasladi(e, parca.sira)}
                onPointerMove={tutmaSurdu}
                onPointerUp={(e) => tutmaBitti(e, false)}
                onPointerCancel={(e) => tutmaBitti(e, true)}
              >
                <Bukalemun parca={parca.parca} />
              </button>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

/**
 * Gövdeden düşen kart: kelime, ekleri birleşen ek görünümünde. -CIk kartı küçültür; -lI
 * önceki gövdenin küçük kartını üstüne koyar; -sIz onu siler, yerinde kesikli boş çerçeve
 * kalır (silinen: silinmesi canlandırılan kartın sırası; o sırada küçük kart görünür).
 */
function DusenKart({
  bahce,
  govde,
  silinen,
}: {
  bahce: BahceGorevi
  govde: GovdeKelimesi
  silinen: number | null
}) {
  const parca = bahce.parcalar[govde.sira]
  const buyu = parca ? buyusu(parca) : 'halka'
  const onceki = simdikiKelime(bahce, govde.sira)
  const kucukKart =
    buyu === 'katar' || (buyu === 'eksiltir' && silinen === govde.sira) ? (
      <span className="bahce-karti__onceki" aria-hidden="true">
        <span className="bahce-karti__onceki-yazi">
          <KokYazisi kok={onceki} />
        </span>
      </span>
    ) : buyu === 'eksiltir' ? (
      <span className="bahce-karti__onceki bahce-karti__onceki--silindi" aria-hidden="true">
        <span className="bahce-karti__onceki-yazi">
          <KokYazisi kok={onceki} />
        </span>
      </span>
    ) : null
  return (
    <li className="bahce__kart-yeri">
      {kucukKart}
      <span className={buyu === 'küçültür' ? 'bahce-karti bahce-karti--kucuk' : 'bahce-karti'}>
        <KurulanKelime kok={bahce.gorev.kok} etiketler={govde.etiketler} />
      </span>
    </li>
  )
}
