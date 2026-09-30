// Cihazdaki depo: localStorage. İlerleme, kartlar ve ayarlar yalnız burada, tek anahtarda
// durur (src/oyun/ilerleme.ts, ANAHTAR); hiçbir yere gönderilmez (CLAUDE.md, 14. kural).
// Depoya erişilemiyorsa (çerezler engelli, gizli pencere, dolu depo) oyun bellekte sürer:
// hata atılmaz, konsola yazılmaz. Aynı cihazda açık pencereler (sekme, ana ekrandaki uygulama)
// aynı kaydı paylaşır; biri ötekinin ilerlemesini ezmez (pencereKaydi).

import { useCallback, useEffect, useState } from 'react'
import { ANAHTAR, pencereKaydi, type Depo, type Ilerleme } from '../oyun/ilerleme.ts'

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

/**
 * Oyunun ilerlemesi: yüklenir, değiştirilir, her değişiklikte kaydedilir. Değişiklik depodaki
 * son kayda uygulanır: art arda gelen iki değişiklik de, aynı cihazdaki iki pencere de birbirini
 * ezmez. Kaydı başka bir pencere değiştirince bu pencere de onu gösterir (storage olayı).
 */
export function useIlerleme(): readonly [Ilerleme, (degisiklik: (i: Ilerleme) => Ilerleme) => void] {
  const [kayit] = useState(() => pencereKaydi(cihazDeposu()))
  const [ilerleme, setIlerleme] = useState(kayit.ilerleme)

  useEffect(() => {
    const dinle = (olay: StorageEvent) => {
      // key null: depo bütünüyle silindi (localStorage.clear).
      if (olay.key !== null && olay.key !== ANAHTAR) return
      if (kayit.tazele()) setIlerleme(kayit.ilerleme)
    }
    window.addEventListener('storage', dinle)
    return () => window.removeEventListener('storage', dinle)
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

  return [ilerleme, degistir]
}
