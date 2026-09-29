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

  test('10 görev biter: akşam ekranında bugünün kelimeleri; haritada koy tamam, dükkân hazırlanıyor', async ({
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
    await expect(page.getByRole('button')).toHaveText(['Haritaya dön'])
    await expect(page.getByText(/puan|seri|süre|skor/i)).toHaveCount(0)

    await page.getByRole('button', { name: 'Haritaya dön' }).click()
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(bolge(page, 'Bukalemun Koyu')).toHaveAccessibleName('Bukalemun Koyu, Tamam')
    await expect(bolge(page, 'Dükkânı')).toHaveAccessibleName(
      "Fıstıkçı Şahap'ın Dükkânı, Hazırlanıyor",
    )
    await expect(bolge(page, 'Kök Bahçesi')).toHaveAccessibleName('Kök Bahçesi, Kilitli')
    await bolge(page, 'Dükkânı').click()
    await expect(ileti(page)).toHaveText('Burası hazırlanıyor. Yakında açılacak.')
    await bolge(page, 'Kök Bahçesi').click()
    await expect(ileti(page)).toHaveText("Önce Fıstıkçı Şahap'ın Dükkânı bitmeli.")

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

    // Kayıtta ilerleme ve kart kalmadı; ayarlar kaldı.
    expect(await kayit(page)).toEqual({
      bolgeler: {},
      kartlar: [],
      ayarlar: { hareket: 'sistem', renkler: 'renksiz' },
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
