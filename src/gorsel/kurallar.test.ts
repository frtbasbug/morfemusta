// DESIGN.md'deki görsel dil kurallarından denetlenebilen ikisi. (1) Karakterler yalnız
// koddan üretilir: görsel ve galeri kodu resim dosyası kullanmaz. (3) Yalnız belirteçlerdeki
// renkler: renk değeri yalnız tema.css'te yazılır; degrade ve bulanık gölge yoktur, tek gölge
// ünlü kartınınkidir. Ağız kuralını (2) cizim.ts'in imzası taşır: ağız yalnız üç özellikten
// çizilir, oyun durumunu almaz.

import { describe, expect, it } from 'vitest'

const stiller = import.meta.glob<string>(['./*.css', '../galeri/*.css'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const kodlar = import.meta.glob<string>(
  ['./*.{ts,tsx}', '../galeri/*.{ts,tsx}', '!./*.test.{ts,tsx}', '!../galeri/*.test.{ts,tsx}'],
  { query: '?raw', import: 'default', eager: true },
)

const RENK_DEGERI = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/gi
const TEMA = './tema.css'

describe('yalnız belirteçlerdeki renkler', () => {
  it('stil ve kod dosyaları bulunur, metinleri okunur', () => {
    expect(Object.keys(stiller)).toEqual(
      expect.arrayContaining([TEMA, './karakterler.css', '../galeri/KarakterGalerisi.css']),
    )
    // Vitest CSS'i boşaltırsa (vite.config.ts, test.css) bu denetimler boşa geçerdi.
    for (const metin of Object.values(stiller)) expect(metin).toMatch(/\{[^}]+\}/)
    expect(Object.keys(kodlar)).toEqual(
      expect.arrayContaining(['./cizim.ts', './Bukalemun.tsx', '../galeri/KarakterGalerisi.tsx']),
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
})

describe('karakterler yalnız koddan üretilir', () => {
  it.each(Object.entries(kodlar))('%s resim dosyası içe aktarmaz', (_dosya, metin) => {
    expect(metin.match(/['"][^'"]+\.(?:svg|png|jpe?g|gif|webp|avif)(?:\?[^'"]*)?['"]/gi) ?? []).toEqual(
      [],
    )
  })
})
