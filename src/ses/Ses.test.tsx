import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Hoparlor, SesSaglayici, type SesAyari } from './Ses.tsx'

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
