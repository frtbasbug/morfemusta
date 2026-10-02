// Ekranların hareketleri Web Animations API ile oynatılır. Hareket azaltma açıksa hiçbir
// hareket oynamaz: yardımcılar hemen döner, ekran yalnız renk ve yazı değiştirir. Hareket iki
// yoldan azalır: cihazın ayarı (prefers-reduced-motion: reduce) ya da oyunun Ayarlar'ındaki
// Azalt (html[data-hareket="azalt"]; CSS geçişleri de buna bakar). Hareket, öğenin kalıcı
// stilini değiştirmez (fill yok); kalıcı durum hareketten önce satır içi stile yazılır, hareket
// bitince öğe orada kalır.

export function hareketAzMi(): boolean {
  if (typeof document !== 'undefined' && document.documentElement.dataset.hareket === 'azalt') {
    return true
  }
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

/**
 * Hareketi oynatır ve bitmesini bekler. Öğe yoksa ya da hareket azaltma açıksa hemen döner;
 * yarıda kesilen (iptal edilen) hareket de bitmiş sayılır.
 */
export async function oynat(
  oge: Element | null | undefined,
  kareler: Keyframe[],
  secenekler: KeyframeAnimationOptions,
): Promise<void> {
  if (!oge || hareketAzMi() || hizli) return
  try {
    await oge.animate(kareler, secenekler).finished
  } catch {
    // Hareket iptal edildi (öğe yeniden tutuldu ya da ekrandan kalktı).
  }
}

/** Süren duraklar: hızlandırılınca hemen biterler. */
const duraklar = new Set<() => void>()

/** Hareketler arasındaki kısa durak; hareket azaltmada ve hızlandırılınca beklemez. */
export function bekle(ms: number): Promise<void> {
  if (hareketAzMi() || hizli) return Promise.resolve()
  return new Promise((coz) => {
    const bitir = () => {
      clearTimeout(zaman)
      duraklar.delete(bitir)
      coz()
    }
    const zaman = setTimeout(bitir, ms)
    duraklar.add(bitir)
  })
}

/**
 * Hızlı geçiş: doğru yerleştirmenin büyüsü sürerken ekrana dokunan sıradaki göreve hemen geçer
 * (akis.tsx). Süren hareketler sonlarına atlar (kalıcı durum zaten satır içi stildedir), duraklar
 * biter; hızlıKapat'a kadar yeni hareket oynamaz, durak beklemez.
 */
let hizli = false

export function hizlandir(): void {
  hizli = true
  if (typeof document !== 'undefined' && typeof document.getAnimations === 'function') {
    for (const hareket of document.getAnimations()) {
      try {
        hareket.finish()
      } catch {
        // Sonsuz hareket bitirilemez; yeri yok.
      }
    }
  }
  for (const bitir of [...duraklar]) bitir()
}

/** Hızlı geçiş bitti: hareketler yeniden oynar. */
export function hizliKapat(): void {
  hizli = false
}

/** Öğenin süren bütün hareketlerini keser. */
export function hareketleriKes(oge: Element | null | undefined): void {
  for (const hareket of oge?.getAnimations() ?? []) hareket.cancel()
}

export interface Nokta {
  readonly x: number
  readonly y: number
}

export const kaydir = ({ x, y }: Nokta): string => `translate(${x}px, ${y}px)`
