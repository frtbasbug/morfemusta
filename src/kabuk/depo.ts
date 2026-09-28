// Cihazdaki depo: localStorage. İlerleme, kartlar ve ayarlar yalnız burada, tek anahtarda
// durur (src/oyun/ilerleme.ts, ANAHTAR); hiçbir yere gönderilmez (CLAUDE.md, 14. kural).
// Depoya erişilemiyorsa (çerezler engelli, gizli pencere, dolu depo) oyun bellekte sürer:
// hata atılmaz, konsola yazılmaz.

import { useCallback, useRef, useState } from 'react'
import { ilerlemeyiKaydet, ilerlemeyiYukle, type Depo, type Ilerleme } from '../oyun/ilerleme.ts'

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
 * Oyunun ilerlemesi: yüklenir, değiştirilir, her değişiklikte kaydedilir. Değişiklik son
 * duruma uygulanır (art arda gelen iki değişiklik birbirini ezmez).
 */
export function useIlerleme(): readonly [Ilerleme, (degisiklik: (i: Ilerleme) => Ilerleme) => void] {
  const [depo] = useState(cihazDeposu)
  const [ilerleme, setIlerleme] = useState(() => ilerlemeyiYukle(depo))
  const son = useRef(ilerleme)

  const degistir = useCallback(
    (degisiklik: (i: Ilerleme) => Ilerleme) => {
      const yeni = degisiklik(son.current)
      if (yeni === son.current) return
      son.current = yeni
      setIlerleme(yeni)
      if (ilerlemeyiKaydet(depo, yeni)) kaliciligiIste()
    },
    [depo],
  )

  return [ilerleme, degistir]
}
