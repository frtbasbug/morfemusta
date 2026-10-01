import { describe, expect, it } from 'vitest'
import { SURUM, SURUM_ADI, surumYazisi } from './surum.ts'

describe('sürüm', () => {
  it('ad pilot-N ya da pilot-N.M (pilot düzeltmeleri adı artırır)', () => {
    expect(SURUM_ADI).toMatch(/^pilot-\d+(?:\.\d+)?$/)
    expect(SURUM.ad).toBe(SURUM_ADI)
  })

  it('kısa commit ve tarih derlemede yazılır (git yoksa bilinmiyor ve bugün)', () => {
    expect(SURUM.commit).toMatch(/^(?:[0-9a-f]{7}|bilinmiyor)$/)
    expect(SURUM.tarih).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('görünen yazı: ad (commit, tarih)', () => {
    expect(surumYazisi({ ad: 'pilot-1.2', commit: 'a1b2c3d', tarih: '2026-10-01' })).toBe(
      'pilot-1.2 (a1b2c3d, 2026-10-01)',
    )
    expect(surumYazisi()).toBe(`${SURUM.ad} (${SURUM.commit}, ${SURUM.tarih})`)
  })
})
