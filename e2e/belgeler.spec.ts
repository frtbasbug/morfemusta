import { expect, test } from '@playwright/test'
import { disIstekleriTopla } from './yardimcilar.ts'

// Pilotun yazdırılabilir belgeleri (belgeler/*.html; DESIGN.md, "Pilot"): A4, siyah beyaz, her
// biri tek sayfa. Yazdırma (page.pdf) yalnız Chromium'dadır.

const BELGELER = [
  {
    yol: 'belgeler/gozlem-formu.html',
    baslik: 'Morfemusta pilotu · Gözlem formu',
    icerik: [
      'Çocuk kodu',
      'Gözlemci',
      'Ses modu',
      'Başlangıç saati',
      'Bitiş saati',
      'Bukalemun Koyu',
      "Fıstıkçı Şahap'ın Dükkânı",
      'Kök Bahçesi',
      'Uydurukçuklar (1. tur)',
      'Yardım sayısı',
      'Zorlandığı görevler',
      'sürükledi',
      'nedeni okudu ya da dinledi',
      'tahmin etti',
      'Çocuğun sözleri (aynen)',
      'Sürükleme zor',
      'Ses duyulmadı',
      'Ne yapacağını anlamadı',
      'Sıkıldı',
      'Eğlendi',
      'Anladı',
    ],
  },
  {
    yol: 'belgeler/veli-onay-formu.html',
    baslik: 'Morfemusta pilotu · Veli bilgilendirme ve onay formu',
    icerik: [
      'kâr amacı gütmeyen bir Türkçe',
      'Çocuk doğru eki kelimenin köküne taşır; kurduğu kelime ekrandaki dünyayı değiştirir',
      'Onay vermemenin ya da onayı geri almanın çocuğunuz için hiçbir olumsuz sonucu olmaz.',
      'Onay geri alınırsa çocuğunuzun notları ve deneme kaydı silinir.',
      'Çocuk kodu (gözlemci doldurur)',
      'anlaşılır ve eğlenceli',
      '20–30 dakika',
      'Ses, fotoğraf ya da görüntü kaydı yapılmaz.',
      'Katılım gönüllüdür.',
      'istediği an bırakabilir',
      'Araştırmacı',
      'Kurumu',
      'Velinin adı ve soyadı',
      'İmza',
      'Tarih',
      'Çocuğun sözlü onayı',
    ],
  },
  {
    yol: 'belgeler/gozlemci-yonergesi.html',
    baslik: 'Morfemusta pilotu · Gözlemci yönergesi',
    icerik: [
      'frtbasbug.github.io/morfemusta/',
      'frtbasbug.github.io/morfemusta/pilot.html',
      'Sesli mod',
      'Yeni çocuk',
      'Kuralı öğretmeyin.',
      'Pilot sayfasını yer imlerine ekleyin.',
      "iPhone ve iPad'de oyunu ana ekrandaki simgeden açmayın; pilot sayfasındaki Oyunu aç'la Safari'de açın.",
      'Bu yeni bir kelime oyunu. Sen oynarken ben not alacağım. Yanlış yapmak sorun değil; oyunu deniyoruz, seni değil. İstediğin an bırakabilirsin.',
      '30 saniye',
      '20–25 dakika',
      'aynen',
      'CSV indir',
      'Fotoğraf, ses ya da görüntü kaydı yapmayın.',
    ],
  },
] as const

test.describe('pilotun belgeleri', () => {
  for (const belge of BELGELER) {
    test(`${belge.baslik}: A4'te tek sayfa, Türkçe, dış istek yok`, async ({
      page,
      baseURL,
      browserName,
    }) => {
      test.skip(browserName !== 'chromium', "page.pdf yalnız Chromium'da")
      const disIstekler = disIstekleriTopla(page, baseURL)
      await page.goto(belge.yol)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(belge.baslik)
      await expect(page.locator('html')).toHaveAttribute('lang', 'tr')
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
      for (const metin of belge.icerik) await expect(page.locator('main')).toContainText(metin)
      // Gömülü yazı tipi: her cihazda aynı ölçüler.
      await page.evaluate(() => document.fonts.ready)
      // (document.fonts.check kullanılmaz: CLAUDE.md, "Yazı tipi testi".)
      expect(
        await page.evaluate(() =>
          [...document.fonts].some((f) => f.family.replace(/["']/g, '') === 'Andika' && f.status === 'loaded'),
        ),
      ).toBe(true)

      await page.emulateMedia({ media: 'print' })
      const pdf = await page.pdf({ format: 'A4', preferCSSPageSize: true })
      const metin = pdf.toString('latin1')
      expect(metin.match(/\/Type\s*\/Page(?!s)/g) ?? []).toHaveLength(1)
      // A4: 595 × 842 punto.
      const kutu = /\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/.exec(metin)
      expect(Math.round(Number(kutu?.[1]))).toBeGreaterThanOrEqual(594)
      expect(Math.round(Number(kutu?.[1]))).toBeLessThanOrEqual(596)
      expect(Math.round(Number(kutu?.[2]))).toBeGreaterThanOrEqual(841)
      expect(Math.round(Number(kutu?.[2]))).toBeLessThanOrEqual(843)
      expect(disIstekler).toEqual([])
    })
  }

  test('gözlemci yönergesinde adresler büyük puntoyla', async ({ page }) => {
    await page.goto('belgeler/gozlemci-yonergesi.html')
    const boylar = await page
      .locator('.adres__yol')
      .evaluateAll((ogeler) => ogeler.map((o) => parseFloat(getComputedStyle(o).fontSize)))
    expect(boylar).toHaveLength(2)
    for (const boy of boylar) expect(boy).toBeGreaterThanOrEqual(22)
  })
})
