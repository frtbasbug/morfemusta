import { describe, expect, it } from 'vitest'
import { HARITA, rotaAdresi, rotayiCoz, type Rota } from './yonlendirici.ts'

describe('hash yönlendiricisi', () => {
  it.each([
    ['', HARITA],
    ['#', HARITA],
    ['#/', HARITA],
    ['#/bolge/koy', { ekran: 'bolge', kimlik: 'koy' }],
    ['#/bolge/uyduruk', { ekran: 'bolge', kimlik: 'uyduruk' }],
    ['#/sozluk', { ekran: 'sozluk' }],
    ['#/ayarlar', { ekran: 'ayarlar' }],
  ] as const)('%j → %j', (hash, rota) => {
    expect(rotayiCoz(hash)).toEqual(rota)
  })

  it.each(['#/bolge/', '#/bolge/Koy', '#/bolge/koy/1', '#/sözlük', '#/sozluk/', '#bolge/koy', '#/yok'])(
    '%j tanınmaz (harita açılır)',
    (hash) => {
      expect(rotayiCoz(hash)).toBeNull()
    },
  )

  it('adres ile rota birbirine döner', () => {
    const rotalar: Rota[] = [
      HARITA,
      { ekran: 'bolge', kimlik: 'koy' },
      { ekran: 'sozluk' },
      { ekran: 'ayarlar' },
    ]
    expect(rotalar.map(rotaAdresi)).toEqual(['#/', '#/bolge/koy', '#/sozluk', '#/ayarlar'])
    for (const rota of rotalar) expect(rotayiCoz(rotaAdresi(rota))).toEqual(rota)
  })
})
