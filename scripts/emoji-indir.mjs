// icerik/emoji.csv'deki emojilerin SVG dosyalarını Twemoji'nin özgün deposundan
// (github.com/jdecked/twemoji, sabit sürüm) public/emoji/ altına indirir. Yalnız tablodakiler
// iner; tabloda olmayan eski dosyalar silinir. Grafiklerin lisansı CC BY 4.0'dır (atıf
// README'de ve Ayarlar'daki Hakkında'da). Elle çalıştırılır; CI'da yok. Dosyalar git'e girer.
//
//   node scripts/emoji-indir.mjs
//   NODE_USE_ENV_PROXY=1 node scripts/emoji-indir.mjs   # vekil sunucu arkasında

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const TWEMOJI_SURUMU = 'v16.0.1'
const KAYNAK = `https://raw.githubusercontent.com/jdecked/twemoji/${TWEMOJI_SURUMU}/assets/svg/`

const kokDizini = fileURLToPath(new URL('..', import.meta.url))
const hedef = fileURLToPath(new URL('../public/emoji/', import.meta.url))

const sunucu = await createServer({
  root: kokDizini,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
})

try {
  const { EMOJILER } = await sunucu.ssrLoadModule('/src/gorsel/emoji.ts')
  await mkdir(hedef, { recursive: true })
  const gerekli = new Set()
  for (const [kok, { emoji, dosya }] of EMOJILER) {
    gerekli.add(dosya)
    const yanit = await fetch(KAYNAK + dosya)
    if (!yanit.ok) throw new Error(`${kok} ${emoji} (${dosya}): ${yanit.status}`)
    await writeFile(hedef + dosya, await yanit.text())
    process.stdout.write(`${kok}\t${emoji}\t${dosya}\n`)
  }
  for (const dosya of await readdir(hedef)) {
    if (!gerekli.has(dosya)) await rm(hedef + dosya)
  }
} finally {
  await sunucu.close()
}
