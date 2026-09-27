// scripts/ikon.svg'den public/ altındaki uygulama ikonlarını üretir.
// Kullanım: npm run ikonlar  (Playwright'ın Chromium'u gerekir)
// Üretilen dosyalar depoya işlenir; derleme sırasında yeniden üretilmez.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const kaynak = await readFile(new URL('./ikon.svg', import.meta.url), 'utf8')
const govde = kaynak.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

// "any" ikonlar köşeleri yuvarlatılmış karedir; maskable ve Apple ikonları tam taşar
// (kırpmayı işletim sistemi yapar).
const yuvarlak = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <clipPath id="kose"><rect width="512" height="512" rx="112" /></clipPath>
  <g clip-path="url(#kose)">${govde}</g>
</svg>
`
const tamTasan = kaynak

const cikti = new URL('../public/', import.meta.url)
await mkdir(cikti, { recursive: true })
await writeFile(new URL('favicon.svg', cikti), yuvarlak)

const ikonlar = [
  { dosya: 'pwa-192x192.png', boyut: 192, svg: yuvarlak },
  { dosya: 'pwa-512x512.png', boyut: 512, svg: yuvarlak },
  { dosya: 'maskable-icon-512x512.png', boyut: 512, svg: tamTasan },
  { dosya: 'apple-touch-icon-180x180.png', boyut: 180, svg: tamTasan },
]

const tarayici = await chromium.launch()
try {
  for (const { dosya, boyut, svg } of ikonlar) {
    const sayfa = await tarayici.newPage({ viewport: { width: boyut, height: boyut } })
    const svgBoyutlu = svg.replace('<svg ', `<svg width="${boyut}" height="${boyut}" `)
    await sayfa.setContent(
      `<!doctype html><html><body style="margin:0;background:transparent">${svgBoyutlu}</body></html>`,
    )
    const png = await sayfa.screenshot({ omitBackground: true })
    await writeFile(new URL(dosya, cikti), png)
    await sayfa.close()
    console.log(`public/${dosya}`)
  }
} finally {
  await tarayici.close()
}
