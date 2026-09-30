// Alt gezinme: Harita, Sözlük, Ayarlar; simge ve yazıyla, dokunma alanı en az 44 px. Bu üç
// ekranın altında durur. Bölge ekranında yoktur: oyun ekranı bütün yüksekliği kullanır, haritaya
// üst çubuktaki Harita düğmesiyle dönülür.
//
// Öğeler bağlantıdır (href="#/sozluk"); dokununca yönlendirici gider (onGit), böylece geçmiş
// yönlendiricinin düzenine uyar. Yeni sekme istekleri (orta tık, Ctrl, Cmd) tarayıcıya kalır.

import type { MouseEvent } from 'react'
import { rotaAdresi, type Rota } from '../kabuk/yonlendirici.ts'
import { AyarlarSimgesi, HaritaSimgesi, SozlukSimgesi } from './simgeler.tsx'
import './AltGezinme.css'

export type UstEkran = 'harita' | 'sozluk' | 'ayarlar'

const OGELER = [
  { ekran: 'harita', ad: 'Harita', Simge: HaritaSimgesi },
  { ekran: 'sozluk', ad: 'Sözlük', Simge: SozlukSimgesi },
  { ekran: 'ayarlar', ad: 'Ayarlar', Simge: AyarlarSimgesi },
] as const

export default function AltGezinme({
  etkin,
  onGit,
}: {
  /** Açık ekran: aria-current="page" alır. */
  readonly etkin: UstEkran
  readonly onGit: (rota: Rota) => void
}) {
  function tiklandi(e: MouseEvent<HTMLAnchorElement>, rota: Rota) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onGit(rota)
  }

  return (
    <nav className="alt-gezinme" aria-label="Gezinme">
      <ul className="alt-gezinme__liste">
        {OGELER.map(({ ekran, ad, Simge }) => {
          const rota: Rota = { ekran }
          return (
            <li key={ekran}>
              <a
                className="alt-gezinme__oge"
                href={rotaAdresi(rota)}
                aria-current={ekran === etkin ? 'page' : undefined}
                onClick={(e) => tiklandi(e, rota)}
              >
                <Simge />
                <span>{ad}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
