import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { bolgeBul, type Bolge } from '../oyun/bolgeler.ts'
import Uydurukcuklar from './Uydurukcuklar.tsx'

const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])

const UYDURUK = bolgeBul('uyduruk') as Bolge

describe('Uydurukcuklar', () => {
  const html = renderToStaticMarkup(<Uydurukcuklar bolge={UYDURUK} onHarita={() => {}} />)

  it('başlık bölge tablosundan; Harita düğmesi ve turdaki görev sırası', () => {
    expect(html).toMatch(/^<main class="uyduruk" data-evre="secim">/)
    expect(html).toContain('<h1 class="bolge-ustu__baslik" tabindex="-1">Uydurukçuklar</h1>')
    // Turlu bölge: sıranın önünde tur (dar ekranda tur üstte, ayraç gizli).
    expect(html).toContain(
      '<p class="bolge-ustu__sira"><span class="bolge-ustu__tur">1. tur<span class="bolge-ustu__ayrac"> · </span></span><span class="gizli">Görev </span>1 / 10</p>',
    )
  })

  it('yaratık büyük boy, adı altında (son ünlüsü etikette); hedefin adı kök', () => {
    expect(html).toContain('aria-label="fıngıl"')
    expect(html).toMatch(/<svg class="yaratik unlu unlu--kalin"[^>]*width="129.6" height="136.8" aria-hidden="true">/)
    expect(html).toMatch(/class="uyduruk__ad" aria-hidden="true">fıng<span class="unlu-etiketi[^"]*"[^>]*>ı<\/span>l</)
  })

  it('kıyıda ekin bukalemunları; yönelmede kaynaştırmalı ve kaynaştırmasız, bulunmada taş ve jöle dört kılık', () => {
    expect(eslesmeler(html, /aria-label="([^" ]+) bukalemunu/g).sort()).toEqual(['lar', 'ler'])
    const zelu = renderToStaticMarkup(<Uydurukcuklar bolge={UYDURUK} baslangic={7} />)
    expect(eslesmeler(zelu, /aria-label="([^" ]+) bukalemunu/g).sort()).toEqual(['a', 'e', 'ya', 'ye'])
    const momus = renderToStaticMarkup(<Uydurukcuklar bolge={UYDURUK} baslangic={4} />)
    expect(eslesmeler(momus, /aria-label="([^" ]+) bukalemunu/g).sort()).toEqual(['da', 'de', 'ta', 'te'])
  })

  it('kalınan yer bütün tablodadır: 10, 2. turun ilk yaratığı (pıbız)', () => {
    const ikinci = renderToStaticMarkup(<Uydurukcuklar bolge={UYDURUK} baslangic={10} />)
    expect(ikinci).toContain('aria-label="pıbız"')
    expect(ikinci).toContain('<span class="gizli">Görev </span>1 / 10</p>')
    const dorduncu = renderToStaticMarkup(<Uydurukcuklar bolge={UYDURUK} baslangic={13} />)
    expect(dorduncu).toContain('aria-label="dobut"')
    expect(dorduncu).toContain('<span class="gizli">Görev </span>4 / 10</p>')
  })

  it('cep yalnız iyelik görevlerinde', () => {
    expect(html).not.toContain('uyduruk__cep')
    const pitak = renderToStaticMarkup(<Uydurukcuklar bolge={UYDURUK} baslangic={3} />)
    expect(pitak).toContain('class="uyduruk__cep"')
  })

  it('üst çubukta turun puanı sıfırdan başlar; süre ve sıralama yok (puan yalnız artar)', () => {
    expect(html).toContain('<p class="bolge-ustu__puan">')
    expect(html).toContain('<span class="gizli">Puan: </span>0</p>')
    expect(html).not.toMatch(/süre|skor|sıralama/i)
    // Kendiliğinden geçiş varsayılandır: başta Sıradaki düğmesi yok.
    expect(html).not.toContain('Sıradaki')
  })
})
