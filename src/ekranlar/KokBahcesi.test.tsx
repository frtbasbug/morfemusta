import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { bolgeBul, type Bolge } from '../oyun/bolgeler.ts'
import KokBahcesi from './KokBahcesi.tsx'

const eslesmeler = (html: string, desen: RegExp) => [...html.matchAll(desen)].map((m) => m[1])

const BAHCE = bolgeBul('bahce') as Bolge

describe('KokBahcesi', () => {
  const html = renderToStaticMarkup(<KokBahcesi bolge={BAHCE} onHarita={() => {}} />)

  it('başlık bölge tablosundan; Harita düğmesi ve görev sırası', () => {
    expect(html).toMatch(/^<main class="bahce">/)
    expect(html).toContain('<h1 class="bolge-ustu__baslik" tabindex="-1">Kök Bahçesi</h1>')
    expect(html).toContain('<p class="bolge-ustu__sira"><span class="gizli">Görev </span>1 / 10</p>')
  })

  it('ağacın dibinde kök, halka ve meyve yok; tabelada hedef kelime', () => {
    expect(html).toContain('aria-label="Ağaç: çiçek"')
    expect(html).toMatch(/class="agac__kok">.*class="kok-yazisi__okunan">çiçek</)
    expect(html).not.toMatch(/class="agac__halka"|class="meyve/)
    expect(html).toContain('<p class="tabela"><span class="gizli">Hedef: </span>çiçekçiler</p>')
    expect(html).toContain('<ul class="bahce__kartlar" aria-label="Düşen kartlar"></ul>')
  })

  it('sepette hedefin ekleri bukalemun olarak, karışık sırada', () => {
    expect(eslesmeler(html, /aria-label="([^" ]+) bukalemunu/g)).toEqual(['ler', 'çi'])
    const en = renderToStaticMarkup(<KokBahcesi bolge={BAHCE} baslangic={9} />)
    expect(en).toContain('<p class="tabela"><span class="gizli">Hedef: </span>gözlükçüler</p>')
    expect(eslesmeler(en, /aria-label="([^" ]+) bukalemunu/g)).toEqual(['çü', 'ler', 'lük'])
  })

  it('iyelikli ağaçta cep durur (kalemliğim); ötekilerde yok', () => {
    expect(html).not.toContain('bahce__cep')
    const cepli = renderToStaticMarkup(<KokBahcesi bolge={BAHCE} baslangic={6} />)
    expect(cepli).toContain('class="bahce__cep"')
  })

  it('hiçbir yerde puan, seri ya da süre yok', () => {
    expect(html).not.toMatch(/puan|seri|süre|skor/i)
  })
})
