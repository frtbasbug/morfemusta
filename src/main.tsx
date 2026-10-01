import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Andika ve Baloo 2 pakete gömülüdür; dış yazı tipi sunucusu kullanılmaz.
// Türkçe harfler latin (ç ö ü ı) ve latin-ext (ğ ş İ) alt kümelerindedir; ikisi de yalnız bu
// alt kümelerle yüklenir (Kiril ve Vietnamca önbelleğe girmez). Tarayıcı unicode-range sayesinde
// yalnız gerekeni indirir.
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-ext-400.css'
import '@fontsource/andika/latin-700.css'
import '@fontsource/andika/latin-ext-700.css'
import '@fontsource/baloo-2/latin-800.css'
import '@fontsource/baloo-2/latin-ext-800.css'
import './gorsel/tema.css'
import './genel.css'
import App from './App.tsx'
import { sesiAc } from './ses/calar.ts'

// Oyunun modülü çalıştı: index.html'deki eski tarayıcı uyarısı çıkmaz.
document.documentElement.dataset.acildi = ''

const kok = document.getElementById('kok')
if (!kok) throw new Error('#kok öğesi bulunamadı')

// iOS'ta ses ancak bir dokunuşla açılır: ilk dokunuşta çalar hazırlanır.
sesiAc()

createRoot(kok).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
