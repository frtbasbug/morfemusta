// Nedenlerin tablodaki yazımı (tests/neden.csv, tests/neden-unsuz.csv): öğeler ; ile ayrılır.
//
//   uyum      ETİKET:özellik; iki özellik + ile birleşir (POSS.1SG:kalınlık+yuvarlaklık)
//   gövde     GÖVDE:yumuşama, GÖVDE:inatçı, GÖVDE:yumuşamaz
//   ek başı   ETİKET:sertleşme, ETİKET:yumuşak, ETİKET:kaynaştırma
//   diğer     diğer
//
// Yalnız testler kullanır; oyun nedenin kendisiyle çalışır.

import type { Neden } from './neden.ts'

export function nedenYazimi(n: Neden): string {
  switch (n.tur) {
    case 'diğer':
      return 'diğer'
    case 'gövde':
      return `GÖVDE:${n.ad}`
    case 'ek başı':
      return `${n.etiket}:${n.ad}`
    case 'kaynaştırma':
      return `${n.etiket}:kaynaştırma`
    case 'uyum':
      return `${n.etiket}:${n.ozellikler.join('+')}`
  }
}
