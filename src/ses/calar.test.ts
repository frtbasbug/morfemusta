import { describe, expect, it } from 'vitest'
import { SESLER, kayitAdresi, onceIner } from './calar.ts'

describe('sesin adresi', () => {
  it('ön bellekteki (arayüz ve koy) sesin adresi yalın: Workbox sürümünü tutar', () => {
    const kayit = SESLER['atlar']
    expect(kayit && onceIner(kayit)).toBe(true)
    expect(kayit && kayitAdresi(kayit)).toBe(`${import.meta.env.BASE_URL}ses/${kayit?.dosya}`)
  })

  it('öteki bölgelerin sesinin adresinde içeriğin sürümü var: yeniden üretilince adres değişir', () => {
    const kayit = SESLER['fıngıl']
    expect(kayit && onceIner(kayit)).toBe(false)
    expect(kayit && kayitAdresi(kayit)).toBe(
      `${import.meta.env.BASE_URL}ses/${kayit?.dosya}?v=${kayit?.surum}`,
    )
    expect(kayit?.surum).toMatch(/^[0-9a-f]{12}$/)
  })
})
