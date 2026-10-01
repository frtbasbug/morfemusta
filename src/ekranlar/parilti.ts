// Doğruda kelimenin çevresinde küçük bir parıltı (DESIGN.md, "Ses ve resim"): yıldızcıklar
// kelimenin kutusunun çevresinde belirip söner. Süstür (aria-hidden); renkleri belirteçlerden
// (--parilti-1, --parilti-2; Renksiz'de gri). Hareket azaltma açıksa hiç çizilmez. Yıldızcıklar
// belgenin gövdesine eklenir ve hareket bitince kalkar: ekranın düzenine karışmaz.

import { hareketAzMi } from './hareket.ts'
import './parilti.css'

/** Dört köşeli bir yıldızcık (24×24). */
const YILDIZCIK = 'M12 1C13 8 16 11 23 12C16 13 13 16 12 23C11 16 8 13 1 12C8 11 11 8 12 1Z'

export interface Yildizcik {
  /** Kutunun içinde yer: 0 sol (üst), 1 sağ (alt); dışı kutunun dışıdır. */
  readonly x: number
  readonly y: number
  /** Boyu, yıldızcığın olağan boyuna oranla. */
  readonly olcek: number
  /** Gecikme (ms). */
  readonly gecikme: number
}

/** Yıldızcıkların yerleri: kutunun dört köşesinde ve üst ile alt kenarında, sırayla. */
export const YILDIZCIKLAR: readonly Yildizcik[] = [
  { x: -0.04, y: 0.1, olcek: 1, gecikme: 0 },
  { x: 0.5, y: -0.18, olcek: 0.75, gecikme: 50 },
  { x: 1.04, y: 0.05, olcek: 1, gecikme: 100 },
  { x: 1.06, y: 0.9, olcek: 0.75, gecikme: 150 },
  { x: 0.42, y: 1.16, olcek: 0.9, gecikme: 200 },
  { x: -0.05, y: 0.92, olcek: 0.7, gecikme: 250 },
]

/** Bir yıldızcığın süresi (ms); bütün parıltı 600 ms'den kısa sürer. */
export const YILDIZCIK_SURESI = 340

/** Hedefin çevresinde parıltı. Hedef yoksa ya da hareket azaltma açıksa hiçbir şey olmaz. */
export function parlat(hedef: Element | null | undefined): void {
  if (!hedef || hareketAzMi() || typeof document === 'undefined') return
  const kutu = hedef.getBoundingClientRect()
  if (kutu.width === 0 && kutu.height === 0) return
  const kap = document.createElement('div')
  kap.className = 'parilti'
  kap.setAttribute('aria-hidden', 'true')
  Object.assign(kap.style, {
    left: `${kutu.left}px`,
    top: `${kutu.top}px`,
    width: `${kutu.width}px`,
    height: `${kutu.height}px`,
  })
  const hareketler: Promise<unknown>[] = []
  YILDIZCIKLAR.forEach((y, i) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('class', `parilti__yildiz parilti__yildiz--${(i % 2) + 1}`)
    svg.style.left = `${y.x * 100}%`
    svg.style.top = `${y.y * 100}%`
    const yol = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    yol.setAttribute('d', YILDIZCIK)
    svg.append(yol)
    kap.append(svg)
    const boy = (olcek: number, aci: number) =>
      `translate(-50%, -50%) rotate(${aci}deg) scale(${olcek * y.olcek})`
    const hareket = svg.animate(
      [
        { transform: boy(0, 0), opacity: 0 },
        { transform: boy(1, 30), opacity: 1, offset: 0.45 },
        { transform: boy(0.2, 70), opacity: 0 },
      ],
      { duration: YILDIZCIK_SURESI, delay: y.gecikme, easing: 'ease-out', fill: 'backwards' },
    )
    hareketler.push(hareket.finished.catch(() => {}))
  })
  document.body.append(kap)
  void Promise.all(hareketler).then(() => kap.remove())
}
