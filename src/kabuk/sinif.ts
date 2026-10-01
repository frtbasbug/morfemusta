// Sınıf modu adresle de açılır ya da kapanır (tahtadaki yer imi için): ?sinif=1 açar, ?sinif=0
// kapatır. Seçim ayarlara yazılır (cihazın kaydı, src/oyun/ilerleme.ts); değiştirgen sonra
// adresten kalkar: ayar Ayarlar'dan değişince sayfayı yenilemek onu geri almasın.

import type { Ayarlar } from '../oyun/ilerleme.ts'

export type SinifModu = Ayarlar['sinif']

/** Adresin sorgusundaki sınıf modu: ?sinif=1 açık, ?sinif=0 kapalı; yoksa ya da başkaysa null. */
export function adrestekiSinifModu(arama: string): SinifModu | null {
  const deger = new URLSearchParams(arama).get('sinif')
  return deger === '1' ? 'acik' : deger === '0' ? 'kapali' : null
}

/** Adres, sınıf değiştirgeni olmadan; öteki değiştirgenler ve hash (#/bolge/koy) kalır. */
export function sinifsizAdres(adres: string): string {
  const url = new URL(adres)
  url.searchParams.delete('sinif')
  return url.href
}
