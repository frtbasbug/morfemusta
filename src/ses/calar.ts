// Seslerin çalınması: önceden üretilmiş sesler (scripts/ses-uret.py) cihazda çalar; hiçbir şey
// cihazdan çıkmaz (CLAUDE.md, 14. kural). Metnin dosyası ses-listesi.json'dadır; listede
// olmayan metin için istek bile gitmez, oyun sessiz sürer.
//
//   - Aynı anda tek ses çalar; yenisi eskisini keser (cal). Bir dizi (ad ve ileti) sırayla
//     çalar; yeni bir çağrı diziyi de keser.
//   - Ses dosyası fetch ile blob olarak alınır, oradan çalar: service worker'ın önbelleğinden
//     de gelir; aralık (Range) isteği yoktur, iOS Safari'de de çalar.
//   - iOS'ta ses ancak bir dokunuşla açılır: ilk dokunuşta aynı <audio> öğesi sessiz bir sesle
//     bir kez çalınır (sesiAc); sonraki çalmalar dokunuş beklemez.
//   - Çalınamayan ses (dosya yok, çözülemedi, tarayıcı izin vermedi) sessizce atlanır; konsola
//     hata yazılmaz.
//   - Arayüzün ve Bukalemun Koyu'nun sesleri önbellekte hazırdır (vite.config.ts); öteki
//     bölgelerin sesleri bölgeye ilk girişte arka planda iner (bolgeSesleriniIndir).

import liste from './ses-listesi.json'

export interface SesKaydi {
  readonly dosya: string
  readonly okunus: string
  readonly bolgeler: readonly string[]
  /** Dosyanın içeriğinin özeti: ses yeniden üretilince değişir. */
  readonly surum: string
}

/** Metinden sesine: ses-listesi.json. */
export const SESLER: Readonly<Record<string, SesKaydi>> = liste.metinler as Record<
  string,
  SesKaydi
>

/** Bölgeye ilk girişte inen seslerin önbelleği; service worker de oradan verir. */
export const SES_ONBELLEGI = 'morfemusta-ses'

export const sesVarMi = (metin: string): boolean => Object.hasOwn(SESLER, metin.normalize('NFC'))

/** Dosyanın adresi: public/ses/ altında, sitenin alt yoluyla. */
export const sesAdresi = (dosya: string): string => `${import.meta.env.BASE_URL}ses/${dosya}`

/** Arayüzün ve koyun sesleri service worker'ın ön belleğindedir (vite.config.ts). */
export const onceIner = (kayit: SesKaydi): boolean =>
  kayit.bolgeler.includes('arayuz') || kayit.bolgeler.includes('koy')

/**
 * Sesin adresi. Ön bellektekinin adresi yalın: sürümünü Workbox tutar (sorgu eklenseydi ön
 * bellekle eşleşmez, çevrim dışı çalmazdı). Ötekilerin adresinde içeriğin sürümü var: ses
 * yeniden üretilince adres de değişir, çalışma anı önbelleğindeki eski kayıt kullanılmaz.
 */
export const kayitAdresi = (kayit: SesKaydi): string =>
  onceIner(kayit) ? sesAdresi(kayit.dosya) : `${sesAdresi(kayit.dosya)}?v=${kayit.surum}`
/** 8 kHz, tek örneklik sessiz WAV: iOS'ta sesi açmak için. */
const SESSIZ =
  'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAACAgA=='

let oge: HTMLAudioElement | null = null
/** Çalan dizinin kimliği: yeni çağrı artırır, eski dizi durur. */
let dizi = 0
const bloblar = new Map<string, Promise<string | null>>()

function audio(): HTMLAudioElement | null {
  if (oge) return oge
  if (typeof Audio === 'undefined') return null
  oge = new Audio()
  oge.preload = 'auto'
  return oge
}

function blobAdresi(kaynak: string): Promise<string | null> {
  let adres = bloblar.get(kaynak)
  if (!adres) {
    adres = fetch(kaynak)
      .then((yanit) => (yanit.ok ? yanit.blob() : null))
      .then((blob) => (blob ? URL.createObjectURL(blob) : null))
      .catch(() => null)
    bloblar.set(kaynak, adres)
    // İnmeyen ses bir sonraki denemede yeniden istenir.
    void adres.then((a) => {
      if (a === null) bloblar.delete(kaynak)
    })
  }
  return adres
}

/** Tek sesi sonuna kadar çalar; kesilir ya da çalınamazsa hemen döner. */
function sonunaKadar(a: HTMLAudioElement): Promise<void> {
  return new Promise((bitti) => {
    const bitir = () => {
      a.removeEventListener('ended', bitir)
      a.removeEventListener('pause', bitir)
      a.removeEventListener('error', bitir)
      bitti()
    }
    a.addEventListener('ended', bitir)
    a.addEventListener('pause', bitir)
    a.addEventListener('error', bitir)
    a.play().catch(bitir)
  })
}

/** Susar: çalan ses ve dizi durur. */
export function sus(): void {
  dizi++
  oge?.pause()
}

/**
 * Metni (ya da metinleri sırayla) çalar; çalan sesi keser. Sesi olmayan metin atlanır.
 * Çalma bitince (ya da kesilince) döner.
 */
export function cal(metinler: string | readonly string[]): Promise<void> {
  const sesler: { adres: string; metin: string }[] = []
  for (const metin of typeof metinler === 'string' ? [metinler] : metinler) {
    const kayit = SESLER[metin.normalize('NFC')]
    if (kayit) sesler.push({ adres: kayitAdresi(kayit), metin: metin.normalize('NFC') })
  }
  return sirayla(sesler)
}

/** Listede olmayan bir dosyayı çalar (Ses Denetim Sayfası'nın örnekleri: ornek/yavas-1.mp3). */
export function dosyaCal(dosya: string, metin: string): Promise<void> {
  return sirayla([{ adres: sesAdresi(dosya), metin }])
}

async function sirayla(sesler: readonly { adres: string; metin: string }[]): Promise<void> {
  const kimlik = ++dizi
  const a = audio()
  if (!a) return
  a.pause()
  for (const ses of sesler) {
    const { metin } = ses
    const adres = await blobAdresi(ses.adres)
    if (kimlik !== dizi) return
    if (!adres) continue
    a.src = adres
    a.dataset.metin = metin
    await sonunaKadar(a)
    if (kimlik !== dizi) return
  }
}

let acildi = false

/**
 * iOS'ta ses ilk dokunuştan sonra açılır: ilk dokunuşta (ya da tuşta) aynı <audio> öğesi sessiz
 * bir sesle çalınır. Oyunun girişinde bir kez çağrılır.
 */
export function sesiAc(): void {
  if (acildi || typeof document === 'undefined') return
  acildi = true
  const ac = () => {
    document.removeEventListener('pointerdown', ac, true)
    document.removeEventListener('keydown', ac, true)
    const a = audio()
    if (!a || a.src) return
    a.src = SESSIZ
    a.play().catch(() => {})
  }
  document.addEventListener('pointerdown', ac, true)
  document.addEventListener('keydown', ac, true)
}

const indirilen = new Set<string>()

/**
 * Bölgenin seslerini arka planda önbelleğe indirir (bölgeye ilk girişte). Arayüzün ve koyun
 * sesleri zaten önbellektedir (service worker'ın ön belleği). Hata olursa sessizce bırakılır;
 * inmeyen ses çalınınca yine istenir.
 */
export async function bolgeSesleriniIndir(kimlik: string): Promise<void> {
  if (indirilen.has(kimlik) || typeof caches === 'undefined') return
  indirilen.add(kimlik)
  try {
    const onbellek = await caches.open(SES_ONBELLEGI)
    // Eski sürümler (ses yeniden üretildi, metin artık yok) silinir.
    const gecerli = new Set(
      Object.values(SESLER)
        .filter((k) => !onceIner(k))
        .map((k) => new URL(kayitAdresi(k), location.href).href),
    )
    for (const istek of await onbellek.keys()) {
      if (!gecerli.has(istek.url)) await onbellek.delete(istek)
    }
    for (const kayit of Object.values(SESLER)) {
      if (!kayit.bolgeler.includes(kimlik) || onceIner(kayit)) continue
      const adres = kayitAdresi(kayit)
      if (!(await onbellek.match(adres))) await onbellek.add(adres)
    }
  } catch {
    indirilen.delete(kimlik)
  }
}
