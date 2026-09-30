// Görsel dilin hesapları (çizim geometrisi, karonun geometrisi ve bukalemunun kılığı) motor gibi saf
// TypeScript'tir: React'i, DOM'u ya da CSS'i içe aktarmaz. Yalnız motorun genel kapısını
// (src/motor/index.ts) ve birbirini kullanırlar. DOM küresellerini ayrıca
// tsconfig.motor.json yakalar (lib'de DOM yok).

import { describe, expect, it } from 'vitest'

const kaynaklar = import.meta.glob<string>(['./cizim.ts', './karo.ts', './kilik.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

// import ... from 'x', export ... from 'x', import 'x' ve import('x') biçimleri.
const ICE_AKTARMA =
  /\b(?:import|export)\b[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(?\s*['"]([^'"]+)['"]/g

const izinli = (yol: string) =>
  yol === '../motor/index.ts' || /^\.\/(cizim|karo|kilik)\.ts$/.test(yol)

describe('görsel hesapların bağımsızlığı', () => {
  it('kaynak dosyalar bulunur', () => {
    expect(Object.keys(kaynaklar)).toEqual(['./cizim.ts', './karo.ts', './kilik.ts'])
  })

  it.each(Object.entries(kaynaklar))(
    '%s yalnız motoru ve öteki saf görsel dosyayı içe aktarır',
    (_dosya, metin) => {
      const yollar = [...metin.matchAll(ICE_AKTARMA)].map((m) => m[1] ?? m[2] ?? '')
      expect(yollar.length).toBeGreaterThan(0)
      expect(yollar.filter((yol) => !izinli(yol))).toEqual([])
    },
  )
})
