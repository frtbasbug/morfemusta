import { expect, test, type Page } from '@playwright/test'
import { ANAHTAR, bolge, bukalemun, haritaBasligi, kart, koyBasligi, sonraki, dugmeyleOyna } from './yardimcilar.ts'

// Bu dosyadaki testler Düğmeyle ayarında koşar (yardimcilar.ts, dugmeyleOyna).
test.beforeEach(({ page }) => dugmeyleOyna(page))

// Çevrim dışı ve güncelleme (DESIGN.md, "Cihazda ilerleme"): bir kez açılan oyun uçak modunda da
// açılır ve oynanır; bir kez girilmiş bölgenin sesleri de çalar. Yeni sürüm açık sayfayı
// yenilemez, bozmaz: o açılışta eski sürüm sürer, yeni sürüm bir sonraki açılışta devreye girer.

/** Service worker sayfayı denetleyene kadar bekler. */
async function denetlenene(sayfa: Page) {
  await sayfa.evaluate(() => navigator.serviceWorker.ready)
  await sayfa.waitForFunction(() => navigator.serviceWorker.controller !== null)
}

/** Çalınan seslerin metni (data-metin); play sarılır, ses gerçekten çalmaz. */
function calmalariKaydet(sayfa: Page) {
  return sayfa.addInitScript(() => {
    const kayit: string[] = []
    ;(window as unknown as { calinanlar: string[] }).calinanlar = kayit
    HTMLMediaElement.prototype.play = function () {
      const metin = this.dataset.metin
      if (metin) kayit.push(metin)
      setTimeout(() => this.dispatchEvent(new Event('ended')), 0)
      return Promise.resolve()
    }
  })
}
const calinanlar = (sayfa: Page) =>
  sayfa.evaluate(() => [...(window as unknown as { calinanlar: string[] }).calinanlar])

test.describe('çevrim dışı', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('bir kez açılan oyun uçak modunda açılır; Koy oynanır, resmi ve sesi gelir', async ({
    page,
    context,
  }) => {
    await calmalariKaydet(page)
    await page.goto('./')
    await denetlenene(page)

    await context.setOffline(true)
    await page.reload()
    await expect(haritaBasligi(page)).toBeVisible()
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(koyBasligi(page)).toBeVisible()
    const resim = kart(page).locator('img.kok-resmi')
    await expect(resim).toBeVisible()
    await expect.poll(() => resim.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
    await page.getByRole('button', { name: 'Dinle: at' }).tap()
    await expect.poll(() => calinanlar(page)).toEqual(['at'])
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    await page.getByRole('button', { name: 'Dinle: atlar' }).tap()
    await expect.poll(() => calinanlar(page)).toEqual(['at', 'atlar'])
  })

  test('bir kez girilmiş bölgenin sesleri uçak modunda da çalar', async ({ page, context }) => {
    await calmalariKaydet(page)
    await page.goto('./')
    await denetlenene(page)
    // Koy bitmiş: dükkân açık. Dükkâna girilince sesleri arka planda iner.
    const bitti = { bitenler: Array.from({ length: 10 }, (_, i) => i + 1), kaldigi: 10 }
    await page.evaluate(
      ([anahtar, kayit]) => localStorage.setItem(anahtar, kayit),
      [ANAHTAR, JSON.stringify({ bolgeler: { koy: bitti } })] as const,
    )
    await page.reload()
    await bolge(page, "Fıstıkçı Şahap'ın Dükkânı").tap()
    await expect(page.getByRole('heading', { level: 1, name: "Fıstıkçı Şahap'ın Dükkânı" })).toBeVisible()
    await expect
      .poll(
        () =>
          page.evaluate(async () => (await (await caches.open('morfemusta-ses')).keys()).length),
        { timeout: 20_000 },
      )
      .toBeGreaterThan(30)

    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: "Fıstıkçı Şahap'ın Dükkânı" })).toBeVisible()
    await page.getByRole('button', { name: 'Dinle: kitap' }).tap()
    await expect.poll(() => calinanlar(page)).toEqual(['kitap'])
  })
})

test.describe('güncelleme', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('yeni sürüm gelince açık sayfa yenilenmez, eski sürümle sürer; yeni sürüm bir sonraki açılışta devreye girer', async ({
    page,
    context,
  }) => {
    await page.goto('./')
    await denetlenene(page)
    await page.evaluate(() => {
      const w = window as unknown as { ilkAcilis: boolean; degisim: number }
      w.ilkAcilis = true
      w.degisim = 0
      navigator.serviceWorker.addEventListener('controllerchange', () => w.degisim++)
    })

    // Yeni sürüm: aynı kapsamda başka adresli bir service worker (yeni betik) kurulur.
    await page.evaluate(async () => {
      const kayit = await navigator.serviceWorker.getRegistration()
      if (!kayit) throw new Error('kayıt yok')
      await navigator.serviceWorker.register('sw.js?surum=yeni', { scope: kayit.scope })
    })
    await expect
      .poll(() =>
        page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting?.scriptURL ?? ''),
      )
      .toContain('surum=yeni')

    // Açık sayfa eski sürümle sürer: yenilenmedi, denetleyicisi değişmedi; oyun oynanır.
    await bolge(page, 'Bukalemun Koyu').tap()
    await bukalemun(page, 'lar').tap()
    await kart(page).tap()
    await expect(sonraki(page)).toBeVisible()
    expect(
      await page.evaluate(() => {
        const w = window as unknown as { ilkAcilis: boolean; degisim: number }
        return {
          ilkAcilis: w.ilkAcilis,
          degisim: w.degisim,
          denetleyici: navigator.serviceWorker.controller?.scriptURL ?? '',
        }
      }),
    ).toEqual({ ilkAcilis: true, degisim: 0, denetleyici: expect.not.stringContaining('surum=yeni') })

    // Sayfa kapanınca yeni sürüm devreye girer; bir sonraki açılış onunla.
    const kapsam = new URL('./', page.url()).href
    await page.close()
    const disarida = await context.newPage()
    await disarida.goto(new URL('/', kapsam).href)
    await expect
      .poll(() =>
        disarida.evaluate(
          async (k) => (await navigator.serviceWorker.getRegistration(k))?.active?.scriptURL ?? '',
          kapsam,
        ),
      )
      .toContain('surum=yeni')
    const yeni = await context.newPage()
    await yeni.goto('./')
    await expect(haritaBasligi(yeni)).toBeVisible()
    expect(await yeni.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? '')).toContain(
      'surum=yeni',
    )
  })
})

test.describe('eski adres (/morfemusta/)', () => {
  // Service worker kaydının kaldırılması birim testinde (src/kabuk/eskiAdres.test.ts): eski taban
  // artık sunulmadığı için burada eski adreste service worker kurulamaz (betiği 404). Önbellekler
  // ve depo origin'e bağlıdır; burada kurulur.
  test('yeni adres açılınca eski adresin önbellekleri kalkar; günlük kalır', async ({ page }) => {
    await page.goto('./')
    await expect(haritaBasligi(page)).toBeVisible()
    await denetlenene(page)
    await page.evaluate(async () => {
      const eski = await caches.open(`workbox-precache-v2-${location.origin}/morfemusta/`)
      await eski.put('/morfemusta/index.html', new Response('eski'))
      const sesler = await caches.open('morfemusta-ses')
      await sesler.put('/morfemusta/ses/eski.mp3?v=1', new Response('eski'))
      await sesler.put('/ekle-bakalim/ses/yeni.mp3?v=1', new Response('yeni'))
      // Origin ve anahtarlar aynı (morfemusta.*): eski adresin pilot günlüğü yeni adreste okunur.
      localStorage.setItem('morfemusta.pilot.v1', JSON.stringify({ cocuk: 'P09', satirlar: [] }))
    })

    await page.reload()
    await expect(haritaBasligi(page)).toBeVisible()
    await expect
      .poll(() => page.evaluate(async () => (await caches.keys()).filter((ad) => ad.includes('/morfemusta/'))))
      .toEqual([])
    // Yeni adresin ön belleği kalır.
    expect(
      await page.evaluate(async () => (await caches.keys()).some((ad) => ad.includes('/ekle-bakalim/'))),
    ).toBe(true)
    await expect
      .poll(() =>
        page.evaluate(async () =>
          (await (await caches.open('morfemusta-ses')).keys()).map((i) => new URL(i.url).pathname),
        ),
      )
      .toEqual(['/ekle-bakalim/ses/yeni.mp3'])
    expect(
      await page.evaluate(async () =>
        (await navigator.serviceWorker.getRegistrations()).map((k) => new URL(k.scope).pathname),
      ),
    ).toEqual(['/ekle-bakalim/'])
    await page.goto('pilot.html')
    await expect(page.locator('strong[data-cocuk]')).toHaveText('P09')
  })
})
