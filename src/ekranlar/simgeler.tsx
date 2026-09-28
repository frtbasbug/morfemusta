// Arayüz simgeleri: kodla çizilmiş, 24×24, yalnız çizgi. Rengi yazının rengidir
// (currentColor); çizgi kalınlığı ve uçları simgeler.css'tedir. Simge hep bir yazının yanında
// durur ya da düğmenin adı aria-label'dadır: ekran okuyucudan gizlidir.

import type { ReactNode } from 'react'
import './simgeler.css'

function Simge({ children, sinif }: { children: ReactNode; sinif?: string }) {
  return (
    <svg
      className={sinif ? `simge ${sinif}` : 'simge'}
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

/** Katlanmış harita. */
export function HaritaSimgesi() {
  return (
    <Simge>
      <path d="M3.5 6.5L9 4l6 2.5L20.5 4v13.5L15 20l-6-2.5-5.5 2.5z" />
      <path d="M9 4v13.5M15 6.5V20" />
    </Simge>
  )
}

/** Açık kitap: Sözlük. */
export function SozlukSimgesi() {
  return (
    <Simge>
      <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" />
      <path d="M12 6.5v13" />
    </Simge>
  )
}

/** İki sürgü: Ayarlar. */
export function AyarlarSimgesi() {
  return (
    <Simge>
      <path d="M4 7.5h8.5M17.5 7.5H20M4 16.5h2.5M11.5 16.5H20" />
      <circle cx="15" cy="7.5" r="2.5" />
      <circle cx="9" cy="16.5" r="2.5" />
    </Simge>
  )
}

/** Kilit: bölge kilitli. */
export function KilitSimgesi() {
  return (
    <Simge>
      <rect x="5.5" y="10.5" width="13" height="10" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" />
    </Simge>
  )
}

/** Tamam işareti: bölgenin bütün görevleri bitti. */
export function TamamSimgesi() {
  return (
    <Simge>
      <path d="M4.5 12.5l5 5L19.5 7" />
    </Simge>
  )
}

/** Kum saati: bölge hazırlanıyor. */
export function KumSaatiSimgesi() {
  return (
    <Simge>
      <path d="M6.5 3.5h11M6.5 20.5h11" />
      <path d="M8 3.5c0 5 8 5.5 8 8.5s-8 3.5-8 8.5M16 3.5c0 5-8 5.5-8 8.5s8 3.5 8 8.5" />
    </Simge>
  )
}

/** Başlama üçgeni: bölge açık. */
export function AcikSimgesi() {
  return (
    <Simge>
      <path d="M8.5 5.5v13l10-6.5z" />
    </Simge>
  )
}

/** Hilal: akşam. */
export function HilalSimgesi({ sinif }: { sinif?: string }) {
  return (
    <Simge sinif={sinif}>
      <path d="M19.5 15A8 8 0 1 1 9 4.5a6.5 6.5 0 0 0 10.5 10.5z" />
    </Simge>
  )
}
