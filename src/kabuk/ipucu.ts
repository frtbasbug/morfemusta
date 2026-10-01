// Ana ekran ipucu (DESIGN.md, "Cihazda ilerleme"): iOS'ta Safari, ana ekrana eklenmemiş sitenin
// betikle yazılan deposunu (localStorage) yedi gün etkileşim olmazsa siler; ana ekrana eklenen
// web uygulaması bundan muaftır. Bu yüzden iPhone ve iPad Safari'de, uygulama ana ekrandan
// açılmamışsa haritada bir kez küçük bir ipucu görünür: "İlerlemen silinmesin: Paylaş → Ana
// Ekrana Ekle." Kapatılınca kayda yazılır (kapananIpuclari), bir daha çıkmaz. Sınıf modunda
// görünmez: orada ilerleme zaten kaydedilmez.

import { sinifModundaMi, type Ilerleme } from '../oyun/ilerleme.ts'

export const ANA_EKRAN_IPUCU = 'İlerlemen silinmesin: Paylaş → Ana Ekrana Ekle.'

export interface Cihaz {
  readonly kullaniciAjani: string
  /** navigator.maxTouchPoints: iPadOS masaüstü Safari'si gibi görünür, dokunmatiktir. */
  readonly dokunmaNoktasi: number
  /** Ana ekrandan açıldı (navigator.standalone ya da display-mode: standalone). */
  readonly anaEkranda: boolean
}

/** Safari'den başka iOS tarayıcıları ve uygulama içi tarayıcılar. */
const BASKA_TARAYICI = /CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|GSA\/|DuckDuckGo|YaBrowser|FBAN|FBAV|Instagram|Line\//

/** iPhone ya da iPad'de Safari mi (iPadOS kendini Mac gibi tanıtır; dokunmatikliği ayırır). */
export function iosSafariMi({ kullaniciAjani: ua, dokunmaNoktasi }: Cihaz): boolean {
  const ios = /iPhone|iPod|iPad/.test(ua) || (/Macintosh/.test(ua) && dokunmaNoktasi > 1)
  return ios && /Version\/[\d.]+.*Safari\//.test(ua) && !BASKA_TARAYICI.test(ua)
}

/**
 * Ana ekran ipucu görünsün mü: iOS Safari'de, ana ekrandan açılmamışsa, ipucu kapatılmamışsa,
 * sınıf modu kapalıysa.
 */
export function anaEkranIpucuGorunsunMu(cihaz: Cihaz, ilerleme: Ilerleme): boolean {
  return (
    iosSafariMi(cihaz) &&
    !cihaz.anaEkranda &&
    !ilerleme.kapananIpuclari.includes('ana-ekran') &&
    !sinifModundaMi(ilerleme)
  )
}

/** Bu cihaz: tarayıcıdan okunur; okunamıyorsa ipucu gerektirmeyen bir cihaz. */
export function buCihaz(): Cihaz {
  try {
    const standalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
    return {
      kullaniciAjani: navigator.userAgent,
      dokunmaNoktasi: navigator.maxTouchPoints ?? 0,
      anaEkranda: standalone || window.matchMedia?.('(display-mode: standalone)').matches === true,
    }
  } catch {
    return { kullaniciAjani: '', dokunmaNoktasi: 0, anaEkranda: true }
  }
}
