import { describe, expect, it } from 'vitest'
import { SES_ONBELLEGI } from '../ses/onbellek.ts'
import { ESKI_TABAN, eskiAdresiTemizle, type Onbellek, type Onbellekler, type SwKaydi } from './eskiAdres.ts'

const KOK = 'https://frtbasbug.github.io'

function kayit(scope: string, kaldirilan: string[]): SwKaydi {
  return {
    scope,
    unregister: async () => {
      kaldirilan.push(scope)
      return true
    },
  }
}

/** Bellekte CacheStorage: ad → adresler. */
function onbellekler(baslangic: Record<string, string[]>) {
  const harita = new Map(Object.entries(baslangic).map(([ad, adresler]) => [ad, new Set(adresler)]))
  const acilan: string[] = []
  const depo: Onbellekler = {
    keys: async () => [...harita.keys()],
    has: async (ad) => harita.has(ad),
    open: async (ad): Promise<Onbellek> => {
      acilan.push(ad)
      if (!harita.has(ad)) harita.set(ad, new Set())
      const adresler = harita.get(ad)!
      return {
        keys: async () => [...adresler].map((url) => ({ url })),
        delete: async (url) => adresler.delete(url),
      }
    },
    delete: async (ad) => harita.delete(ad),
  }
  return { depo, harita, acilan }
}

describe('eski adresin temizliği', () => {
  it('eski taban /morfemusta/; seslerin önbelleğinin adı aynı kalır', () => {
    expect(ESKI_TABAN).toBe('/morfemusta/')
    expect(SES_ONBELLEGI).toBe('morfemusta-ses')
  })

  it('yalnız /morfemusta/ kapsamlı service worker kaldırılır; yeni adresinki kalır', async () => {
    const kaldirilan: string[] = []
    const sonuc = await eskiAdresiTemizle({
      serviceWorker: {
        getRegistrations: async () => [
          kayit(`${KOK}/morfemusta/`, kaldirilan),
          kayit(`${KOK}/ekle-bakalim/`, kaldirilan),
          kayit(`${KOK}/morfemusta-baska/`, kaldirilan),
        ],
      },
    })
    expect(kaldirilan).toEqual([`${KOK}/morfemusta/`])
    expect(sonuc).toEqual({ kayitlar: [`${KOK}/morfemusta/`], onbellekler: [], sesler: 0 })
  })

  it('eski kapsamın önbellekleri silinir; seslerden yalnız eski adresinkiler', async () => {
    const { depo, harita } = onbellekler({
      [`workbox-precache-v2-${KOK}/morfemusta/`]: [`${KOK}/morfemusta/index.html`],
      [`workbox-precache-v2-${KOK}/ekle-bakalim/`]: [`${KOK}/ekle-bakalim/index.html`],
      [SES_ONBELLEGI]: [
        `${KOK}/morfemusta/ses/abc.mp3?v=1`,
        `${KOK}/morfemusta/ses/def.mp3?v=2`,
        `${KOK}/ekle-bakalim/ses/abc.mp3?v=1`,
      ],
    })
    const sonuc = await eskiAdresiTemizle({ caches: depo })
    expect(sonuc).toEqual({
      kayitlar: [],
      onbellekler: [`workbox-precache-v2-${KOK}/morfemusta/`],
      sesler: 2,
    })
    expect([...harita.keys()]).toEqual([`workbox-precache-v2-${KOK}/ekle-bakalim/`, SES_ONBELLEGI])
    expect([...harita.get(SES_ONBELLEGI)!]).toEqual([`${KOK}/ekle-bakalim/ses/abc.mp3?v=1`])
  })

  it('seslerin önbelleği yoksa açılmaz (boş önbellek kurulmaz)', async () => {
    const { depo, harita, acilan } = onbellekler({})
    await eskiAdresiTemizle({ caches: depo })
    expect(acilan).toEqual([])
    expect(harita.size).toBe(0)
  })

  it('tarayıcıda service worker ya da önbellek yoksa ve hata olursa sessizce geçer', async () => {
    await expect(eskiAdresiTemizle({})).resolves.toEqual({ kayitlar: [], onbellekler: [], sesler: 0 })
    await expect(
      eskiAdresiTemizle({
        serviceWorker: {
          getRegistrations: async () => {
            throw new Error('SecurityError')
          },
        },
        caches: {
          keys: async () => {
            throw new Error('SecurityError')
          },
          has: async () => false,
          open: async () => {
            throw new Error('yok')
          },
          delete: async () => false,
        },
      }),
    ).resolves.toEqual({ kayitlar: [], onbellekler: [], sesler: 0 })
  })
})
