import { describe, expect, it } from 'vitest'
import { adrestekiSinifModu, sinifsizAdres } from './sinif.ts'

describe('adresteki sınıf modu (tahtadaki yer imi)', () => {
  it('?sinif=1 açar, ?sinif=0 kapatır', () => {
    expect(adrestekiSinifModu('?sinif=1')).toBe('acik')
    expect(adrestekiSinifModu('?sinif=0')).toBe('kapali')
    expect(adrestekiSinifModu('?a=b&sinif=1')).toBe('acik')
  })

  it('değiştirgen yoksa ya da tanınmıyorsa hiçbir şey değişmez', () => {
    expect(adrestekiSinifModu('')).toBeNull()
    expect(adrestekiSinifModu('?sinif')).toBeNull()
    expect(adrestekiSinifModu('?sinif=2')).toBeNull()
    expect(adrestekiSinifModu('?sinif=acik')).toBeNull()
  })

  it('değiştirgen adresten kalkar; öteki değiştirgenler ve hash kalır', () => {
    const kok = 'https://frtbasbug.github.io/morfemusta/'
    expect(sinifsizAdres(`${kok}?sinif=1`)).toBe(kok)
    expect(sinifsizAdres(`${kok}?sinif=0#/bolge/koy`)).toBe(`${kok}#/bolge/koy`)
    expect(sinifsizAdres(`${kok}?a=b&sinif=1`)).toBe(`${kok}?a=b`)
    expect(sinifsizAdres(`${kok}#/sozluk`)).toBe(`${kok}#/sozluk`)
  })
})
