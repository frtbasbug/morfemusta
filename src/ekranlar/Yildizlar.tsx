// Yıldızlar (DESIGN.md, "Akış ve puan"): bir turun ya da bölgenin en iyi yıldızı, üç yıldızdan
// kaçı dolu. Akşam ekranında ve haritanın tabelasında. Yalnız renkle verilmez: dolu yıldızın içi
// boyalı, boşunki boştur; adı yazıyla ("3 yıldızdan 2").

import type { Yildiz } from '../oyun/puan.ts'
import { YildizSimgesi } from './simgeler.tsx'
import './Yildizlar.css'

export const yildizAdi = (yildiz: Yildiz): string => `3 yıldızdan ${yildiz}`

export default function Yildizlar({ yildiz, sinif }: { yildiz: Yildiz; sinif?: string }) {
  return (
    <span className={sinif ? `yildizlar ${sinif}` : 'yildizlar'} role="img" aria-label={yildizAdi(yildiz)}>
      {[1, 2, 3].map((n) => (
        <YildizSimgesi key={n} dolu={n <= yildiz} />
      ))}
    </span>
  )
}
