// Oyunun kabuğu: yönlendirme, cihazdaki ilerleme ve ayarlar. Açılış ekranı ada haritasıdır;
// bölgeye haritadan girilir. Harita, Sözlük ve Ayarlar'ın altında alt gezinme durur; bölge
// ekranı bütün yüksekliği kullanır.
//
//   #/                 ada haritası
//   #/bolge/<kimlik>   bölge ekranı (açık ya da tamam bölge; değilse harita açılır)
//   #/sozluk           Sözlük
//   #/ayarlar          Ayarlar

import { useEffect, useLayoutEffect } from 'react'
import AdaHaritasi from './ekranlar/AdaHaritasi.tsx'
import AltGezinme from './ekranlar/AltGezinme.tsx'
import Ayarlar from './ekranlar/Ayarlar.tsx'
import BukalemunKoyu from './ekranlar/BukalemunKoyu.tsx'
import Sozluk from './ekranlar/Sozluk.tsx'
import { useIlerleme } from './kabuk/depo.ts'
import { HARITA, useRota } from './kabuk/yonlendirici.ts'
import {
  ayarlariDegistir,
  bolgeDurumlari,
  bugununKartlari,
  gorevBitti,
  ilerlemeyiSifirla,
  kaldigiGorev,
  sozlukGruplari,
} from './oyun/ilerleme.ts'

/**
 * Ekranı yazılmış bölgeler. Yeni bölgenin ekranı kendi oturumunda buraya eklenir; ekranı
 * olmayan bölgeye girilmez.
 */
const BOLGE_EKRANLARI = new Set(['koy'])

export default function App() {
  const [rota, git] = useRota()
  const [ilerleme, degistir, disSurumler] = useIlerleme()
  const { hareket, renkler } = ilerleme.ayarlar

  // Ayarlar belgenin köküne yazılır; CSS (tema.css, geçişler) ve hareket.ts oradan okur.
  useLayoutEffect(() => {
    const kok = document.documentElement
    kok.dataset.hareket = hareket
    kok.dataset.renkler = renkler
  }, [hareket, renkler])

  const haritaBolgeleri = bolgeDurumlari(ilerleme)
  const girilen =
    rota.ekran === 'bolge'
      ? haritaBolgeleri.find(
          ({ bolge, durum }) =>
            bolge.kimlik === rota.kimlik &&
            (durum === 'acik' || durum === 'tamam') &&
            BOLGE_EKRANLARI.has(bolge.kimlik),
        )?.bolge
      : undefined
  const girilemez = rota.ekran === 'bolge' && !girilen

  // Açılmamış, içeriği olmayan ya da tabloda olmayan bölgenin adresi haritaya döner.
  useEffect(() => {
    if (girilemez) git(HARITA)
  }, [girilemez, git])

  if (girilen) {
    // Bölgenin ilerlemesi başka bir pencerede değişirse (görev, sıfırlama) ekran kalınan yerden
    // yeniden açılır: dış sürüm anahtara girer. Bu pencerenin kendi görevi ekranı kesmez.
    return (
      <BukalemunKoyu
        key={`${girilen.kimlik}:${disSurumler[girilen.kimlik] ?? 0}`}
        bolge={girilen}
        baslangic={kaldigiGorev(ilerleme, girilen)}
        bugunkuKartlar={bugununKartlari(ilerleme, girilen.kimlik, new Date())}
        onGorevBitti={(gorev) => degistir((i) => gorevBitti(i, girilen, gorev, new Date()))}
        onHarita={() => git(HARITA)}
      />
    )
  }

  const ekran = rota.ekran === 'sozluk' || rota.ekran === 'ayarlar' ? rota.ekran : 'harita'
  return (
    <div className={`kabuk kabuk--${ekran}`}>
      {ekran === 'harita' && (
        <AdaHaritasi
          bolgeler={haritaBolgeleri}
          onBolge={(bolge) => git({ ekran: 'bolge', kimlik: bolge.kimlik })}
        />
      )}
      {ekran === 'sozluk' && <Sozluk gruplar={sozlukGruplari(ilerleme)} />}
      {ekran === 'ayarlar' && (
        <Ayarlar
          ayarlar={ilerleme.ayarlar}
          onAyar={(degisen) => degistir((i) => ayarlariDegistir(i, degisen))}
          onSifirla={() => degistir(ilerlemeyiSifirla)}
        />
      )}
      <AltGezinme etkin={ekran} onGit={git} />
    </div>
  )
}
