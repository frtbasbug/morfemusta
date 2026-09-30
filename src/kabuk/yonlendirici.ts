// Küçük bir hash yönlendiricisi; kitaplık yok. Adresler:
//
//   #/                 ada haritası (açılış ekranı)
//   #/bolge/<kimlik>   bölge ekranı (#/bolge/koy)
//   #/sozluk           Sözlük
//   #/ayarlar          Ayarlar
//
// Harita köktür. Haritadan açılan ekran geçmişe eklenir (pushState); alt gezinmeyle bir
// ekrandan ötekine geçiş geçmişteki yeri değiştirir (replaceState). Haritaya dönüş, ekran
// haritadan açıldıysa bir adım geri gider. Böylece geçmiş hiç iki adımı aşmaz: telefonun geri
// tuşu her ekrandan haritaya, haritadan oyunun dışına götürür (Android'in alt gezinme düzeni).
// Hash sunucuya gitmez; service worker her adresi aynı index.html'le açar.

import { useCallback, useEffect, useRef, useState } from 'react'

export type Rota =
  | { readonly ekran: 'harita' }
  | { readonly ekran: 'bolge'; readonly kimlik: string }
  | { readonly ekran: 'sozluk' }
  | { readonly ekran: 'ayarlar' }

export const HARITA: Rota = { ekran: 'harita' }

/** Adresin hash'ini çözer; tanınmayan adres null. Boş hash haritadır. */
export function rotayiCoz(hash: string): Rota | null {
  const yol = hash.replace(/^#/, '')
  if (yol === '' || yol === '/') return HARITA
  if (yol === '/sozluk') return { ekran: 'sozluk' }
  if (yol === '/ayarlar') return { ekran: 'ayarlar' }
  const kimlik = /^\/bolge\/([a-z]+)$/.exec(yol)?.[1]
  return kimlik === undefined ? null : { ekran: 'bolge', kimlik }
}

export function rotaAdresi(rota: Rota): string {
  switch (rota.ekran) {
    case 'harita':
      return '#/'
    case 'bolge':
      return `#/bolge/${rota.kimlik}`
    case 'sozluk':
      return '#/sozluk'
    case 'ayarlar':
      return '#/ayarlar'
  }
}

/** Geçmişteki kaydın durumu: ekran haritanın üstüne açıldı, geri tuşu haritaya döner. */
interface GecmisDurumu {
  readonly haritaUstunde: true
}

const haritaUstundeMi = (durum: unknown): durum is GecmisDurumu =>
  typeof durum === 'object' && durum !== null && (durum as GecmisDurumu).haritaUstunde === true

const simdikiRota = (): Rota => rotayiCoz(window.location.hash) ?? HARITA

/** history.back()'ten sonra popstate'in beklendiği en uzun süre (ms). */
const GERI_BEKLEME = 1000

/** Oynanan rota ve ona gitme işlevi. Geri ve ileri tuşları popstate ile okunur. */
export function useRota(): readonly [Rota, (hedef: Rota) => void] {
  const [rota, setRota] = useState<Rota>(simdikiRota)
  // history.back() eşzamansızdır: popstate gelene kadar (en çok GERI_BEKLEME) ikinci bir
  // gidiş, örneğin düğmeye iki kez dokunmak, geçmişte bir adım daha geri götürmesin.
  const geriGidisAni = useRef(0)

  useEffect(() => {
    // Tanınmayan adres (açılışta ya da elle yazılınca) haritaya çevrilir.
    const duzelt = () => {
      if (rotayiCoz(window.location.hash) === null) {
        window.history.replaceState(null, '', rotaAdresi(HARITA))
      }
    }
    duzelt()
    const oku = () => {
      geriGidisAni.current = 0
      duzelt()
      setRota(simdikiRota())
    }
    window.addEventListener('popstate', oku)
    window.addEventListener('hashchange', oku)
    return () => {
      window.removeEventListener('popstate', oku)
      window.removeEventListener('hashchange', oku)
    }
  }, [])

  const git = useCallback((hedef: Rota) => {
    if (Date.now() - geriGidisAni.current < GERI_BEKLEME) return
    const simdiki = simdikiRota()
    const adres = rotaAdresi(hedef)
    if (adres === rotaAdresi(simdiki)) return
    const { history } = window
    if (hedef.ekran === 'harita') {
      if (haritaUstundeMi(history.state)) {
        geriGidisAni.current = Date.now()
        history.back()
        return
      }
      history.replaceState(null, '', adres)
    } else if (simdiki.ekran === 'harita') {
      const durum: GecmisDurumu = { haritaUstunde: true }
      history.pushState(durum, '', adres)
    } else {
      history.replaceState(history.state, '', adres)
    }
    setRota(hedef)
  }, [])

  return [rota, git]
}
