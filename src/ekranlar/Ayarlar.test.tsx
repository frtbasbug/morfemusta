import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { VARSAYILAN_AYARLAR, type Ayarlar as AyarDegerleri } from '../oyun/ilerleme.ts'
import { SURUM_ADI, surumYazisi } from '../surum.ts'
import Ayarlar, { LISANSLAR, PILOT_ADRESI } from './Ayarlar.tsx'
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
  it('başlık; Ses, Hareket, Renkler ve Sınıf modu birer seçim grubu', () => {
    const html = ayarlar()
    expect(html).toMatch(/<h1 id="ayarlar-baslik" class="ekran-basligi" tabindex="-1">Ayarlar<\/h1>/)
    expect(eslesmeler(html, /<legend class="ayar__baslik">([^<]*)/g)).toEqual([
      'Ses',
      'Hareket',
      'Renkler',
      'Sınıf modu',
    ])
  })

  it('Ses: Kapalı / Dokununca / Sesli mod (varsayılan Dokununca); Hareket; Renkler; Sınıf modu', () => {
    expect(secenekler(ayarlar())).toEqual([
      ['ses', 'kapali', false, 'Kapalı'],
      ['ses', 'dokununca', true, 'Dokununca'],
      ['ses', 'sesli', false, 'Sesli mod'],
      ['hareket', 'sistem', true, 'Sistem gibi'],
      ['hareket', 'azalt', false, 'Azalt'],
      ['renkler', 'renkli', true, 'Renkli'],
      ['renkler', 'renksiz', false, 'Renksiz'],
      ['sinif', 'kapali', true, 'Kapalı'],
      ['sinif', 'acik', false, 'Açık'],
    ])
    expect(
      secenekler(ayarlar({ hareket: 'azalt', renkler: 'renksiz', ses: 'sesli', sinif: 'acik' })).map(
        ([, deger, secili]) => (secili ? deger : null),
      ),
    ).toEqual([null, null, 'sesli', null, 'azalt', null, 'renksiz', null, 'acik'])
  })

  it('Renkler: örnek (kalın a, ince e) başlığın yanında, ekran okuyucudan gizli', () => {
    expect(ayarlar()).toMatch(
      /<legend class="ayar__baslik">Renkler<span class="ayar__ornek" aria-hidden="true">/,
    )
  })

  it('Sınıf modu: etkileşimli tahta için; açıkken sıfırlama yalnız o açılışın ilerlemesini siler', () => {
    expect(ayarlar()).toContain(
      'Etkileşimli tahta için: bütün bölgeler açık, ilerleme kaydedilmez.',
    )
    expect(kaynak).toContain('Sınıf modunun ilerlemesi ve kartları silinecek.')
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

  it('Hakkında: sade metin; lisans adları lisansa bağlanır; sürümün yalnız adı', () => {
    const html = ayarlar()
    expect(html).toContain('>Hakkında</h2>')
    const bolum = html.slice(html.indexOf('<section class="hakkinda"'))
    const metin = bolum
      .replace(/<\/p>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/^Hakkında/, '')
      .trim()
    expect(metin.split('\n')).toEqual([
      'Ekle Bakalım, ilkokul çocukları için kâr amacı gütmeyen bir Türkçe kelime oyunudur. Reklam, satın alma ve hesap yoktur; hiçbir veri cihazdan çıkmaz.',
      'Sesler yapay zekâyla üretildi.',
      'Emojiler: Twemoji, Twitter, Inc. ve katkıcıları (CC BY 4.0). Yazı tipleri: Andika ve Baloo 2 (SIL Open Font License).',
      `Sürüm: ${SURUM_ADI}`,
      'Yetişkinler için: Pilot sayfası',
    ])
    expect(SURUM_ADI).toBe('pilot-1.1')
    expect(bolum).toContain(
      `<a href="${LISANSLAR.ccBy}" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>`,
    )
    expect(bolum).toContain(
      `<a href="${LISANSLAR.ofl}" target="_blank" rel="noopener noreferrer">SIL Open Font License</a>`,
    )
    expect(LISANSLAR.ccBy).toBe('https://creativecommons.org/licenses/by/4.0/')
    // Commit ve tarih yalnız pilot.html'de; sesin ayrıntısı yalnız README'de.
    expect(bolum).not.toContain(surumYazisi())
    expect(bolum).not.toMatch(/Chirp|Callirrhoe|Google|MIT|Morfemusta/)
  })

  it('Hakkında: yetişkinler için pilot sayfasına bağlanır (göreli adres, oyunun tabanında)', () => {
    expect(PILOT_ADRESI).toBe('pilot.html')
    expect(ayarlar()).toContain(`<p>Yetişkinler için: <a href="${PILOT_ADRESI}">Pilot sayfası</a></p>`)
  })
})
