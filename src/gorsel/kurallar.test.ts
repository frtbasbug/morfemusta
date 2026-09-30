// DESIGN.md'deki görsel dil kurallarından denetlenebilen ikisi. (1) Karakterler yalnız
// koddan üretilir: görsel, galeri ve oyun kodu resim dosyası kullanmaz. (3) Yalnız
// belirteçlerdeki renkler: renk değeri yalnız tema.css'te yazılır; degrade ve bulanık gölge
// yoktur, tek gölge ünlü kartınınkidir. Ağız kuralını (2) cizim.ts'in imzası taşır: ağız yalnız
// üç özellikten çizilir, oyun durumunu almaz.
//
// Oyunun bütün ekranları taranır: ada haritası, Bukalemun Koyu, Sözlük, Ayarlar, akşam ekranı,
// kabuk ve genel stil. Biçim Denetim Sayfası geliştirici aracıdır, kendi renkleri vardır.
// Haritada kalın ve ince renkleri de kullanılmaz: onlar yalnız dilbilgisel anlam taşır.

import { describe, expect, it } from 'vitest'

const stiller = import.meta.glob<string>(
  ['./*.css', '../galeri/*.css', '../ekranlar/*.css', '../genel.css'],
  { query: '?raw', import: 'default', eager: true },
)

const kodlar = import.meta.glob<string>(
  [
    './*.{ts,tsx}',
    '../galeri/*.{ts,tsx}',
    '../ekranlar/*.{ts,tsx}',
    '../kabuk/*.{ts,tsx}',
    '../App.tsx',
    '../main.tsx',
    '!./*.test.{ts,tsx}',
    '!../galeri/*.test.{ts,tsx}',
    '!../ekranlar/*.test.{ts,tsx}',
    '!../kabuk/*.test.{ts,tsx}',
  ],
  { query: '?raw', import: 'default', eager: true },
)

const RENK_DEGERI = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi
const TEMA = './tema.css'

describe('yalnız belirteçlerdeki renkler', () => {
  it('stil ve kod dosyaları bulunur, metinleri okunur', () => {
    expect(Object.keys(stiller)).toEqual(
      expect.arrayContaining([
        TEMA,
        './karakterler.css',
        '../galeri/KarakterGalerisi.css',
        '../ekranlar/BukalemunKoyu.css',
        '../ekranlar/AdaHaritasi.css',
        '../ekranlar/Sozluk.css',
        '../ekranlar/Ayarlar.css',
        '../ekranlar/AksamEkrani.css',
        '../ekranlar/AltGezinme.css',
        '../genel.css',
      ]),
    )
    // Vitest CSS'i boşaltırsa (vite.config.ts, test.css) bu denetimler boşa geçerdi.
    for (const metin of Object.values(stiller)) expect(metin).toMatch(/\{[^}]+\}/)
    expect(Object.keys(kodlar)).toEqual(
      expect.arrayContaining([
        './cizim.ts',
        './Bukalemun.tsx',
        './EkYazisi.tsx',
        '../galeri/KarakterGalerisi.tsx',
        '../ekranlar/BukalemunKoyu.tsx',
        '../ekranlar/AdaHaritasi.tsx',
        '../ekranlar/hareket.ts',
        '../kabuk/yonlendirici.ts',
        '../App.tsx',
      ]),
    )
  })

  it.each(Object.entries(stiller).filter(([dosya]) => dosya !== TEMA))(
    '%s renk değeri yazmaz; renkler belirteçlerden gelir',
    (_dosya, metin) => {
      expect(metin.match(RENK_DEGERI) ?? []).toEqual([])
    },
  )

  it.each(Object.entries(kodlar))('%s renk değeri yazmaz', (_dosya, metin) => {
    expect(metin.match(RENK_DEGERI) ?? []).toEqual([])
  })

  it.each(Object.entries(stiller))('%s degrade ve bulanıklık kullanmaz', (_dosya, metin) => {
    expect(metin.match(/gradient\(|blur\(|drop-shadow\(/gi) ?? []).toEqual([])
  })

  it('tek gölge ünlü kartınınki: 0 4px 0 mürekkep', () => {
    const golgeler = Object.values(stiller).flatMap((metin) =>
      [...metin.matchAll(/(?:box|text)-shadow\s*:\s*([^;]+);/g)].map((m) => m[1]?.trim()),
    )
    expect(golgeler).toEqual(['var(--golge-unlu-karti)'])
    expect(stiller[TEMA]).toContain('--golge-unlu-karti: 0 4px 0 var(--murekkep);')
  })

  it('haritada kalın ve ince renkleri yok; deniz ve kara belirteçleri tema.css\'te', () => {
    expect(stiller['../ekranlar/AdaHaritasi.css']).toMatch(/var\(--deniz\)/)
    expect(stiller['../ekranlar/AdaHaritasi.css']).toMatch(/var\(--kara\)/)
    for (const dosya of ['../ekranlar/AdaHaritasi.css', '../ekranlar/AdaHaritasi.tsx']) {
      const metin = stiller[dosya] ?? kodlar[dosya] ?? ''
      expect(metin.match(/--(?:kalin|ince)(?:-zemin)?\b/g) ?? [], dosya).toEqual([])
    }
    expect(stiller[TEMA]).toContain('--deniz: #CFE8E0;')
    expect(stiller[TEMA]).toContain('--kara: #F4E6C8;')
  })
})

describe('Kök Bahçesi: kalın ve ince renkleri yalnız ek yazılarında', () => {
  it('ağacın ve bahçenin stili kalın ve ince renklerini anmaz; gövde ve yaprak belirteçleri tema.css\'te', () => {
    const karakterler = stiller['./karakterler.css'] ?? ''
    const agacKurallari = karakterler.slice(karakterler.indexOf('/* Kök Bahçesi'))
    expect(agacKurallari).toMatch(/var\(--govde\)/)
    expect(agacKurallari).toMatch(/var\(--yaprak\)/)
    for (const metin of [agacKurallari, stiller['../ekranlar/KokBahcesi.css'] ?? '']) {
      expect(metin).toMatch(/\{[^}]+\}/)
      expect(metin.match(/--(?:kalin|ince)(?:-zemin)?\b/g) ?? []).toEqual([])
    }
    expect(stiller[TEMA]).toContain('--govde: #D9B48F;')
    expect(stiller[TEMA]).toContain('--yaprak: #A8D5A2;')
    // Renksiz'de halka ile meyve biçimle ayrılır: gövde ve yaprak da griye döner.
    const renksiz = /\.renksiz,\s*:root\[data-renkler='renksiz'\]\s*\{([^}]*)\}/.exec(stiller[TEMA] ?? '')?.[1]
    expect(renksiz).toContain('--govde: var(--renksiz-zemin);')
    expect(renksiz).toContain('--yaprak: var(--renksiz-zemin);')
  })
})

describe('karakterler yalnız koddan üretilir', () => {
  it.each(Object.entries(kodlar))('%s resim dosyası içe aktarmaz', (_dosya, metin) => {
    expect(metin.match(/['"][^'"]+\.(?:svg|png|jpe?g|gif|webp|avif)(?:\?[^'"]*)?['"]/gi) ?? []).toEqual(
      [],
    )
  })
})

describe('Uydurukçuklar: süsler kalın ve ince renklerini anmaz', () => {
  it('yaratığın süsleri ve yıldız yalnız süs belirteçlerinden', () => {
    const karakterler = stiller['./karakterler.css'] ?? ''
    const susKurallari = karakterler.slice(karakterler.indexOf("/* Uydurukçuklar'ın yaratığı"))
    expect(susKurallari).toMatch(/\.yaratik__boynuz/)
    expect(susKurallari.match(/--(?:kalin|ince)(?:-zemin)?\b/g) ?? []).toEqual([])
    expect(kodlar['./yaratik.ts']).toBeDefined()
    expect(kodlar['./Yaratik.tsx']).toBeDefined()
    expect(stiller['../ekranlar/Uydurukcuklar.css']).toMatch(/\{[^}]+\}/)
  })
})
