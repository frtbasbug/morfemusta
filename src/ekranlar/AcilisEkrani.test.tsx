import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import AcilisEkrani from './AcilisEkrani.tsx'

describe('AcilisEkrani', () => {
  it('adanın adını birinci düzey başlık olarak gösterir', () => {
    const html = renderToStaticMarkup(<AcilisEkrani />)
    expect(html).toMatch(/<h1[^>]*>Morfemusta Adası<\/h1>/)
  })

  it('ada çizimini ekran okuyucudan gizler', () => {
    const html = renderToStaticMarkup(<AcilisEkrani />)
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/)
  })
})
