import { useState } from 'react'
import AcilisEkrani from './ekranlar/AcilisEkrani.tsx'
import BukalemunKoyu from './ekranlar/BukalemunKoyu.tsx'

// Ekranlar arası geçiş. Ada haritası (Oturum 6) gelene kadar açılış ekranındaki geçici bir
// düğme Bukalemun Koyu'nu açar.
type Ekran = 'acilis' | 'bukalemun-koyu'

export default function App() {
  const [ekran, setEkran] = useState<Ekran>('acilis')
  if (ekran === 'bukalemun-koyu') return <BukalemunKoyu onAnaSayfa={() => setEkran('acilis')} />
  return <AcilisEkrani onBukalemunKoyu={() => setEkran('bukalemun-koyu')} />
}
