import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  DOGRU_YUZEYLER,
  KELIMELER,
  bukalemun,
  disIstekleriTopla,
  haritaBasligi,
  haritaDugmesi,
  kart,
  koyuAc,
  sira,
  sonraki,
} from './yardimcilar.ts'

// Bukalemun Koyu: oyunun ilk bölgesi. Açılış ekranı ada haritasıdır; koya haritadan girilir
// (koyuAc). Oyun doğru biçimi motordan alır; beklenen sonuçlar yardimcilar.ts'te yazılıdır.

const neden = (sayfa: Page) => sayfa.locator('.neden')

const yatayTasma = (sayfa: Page) =>
  sayfa.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

const degisken = (oge: Locator, ad: string) =>
  oge.evaluate((el, ad) => getComputedStyle(el).getPropertyValue(ad).trim().toLowerCase(), ad)

// Element.animate çağrılarının anahtar karelerini kaydeder: hareketin istendiğini (ya da
// hareket azaltmada hiç istenmediğini) sınamak için.
const hareketleriKaydet = (sayfa: Page) =>
  sayfa.addInitScript(() => {
    const kayit: string[] = []
    ;(window as unknown as { hareketler: string[] }).hareketler = kayit
    const asil = Element.prototype.animate
    Element.prototype.animate = function (kareler, secenekler) {
      kayit.push(JSON.stringify(kareler))
      return asil.call(this, kareler, secenekler)
    }
  })
const hareketler = (sayfa: Page) =>
  sayfa.evaluate(() => (window as unknown as { hareketler: string[] }).hareketler)

/** Bukalemunun ağzı: oyun durumu ağzı hiç değiştirmez (DESIGN.md, "Üç kural"). */
const agizlar = (sayfa: Page) =>
  sayfa
    .locator('.kiyi .bukalemun__agiz')
    .evaluateAll((yollar) => yollar.map((yol) => yol.getAttribute('d')))

test.describe('Bukalemun Koyu', () => {
  test('on görev dokun-dokun doğru oynanır; büyüler ve kapanış kartı görünür', async ({ page }) => {
    test.setTimeout(180_000)
    const hatalar: string[] = []
    page.on('console', (ileti) => {
      if (ileti.type() === 'error') hatalar.push(ileti.text())
    })
    page.on('pageerror', (hata) => hatalar.push(hata.message))
    await hareketleriKaydet(page)
    await koyuAc(page)

    for (let i = 0; i < 10; i++) {
      const kelime = KELIMELER[i]!
      await expect(sira(page)).toHaveText(`Görev ${i + 1} / 10`)
      const koy = page.locator('main.koy')
      if (i === 8) {
        // Renksiz görev: kalın ve ince aynı gri; bedenler ve kulak yeter.
        await expect(koy).toHaveClass(/\brenksiz\b/)
        expect(await degisken(koy, '--kalin')).toBe(await degisken(koy, '--ince'))
      }

      for (const [adim, yuzey] of DOGRU_YUZEYLER[i]!.entries()) {
        await bukalemun(page, yuzey).tap()
        await expect(bukalemun(page, yuzey)).toHaveAttribute('aria-pressed', 'true')
        await kart(page).tap()
        if (adim === 0 && i === 9) {
          // Zincir: ilk ek tutunca gövde toplar olur, etiket a'ya geçer; iyelik sırası gelir.
          await expect(bukalemun(page, 'ım')).toBeVisible()
          await expect(kart(page)).toHaveAccessibleName('toplar')
          await expect(kart(page).locator('.unlu-etiketi')).toHaveText('a')
        }
      }
      await expect(sonraki(page)).toBeVisible()
      await expect(sonraki(page)).toBeFocused()

      if (i < 4) {
        // Çoğul: kelime birleşir, ek bukalemunun renginde kalır; kart üçe çoğalır.
        await expect(kart(page)).toHaveAccessibleName(kelime)
        await expect(page.locator('.koy__sahne .kelime-karti')).toHaveCount(3)
        const ek = kart(page).locator('.ek-yazisi')
        await expect(ek).toHaveText(DOGRU_YUZEYLER[i]![0]!)
        const govde = page.locator('.kiyi__bukalemun--birlesti .bukalemun__govde')
        expect(await ek.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
          await govde.evaluate((el) => getComputedStyle(el).fill),
        )
      } else {
        // İyelik: kart ekranın altındaki cebe girer.
        await expect(page.locator('.koy__sahne .kelime-karti')).toHaveCount(0)
        await expect(page.locator('.cep .kelime-karti:not(.kelime-karti--kopya)')).toHaveCount(1)
        await expect(page.locator('.cep__yazi .sonuc-kelime__okunan')).toHaveText(kelime)
      }
      if (i === 8) {
        // Büyü olunca renkler geri gelir.
        await expect(page.locator('main.koy')).not.toHaveClass(/\brenksiz\b/)
        expect(await degisken(koy, '--kalin')).not.toBe(await degisken(koy, '--ince'))
      }
      await sonraki(page).tap()
    }

    // Akşam: başlık bölge tablosundan, altında bugün kurulan kelimeler; tek düğme.
    const aksam = page.getByRole('heading', { level: 1, name: 'Koyda akşam oldu' })
    await expect(aksam).toBeVisible()
    await expect(aksam).toBeFocused()
    await expect(page.locator('.aksam__kelimeler li .sonuc-kelime__okunan')).toHaveText([...KELIMELER])
    // Tek düğme (başlığın hoparlörü dışında); yazının yanında harita simgesi: sesli modda
    // düğme simgesinden tanınır.
    await expect(page.locator('main button:not(.hoparlor)')).toHaveText(['Haritaya dön'])
    await expect(page.locator('.aksam__dugme svg.simge')).toBeVisible()

    // Büyü hareketle anlatıldı: yay çizildi, bukalemun zıpladı.
    const kareler = (await hareketler(page)).join('\n')
    expect(kareler).toContain('strokeDashoffset')
    expect(kareler).toMatch(/translate\([-\d.]+px, [-\d.]+px\)/)
    expect(hatalar).toEqual([])
  })

  test('yanlış denemede bukalemun eğilip düşer, nedeni yazılır; ceza, puan ve süre yok', async ({
    page,
  }) => {
    await hareketleriKaydet(page)
    await koyuAc(page)
    const agizlarBasta = await agizlar(page)

    await bukalemun(page, 'ler').tap()
    await kart(page).tap()

    await expect(neden(page)).toContainText('a kalın, e ince. Kalınlıkları uyuşmuyor.')
    // İlgili iki ünlü etiketlenir: kalın a geniş, ince e dar.
    const etiketler = neden(page).locator('.unlu-etiketi')
    await expect(etiketler).toHaveText(['a', 'e'])
    await expect(etiketler.nth(0)).toHaveClass(/unlu-etiketi--kalin/)
    await expect(etiketler.nth(1)).toHaveClass(/unlu-etiketi--ince/)
    const [a, e] = await etiketler.evaluateAll((ogeler) => ogeler.map((o) => o.getBoundingClientRect().width))
    expect(a).toBeGreaterThan(e!)
    // Aday uymayan sonuçtur: renginden başka üstü de çizili (DESIGN.md, "Uymayan ek").
    const aday = neden(page).locator('.neden__aday')
    expect(await aday.evaluate((el) => getComputedStyle(el).textDecorationLine)).toBe('line-through')

    // -12 derece eğildi ve düştü; kıyıya döndü, yeniden seçilebilir.
    expect((await hareketler(page)).join('\n')).toContain('rotate(-12deg)')
    await expect(bukalemun(page, 'ler')).toBeVisible()
    await expect(bukalemun(page, 'ler')).toHaveAttribute('aria-disabled', 'false')
    await expect(bukalemun(page, 'ler')).toHaveAttribute('aria-pressed', 'false')
    await expect(page.getByText(/puan|süre|skor/i)).toHaveCount(0)
    expect(await agizlar(page)).toEqual(agizlarBasta)

    // Doğru bukalemunla görev biter; neden silinir, ağızlar yine aynı.
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await expect(neden(page)).toBeEmpty()
    await expect(kart(page)).toHaveAccessibleName('atlar')
    expect(await agizlar(page)).toEqual(agizlarBasta)
  })

  test('1. görev klavyeyle oynanır: Tab ve Enter', async ({ page }) => {
    await koyuAc(page)
    const lar = bukalemun(page, 'lar')
    for (let i = 0; i < 8 && !(await lar.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab')
    }
    await expect(lar).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(lar).toHaveAttribute('aria-pressed', 'true')
    // Seçilen bukalemun kelimeye götürülmeyi bekler: odak kelime kartında.
    await expect(kart(page)).toBeFocused()
    await page.keyboard.press('Enter')

    await expect(sonraki(page)).toBeFocused()
    await expect(kart(page)).toHaveAccessibleName('atlar')
    await page.keyboard.press('Enter')
    await expect(sira(page)).toHaveText('Görev 2 / 10')
    await expect(kart(page)).toHaveAccessibleName('ev')
  })

  test('1. görev sürükle-bırakla oynanır (Pointer Events)', async ({ page }) => {
    await koyuAc(page)
    const lar = bukalemun(page, 'lar')
    const ler = bukalemun(page, 'ler')

    // Kelimenin dışına bırakılan bukalemun yerine döner; taşıma sayılmaz.
    const lerKutusu = (await ler.boundingBox())!
    await page.mouse.move(lerKutusu.x + lerKutusu.width / 2, lerKutusu.y + lerKutusu.height / 2)
    await page.mouse.down()
    await page.mouse.move(lerKutusu.x + 20, lerKutusu.y - 120, { steps: 6 })
    await page.mouse.up()
    await expect(neden(page)).toBeEmpty()
    await expect(ler).toHaveAttribute('aria-pressed', 'false')
    await expect
      .poll(() => ler.evaluate((el) => el.getBoundingClientRect().top))
      .toBeCloseTo(lerKutusu.y, 0)

    const kaynak = (await lar.boundingBox())!
    const hedef = (await kart(page).boundingBox())!
    await page.mouse.move(kaynak.x + kaynak.width / 2, kaynak.y + kaynak.height / 2)
    await page.mouse.down()
    await page.mouse.move(hedef.x + hedef.width / 2, hedef.y + hedef.height / 2, { steps: 12 })
    await expect(kart(page)).toHaveClass(/kelime-karti--ustunde/)
    await page.mouse.up()

    await expect(sonraki(page)).toBeVisible()
    await expect(kart(page)).toHaveAccessibleName('atlar')
    await expect(page.locator('.koy__sahne .kelime-karti')).toHaveCount(3)
  })

  test('parmakla sürükle-bırak da çalışır (dokunma olayları)', async ({ page }) => {
    await koyuAc(page)
    const kaynak = (await bukalemun(page, 'lar').boundingBox())!
    const hedef = (await kart(page).boundingBox())!
    const cdp = await page.context().newCDPSession(page)
    const dokun = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x, y }],
      })
    const bas = { x: kaynak.x + kaynak.width / 2, y: kaynak.y + kaynak.height / 2 }
    const son = { x: hedef.x + hedef.width / 2, y: hedef.y + hedef.height / 2 }
    await dokun('touchStart', bas.x, bas.y)
    for (let i = 1; i <= 10; i++) {
      await dokun('touchMove', bas.x + ((son.x - bas.x) * i) / 10, bas.y + ((son.y - bas.y) * i) / 10)
    }
    await dokun('touchEnd', son.x, son.y)

    await expect(sonraki(page)).toBeVisible()
    await expect(kart(page)).toHaveAccessibleName('atlar')
  })

  test.describe('hareket azaltma açıkken', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } })

    test('hiçbir hareket oynamaz; yalnız renk ve yazı değişir', async ({ page }) => {
      await hareketleriKaydet(page)
      await koyuAc(page)
      const oynayan = () => page.evaluate(() => document.getAnimations().length)

      await bukalemun(page, 'lar').tap()
      expect(await bukalemun(page, 'lar').evaluate((el) => getComputedStyle(el).translate)).toBe('none')

      await bukalemun(page, 'ler').tap()
      await kart(page).tap()
      await expect(neden(page)).toContainText('Kalınlıkları uyuşmuyor.')
      expect(await oynayan()).toBe(0)

      await bukalemun(page, 'lar').tap()
      await kart(page).tap()
      await expect(sonraki(page)).toBeVisible()
      await expect(kart(page)).toHaveAccessibleName('atlar')
      await expect(page.locator('.koy__sahne .kelime-karti')).toHaveCount(3)
      expect(await oynayan()).toBe(0)
      expect(await hareketler(page)).toEqual([])
    })
  })

  test('telefonda taşmaz; dokunma alanları en az 44 px; ek yazısı 18 px\'ten küçük değil', async ({
    page,
  }) => {
    await koyuAc(page)
    for (const [en, boy] of [
      [412, 839],
      [360, 640],
      [320, 568],
    ] as const) {
      await page.setViewportSize({ width: en, height: boy })
      const etiket = `${en}×${boy}`
      expect(await yatayTasma(page), etiket).toBeLessThanOrEqual(0)

      const kucukler = await page.locator('main.koy button').evaluateAll((dugmeler) =>
        dugmeler
          .map((d) => d.getBoundingClientRect())
          .filter((k) => k.width < 44 || k.height < 44)
          .map((k) => `${k.width}×${k.height}`),
      )
      expect(kucukler, etiket).toEqual([])

      const ekYazilari = await page.locator('.kiyi .bukalemun').evaluateAll((svgler) =>
        svgler.map((svg) => {
          const olcek = svg.clientWidth / (svg as SVGSVGElement).viewBox.baseVal.width
          return parseFloat(getComputedStyle(svg.querySelector('text')!).fontSize) * olcek
        }),
      )
      expect(Math.min(...ekYazilari), etiket).toBeGreaterThanOrEqual(18)

      // 360×640'ta kaydırmadan: kelime, bütün bukalemunlar ve cep ekranda.
      if (en >= 360) {
        await expect(kart(page), etiket).toBeInViewport({ ratio: 1 })
        for (const oge of await page.locator('.kiyi__bukalemun').all()) {
          await expect(oge, etiket).toBeInViewport({ ratio: 1 })
        }
        await expect(page.locator('.cep'), etiket).toBeInViewport({ ratio: 1 })
      }
    }
  })

  test('Harita düğmesi haritaya döner; dış sunucuya istek gitmez', async ({ page, baseURL }) => {
    const disIstekler = disIstekleriTopla(page, baseURL)
    await koyuAc(page)
    await expect(haritaDugmesi(page)).toHaveAccessibleName('Harita')
    await haritaDugmesi(page).click()
    await expect(haritaBasligi(page)).toBeVisible()
    await page.waitForLoadState('networkidle')
    expect(disIstekler).toEqual([])
  })
})
