import { describe, expect, it } from 'vitest'
import { tohumluKaristir } from './karistir.ts'

describe('tohumluKaristir', () => {
  const dizi = ['ım', 'im', 'um', 'üm'] as const

  it('aynı tohum hep aynı sırayı verir', () => {
    expect(tohumluKaristir(dizi, 501)).toEqual(tohumluKaristir(dizi, 501))
  })

  it('dizinin öğelerini değiştirmez, yalnız sıralar; diziye dokunmaz', () => {
    const kopya = [...dizi]
    const sonuc = tohumluKaristir(kopya, 42)
    expect([...sonuc].sort()).toEqual([...dizi].sort())
    expect(kopya).toEqual([...dizi])
  })

  it('tohum değişince sıra da değişebilir', () => {
    const siralar = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((t) => tohumluKaristir(dizi, t).join(' ')))
    expect(siralar.size).toBeGreaterThan(1)
  })

  it('boş ve tek öğeli dizi', () => {
    expect(tohumluKaristir([], 1)).toEqual([])
    expect(tohumluKaristir(['m'], 1)).toEqual(['m'])
  })
})
