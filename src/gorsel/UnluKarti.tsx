// Ünlü kartı: ünlü karakteri ve altında harfi. Zemini kalın ya da ince zemin rengi;
// çerçeve, köşe ve gölge tema.css'teki ünlü kartı belirteçleridir.

import type { Unlu as UnluHarfi } from '../motor/index.ts'
import { UNLULER } from './cizim.ts'
import Unlu from './Unlu.tsx'
import './karakterler.css'
import './tema.css'

export default function UnluKarti({
  unlu,
  boyut = 1,
}: {
  readonly unlu: UnluHarfi
  /** Karakterin ölçeği (Unlu). */
  readonly boyut?: number
}) {
  return (
    <div className={`unlu-karti unlu-karti--${UNLULER[unlu].kalin ? 'kalin' : 'ince'}`}>
      <Unlu unlu={unlu} boyut={boyut} />
      {/* Harfi karakterin adı zaten söyler. */}
      <span className="unlu-karti__harf" aria-hidden="true">
        {unlu}
      </span>
    </div>
  )
}
