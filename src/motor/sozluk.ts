// Kök sözlüğü: icerik/kokler.csv. Her kök kategorisi ve sesbilgisi işaretleriyle gelir:
//
//   yumusama       evet: son ünsüz ünlüyle başlayan ekten önce yumuşar (kitabı, rengi);
//                  hayır: yumuşamaz (topu). Sonu p, ç, t ya da k olan her kökte yazılır.
//   unlu_dusmesi   evet: son ünlü ünlüyle başlayan ekten önce düşer (ağzım, nehre).
//   istisna        ince-ek: köke gelen ilk ekin ünlüleri incedir (saatler, golü);
//                  ikiz: son ünsüz ünlüyle başlayan ekten önce ikizleşir (sırrım, hakkı);
//                  su: parantezli sesle başlayan ek gelince gövde y alır (suyu, suya).
//
// Sözlükte olmayan kök uydurmadır (DESIGN.md, "Uydurma kelime kanıttır"). Sözlük yalnız
// kullanıcının onayıyla değişir.

import kokSozluguMetni from '../../icerik/kokler.csv?raw'
import { csvOku } from './csv.ts'
import { ALFABE, UNLULER, sonSes, sonUnlu, sonUnluKonumu, unluMu, yumusayanMi } from './ses.ts'

export type Istisna = 'ince-ek' | 'ikiz' | 'su'

export interface KokGirdisi {
  readonly kok: string
  readonly kategori: string
  /**
   * Sonu p, ç, t ya da k olan kökte işaretlidir: true, ünlüyle başlayan ekten önce yumuşar
   * (kitabı); false, yumuşamaz (topu). Başka köklerde undefined.
   */
  readonly yumusama: boolean | undefined
  /** Son ünlü ünlüyle başlayan ekten önce düşer (ağzım). */
  readonly unluDusmesi: boolean
  readonly istisna: Istisna | undefined
}

export type KokSozlugu = ReadonlyMap<string, KokGirdisi>

const BASLIKLAR = ['kok', 'kategori', 'yumusama', 'unlu_dusmesi', 'istisna'] as const

function istisnaMi(deger: string): deger is Istisna {
  return deger === 'ince-ek' || deger === 'ikiz' || deger === 'su'
}

/**
 * Ünlü düşmesi için kök ünsüz + ünlü + ünsüz ile biter ve düşecek ünlüden önce bir ünlü daha
 * taşır (ağız → ağz).
 */
function unluDusebilirMi(kok: string): boolean {
  const n = kok.length
  return (
    n >= 4 &&
    !unluMu(kok[n - 1]) &&
    unluMu(kok[n - 2]) &&
    !unluMu(kok[n - 3]) &&
    sonUnluKonumu(kok.slice(0, n - 3)) >= 0
  )
}

export function kokSozlugunuOku(csvMetni: string): KokSozlugu {
  const sozluk = new Map<string, KokGirdisi>()
  for (const { satirNo, alanlar } of csvOku(csvMetni.normalize('NFC'), BASLIKLAR)) {
    const kok = alanlar.kok ?? ''
    const kategori = alanlar.kategori ?? ''
    const yumusamaAlani = alanlar.yumusama ?? ''
    const dusmeAlani = alanlar.unlu_dusmesi ?? ''
    const istisnaAlani = alanlar.istisna ?? ''
    const hata = (neden: string) => new Error(`Kök sözlüğü, ${satirNo}. satır: ${neden}`)

    if (kok === '') throw hata('kök boş')
    for (const harf of kok) {
      if (!ALFABE.has(harf)) {
        throw hata(`"${kok}" kökünde alfabe dışı harf var: "${harf}" (yalnız küçük harf)`)
      }
    }
    if (sozluk.has(kok)) throw hata(`"${kok}" kökü ikinci kez yazılmış`)
    const kokunSonUnlusu = sonUnlu(kok)
    if (kokunSonUnlusu === undefined) throw hata(`"${kok}" kökünde ünlü yok`)
    if (kategori === '') throw hata(`"${kok}" kökünün kategorisi boş`)

    let yumusama: boolean | undefined
    if (yumusayanMi(sonSes(kok))) {
      if (yumusamaAlani === 'evet') yumusama = true
      else if (yumusamaAlani === 'hayır') yumusama = false
      else {
        throw hata(
          `"${kok}" p, ç, t ya da k ile bitiyor; ` +
            `yumusama "evet" ya da "hayır" olur, "${yumusamaAlani}" değil`,
        )
      }
    } else if (yumusamaAlani !== '') {
      throw hata(`"${kok}" p, ç, t ya da k ile bitmiyor; yumusama boş kalır`)
    }

    if (dusmeAlani !== '' && dusmeAlani !== 'evet') {
      throw hata(`unlu_dusmesi boş ya da "evet" olur, "${dusmeAlani}" değil`)
    }
    const unluDusmesi = dusmeAlani === 'evet'
    if (unluDusmesi && !unluDusebilirMi(kok)) {
      throw hata(`"${kok}" kökünde düşebilecek son ünlü yok (ünsüz + ünlü + ünsüz ile bitmeli)`)
    }

    if (istisnaAlani !== '' && !istisnaMi(istisnaAlani)) {
      throw hata(`istisna boş, "ince-ek", "ikiz" ya da "su" olur, "${istisnaAlani}" değil`)
    }
    const istisna = istisnaAlani === '' ? undefined : istisnaAlani
    if (istisna === 'ince-ek' && !UNLULER[kokunSonUnlusu].kalin) {
      throw hata(`"${kok}" kökünün son ünlüsü zaten ince; ince-ek işareti gereksiz`)
    }
    if (istisna === 'ikiz' && (unluMu(sonSes(kok)) || yumusama === true || unluDusmesi)) {
      throw hata(`"${kok}": ikiz yalnız ünsüzle biten, yumuşamayan ve ünlüsü düşmeyen kökte olur`)
    }
    if (istisna === 'su' && !unluMu(sonSes(kok))) {
      throw hata(`"${kok}": su işareti yalnız ünlüyle biten kökte olur`)
    }

    sozluk.set(kok, { kok, kategori, yumusama, unluDusmesi, istisna })
  }
  return sozluk
}

/** icerik/kokler.csv'deki sözlük. */
export const KOK_SOZLUGU: KokSozlugu = kokSozlugunuOku(kokSozluguMetni)
