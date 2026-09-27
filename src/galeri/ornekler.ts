// Karakter Galerisi'nin örnekleri. Biçimler ve bukalemunların kılığı ekle()'den gelir; yalnız
// uymayan örnek elle kurulur, çünkü motor uymayan biçim üretmez. Galeri oyunun içeriği
// değil, görsel dilin vitrinidir; örnekleri bu yüzden kodda durur.

import { ekle, type EkParcasi } from '../motor/index.ts'

export interface Ornek {
  readonly kok: string
  /** Bukalemunun parçası: ekle() sonucundaki tek ek. */
  readonly parca: EkParcasi
  /** Sonuç: ekle()'nin biçimi; uymayan örnekte kök + bukalemunun yazısı. */
  readonly sonuc: string
  readonly uyumsuz: boolean
}

export interface OrnekBolumu {
  readonly kimlik: string
  readonly baslik: string
  readonly aciklama: string
  readonly ornekler: readonly Ornek[]
}

function ornek(kok: string, etiket: string): Ornek {
  const { bicim, parcalar } = ekle(kok, [etiket])
  const [parca] = parcalar
  if (!parca) throw new Error(`${kok} + ${etiket}: ek parçası yok`)
  return { kok, parca, sonuc: bicim, uyumsuz: false }
}

// ev + lar: -lAr'ın kalın biçimi ince köke takılmış. Motorun biçimi değildir.
const EV_LAR: EkParcasi = {
  etiket: 'PL',
  sablon: '-lAr',
  tur: 'çekim',
  govde: 'ev',
  yuzey: 'lar',
  olaylar: [],
}

export const ORNEK_BOLUMLERI: readonly OrnekBolumu[] = [
  {
    kimlik: 'lar',
    baslik: '-lAr',
    aciklama: 'Yalnız kalınlığı kopyalar: lar, ler. Hep düz ve geniştir; bedeni ve rengi değişir.',
    ornekler: [ornek('kuş', 'PL'), ornek('göz', 'PL')],
  },
  {
    kimlik: 'im',
    baslik: '-(I)m',
    aciklama:
      'Kalınlığı ve yuvarlaklığı kopyalar: ım, im, um, üm. Hep dardır; biçimi de değişir.',
    ornekler: ['kız', 'ev', 'yol', 'göz'].map((kok) => ornek(kok, 'POSS.1SG')),
  },
  {
    kimlik: 'saklanan',
    baslik: 'Saklanan ünlü',
    aciklama:
      'Ünlüden sonra (I) yüzeye çıkmaz: bukalemun zemine karışır. Biçimi, uyumun seçeceği ünlününkidir.',
    ornekler: [ornek('kedi', 'POSS.1SG')],
  },
  {
    kimlik: 'uymayan',
    baslik: 'Uymayan ek',
    aciklama: 'İnce köke kalın ek: bukalemun eğilir, sonuç çizilir.',
    ornekler: [
      { kok: 'ev', parca: EV_LAR, sonuc: EV_LAR.govde + EV_LAR.yuzey, uyumsuz: true },
    ],
  },
]
