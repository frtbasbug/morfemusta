// Cihazdaki ilerleme: bölgelerde biten görevler ve kalınan yer, Sözlük kartları, ayarlar.
// Yalnız cihazda, localStorage'da, sürüm numaralı tek bir anahtarda durur (ANAHTAR); hiçbir
// yere gönderilmez (CLAUDE.md, 6. ve 14. kural).
//
// Saf TypeScript'tir: DOM'a dokunmaz. Depo dışarıdan verilir: tarayıcıda localStorage
// (src/kabuk/depo.ts), testte bellekte bir nesne. Depo yoksa, okunamıyor ya da yazılamıyorsa
// oyun bellekte sürer: buradaki işlevler depo yüzünden hata atmaz, konsola da yazmaz. Bozuk
// kayıttan yalnız geçerli parçalar alınır; gerisi baştan başlar. Aynı cihazda açık pencereler
// (sekme, ana ekrandaki uygulama) aynı kaydı paylaşır: değişiklik depodaki son kayda uygulanır
// (pencereKaydi).
//
// Kaydın biçimi (sürüm 1):
//   { "bolgeler": { "koy": { "bitenler": [1, 2, 3], "kaldigi": 3 } },
//     "kartlar": [{ "kelime": "atlar", "kok": "at", "etiketler": ["PL"], "bolge": "koy",
//                   "tarih": "2026-09-28T09:15:00.000Z", "sonKurulma": "2026-09-28T09:15:00.000Z" }],
//     "ayarlar": { "hareket": "sistem", "renkler": "renkli" },
//     "sifirlama": 0 }
// sifirlama: sıfırlama kimliği, her sıfırlamada bir artar; eksikse 0 sayılır.
// Biçim değişirse anahtar da değişir (morfemusta.v2); eski kayıt yenisine taşınır.

import { ekle } from '../motor/index.ts'
import { BOLGELER, type Bolge } from './bolgeler.ts'
import type { Gorev } from './gorevler.ts'

/** Kaydın anahtarı: sürüm numaralı, tek. */
export const ANAHTAR = 'morfemusta.v1'

/** localStorage'ın kullanılan parçası. */
export interface Depo {
  getItem(anahtar: string): string | null
  setItem(anahtar: string, deger: string): void
}

export interface Ayarlar {
  /** sistem: cihazın hareket azaltma ayarına uyar; azalt: prefers-reduced-motion gibi. */
  readonly hareket: 'sistem' | 'azalt'
  /** renksiz: kalın ve ince her yerde aynı gri, büyüden sonra da (galerideki Renksiz). */
  readonly renkler: 'renkli' | 'renksiz'
}

export interface BolgeIlerlemesi {
  /** En az bir kez biten görevlerin sıraları, küçükten büyüğe. */
  readonly bitenler: readonly number[]
  /**
   * Bölgeye dönülünce oynanacak görevin yeri (0'dan). Tur bitince görev sayısına eşittir;
   * sonraki giriş baştan başlar (kaldigiGorev).
   */
  readonly kaldigi: number
}

/** Sözlük kartı: doğru kurulan bir kelime. Aynı kelime aynı bölgeden ikinci kez kart olmaz. */
export interface SozlukKarti {
  readonly kelime: string
  readonly kok: string
  /** Ekler, eklenme sırasıyla; biçim ve parçalar motordan gelir (ekle). */
  readonly etiketler: readonly string[]
  /** Kelimenin kurulduğu bölgenin kimliği. */
  readonly bolge: string
  /** Kartın tarihi: kelimenin bu bölgede ilk kurulduğu an (ISO 8601). */
  readonly tarih: string
  /** Kelimenin bu bölgede son kurulduğu an; akşam ekranı buna bakar. */
  readonly sonKurulma: string
}

export interface Ilerleme {
  /** Bölgelerin ilerlemesi, kimlikleriyle; hiç oynanmamış bölge yazılmaz. */
  readonly bolgeler: Readonly<Record<string, BolgeIlerlemesi>>
  /** Kartlar, kazanıldıkları sırayla. */
  readonly kartlar: readonly SozlukKarti[]
  readonly ayarlar: Ayarlar
  /**
   * Sıfırlama kimliği: ilerleme her sıfırlandığında bir artar. Bölge ekranı açılırken alır,
   * görev bitince yazmadan önce karşılaştırır (ekrandaGorevBitti): sıfırlamayı görmemiş bir
   * pencere onu geri alamaz.
   */
  readonly sifirlama: number
}

export const VARSAYILAN_AYARLAR: Ayarlar = { hareket: 'sistem', renkler: 'renkli' }

export const BOS_ILERLEME: Ilerleme = {
  bolgeler: {},
  kartlar: [],
  ayarlar: VARSAYILAN_AYARLAR,
  sifirlama: 0,
}

// --- Depo ---------------------------------------------------------------------------------

/** Kaydın metni: kayıt yoksa null; depo yoksa ya da okunamıyorsa undefined. Hata atmaz. */
function metniOku(depo: Depo | null): string | null | undefined {
  if (!depo) return undefined
  try {
    return depo.getItem(ANAHTAR)
  } catch {
    // Depoya erişilemiyor: oyun bellekte sürer.
    return undefined
  }
}

/** Kaydın metnini çözer. Kayıt yoksa, okunamıyorsa ya da JSON değilse baştan başlanır. */
function metniCoz(metin: string | null | undefined, bolgeler: readonly Bolge[]): Ilerleme {
  if (metin === null || metin === undefined) return BOS_ILERLEME
  try {
    return ilerlemeyiCoz(JSON.parse(metin), bolgeler)
  } catch {
    // Kayıt JSON değil: oyun baştan.
    return BOS_ILERLEME
  }
}

/** Metni yazar. Yazılamazsa (depo yok, dolu ya da erişim yok) false döner; hata atmaz. */
function metniYaz(depo: Depo | null, metin: string): boolean {
  if (!depo) return false
  try {
    depo.setItem(ANAHTAR, metin)
    return true
  } catch {
    return false
  }
}

/** Kaydı okur. Depo yoksa, okunamıyorsa ya da kayıt bozuksa baştan başlanır; hata atmaz. */
export function ilerlemeyiYukle(depo: Depo | null, bolgeler: readonly Bolge[] = BOLGELER): Ilerleme {
  return metniCoz(metniOku(depo), bolgeler)
}

/** Kaydeder. Yazılamazsa (depo yok, dolu ya da erişim yok) false döner; hata atmaz. */
export function ilerlemeyiKaydet(depo: Depo | null, ilerleme: Ilerleme): boolean {
  return metniYaz(depo, JSON.stringify(ilerleme))
}

/** Bir pencerenin (sekme ya da ana ekrandaki uygulama) ilerlemesi ve kaydı. */
export interface PencereKaydi {
  /** Pencerenin bildiği son ilerleme. */
  readonly ilerleme: Ilerleme
  /** Kaydı başka bir pencere değiştirdiyse onu alır; aldıysa true. */
  tazele(): boolean
  /** Değişikliği son kayda uygular ve kaydeder; değişiklik yoksa ya da yazılamazsa false. */
  degistir(degisiklik: (ilerleme: Ilerleme) => Ilerleme): boolean
}

/**
 * Aynı cihazda açık pencereler aynı kaydı paylaşır. Her değişiklik depodaki son kayda uygulanır:
 * önce açılmış bir pencere, eski kopyasıyla sonrakinin ilerlemesini, kartlarını ve ayarlarını
 * ezmez. Depodaki metin pencerenin son okuduğu ya da yazdığı metinden farklıysa kaydı başka bir
 * pencere değiştirmiştir. Depo okunamıyor ya da yazılamıyorsa (dolu) bellekteki ilerleme sürer;
 * depodaki eski kayıt onu geri almaz.
 */
export function pencereKaydi(depo: Depo | null, bolgeler: readonly Bolge[] = BOLGELER): PencereKaydi {
  let bilinen = metniOku(depo)
  let ilerleme = metniCoz(bilinen, bolgeler)
  const tazele = (): boolean => {
    const metin = metniOku(depo)
    if (metin === undefined || metin === bilinen) return false
    bilinen = metin
    ilerleme = metniCoz(metin, bolgeler)
    return true
  }
  return {
    get ilerleme() {
      return ilerleme
    },
    tazele,
    degistir(degisiklik) {
      tazele()
      const yeni = degisiklik(ilerleme)
      if (yeni === ilerleme) return false
      ilerleme = yeni
      const metin = JSON.stringify(yeni)
      if (!metniYaz(depo, metin)) return false
      bilinen = metin
      return true
    },
  }
}

/**
 * İki ilerleme arasında ilerlemesi (biten görevler, kalınan yer) değişen bölgeler. Başka bir
 * pencerenin yazdığı kayıt alınınca açık bölge ekranı buna bakar: bölgesi değiştiyse (görev,
 * sıfırlama) kalınan yerden yeniden açılır; ayar ya da yalnız kart değiştiyse oyun kesilmez.
 */
export function degisenBolgeler(once: Ilerleme, sonra: Ilerleme): string[] {
  const kimlikler = new Set([...Object.keys(once.bolgeler), ...Object.keys(sonra.bolgeler)])
  return [...kimlikler].filter(
    (kimlik) =>
      JSON.stringify(once.bolgeler[kimlik] ?? null) !==
      JSON.stringify(sonra.bolgeler[kimlik] ?? null),
  )
}

const nesneMi = (x: unknown): x is Readonly<Record<string, unknown>> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)

/** ISO 8601 zaman; geçersizse null. */
function anOku(x: unknown): number | null {
  if (typeof x !== 'string') return null
  const an = Date.parse(x)
  return Number.isNaN(an) ? null : an
}

/**
 * Okunan kaydı denetler. Geçerli parçalar alınır, geçersizler atılır: bilinmeyen bölge,
 * görevlerde olmayan sıra, motorun kuramadığı ya da biçimi tutmayan kart, tanınmayan ayar.
 */
export function ilerlemeyiCoz(ham: unknown, bolgeler: readonly Bolge[] = BOLGELER): Ilerleme {
  if (!nesneMi(ham)) return BOS_ILERLEME
  const hamBolgeler = nesneMi(ham.bolgeler) ? ham.bolgeler : {}
  const bolgeIlerlemeleri = bolgeler.flatMap((bolge) => {
    const kayit = Object.hasOwn(hamBolgeler, bolge.kimlik) ? hamBolgeler[bolge.kimlik] : undefined
    const bolgeIlerlemesi = bolgeIlerlemesiniCoz(kayit, bolge)
    return bolgeIlerlemesi ? [[bolge.kimlik, bolgeIlerlemesi] as const] : []
  })

  const kartlar: SozlukKarti[] = []
  for (const hamKart of Array.isArray(ham.kartlar) ? ham.kartlar : []) {
    const kart = kartiCoz(hamKart, bolgeler)
    if (kart && !kartlar.some((k) => ayniKart(k, kart))) kartlar.push(kart)
  }

  const ayarlar = nesneMi(ham.ayarlar) ? ham.ayarlar : {}
  const { sifirlama } = ham
  return {
    bolgeler: Object.fromEntries(bolgeIlerlemeleri),
    kartlar,
    ayarlar: {
      hareket: ayarlar.hareket === 'azalt' ? 'azalt' : 'sistem',
      renkler: ayarlar.renkler === 'renksiz' ? 'renksiz' : 'renkli',
    },
    sifirlama:
      typeof sifirlama === 'number' && Number.isSafeInteger(sifirlama) && sifirlama >= 0
        ? sifirlama
        : 0,
  }
}

function bolgeIlerlemesiniCoz(ham: unknown, bolge: Bolge): BolgeIlerlemesi | null {
  if (!nesneMi(ham) || bolge.gorevler.length === 0) return null
  const siralar = new Set(bolge.gorevler.map((g) => g.sira))
  const bitenler = Array.isArray(ham.bitenler)
    ? ham.bitenler.filter((s): s is number => typeof s === 'number' && siralar.has(s))
    : []
  const { kaldigi } = ham
  const gecerli =
    typeof kaldigi === 'number' &&
    Number.isInteger(kaldigi) &&
    kaldigi >= 0 &&
    kaldigi <= bolge.gorevler.length
  return {
    bitenler: [...new Set(bitenler)].sort((a, b) => a - b),
    kaldigi: gecerli ? kaldigi : 0,
  }
}

function kartiCoz(ham: unknown, bolgeler: readonly Bolge[]): SozlukKarti | null {
  if (!nesneMi(ham)) return null
  const { kelime, kok, etiketler, bolge } = ham
  if (typeof kelime !== 'string' || typeof kok !== 'string' || typeof bolge !== 'string') {
    return null
  }
  if (!Array.isArray(etiketler) || etiketler.length === 0) return null
  if (!etiketler.every((e): e is string => typeof e === 'string')) return null
  if (!bolgeler.some((b) => b.kimlik === bolge)) return null
  const tarih = anOku(ham.tarih)
  if (tarih === null) return null
  const sonKurulma = Math.max(tarih, anOku(ham.sonKurulma) ?? tarih)
  try {
    // Kart motorun kurduğu kelime olmalı.
    if (ekle(kok, etiketler).bicim !== kelime) return null
  } catch {
    return null
  }
  return {
    kelime,
    kok,
    etiketler: [...etiketler],
    bolge,
    tarih: new Date(tarih).toISOString(),
    sonKurulma: new Date(sonKurulma).toISOString(),
  }
}

const ayniKart = (a: SozlukKarti, b: SozlukKarti): boolean =>
  a.bolge === b.bolge && a.kelime === b.kelime

// --- Oyun ---------------------------------------------------------------------------------

/**
 * Görev bitti: görev bölgenin bitenlerine girer, sıradaki görev kalınan yer olur. Kurulan
 * kelime Sözlük'e kart olarak düşer; kelimenin bu bölgeden kartı varsa yeni kart olmaz, yalnız
 * son kurulma anı değişir (akşam ekranı onu da bugün kurulanlar arasında gösterir).
 *
 * Kartların ekleri verilirse kartlar onlardır, sırayla: Kök Bahçesi'nde kart yalnız gövdeden
 * düşer (çiçekçi; çiçekçiler değil). Verilmezse tek kart görevin kelimesidir.
 */
export function gorevBitti(
  ilerleme: Ilerleme,
  bolge: Bolge,
  gorev: Gorev,
  simdi: Date,
  kartEkleri: readonly (readonly string[])[] = [gorev.etiketler],
): Ilerleme {
  const eski = ilerleme.bolgeler[bolge.kimlik]
  const bitenler = [...new Set([...(eski?.bitenler ?? []), gorev.sira])].sort((a, b) => a - b)
  const an = simdi.toISOString()
  let kartlar = ilerleme.kartlar
  for (const etiketler of kartEkleri) {
    const kart: SozlukKarti = {
      kelime: ekle(gorev.kok, etiketler).bicim,
      kok: gorev.kok,
      etiketler: [...etiketler],
      bolge: bolge.kimlik,
      tarih: an,
      sonKurulma: an,
    }
    const onceki = kartlar.find((k) => ayniKart(k, kart))
    kartlar = onceki
      ? kartlar.map((k) => (k === onceki ? { ...k, sonKurulma: an } : k))
      : [...kartlar, kart]
  }
  return {
    ...ilerleme,
    // Sıra 1'den başlar ve birer artar (gorevleriOku): sıradaki görevin yeri bitenin sırasıdır.
    bolgeler: { ...ilerleme.bolgeler, [bolge.kimlik]: { bitenler, kaldigi: gorev.sira } },
    kartlar,
  }
}

/**
 * Bölge ekranında biten görev. Ekran açılırken kaydın sıfırlama kimliğini alır (sifirlama);
 * görev bitince, yazmadan önce son kayıttakiyle karşılaştırır. Aynıysa görev kaydedilir
 * (gorevBitti). Farklıysa ekran açıkken ilerleme sıfırlanmıştır: kayıt değişmez, sıfırlama geri
 * alınmaz; ekran son kayıttan, baştan açılır (App.tsx: kimlik ekranın anahtarındadır).
 */
export function ekrandaGorevBitti(
  ilerleme: Ilerleme,
  bolge: Bolge,
  gorev: Gorev,
  simdi: Date,
  sifirlama: number,
  kartEkleri?: readonly (readonly string[])[],
): Ilerleme {
  return ilerleme.sifirlama === sifirlama
    ? gorevBitti(ilerleme, bolge, gorev, simdi, kartEkleri)
    : ilerleme
}

/** Bölgeye girilince oynanacak görevin yeri: kalınan görev; tur bittiyse baştan. */
export function kaldigiGorev(ilerleme: Ilerleme, bolge: Bolge): number {
  const kaldigi = ilerleme.bolgeler[bolge.kimlik]?.kaldigi ?? 0
  return kaldigi < bolge.gorevler.length ? kaldigi : 0
}

/** Bölgenin bütün görevleri en az bir kez bitti mi. İçeriği olmayan bölge bitmez. */
export function bolgeBittiMi(ilerleme: Ilerleme, bolge: Bolge): boolean {
  const bitenler = new Set(ilerleme.bolgeler[bolge.kimlik]?.bitenler)
  return bolge.gorevler.length > 0 && bolge.gorevler.every((g) => bitenler.has(g.sira))
}

/**
 * Haritadaki durum:
 *   acik          açık, oynanabilir
 *   tamam         bütün görevleri en az bir kez bitti; yine oynanabilir
 *   kilitli       önceki bölge bitmedi
 *   hazirlaniyor  açık ama içeriği henüz yok
 */
export type BolgeDurumu = 'acik' | 'tamam' | 'kilitli' | 'hazirlaniyor'

export interface HaritaBolgesi {
  readonly bolge: Bolge
  readonly durum: BolgeDurumu
  /** Önceki bölge: kilitliyse önce onun bitmesi gerekir. İlk bölgede null. */
  readonly onceki: Bolge | null
}

/** Bir bölge, öncekinin bütün görevleri en az bir kez bitince açılır. İlk bölge hep açıktır. */
export function bolgeDurumlari(
  ilerleme: Ilerleme,
  bolgeler: readonly Bolge[] = BOLGELER,
): HaritaBolgesi[] {
  return bolgeler.map((bolge, i) => {
    const onceki = bolgeler[i - 1] ?? null
    const durum: BolgeDurumu =
      onceki !== null && !bolgeBittiMi(ilerleme, onceki)
        ? 'kilitli'
        : bolge.gorevler.length === 0
          ? 'hazirlaniyor'
          : bolgeBittiMi(ilerleme, bolge)
            ? 'tamam'
            : 'acik'
    return { bolge, durum, onceki }
  })
}

// --- Sözlük -------------------------------------------------------------------------------

/** İki an yerel saatle aynı günde mi. */
export function ayniGun(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Bölgede bugün kurulan kelimelerin kartları, kurulma sırasıyla (akşam ekranı). */
export function bugununKartlari(ilerleme: Ilerleme, bolgeKimligi: string, simdi: Date): SozlukKarti[] {
  return ilerleme.kartlar
    .filter((k) => k.bolge === bolgeKimligi && ayniGun(new Date(k.sonKurulma), simdi))
    .sort((a, b) => Date.parse(a.sonKurulma) - Date.parse(b.sonKurulma))
}

export interface SozlukGrubu {
  readonly bolge: Bolge
  /** En yeni kart önde. */
  readonly kartlar: readonly SozlukKarti[]
}

/** Sözlük: kartlar bölgelere göre gruplu (bölge sırasıyla); her grupta en yeni kart önde. */
export function sozlukGruplari(
  ilerleme: Ilerleme,
  bolgeler: readonly Bolge[] = BOLGELER,
): SozlukGrubu[] {
  // Aynı anda kazanılan kartlarda sonra kazanılan önde: ters sırayla kararlı sıralama.
  const yeniOnde = [...ilerleme.kartlar]
    .reverse()
    .sort((a, b) => Date.parse(b.tarih) - Date.parse(a.tarih))
  return bolgeler
    .map((bolge) => ({ bolge, kartlar: yeniOnde.filter((k) => k.bolge === bolge.kimlik) }))
    .filter((grup) => grup.kartlar.length > 0)
}

// --- Ayarlar ve sıfırlama ------------------------------------------------------------------

export function ayarlariDegistir(ilerleme: Ilerleme, degisen: Partial<Ayarlar>): Ilerleme {
  return { ...ilerleme, ayarlar: { ...ilerleme.ayarlar, ...degisen } }
}

/**
 * Bütün ilerleme ve kartlar silinir; ayarlar kalır (renk körü çocuğun Renksiz'i gibi). Sıfırlama
 * kimliği bir artar: açık bölge ekranları sıfırlamayı geri alamaz (ekrandaGorevBitti).
 */
export function ilerlemeyiSifirla(ilerleme: Ilerleme): Ilerleme {
  return { ...BOS_ILERLEME, ayarlar: ilerleme.ayarlar, sifirlama: ilerleme.sifirlama + 1 }
}
