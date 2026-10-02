// Eski adresin temizliği. Eski adres: frtbasbug.github.io/morfemusta/; yenisi (pilot-1.1'den,
// adı Ekle Bakalım): frtbasbug.github.io/ekle-bakalim/. Origin aynı: localStorage'daki
// ilerleme ve pilotun günlüğü (morfemusta.* anahtarları) yerinde kalır. Eski adresin service
// worker'ı ve önbellekleri ise kendiliğinden gitmez; eski adres artık açılmadığı için onlar da
// güncellenmez. Yeni adres açılınca (oyun ve pilot.html):
//
//   - kapsamı /morfemusta/ olan service worker kayıtları kaldırılır;
//   - adı eski kapsamı taşıyan önbellekler (Workbox'ın ön belleği:
//     workbox-precache-v2-https://frtbasbug.github.io/morfemusta/) silinir;
//   - seslerin önbelleğinden (adı aynı: morfemusta-ses) eski adresin sesleri silinir; yeni
//     adresinkiler kalır. Önbellek yoksa açılmaz (caches.open boş önbellek kurardı).
//
// Hata yutulur: temizlik oyunu hiç durdurmaz. Tarayıcı bağlantısı dışarıdan verilir (birim testi).

import { SES_ONBELLEGI } from '../ses/onbellek.ts'

/** Eski adresin yolu (Vite'ın eski tabanı). */
export const ESKI_TABAN = '/morfemusta/'

/** Service worker kaydının bu modülün kullandığı alanları. */
export interface SwKaydi {
  readonly scope: string
  unregister(): Promise<boolean>
}

/** navigator.serviceWorker'ın kullanılan kısmı. */
export interface SwKapsayici {
  getRegistrations(): Promise<readonly SwKaydi[]>
}

/** Önbelleğin kullanılan kısmı (Cache). */
export interface Onbellek {
  keys(): Promise<readonly { readonly url: string }[]>
  delete(adres: string): Promise<boolean>
}

/** caches'in kullanılan kısmı (CacheStorage). */
export interface Onbellekler {
  keys(): Promise<readonly string[]>
  has(ad: string): Promise<boolean>
  open(ad: string): Promise<Onbellek>
  delete(ad: string): Promise<boolean>
}

/** Ne temizlendi: kaldırılan kayıtların kapsamları, silinen önbellekler, silinen sesler. */
export interface Temizlik {
  readonly kayitlar: readonly string[]
  readonly onbellekler: readonly string[]
  readonly sesler: number
}

const eskiYolMu = (adres: string): boolean => {
  try {
    return new URL(adres).pathname.startsWith(ESKI_TABAN)
  } catch {
    return false
  }
}

/** Eski adresin service worker'ını ve önbelleklerini temizler; ne temizlendiğini döndürür. */
export async function eskiAdresiTemizle(ortam: {
  readonly serviceWorker?: SwKapsayici
  readonly caches?: Onbellekler
}): Promise<Temizlik> {
  const kayitlar: string[] = []
  const onbellekler: string[] = []
  let sesler = 0
  try {
    for (const kayit of (await ortam.serviceWorker?.getRegistrations()) ?? []) {
      if (eskiYolMu(kayit.scope) && (await kayit.unregister())) kayitlar.push(kayit.scope)
    }
  } catch {
    // Kayıtlar okunamadı: sonraki açılışta yeniden denenir.
  }
  const { caches } = ortam
  if (!caches) return { kayitlar, onbellekler, sesler }
  try {
    for (const ad of await caches.keys()) {
      // Workbox önbelleğin adına kapsamı yazar: ...-https://frtbasbug.github.io/morfemusta/.
      if (ad.includes(ESKI_TABAN) && (await caches.delete(ad))) onbellekler.push(ad)
    }
    if (await caches.has(SES_ONBELLEGI)) {
      const onbellek = await caches.open(SES_ONBELLEGI)
      for (const istek of await onbellek.keys()) {
        if (eskiYolMu(istek.url) && (await onbellek.delete(istek.url))) sesler += 1
      }
    }
  } catch {
    // Önbellek okunamadı: sonraki açılışta yeniden denenir.
  }
  return { kayitlar, onbellekler, sesler }
}

/** Tarayıcıda: sayfanın girişinde (oyun, pilot.html) çağrılır, beklenmez. */
export function tarayicidaEskiAdresiTemizle(): void {
  void eskiAdresiTemizle({
    serviceWorker: 'serviceWorker' in navigator ? navigator.serviceWorker : undefined,
    caches: typeof caches === 'undefined' ? undefined : caches,
  })
}
