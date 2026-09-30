import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { kokSozlugunuOku } from '../motor/index.ts'
import DenetimSayfasi from './DenetimSayfasi.tsx'
import { denetimSatirlari } from './veri.ts'

const kucukSozluk = kokSozlugunuOku(
  'kok,kategori,yumusama,unlu_dusmesi,istisna\n' +
    'kitap,okul,evet,,\n' +
    'su,yiyecek,,,su\n' +
    'kalem,okul,,,\n',
)

const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])

describe('DenetimSayfasi', () => {
  const html = renderToStaticMarkup(<DenetimSayfasi />)

  it('başlığı ve sayıları gösterir', () => {
    expect(html).toMatch(/<h1[^>]*>Biçim Denetimi<\/h1>/)
    expect(html).toContain('Sözlükteki 151 kök, sekiz ekle: motorun ürettiği 1208 biçim.')
  })

  it('sözlükteki her kök için bir satır verir', () => {
    expect(html.match(/<tr [^>]*data-kok=/g)).toHaveLength(151)
    expect(html.match(/<td [^>]*data-etiket=/g)).toHaveLength(1208)
  })

  it('sütun başlıklarında sekiz etiketi şablonlarıyla verir', () => {
    expect(eslesmeler(html, /<th scope="col" role="columnheader">([^<]*)</g)).toEqual([
      'Kök',
      'İşaretler',
      'PL',
      'ACC',
      'DAT',
      'LOC',
      'POSS.1SG',
      'POSS.3SG',
      'GEN',
      'PROP',
    ])
    expect(eslesmeler(html, /class="denetim__sablon">([^<]*)</g)).toEqual([
      '-lAr',
      '-(y)I',
      '-(y)A',
      '-DA',
      '-(I)m',
      '-(s)I',
      '-(n)In',
      '-lI',
    ])
  })

  it('satırları kategoriye göre, sözlükteki sırasıyla gruplar', () => {
    const kucuk = renderToStaticMarkup(<DenetimSayfasi satirlar={denetimSatirlari(kucukSozluk)} />)
    expect(eslesmeler(kucuk, /<h2>([^<]*)<\/h2>/g)).toEqual(['okul', 'yiyecek'])
    expect(eslesmeler(kucuk, /<tbody id="([^"]*)"/g)).toEqual(['kategori-okul', 'kategori-yiyecek'])
    expect(eslesmeler(kucuk, /<a href="([^"]*)"/g)).toEqual(['#kategori-okul', '#kategori-yiyecek'])
    expect(eslesmeler(kucuk, /data-kok="([^"]*)"/g)).toEqual(['kitap', 'kalem', 'su'])
  })

  it('her satırda işaretleri ve sekiz biçimi yazar', () => {
    const kucuk = renderToStaticMarkup(<DenetimSayfasi satirlar={denetimSatirlari(kucukSozluk)} />)
    const kitap = kucuk.match(/<tr [^>]*data-kok="kitap".*?<\/tr>/)?.[0] ?? ''
    expect(eslesmeler(kitap, /class="denetim__isaret">([^<]*)</g)).toEqual(['yumuşar'])
    expect(eslesmeler(kitap, /class="denetim__bicim-metni">([^<]*)</g)).toEqual([
      'kitaplar',
      'kitabı',
      'kitaba',
      'kitapta',
      'kitabım',
      'kitabı',
      'kitabın',
      'kitaplı',
    ])
    // Kartta biçimin üstündeki etiket ekran okuyucudan gizlidir; başlık zaten söyler.
    expect(kitap).toContain(
      '<span class="denetim__hucre-etiketi" aria-hidden="true">ACC</span>' +
        '<span class="denetim__bicim-metni">kitabı</span>',
    )
  })
})
