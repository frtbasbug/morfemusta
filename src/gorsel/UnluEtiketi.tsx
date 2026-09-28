// Ünlü etiketi: kök yazısında son ünlünün etiketi. Ünlü gövdesinin küçük bir kopyasıdır: en/boy
// oranı karakterinkiyle aynı (kalında 58:56, incede 34:56; cizim.ts), düzde köşesi 4px
// dikdörtgen, yuvarlakta elips. Uyuma yalnız kalınlık ve yuvarlaklık girer; etiket ikisini
// renksiz de gösterir (DESIGN.md, "Görsel dil").

import type { Unlu as UnluHarfi } from '../motor/index.ts'
import { UNLULER, unluGovdesi } from './cizim.ts'
import './karakterler.css'
import './tema.css'

export default function UnluEtiketi({ unlu }: { readonly unlu: UnluHarfi }) {
  const ozellikler = UNLULER[unlu]
  const { en, boy } = unluGovdesi(ozellikler)
  const siniflar = [
    'unlu-etiketi',
    ozellikler.kalin ? 'unlu-etiketi--kalin' : 'unlu-etiketi--ince',
    ozellikler.yuvarlak ? 'unlu-etiketi--yuvarlak' : 'unlu-etiketi--duz',
  ]
  return (
    <span className={siniflar.join(' ')} style={{ aspectRatio: `${en} / ${boy}` }}>
      {unlu}
    </span>
  )
}
