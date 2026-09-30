// Kök Bahçesi'nin ağacı (DESIGN.md, "Kök Bahçesi"). Terimler resimdir: yapım eki gövdeyi bir
// halka büyütür, çekim eki tepeye meyve gibi asılır. Ağaç aşağıdan yukarı dört parçadır:
//
//   kök    ağacın dibi, kökleriyle; üstünde kökün yazısı (KokYazisi)
//   halka  gövdenin bir halkası; her yapım ekine bir halka, üstünde ekin yazısı
//   taç    tepede yuvarlak bir taç
//   meyve  tacın ucunda yuvarlak bir meyve, sapıyla; üstünde ekin yazısı
//
// Halka ile meyve biçimle ayrılır: halka yatay bir bant, meyve bir daire. Renk (--govde,
// --yaprak) yalnız pekiştirir; Renksiz'de de biçim yeter. Kalın ve ince renkleri yalnız ek
// yazılarında kalır.
//
// Saf TypeScript'tir: React'i, DOM'u ya da CSS'i içe aktarmaz (bagimsizlik.test.ts ve
// tsconfig.motor.json denetler). Renkler ve çizgi kalınlıkları tema.css'tedir.

/** Parçaların kutuları (viewBox). */
export const KOK_KUTUSU = { en: 132, boy: 52 } as const
export const HALKA_KUTUSU = { en: 96, boy: 40 } as const
export const TAC_KUTUSU = { en: 148, boy: 84 } as const
export const MEYVE_KUTUSU = { en: 48, boy: 54 } as const
export const ISARET_KUTUSU = { en: 30, boy: 34 } as const

// Kök: gövdenin dibi (halkayla aynı en), iki yana açılan kökler.
const KOK_GOVDESI = 'M20 2H112L114 32Q120 44 130 50H2Q12 44 18 32Z'
// Köklerin çatalları: dibe inen iki kısa çizgi.
const KOK_CIZGILERI = 'M34 50Q38 44 40 38M98 50Q94 44 92 38'

// Halka: üst ve alt kenarı hafifçe kavisli bir bant (yıllık halka), yanları dik.
const HALKA_GOVDESI = 'M4 5Q48 10 92 5V35Q48 40 4 35Z'

// Taç: yuvarlak, alt kenarı biraz basık.
const TAC_GOVDESI =
  'M74 3C116 3 145 24 145 47C145 70 114 81 74 81C34 81 3 70 3 47C3 24 32 3 74 3Z'

// Meyve: yukarıda kısa bir sap, altında daire.
const MEYVE_SAPI = 'M24 2V10'
const MEYVE = { cx: 24, cy: 31, r: 21 } as const

// Haritadaki işaret: küçük bir gövde ve yuvarlak taç.
const ISARET_GOVDESI = 'M12 20H18V32H12Z'
const ISARET_TACI = { cx: 15, cy: 13, r: 11 } as const

export interface AgacCizimi {
  readonly kok: { readonly govde: string; readonly cizgiler: string }
  readonly halka: string
  readonly tac: string
  readonly meyve: {
    readonly sap: string
    readonly cx: number
    readonly cy: number
    readonly r: number
  }
  readonly isaret: {
    readonly govde: string
    readonly tac: { readonly cx: number; readonly cy: number; readonly r: number }
  }
}

export const AGAC_CIZIMI: AgacCizimi = {
  kok: { govde: KOK_GOVDESI, cizgiler: KOK_CIZGILERI },
  halka: HALKA_GOVDESI,
  tac: TAC_GOVDESI,
  meyve: { sap: MEYVE_SAPI, ...MEYVE },
  isaret: { govde: ISARET_GOVDESI, tac: ISARET_TACI },
}

/** Çoğul meyve üç olur (-lAr çoğaltır). */
export const meyveSayisi = (etiket: string): number => (etiket === 'PL' ? 3 : 1)
