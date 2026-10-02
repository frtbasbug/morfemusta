import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import oyunSayfasi from '../../index.html?raw'
import pilotSayfasi from '../../pilot.html?raw'
import {
  DURMA_ANAHTARI,
  GUNLUK_ANAHTARI,
  csvDosyaAdi,
  csvMetni,
  type DenemeSatiri,
  type PilotDeposu,
} from '../oyun/gunluk.ts'
import { ANAHTAR } from '../oyun/ilerleme.ts'
import { surumYazisi } from '../surum.ts'
import PilotSayfasi, {
  BELGELER,
  csvDosyasi,
  dosyaPaylasilabilirMi,
  type Paylasici,
} from './PilotSayfasi.tsx'

/** Belgeler: belgeler/*.html (pilot.html'e göre yolları). */
const belgeler = import.meta.glob<string>('../../belgeler/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Oyunun kaynakları: hiçbiri pilot sayfasına bağlanmaz. */
const oyununKaynaklari = import.meta.glob<string>(
  ['../App.tsx', '../main.tsx', '../ekranlar/*.tsx', '../kabuk/*.{ts,tsx}', '!../**/*.test.*'],
  { query: '?raw', import: 'default', eager: true },
)

function bellekDeposu(kayitlar: Record<string, string> = {}): PilotDeposu {
  const harita = new Map(Object.entries(kayitlar))
  return {
    getItem: (anahtar) => harita.get(anahtar) ?? null,
    setItem: (anahtar, deger) => {
      harita.set(anahtar, deger)
    },
    removeItem: (anahtar) => {
      harita.delete(anahtar)
    },
  }
}

const satir = (degisen: Partial<DenemeSatiri>): DenemeSatiri => ({
  zaman: '2026-10-01T10:15:03.250+03:00',
  cocuk: 'P01',
  surum: 'pilot-1',
  bolge: 'koy',
  tur: 1,
  gorev: 1,
  kok: 'at',
  ekler: 'PL',
  dogru_bicim: 'atlar',
  secilen: 'lar',
  aday: 'atlar',
  sonuc: 'dogru',
  neden: '',
  deneme_no: 1,
  sure_ms: 1000,
  ses_modu: 'sesli',
  ...degisen,
})

const sayfa = (depo: PilotDeposu | null, paylasici?: Paylasici) =>
  renderToStaticMarkup(<PilotSayfasi depo={depo} paylasici={paylasici} />)

/** Dosya paylaşabilen tarayıcı (Web Share API Level 2): canShare dosyaları kabul eder. */
const paylasan: Paylasici = {
  share: async () => {},
  canShare: (veri) => (veri?.files ?? []).every((f) => f.type === 'text/csv'),
}

const birSatirlik = () =>
  bellekDeposu({ [GUNLUK_ANAHTARI]: JSON.stringify({ cocuk: 'P01', satirlar: [satir({})] }) })

describe('pilot sayfası', () => {
  it('başlık, sürüm (ad, commit, tarih) ve bölümler', () => {
    const html = sayfa(bellekDeposu())
    expect(html).toMatch(/<h1 id="pilot-baslik" tabindex="-1">Pilot<\/h1>/)
    expect(html).toContain(`<span data-surum="">${surumYazisi()}</span>`)
    for (const baslik of ['Çocuk', 'Özet', 'Günlük', 'Belgeler']) {
      expect(html).toContain(`>${baslik}</h2>`)
    }
  })

  it('kod yokken günlük kapalı; özet boş; CSV ve Kopyala kapalı', () => {
    const html = sayfa(bellekDeposu())
    expect(html).toContain('Günlük kapalı: çocuk kodu yok.')
    expect(html).toContain('Günlükte henüz deneme yok.')
    expect(html).toMatch(/<button type="button" class="pilot__dugme" disabled="">CSV indir<\/button>/)
    expect(html).toMatch(/<button type="button" class="pilot__dugme" disabled="">Kopyala<\/button>/)
    expect(html).not.toContain('Kodu sil')
  })

  it('kod ve satırlar: çocuk başına özet, satır sayısı', () => {
    const html = sayfa(
      bellekDeposu({
        [GUNLUK_ANAHTARI]: JSON.stringify({
          cocuk: 'P02',
          satirlar: [
            satir({ secilen: 'ler', aday: 'atler', sonuc: 'yanlis', neden: 'PL:kalınlık' }),
            satir({ deneme_no: 2 }),
            satir({ cocuk: 'P02' }),
          ],
        }),
      }),
    )
    expect(html).toContain('Çocuk kodu: <strong data-cocuk="">P02</strong>')
    expect(html).toContain('Kodu sil')
    expect(html).toContain('<p data-gunluk-sayisi="">3 deneme, 2 çocuk.</p>')
    expect(html).toMatch(
      /<tr data-bolge="koy"><th scope="row">Bukalemun Koyu<\/th><td>1<\/td><td>0 \/ 1 \(%0\)<\/td><\/tr>/,
    )
    expect(html).toContain('<code>PL:kalınlık</code> (1)')
    expect(html).toContain('Yanlış seçim yok.')
  })

  it('uyarılar: günlük durdu, sınıf modu açık, okunamayan kayıt', () => {
    expect(
      sayfa(
        bellekDeposu({
          [GUNLUK_ANAHTARI]: JSON.stringify({ cocuk: 'P01', satirlar: [] }),
          [DURMA_ANAHTARI]: '2026-10-01T10:15:03.250Z',
        }),
      ),
    ).toContain('Günlük durdu: cihazın deposu doldu')
    expect(
      sayfa(bellekDeposu({ [ANAHTAR]: JSON.stringify({ ayarlar: { sinif: 'acik', ses: 'sesli' } }) })),
    ).toMatch(/Sınıf modu açık: denemeler yazılmaz\.[\s\S]*Ses: Sesli mod · Sınıf modu: Açık/)
    expect(sayfa(bellekDeposu({ [GUNLUK_ANAHTARI]: '{bozuk' }))).toContain(
      'Günlük okunamıyor: kayıt bozuk.',
    )
    // Depo dolu (sınama yazısı yazılamıyor).
    const dolu = bellekDeposu()
    dolu.setItem = () => {
      throw new Error('QuotaExceededError')
    }
    expect(sayfa(dolu)).toContain('Cihazın deposu dolu: yeni denemeler yazılamaz')
    expect(sayfa(null)).toContain("Bu tarayıcıda cihazın deposuna erişilemiyor")
  })

  it('günlük boşken düğmelerin yanında yol tarifi; deneme varken yok', () => {
    const tarif =
      "<p class=\"pilot__aciklama\" data-yol-tarifi=\"\">Günlük boş: önce çocuk kodunu yazıp Yeni çocuk'a, sonra Oyunu aç'a dokunun.</p>"
    expect(sayfa(bellekDeposu())).toContain(tarif.replaceAll("'", '&#x27;'))
    // Kod girilmiş ama henüz deneme yok: yine boş.
    expect(
      sayfa(bellekDeposu({ [GUNLUK_ANAHTARI]: JSON.stringify({ cocuk: 'P01', satirlar: [] }) })),
    ).toContain('data-yol-tarifi')
    expect(sayfa(birSatirlik())).not.toContain('data-yol-tarifi')
  })

  it('Paylaş yalnız dosya paylaşabilen tarayıcıda; CSV indir ve Kopyala her zaman', () => {
    for (const paylasici of [
      undefined,
      {},
      { share: async () => {} },
      { share: async () => {}, canShare: () => false },
      {
        share: async () => {},
        canShare: () => {
          throw new TypeError('files desteklenmiyor')
        },
      },
    ] satisfies (Paylasici | undefined)[]) {
      expect(dosyaPaylasilabilirMi(paylasici)).toBe(false)
      const html = sayfa(birSatirlik(), paylasici ?? {})
      expect(html).not.toContain('Paylaş</button>')
      expect(html).toContain('>CSV indir</button>')
      expect(html).toContain('>Kopyala</button>')
    }
    expect(dosyaPaylasilabilirMi(paylasan)).toBe(true)
    const html = sayfa(birSatirlik(), paylasan)
    expect(html).toMatch(
      /CSV indir<\/button><button type="button" class="pilot__dugme">Paylaş<\/button><button type="button" class="pilot__dugme">Kopyala<\/button>/,
    )
    // Günlük boşken öteki düğmeler gibi kapalı.
    expect(sayfa(bellekDeposu(), paylasan)).toMatch(
      /<button type="button" class="pilot__dugme" disabled="">Paylaş<\/button>/,
    )
  })

  it('paylaşılan dosya indirilen CSV\'nin aynısı: UTF-8 imli, noktalı virgüllü, aynı ad', async () => {
    const satirlar = [satir({ kok: 'gıvak', aday: 'gıvağım' })]
    const ad = csvDosyaAdi(new Date(2026, 9, 2, 10))
    const dosya = csvDosyasi(csvMetni(satirlar), ad)
    expect(dosya.name).toBe('ekle-bakalim-pilot-2026-10-02.csv')
    expect(dosya.type).toBe('text/csv')
    const baytlar = new Uint8Array(await dosya.arrayBuffer())
    expect([...baytlar.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    const metin = new TextDecoder('utf-8', { ignoreBOM: true }).decode(baytlar)
    expect(metin).toBe(csvMetni(satirlar))
    expect(metin.split('\r\n')[0]).toContain('zaman;cocuk;surum')
    expect(metin).toContain('gıvağım')
  })

  it('Günlüğü sil iki adımdır: ilk adım yalnız bir düğme; confirm yok', () => {
    const html = sayfa(bellekDeposu({ [GUNLUK_ANAHTARI]: JSON.stringify({ cocuk: null, satirlar: [satir({})] }) }))
    expect(html).toContain('>Günlüğü sil</button>')
    expect(html).not.toContain('Günlükteki bütün denemeler silinecek.')
  })

  it('üç belgeye bağlanır; belgeler var, A4 ve arama motorlarına kapalı', () => {
    const html = sayfa(bellekDeposu())
    expect(BELGELER.map((b) => b.ad)).toEqual([
      'Gözlem formu',
      'Veli bilgilendirme ve onay formu',
      'Gözlemci yönergesi',
    ])
    for (const { yol, ad } of BELGELER) {
      expect(html).toContain(`<a href="${yol}">${ad}</a>`)
      const metin = belgeler[`../../${yol}`]
      expect(metin, yol).toBeDefined()
      expect(metin).toContain('<html lang="tr">')
      expect(metin).toContain('<meta name="robots" content="noindex, nofollow" />')
      expect(metin).toContain('href="/src/belgeler/belge.css"')
    }
    expect(Object.keys(belgeler)).toHaveLength(3)
  })

  it('oyuna bağlanır; oyundan pilot sayfasına tek bağlantı Hakkında\'dadır', () => {
    expect(sayfa(bellekDeposu())).toContain('<a class="pilot__dugme" href="./">Oyunu aç</a>')
    expect(oyunSayfasi).not.toContain('pilot')
    const kaynaklar = Object.entries(oyununKaynaklari)
    expect(kaynaklar.length).toBeGreaterThan(10)
    // Yorumda anılabilir; bağlantı ya da adres olarak yalnız Ayarlar'da (Hakkında) bir kez geçer.
    const adresler = kaynaklar.flatMap(([dosya, metin]) =>
      [...metin.matchAll(/["'`][^"'`\s]*pilot\.html/g)].map(() => dosya),
    )
    expect(adresler).toEqual(['../ekranlar/Ayarlar.tsx'])
  })

  it('pilot.html: ayrı giriş, arama motorlarına kapalı', () => {
    expect(pilotSayfasi).toContain('<title>Pilot · Ekle Bakalım</title>')
    expect(pilotSayfasi).toContain('<meta name="robots" content="noindex, nofollow" />')
    expect(pilotSayfasi).toContain('<script type="module" src="/src/pilot/main.tsx"></script>')
  })
})
