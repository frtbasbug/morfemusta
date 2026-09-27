// Biçimbilim motoru. Saf TypeScript'tir: React'i, DOM'u, CSS'i ya da src/motor dışındaki
// uygulama kodunu içe aktarmaz (bagimsizlik.test.ts ve tsconfig.motor.json denetler).

export { ekle, govdeOlayiMi, olasiBicimler } from './ekle.ts'
export type {
  EklemeSonucu,
  EkOlayi,
  EkParcasi,
  GovdeOlayi,
  Kaynaklar,
  KopyalananOzellik,
  Olay,
} from './ekle.ts'
export { EK_ENVANTERI, ekEnvanteriniOku } from './envanter.ts'
export type { EkEnvanteri, EkTanimi, EkTuru } from './envanter.ts'
export { sablonuCoz } from './sablon.ts'
export type { Birim, UnluArkafonemi, UnsuzArkafonemi } from './sablon.ts'
export { SERT_UNSUZLER, UNLULER, YUMUSAMA, sonUnlu, unluBul } from './ses.ts'
export type { Unlu, UnluOzellikleri, YumusayanUnsuz } from './ses.ts'
export { KOK_SOZLUGU, kokSozlugunuOku } from './sozluk.ts'
export type { Istisna, KokGirdisi, KokSozlugu } from './sozluk.ts'
