// Pilotun deneme günlüğü (DESIGN.md, "Pilot"): dört bölgede çocuğun her seçimi bir satırdır.
// Yalnız cihazda, oyunun kaydından (ilerleme.ts, ANAHTAR) ayrı bir anahtarda durur
// (GUNLUK_ANAHTARI); hiçbir şey kendiliğinden gönderilmez (CLAUDE.md, 6. ve 14. kural): yetişkin
// pilot.html'den elle indirir (CSV) ya da kopyalar.
//
// Günlük, pilot.html'de bir çocuk kodu (P01 gibi; ad değil) girilince açılır, kod silinince
// kapanır. Kod yokken ve sınıf modunda hiçbir deneme yazılmaz. Depo dolarsa oyun sürer, günlük
// durur: satırlar sessizce silinmez, durma işareti yazılır (DURMA_ANAHTARI; o da yazılamazsa
// pilot.html deponun dolu olduğunu kendisi sınar) ve pilot.html bunu söyler. Günlük yalnız
// pilot.html'deki "Günlüğü sil" ile (iki adımda) silinir; o zaman yeniden yazılır.
//
// Saf TypeScript'tir (ilerleme.ts gibi): depo dışarıdan verilir; buradaki işlevler depo
// yüzünden hata atmaz, konsola yazmaz. Okunan kayıt yazılırken yalnız eklenir: bilinmeyen alan
// ya da satır atılmaz. Kayıt okunamıyorsa (JSON değil) hiçbir şey yazılmaz; pilot.html söyler.
//
// Kaydın biçimi (sürüm 1):
//   { "cocuk": "P01",
//     "satirlar": [{ "zaman": "2026-10-01T10:15:03.250+03:00", "cocuk": "P01",
//                    "surum": "pilot-1", "bolge": "koy", "tur": 1, "gorev": 1, "kok": "at",
//                    "ekler": "PL", "dogru_bicim": "atlar", "secilen": "ler", "aday": "atler",
//                    "sonuc": "yanlis", "neden": "PL:kalınlık", "deneme_no": 1,
//                    "sure_ms": 5230, "ses_modu": "sesli" }] }
// cocuk null ise günlük kapalıdır. Satırın alanları CSV'nin sütunlarıdır (SUTUNLAR).

import { ekle, nedenYazimi, olasiBicimler, type Neden } from '../motor/index.ts'
import { BOLGELER, type Bolge } from './bolgeler.ts'
import { ilerlemeyiSifirla, pencereKaydi, type Depo } from './ilerleme.ts'
import { uydurukSiniri } from './uyduruk.ts'

/** Günlüğün anahtarı: oyunun kaydından ayrı, sürüm numaralı. */
export const GUNLUK_ANAHTARI = 'morfemusta.pilot.v1'
/** Depo dolunca yazılan durma işareti: günlüğün durduğu an (ISO 8601). */
export const DURMA_ANAHTARI = 'morfemusta.pilot.durdu'
/** pilot.html'in deponun dolu olup olmadığını sınadığı geçici anahtar. */
export const SINAMA_ANAHTARI = 'morfemusta.pilot.sinama'

/** Günlüğün kullandığı depo: oyunun deposu ve silme. */
export interface PilotDeposu extends Depo {
  removeItem(anahtar: string): void
}

/** CSV'nin sütunları, sırasıyla; satırın alanları da bunlardır. */
export const SUTUNLAR = [
  'zaman',
  'cocuk',
  'surum',
  'bolge',
  'tur',
  'gorev',
  'kok',
  'ekler',
  'dogru_bicim',
  'secilen',
  'aday',
  'sonuc',
  'neden',
  'deneme_no',
  'sure_ms',
  'ses_modu',
] as const

export type SesModu = 'kapali' | 'dokununca' | 'sesli'

/** Günlüğün bir satırı: çocuğun bir seçimi. */
export interface DenemeSatiri {
  /** Seçimin anı: yerel saatle ISO 8601, saat farkıyla (yerelZaman). */
  readonly zaman: string
  readonly cocuk: string
  /** Sürümün adı: pilot-1 (src/surum.ts). */
  readonly surum: string
  /** Bölgenin kimliği: koy, dukkan, bahce, uyduruk. */
  readonly bolge: string
  /** Görevin turu (1'den; tursuz bölgede 1). */
  readonly tur: number
  /** Görevin turdaki sırası (1'den). */
  readonly gorev: number
  readonly kok: string
  /** Görevin ekleri, + ile: PL+POSS.1SG. */
  readonly ekler: string
  /**
   * Bu seçimin doğru biçimi: zincirde adımın biçimi (toplar, sonra toplarım), Kök Bahçesi'nde
   * sıradaki gövde. İki biçim de doğruysa (Uydurukçuklar'ın sınır adımı) / ile: pıtakım/pıtağım.
   */
  readonly dogru_bicim: string
  /** Seçilen: ekin yüzeyi (ler), ya da karonun harfi (b). */
  readonly secilen: string
  /** Seçimin kurduğu kelime: atler, kitapım. */
  readonly aday: string
  readonly sonuc: 'dogru' | 'yanlis'
  /** Motorun nedenleri, ; ile (PL:kalınlık); doğruysa boş. */
  readonly neden: string
  /** Bu adımdaki kaçıncı deneme (1'den). */
  readonly deneme_no: number
  /** Görevin başından bu seçime geçen süre (ms). */
  readonly sure_ms: number
  readonly ses_modu: SesModu
}

/** Ekranın bildirdiği seçim (bölge ekranları, src/kabuk/gunluk.tsx). */
export interface Secim {
  readonly bolge: string
  readonly tur: number
  readonly gorev: number
  readonly kok: string
  readonly ekler: string
  readonly dogruBicim: string
  readonly secilen: string
  readonly aday: string
  readonly dogru: boolean
  readonly neden: string
  readonly denemeNo: number
  readonly sureMs: number
}

/** İki biçim de doğru olan seçimde doğru biçimlerin ayracı: pıtakım/pıtağım. */
export const IKI_BICIM_AYRACI = '/'

/** Seçimin doğru biçimleri dogru_bicim sütununda: tek biçim ya da / ile hepsi. */
export const dogruBicimYazisi = (bicimler: readonly string[]): string =>
  bicimler.join(IKI_BICIM_AYRACI)

/** Motorun nedenleri neden sütununda: tablolardaki yazımla, ; ile (LOC:sertleşme;LOC:kalınlık). */
export const nedenKodlari = (nedenler: readonly Neden[]): string =>
  nedenler.map(nedenYazimi).join(';')

// --- Çocuk kodu ------------------------------------------------------------------------------

/** Çocuk kodu: bir büyük harf ve iki ya da üç rakam (P01, P123). Ad yazılamaz. */
export const COCUK_KODU = /^[A-Z][0-9]{2,3}$/

/** Girilen kodu çözer: baştaki ve sondaki boşluk atılır, harf büyür; geçersizse null. */
export function cocukKodunuCoz(girdi: string): string | null {
  const kod = girdi.trim().toUpperCase()
  return COCUK_KODU.test(kod) ? kod : null
}

// --- Depo ------------------------------------------------------------------------------------

/** Anahtarın metni: yoksa null; depo yoksa ya da okunamıyorsa undefined. Hata atmaz. */
function metniOku(depo: Depo | null, anahtar: string): string | null | undefined {
  if (!depo) return undefined
  try {
    return depo.getItem(anahtar)
  } catch {
    return undefined
  }
}

/** Yazar; yazılamazsa (depo yok, dolu ya da erişim yok) false döner, hata atmaz. */
function metniYaz(depo: Depo | null, anahtar: string, metin: string): boolean {
  if (!depo) return false
  try {
    depo.setItem(anahtar, metin)
    return true
  } catch {
    return false
  }
}

function anahtariSil(depo: PilotDeposu | null, anahtar: string): void {
  try {
    depo?.removeItem(anahtar)
  } catch {
    // Depoya erişilemiyor.
  }
}

const nesneMi = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)

/** Kaydın kendisi, okunduğu gibi (yazarken bilinmeyen alanlar ve satırlar korunur). */
interface HamKayit {
  readonly [alan: string]: unknown
  readonly satirlar: readonly unknown[]
}

/**
 * Kaydı okur. yok: kayıt yok (günlük hiç açılmadı); bozuk: kayıt var ama okunamıyor (JSON değil
 * ya da satırları dizi değil); erisilemiyor: depo yok ya da okunamıyor.
 */
function hamKayit(depo: Depo | null): HamKayit | 'yok' | 'bozuk' | 'erisilemiyor' {
  const metin = metniOku(depo, GUNLUK_ANAHTARI)
  if (metin === undefined) return 'erisilemiyor'
  if (metin === null) return 'yok'
  try {
    const ham: unknown = JSON.parse(metin)
    if (!nesneMi(ham)) return 'bozuk'
    const { satirlar = [] } = ham
    return Array.isArray(satirlar) ? { ...ham, satirlar } : 'bozuk'
  } catch {
    return 'bozuk'
  }
}

const kayitKodu = (ham: HamKayit): string | null =>
  typeof ham.cocuk === 'string' && COCUK_KODU.test(ham.cocuk) ? ham.cocuk : null

/** Okunan günlük. */
export interface Gunluk {
  /**
   * yok: günlük hiç açılmadı; tamam: okundu; bozuk: kayıt okunamıyor (hiçbir şey yazılmaz;
   * pilot.html "Günlüğü sil" ile temizlenebilir); erisilemiyor: depo yok ya da okunamıyor.
   */
  readonly durum: 'yok' | 'tamam' | 'bozuk' | 'erisilemiyor'
  /** Çocuğun kodu; yoksa günlük kapalıdır. */
  readonly cocuk: string | null
  /** Geçerli satırlar, yazıldıkları sırayla. */
  readonly satirlar: readonly DenemeSatiri[]
  /** Okunamayan (alanları eksik ya da yanlış) satır sayısı: CSV'ye girmez. */
  readonly okunamayan: number
  /** Depo dolup günlük durduysa o an (ISO 8601); durmadıysa null. */
  readonly durdu: string | null
}

/** Günlüğü okur. Hata atmaz. */
export function gunluguOku(depo: Depo | null): Gunluk {
  const ham = hamKayit(depo)
  const durdu = metniOku(depo, DURMA_ANAHTARI) ?? null
  if (typeof ham === 'string') {
    return { durum: ham, cocuk: null, satirlar: [], okunamayan: 0, durdu }
  }
  const satirlar = ham.satirlar.flatMap((s) => {
    const satir = satiriCoz(s)
    return satir ? [satir] : []
  })
  return {
    durum: 'tamam',
    cocuk: kayitKodu(ham),
    satirlar,
    okunamayan: ham.satirlar.length - satirlar.length,
    durdu,
  }
}

/** Günlük açık mı (çocuk kodu var mı). Hata atmaz; depo yoksa kapalıdır. */
export function gunlukAcikMi(depo: Depo | null): boolean {
  return gunluguOku(depo).cocuk !== null
}

const SES_MODLARI: readonly SesModu[] = ['kapali', 'dokununca', 'sesli']
const METIN_ALANLARI = [
  'zaman',
  'cocuk',
  'surum',
  'bolge',
  'kok',
  'ekler',
  'dogru_bicim',
  'secilen',
  'aday',
  'neden',
] as const
const SAYI_ALANLARI = ['tur', 'gorev', 'deneme_no', 'sure_ms'] as const

/** Satırı denetler: bütün alanları yerinde ve doğru türdeyse satır; değilse null. */
function satiriCoz(ham: unknown): DenemeSatiri | null {
  if (!nesneMi(ham)) return null
  if (!METIN_ALANLARI.every((a) => typeof ham[a] === 'string')) return null
  if (!SAYI_ALANLARI.every((a) => Number.isSafeInteger(ham[a]) && (ham[a] as number) >= 0)) {
    return null
  }
  if (ham.sonuc !== 'dogru' && ham.sonuc !== 'yanlis') return null
  if (!SES_MODLARI.includes(ham.ses_modu as SesModu)) return null
  return Object.fromEntries(SUTUNLAR.map((s) => [s, ham[s]])) as unknown as DenemeSatiri
}

/** Kaydı yazar; yazılamazsa false. */
const kaydiYaz = (depo: Depo | null, kayit: HamKayit): boolean =>
  metniYaz(depo, GUNLUK_ANAHTARI, JSON.stringify(kayit))

// --- Yazma (oyun) ----------------------------------------------------------------------------

/** Satırın zamanı: yerel saatle ISO 8601, saat farkıyla (2026-10-01T10:15:03.250+03:00). */
export function yerelZaman(an: Date): string {
  const iki = (n: number) => String(n).padStart(2, '0')
  const fark = -an.getTimezoneOffset()
  const isaret = fark < 0 ? '-' : '+'
  const mutlak = Math.abs(fark)
  return (
    `${an.getFullYear()}-${iki(an.getMonth() + 1)}-${iki(an.getDate())}` +
    `T${iki(an.getHours())}:${iki(an.getMinutes())}:${iki(an.getSeconds())}` +
    `.${String(an.getMilliseconds()).padStart(3, '0')}` +
    `${isaret}${iki(Math.floor(mutlak / 60))}:${iki(mutlak % 60)}`
  )
}

export interface YazmaBaglami {
  /** Sınıf modu açık mı: açıksa hiçbir şey yazılmaz. */
  readonly sinif: boolean
  readonly sesModu: SesModu
  readonly simdi: Date
}

/**
 * Seçim yazıldı mı:
 *   yazildi       satır günlükte
 *   sinif         sınıf modu açık: yazılmaz
 *   kod-yok       günlük kapalı (kod yok ya da depo okunamıyor)
 *   durdu         depo doldu: günlük durdu (bu açılışta ya da durma işareti var)
 *   bozuk         kayıt okunamıyor: üstüne yazılmaz
 */
export type YazmaSonucu = 'yazildi' | 'sinif' | 'kod-yok' | 'durdu' | 'bozuk'

export interface GunlukYazici {
  /** Seçimi günlüğe yazar (kod varsa, sınıf modu kapalıysa, günlük durmadıysa). Hata atmaz. */
  yaz(secim: Secim, baglam: YazmaBaglami): YazmaSonucu
}

/** Seçimden satır: kod, sürüm, an ve ses modu yazılırken eklenir. */
export function satirKur(
  secim: Secim,
  cocuk: string,
  surum: string,
  baglam: Pick<YazmaBaglami, 'sesModu' | 'simdi'>,
): DenemeSatiri {
  return {
    zaman: yerelZaman(baglam.simdi),
    cocuk,
    surum,
    bolge: secim.bolge,
    tur: secim.tur,
    gorev: secim.gorev,
    kok: secim.kok,
    ekler: secim.ekler,
    dogru_bicim: secim.dogruBicim,
    secilen: secim.secilen,
    aday: secim.aday,
    sonuc: secim.dogru ? 'dogru' : 'yanlis',
    neden: secim.dogru ? '' : secim.neden,
    deneme_no: secim.denemeNo,
    sure_ms: Math.max(0, Math.round(secim.sureMs)),
    ses_modu: baglam.sesModu,
  }
}

/**
 * Oyunun (bir pencerenin) günlük yazıcısı. Her seçimde son kayıt okunur: kodu pilot.html başka
 * bir sekmede değiştirmiş olabilir; satır kaydın sonuna eklenir, kayıttaki öteki satırlar ve
 * alanlar olduğu gibi kalır. Yazılamazsa (depo dolu) günlük bu açılışta durur ve durma işareti
 * yazılır; işaret durdukça sonraki açılışlar da yazmaz.
 */
export function gunlukYazici(depo: Depo | null, surum: string): GunlukYazici {
  let durdu = false
  return {
    yaz(secim, baglam) {
      if (baglam.sinif) return 'sinif'
      const ham = hamKayit(depo)
      if (ham === 'bozuk') return 'bozuk'
      if (typeof ham === 'string') return 'kod-yok'
      const cocuk = kayitKodu(ham)
      if (cocuk === null) return 'kod-yok'
      if (durdu || metniOku(depo, DURMA_ANAHTARI)) return 'durdu'
      const satir = satirKur(secim, cocuk, surum, baglam)
      if (kaydiYaz(depo, { ...ham, satirlar: [...ham.satirlar, satir] })) return 'yazildi'
      // Depo dolu: günlük durur, satırlar silinmez; işaret yazılamasa da bu açılışta yazılmaz.
      durdu = true
      metniYaz(depo, DURMA_ANAHTARI, baglam.simdi.toISOString())
      return 'durdu'
    },
  }
}

// --- pilot.html ------------------------------------------------------------------------------

/**
 * Çocuk kodunu yazar (günlük açılır); satırlar kalır. Kayıt okunamıyorsa (bozuk) ya da
 * yazılamıyorsa false.
 */
export function koduYaz(depo: Depo | null, kod: string): boolean {
  if (!COCUK_KODU.test(kod)) return false
  const ham = hamKayit(depo)
  if (ham === 'bozuk' || ham === 'erisilemiyor') return false
  return kaydiYaz(depo, ham === 'yok' ? { cocuk: kod, satirlar: [] } : { ...ham, cocuk: kod })
}

/** Kodu siler: günlük kapanır, satırlar kalır. */
export function koduSil(depo: Depo | null): boolean {
  const ham = hamKayit(depo)
  if (ham === 'yok') return true
  if (typeof ham === 'string') return false
  return kaydiYaz(depo, { ...ham, cocuk: null })
}

/** "Yeni çocuk"un sonucu: kod yazıldı mı, oyunun ilerlemesi sıfırlandı mı. */
export interface YeniCocukSonucu {
  readonly kod: boolean
  readonly ilerleme: boolean
}

/**
 * Yeni çocuk: kodu yazar, oyunun ilerlemesini, kartlarını ve kalınan yerini sıfırlar
 * (ilerlemeyiSifirla: ayarlar ve kapatılan ipuçları kalır). Günlüğün satırları kalır. Her çocuk
 * Bukalemun Koyu'ndan başlar. Kod yazılamazsa ilerlemeye dokunulmaz.
 */
export function yeniCocuk(depo: Depo | null, kod: string): YeniCocukSonucu {
  if (!koduYaz(depo, kod)) return { kod: false, ilerleme: false }
  return { kod: true, ilerleme: pencereKaydi(depo).degistir(ilerlemeyiSifirla) }
}

/**
 * Günlüğü siler: bütün satırlar ve durma işareti gider, kod kalır (günlük açıksa açık kalır).
 * Okunamayan kayıt da silinir.
 */
export function gunluguSil(depo: PilotDeposu | null): boolean {
  const ham = hamKayit(depo)
  if (ham === 'erisilemiyor') return false
  anahtariSil(depo, DURMA_ANAHTARI)
  if (ham === 'yok') return true
  if (ham === 'bozuk') {
    anahtariSil(depo, GUNLUK_ANAHTARI)
    return metniOku(depo, GUNLUK_ANAHTARI) === null
  }
  return kaydiYaz(depo, { cocuk: kayitKodu(ham), satirlar: [] })
}

/**
 * Depo dolu mu: küçük bir deneme yazısı (bir satırdan uzun) yazılamıyorsa dolu. Yazı hemen
 * silinir. Depo yoksa false (oyun zaten bellekte sürer; günlük de yazılmaz).
 */
export function depoDoluMu(depo: PilotDeposu | null): boolean {
  if (!depo) return false
  if (!metniYaz(depo, SINAMA_ANAHTARI, 'x'.repeat(2048))) return true
  anahtariSil(depo, SINAMA_ANAHTARI)
  return false
}

// --- Özet ------------------------------------------------------------------------------------

/**
 * Görevin son seçiminin doğru biçimi: bu biçimle biten doğru seçim görevi bitirir. Uydurukçuklar'da
 * sınır adımı varsa (pıtak + ım) son seçim karodur, iki biçim de doğrudur; değilse motorun biçimi.
 */
export function gorevinSonBicimi(bolge: string, kok: string, etiketler: readonly string[]): string {
  if (bolge === 'uyduruk') {
    const gorev = { sira: 0, tur: 1, turdakiSira: 1, kok, etiketler, renksiz: false }
    if (uydurukSiniri(gorev)) return dogruBicimYazisi(olasiBicimler(kok, etiketler))
  }
  return ekle(kok, etiketler).bicim
}

/** Satır görevi bitiren seçim mi: doğru ve görevin son seçimi. */
export function gorevBitirdiMi(satir: DenemeSatiri): boolean {
  if (satir.sonuc !== 'dogru') return false
  try {
    return satir.dogru_bicim === gorevinSonBicimi(satir.bolge, satir.kok, satir.ekler.split('+'))
  } catch {
    // Motorun kuramadığı görev (eski ya da elle değişmiş satır): sayılmaz.
    return false
  }
}

/** Seçim puanlanır mı: iki biçim de doğruysa (sınır adımı) yanlışı yoktur, orana girmez. */
export const puanlanirMi = (satir: DenemeSatiri): boolean =>
  !satir.dogru_bicim.includes(IKI_BICIM_AYRACI)

export interface Oran {
  /** İlk denemede doğru seçim sayısı. */
  readonly dogru: number
  /** Puanlanan seçim noktası sayısı (deneme_no 1 olan satırlar). */
  readonly toplam: number
}

export interface BolgeOzeti {
  readonly bolge: Bolge
  /** Biten görev: doğru son seçimi olan görevler (tur ve görev; aynı görev bir kez sayılır). */
  readonly bitenGorev: number
  readonly ilkDeneme: Oran
}

export interface NedenSayisi {
  readonly neden: string
  readonly sayi: number
}

export interface CocukOzeti {
  readonly cocuk: string
  /** Bölgeler, tablonun sırasıyla (içeriği olan bütün bölgeler). */
  readonly bolgeler: readonly BolgeOzeti[]
  readonly bitenGorev: number
  readonly ilkDeneme: Oran
  /** En sık üç neden: her yanlış seçimin nedenleri ayrı ayrı sayılır; eşitlikte önce görülen. */
  readonly nedenler: readonly NedenSayisi[]
  /** Satır sayısı. */
  readonly secim: number
}

const ilkDenemeOrani = (satirlar: readonly DenemeSatiri[]): Oran => {
  const ilkler = satirlar.filter((s) => s.deneme_no === 1 && puanlanirMi(s))
  return { dogru: ilkler.filter((s) => s.sonuc === 'dogru').length, toplam: ilkler.length }
}

/** Çocuk başına özet, çocukların günlükte ilk görüldüğü sırayla. */
export function cocukOzetleri(
  satirlar: readonly DenemeSatiri[],
  bolgeler: readonly Bolge[] = BOLGELER,
): CocukOzeti[] {
  const cocuklar = [...new Set(satirlar.map((s) => s.cocuk))]
  return cocuklar.map((cocuk) => {
    const onun = satirlar.filter((s) => s.cocuk === cocuk)
    const bolgeOzetleri = bolgeler
      .filter((b) => b.gorevler.length > 0)
      .map((bolge): BolgeOzeti => {
        const bolgede = onun.filter((s) => s.bolge === bolge.kimlik)
        const biten = new Set(bolgede.filter(gorevBitirdiMi).map((s) => `${s.tur}:${s.gorev}`))
        return { bolge, bitenGorev: biten.size, ilkDeneme: ilkDenemeOrani(bolgede) }
      })
    const sayilar = new Map<string, number>()
    for (const satir of onun) {
      if (satir.sonuc !== 'yanlis') continue
      for (const neden of satir.neden.split(';').filter(Boolean)) {
        sayilar.set(neden, (sayilar.get(neden) ?? 0) + 1)
      }
    }
    // Map ekleme sırasını korur; sort kararlıdır: eşitlikte önce görülen önde.
    const nedenler = [...sayilar]
      .map(([neden, sayi]) => ({ neden, sayi }))
      .sort((a, b) => b.sayi - a.sayi)
      .slice(0, 3)
    return {
      cocuk,
      bolgeler: bolgeOzetleri,
      bitenGorev: bolgeOzetleri.reduce((t, b) => t + b.bitenGorev, 0),
      ilkDeneme: ilkDenemeOrani(onun),
      nedenler,
      secim: onun.length,
    }
  })
}

/** Oranın yazısı: 48 / 52 (%92); puanlanan seçim yoksa tire. */
export const oranYazisi = ({ dogru, toplam }: Oran): string =>
  toplam === 0 ? '–' : `${dogru} / ${toplam} (%${Math.round((dogru / toplam) * 100)})`

// --- CSV ve kopya ----------------------------------------------------------------------------

/**
 * CSV'nin ayracı: noktalı virgül. Türkçe Excel'de liste ayracı budur (ondalık işareti virgül);
 * virgüllü dosya Excel'de tek sütunda açılırdı.
 */
export const CSV_AYRACI = ';'
/** UTF-8 imi (BOM): Excel dosyayı UTF-8 okusun, Türkçe harfler bozulmasın. */
export const UTF8_IMI = '﻿'

const alan = (satir: DenemeSatiri, sutun: (typeof SUTUNLAR)[number]): string => String(satir[sutun])

/** CSV alanı: ayraç, tırnak ya da satır sonu varsa tırnak içinde, tırnaklar ikilenir. */
function csvAlani(deger: string): string {
  return /[;"\r\n]/.test(deger) ? `"${deger.replaceAll('"', '""')}"` : deger
}

/**
 * CSV metni: UTF-8 imiyle başlar, ilk satır sütunlar; ayraç noktalı virgül, satır sonu CRLF
 * (Excel ve RFC 4180).
 */
export function csvMetni(satirlar: readonly DenemeSatiri[]): string {
  const satir = (alanlar: readonly string[]) => alanlar.map(csvAlani).join(CSV_AYRACI)
  return (
    UTF8_IMI +
    [satir(SUTUNLAR), ...satirlar.map((s) => satir(SUTUNLAR.map((sutun) => alan(s, sutun))))]
      .map((s) => `${s}\r\n`)
      .join('')
  )
}

/**
 * Kopya: sekmeyle ayrılmış metin (tabloya yapıştırılınca her alan bir hücreye düşer). Alanlarda
 * sekme ve satır sonu yok; varsa boşluk olur.
 */
export function kopyaMetni(satirlar: readonly DenemeSatiri[]): string {
  const satir = (alanlar: readonly string[]) =>
    alanlar.map((a) => a.replace(/[\t\r\n]+/g, ' ')).join('\t')
  return [satir(SUTUNLAR), ...satirlar.map((s) => satir(SUTUNLAR.map((sutun) => alan(s, sutun))))]
    .map((s) => `${s}\n`)
    .join('')
}

/** İndirilen dosyanın adı: morfemusta-pilot-2026-10-01.csv (yerel gün). */
export function csvDosyaAdi(an: Date): string {
  return `morfemusta-pilot-${yerelZaman(an).slice(0, 10)}.csv`
}

// --- Sayaç (bölge ekranları) ------------------------------------------------------------------

/**
 * Bir bölge ekranının sayacı: görevin başından geçen süre ve adımdaki deneme sayısı. Görev
 * değişince (Sıradaki, ekranın açılışı) sıfırlanır.
 */
export interface DenemeSayaci {
  /** Görev başladı: an, görevin başıdır; adımların sayıları sıfırlanır. */
  gorevBasladi(gorev: string, an: number): void
  /** Adımda bir deneme daha: kaçıncı deneme ve görevin başından geçen süre (ms). */
  deneme(gorev: string, adim: string, an: number): { readonly denemeNo: number; readonly sureMs: number }
}

export function denemeSayaci(): DenemeSayaci {
  let gorevi: string | null = null
  let basi = 0
  const adimlar = new Map<string, number>()
  const basla = (gorev: string, an: number) => {
    gorevi = gorev
    basi = an
    adimlar.clear()
  }
  return {
    gorevBasladi(gorev, an) {
      if (gorev !== gorevi) basla(gorev, an)
    },
    deneme(gorev, adim, an) {
      // Görevin başı görülmediyse (olmamalı) ilk deneme görevin başıdır.
      if (gorev !== gorevi) basla(gorev, an)
      const denemeNo = (adimlar.get(adim) ?? 0) + 1
      adimlar.set(adim, denemeNo)
      return { denemeNo, sureMs: Math.max(0, Math.round(an - basi)) }
    },
  }
}
