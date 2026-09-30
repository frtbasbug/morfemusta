import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Andika ve Baloo 2 pakete gömülüdür; dış yazı tipi sunucusu kullanılmaz.
// Türkçe harfler latin (ç ö ü ı) ve latin-ext (ğ ş İ) alt kümelerindedir;
// tarayıcı unicode-range sayesinde yalnız gerekeni indirir. Baloo 2 (ekran başlıkları)
// yalnız bu iki alt kümeyle yüklenir.
import '@fontsource/andika/400.css'
import '@fontsource/andika/700.css'
import '@fontsource/baloo-2/latin-800.css'
import '@fontsource/baloo-2/latin-ext-800.css'
import './gorsel/tema.css'
import './genel.css'
import App from './App.tsx'

const kok = document.getElementById('kok')
if (!kok) throw new Error('#kok öğesi bulunamadı')

createRoot(kok).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
