import { expect, type Locator, type Page } from '@playwright/test'

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

/**
 * Bölgelerin ayrıntılarını sınayan testler (büyüler, nedenler, kayıt) Düğmeyle ayarında koşar:
 * görev Sıradaki düğmesiyle geçer, ilk dakika eli çıkmaz. Kayıt okunurken eksik alanlar
 * eklenir (gecis: dugmeyle, eller: dört bölge); testin kendi kurduğu kayıt da olduğu gibi kalır.
 * Kendiliğinden geçişi ve eli e2e/akis.spec.ts, yeni akışın bütününü pilot yolu sınar.
 */
export function dugmeyleOyna(sayfa: Page) {
  return sayfa.addInitScript((anahtar) => {
    const oku = Storage.prototype.getItem
    Storage.prototype.getItem = function (ad: string) {
      const metin = oku.call(this, ad)
      if (ad !== anahtar || this !== window.localStorage) return metin
      let kayit: Record<string, unknown> = {}
      try {
        const okunan: unknown = metin === null ? {} : JSON.parse(metin)
        if (typeof okunan !== 'object' || okunan === null || Array.isArray(okunan)) return metin
        kayit = okunan as Record<string, unknown>
      } catch {
        return metin
      }
      const ayarlar = (kayit.ayarlar ?? {}) as Record<string, unknown>
      if (ayarlar.gecis !== undefined && kayit.eller !== undefined) return metin
      return JSON.stringify({
        ...kayit,
        ayarlar: { ...ayarlar, gecis: ayarlar.gecis ?? 'dugmeyle' },
        eller: kayit.eller ?? ['koy', 'dukkan', 'bahce', 'uyduruk'],
      })
    }
  }, ANAHTAR)
}

export const haritaBasligi = (sayfa: Page) =>
  sayfa.getByRole('heading', { level: 1, name: 'Ekle Bakalım' })
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

/**
 * Görevden sıradakine geçiş: dugme, Sıradaki düğmesi (Düğmeyle ayarı); bekle, sıradaki görev
 * kendisi gelir (Kendiliğinden, 1,4 saniye; sesli modda ses de bitince); dokun, ekrana (bölgenin
 * başlığına) dokunulur, hemen geçer (Kendiliğinden).
 */
export type Gecis = 'dugme' | 'bekle' | 'dokun'

/** Görev bitti: Düğmeyle'de Sıradaki görünene kadar bekler; Kendiliğinden'de beklenecek düğme yok. */
async function gorevBitti(sayfa: Page, gecis: Gecis) {
  if (gecis === 'dugme') await expect(sonraki(sayfa)).toBeVisible()
}

/** Sıradaki göreve (ya da akşam ekranına) geçer: düğmeyle, bekleyerek ya da dokunarak. */
export async function sonrakineGec(sayfa: Page, gecis: Gecis = 'dugme') {
  if (gecis === 'dugme') await dokun(sonraki(sayfa))
  else if (gecis === 'dokun') await dokun(sayfa.locator('.bolge-ustu__baslik'))
}

/** Görevi (0'dan) dokun-dokun doğru oynar; Düğmeyle'de Sıradaki görünene kadar bekler. */
export async function gorevOyna(sayfa: Page, yer: number, gecis: Gecis = 'dugme') {
  for (const yuzey of DOGRU_YUZEYLER[yer] ?? []) {
    await secilebilir(bukalemun(sayfa, yuzey))
    await dokun(bukalemun(sayfa, yuzey))
    await dokun(kart(sayfa))
  }
  await gorevBitti(sayfa, gecis)
}

/** Görevleri sırayla oynar: her birinin sonunda sıradakine geçer (varsayılan Sıradaki'yle). */
export async function gorevleriOyna(sayfa: Page, ilk: number, son: number, gecis: Gecis = 'dugme') {
  for (let yer = ilk; yer <= son; yer++) {
    await expect(sira(sayfa)).toHaveText(`Görev ${yer + 1} / 10`)
    await gorevOyna(sayfa, yer, gecis)
    await sonrakineGec(sayfa, gecis)
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

// --- Dört bölgenin doğru seçimleri (pilot yolu ve sınıf modunun ölçüleri) ---------------------
// Oyun doğru biçimi motordan alır; burada yalnız testlerin beklediği seçimler yazılıdır
// (fistikci-sahap.spec.ts, kok-bahcesi.spec.ts ve uydurukcuklar.spec.ts'teki tablolarla aynı).

/** Fıstıkçı Şahap'ın Dükkânı: her görevin doğru karosu, sırayla. */
export const DUKKAN_KAROLARI = [
  'jöle',
  'jöle',
  'jöle',
  'taş',
  'taş',
  'taş',
  'jöle',
  'taş',
  'jöle',
  'taş',
] as const

/** Kök Bahçesi: her ağacın ekleri, doğru sırayla. */
export const BAHCE_EKLERI = [
  ['çi', 'ler'],
  ['luk', 'lar'],
  ['lı', 'cı'],
  ['siz', 'lik'],
  ['çık', 'lar'],
  ['cu', 'luk'],
  ['lik', 'im'],
  ['cik', 'im'],
  ['suz', 'luk'],
  ['lük', 'çü', 'ler'],
] as const

/** Uydurukçuklar'ın 1. turu: doğru bukalemun; sınır adımı olan görevde seçilen karo. */
export const UYDURUK_SECIMLERI: readonly { readonly yuzey: string; readonly karo?: 'taş' | 'jöle' }[] = [
  { yuzey: 'lar' },
  { yuzey: 'ler' },
  { yuzey: 'um' },
  { yuzey: 'ım', karo: 'jöle' },
  { yuzey: 'te' },
  { yuzey: 'da' },
  { yuzey: 'da' },
  { yuzey: 'ye' },
  { yuzey: 'ya' },
  { yuzey: 'im', karo: 'taş' },
]

export const karo = (sayfa: Page, tur: 'taş' | 'jöle') =>
  sayfa.getByRole('button', { name: tur === 'taş' ? /^., sert$/ : /^., yumuşak$/ })
export const dukkanKarti = (sayfa: Page) => sayfa.locator('button.dukkan__kart')
export const agac = (sayfa: Page) => sayfa.locator('button.bahce__agac')
export const yaratik = (sayfa: Page) => sayfa.locator('button.uyduruk__hedef')

/** Ek, bukalemun ya da karo seçilebilir olana kadar bekler: önceki hareket bitti. */
export const secilebilir = (oge: ReturnType<Page['locator']>) =>
  expect(oge).toHaveAttribute('aria-disabled', 'false')

/** Dükkân'ın görevini (0'dan) dokun-dokun doğru oynar. */
export async function dukkanGorevi(sayfa: Page, yer: number, gecis: Gecis = 'dugme') {
  const tur = DUKKAN_KAROLARI[yer] ?? 'taş'
  await expect(sira(sayfa)).toHaveText(`Görev ${yer + 1} / 10`)
  await secilebilir(karo(sayfa, tur))
  await dokun(karo(sayfa, tur))
  await dokun(dukkanKarti(sayfa))
  await gorevBitti(sayfa, gecis)
}

/** Bahçe'nin ağacını (0'dan) dokun-dokun doğru büyütür. */
export async function bahceGorevi(sayfa: Page, yer: number, gecis: Gecis = 'dugme') {
  await expect(sira(sayfa)).toHaveText(`Görev ${yer + 1} / 10`)
  for (const yuzey of BAHCE_EKLERI[yer] ?? []) {
    await secilebilir(bukalemun(sayfa, yuzey))
    await dokun(bukalemun(sayfa, yuzey))
    await dokun(agac(sayfa))
  }
  await gorevBitti(sayfa, gecis)
}

/** Uydurukçuklar'ın 1. turundaki görevi (0'dan) dokun-dokun doğru oynar. */
export async function uydurukGorevi(sayfa: Page, yer: number, gecis: Gecis = 'dugme') {
  const secim = UYDURUK_SECIMLERI[yer]
  if (!secim) return
  await expect(sira(sayfa)).toHaveText(`1. tur · Görev ${yer + 1} / 10`)
  await secilebilir(bukalemun(sayfa, secim.yuzey))
  await dokun(bukalemun(sayfa, secim.yuzey))
  await dokun(yaratik(sayfa))
  if (secim.karo) {
    await secilebilir(karo(sayfa, secim.karo))
    await dokun(karo(sayfa, secim.karo))
    await dokun(yaratik(sayfa))
  }
  await gorevBitti(sayfa, gecis)
}

/**
 * Dokunuş: Chromium'da tap, WebKit'te click. Playwright'ın WebKit'teki tap'i (iPhone profili)
 * ara sıra eyleme hazırlıkta takılıyor (CI'da Haritaya dön ve bukalemunlar); sayfanın kendisi
 * olağan kayar ve dokunulur (e2e/pilot.spec.ts).
 */
export async function dokun(oge: Locator): Promise<void> {
  if (oge.page().context().browser()?.browserType().name() === 'webkit') await oge.click()
  else await oge.tap()
}
