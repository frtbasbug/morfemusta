// Birleşen ek (at + lar): ek, bukalemunun renginde kalır; çerçevesi 2px mürekkep, düzde
// köşeli, yuvarlakta hap biçiminde (DESIGN.md, "Görsel kod"). Rengi ve biçimi ekin kılığından
// gelir (kilik.ts): -lAr'da yalnız kalınlık, -(I)m'de yuvarlaklık da.

import type { EkParcasi } from '../motor/index.ts'
import { bukalemunKiligi } from './kilik.ts'
import './karakterler.css'
import './tema.css'

export default function EkYazisi({ parca }: { readonly parca: EkParcasi }) {
  const { ozellikler } = bukalemunKiligi(parca)
  const siniflar = [
    'ek-yazisi',
    ozellikler.kalin ? 'ek-yazisi--kalin' : 'ek-yazisi--ince',
    ozellikler.yuvarlak ? 'ek-yazisi--yuvarlak' : 'ek-yazisi--duz',
  ]
  return <span className={siniflar.join(' ')}>{parca.yuzey}</span>
}
