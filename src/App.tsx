// Oyunun kabuğu: yönlendirme, cihazdaki ilerleme ve ayarlar. Açılış ekranı ada haritasıdır;
// bölgeye haritadan girilir. Harita, Sözlük ve Ayarlar'ın altında alt gezinme durur; bölge
// ekranı bütün yüksekliği kullanır. Sınıf modunda (etkileşimli tahta) bütün bölgeler açıktır,
// ilerleme yalnız o açılışın belleğindedir (src/oyun/ilerleme.ts, oyunKaydi); ekranlarda "Sınıf"
// işareti durur, görünüm geniş yatay ekran içindir (Sinif.css).
//
//   #/                 ada haritası
//   #/bolge/<kimlik>   bölge ekranı (açık ya da tamam bölge; değilse harita açılır)
//   #/sozluk           Sözlük
//   #/ayarlar          Ayarlar

import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import AdaHaritasi from './ekranlar/AdaHaritasi.tsx'
import AltGezinme from './ekranlar/AltGezinme.tsx'
import Ayarlar from './ekranlar/Ayarlar.tsx'
import BukalemunKoyu from './ekranlar/BukalemunKoyu.tsx'
import FistikciSahap from './ekranlar/FistikciSahap.tsx'
import KokBahcesi from './ekranlar/KokBahcesi.tsx'
import Sozluk from './ekranlar/Sozluk.tsx'
import SinifIsareti, { SinifSaglayici } from './ekranlar/SinifIsareti.tsx'
import { AkisSaglayici } from './ekranlar/akis.tsx'
import Uydurukcuklar from './ekranlar/Uydurukcuklar.tsx'
import './ekranlar/Sinif.css'
import { useIlerleme } from './kabuk/depo.ts'
import { cihazdaGunlukAcik, GunlukSaglayici } from './kabuk/gunluk.tsx'
import { ANA_EKRAN_IPUCU, anaEkranIpucuGorunsunMu, buCihaz } from './kabuk/ipucu.ts'
import { bolgeSesleriniIndir, sus } from './ses/calar.ts'
import { SesSaglayici } from './ses/Ses.tsx'
import { HARITA, useRota } from './kabuk/yonlendirici.ts'
import {
  ayarlariDegistir,
  bolgeDurumlari,
  bugununKartlari,
  ekrandaGorevBitti,
  ekrandaPuanYaz,
  elKapaliMi,
  eliKapat,
  gecerliGecis,
  ilerlemeyiSifirla,
  ipucunuKapat,
  kaldigiGorev,
  sozlukGruplari,
  turunPuani,
  type Ayarlar as AyarDegerleri,
} from './oyun/ilerleme.ts'
import type { Gorev } from './oyun/gorevler.ts'
import type { TurPuani } from './oyun/puan.ts'

/**
 * Ekranı yazılmış bölgeler, kimlikleriyle. Yeni bölgenin ekranı kendi oturumunda buraya
 * eklenir; ekranı olmayan bölgeye girilmez. Bölge ekranları aynı kabuğu alır: bölge, kalınan
 * görev, bugünün kartları, görev bitti ve haritaya dönüş. Görev bitince ekran kartların
 * eklerini de verebilir (Kök Bahçesi: yalnız gövde kelimeleri); vermezse kart görevin
 * kelimesidir. Kurulan kelimeyi de verebilir (Uydurukçuklar: çocuğun seçtiği gıvağım).
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
  const { hareket, renkler, ses, sinif } = ilerleme.ayarlar

  // Ayarlar belgenin köküne yazılır; CSS (tema.css, geçişler, Sinif.css) ve hareket.ts oradan
  // okur.
  useLayoutEffect(() => {
    const kok = document.documentElement
    kok.dataset.hareket = hareket
    kok.dataset.renkler = renkler
    kok.dataset.sinif = sinif
  }, [hareket, renkler, sinif])

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

  // Ekran değişince çalan ses susar (haritaya dönüş, alt gezinme, geri tuşu). Yerleşim etkisidir:
  // yeni ekranın sesli modda söyleyişi (useEffect) ondan sonra başlar, kesilmez.
  const ekranAnahtari = rota.ekran === 'bolge' ? `bolge:${rota.kimlik}` : rota.ekran
  useLayoutEffect(() => {
    sus()
  }, [ekranAnahtari])

  // Bölgenin sesleri ilk girişte arka planda iner (arayüzünkiler ve koyunkiler önbellekte hazır).
  const girilenKimlik = girilen?.kimlik
  useEffect(() => {
    if (girilenKimlik && ses !== 'kapali') void bolgeSesleriniIndir(girilenKimlik)
  }, [girilenKimlik, ses])

  if (girilen && ekraniVar(girilen.kimlik)) {
    const BolgeEkrani = BOLGE_EKRANLARI[girilen.kimlik]
    // Bölge ekranı en son kayıttan açılır ve dışarıdan gelen değişikliği izler; ikisi de ekranın
    // anahtarındadır:
    //   - dış sürüm: başka pencere bölgenin ilerlemesini değiştirince (görev, sıfırlama) artar;
    //   - sıfırlama kimliği: ekran açılırken aldığı kimlik. Görev bitince yazmadan önce son
    //     kayıttakiyle karşılaştırılır (ekrandaGorevBitti); farklıysa hiçbir şey yazılmaz, son
    //     kaydın kimliği anahtara girer ve ekran baştan açılır. Sıfırlama geri alınmaz.
    // Bu pencerenin kendi görevi ve ayar değişikliği ekranı kesmez. Sınıf modu açılıp kapanınca
    // (başka pencereden) ilerlemenin kaynağı değişir: mod da anahtardadır.
    // Akış (src/ekranlar/akis.tsx): geçiş ayarı, süren turun puanı ve ilk dakika eli. Puan ve
    // kapanan el, görev gibi, ekranın sıfırlama kimliğiyle yazılır.
    const { sifirlama } = ilerleme
    const kimlik = girilen.kimlik
    const akis = {
      gecis: gecerliGecis(ilerleme.ayarlar),
      baslangicPuani: turunPuani(ilerleme, girilen),
      elKapali: elKapaliMi(ilerleme, kimlik),
      onPuan: (gorev: Gorev, puan: TurPuani) =>
        degistir((i) => ekrandaPuanYaz(i, girilen, gorev, puan, sifirlama)),
      onElKapandi: () =>
        degistir((i) => (i.sifirlama === sifirlama ? eliKapat(i, kimlik) : i)),
    }
    return (
      <Baglam ayarlar={ilerleme.ayarlar}>
        <AkisSaglayici deger={akis}>
        <BolgeEkrani
          key={`${sinif}:${girilen.kimlik}:${sifirlama}:${disSurumler[girilen.kimlik] ?? 0}`}
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
        </AkisSaglayici>
      </Baglam>
    )
  }

  const ekran = rota.ekran === 'sozluk' || rota.ekran === 'ayarlar' ? rota.ekran : 'harita'
  return (
    <Baglam ayarlar={ilerleme.ayarlar}>
      <div className={`kabuk kabuk--${ekran}`}>
        <SinifIsareti kose />
        {ekran === 'harita' && (
          <AdaHaritasi
            bolgeler={haritaBolgeleri}
            onBolge={(bolge) => git({ ekran: 'bolge', kimlik: bolge.kimlik })}
            ipucu={
              anaEkranIpucuGorunsunMu(buCihaz(), ilerleme, cihazdaGunlukAcik())
                ? ANA_EKRAN_IPUCU
                : undefined
            }
            onIpucuKapat={() => degistir((i) => ipucunuKapat(i, 'ana-ekran'))}
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
    </Baglam>
  )
}

/**
 * Ekranların bağlamı: ses ayarı, sınıf modu ve pilotun deneme günlüğü (src/kabuk/gunluk.tsx:
 * pilot.html'de kod girilince her seçim cihazdaki günlüğe yazılır; sınıf modunda yazılmaz).
 */
function Baglam({ ayarlar, children }: { ayarlar: AyarDegerleri; children: ReactNode }) {
  return (
    <SesSaglayici ayar={ayarlar.ses}>
      <SinifSaglayici acik={ayarlar.sinif === 'acik'}>
        <GunlukSaglayici ayarlar={ayarlar}>{children}</GunlukSaglayici>
      </SinifSaglayici>
    </SesSaglayici>
  )
}
