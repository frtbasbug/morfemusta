// Ses Denetim Sayfası'nın giriş noktası (ses.html). Oyundan bağlantı almaz.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/andika/latin-400.css'
import '@fontsource/andika/latin-ext-400.css'
import '@fontsource/andika/latin-700.css'
import '@fontsource/andika/latin-ext-700.css'
import '../gorsel/tema.css'
import '../genel.css'
import { sesiAc } from '../ses/calar.ts'
import SesDenetimi from './SesDenetimi.tsx'

const kok = document.getElementById('kok')
if (!kok) throw new Error('#kok öğesi bulunamadı')

// iOS'ta ses ancak bir dokunuşla açılır.
sesiAc()

createRoot(kok).render(
  <StrictMode>
    <SesDenetimi />
  </StrictMode>,
)
