import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { VARSAYILAN_AYARLAR, type Ayarlar as AyarDegerleri } from '../oyun/ilerleme.ts'
import Ayarlar from './Ayarlar.tsx'
import kaynak from './Ayarlar.tsx?raw'

const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])

const ayarlar = (degerler: AyarDegerleri = VARSAYILAN_AYARLAR) =>
  renderToStaticMarkup(<Ayarlar ayarlar={degerler} onAyar={() => {}} onSifirla={() => {}} />)

/** Radyo düğmeleri: ad, değer, seçili mi, yazısı. */
const secenekler = (html: string) =>
  [
    ...html.matchAll(
      /<label class="ayar__secenek"><input type="radio" name="([a-z]+)"( checked="")? value="([a-z]+)"\/><span>([^<]*)<\/span><\/label>/g,
    ),
  ].map(([, ad, secili, deger, yazi]) => [ad, deger, secili !== undefined, yazi])

describe('Ayarlar', () => {
  it('başlık; Hareket ve Renkler birer seçim grubu', () => {
    const html = ayarlar()
    expect(html).toMatch(/<h1 id="ayarlar-baslik" class="ekran-basligi" tabindex="-1">Ayarlar<\/h1>/)
    expect(eslesmeler(html, /<legend class="ayar__baslik">([^<]*)<\/legend>/g)).toEqual([
      'Hareket',
      'Renkler',
    ])
  })

  it('Hareket: Sistem gibi / Azalt; Renkler: Renkli / Renksiz; seçili olan ayardan', () => {
    expect(secenekler(ayarlar())).toEqual([
      ['hareket', 'sistem', true, 'Sistem gibi'],
      ['hareket', 'azalt', false, 'Azalt'],
      ['renkler', 'renkli', true, 'Renkli'],
      ['renkler', 'renksiz', false, 'Renksiz'],
    ])
    expect(
      secenekler(ayarlar({ hareket: 'azalt', renkler: 'renksiz' })).map(([, deger, secili]) =>
        secili ? deger : null,
      ),
    ).toEqual([null, 'azalt', null, 'renksiz'])
  })

  it('sıfırlama önce yalnız bir düğmedir; soru uygulamanın içinde, confirm yok', () => {
    const html = ayarlar()
    expect(html).toContain('>İlerlemeyi sıfırla</button>')
    expect(html).not.toContain('Bütün ilerleme ve kartlar silinecek.')
    expect(html).toContain('<p class="sifirlama__durum" role="status"></p>')
    // İkinci adımın metni ve düğmeleri kodda; tarayıcının penceresi kullanılmaz.
    expect(kaynak).toContain('Bütün ilerleme ve kartlar silinecek.')
    expect(kaynak).toMatch(/>\s*Vazgeç\s*</)
    expect(kaynak).toMatch(/>\s*Sil\s*</)
    expect(kaynak).not.toMatch(/\b(?:window\.)?confirm\(/)
  })
})
