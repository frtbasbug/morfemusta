// Karakter Galerisi'nin giriş noktası (galeri.html). Oyundan bağlantı almaz.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Yazı tipleri pakete gömülüdür: Andika harfler ve metin, Baloo 2 başlık için.
import '@fontsource/andika/400.css'
import '@fontsource/andika/700.css'
import '@fontsource/baloo-2/800.css'
import '../genel.css'
import '../gorsel/tema.css'
import './galeri.css'
import GaleriSayfasi from './GaleriSayfasi.tsx'

const kok = document.getElementById('kok')
if (!kok) throw new Error('#kok öğesi bulunamadı')

createRoot(kok).render(
  <StrictMode>
    <GaleriSayfasi />
  </StrictMode>,
)
