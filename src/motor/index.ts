// Biçimbilim motoru. Saf TypeScript'tir: React'i, DOM'u, CSS'i ya da src/motor dışındaki
// uygulama kodunu içe aktarmaz (bagimsizlik.test.ts ve tsconfig.motor.json denetler).

export { csvOku } from './csv.ts'
export type { CsvKaydi } from './csv.ts'
export { ekle, govdeOlayiMi, olasiBicimler, olasiEklemeler, uyum, yumusakKarsilik } from './ekle.ts'
export type {
  EklemeSonucu,
  EkOlayi,
  EkParcasi,
  GovdeOlayi,
  KopyalananOzellik,
  Olay,
} from './ekle.ts'
export { EK_ENVANTERI, ekEnvanteriniOku } from './envanter.ts'
export type { EkEnvanteri, EkTanimi, EkTuru } from './envanter.ts'
export { neden, nedenCumlesi, yuzeySecenekleri } from './neden.ts'
export type { DigerNeden, EkBasiNedeni, GovdeNedeni, Neden, UyumNedeni } from './neden.ts'
export { ekBasiBeklenen, sinirSecenekleri, unsuzYuvalari } from './sinir.ts'
export type { Karo, Sinir, SinirYeri, UnsuzYuvasi } from './sinir.ts'
export { ekSirasiHatasi } from './sira.ts'
export type { EkSirasiHatasi } from './sira.ts'
export { sablonuCoz } from './sablon.ts'
export type { Birim, UnluArkafonemi, UnsuzArkafonemi } from './sablon.ts'
export { SERT_UNSUZLER, UNLULER, YUMUSAMA, sonUnlu, unluBul } from './ses.ts'
export type { Unlu, UnluOzellikleri, YumusayanUnsuz } from './ses.ts'
export { KOK_SOZLUGU, kokSozlugunuOku } from './sozluk.ts'
export type { Istisna, KokGirdisi, KokSozlugu } from './sozluk.ts'
