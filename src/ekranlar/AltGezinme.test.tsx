import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import AltGezinme from './AltGezinme.tsx'

/** Bağlantılar: adres, açık mı, yazı. */
const baglantilar = (html: string) =>
  [
    ...html.matchAll(
      /<a class="alt-gezinme__oge" href="([^"]*)"( aria-current="page")?><svg class="simge"[^>]*aria-hidden="true"[^>]*>.*?<\/svg><span>([^<]*)<\/span><\/a>/g,
    ),
  ].map(([, adres, acik, yazi]) => [adres, acik !== undefined, yazi])

describe('AltGezinme', () => {
  it('Harita, Sözlük, Ayarlar: simge ve yazıyla; açık ekran aria-current', () => {
    const html = renderToStaticMarkup(<AltGezinme etkin="sozluk" onGit={() => {}} />)
    expect(html).toMatch(/^<nav class="alt-gezinme" aria-label="Gezinme">/)
    expect(baglantilar(html)).toEqual([
      ['#/', false, 'Harita'],
      ['#/sozluk', true, 'Sözlük'],
      ['#/ayarlar', false, 'Ayarlar'],
    ])
  })

  it('her ekranda yalnız kendisi açık', () => {
    for (const etkin of ['harita', 'sozluk', 'ayarlar'] as const) {
      const html = renderToStaticMarkup(<AltGezinme etkin={etkin} onGit={() => {}} />)
      expect(baglantilar(html).filter(([, acik]) => acik)).toHaveLength(1)
    }
  })
})
