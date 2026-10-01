// Cihazdaki depo: localStorage. İlerleme, kartlar ve ayarlar yalnız burada, tek anahtarda
// durur (src/oyun/ilerleme.ts, ANAHTAR); hiçbir yere gönderilmez (CLAUDE.md, 14. kural).
// Depoya erişilemiyorsa (çerezler engelli, gizli pencere, dolu depo) oyun bellekte sürer:
// hata atılmaz, konsola yazılmaz. Aynı cihazda açık pencereler (sekme, ana ekrandaki uygulama)
// aynı kaydı paylaşır; biri ötekinin ilerlemesini ezmez (pencereKaydi). Sınıf modunda ilerleme
// yalnız bu pencerenin belleğindedir (oyunKaydi).

import { useCallback, useEffect, useState } from 'react'
import {
  ANAHTAR,
  ayarlariDegistir,
  degisenBolgeler,
  oyunKaydi,
  type Depo,
  type Ilerleme,
  type PencereKaydi,
} from '../oyun/ilerleme.ts'
import { adrestekiSinifModu, sinifsizAdres } from './sinif.ts'

/** Tarayıcının localStorage'ı; erişim kapalıysa null. */
export function cihazDeposu(): Depo | null {
  try {
    return window.localStorage ?? null
  } catch {
    // Erişim engelli (SecurityError): oyun bellekte sürer.
    return null
  }
}

let kalicilikIstendi = false

/**
 * Tarayıcıdan kalıcı depo ister (navigator.storage.persist): yer darlığında kayıt silinmesin.
 * Yalnız ilk başarılı kayıttan sonra ve sayfa başına bir kez; yoksa ya da reddedilirse sessiz.
 */
export function kaliciligiIste(): void {
  if (kalicilikIstendi) return
  kalicilikIstendi = true
  try {
    const depolama = navigator.storage as StorageManager | undefined
    if (typeof depolama?.persist !== 'function') return
    const zatenKalici =
      typeof depolama.persisted === 'function' ? depolama.persisted() : Promise.resolve(false)
    zatenKalici
      .then((kalici) => (kalici ? undefined : depolama.persist()))
      .catch(() => {
        // İzin verilmedi ya da desteklenmiyor: kayıt yine localStorage'da.
      })
  } catch {
    // navigator.storage'a erişilemiyor.
  }
}

let pencereninKaydi: PencereKaydi | null = null

/**
 * Bu pencerenin kaydı: sayfa açılınca bir kez kurulur; sınıf modunun belleği de ondadır (o
 * açılış boyunca). Adresteki ?sinif=1 ya da ?sinif=0 burada ayarlara yazılır, sonra adresten
 * kalkar (src/kabuk/sinif.ts). Depo yazılamasa da seçim bu açılışta geçerlidir.
 */
function kaydiKur(): PencereKaydi {
  if (pencereninKaydi) return pencereninKaydi
  const kayit = oyunKaydi(cihazDeposu())
  const sinif = adrestekiSinifModu(window.location.search)
  if (sinif !== null) {
    kayit.degistir((i) => ayarlariDegistir(i, { sinif }))
    window.history.replaceState(window.history.state, '', sinifsizAdres(window.location.href))
  }
  pencereninKaydi = kayit
  return kayit
}

/** Bölgelerin dış sürümü: ilerlemesi başka bir pencereden kaç kez değişti (kimlikle). */
export type DisSurumler = Readonly<Record<string, number>>

/**
 * Oyunun ilerlemesi: yüklenir, değiştirilir, her değişiklikte kaydedilir. Değişiklik depodaki
 * son kayda uygulanır: art arda gelen iki değişiklik de, aynı cihazdaki iki pencere de birbirini
 * ezmez. Kaydı başka bir pencere değiştirince bu pencere de onu gösterir: storage olayıyla;
 * olay ulaşmadıysa (arka planda donmuş sekme, geri tuşuyla önbellekten dönen sayfa) pencere
 * görünür olunca (visibilitychange) ya da sayfa yeniden gösterilince (pageshow) kayıt yeniden
 * okunur. O pencere bir bölgenin ilerlemesini değiştirdiyse bölgenin dış sürümü artar (açık
 * bölge ekranı kalınan yerden yeniden açılır).
 */
export function useIlerleme(): readonly [
  Ilerleme,
  (degisiklik: (i: Ilerleme) => Ilerleme) => void,
  DisSurumler,
] {
  const [kayit] = useState(kaydiKur)
  const [ilerleme, setIlerleme] = useState(kayit.ilerleme)
  const [disSurumler, setDisSurumler] = useState<DisSurumler>({})

  useEffect(() => {
    const disaridanOku = () => {
      const once = kayit.ilerleme
      if (!kayit.tazele()) return
      setIlerleme(kayit.ilerleme)
      const degisenler = degisenBolgeler(once, kayit.ilerleme)
      if (degisenler.length === 0) return
      setDisSurumler((surumler) => ({
        ...surumler,
        ...Object.fromEntries(degisenler.map((kimlik) => [kimlik, (surumler[kimlik] ?? 0) + 1])),
      }))
    }
    const depoDegisti = (olay: StorageEvent) => {
      // key null: depo bütünüyle silindi (localStorage.clear).
      if (olay.key === null || olay.key === ANAHTAR) disaridanOku()
    }
    const gorundu = () => {
      if (document.visibilityState === 'visible') disaridanOku()
    }
    window.addEventListener('storage', depoDegisti)
    document.addEventListener('visibilitychange', gorundu)
    window.addEventListener('pageshow', disaridanOku)
    return () => {
      window.removeEventListener('storage', depoDegisti)
      document.removeEventListener('visibilitychange', gorundu)
      window.removeEventListener('pageshow', disaridanOku)
    }
  }, [kayit])

  const degistir = useCallback(
    (degisiklik: (i: Ilerleme) => Ilerleme) => {
      const once = kayit.ilerleme
      const kaydedildi = kayit.degistir(degisiklik)
      if (kayit.ilerleme !== once) setIlerleme(kayit.ilerleme)
      if (kaydedildi) kaliciligiIste()
    },
    [kayit],
  )

  return [ilerleme, degistir, disSurumler]
}
