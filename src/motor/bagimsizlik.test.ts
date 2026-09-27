// Motor arayüzden bağımsızdır (CLAUDE.md, 3. kural): React'i, DOM'u, CSS'i ya da src/motor
// dışındaki uygulama kodunu içe aktarmaz. Tek dış kaynak icerik/*.csv dosyalarıdır.
// DOM ve Node küresellerini ayrıca tsconfig.motor.json yakalar (lib'de DOM yok).

import { describe, expect, it } from 'vitest'

const kaynaklar = import.meta.glob<string>(['./*.ts', '!./*.test.ts', '!./*.d.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

// import ... from 'x', export ... from 'x', import 'x' ve import('x') biçimleri.
const ICE_AKTARMA =
  /\b(?:import|export)\b[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]|\bimport\s*\(?\s*['"]([^'"]+)['"]/g

const izinli = (yol: string) =>
  /^\.\/[a-z0-9-]+\.ts$/.test(yol) || /^\.\.\/\.\.\/icerik\/[a-z0-9-]+\.csv\?raw$/.test(yol)

describe('motorun bağımsızlığı', () => {
  it('kaynak dosyalar bulunur', () => {
    expect(Object.keys(kaynaklar)).toEqual(
      expect.arrayContaining(['./ekle.ts', './envanter.ts', './index.ts']),
    )
  })

  it.each(Object.entries(kaynaklar))(
    '%s yalnız motorun kendi dosyalarını ve icerik/*.csv\'yi içe aktarır',
    (_dosya, metin) => {
      const yollar = [...metin.matchAll(ICE_AKTARMA)].map((m) => m[1] ?? m[2] ?? '')
      expect(yollar.filter((yol) => !izinli(yol))).toEqual([])
    },
  )
})
