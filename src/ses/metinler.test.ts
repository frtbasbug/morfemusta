import { describe, expect, it } from 'vitest'
import { BOLGELER } from '../oyun/bolgeler.ts'
import { bahceGorevi } from '../oyun/bahce.ts'
import { sinirCumlesi, uydurukSiniri } from '../oyun/uyduruk.ts'
import liste from './ses-listesi.json'
import { BUGUN_KURULANLAR, sesMetinleri } from './metinler.ts'
import { okunus } from './okunus.ts'

const gruplar = sesMetinleri()
const grup = (kimlik: string) => gruplar.find((g) => g.kimlik === kimlik)?.metinler ?? []
const hepsi = [...new Set(gruplar.flatMap((g) => g.metinler))]

const sesDosyalari = import.meta.glob('../../public/ses/*.mp3', { query: '?url', eager: true })
const dosyaAdlari = Object.keys(sesDosyalari).map((yol) => yol.split('/').at(-1) ?? '')
const kayitlar = liste.metinler as Record<
  string,
  { dosya: string; okunus: string; bolgeler: string[] }
>

describe('sesMetinleri: oyunun söyleyebileceği her metin, bölge bölge', () => {
  it('önce arayüz, sonra bölgeler tablodaki sırayla; grupta her metin bir kez', () => {
    expect(gruplar.map((g) => g.kimlik)).toEqual(['arayuz', ...BOLGELER.map((b) => b.kimlik)])
    for (const g of gruplar) expect(new Set(g.metinler).size).toBe(g.metinler.length)
  })

  it('arayüz: bölge adları, haritanın iletileri, akşam ekranının ara yazısı', () => {
    expect(grup('arayuz')).toEqual(
      expect.arrayContaining([
        ...BOLGELER.map((b) => b.ad),
        'Önce Bukalemun Koyu bitmeli.',
        'Burası hazırlanıyor. Yakında açılacak.',
        BUGUN_KURULANLAR,
      ]),
    )
  })

  it('her bölgede akşam başlığı', () => {
    for (const bolge of BOLGELER) expect(grup(bolge.kimlik)).toContain(bolge.aksam)
  })

  it('Koy: kök, her bukalemunun adayı, doğru biçim, yanlışın neden cümlesi', () => {
    expect(grup('koy')).toEqual(
      expect.arrayContaining([
        'at',
        'atlar',
        'atler',
        'a kalın, e ince. Kalınlıkları uyuşmuyor.',
        'top',
        'toplar',
        'toplarım',
        'toplarim',
      ]),
    )
  })

  it("Dükkân: kök, iki karonun kelimesi, neden cümlesi", () => {
    expect(grup('dukkan')).toEqual(
      expect.arrayContaining(['kitap', 'kitapım', 'kitabım', 'p ünlüden önce jöle olur: b.']),
    )
  })

  it('Bahçe: hedef, kelimenin her hâli, ekler, neden cümleleri', () => {
    const [gorev] = BOLGELER.find((b) => b.kimlik === 'bahce')?.gorevler ?? []
    if (!gorev) throw new Error('bahçede görev yok')
    const bahce = bahceGorevi(gorev)
    expect(grup('bahce')).toEqual(
      expect.arrayContaining([
        bahce.hedef,
        gorev.kok,
        ...bahce.govdeler.map((g) => g.bicim),
        ...bahce.parcalar.map((p) => p.yuzey),
      ]),
    )
    expect(grup('bahce').some((m) => m.startsWith('Meyvenin üstüne gövde çıkmaz'))).toBe(true)
  })

  it('Uydurukçuklar: kaynaştırmalı ve kaynaştırmasız aday, İkisi de olur cümlesi', () => {
    const uyduruk = BOLGELER.find((b) => b.kimlik === 'uyduruk')?.gorevler ?? []
    expect(grup('uyduruk')).toEqual(
      expect.arrayContaining(['zelü', 'zelüye', 'zelüe', 'pıtak', 'pıtakım', 'pıtağım']),
    )
    expect(grup('uyduruk')).toContain('İkisi de olur: pıtakım, pıtağım.')
    for (const gorev of uyduruk) {
      expect(grup('uyduruk')).toContain(gorev.kok)
      if (uydurukSiniri(gorev)) expect(grup('uyduruk')).toContain(sinirCumlesi(gorev))
    }
  })
})

describe('ses-listesi.json: her metnin sesi var', () => {
  it.each(hepsi)('%s', (metin) => {
    const kayit = kayitlar[metin]
    expect(kayit, 'listede yok: scripts/ses-uret.py').toBeDefined()
    expect(dosyaAdlari).toContain(kayit?.dosya)
    // Okunuş değiştiyse (okunuş tablosu, harf adları) ses yeniden üretilmeli.
    expect(kayit?.okunus).toBe(okunus(metin))
  })

  it('listedeki her dosya public/ses/ altında; artık dosya yok', () => {
    const listedekiler = new Set(Object.values(kayitlar).map((k) => k.dosya))
    for (const dosya of listedekiler) expect(dosyaAdlari).toContain(dosya)
    for (const dosya of dosyaAdlari) expect(listedekiler).toContain(dosya)
  })

  it('biçim MP3; ses tr_TR-dfki-medium (CC BY-NC-SA 4.0)', () => {
    expect(liste.ses).toBe('tr_TR-dfki-medium')
    expect(liste.lisans).toBe('CC BY-NC-SA 4.0')
    for (const { dosya } of Object.values(kayitlar)) expect(dosya).toMatch(/^[0-9a-f]{12}\.mp3$/)
  })
})
