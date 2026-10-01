// Deneme günlüğünün arayüzdeki bağlantısı (src/oyun/gunluk.ts; DESIGN.md, "Pilot"). Kabuk
// (App.tsx) yazıcıyı bağlamla verir; bölge ekranları her seçimi useDenemeGunlugu ile bildirir.
// Günlük yalnız cihazdadır, ayrı anahtarda: kod yokken (pilot.html) ve sınıf modunda hiçbir şey
// yazılmaz; depo dolarsa günlük durur, oyun sürer. Sağlayıcı olmadan (birim testleri, galeri)
// hiçbir şey yazılmaz.

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Gorev } from '../oyun/gorevler.ts'
import { denemeSayaci, gunlukYazici, type GunlukYazici, type Secim } from '../oyun/gunluk.ts'
import type { Ayarlar } from '../oyun/ilerleme.ts'
import { SURUM_ADI } from '../surum.ts'
import { cihazDeposu } from './depo.ts'

type Yaz = (secim: Secim) => void

const GunlukBaglami = createContext<Yaz | null>(null)

let pencereninYazicisi: GunlukYazici | null = null

/** Bu pencerenin yazıcısı: sayfa başına bir kez kurulur (depo dolunca durması bu açılışta sürer). */
function yazici(): GunlukYazici {
  pencereninYazicisi ??= gunlukYazici(cihazDeposu(), SURUM_ADI)
  return pencereninYazicisi
}

/** Seçimleri günlüğe yazar: ses modu ve sınıf modu ayarlardan. */
export function GunlukSaglayici({
  ayarlar,
  children,
}: {
  readonly ayarlar: Ayarlar
  readonly children: ReactNode
}) {
  const { ses, sinif } = ayarlar
  const yaz = useCallback(
    (secim: Secim) => {
      yazici().yaz(secim, { sinif: sinif === 'acik', sesModu: ses, simdi: new Date() })
    },
    [ses, sinif],
  )
  return <GunlukBaglami.Provider value={yaz}>{children}</GunlukBaglami.Provider>
}

/** Seçimin ekrana özgü alanları: doğru biçim, seçilen, kurulan kelime, sonuç ve neden. */
export interface SecimAlanlari {
  readonly dogruBicim: string
  readonly secilen: string
  readonly aday: string
  readonly dogru: boolean
  /** Motorun nedenleri, ; ile (nedenKodlari); doğruysa boş. */
  readonly neden: string
}

/**
 * Bölge ekranının günlüğü: kaydet(adım, alanlar) bir seçimi yazar. Görevin başından geçen süreyi
 * ve adımdaki deneme sayısını sayar (denemeSayaci); görev değişince (Sıradaki, ekranın açılışı)
 * sıfırlanır. Adım, görevin içindeki seçim yeridir: zincirde ekin sırası, sınır adımında "sinir".
 */
export function useDenemeGunlugu(
  bolge: string,
  gorev: Gorev | undefined,
): (adim: string, alanlar: SecimAlanlari) => void {
  const yaz = useContext(GunlukBaglami)
  const [sayac] = useState(denemeSayaci)
  const gorevKimligi = gorev ? String(gorev.sira) : ''

  // Görevin başı: görev ekrana gelince (açılışta ve Sıradaki'de).
  useEffect(() => {
    if (gorevKimligi) sayac.gorevBasladi(gorevKimligi, performance.now())
  }, [sayac, gorevKimligi])

  return (adim, alanlar) => {
    if (!yaz || !gorev) return
    const { denemeNo, sureMs } = sayac.deneme(gorevKimligi, adim, performance.now())
    yaz({
      bolge,
      tur: gorev.tur,
      gorev: gorev.turdakiSira,
      kok: gorev.kok,
      ekler: gorev.etiketler.join('+'),
      ...alanlar,
      denemeNo,
      sureMs,
    })
  }
}
