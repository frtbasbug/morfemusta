// Ek şablonlarının çözümlenmesi. Şablon arkafonemle yazılır (DESIGN.md, "Bu belgedeki
// gösterim"): -lAr, -(I)m, -DA, -CI, -(y)A.
//
//   A, I           ünlü arkafonemi: uyumla çözülür
//   D, C           ünsüz arkafonemi: sert ünsüzden sonra t, ç olur
//   (y) (s) (n)    ayraç içindeki ünsüz: yalnız ünlüden sonra çıkar (kaynaştırma)
//   (I)            ayraç içindeki ünlü: ünlüden sonra saklanır
//   küçük harf     olduğu gibi yazılır

import { ALFABE, unluMu } from './ses.ts'

export type UnluArkafonemi = 'A' | 'I'
export type UnsuzArkafonemi = 'D' | 'C'

export type Birim =
  | { readonly tur: 'harf'; readonly ses: string; readonly yazim: string }
  | { readonly tur: 'unlu'; readonly arkafonem: UnluArkafonemi; readonly yazim: string }
  | { readonly tur: 'unsuz'; readonly arkafonem: UnsuzArkafonemi; readonly yazim: string }
  | { readonly tur: 'ayracli-unsuz'; readonly ses: string; readonly yazim: string }
  | { readonly tur: 'ayracli-unlu'; readonly arkafonem: UnluArkafonemi; readonly yazim: string }

function unluArkafonemiMi(harf: string): harf is UnluArkafonemi {
  return harf === 'A' || harf === 'I'
}

function unsuzArkafonemiMi(harf: string): harf is UnsuzArkafonemi {
  return harf === 'D' || harf === 'C'
}

/** "-(I)mIz" → [(I), m, I, z] */
export function sablonuCoz(sablon: string): Birim[] {
  const hata = (neden: string) => new Error(`"${sablon}" şablonu çözülemedi: ${neden}`)
  if (!sablon.startsWith('-')) throw hata('şablon "-" ile başlar')

  const harfler = [...sablon.slice(1)]
  const birimler: Birim[] = []
  for (let i = 0; i < harfler.length; i++) {
    const harf = harfler[i] ?? ''
    if (harf === '(') {
      const ic = harfler[i + 1] ?? ''
      if (harfler[i + 2] !== ')') throw hata('ayraç içinde tek bir ses olur')
      const yazim = `(${ic})`
      if (unluArkafonemiMi(ic)) {
        birimler.push({ tur: 'ayracli-unlu', arkafonem: ic, yazim })
      } else if (ALFABE.has(ic) && !unluMu(ic)) {
        birimler.push({ tur: 'ayracli-unsuz', ses: ic, yazim })
      } else {
        throw hata(`ayraç içinde "${ic}" olamaz`)
      }
      i += 2
    } else if (unluArkafonemiMi(harf)) {
      birimler.push({ tur: 'unlu', arkafonem: harf, yazim: harf })
    } else if (unsuzArkafonemiMi(harf)) {
      birimler.push({ tur: 'unsuz', arkafonem: harf, yazim: harf })
    } else if (ALFABE.has(harf)) {
      birimler.push({ tur: 'harf', ses: harf, yazim: harf })
    } else {
      throw hata(`"${harf}" tanınmıyor`)
    }
  }
  if (birimler.length === 0) throw hata('şablon boş')
  return birimler
}
