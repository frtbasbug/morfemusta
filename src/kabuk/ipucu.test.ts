import { describe, expect, it } from 'vitest'
import {
  BOS_ILERLEME,
  ayarlariDegistir,
  ilerlemeyiSifirla,
  ipucunuKapat,
} from '../oyun/ilerleme.ts'
import { ANA_EKRAN_IPUCU, anaEkranIpucuGorunsunMu, iosSafariMi, type Cihaz } from './ipucu.ts'

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const IPAD_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1'
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'

const cihaz = (kullaniciAjani: string, ek: Partial<Cihaz> = {}): Cihaz => ({
  kullaniciAjani,
  dokunmaNoktasi: 5,
  anaEkranda: false,
  ...ek,
})

describe('iOS Safari', () => {
  it('iPhone Safari ve iPad Safari (kendini Mac gibi tanıtan, dokunmatik)', () => {
    expect(iosSafariMi(cihaz(IPHONE_SAFARI))).toBe(true)
    expect(iosSafariMi(cihaz(IPAD_SAFARI))).toBe(true)
  })

  it('Mac Safari (dokunmatik değil), iOS Chrome ve Android değil', () => {
    expect(iosSafariMi(cihaz(IPAD_SAFARI, { dokunmaNoktasi: 0 }))).toBe(false)
    expect(iosSafariMi(cihaz(IPHONE_CHROME))).toBe(false)
    expect(iosSafariMi(cihaz(ANDROID_CHROME))).toBe(false)
  })
})

describe('ana ekran ipucu: bir kez gösterilir', () => {
  it('iPhone Safari\'de, ana ekrana eklenmemişse görünür', () => {
    expect(anaEkranIpucuGorunsunMu(cihaz(IPHONE_SAFARI), BOS_ILERLEME)).toBe(true)
    expect(ANA_EKRAN_IPUCU).toBe('İlerlemen silinmesin: Paylaş → Ana Ekrana Ekle.')
  })

  it('ana ekrandan açılmışsa, başka tarayıcıda ya da sınıf modunda görünmez', () => {
    expect(anaEkranIpucuGorunsunMu(cihaz(IPHONE_SAFARI, { anaEkranda: true }), BOS_ILERLEME)).toBe(
      false,
    )
    expect(anaEkranIpucuGorunsunMu(cihaz(ANDROID_CHROME), BOS_ILERLEME)).toBe(false)
    expect(
      anaEkranIpucuGorunsunMu(cihaz(IPHONE_SAFARI), ayarlariDegistir(BOS_ILERLEME, { sinif: 'acik' })),
    ).toBe(false)
  })

  it('kapatılınca bir daha çıkmaz; ilerleme sıfırlansa da', () => {
    const kapali = ipucunuKapat(BOS_ILERLEME, 'ana-ekran')
    expect(anaEkranIpucuGorunsunMu(cihaz(IPHONE_SAFARI), kapali)).toBe(false)
    expect(anaEkranIpucuGorunsunMu(cihaz(IPHONE_SAFARI), ilerlemeyiSifirla(kapali))).toBe(false)
  })
})
