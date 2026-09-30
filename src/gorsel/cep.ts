// Cep: -(I)m'in büyüsü, kelime ya da meyve cebe girer. Bukalemun Koyu'nda ve Kök Bahçesi'nde
// aynıdır. Saf TypeScript'tir (bagimsizlik.test.ts ve tsconfig.motor.json denetler).

/** Cebin önünün kutusu (viewBox). */
export const CEP_KUTUSU = { en: 200, boy: 64 } as const

// Cebin önü: üst kenarı ortada hafifçe çukur; içinde kesik dikiş.
export const CEP_GOVDESI = 'M6 4Q100 16 194 4L190 46Q188 60 174 60H26Q12 60 10 46Z'
export const CEP_DIKISI = 'M16 13Q100 24 184 13L181 44Q180 51 172 51H28Q20 51 19 44Z'
