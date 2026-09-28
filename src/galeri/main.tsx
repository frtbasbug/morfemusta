// Karakter Galerisi'nin giriş noktası (galeri.html). Oyundan bağlantı almaz.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Yazı tipleri pakete gömülüdür; dış yazı tipi sunucusu kullanılmaz. Baloo 2'den yalnız
// Türkçenin gerektirdiği latin (ç ö ü ı) ve latin-ext (ğ ş İ) alt kümeleri yüklenir.
import '@fontsource/andika/400.css'
import '@fontsource/andika/700.css'
import '@fontsource/baloo-2/latin-800.css'
import '@fontsource/baloo-2/latin-ext-800.css'
import '../gorsel/tema.css'
import './galeri.css'
import KarakterGalerisi from './KarakterGalerisi.tsx'

const kok = document.getElementById('kok')
if (!kok) throw new Error('#kok öğesi bulunamadı')

createRoot(kok).render(
  <StrictMode>
    <KarakterGalerisi />
  </StrictMode>,
)
