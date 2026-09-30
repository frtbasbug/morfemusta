// Uydurma kök adayları üretir (Uydurukçuklar). Tohumludur: aynı tohum ve sayı hep aynı
// adayları verir. Adaylar motorun uydurma kök denetiminin (src/motor/uydurma.ts,
// uydurmaDenetimi) kurallarıyla kurulur ve ondan geçer: ses yapısı, sözlük, yasaklı diziler,
// kök + ek gibi okunma. Görev tablosundaki kökler (icerik/gorevler/uydurukcuklar.csv) aday
// olmaz. Sonra gerçek kelimeler zeyrek'le elenir: scripts/zeyrek-denetimi.py --adaylar (CI'da
// koşmaz; zeyrek elle kurulur).
//
// Çıktı yalnız bir aday dosyasıdır (sekmeyle ayrılmış: kok, son, unlu). Oyuna hiçbir kök
// kullanıcının onayı olmadan girmez: görev tablosu elle, onayla değişir (CLAUDE.md).
//
//   node scripts/uydurma-uret.mjs --tohum 7 --sayi 40
//   node scripts/uydurma-uret.mjs --tohum 7 --sayi 40 --cikti adaylar.tsv
//   node scripts/uydurma-uret.mjs --tohum 7 --zeyreksiz     (zeyrek yoksa; gerçek kelime kalabilir)
//
// NLTK'nin punkt_tab verisi vekil sunucu arkasında inmezse NLTK_ALLOW_PROXIED_URLOPEN=1 ile.

import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { createServer } from 'vite'

const { values: secenekler } = parseArgs({
  options: {
    tohum: { type: 'string', default: '1' },
    sayi: { type: 'string', default: '30' },
    cikti: { type: 'string', default: 'uydurma-adaylari.tsv' },
    zeyreksiz: { type: 'boolean', default: false },
  },
})
const tohum = Number(secenekler.tohum)
const sayi = Number(secenekler.sayi)
if (!Number.isSafeInteger(tohum) || !Number.isSafeInteger(sayi) || sayi < 1) {
  console.error('--tohum bir tam sayı, --sayi pozitif bir tam sayı olmalı')
  process.exit(1)
}

// Kurallar uydurma.ts'tekilerle aynıdır; aday yine de uydurmaDenetimi'nden geçmek zorundadır.
const ILK_SESLER = [...'bcçdfghkmnpsştvyz']
const UNSUZLER = [...'bcçdfghklmnprsştvyz'] // ğ ve j yok
const ARA_ILK_UNSUZLER = [...'lrnmsşzy']
const SON_UNSUZLER = [...'pçtksşzlrmny']
const UNLULER = [...'aeıioöuü']
const IKINCI_UNLULER = [...'aeıiuü'] // ikinci hecede o ve ö yok

/** Sayı üreteci mulberry32 (src/oyun/karistir.ts ile aynı). */
function uretec(baslangic) {
  let durum = baslangic >>> 0
  return () => {
    durum = (durum + 0x6d2b79f5) >>> 0
    let t = durum
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rastgele = uretec(tohum)
const sec = (dizi) => dizi[Math.floor(rastgele() * dizi.length)]

/** İki heceli bir aday: ünsüz + ünlü, bir ya da iki ünsüz, ünlü, sonda ünlü ya da bir ünsüz. */
function aday() {
  let ara = sec(UNSUZLER)
  if (rastgele() < 0.3) {
    const ilk = sec(ARA_ILK_UNSUZLER)
    let ikinci = sec(UNSUZLER)
    while (ikinci === ilk || (ilk === 'n' && (ikinci === 'b' || ikinci === 'p'))) {
      ikinci = sec(UNSUZLER)
    }
    ara = ilk + ikinci
  }
  const son = rastgele() < 0.35 ? '' : sec(SON_UNSUZLER)
  return sec(ILK_SESLER) + sec(UNLULER) + ara + sec(IKINCI_UNLULER) + son
}

const kokDizini = fileURLToPath(new URL('..', import.meta.url))
const sunucu = await createServer({
  root: kokDizini,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
})

let adaylar
try {
  const { uydurmaDenetimi, sonUnlu, YUMUSAMA } = await sunucu.ssrLoadModule('/src/motor/index.ts')
  const { BOLGELER } = await sunucu.ssrLoadModule('/src/oyun/bolgeler.ts')
  const oyundakiler = new Set(BOLGELER.flatMap((b) => b.gorevler.map((g) => g.kok)))
  // Zeyrek bir kısmını eleyeceği için biraz fazlası üretilir.
  const hedef = secenekler.zeyreksiz ? sayi : sayi * 2
  const bulunan = new Set()
  for (let deneme = 0; bulunan.size < hedef && deneme < hedef * 500; deneme++) {
    const kok = aday()
    if (oyundakiler.has(kok) || bulunan.has(kok)) continue
    if (uydurmaDenetimi(kok) === undefined) bulunan.add(kok)
  }
  const sonTuru = (kok) =>
    UNLULER.includes(kok.at(-1)) ? 'ünlü' : Object.hasOwn(YUMUSAMA, kok.at(-1)) ? 'pçtk' : 'öteki'
  adaylar = [...bulunan].map((kok) => ({ kok, son: sonTuru(kok), unlu: sonUnlu(kok) }))
} finally {
  await sunucu.close()
}

if (!secenekler.zeyreksiz) {
  const sonuc = spawnSync('python3', ['scripts/zeyrek-denetimi.py', '--adaylar'], {
    cwd: kokDizini,
    input: adaylar.map((a) => a.kok).join('\n') + '\n',
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'inherit'],
  })
  if (sonuc.status !== 0) {
    console.error(
      'Zeyrek denetimi çalışmadı (pip install zeyrek). Zeyreksiz üretmek için --zeyreksiz ' +
        '(gerçek kelimeler elenmez).',
    )
    process.exit(1)
  }
  const gercek = new Set(sonuc.stdout.split('\n').filter(Boolean))
  adaylar = adaylar.filter((a) => !gercek.has(a.kok))
  console.error(`Zeyrek ${gercek.size} gerçek kelimeyi eledi.`)
}

adaylar = adaylar.slice(0, sayi)
const metin = ['kok\tson\tunlu', ...adaylar.map((a) => `${a.kok}\t${a.son}\t${a.unlu}`)].join('\n')
writeFileSync(secenekler.cikti, metin + '\n')
console.error(
  `${adaylar.length} aday ${secenekler.cikti} dosyasına yazıldı (tohum ${tohum}). ` +
    'Oyuna yalnız onaylanan kökler girer.',
)
