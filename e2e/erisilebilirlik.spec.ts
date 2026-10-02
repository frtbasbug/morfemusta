import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { ANAHTAR, bukalemun, gorevleriOyna, kart, sonraki } from './yardimcilar.ts'

// Erişilebilirlik (axe-core): oyunun ekranları Renkli, Renksiz ve sınıf modunda; geliştirici
// sayfaları (denetim.html, galeri.html, ses.html, cihaz.html) ve pilot (pilot.html, belgeler). Ciddi ya da kritik bulgu kalmaz.

type Mod = 'renkli' | 'renksiz' | 'sinif'

/** Ciddi ve kritik bulgular: kural, etki ve öğeler. */
async function tara(sayfa: Page, ad: string) {
  await sayfa.evaluate(() => document.fonts.ready)
  const { violations } = await new AxeBuilder({ page: sayfa }).analyze()
  return violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({ ekran: ad, kural: v.id, etki: v.impact, ogeler: v.nodes.map((n) => n.target.join(' ')) }))
}

const tum = (n: number) => ({ bitenler: Array.from({ length: n }, (_, i) => i + 1), kaldigi: n })
const kartlar = [
  ['atlar', 'at', ['PL'], 'koy'],
  ['toplarım', 'top', ['PL', 'POSS.1SG'], 'koy'],
  ['kitabım', 'kitap', ['POSS.1SG'], 'dukkan'],
  ['çiçekçi', 'çiçek', ['AGT'], 'bahce'],
  ['fıngıllar', 'fıngıl', ['PL'], 'uyduruk'],
].map(([kelime, kok, etiketler, bolge]) => ({
  kelime,
  kok,
  etiketler,
  bolge,
  tarih: '2026-10-01T10:00:00.000Z',
  sonKurulma: '2026-10-01T10:00:00.000Z',
}))

/** Modun kaydı: bütün bölgeler açık (koy, dükkân, bahçe bitmiş), Sözlük'te kartlar. */
function kurulum(mod: Mod) {
  return JSON.stringify({
    // Koyun son görevi kalınan yer: akşam ekranına bir görevle varılır.
    bolgeler: { koy: { bitenler: tum(10).bitenler, kaldigi: 9 }, dukkan: tum(10), bahce: tum(10) },
    kartlar,
    ayarlar: { renkler: mod === 'renksiz' ? 'renksiz' : 'renkli', sinif: mod === 'sinif' ? 'acik' : 'kapali' },
  })
}

for (const mod of ['renkli', 'renksiz', 'sinif'] as const) {
  test.describe(`oyun: ${mod}`, () => {
    test.use({
      contextOptions: { reducedMotion: 'reduce' },
      ...(mod === 'sinif' ? { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 } : {}),
    })

    test('harita, dört bölge, Sözlük, Ayarlar ve akşam ekranında ciddi ya da kritik bulgu yok', async ({
      page,
    }) => {
      test.setTimeout(120_000)
      await page.addInitScript(
        ([anahtar, kayit]) => {
          if (sessionStorage.getItem('kuruldu')) return
          sessionStorage.setItem('kuruldu', 'evet')
          localStorage.setItem(anahtar!, kayit!)
        },
        [ANAHTAR, kurulum(mod)] as const,
      )
      const bulgular = []
      await page.goto('./')
      await expect(page.locator('html')).toHaveAttribute('data-sinif', mod === 'sinif' ? 'acik' : 'kapali')
      await expect(page.getByRole('heading', { level: 1, name: 'Morfemusta Adası' })).toBeVisible()
      bulgular.push(...(await tara(page, 'harita')))
      // Kilitli ya da hazırlanan bölge yoksa ileti de yok; ileti olan harita için Uydurukçuklar'a
      // bakılır (Renkli ve Renksiz'de açık).

      for (const [kimlik, ad] of [
        ['koy', 'Bukalemun Koyu'],
        ['dukkan', "Fıstıkçı Şahap'ın Dükkânı"],
        ['bahce', 'Kök Bahçesi'],
        ['uyduruk', 'Uydurukçuklar'],
      ] as const) {
        await page.goto(`./#/bolge/${kimlik}`)
        await expect(page.getByRole('heading', { level: 1, name: ad })).toBeVisible()
        bulgular.push(...(await tara(page, kimlik)))
      }

      // Koy: yanlış deneme (neden ve cümlesi), sonra doğru (Sıradaki), sonra akşam ekranı. Sınıf
      // modunda ilerleme bellektedir: koyun ilk görevi.
      await page.goto('./#/bolge/koy')
      const ilk = mod === 'sinif'
      await bukalemun(page, 'ler').tap()
      await kart(page).tap()
      await expect(page.locator('.neden__cumle')).toBeVisible()
      bulgular.push(...(await tara(page, 'koy-yanlis')))
      for (const yuzey of ilk ? ['lar'] : ['lar', 'ım']) {
        await bukalemun(page, yuzey).tap()
        await kart(page).tap()
      }
      await expect(sonraki(page)).toBeVisible()
      bulgular.push(...(await tara(page, 'koy-dogru')))
      await sonraki(page).tap()
      // Sınıf modunda koyun kalan dokuz görevi de oynanır (ilerleme bellekte, baştan).
      if (ilk) await gorevleriOyna(page, 1, 9)
      await expect(page.getByRole('heading', { level: 1, name: 'Koyda akşam oldu' })).toBeVisible()
      bulgular.push(...(await tara(page, 'aksam')))

      await page.goto('./#/sozluk')
      await expect(page.getByRole('heading', { level: 1, name: 'Sözlük' })).toBeVisible()
      bulgular.push(...(await tara(page, 'sozluk')))
      await page.goto('./#/ayarlar')
      await expect(page.getByRole('heading', { level: 1, name: 'Ayarlar' })).toBeVisible()
      bulgular.push(...(await tara(page, 'ayarlar')))
      expect(bulgular).toEqual([])
    })
  })
}

test.describe("iOS Safari'de ana ekran ipucu", () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  })

  test('ipucuyla harita: ciddi ya da kritik bulgu yok', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('note')).toContainText('İlerlemen silinmesin')
    expect(await tara(page, 'harita-ipucu')).toEqual([])
  })
})

test.describe('geliştirici sayfaları', () => {
  test('denetim.html, galeri.html, ses.html, cihaz.html, pilot.html ve belgeler', async ({ page }) => {
    test.setTimeout(120_000)
    const bulgular = []
    for (const [adres, baslik] of [
      ['denetim.html', 'Biçim Denetimi'],
      ['galeri.html', 'Karakter Galerisi'],
      ['ses.html', 'Ses Denetimi'],
      ['cihaz.html', 'Cihaz Denetimi'],
      ['pilot.html', 'Pilot'],
      ['belgeler/gozlem-formu.html', 'Morfemusta pilotu · Gözlem formu'],
      ['belgeler/veli-onay-formu.html', 'Morfemusta pilotu · Veli bilgilendirme ve onay formu'],
      ['belgeler/gozlemci-yonergesi.html', 'Morfemusta pilotu · Gözlemci yönergesi'],
    ] as const) {
      await page.goto(adres)
      await expect(page.getByRole('heading', { level: 1, name: baslik })).toBeVisible()
      bulgular.push(...(await tara(page, adres)))
    }
    expect(bulgular).toEqual([])
  })
})
