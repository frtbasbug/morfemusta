// Biçim Denetim Sayfası'nın giriş noktası (denetim.html). Oyundan bağlantı almaz.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/andika/400.css'
import '@fontsource/andika/700.css'
import '../genel.css'
import './denetim.css'
import DenetimSayfasi from './DenetimSayfasi.tsx'

const kok = document.getElementById('kok')
if (!kok) throw new Error('#kok öğesi bulunamadı')

createRoot(kok).render(
  <StrictMode>
    <DenetimSayfasi />
  </StrictMode>,
)
