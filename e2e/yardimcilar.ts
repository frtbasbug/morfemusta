import { expect, type Page } from '@playwright/test'

// Uçtan uca testlerin ortak yardımcıları. Oyun doğru biçimi motordan alır; burada yalnız
// testlerin beklediği sonuçlar yazılıdır (Bukalemun Koyu'nun on görevi, sırayla).

/** Her görevin doğru bukalemunları, adım adım. */
export const DOGRU_YUZEYLER = [
  ['lar'],
  ['ler'],
  ['lar'],
  ['ler'],
  ['ım'],
  ['im'],
  ['um'],
  ['üm'],
  ['üm'],
  ['lar', 'ım'],
] as const

export const KELIMELER = [
  'atlar',
  'evler',
  'kuşlar',
  'gözler',
  'kızım',
  'elim',
  'topum',
  'gözüm',
  'gülüm',
  'toplarım',
] as const

/** Cihazdaki kaydın anahtarı (src/oyun/ilerleme.ts). */
export const ANAHTAR = 'morfemusta.v1'

export const haritaBasligi = (sayfa: Page) =>
  sayfa.getByRole('heading', { level: 1, name: 'Morfemusta Adası' })
export const koyBasligi = (sayfa: Page) =>
  sayfa.getByRole('heading', { level: 1, name: 'Bukalemun Koyu' })

/** Haritadaki bölge düğmesi; adı "Bukalemun Koyu, Açık" gibidir. */
export const bolge = (sayfa: Page, ad: string) =>
  sayfa.locator('.harita__bolgeler').getByRole('button', { name: ad })
export const ileti = (sayfa: Page) => sayfa.locator('.harita__ileti')
export const gezinme = (sayfa: Page, ad: 'Harita' | 'Sözlük' | 'Ayarlar') =>
  sayfa.getByRole('navigation', { name: 'Gezinme' }).getByRole('link', { name: ad })

export const bukalemun = (sayfa: Page, yuzey: string) =>
  sayfa.getByRole('button', { name: new RegExp(`^${yuzey} bukalemunu,`) })
export const kart = (sayfa: Page) => sayfa.locator('button.kelime-karti')
export const sonraki = (sayfa: Page) => sayfa.getByRole('button', { name: 'Sıradaki' })
export const sira = (sayfa: Page) => sayfa.locator('.bolge-ustu__sira')
export const haritaDugmesi = (sayfa: Page) => sayfa.getByRole('button', { name: 'Harita', exact: true })

/** Oyunu açar ve haritadan Bukalemun Koyu'na girer. */
export async function koyuAc(sayfa: Page) {
  await sayfa.goto('./')
  await bolge(sayfa, 'Bukalemun Koyu').click()
  await expect(koyBasligi(sayfa)).toBeVisible()
}

/** Görevi (0'dan) dokun-dokun doğru oynar; Sıradaki görünene kadar bekler. */
export async function gorevOyna(sayfa: Page, yer: number) {
  for (const yuzey of DOGRU_YUZEYLER[yer] ?? []) {
    await bukalemun(sayfa, yuzey).tap()
    await kart(sayfa).tap()
  }
  await expect(sonraki(sayfa)).toBeVisible()
}

/** Görevleri sırayla oynar: her birinin sonunda Sıradaki'ye basar. */
export async function gorevleriOyna(sayfa: Page, ilk: number, son: number) {
  for (let yer = ilk; yer <= son; yer++) {
    await expect(sira(sayfa)).toHaveText(`Görev ${yer + 1} / 10`)
    await gorevOyna(sayfa, yer)
    await sonraki(sayfa).tap()
  }
}

export const yatayTasma = (sayfa: Page) =>
  sayfa.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

export const dikeyTasma = (sayfa: Page) =>
  sayfa.evaluate(() => document.documentElement.scrollHeight - document.documentElement.clientHeight)

/** Konsol hatalarını ve sayfa hatalarını toplar. */
export function hatalariTopla(sayfa: Page): string[] {
  const hatalar: string[] = []
  sayfa.on('console', (ileti) => {
    if (ileti.type() === 'error') hatalar.push(ileti.text())
  })
  sayfa.on('pageerror', (hata) => hatalar.push(hata.message))
  return hatalar
}

/** Sayfanın kaynağı dışına giden istekleri toplar (CDN yok, hiçbir veri cihazdan çıkmaz). */
export function disIstekleriTopla(sayfa: Page, baseURL: string | undefined): string[] {
  const kaynak = new URL(baseURL ?? '').origin
  const istekler: string[] = []
  sayfa.on('request', (istek) => {
    const adres = new URL(istek.url())
    if (adres.protocol.startsWith('http') && adres.origin !== kaynak) istekler.push(istek.url())
    // Oyun sunucuya hiçbir şey yazmaz: yalnız GET.
    else if (adres.protocol.startsWith('http') && istek.method() !== 'GET') {
      istekler.push(`${istek.method()} ${istek.url()}`)
    }
  })
  return istekler
}
