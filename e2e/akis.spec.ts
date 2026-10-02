import { expect, test, type Page } from '@playwright/test'
import {
  ANAHTAR,
  BAHCE_EKLERI,
  agac,
  bolge,
  bukalemun,
  dokun,
  dukkanKarti,
  gezinme,
  haritaBasligi,
  hatalariTopla,
  kart,
  karo,
  koyBasligi,
  secilebilir,
  sira,
  sonraki,
  yaratik,
} from './yardimcilar.ts'

// Akış ve puan (DESIGN.md, "Akış ve puan"): kendiliğinden geçiş, hız, puan ve yıldız, ilk dakika
// eli. Hız ölçümleri Chromium'da, hareket açıkken: doğru yerleştirmeden (son dokunuşun click
// olayı) sıradaki görevin ilk bukalemununun (karosunun) seçilebilir olmasına kadar, sayfanın
// içinde performance.now() ile.

const bir = (n: number) => Array.from({ length: n }, (_, i) => i + 1)
const BUTUN_ELLER = ['koy', 'dukkan', 'bahce', 'uyduruk']
const BAHCE_BITTI = {
  koy: { bitenler: bir(10), kaldigi: 10 },
  dukkan: { bitenler: bir(10), kaldigi: 10 },
  bahce: { bitenler: bir(10), kaldigi: 10 },
}

/** Kaydı ilk açılıştan önce bir kez kurar (sayfa yenilenince yeniden kurulmaz). */
function kayitKur(sayfa: Page, kayit: object) {
  return sayfa.addInitScript(
    ([anahtar, metin]) => {
      if (sessionStorage.getItem('kuruldu') !== null) return
      sessionStorage.setItem('kuruldu', 'evet')
      localStorage.setItem(anahtar!, metin!)
    },
    [ANAHTAR, JSON.stringify(kayit)] as const,
  )
}

const kayit = (sayfa: Page) =>
  sayfa.evaluate((anahtar) => JSON.parse(localStorage.getItem(anahtar) ?? 'null'), ANAHTAR)

const puan = (sayfa: Page) => sayfa.locator('.bolge-ustu__puan')
const el = (sayfa: Page) => sayfa.locator('.ilk-el')

/** Seçilebilir öğeler: kıyı, tezgâh, sepet. */
const SECILEBILIR = '.kiyi button, .tezgah button, .sepet button, .uyduruk__kiyi button'

/**
 * Hız ölçümü: hedefe (kelime kartı, yuva, ağaç, yaratık) son dokunuştan, sıradaki görevin
 * sırası görünüp ilk öğesi seçilebilir olana kadar geçen süre (ms). Ölçüm sayfanın içindedir.
 */
async function olcumuKur(sayfa: Page, hedef: string, sonrakiSira: string) {
  await sayfa.evaluate(
    ([hedefSecici, siraYazisi, secilebilir]) => {
      const w = window as unknown as { olcum: number | null; siradakiGoruldu: boolean }
      w.olcum = null
      w.siradakiGoruldu = false
      let t0 = 0
      document.addEventListener(
        'click',
        (olay) => {
          if (olay.target instanceof Element && olay.target.closest(hedefSecici!)) {
            t0 = performance.now()
          }
        },
        true,
      )
      const bak = () => {
        if ([...document.querySelectorAll('button')].some((b) => b.textContent?.includes('Sıradaki'))) {
          w.siradakiGoruldu = true
        }
        const yazi = document.querySelector('.bolge-ustu__sira')?.textContent ?? ''
        const ilk = document.querySelector(secilebilir!)
        if (t0 > 0 && yazi.includes(siraYazisi!) && ilk?.getAttribute('aria-disabled') === 'false') {
          w.olcum = performance.now() - t0
          return
        }
        requestAnimationFrame(bak)
      }
      requestAnimationFrame(bak)
    },
    [hedef, sonrakiSira, SECILEBILIR] as const,
  )
}

async function olcum(sayfa: Page): Promise<number> {
  const sure = await olcumBekle(sayfa)
  test.info().annotations.push({ type: 'süre', description: `${Math.round(sure)} ms` })
  console.log(`süre: ${Math.round(sure)} ms (${test.info().title})`)
  return sure
}

async function olcumBekle(sayfa: Page): Promise<number> {
  await expect
    .poll(() => sayfa.evaluate(() => (window as unknown as { olcum: number | null }).olcum), {
      timeout: 6000,
    })
    .not.toBeNull()
  return sayfa.evaluate(() => (window as unknown as { olcum: number }).olcum)
}

test.describe('kendiliğinden geçiş ve hız (hareket açık)', () => {
  test('Koy: Sıradaki düğmesi yok; doğrudan 1,5 saniyenin içinde sıradaki görev oynanabilir', async ({
    page,
  }) => {
    const hatalar = hatalariTopla(page)
    await kayitKur(page, { eller: BUTUN_ELLER })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await olcumuKur(page, 'button.kelime-karti', 'Görev 2 / 10')
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    const sure = await olcum(page)
    // Büyü sürerken ve görev bitince Sıradaki düğmesi hiç çıkmadı.
    expect(
      await page.evaluate(() => (window as unknown as { siradakiGoruldu: boolean }).siradakiGoruldu),
    ).toBe(false)
    expect(sure).toBeLessThanOrEqual(1500)
    // Kendiliğinden geliyor: dokunuşla değil, beklemeyle (1,4 saniye).
    expect(sure).toBeGreaterThanOrEqual(1300)
    // Yeni görev ekran okuyucuya duyurulur.
    await expect(page.locator('.koy__alt p.gizli[role="status"]')).toHaveText('Sıradaki görev: ev')
    expect(hatalar).toEqual([])
  })

  test('Koy: iyelikte (cebe girme) ve zincirde de 1,5 saniye', async ({ page }) => {
    await kayitKur(page, {
      eller: BUTUN_ELLER,
      bolgeler: { koy: { bitenler: bir(4), kaldigi: 4 } },
    })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(sira(page)).toHaveText('Görev 5 / 10')
    await olcumuKur(page, 'button.kelime-karti', 'Görev 6 / 10')
    await dokun(bukalemun(page, 'ım'))
    await dokun(kart(page))
    expect(await olcum(page)).toBeLessThanOrEqual(1500)
  })

  test('Dükkân: karo yuvaya oturur, taş jöleye erir; 1,5 saniyenin içinde sıradaki görev', async ({
    page,
  }) => {
    await kayitKur(page, { eller: BUTUN_ELLER, bolgeler: { koy: BAHCE_BITTI.koy } })
    await page.goto('./')
    await bolge(page, "Fıstıkçı Şahap'ın Dükkânı").tap()
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await olcumuKur(page, 'button.dukkan__kart', 'Görev 2 / 10')
    await dokun(karo(page, 'jöle'))
    await dokun(dukkanKarti(page))
    expect(await olcum(page)).toBeLessThanOrEqual(1500)
    expect(
      await page.evaluate(() => (window as unknown as { siradakiGoruldu: boolean }).siradakiGoruldu),
    ).toBe(false)
  })

  test('Bahçe: her ek ayrı yerleştirme; ağaç bitince 1,5 saniyenin içinde sıradaki ağaç', async ({
    page,
  }) => {
    await kayitKur(page, {
      eller: BUTUN_ELLER,
      bolgeler: { koy: BAHCE_BITTI.koy, dukkan: BAHCE_BITTI.dukkan },
    })
    await page.goto('./')
    await bolge(page, 'Kök Bahçesi').tap()
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await olcumuKur(page, 'button.bahce__agac', 'Görev 2 / 10')
    for (const yuzey of BAHCE_EKLERI[0]) {
      await secilebilir(bukalemun(page, yuzey))
      await dokun(bukalemun(page, yuzey))
      await dokun(agac(page))
    }
    expect(await olcum(page)).toBeLessThanOrEqual(1500)
    // İki ek, ikisi de ilk denemede: 20.
    await expect(puan(page)).toHaveText('Puan: 20')
  })

  test('Uydurukçuklar: sınır adımında (karo, cebe girme) 1,5 saniyenin içinde sıradaki görev', async ({
    page,
  }) => {
    await kayitKur(page, {
      eller: BUTUN_ELLER,
      bolgeler: { ...BAHCE_BITTI, uyduruk: { bitenler: bir(3), kaldigi: 3 } },
    })
    await page.goto('./')
    await bolge(page, 'Uydurukçuklar').tap()
    await expect(sira(page)).toHaveText('1. tur · Görev 4 / 10')
    await olcumuKur(page, 'button.uyduruk__hedef', 'Görev 5 / 10')
    await secilebilir(bukalemun(page, 'ım'))
    await dokun(bukalemun(page, 'ım'))
    await dokun(yaratik(page))
    await secilebilir(karo(page, 'jöle'))
    await dokun(karo(page, 'jöle'))
    await dokun(yaratik(page))
    expect(await olcum(page)).toBeLessThanOrEqual(1500)
    // Bukalemun ve karo: iki yerleştirme, ikisi de ilk deneme.
    await expect(puan(page)).toHaveText('Puan: 20')
  })

  test('büyü sürerken ekrana dokunan hemen geçer, ses de susar', async ({ page }) => {
    await kayitKur(page, { eller: BUTUN_ELLER, ayarlar: { ses: 'sesli' } })
    await page.addInitScript(() => {
      const kayit: string[] = []
      ;(window as unknown as { duranlar: string[] }).duranlar = kayit
      const durdur = HTMLMediaElement.prototype.pause
      HTMLMediaElement.prototype.pause = function () {
        kayit.push(this.dataset.metin ?? '')
        durdur.call(this)
      }
    })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await olcumuKur(page, 'button.kelime-karti', 'Görev 2 / 10')
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    const once = await page.evaluate(
      () => (window as unknown as { duranlar: string[] }).duranlar.length,
    )
    await page.locator('.bolge-ustu__baslik').tap()
    // Dokunuş, 1,4 saniyelik beklemeden çok önce geçirir.
    expect(await olcum(page)).toBeLessThan(1000)
    await expect(sira(page)).toHaveText('Görev 2 / 10')
    // Dokunuş sesi susturdu (sus: <audio> durdu).
    expect(
      await page.evaluate(() => (window as unknown as { duranlar: string[] }).duranlar.length),
    ).toBeGreaterThan(once)
  })

  test('yanlışta geçiş yok: neden cümlesi durur, çocuk yeniden dener; puan düşmez', async ({ page }) => {
    await kayitKur(page, { eller: BUTUN_ELLER })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(puan(page)).toHaveText('Puan: 0')
    await dokun(bukalemun(page, 'ler'))
    await dokun(kart(page))
    await expect(page.locator('.neden__cumle')).toBeVisible()
    await page.waitForTimeout(2500)
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await expect(page.locator('.neden__cumle')).toBeVisible()
    await expect(puan(page)).toHaveText('Puan: 0')
    // Yeniden denemede doğru: +5 (ilk deneme değil); sonra görev kendiliğinden geçer.
    await secilebilir(bukalemun(page, 'lar'))
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    await expect(puan(page)).toHaveText('Puan: 5')
    await expect(sira(page)).toHaveText('Görev 2 / 10')
  })

  test('üst üste üç ilk denemede doğru: +5 ve şenlik (parıltı ve efekt)', async ({ page }) => {
    await kayitKur(page, { eller: BUTUN_ELLER })
    await page.addInitScript(() => {
      const frekanslar: number[] = []
      ;(window as unknown as { frekanslar: number[] }).frekanslar = frekanslar
      const baslat = OscillatorNode.prototype.start
      OscillatorNode.prototype.start = function (zaman?: number) {
        frekanslar.push(Math.round(this.frequency.value))
        return baslat.call(this, zaman)
      }
    })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    const parilti = page.waitForFunction(() =>
      [...document.querySelectorAll('.parilti')].some((p) => {
        const puanKutusu = document.querySelector('.bolge-ustu__puan')?.getBoundingClientRect()
        const kutu = p.getBoundingClientRect()
        return puanKutusu !== undefined && Math.abs(kutu.left - puanKutusu.left) < 1
      }),
    )
    for (const [yer, yuzey] of [
      [1, 'lar'],
      [2, 'ler'],
      [3, 'lar'],
    ] as const) {
      await expect(sira(page)).toHaveText(`Görev ${yer} / 10`)
      await secilebilir(bukalemun(page, yuzey))
      await dokun(bukalemun(page, yuzey))
      await dokun(kart(page))
      await expect(puan(page)).toHaveText(`Puan: ${yer === 3 ? 35 : yer * 10}`)
    }
    await parilti
    // Şenliğin üçlüsü (E6 G6 C7) çaldı.
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { frekanslar: number[] }).frekanslar))
      .toEqual(expect.arrayContaining([1319, 1568, 2093]))
  })

  test('son görevden sonra akşam ekranı kendiliğinden açılır: puan ve yıldızlar', async ({ page }) => {
    // 9 görevin 8'i ilk denemede (9 yerleştirmeden): son görevin iki adımı da ilk denemede olunca
    // 10 / 11 ilk deneme, %90'ın üstü: 3 yıldız.
    await kayitKur(page, {
      eller: BUTUN_ELLER,
      bolgeler: {
        koy: { bitenler: bir(9), kaldigi: 9, tur: { puan: 85, ilk: 8, yer: 9, seri: 0 } },
      },
    })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(sira(page)).toHaveText('Görev 10 / 10')
    await expect(puan(page)).toHaveText('Puan: 85')
    for (const yuzey of ['lar', 'ım']) {
      await secilebilir(bukalemun(page, yuzey))
      await dokun(bukalemun(page, yuzey))
      await dokun(kart(page))
    }
    await expect(sonraki(page)).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1, name: 'Koyda akşam oldu' })).toBeVisible()
    // 85 + 10 + 10 (seri ikinci adımda tamamlanmadı: 8. görevden beri 2) = 105.
    await expect(page.locator('.aksam__puan')).toContainText('Puan: 105')
    await expect(page.getByRole('img', { name: '3 yıldızdan 3' })).toBeVisible()
    // Kayıtta: bölgenin en iyi yıldızı; turun puanı kalktı (sonraki tur 0'dan).
    const k = await kayit(page)
    expect(k.bolgeler.koy.yildiz).toBe(3)
    expect(k.bolgeler.koy.tur).toBeUndefined()

    // Haritada bölgenin en iyi yıldızı.
    await page.getByRole('button', { name: 'Haritaya dön' }).tap()
    await expect(haritaBasligi(page)).toBeVisible()
    await expect(bolge(page, 'Bukalemun Koyu, Tamam, 3 yıldızdan 3')).toBeVisible()
    // Yeni tur 0'dan.
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await expect(puan(page)).toHaveText('Puan: 0')
  })

  test('akşam ekranında yıldız ilk deneme oranından: %60 iki, altı bir yıldız', async ({ page }) => {
    await kayitKur(page, {
      eller: BUTUN_ELLER,
      bolgeler: {
        koy: { bitenler: bir(9), kaldigi: 9, tur: { puan: 60, ilk: 5, yer: 9, seri: 0 } },
        dukkan: { bitenler: bir(9), kaldigi: 9, tur: { puan: 55, ilk: 2, yer: 9, seri: 0 } },
      },
    })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    for (const yuzey of ['lar', 'ım']) {
      await secilebilir(bukalemun(page, yuzey))
      await dokun(bukalemun(page, yuzey))
      await dokun(kart(page))
    }
    // 7 / 11 ilk deneme: %63, iki yıldız.
    await expect(page.getByRole('img', { name: '3 yıldızdan 2' })).toBeVisible()
    await page.getByRole('button', { name: 'Haritaya dön' }).tap()
    await bolge(page, "Fıstıkçı Şahap'ın Dükkânı").tap()
    await secilebilir(karo(page, 'taş'))
    await dokun(karo(page, 'taş'))
    await dokun(dukkanKarti(page))
    // 3 / 10 ilk deneme: bir yıldız.
    await expect(page.getByRole('img', { name: '3 yıldızdan 1' })).toBeVisible()
    await page.getByRole('button', { name: 'Haritaya dön' }).tap()
    await expect(bolge(page, 'Bukalemun Koyu, Tamam, 3 yıldızdan 2')).toBeVisible()
    await expect(bolge(page, "Fıstıkçı Şahap'ın Dükkânı, Tamam, 3 yıldızdan 1")).toBeVisible()
  })

  test('Düğmeyle: Sıradaki düğmesi döner, görev kendiliğinden geçmez', async ({ page }) => {
    await kayitKur(page, { eller: BUTUN_ELLER })
    await page.goto('./')
    await gezinme(page, 'Ayarlar').tap()
    const grup = page.getByRole('group', { name: 'Sıradaki görev' })
    await expect(grup.getByRole('radio', { name: 'Kendiliğinden' })).toBeChecked()
    await grup.getByText('Düğmeyle').tap()
    await expect(grup.getByRole('radio', { name: 'Düğmeyle' })).toBeChecked()
    expect((await kayit(page)).ayarlar.gecis).toBe('dugmeyle')
    await gezinme(page, 'Harita').tap()
    await bolge(page, 'Bukalemun Koyu').tap()
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    await expect(sonraki(page)).toBeVisible()
    await page.waitForTimeout(2000)
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    // Ekrana dokunmak geçirmez; yalnız düğme.
    await page.locator('.bolge-ustu__baslik').tap()
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await dokun(sonraki(page))
    await expect(sira(page)).toHaveText('Görev 2 / 10')
  })

  test('görev bitmişken başka sekmede ayar değişirse geçiş yeniden kurulur', async ({ context }) => {
    const a = await context.newPage()
    const b = await context.newPage()
    await kayitKur(a, { eller: BUTUN_ELLER, ayarlar: { gecis: 'dugmeyle' } })
    await a.goto('./')
    await bolge(a, 'Bukalemun Koyu').tap()
    await dokun(bukalemun(a, 'lar'))
    await dokun(kart(a))
    await expect(sonraki(a)).toBeVisible()
    // B Kendiliğinden'e geçirir: A'da düğme kalkar, görev kendiliğinden geçer.
    await b.goto('./#/ayarlar')
    await b.getByRole('group', { name: 'Sıradaki görev' }).getByText('Kendiliğinden').tap()
    await expect(sira(a)).toHaveText('Görev 2 / 10')
    await expect(sonraki(a)).toHaveCount(0)
    // Ters yön: görev bitmişken Düğmeyle'ye geçilince kendiliğinden geçmez, düğme döner.
    await dokun(bukalemun(a, 'ler'))
    await dokun(kart(a))
    await b.getByRole('group', { name: 'Sıradaki görev' }).getByText('Düğmeyle').tap()
    await expect(sonraki(a)).toBeVisible()
    await a.waitForTimeout(2000)
    await expect(sira(a)).toHaveText('Görev 2 / 10')
    await dokun(sonraki(a))
    await expect(sira(a)).toHaveText('Görev 3 / 10')
  })

  test('sınıf modunda varsayılan Düğmeyle; olağan modun seçimi ayrı', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 })
    await page.goto('./?sinif=1#/ayarlar')
    const grup = page.getByRole('group', { name: 'Sıradaki görev' })
    await expect(grup.getByRole('radio', { name: 'Düğmeyle' })).toBeChecked()
    await gezinme(page, 'Harita').click()
    await bolge(page, 'Bukalemun Koyu').click()
    await bukalemun(page, 'lar').click()
    await kart(page).click()
    await expect(sonraki(page)).toBeVisible()
    // Sınıf modunda puan görünür ama kaydedilmez.
    await expect(puan(page)).toHaveText('Puan: 10')
    await sonraki(page).click()
    const k = await kayit(page)
    expect(k.bolgeler ?? {}).toEqual({})
    expect(k.ayarlar.gecis).toBe('kendiliginden')
  })
})

test.describe('sesli mod', () => {
  test('kurulan kelimenin sesi bitmeden sıradaki görev gelmez', async ({ page }) => {
    await kayitKur(page, { eller: BUTUN_ELLER, ayarlar: { ses: 'sesli' } })
    // Çalma yakalanır: atlar'ın sesi test bitirene kadar sürer, ötekiler hemen biter.
    await page.addInitScript(() => {
      let suren: HTMLMediaElement | null = null
      ;(window as unknown as { sesiBitir: () => boolean }).sesiBitir = () => {
        if (!suren) return false
        suren.dispatchEvent(new Event('ended'))
        suren = null
        return true
      }
      HTMLMediaElement.prototype.play = function () {
        if (this.dataset.metin === 'atlar') suren = this
        else setTimeout(() => this.dispatchEvent(new Event('ended')), 0)
        return Promise.resolve()
      }
    })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(koyBasligi(page)).toBeVisible()
    await secilebilir(bukalemun(page, 'ler'))
    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    await expect(page.locator('main.koy')).toHaveAttribute('data-evre', 'bitti')
    // Ses sürüyor: 1,4 saniye geçse de görev değişmez.
    await page.waitForTimeout(2500)
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    expect(await page.evaluate(() => (window as unknown as { sesiBitir: () => boolean }).sesiBitir())).toBe(true)
    await expect(sira(page)).toHaveText('Görev 2 / 10', { timeout: 1000 })
  })
})

test.describe('ilk dakika eli', () => {
  test('Koy: el ilk görevde çıkar, hamleyi gösterip kaybolur; doğrudan sonra çıkmaz, kayda yazılır', async ({
    page,
  }) => {
    test.setTimeout(60_000)
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(el(page)).toHaveCount(1, { timeout: 3000 })
    await expect(el(page)).toHaveAttribute('aria-hidden', 'true')
    // El kaynağın (ilk bukalemun) üstünden yola çıkar, bırakmadan kaybolur.
    await expect(el(page)).toHaveCount(0, { timeout: 3000 })
    await expect(sira(page)).toHaveText('Görev 1 / 10')
    await expect(page.locator('main.koy')).toHaveAttribute('data-evre', 'secim')

    await dokun(bukalemun(page, 'lar'))
    await dokun(kart(page))
    await expect(sira(page)).toHaveText('Görev 2 / 10')
    expect((await kayit(page)).eller).toEqual(['koy'])
    // Doğrudan sonra, 8 saniye beklense de el çıkmaz.
    await page.waitForTimeout(9000)
    await expect(el(page)).toHaveCount(0)
  })

  test('açılışta el çıkmadan dokunulursa el hemen çıkmaz, 8 saniye beklenir', async ({ page }) => {
    test.setTimeout(60_000)
    await page.goto('./')
    // El belgeye eklenirse (kısa sürse de) yakalanır.
    await page.evaluate(() => {
      const w = window as unknown as { elGoruldu: boolean }
      w.elGoruldu = false
      new MutationObserver(() => {
        if (document.querySelector('.ilk-el')) w.elGoruldu = true
      }).observe(document.body, { childList: true })
    })
    await bolge(page, 'Bukalemun Koyu').tap()
    // Elin ilk gösteriminden (600 ms) önce başlığa dokunulur.
    await page.locator('.bolge-ustu__baslik').tap()
    const dokunuldu = Date.now()
    await page.waitForTimeout(3000)
    expect(
      await page.evaluate(() => (window as unknown as { elGoruldu: boolean }).elGoruldu),
    ).toBe(false)
    await expect(el(page)).toHaveCount(1, { timeout: 10_000 })
    expect(Date.now() - dokunuldu).toBeGreaterThan(7000)
  })

  test('Koy: ilk üç görevde 8 saniye hiçbir şeye dokunulmazsa el yeniden çıkar', async ({ page }) => {
    test.setTimeout(60_000)
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect(el(page)).toHaveCount(1, { timeout: 3000 })
    await expect(el(page)).toHaveCount(0, { timeout: 3000 })
    const kayboldu = Date.now()
    await expect(el(page)).toHaveCount(1, { timeout: 10_000 })
    const bekleme = Date.now() - kayboldu
    expect(bekleme).toBeGreaterThan(7000)
    // Dokunuş eli hemen kaldırır, bekleme baştan.
    await page.locator('.bolge-ustu__baslik').tap()
    await expect(el(page)).toHaveCount(0)
  })

  for (const { ad, kayit: bolgeler, kaynak } of [
    { ad: "Fıstıkçı Şahap'ın Dükkânı", kayit: { koy: BAHCE_BITTI.koy }, kaynak: '.tezgah button' },
    {
      ad: 'Kök Bahçesi',
      kayit: { koy: BAHCE_BITTI.koy, dukkan: BAHCE_BITTI.dukkan },
      kaynak: '.sepet button',
    },
    { ad: 'Uydurukçuklar', kayit: BAHCE_BITTI, kaynak: '.uyduruk__kiyi button' },
  ]) {
    test(`${ad}: el ilk görevde ilk öğeyi hedefe doğru götürür`, async ({ page }) => {
      await kayitKur(page, { bolgeler })
      await page.goto('./')
      await bolge(page, ad).tap()
      await expect(el(page)).toHaveCount(1, { timeout: 3000 })
      // El ilk öğenin üstünden başlar.
      const ilk = await page.locator(kaynak).first().boundingBox()
      const kutu = await el(page).boundingBox()
      expect(ilk && kutu && Math.abs(kutu.width - ilk.width) < 2).toBe(true)
      await expect(el(page)).toHaveCount(0, { timeout: 3000 })
    })
  }

  test('sesli modda el çıkarken bölgenin cümlesi söylenir', async ({ page }) => {
    await kayitKur(page, { ayarlar: { ses: 'sesli' } })
    await page.addInitScript(() => {
      const kayit: string[] = []
      ;(window as unknown as { calinanlar: string[] }).calinanlar = kayit
      HTMLMediaElement.prototype.play = function () {
        if (this.dataset.metin) kayit.push(this.dataset.metin)
        setTimeout(() => this.dispatchEvent(new Event('ended')), 0)
        return Promise.resolve()
      }
    })
    await page.goto('./')
    await bolge(page, 'Bukalemun Koyu').tap()
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { calinanlar: string[] }).calinanlar))
      .toEqual(['Bukalemun Koyu', 'at', 'Bir bukalemunu kelimeye taşı!'])
  })

  test.describe('hareket azaltma', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } })

    test('el kıpırdamadan durur, sonra kalkar', async ({ page }) => {
      await page.goto('./')
      await bolge(page, 'Bukalemun Koyu').tap()
      await expect(el(page)).toHaveCount(1, { timeout: 3000 })
      expect(await el(page).evaluate((oge) => oge.getAnimations().length)).toBe(0)
      const ilk = await page.locator('.kiyi button').first().boundingBox()
      const kutu = await el(page).boundingBox()
      expect(kutu?.x).toBeCloseTo(ilk?.x ?? 0, 0)
      await expect(el(page)).toHaveCount(0, { timeout: 4000 })
    })
  })
})
