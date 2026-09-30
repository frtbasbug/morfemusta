// Görsel dilin hesapları (çizim geometrisi, karonun, ağacın ve cebin geometrisi, bukalemunun
// kılığı) motor gibi saf
// TypeScript'tir: React'i, DOM'u ya da CSS'i içe aktarmaz. Yalnız motorun genel kapısını
// (src/motor/index.ts) ve birbirini kullanırlar. DOM küresellerini ayrıca
// tsconfig.motor.json yakalar (lib'de DOM yok).

import { describe, expect, it } from 'vitest'

const SAF_DOSYALAR = ['./agac.ts', './cep.ts', './cizim.ts', './karo.ts', './kilik.ts']

const kaynaklar = import.meta.glob<string>(
  ['./agac.ts', './cep.ts', './cizim.ts', './karo.ts', './kilik.ts'],
  { query: '?raw', import: 'default', eager: true },
)

// import ... from 'x', export ... from 'x', import 'x' ve import('x') biçimleri.
const ICE_AKTARMA =
  /\b(?:import|export)\b[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(?\s*['"]([^'"]+)['"]/g

const izinli = (yol: string) =>
  yol === '../motor/index.ts' || /^\.\/(agac|cep|cizim|karo|kilik)\.ts$/.test(yol)

describe('görsel hesapların bağımsızlığı', () => {
  it('kaynak dosyalar bulunur', () => {
    expect(Object.keys(kaynaklar)).toEqual(SAF_DOSYALAR)
  })

  it.each(Object.entries(kaynaklar))(
    '%s yalnız motoru ve öteki saf görsel dosyayı içe aktarır',
    (_dosya, metin) => {
      const yollar = [...metin.matchAll(ICE_AKTARMA)].map((m) => m[1] ?? m[2] ?? '')
      // Geometri dosyaları (agac.ts, cep.ts) hiçbir şey içe aktarmayabilir.
      expect(yollar.filter((yol) => !izinli(yol))).toEqual([])
    },
  )
})
