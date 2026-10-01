// Oyunun söyleyebileceği bütün metinleri (sesMetinleri, src/ses/metinler.ts) okunuşlarıyla
// JSON olarak yazar: [{ "metin", "okunus", "sozcukler", "bolgeler": ["koy"] }]; sozcukler,
// okunuşta geçen icerik/ses-sozcuk.csv sözcükleri ({ sozcuk, ipa }). TypeScript'i ve ?raw içe
// aktarmalarını Vite çözer. scripts/ses-uret.py bunu okur.
//
//   node scripts/ses-metinleri.mjs > metinler.json

import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const kokDizini = fileURLToPath(new URL('..', import.meta.url))

const sunucu = await createServer({
  root: kokDizini,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  optimizeDeps: { noDiscovery: true, include: [] },
})

try {
  const { sesMetinleri } = await sunucu.ssrLoadModule('/src/ses/metinler.ts')
  const { okunus, sozcukOkunuslari } = await sunucu.ssrLoadModule('/src/ses/okunus.ts')
  const metinler = new Map()
  for (const { kimlik, metinler: grup } of sesMetinleri()) {
    for (const metin of grup) {
      const yazi = okunus(metin)
      const kayit = metinler.get(metin) ?? {
        metin,
        okunus: yazi,
        sozcukler: sozcukOkunuslari(yazi),
        bolgeler: [],
      }
      kayit.bolgeler.push(kimlik)
      metinler.set(metin, kayit)
    }
  }
  process.stdout.write(JSON.stringify([...metinler.values()], null, 1) + '\n')
} finally {
  await sunucu.close()
}
