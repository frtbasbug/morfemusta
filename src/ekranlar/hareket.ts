// Ekranların hareketleri Web Animations API ile oynatılır. Hareket azaltma
// (prefers-reduced-motion: reduce) açıksa hiçbir hareket oynamaz: yardımcılar hemen döner,
// ekran yalnız renk ve yazı değiştirir. Hareket, öğenin kalıcı stilini değiştirmez (fill yok);
// kalıcı durum hareketten önce satır içi stile yazılır, hareket bitince öğe orada kalır.

export function hareketAzMi(): boolean {
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
  if (!oge || hareketAzMi()) return
  try {
    await oge.animate(kareler, secenekler).finished
  } catch {
    // Hareket iptal edildi (öğe yeniden tutuldu ya da ekrandan kalktı).
  }
}

/** Hareketler arasındaki kısa durak; hareket azaltmada beklemez. */
export function bekle(ms: number): Promise<void> {
  if (hareketAzMi()) return Promise.resolve()
  return new Promise((coz) => setTimeout(coz, ms))
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
