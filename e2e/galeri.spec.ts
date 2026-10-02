import { expect, test, type Locator, type Page } from '@playwright/test'

// Karakter Galerisi: ayrı giriş sayfası (galeri.html); oyundan bağlantı almaz. Piksel
// karşılaştırmalı ekran görüntüsü testi yoktur: yazı tipi çizimi ortama göre değişir.
const GALERI = 'galeri.html'

const baslik = (sayfa: Page) =>
  sayfa.getByRole('heading', { level: 1, name: 'Karakter Galerisi' })
const unluler = (sayfa: Page) => sayfa.getByRole('img', { name: /^[aıoueiöü]: / })
const bukalemunlar = (sayfa: Page) => sayfa.getByRole('img', { name: / bukalemunu, / })
const renksizDugmesi = (sayfa: Page) => sayfa.getByRole('button', { name: 'Renksiz' })

const yatayTasma = (sayfa: Page) =>
  sayfa.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )

// Yazı tipinin gerçekten yüklenip öğeye uygulandığını denetler. document.fonts.check()
// kullanılmaz (CLAUDE.md, "Yazı tipi testi").
const yaziTipiYuklendi = (oge: Locator, aile: string) =>
  oge.evaluate(async (el, aile) => {
    await document.fonts.ready
    const stil = getComputedStyle(el)
    return (
      stil.fontFamily.replace(/["']/g, '').startsWith(aile) &&
      [...document.fonts].some(
        (yuz) =>
          yuz.family.replace(/["']/g, '') === aile &&
          yuz.weight === stil.fontWeight &&
          yuz.status === 'loaded',
      )
    )
  }, aile)

const degisken = (oge: Locator, ad: string) =>
  oge.evaluate((el, ad) => getComputedStyle(el).getPropertyValue(ad).trim().toLowerCase(), ad)

const dolgu = (oge: Locator) => oge.evaluate((el) => getComputedStyle(el).fill)

// Ek yazısının ekrandaki boyu (px). Bukalemun yazısıyla birlikte ölçeklenir; ince rengin
// üstünde 18px'ten küçük yazı olmaz (tema.css).
const ekYazisiBoylari = (sayfa: Page) =>
  bukalemunlar(sayfa).evaluateAll((svgler) =>
    svgler.map((svg) => {
      const olcek = svg.clientWidth / (svg as SVGSVGElement).viewBox.baseVal.width
      return parseFloat(getComputedStyle(svg.querySelector('text')!).fontSize) * olcek
    }),
  )

const etiketOlculeri = (sayfa: Page) =>
  sayfa.locator('.cizelge--etiket .unlu-etiketi').evaluateAll((ogeler) =>
    ogeler.map((oge) => {
      const kutu = oge.getBoundingClientRect()
      const stil = getComputedStyle(oge)
      return {
        harf: oge.textContent ?? '',
        en: kutu.width,
        boy: kutu.height,
        zemin: stil.backgroundColor,
        kose: stil.borderTopLeftRadius,
      }
    }),
  )

// Harfin mürekkep kutusu (canvas ölçüsü) etiketin çerçeve içine sığıyor mu: düzde
// dikdörtgene, yuvarlakta elipse. Kutunun dört köşesi de içeride olmalı; harf kutusundan
// daha yuvarlak olduğu için bu denetim temkinlidir. Sığmayan harfleri döner.
const sigmayanHarfler = (etiketler: Locator) =>
  etiketler.evaluateAll((ogeler) => {
    const ctx = document.createElement('canvas').getContext('2d')!
    return ogeler.flatMap((etiket) => {
      const stil = getComputedStyle(etiket)
      ctx.font = `${stil.fontWeight} ${stil.fontSize} ${stil.fontFamily}`
      const harf = etiket.textContent ?? ''
      const olcu = ctx.measureText(harf)
      const aralik = document.createRange()
      aralik.selectNodeContents(etiket)
      const metin = aralik.getBoundingClientRect()
      const taban = metin.bottom - olcu.fontBoundingBoxDescent
      const sol = metin.left - olcu.actualBoundingBoxLeft
      const sag = metin.left + olcu.actualBoundingBoxRight
      const ust = taban - olcu.actualBoundingBoxAscent
      const alt = taban + olcu.actualBoundingBoxDescent
      const kutu = etiket.getBoundingClientRect()
      const cerceve = parseFloat(stil.borderTopWidth)
      const cx = kutu.left + kutu.width / 2
      const cy = kutu.top + kutu.height / 2
      const a = kutu.width / 2 - cerceve
      const b = kutu.height / 2 - cerceve
      const elips = etiket.classList.contains('unlu-etiketi--yuvarlak')
      const icinde = [
        [sol, ust],
        [sag, ust],
        [sol, alt],
        [sag, alt],
      ].every(([x, y]) =>
        elips
          ? ((x! - cx) / a) ** 2 + ((y! - cy) / b) ** 2 <= 1
          : Math.abs(x! - cx) <= a && Math.abs(y! - cy) <= b,
      )
      return icinde ? [] : [harf]
    })
  })

test.describe('Karakter Galerisi', () => {
  test('telefonda açılır; sekiz ünlü ve sekiz bukalemun görünür; konsol hatası yok', async ({
    page,
  }) => {
    const hatalar: string[] = []
    page.on('console', (ileti) => {
      if (ileti.type() === 'error') hatalar.push(ileti.text())
    })
    page.on('pageerror', (hata) => hatalar.push(hata.message))

    await page.goto(GALERI)

    await expect(baslik(page)).toBeVisible()
    await expect(page).toHaveTitle('Karakter Galerisi · Ekle Bakalım')
    await expect(unluler(page)).toHaveCount(8)
    await expect(bukalemunlar(page)).toHaveCount(8)
    for (const karakter of [...(await unluler(page).all()), ...(await bukalemunlar(page).all())]) {
      await expect(karakter).toBeVisible()
    }
    await expect(page.getByText('kedim', { exact: true })).toBeVisible()
    expect(await yatayTasma(page)).toBeLessThanOrEqual(0)
    expect(Math.min(...(await ekYazisiBoylari(page)))).toBeGreaterThanOrEqual(18)

    // Dar telefonlarda da: taşma yok, bukalemun küçülüp ek yazısını 18px'in altına indirmez.
    for (const en of [360, 320]) {
      await page.setViewportSize({ width: en, height: 640 })
      await expect(baslik(page)).toBeInViewport()
      expect(await yatayTasma(page), `${en}px`).toBeLessThanOrEqual(0)
      expect(Math.min(...(await ekYazisiBoylari(page))), `${en}px`).toBeGreaterThanOrEqual(18)
    }

    await page.waitForLoadState('networkidle')
    expect(hatalar).toEqual([])
  })

  test('harf her kök etiketine sığar, incenin elipsine de', async ({ page }) => {
    await page.goto(GALERI)
    await page.evaluate(() => document.fonts.ready)
    // Kök etiketleri: ek yazısındaki etiketler (ağacın halkaları ve meyveleri) sayılmaz.
    const etiketler = page.locator('.unlu-etiketi:not(.ek-yazisi .unlu-etiketi)')
    // Çizelgedeki sekiz etiket, örnek satırlarındaki sekiz kök, Kök Bahçesi'ndeki ağacın
    // kökü (göz, 24px) ve Uydurukçuklar'ın on yaratığının adı.
    await expect(etiketler).toHaveCount(27)
    expect(await sigmayanHarfler(etiketler)).toEqual([])
  })

  test('yazı tipleri pakete gömülü; Google Fonts\'a ve başka sunucuya istek gitmez', async ({
    page,
    baseURL,
  }) => {
    const kaynak = new URL(baseURL!).origin
    const disIstekler: string[] = []
    page.on('request', (istek) => {
      const adres = new URL(istek.url())
      if (adres.protocol.startsWith('http') && adres.origin !== kaynak) {
        disIstekler.push(istek.url())
      }
    })

    await page.goto(GALERI)
    await expect(baslik(page)).toBeVisible()
    expect(await yaziTipiYuklendi(baslik(page), 'Baloo 2')).toBe(true)
    expect(await yaziTipiYuklendi(page.locator('.kok-yazisi').first(), 'Andika')).toBe(true)
    await page.waitForLoadState('networkidle')

    expect(disIstekler.filter((adres) => /fonts\.(googleapis|gstatic)\.com/.test(adres))).toEqual(
      [],
    )
    expect(disIstekler).toEqual([])
  })

  test('Renksiz: --kalin ile --ince aynı değeri alır; kalın ve ince gövde aynı gri', async ({
    page,
  }) => {
    await page.goto(GALERI)
    const dugme = renksizDugmesi(page)
    const a = page.getByRole('img', { name: 'a: kalın, düz, geniş', exact: true })
    const e = page.getByRole('img', { name: 'e: ince, düz, geniş', exact: true })
    const kalinGovde = a.locator('.unlu__govde')
    const inceGovde = e.locator('.unlu__govde')

    await expect(dugme).toHaveAttribute('aria-pressed', 'false')
    expect(await degisken(a, '--kalin')).not.toBe(await degisken(a, '--ince'))
    expect(await dolgu(kalinGovde)).not.toBe(await dolgu(inceGovde))
    const renkliEtiketler = await etiketOlculeri(page)
    expect(renkliEtiketler[0]!.zemin).not.toBe(renkliEtiketler[4]!.zemin)

    await dugme.click()
    await expect(dugme).toHaveAttribute('aria-pressed', 'true')
    expect(await degisken(a, '--kalin')).toBe('#8e8c99')
    expect(await degisken(a, '--ince')).toBe('#8e8c99')
    expect(await degisken(a, '--kalin-zemin')).toBe('#e2e1e8')
    expect(await degisken(a, '--ince-zemin')).toBe('#e2e1e8')
    expect(await dolgu(kalinGovde)).toBe(await dolgu(inceGovde))
    expect(await dolgu(kalinGovde)).toBe('rgb(142, 140, 153)')

    // Kök etiketleri renksiz de okunur: kalın ile ince eninden, düz ile yuvarlak köşesinden.
    const etiketler = await etiketOlculeri(page)
    expect(etiketler.map((e) => e.harf)).toEqual(['a', 'ı', 'o', 'u', 'e', 'i', 'ö', 'ü'])
    expect(new Set(etiketler.map((e) => e.zemin)).size).toBe(1)
    const kalinlar = etiketler.slice(0, 4)
    const inceler = etiketler.slice(4)
    for (const kalin of kalinlar) {
      for (const ince of inceler) expect(kalin.en, `${kalin.harf} / ${ince.harf}`).toBeGreaterThan(ince.en)
      expect(kalin.en / kalin.boy, kalin.harf).toBeCloseTo(58 / 56, 2)
    }
    for (const ince of inceler) expect(ince.en / ince.boy, ince.harf).toBeCloseTo(34 / 56, 2)
    expect(etiketler.map((e) => e.kose)).toEqual(['4px', '4px', '50%', '50%', '4px', '4px', '50%', '50%'])

    // Tekrar basınca renkler döner.
    await dugme.click()
    await expect(dugme).toHaveAttribute('aria-pressed', 'false')
    expect(await degisken(a, '--kalin')).not.toBe(await degisken(a, '--ince'))
  })

  test('oyun galeriye bağlantı vermez', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { level: 1, name: 'Ekle Bakalım' })).toBeVisible()
    await expect(page.locator('a[href*="galeri"]')).toHaveCount(0)
    expect(await page.content()).not.toContain('galeri')
  })

  test('oyun bir kez açıldıktan sonra çevrim dışı da açılır, yazı tipleriyle', async ({
    page,
    context,
  }) => {
    // Service worker önbellekte olmayan gezinmeyi oyuna (index.html) düşürür; galeri ve
    // yazı tipleri önbellekte olduğu için kendisi, kendi yazı tipleriyle açılmalı.
    await page.goto('./')
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null)

    await context.setOffline(true)
    await page.goto(GALERI)

    await expect(baslik(page)).toBeVisible()
    await expect(unluler(page)).toHaveCount(8)
    expect(await yaziTipiYuklendi(baslik(page), 'Baloo 2')).toBe(true)
  })
})
