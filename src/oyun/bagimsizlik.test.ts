// Oyunun mantığı (src/oyun) saf TypeScript'tir: React'i, DOM'u ya da CSS'i içe aktarmaz.
// Motoru yalnız genel kapısından (src/motor/index.ts) kullanır; içeriği
// icerik/gorevler/*.csv'den okur. DOM küresellerini ayrıca tsconfig.motor.json yakalar.

import { describe, expect, it } from 'vitest'

const kaynaklar = import.meta.glob<string>(['./*.ts', '!./*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

// import ... from 'x', export ... from 'x', import 'x' ve import('x') biçimleri.
const ICE_AKTARMA =
  /\b(?:import|export)\b[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(?\s*['"]([^'"]+)['"]/g

const izinli = (yol: string) =>
  yol === '../motor/index.ts' ||
  /^\.\/[a-z0-9-]+\.ts$/.test(yol) ||
  /^\.\.\/\.\.\/icerik\/gorevler\/[a-z0-9-]+\.csv\?raw$/.test(yol)

describe('oyun mantığının bağımsızlığı', () => {
  it('kaynak dosyalar bulunur', () => {
    expect(Object.keys(kaynaklar)).toEqual(
      expect.arrayContaining(['./gorevler.ts', './karistir.ts', './koy.ts']),
    )
  })

  it.each(Object.entries(kaynaklar))(
    '%s yalnız motorun genel kapısını, kendi dosyalarını ve görev tablolarını içe aktarır',
    (_dosya, metin) => {
      const yollar = [...metin.matchAll(ICE_AKTARMA)].map((m) => m[1] ?? m[2] ?? '')
      expect(yollar.filter((yol) => !izinli(yol))).toEqual([])
    },
  )
})
