// Birleşen ek (at + lar): ek, bukalemunun renginde bir kutuda kalır; çerçevesi 2px mürekkep,
// düzde köşeli, yuvarlakta hap biçiminde (DESIGN.md, "Görsel kod"). Kutu ekin sınırını
// gösterir; rengi ve biçimi ekin kılığından gelir (kilik.ts).
//
// Ekin her ünlüsü kök etiketiyle aynı etikettedir (UnluEtiketi): kalında geniş, incede dar;
// düzde köşeli, yuvarlakta elips. Uyum, kökteki ve ekteki etiketlerin aynı ende olmasından
// okunur; Renksiz'de de. Saklanan ünlü (kedi + m) yüzeyde yoktur, etiket almaz.

import { Fragment, type ReactNode } from 'react'
import type { EkParcasi, Unlu } from '../motor/index.ts'
import { UNLULER } from './cizim.ts'
import { bukalemunKiligi } from './kilik.ts'
import UnluEtiketi from './UnluEtiketi.tsx'
import './karakterler.css'
import './tema.css'

const unluMu = (harf: string): harf is Unlu => Object.hasOwn(UNLULER, harf)

/** Ekin yüzeyinde bir yuva: o sesin yerine başka bir öğe (Fıstıkçı Şahap'ın ünsüz yuvası). */
export interface EkYuvasi {
  /** Yüzeydeki yeri (0'dan). */
  readonly konum: number
  readonly icerik: ReactNode
}

/** Yüzeyin görünen yazısı: ünlüler etiketinde, aradaki ünsüzler düz yazı; yuva yerinde. */
function etiketliYuzey(yuzey: string, yuva?: EkYuvasi): ReactNode[] {
  const parcalar: ReactNode[] = []
  let unsuzler = ''
  for (const [i, harf] of [...yuzey.normalize('NFC')].entries()) {
    if (yuva?.konum === i) {
      if (unsuzler !== '') parcalar.push(unsuzler)
      unsuzler = ''
      parcalar.push(<Fragment key={parcalar.length}>{yuva.icerik}</Fragment>)
      continue
    }
    if (!unluMu(harf)) {
      unsuzler += harf
      continue
    }
    if (unsuzler !== '') parcalar.push(unsuzler)
    unsuzler = ''
    parcalar.push(<UnluEtiketi key={parcalar.length} unlu={harf} />)
  }
  if (unsuzler !== '') parcalar.push(unsuzler)
  return parcalar
}

export default function EkYazisi({
  parca,
  yuva,
}: {
  readonly parca: EkParcasi
  /** Yüzeydeki bir sesin yerine konan öğe (ek başının ünsüz yuvası). */
  readonly yuva?: EkYuvasi
}) {
  const { ozellikler } = bukalemunKiligi(parca)
  const siniflar = [
    'ek-yazisi',
    ozellikler.kalin ? 'ek-yazisi--kalin' : 'ek-yazisi--ince',
    ozellikler.yuvarlak ? 'ek-yazisi--yuvarlak' : 'ek-yazisi--duz',
  ]
  return <span className={siniflar.join(' ')}>{etiketliYuzey(parca.yuzey, yuva)}</span>
}
