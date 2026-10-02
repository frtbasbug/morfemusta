import { describe, expect, it } from 'vitest'
import {
  EFEKTLER,
  efektCal,
  efektSuresi,
  efektlereIzinVer,
  ornekle,
  type EfektTuru,
  type SesBaglami,
} from './efekt.ts'

const TURLER: readonly EfektTuru[] = ['dogru', 'yanlis', 'buyu', 'seri']

/** Sesler -20 dBFS'ye getirilir (scripts/ses-uret.py, HEDEF_RMS): genliğin RMS'i 0.1. */
const KONUSMA_RMS = 0.1

/** En yüksek 50 ms'lik pencerenin RMS'i. */
function enYuksekRms(ornekler: Float32Array, hiz = 24000): number {
  const pencere = Math.round(0.05 * hiz)
  let enYuksek = 0
  for (let i = 0; i + pencere <= ornekler.length; i += pencere / 5) {
    let toplam = 0
    for (let j = i; j < i + pencere; j++) toplam += (ornekler[j] ?? 0) ** 2
    enYuksek = Math.max(enYuksek, Math.sqrt(toplam / pencere))
  }
  return enYuksek
}

describe('efektler: Web Audio ile üretilen kısa sesler', () => {
  it.each(TURLER)('%s 400 ms\'den kısa', (tur) => {
    expect(efektSuresi(tur)).toBeLessThan(0.4)
    expect(ornekle(tur).length / 24000).toBeLessThan(0.4)
  })

  it('doğru: kısa, yükselen iki nota', () => {
    const [ilk, ikinci, ...fazla] = EFEKTLER.dogru
    expect(fazla).toEqual([])
    expect(ikinci!.frekans).toBeGreaterThan(ilk!.frekans)
    expect(ikinci!.baslangic).toBeGreaterThan(ilk!.baslangic)
  })

  it('yanlış: yumuşak ve alçak (300 Hz\'in altında, yavaş yükselir), cezalandırıcı değil', () => {
    for (const nota of EFEKTLER.yanlis) {
      expect(nota.frekans).toBeLessThan(300)
      expect(nota.yukselis).toBeGreaterThanOrEqual(0.02)
    }
    // Doğrudan yüksek değil.
    expect(enYuksekRms(ornekle('yanlis'))).toBeLessThanOrEqual(enYuksekRms(ornekle('dogru')) * 1.1)
  })

  it('büyü: yüksek, hızlı bir parıltı (en az üç nota, 1 kHz\'in üstünde)', () => {
    expect(EFEKTLER.buyu.length).toBeGreaterThanOrEqual(3)
    for (const nota of EFEKTLER.buyu) expect(nota.frekans).toBeGreaterThan(1000)
  })

  it.each(TURLER)('%s konuşmadan kısık: en yüksek 50 ms\'si sesin yarısının altında, tepesi 0.25\'in altında', (tur) => {
    const ornekler = ornekle(tur)
    expect(enYuksekRms(ornekler)).toBeLessThan(KONUSMA_RMS / 2)
    expect(Math.max(...ornekler.map(Math.abs))).toBeLessThan(0.25)
  })
})

/** Sahte Web Audio: başlatılan osilatörleri ve kazanç eğrilerini kaydeder. */
function sahteBaglam() {
  const osilatorler: { tur: string; frekans: number; bas: number; son: number }[] = []
  const egriler: [string, number, number][] = []
  const baglam: SesBaglami = {
    currentTime: 2,
    state: 'running',
    destination: 'cikis',
    resume: () => Promise.resolve(),
    createOscillator() {
      const o = {
        type: 'sine',
        frequency: { value: 0 },
        connect: () => undefined,
        start(an: number) {
          osilatorler.push({ tur: o.type, frekans: o.frequency.value, bas: an, son: 0 })
        },
        stop(an: number) {
          const son = osilatorler.at(-1)
          if (son) son.son = an
        },
      }
      return o
    },
    createGain() {
      return {
        gain: {
          setValueAtTime: (d: number, an: number) => egriler.push(['bas', d, an]),
          linearRampToValueAtTime: (d: number, an: number) => egriler.push(['yukselis', d, an]),
          exponentialRampToValueAtTime: (d: number, an: number) => egriler.push(['sonus', d, an]),
        },
        connect: () => undefined,
      }
    },
  }
  return { baglam, osilatorler, egriler }
}

describe('efektCal', () => {
  it('notaları sırayla, kendi frekans ve zamanlarında başlatır', () => {
    const { baglam, osilatorler, egriler } = sahteBaglam()
    expect(efektCal('dogru', baglam)).toBe(true)
    expect(osilatorler.map((o) => o.frekans)).toEqual(EFEKTLER.dogru.map((n) => n.frekans))
    expect(osilatorler.map((o) => o.tur)).toEqual(['triangle', 'triangle'])
    const [ilk, ikinci] = osilatorler
    expect(ikinci!.bas - ilk!.bas).toBeCloseTo(EFEKTLER.dogru[1]!.baslangic, 5)
    // Her nota kendi zarfıyla: sessizden yükselir, sessize söner; 400 ms içinde biter.
    expect(egriler.filter(([tur]) => tur === 'yukselis').map(([, d]) => d)).toEqual([0.1, 0.1])
    for (const o of osilatorler) expect(o.son - baglam.currentTime).toBeLessThan(0.45)
  })

  it('Web Audio yoksa ya da izin yoksa çalmaz, hata atmaz', () => {
    expect(efektCal('buyu', null)).toBe(false)
    // Node'da AudioContext yok; izin olsa da çalamaz.
    efektlereIzinVer(true)
    expect(efektCal('buyu')).toBe(false)
    efektlereIzinVer(false)
  })
})
