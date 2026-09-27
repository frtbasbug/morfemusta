// Ek envanteri: etiket, şablon ve tür (çekim ya da yapım) icerik/ekler.csv'den okunur.
// Vite `?raw` ile dosyanın metnini derlemeye gömer; motor çalışma anında hiçbir yerden
// dosya istemez, derlenmiş site çevrim dışı da aynı envanteri kullanır.

import ekEnvanteriMetni from '../../icerik/ekler.csv?raw'
import { csvOku } from './csv.ts'
import { sablonuCoz, type Birim } from './sablon.ts'

export type EkTuru = 'çekim' | 'yapım'

export interface EkTanimi {
  /** Leipzig kısaltması: PL, POSS.1SG, LOC, AGT ... */
  readonly etiket: string
  /** Arkafonemle yazılmış şablon: -lAr, -(I)m, -DA ... */
  readonly sablon: string
  readonly tur: EkTuru
  readonly birimler: readonly Birim[]
}

export type EkEnvanteri = ReadonlyMap<string, EkTanimi>

function ekTuruMu(deger: string): deger is EkTuru {
  return deger === 'çekim' || deger === 'yapım'
}

export function ekEnvanteriniOku(csvMetni: string): EkEnvanteri {
  const envanter = new Map<string, EkTanimi>()
  for (const { satirNo, alanlar } of csvOku(csvMetni.normalize('NFC'), [
    'etiket',
    'sablon',
    'tur',
  ])) {
    const etiket = alanlar.etiket ?? ''
    const sablon = alanlar.sablon ?? ''
    const tur = alanlar.tur ?? ''
    const hata = (neden: string) => new Error(`Ek envanteri, ${satirNo}. satır: ${neden}`)
    if (etiket === '') throw hata('etiket boş')
    if (envanter.has(etiket)) throw hata(`"${etiket}" etiketi ikinci kez tanımlanmış`)
    if (!ekTuruMu(tur)) throw hata(`tür "çekim" ya da "yapım" olur, "${tur}" değil`)
    envanter.set(etiket, { etiket, sablon, tur, birimler: sablonuCoz(sablon) })
  }
  return envanter
}

/** icerik/ekler.csv'deki envanter. */
export const EK_ENVANTERI: EkEnvanteri = ekEnvanteriniOku(ekEnvanteriMetni)
