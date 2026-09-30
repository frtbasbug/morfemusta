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
import FistikciSahap from './ekranlar/FistikciSahap.tsx'
import KokBahcesi from './ekranlar/KokBahcesi.tsx'
import Sozluk from './ekranlar/Sozluk.tsx'
import Uydurukcuklar from './ekranlar/Uydurukcuklar.tsx'
import { useIlerleme } from './kabuk/depo.ts'
import { HARITA, useRota } from './kabuk/yonlendirici.ts'
import {
  ayarlariDegistir,
  bolgeDurumlari,
  bugununKartlari,
  ekrandaGorevBitti,
  ilerlemeyiSifirla,
  kaldigiGorev,
  sozlukGruplari,
} from './oyun/ilerleme.ts'

/**
 * Ekranı yazılmış bölgeler, kimlikleriyle. Yeni bölgenin ekranı kendi oturumunda buraya
 * eklenir; ekranı olmayan bölgeye girilmez. Bölge ekranları aynı kabuğu alır: bölge, kalınan
 * görev, bugünün kartları, görev bitti ve haritaya dönüş. Görev bitince ekran kartların
 * eklerini de verebilir (Kök Bahçesi: yalnız gövde kelimeleri); vermezse kart görevin
 * kelimesidir. Kurulan kelimeyi de verebilir (Uydurukçuklar: çocuğun seçtiği pıtağım).
 */
const BOLGE_EKRANLARI = {
  koy: BukalemunKoyu,
  dukkan: FistikciSahap,
  bahce: KokBahcesi,
  uyduruk: Uydurukcuklar,
} as const

const ekraniVar = (kimlik: string): kimlik is keyof typeof BOLGE_EKRANLARI =>
  Object.hasOwn(BOLGE_EKRANLARI, kimlik)

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
            ekraniVar(bolge.kimlik),
        )?.bolge
      : undefined
  const girilemez = rota.ekran === 'bolge' && !girilen

  // Açılmamış, içeriği olmayan ya da tabloda olmayan bölgenin adresi haritaya döner.
  useEffect(() => {
    if (girilemez) git(HARITA)
  }, [girilemez, git])

  if (girilen && ekraniVar(girilen.kimlik)) {
    const BolgeEkrani = BOLGE_EKRANLARI[girilen.kimlik]
    // Bölge ekranı en son kayıttan açılır ve dışarıdan gelen değişikliği izler; ikisi de ekranın
    // anahtarındadır:
    //   - dış sürüm: başka pencere bölgenin ilerlemesini değiştirince (görev, sıfırlama) artar;
    //   - sıfırlama kimliği: ekran açılırken aldığı kimlik. Görev bitince yazmadan önce son
    //     kayıttakiyle karşılaştırılır (ekrandaGorevBitti); farklıysa hiçbir şey yazılmaz, son
    //     kaydın kimliği anahtara girer ve ekran baştan açılır. Sıfırlama geri alınmaz.
    // Bu pencerenin kendi görevi ve ayar değişikliği ekranı kesmez.
    const { sifirlama } = ilerleme
    return (
      <BolgeEkrani
        key={`${girilen.kimlik}:${sifirlama}:${disSurumler[girilen.kimlik] ?? 0}`}
        bolge={girilen}
        baslangic={kaldigiGorev(ilerleme, girilen)}
        bugunkuKartlar={bugununKartlari(ilerleme, girilen.kimlik, new Date())}
        onGorevBitti={(gorev, kartEkleri?: readonly (readonly string[])[], kelime?: string) =>
          degistir((i) =>
            ekrandaGorevBitti(i, girilen, gorev, new Date(), sifirlama, kartEkleri, kelime),
          )
        }
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
