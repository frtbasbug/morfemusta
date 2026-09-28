// Karakter Galerisi'nin örnekleri. Galeri görsel dilin çizelgesidir, oyun içeriği değildir
// (CLAUDE.md'nin 4. kuralı oyunun kelime listeleri ve görevleri içindir): kökler ve ekler
// burada seçilir, biçimler motordan (ekle) gelir. Kökler sözlüktendir; ornekler.test.ts
// denetler. Yalnız uymayan örnek elle kurulur: motor uymayan biçim üretmez.

import { ekle, type EkParcasi } from '../motor/index.ts'

export interface GaleriOrnegi {
  readonly kok: string
  /** Leipzig kısaltmasıyla ek: PL, POSS.1SG. */
  readonly etiket: string
  /** Bukalemunun kılığını veren ek parçası. */
  readonly parca: EkParcasi
  readonly sonuc: string
  /** Ek köke uymuyor: bukalemun eğik, sonuç üstü çizili. */
  readonly uyumsuz: boolean
}

export interface GaleriBolumu {
  /** Sayfadaki bölüm kimliği (ASCII). */
  readonly id: string
  readonly baslik: string
  readonly aciklama: string
  readonly ornekler: readonly GaleriOrnegi[]
}

/** Kök + tek ek; biçimi ve ek parçasını motor kurar. */
export function ornek(kok: string, etiket: string): GaleriOrnegi {
  const { bicim, parcalar } = ekle(kok, [etiket])
  const [parca] = parcalar
  if (!parca) throw new Error(`${kok} + ${etiket}: motor ek parçası vermedi`)
  return { kok, etiket, parca, sonuc: bicim, uyumsuz: false }
}

/** Uymayan ek, elle: -lAr'ın kalın yüzü "lar" ince köke takılmış (*evlar*). */
export const UYMAYAN_ORNEK: GaleriOrnegi = {
  kok: 'ev',
  etiket: 'PL',
  parca: { etiket: 'PL', sablon: '-lAr', tur: 'çekim', govde: 'ev', yuzey: 'lar', olaylar: [] },
  sonuc: 'evlar',
  uyumsuz: true,
}

export const GALERI_BOLUMLERI: readonly GaleriBolumu[] = [
  {
    id: 'lar',
    baslik: '-lAr',
    aciklama:
      'Yalnız kalınlığı kopyalar: a ya da e. İkisi de düz ve geniş; bukalemunun yalnız ' +
      'kalınlığı ve rengi değişir.',
    ornekler: [ornek('kuş', 'PL'), ornek('göz', 'PL')],
  },
  {
    id: 'im',
    baslik: '-(I)m',
    aciklama:
      'Kalınlığı ve yuvarlaklığı kopyalar: ı, i, u ya da ü. Dördü de dar; gövdenin biçimi ' +
      'de değişir.',
    ornekler: ['kız', 'ev', 'yol', 'göz'].map((kok) => ornek(kok, 'POSS.1SG')),
  },
  {
    id: 'saklanan',
    baslik: 'Saklanan ünlü',
    aciklama:
      'Ünlüyle biten kökten sonra (I) yüzeye çıkmaz. Bukalemun zemine karışır, üstünde ' +
      'yalnız m kalır; biçimi uyumun seçeceği ünlününki.',
    ornekler: [ornek('kedi', 'POSS.1SG')],
  },
  {
    id: 'uymayan',
    baslik: 'Uymayan ek',
    aciklama:
      'Kalın lar ince köke uymaz: bukalemun eğilir, sonucun üstü çizilir. Bu biçimi motor ' +
      'değil, galeri kurar.',
    ornekler: [UYMAYAN_ORNEK],
  },
]
