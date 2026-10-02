// Pilot sayfasının giriş noktası (pilot.html). Oyundan tek bağlantısı Hakkında'dadır.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-ext-400.css'
import '@fontsource/andika/latin-700.css'
import '@fontsource/andika/latin-ext-700.css'
import '@fontsource/baloo-2/latin-800.css'
import '@fontsource/baloo-2/latin-ext-800.css'
import '../gorsel/tema.css'
import '../genel.css'
import './pilot.css'
import { tarayicidaEskiAdresiTemizle } from '../kabuk/eskiAdres.ts'
import PilotSayfasi from './PilotSayfasi.tsx'

const kok = document.getElementById('kok')
if (!kok) throw new Error('#kok öğesi bulunamadı')

createRoot(kok).render(
  <StrictMode>
    <PilotSayfasi />
  </StrictMode>,
)

// Eski adresin (/morfemusta/) service worker'ı ve önbelleği kalkar; günlük yerinde kalır.
tarayicidaEskiAdresiTemizle()
