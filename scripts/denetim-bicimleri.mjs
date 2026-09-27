// Biçim Denetim Sayfası'ndaki bütün biçimleri sekmeyle ayrılmış metin olarak yazar:
// kok, etiket, bicim. Sayfanın kullandığı işlevi (src/denetim/veri.ts) Vite üzerinden yükler;
// TypeScript'i ve ?raw içe aktarmalarını Vite çözer. scripts/zeyrek-denetimi.py bunu okur.
//
//   node scripts/denetim-bicimleri.mjs > bicimler.tsv

import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const kokDizini = fileURLToPath(new URL('..', import.meta.url))

const sunucu = await createServer({
  root: kokDizini,
  configFile: false,
  logLevel: 'error',
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, ws: false },
  optimizeDeps: { noDiscovery: true, include: [] },
})

try {
  const { denetimSatirlari } = await sunucu.ssrLoadModule('/src/denetim/veri.ts')
  const satirlar = ['kok\tetiket\tbicim']
  for (const { girdi, bicimler } of denetimSatirlari()) {
    for (const { etiket, bicim } of bicimler) satirlar.push(`${girdi.kok}\t${etiket}\t${bicim}`)
  }
  process.stdout.write(satirlar.join('\n') + '\n')
} finally {
  await sunucu.close()
}
