// Adanın bölgeleri icerik/bolgeler.csv'den okunur (CLAUDE.md, 4. ve 13. kural: tablo yalnız
// kullanıcının onayıyla değişir). Ada haritasında bölgeler tablodaki sırayla, bir yol boyunca
// dizilir. Bir bölge, öncekinin bütün görevleri en az bir kez bitince açılır (ilerleme.ts).
//
//   sira      1'den başlayıp birer artar
//   kimlik    adreste (#/bolge/koy) ve cihazdaki kayıtta bölgenin adı: küçük ASCII harfler
//   ad        haritada ve bölge ekranında görünen ad
//   aksam     bölge turunun sonundaki akşam ekranının başlığı
//   gorevler  görev tablosunun yolu (icerik/gorevler/*.csv); boşsa bölgenin içeriği henüz
//             yoktur, haritada "hazırlanıyor" görünür

import bolgelerMetni from '../../icerik/bolgeler.csv?raw'
import bukalemunKoyuMetni from '../../icerik/gorevler/bukalemun-koyu.csv?raw'
import { csvOku } from '../motor/index.ts'
import { gorevleriOku, type Gorev } from './gorevler.ts'

export interface Bolge {
  /** Bölgenin sırası: 1, 2, 3 ... Haritadaki yol bu sırayla gider. */
  readonly sira: number
  readonly kimlik: string
  readonly ad: string
  /** Akşam ekranının başlığı: "Koyda akşam oldu". */
  readonly aksam: string
  /** Bölgenin görevleri; içeriği henüz yoksa boş. */
  readonly gorevler: readonly Gorev[]
}

/**
 * Görev tabloları, bölge tablosundaki yollarıyla. Tablonun metni derlemede pakete gömülür
 * (?raw); yeni bir görev tablosu buraya da eklenir (bolgeler.test.ts denetler).
 */
export const GOREV_TABLOLARI: Readonly<Record<string, string>> = {
  'icerik/gorevler/bukalemun-koyu.csv': bukalemunKoyuMetni,
}

const BASLIKLAR = ['sira', 'kimlik', 'ad', 'aksam', 'gorevler'] as const

export function bolgeleriOku(
  csvMetni: string,
  tablolar: Readonly<Record<string, string>> = GOREV_TABLOLARI,
): Bolge[] {
  const bolgeler: Bolge[] = []
  for (const { satirNo, alanlar } of csvOku(csvMetni.normalize('NFC'), BASLIKLAR)) {
    const hata = (neden: string) => new Error(`Bölge tablosu, ${satirNo}. satır: ${neden}`)
    const sira = bolgeler.length + 1
    const kimlik = alanlar.kimlik ?? ''
    const ad = alanlar.ad ?? ''
    const aksam = alanlar.aksam ?? ''
    const yol = alanlar.gorevler ?? ''

    if (alanlar.sira !== String(sira)) throw hata(`sıra ${sira} olur, "${alanlar.sira}" değil`)
    if (!/^[a-z]+$/.test(kimlik)) throw hata(`kimlik küçük ASCII harflerle yazılır, "${kimlik}" değil`)
    if (bolgeler.some((b) => b.kimlik === kimlik)) throw hata(`"${kimlik}" kimliği ikinci kez`)
    if (ad === '') throw hata('ad boş')
    if (aksam === '') throw hata('akşam boş')

    let gorevler: Gorev[] = []
    if (yol !== '') {
      const metin = Object.hasOwn(tablolar, yol) ? tablolar[yol] : undefined
      if (metin === undefined) throw hata(`bilinmeyen görev tablosu: "${yol}"`)
      try {
        gorevler = gorevleriOku(metin)
      } catch (e) {
        throw hata(`${yol}: ${e instanceof Error ? e.message : String(e)}`)
      }
      if (gorevler.length === 0) throw hata(`${yol}: görev yok`)
    }
    bolgeler.push({ sira, kimlik, ad, aksam, gorevler })
  }
  if (bolgeler.length === 0) throw new Error('Bölge tablosu boş')
  return bolgeler
}

/** icerik/bolgeler.csv: adanın bölgeleri, haritadaki sırayla. */
export const BOLGELER: readonly Bolge[] = bolgeleriOku(bolgelerMetni)

export function bolgeBul(kimlik: string, bolgeler: readonly Bolge[] = BOLGELER): Bolge | undefined {
  return bolgeler.find((b) => b.kimlik === kimlik)
}
