import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { efektSuresi } from './efekt.ts'
import { Hoparlor, SesSaglayici, sonucPlani, type SesAyari } from './Ses.tsx'

const hoparlor = (metin: string, ayar?: SesAyari) =>
  renderToStaticMarkup(
    ayar ? (
      <SesSaglayici ayar={ayar}>
        <Hoparlor metin={metin} />
      </SesSaglayici>
    ) : (
      <Hoparlor metin={metin} />
    ),
  )

describe('Hoparlör', () => {
  it('Kapalı\'da (ve sağlayıcı yokken) görünmez', () => {
    expect(hoparlor('at', 'kapali')).toBe('')
    expect(hoparlor('at')).toBe('')
  })

  it('Dokununca\'da ve sesli modda görünür; adı "Dinle: <metin>", simge gizli', () => {
    for (const ayar of ['dokununca', 'sesli'] as const) {
      const html = hoparlor('at', ayar)
      expect(html).toMatch(/^<button type="button" class="hoparlor" aria-label="Dinle: at">/)
      expect(html).toContain('aria-hidden="true"')
    }
  })

  it('sesi olmayan metinde görünmez', () => {
    expect(hoparlor('bu metnin sesi yok', 'dokununca')).toBe('')
  })
})

describe('sonucun sesi ayara uyar (efektler)', () => {
  it('Kapalı: efekt de konuşma da yok', () => {
    expect(sonucPlani('kapali', 'dogru', 'atlar')).toEqual({ efekt: null, metinler: [], gecikme: 0 })
    expect(sonucPlani('kapali', 'yanlis', 'a kalın, e ince.')).toMatchObject({ efekt: null })
  })

  it('Dokununca: yalnız efekt; kelime söylenmez', () => {
    expect(sonucPlani('dokununca', 'dogru', 'atlar')).toMatchObject({ efekt: 'dogru', metinler: [] })
    expect(sonucPlani('dokununca', 'yanlis', 'cümle')).toMatchObject({ efekt: 'yanlis', metinler: [] })
  })

  it('Sesli mod: önce efekt, efekt bitince (400 ms içinde) kurulan kelime', () => {
    const plan = sonucPlani('sesli', 'dogru', 'atlar')
    expect(plan.efekt).toBe('dogru')
    expect(plan.metinler).toEqual(['atlar'])
    expect(plan.gecikme).toBe(Math.round(efektSuresi('dogru') * 1000))
    expect(plan.gecikme).toBeGreaterThan(0)
    expect(plan.gecikme).toBeLessThan(400)
    expect(sonucPlani('sesli', 'yanlis', ['bir', 'iki']).metinler).toEqual(['bir', 'iki'])
  })
})
