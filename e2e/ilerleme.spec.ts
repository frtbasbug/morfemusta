import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  ANAHTAR,
  KELIMELER,
  bolge,
  bukalemun,
  disIstekleriTopla,
  gezinme,
  gorevOyna,
  gorevleriOyna,
  haritaBasligi,
  haritaDugmesi,
  hatalariTopla,
  ileti,
  kart,
  koyBasligi,
  koyuAc,
  sira,
  sonraki,
} from './yardimcilar.ts'

// Cihazdaki ilerleme (localStorage, tek anahtar: morfemusta.v1), Sözlük kartları, akşam
// ekranı, ayarlar ve sıfırlama. Hızlı oynamak için hareket azaltma açıktır (büyü beklemez);
// ayarların sınandığı testte hareketi oyunun kendi Azalt ayarı keser.

const kartKelimeleri = (sayfa: Page) => sayfa.locator('.sozluk-karti__kelime')

const kayit = (sayfa: Page) =>
  sayfa.evaluate((anahtar) => {
    const metin = localStorage.getItem(anahtar)
    return metin === null ? null : JSON.parse(metin)
  }, ANAHTAR)

const degisken = (oge: Locator, ad: string) =>
  oge.evaluate((el, ad) => getComputedStyle(el).getPropertyValue(ad).trim().toLowerCase(), ad)

/** navigator.storage.persist() çağrılarını sayar (tarayıcının kararına bırakmadan). */
const kalicilikIsteginiKaydet = (sayfa: Page) =>
  sayfa.addInitScript(() => {
    const kayit: string[] = []
    ;(window as unknown as { kalicilik: string[] }).kalicilik = kayit
    if (!navigator.storage) return
    navigator.storage.persisted = async () => false
    navigator.storage.persist = async () => {
      kayit.push('persist')
      return true
    }
  })

test.describe('cihazda ilerleme (hareket azaltma açık)', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test("3 görev oynanır, sayfa yeniden yüklenir: 4. görevden sürer; Sözlük'te 3 kart", async ({
    page,
    baseURL,
  }) => {
    const hatalar = hatalariTopla(page)
    const disIstekler = disIstekleriTopla(page, baseURL)
    await kalicilikIsteginiKaydet(page)
    await koyuAc(page)

    // Her görev bitince kaydedilir: Sıradaki'ye basmadan önce de.
    await gorevOyna(page, 0)
    expect(await kayit(page)).toMatchObject({ bolgeler: { koy: { bitenler: [1], kaldigi: 1 } } })
    expect(await page.evaluate(() => (window as unknown as { kalicilik: string[] }).kalicilik)).toEqual([
      'persist',
    ])
    await sonraki(page).tap()
    await gorevleriOyna(page, 1, 2)
    await expect(sira(page)).toHaveText('Görev 4 / 10')

    await page.reload()
    await expect(koyBasligi(page)).toBeVisible()
    await expect(sira(page)).toHaveText('Görev 4 / 10')
    await expect(kart(page)).toHaveAccessibleName('göz')

    await haritaDugmesi(page).click()
    await gezinme(page, 'Sözlük').click()
    await expect(page.getByRole('heading', { level: 2, name: 'Bukalemun Koyu' })).toBeVisible()
    // En yeni kart önde; kartta kök ve ekler, bölge ve tarih.
    await expect(kartKelimeleri(page)).toHaveText(['kuşlar', 'evler', 'atlar'])
    const atlar = page.locator('.sozluk-karti').filter({ hasText: 'atlar' })
    // Kök ekran okuyucuya tek kelime okunur; görünende son ünlüsü etikette, ekin ünlüsü de.
    await expect(atlar.locator('.sozluk-karti__kok .kok-yazisi__okunan')).toHaveText('at')
    await expect(atlar.locator('.sozluk-karti__kok .unlu-etiketi')).toHaveText('a')
    await expect(atlar.locator('.ek-yazisi')).toHaveText('lar')
    await expect(atlar.locator('.ek-yazisi .unlu-etiketi')).toHaveText('a')
    await expect(atlar.locator('.sozluk-karti__kunye')).toContainText('Bukalemun Koyu')
    await expect(atlar.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}$/)

    // Tek anahtar; hiçbir veri cihazdan çıkmaz.
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([ANAHTAR])
    await page.waitForLoadState('networkidle')
    expect(disIstekler).toEqual([])
    expect(hatalar).toEqual([])
  })

  test('10 görev biter: akşam ekranında bugünün kelimeleri; haritada koy tamam, dükkân açılır', async ({
    page,
  }) => {
    test.setTimeout(90_000)
    await koyuAc(page)
    await gorevleriOyna(page, 0, 9)

    const aksam = page.getByRole('heading', { level: 1, name: 'Koyda akşam oldu' })
    await expect(aksam).toBeVisible()
    await expect(page.getByText('Bugün kurduğun kelimeler:')).toBeVisible()
    await expect(page.locator('.aksam__kelimeler .sonuc-kelime__okunan')).toHaveText([...KELIMELER])
    // Tek düğme; puan, seri ve süre yok.
    // Tek düğme (başlığın hoparlörü dışında); yazının yanında harita simgesi.
    await expect(page.locator('main button:not(.hoparlor)')).toHaveText(['Haritaya dön'])
    await expect(page.getByText(/puan|seri|süre|skor/i)).toHaveCount(0)

    await page.getByRole('button', { name: 'Haritaya dön' }).click()
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(bolge(page, 'Bukalemun Koyu')).toHaveAccessibleName('Bukalemun Koyu, Tamam')
    await expect(bolge(page, 'Dükkânı')).toHaveAccessibleName("Fıstıkçı Şahap'ın Dükkânı, Açık")
    await expect(bolge(page, 'Kök Bahçesi')).toHaveAccessibleName('Kök Bahçesi, Kilitli')
    await bolge(page, 'Kök Bahçesi').click()
    await expect(ileti(page)).toHaveText("Önce Fıstıkçı Şahap'ın Dükkânı bitmeli.")
    await bolge(page, 'Dükkânı').click()
    await expect(page.getByRole('heading', { level: 1, name: "Fıstıkçı Şahap'ın Dükkânı" })).toBeVisible()
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await page.goBack()
    await expect(haritaBasligi(page)).toBeVisible()

    // Tamam bölge yine oynanır: yeni tur baştan; koy tamam kalır.
    await page.reload()
    await expect(bolge(page, 'Bukalemun Koyu')).toHaveAccessibleName('Bukalemun Koyu, Tamam')
    await bolge(page, 'Bukalemun Koyu').click()
    await expect(sira(page)).toHaveText('Görev 1 / 10')
  })

  test('sıfırlama iki adımdır; Vazgeç bir şey silmez, Sil her şeyi başa alır', async ({
    page,
  }) => {
    page.on('dialog', (pencere) => {
      throw new Error(`Tarayıcı penceresi açıldı: ${pencere.message()}`)
    })
    await koyuAc(page)
    await gorevleriOyna(page, 0, 1)
    await haritaDugmesi(page).click()
    await gezinme(page, 'Ayarlar').click()
    await page.getByRole('radio', { name: 'Renksiz' }).check()

    const sifirla = page.getByRole('button', { name: 'İlerlemeyi sıfırla' })
    await sifirla.click()
    await expect(page.getByText('Bütün ilerleme ve kartlar silinecek.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Vazgeç' })).toBeFocused()
    await page.getByRole('button', { name: 'Vazgeç' }).click()
    await expect(page.getByText('Bütün ilerleme ve kartlar silinecek.')).toHaveCount(0)
    await gezinme(page, 'Sözlük').click()
    await expect(kartKelimeleri(page)).toHaveText(['evler', 'atlar'])

    await gezinme(page, 'Ayarlar').click()
    await sifirla.click()
    await page.getByRole('button', { name: 'Sil' }).click()
    await expect(page.getByRole('status').filter({ hasText: 'silindi' })).toHaveText(
      'İlerleme ve kartlar silindi.',
    )
    await expect(sifirla).toBeFocused()

    await gezinme(page, 'Sözlük').click()
    await expect(
      page.getByText('Sözlüğün henüz boş. Bir kelime kurunca kartı buraya gelir.'),
    ).toBeVisible()
    await gezinme(page, 'Harita').click()
    await expect(bolge(page, 'Bukalemun Koyu')).toHaveAccessibleName('Bukalemun Koyu, Açık')
    await expect(bolge(page, 'Dükkânı')).toHaveAccessibleName(/Kilitli$/)
    await bolge(page, 'Bukalemun Koyu').click()
    await expect(sira(page)).toHaveText('Görev 1 / 10')

    // Kayıtta ilerleme ve kart kalmadı; ayarlar kaldı. Sıfırlama kimliği bir arttı.
    expect(await kayit(page)).toEqual({
      bolgeler: {},
      kartlar: [],
      ayarlar: { hareket: 'sistem', renkler: 'renksiz', ses: 'dokununca', sinif: 'kapali' },
      kapananIpuclari: [],
      sifirlama: 1,
    })
  })

  test('localStorage hata atarken de oyun oynanır: ilerleme bellekte, konsol hatası yok', async ({
    page,
  }) => {
    const hatalar = hatalariTopla(page)
    await page.addInitScript(() => {
      const engelli = () => {
        throw new DOMException('Depoya erişim engelli', 'SecurityError')
      }
      Object.defineProperty(window, 'localStorage', { configurable: true, get: engelli })
      Storage.prototype.getItem = engelli
      Storage.prototype.setItem = engelli
    })
    await koyuAc(page)
    await gorevleriOyna(page, 0, 1)
    await expect(sira(page)).toHaveText('Görev 3 / 10')

    await haritaDugmesi(page).click()
    await gezinme(page, 'Sözlük').click()
    await expect(kartKelimeleri(page)).toHaveText(['evler', 'atlar'])
    await gezinme(page, 'Ayarlar').click()
    await page.getByRole('radio', { name: 'Renksiz' }).check()
    await expect(page.locator('html')).toHaveAttribute('data-renkler', 'renksiz')
    // Koya dönen çocuk bellekteki yerden sürer.
    await gezinme(page, 'Harita').click()
    await bolge(page, 'Bukalemun Koyu').click()
    await expect(sira(page)).toHaveText('Görev 3 / 10')
    expect(hatalar).toEqual([])
  })

  test('bozuk kayıt oyunu durdurmaz: baştan başlar, ilk görevde düzelir; dolu depo da', async ({
    page,
  }) => {
    const hatalar = hatalariTopla(page)
    await page.addInitScript((anahtar) => {
      if (sessionStorage.getItem('ilk') === null) {
        sessionStorage.setItem('ilk', 'evet')
        localStorage.setItem(anahtar, '{bozuk')
      }
    }, ANAHTAR)
    await page.goto('./')
    await expect(bolge(page, 'Bukalemun Koyu')).toHaveAccessibleName('Bukalemun Koyu, Açık')
    await bolge(page, 'Bukalemun Koyu').click()
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await gorevOyna(page, 0)
    expect(await kayit(page)).toMatchObject({ bolgeler: { koy: { kaldigi: 1 } } })

    // Depo dolu: yazılamaz, oyun yine sürer.
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('Depo dolu', 'QuotaExceededError')
      }
    })
    await sonraki(page).tap()
    await gorevOyna(page, 1)
    await sonraki(page).tap()
    await expect(sira(page)).toHaveText('Görev 3 / 10')
    expect(hatalar).toEqual([])
  })

  test('iki sekme aynı kaydı paylaşır: görevler, kartlar ve ayar korunur; değişiklik öteki sekmeye hemen yansır', async ({
    context,
  }) => {
    // B önce açılır (ör. tarayıcıdaki sekme) ve haritada bekler; A sonra açılır (ör. ana
    // ekrandaki uygulama).
    const b = await context.newPage()
    const a = await context.newPage()
    const hatalar = [hatalariTopla(a), hatalariTopla(b)]
    await b.goto('./')
    await expect(haritaBasligi(b)).toBeVisible()

    // A iki görev bitirir. B onları storage olayıyla alır: koy üçüncü görevden açılır. B bir
    // görev bitirir: üç görev ve kartları kalır.
    await koyuAc(a)
    await gorevleriOyna(a, 0, 1)
    await bolge(b, 'Bukalemun Koyu').click()
    await expect(sira(b)).toHaveText('Görev 3 / 10')
    await gorevOyna(b, 2)
    expect(await kayit(b)).toMatchObject({
      bolgeler: { koy: { bitenler: [1, 2, 3], kaldigi: 3 } },
      kartlar: [{ kelime: 'atlar' }, { kelime: 'evler' }, { kelime: 'kuşlar' }],
    })

    // A ayarı değiştirir; B'nin renkleri hemen değişir. B bir görev daha bitirir: ayar korunur.
    await haritaDugmesi(a).click()
    await gezinme(a, 'Ayarlar').click()
    await a.getByRole('radio', { name: 'Renksiz' }).check()
    await expect(b.locator('html')).toHaveAttribute('data-renkler', 'renksiz')
    await sonraki(b).tap()
    await gorevOyna(b, 3)
    expect(await kayit(b)).toMatchObject({
      bolgeler: { koy: { bitenler: [1, 2, 3, 4], kaldigi: 4 } },
      ayarlar: { hareket: 'sistem', renkler: 'renksiz' },
    })

    // B'nin kartları A'nın Sözlük'üne de yansır.
    await gezinme(a, 'Sözlük').click()
    await expect(kartKelimeleri(a)).toHaveText(['gözler', 'kuşlar', 'evler', 'atlar'])
    expect(hatalar.flat()).toEqual([])
  })

  test('bölge ekranı açıkken öteki sekme o bölgenin ilerlemesini değiştirirse ekran kalınan yerden, sıfırlarsa baştan açılır', async ({
    context,
  }) => {
    const a = await context.newPage()
    const b = await context.newPage()
    const hatalar = [hatalariTopla(a), hatalariTopla(b)]
    // A koyda iki görev bitirir, üçüncüde bekler.
    await koyuAc(a)
    await gorevleriOyna(a, 0, 1)
    await expect(sira(a)).toHaveText('Görev 3 / 10')

    // B üçüncü görevi bitirir: A'nın ekranı kalınan yerden, dördüncü görevden açılır.
    await koyuAc(b)
    await expect(sira(b)).toHaveText('Görev 3 / 10')
    await gorevOyna(b, 2)
    await expect(sira(a)).toHaveText('Görev 4 / 10')

    // B ilerlemeyi sıfırlar: A'nın ekranı baştan açılır. A'da biten görev yeni ilerlemenin ilkidir.
    await haritaDugmesi(b).click()
    await gezinme(b, 'Ayarlar').click()
    await b.getByRole('button', { name: 'İlerlemeyi sıfırla' }).click()
    await b.getByRole('button', { name: 'Sil' }).click()
    await expect(sira(a)).toHaveText('Görev 1 / 10')
    await gorevOyna(a, 0)
    expect(await kayit(a)).toMatchObject({
      bolgeler: { koy: { bitenler: [1], kaldigi: 1 } },
      kartlar: [{ kelime: 'atlar' }],
    })
    expect(hatalar.flat()).toEqual([])
  })

  test('sıfırlama geri alınmaz: A 5. görevdeyken B sıfırlar; A 5. görevi bitirince kayıt boş kalır, A baştan başlar', async ({
    context,
  }) => {
    const a = await context.newPage()
    const b = await context.newPage()
    const hatalar = [hatalariTopla(a), hatalariTopla(b)]
    // A'ya storage olayı ulaşmaz (ör. arka planda donmuş sekme): sıfırlamayı görmeden 5. görevde
    // kalır. Olay ulaşsaydı A'nın ekranı sıfırlanınca hemen baştan açılırdı (yukarıdaki test).
    await a.addInitScript(() => {
      window.addEventListener('storage', (olay) => olay.stopImmediatePropagation(), true)
    })
    await koyuAc(a)
    await gorevleriOyna(a, 0, 3)
    await expect(sira(a)).toHaveText('Görev 5 / 10')

    await b.goto('./')
    await gezinme(b, 'Ayarlar').click()
    await b.getByRole('button', { name: 'İlerlemeyi sıfırla' }).click()
    await b.getByRole('button', { name: 'Sil' }).click()
    const bos = {
      bolgeler: {},
      kartlar: [],
      ayarlar: { hareket: 'sistem', renkler: 'renkli', ses: 'dokununca', sinif: 'kapali' },
      kapananIpuclari: [],
      sifirlama: 1,
    }
    expect(await kayit(b)).toEqual(bos)

    // A 5. görevi (kız + ım) bitirir. Yazmadan önce sıfırlama kimliğini karşılaştırır: farklı,
    // hiçbir şey yazılmaz; ekran son kayıttan, baştan açılır.
    await bukalemun(a, 'ım').tap()
    await kart(a).tap()
    await expect(sira(a)).toHaveText('Görev 1 / 10')
    expect(await kayit(a)).toEqual(bos)
    expect(hatalar.flat()).toEqual([])
  })

  test('storage olayı ulaşmasa da (ör. arka planda donmuş sekme) eski sekme ötekinin görevlerini, kartlarını ve ayarını ezmez', async ({
    context,
  }) => {
    const b = await context.newPage()
    const a = await context.newPage()
    const hatalar = [hatalariTopla(a), hatalariTopla(b)]
    // B'ye storage olayı ulaşmaz: eski anlık görüntüde kalır.
    await b.addInitScript(() => {
      window.addEventListener('storage', (olay) => olay.stopImmediatePropagation(), true)
    })
    await b.goto('./')
    await expect(haritaBasligi(b)).toBeVisible()

    // A iki görev bitirir ve Renksiz'i seçer. B bunları görmez.
    await koyuAc(a)
    await gorevleriOyna(a, 0, 1)
    await haritaDugmesi(a).click()
    await gezinme(a, 'Ayarlar').click()
    await a.getByRole('radio', { name: 'Renksiz' }).check()
    await expect(b.locator('html')).toHaveAttribute('data-renkler', 'renkli')
    await bolge(b, 'Bukalemun Koyu').click()
    await expect(sira(b)).toHaveText('Görev 1 / 10')

    // B bir görev bitirir. Yazmadan önce son kaydı okur, değişikliği onun üstüne uygular:
    // A'nın görevleri, kartları ve Renksiz'i kalır; B de artık Renksiz'dir.
    await gorevOyna(b, 0)
    expect(await kayit(b)).toMatchObject({
      bolgeler: { koy: { bitenler: [1, 2] } },
      kartlar: [{ kelime: 'atlar' }, { kelime: 'evler' }],
      ayarlar: { hareket: 'sistem', renkler: 'renksiz' },
    })
    await expect(b.locator('html')).toHaveAttribute('data-renkler', 'renksiz')
    expect(hatalar.flat()).toEqual([])
  })

  test('storage olayı ulaşmayan sekme görünür olunca (visibilitychange) ve önbellekten dönünce (pageshow) kaydı yeniden okur', async ({
    context,
  }) => {
    const a = await context.newPage()
    const b = await context.newPage()
    const hatalar = [hatalariTopla(a), hatalariTopla(b)]
    // A'ya storage olayı ulaşmaz (arka planda donmuş sekme gibi).
    await a.addInitScript(() => {
      window.addEventListener('storage', (olay) => olay.stopImmediatePropagation(), true)
    })
    await a.goto('./#/sozluk')
    await expect(a.getByText('Sözlüğün henüz boş.', { exact: false })).toBeVisible()

    // B iki görev bitirir; A görmez.
    await koyuAc(b)
    await gorevleriOyna(b, 0, 1)
    await a.waitForTimeout(200)
    await expect(kartKelimeleri(a)).toHaveCount(0)

    // A görünür olur: kaydı yeniden okur, Sözlük'te iki kart.
    await a.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await expect(kartKelimeleri(a)).toHaveText(['evler', 'atlar'])

    // A'da koy açık; B bir görev daha bitirir. A önbellekten dönmüş gibi (pageshow): açık bölge
    // ekranı kalınan yerden açılır.
    await gezinme(a, 'Harita').click()
    await bolge(a, 'Bukalemun Koyu').click()
    await expect(sira(a)).toHaveText('Görev 3 / 10')
    await gorevOyna(b, 2)
    await a.waitForTimeout(200)
    await expect(sira(a)).toHaveText('Görev 3 / 10')
    await a.evaluate(() =>
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })),
    )
    await expect(sira(a)).toHaveText('Görev 4 / 10')
    expect(hatalar.flat()).toEqual([])
  })
})

test.describe("iOS Safari'de ana ekran ipucu", () => {
  test.use({
    contextOptions: { reducedMotion: 'reduce' },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  })

  const ipucu = (sayfa: Page) => sayfa.getByRole('note').filter({ hasText: 'İlerlemen silinmesin' })

  test('bir kez gösterilir: haritada küçük ipucu; kapatılınca bir daha çıkmaz', async ({ page }) => {
    await page.goto('./')
    await expect(ipucu(page)).toHaveText('İlerlemen silinmesin: Paylaş → Ana Ekrana Ekle.')
    // Harita ipucuyla da kaydırmadan sığar; bölgeler ipucunun altında kalmaz.
    await page.setViewportSize({ width: 375, height: 667 })
    expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(0)
    const ipucuKutusu = await ipucu(page).boundingBox()
    const koyKutusu = await bolge(page, 'Bukalemun Koyu').boundingBox()
    expect((koyKutusu?.y ?? 0) + (koyKutusu?.height ?? 0)).toBeLessThanOrEqual(ipucuKutusu?.y ?? 0)
    const kapat = page.getByRole('button', { name: 'İpucunu kapat' })
    const kapatKutusu = await kapat.boundingBox()
    expect(Math.min(kapatKutusu?.width ?? 0, kapatKutusu?.height ?? 0)).toBeGreaterThanOrEqual(44)

    await kapat.tap()
    await expect(ipucu(page)).toHaveCount(0)
    expect(await kayit(page)).toMatchObject({ kapananIpuclari: ['ana-ekran'] })
    await page.reload()
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(ipucu(page)).toHaveCount(0)
  })

  test('ana ekrandan açılınca ve sınıf modunda görünmez', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'standalone', { value: true })
    })
    await page.goto('./')
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(ipucu(page)).toHaveCount(0)
  })

  test('sınıf modunda görünmez', async ({ page }) => {
    await page.goto('./?sinif=1')
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(ipucu(page)).toHaveCount(0)
  })
})

test('Renksiz ve Azalt yeniden yüklemeden sonra yerinde; renkler büyüden sonra da gri, hiçbir şey kıpırdamaz', async ({
  page,
}) => {
  // Element.animate çağrılarını sayar: Azalt'ta hiç çağrılmamalı.
  await page.addInitScript(() => {
    const kayit: string[] = []
    ;(window as unknown as { hareketler: string[] }).hareketler = kayit
    const asil = Element.prototype.animate
    Element.prototype.animate = function (kareler, secenekler) {
      kayit.push(JSON.stringify(kareler))
      return asil.call(this, kareler, secenekler)
    }
  })
  await page.goto('./')
  await gezinme(page, 'Ayarlar').click()
  await expect(page.getByRole('radio', { name: 'Sistem gibi' })).toBeChecked()
  await expect(page.getByRole('radio', { name: 'Renkli' })).toBeChecked()
  await page.getByRole('radio', { name: 'Azalt' }).check()
  await page.getByRole('radio', { name: 'Renksiz' }).check()

  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Ayarlar' })).toBeVisible()
  await expect(page.getByRole('radio', { name: 'Azalt' })).toBeChecked()
  await expect(page.getByRole('radio', { name: 'Renksiz' })).toBeChecked()
  await expect(page.locator('html')).toHaveAttribute('data-hareket', 'azalt')
  await expect(page.locator('html')).toHaveAttribute('data-renkler', 'renksiz')

  await gezinme(page, 'Harita').click()
  await bolge(page, 'Bukalemun Koyu').click()
  const koy = page.locator('main.koy')
  await expect(koy).not.toHaveClass(/\brenksiz\b/)
  expect(await degisken(koy, '--kalin')).toBe('#8e8c99')
  expect(await degisken(koy, '--ince')).toBe('#8e8c99')

  await bukalemun(page, 'lar').tap()
  expect(await bukalemun(page, 'lar').evaluate((el) => getComputedStyle(el).translate)).toBe('none')
  await kart(page).tap()
  await expect(sonraki(page)).toBeVisible()
  // Büyüden sonra da gri: birleşen ek ve kıyıdaki bukalemunlar.
  expect(await degisken(koy, '--kalin')).toBe(await degisken(koy, '--ince'))
  const ek = kart(page).locator('.ek-yazisi')
  expect(await ek.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(142, 140, 153)')
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
  expect(await page.evaluate(() => (window as unknown as { hareketler: string[] }).hareketler)).toEqual(
    [],
  )
})
