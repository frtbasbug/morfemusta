import { describe, expect, it } from 'vitest'
import { UNLULER, type Unlu } from '../motor/index.ts'
import { UNLU_KUTUSU, unluCizimi, unluGovdesi } from './cizim.ts'
import {
  YILDIZ_YOLU,
  kokTohumu,
  yaratikSusleri,
  yaratikUnlusu,
} from './yaratik.ts'

const KOKLER = ['fıngıl', 'nöfel', 'pobul', 'pıtak', 'mömüş', 'cofar', 'zolku', 'zelü', 'kıbı', 'zitep']
const UNLU_LISTESI = Object.keys(UNLULER) as Unlu[]

/** Nokta ünlü gövdesinin içinde mi (düzde köşeler için elipsten daha geniş kutu). */
function govdeninIcinde(unlu: Unlu, x: number, y: number, r: number): boolean {
  const o = UNLULER[unlu]
  const { en, boy } = unluGovdesi(o)
  const dx = Math.abs(x - 36) + r
  const dy = Math.abs(y - 40) + r
  if (!o.yuvarlak) return dx <= en / 2 - 1 && dy <= boy / 2 - 1
  return (dx / (en / 2)) ** 2 + (dy / (boy / 2)) ** 2 <= 1
}

describe('yaratığın süsleri', () => {
  it('yaratığın ünlüsü adındaki son ünlüdür', () => {
    expect(yaratikUnlusu('pıtak')).toBe('a')
    expect(yaratikUnlusu('zelü')).toBe('ü')
    expect(() => yaratikUnlusu('prr')).toThrow()
  })

  it('aynı kök hep aynı süsleri alır; farklı kökler farklı süsler alabilir', () => {
    expect(kokTohumu('pıtak')).toBe(kokTohumu('pıtak'))
    expect(yaratikSusleri('pıtak', UNLULER.a)).toEqual(yaratikSusleri('pıtak', UNLULER.a))
    const turler = new Set(KOKLER.map((k) => yaratikSusleri(k, UNLULER.a).boynuz))
    expect(turler.size).toBeGreaterThan(1)
  })

  it.each(KOKLER)('%s: her ünlüde en az bir süs; benekler gövdenin içinde, yanakların altında', (kok) => {
    for (const unlu of UNLU_LISTESI) {
      const s = yaratikSusleri(kok, UNLULER[unlu])
      expect(s.boynuzlar !== '' || s.benekler.length > 0).toBe(true)
      const cizim = unluCizimi(UNLULER[unlu])
      for (const b of s.benekler) {
        expect(govdeninIcinde(unlu, b.x, b.y, b.r)).toBe(true)
        // Yanakların ve ağzın altında: yanak y 45, ağzın en alt noktası 57'nin üstünde.
        expect(b.y - b.r).toBeGreaterThan(cizim.yanakY + 3)
      }
    }
  })

  it('boynuzlar kutunun içinde kalır, gözlere değmez', () => {
    for (const kok of KOKLER) {
      for (const unlu of UNLU_LISTESI) {
        const { boynuzlar } = yaratikSusleri(kok, UNLULER[unlu])
        const ys = [...boynuzlar.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map((m) => Number(m[2]))
        const xs = [...boynuzlar.matchAll(/[ML]([\d.]+) ([\d.]+)/g)].map((m) => Number(m[1]))
        for (const y of ys) {
          expect(y).toBeGreaterThanOrEqual(0)
          // Gözün tepesi (y 33 - 5.4) boynuzun dibinden aşağıda.
          expect(y).toBeLessThan(unluCizimi(UNLULER[unlu]).gozY - 5.4)
        }
        for (const x of xs) expect(x).toBeGreaterThan(0)
        for (const x of xs) expect(x).toBeLessThan(UNLU_KUTUSU.en)
      }
    }
  })

  it('yıldız beş köşeli: on nokta', () => {
    expect(YILDIZ_YOLU.split('L')).toHaveLength(10)
  })
})
