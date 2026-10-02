/// <reference types="vitest/config" />
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages'te site https://<kullanıcı>.github.io/ekle-bakalim/ altında yayımlanır.
const TABAN = '/ekle-bakalim/'

/**
 * Sürümün commit'i ve tarihi (src/surum.ts; adı orada yazılı): derlenen commit'in kısa özeti ve
 * commit'in günü. Git yoksa (kaynak arşivinden derleme) commit "bilinmiyor", tarih bugün.
 */
function surumBilgisi(): { commit: string; tarih: string } {
  try {
    const [ozet = '', gun = ''] = execFileSync('git', ['log', '-1', '--format=%H%n%cs'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .trim()
      .split('\n')
    if (/^[0-9a-f]{40}$/.test(ozet) && /^\d{4}-\d{2}-\d{2}$/.test(gun)) {
      return { commit: ozet.slice(0, 7), tarih: gun }
    }
  } catch {
    // Git yok ya da depo değil.
  }
  return { commit: 'bilinmiyor', tarih: new Date().toISOString().slice(0, 10) }
}
const SURUM = surumBilgisi()

// Sesler (scripts/ses-uret.py üretir, public/ses/): arayüzün ve Bukalemun Koyu'nun sesleri
// önceden önbelleğe alınır; öteki bölgelerinki bölgeye ilk girişte arka planda iner
// (src/ses/calar.ts) ve aynı önbellekten çalar. Dosyanın adı metnin özeti, sürümü içeriğinin.
const sesListesi = JSON.parse(
  readFileSync(new URL('src/ses/ses-listesi.json', import.meta.url), 'utf8'),
) as { metinler: Record<string, { dosya: string; bolgeler: string[]; surum?: string }> }
const ONCEDEN_INEN_SESLER = Object.values(sesListesi.metinler)
  .filter(({ bolgeler }) => bolgeler.includes('arayuz') || bolgeler.includes('koy'))
  .map(({ dosya, surum }) => ({ url: `ses/${dosya}`, revision: surum ?? null }))
/** src/ses/onbellek.ts'teki SES_ONBELLEGI. */
const SES_ONBELLEGI = 'morfemusta-ses'

/**
 * Oyunun paketine ses listesinin yalnız gereken alanları girer: ses-listesi.json?oyun, metinden
 * [dosyanın özeti, sürüm, ...bölgeler] dizisine (src/ses/calar.ts). Okunuş, boyut, hız ve sözcükler
 * yalnız üretecin ve Ses Denetim Sayfası'nındır (o sayfa listenin tamamını alır).
 */
function sesListesiOyun(): Plugin {
  // Sanal modül: Vite'ın JSON eklentisi .json?oyun'u JSON sanmasın.
  const SANAL = '\0morfemusta:ses-listesi-oyun'
  const yol = fileURLToPath(new URL('src/ses/ses-listesi.json', import.meta.url))
  return {
    name: 'morfemusta:ses-listesi-oyun',
    enforce: 'pre',
    resolveId(kaynak) {
      return kaynak.endsWith('ses-listesi.json?oyun') ? SANAL : null
    },
    load(kimlik) {
      if (kimlik !== SANAL) return null
      this.addWatchFile(yol)
      const tam = JSON.parse(readFileSync(yol, 'utf8')) as typeof sesListesi
      const oyun = Object.fromEntries(
        Object.entries(tam.metinler).map(([metin, { dosya, surum, bolgeler }]) => [
          metin,
          [dosya.replace(/\.mp3$/, ''), surum ?? '', ...bolgeler],
        ]),
      )
      return `export default ${JSON.stringify(oyun)}`
    },
  }
}

export default defineConfig({
  base: TABAN,
  // Sürümün commit'i ve tarihi pakete girer (src/derleme.d.ts, src/surum.ts).
  define: {
    __SURUM_COMMIT__: JSON.stringify(SURUM.commit),
    __SURUM_TARIHI__: JSON.stringify(SURUM.tarih),
  },
  build: {
    rolldownOptions: {
      // Giriş sayfaları: oyun, Biçim Denetim Sayfası, Karakter Galerisi, Ses Denetim Sayfası,
      // Cihaz Denetimi, pilot sayfası ve pilotun üç yazdırılabilir belgesi. Oyun ötekilere
      // bağlantı vermez (yalnız eski tarayıcı uyarısı cihaz.html'e; belgelere pilot.html
      // bağlanır). Hepsi önbelleğe girer; girmeselerdi service worker oraya giden gezinmeyi
      // oyunun index.html'ine yönlendirirdi (navigateFallback).
      input: {
        oyun: fileURLToPath(new URL('index.html', import.meta.url)),
        denetim: fileURLToPath(new URL('denetim.html', import.meta.url)),
        galeri: fileURLToPath(new URL('galeri.html', import.meta.url)),
        ses: fileURLToPath(new URL('ses.html', import.meta.url)),
        cihaz: fileURLToPath(new URL('cihaz.html', import.meta.url)),
        pilot: fileURLToPath(new URL('pilot.html', import.meta.url)),
        'gozlem-formu': fileURLToPath(new URL('belgeler/gozlem-formu.html', import.meta.url)),
        'veli-onay-formu': fileURLToPath(new URL('belgeler/veli-onay-formu.html', import.meta.url)),
        'gozlemci-yonergesi': fileURLToPath(
          new URL('belgeler/gozlemci-yonergesi.html', import.meta.url),
        ),
      },
    },
  },
  plugins: [
    react(),
    sesListesiOyun(),
    VitePWA({
      // registerSW.js service worker'ı yalnız kaydeder: sayfa yenilenmez, çocuğa güncelleme
      // sorusu sorulmaz. Yeni sürüm bekler (skipWaiting yok, aşağıda).
      registerType: 'prompt',
      injectRegister: 'script-defer',
      manifest: {
        id: TABAN,
        name: 'Ekle Bakalım',
        short_name: 'Ekle Bakalım',
        description:
          'Kök ve ek yaratıklarıyla kelime büyüsü: ilkokul çocukları için Türkçe biçimbilim oyunu.',
        lang: 'tr',
        dir: 'ltr',
        start_url: TABAN,
        scope: TABAN,
        display: 'standalone',
        // tema.css'teki --zemin: açılış ekranının (ada haritası) ve oyun ekranlarının krem
        // zemini. Manifest belirteç okuyamaz; değer burada yazılıdır (e2e/acilis.spec.ts denetler).
        background_color: '#FFF6E9',
        theme_color: '#FFF6E9',
        categories: ['education', 'games', 'kids'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Çevrim dışı çalışma için her şey (yazı tipleri dahil) önceden önbelleğe alınır.
        // woff dosyaları alınmaz: woff2'yi desteklemeyen tarayıcı hedefte yok.
        // Emojiler (public/emoji/*.svg) de burada. Sesler (mp3) kalıpta yok: yalnız arayüzün ve
        // koyun sesleri listeden eklenir, ötekiler çalışma anında önbelleğe iner.
        globPatterns: ['**/*.{html,js,css,svg,png,woff2}'],
        additionalManifestEntries: ONCEDEN_INEN_SESLER,
        runtimeCaching: [
          {
            // İşlev değil düzenli ifade: kalıp service worker'a metin olarak kopyalanır.
            // Önceden inmeyen seslerin adresinde sürüm var (?v=…, src/ses/calar.ts).
            urlPattern: /\/ekle-bakalim\/ses\/.+\.mp3(\?.*)?$/,
            handler: 'CacheFirst',
            options: { cacheName: SES_ONBELLEGI },
          },
        ],
        // Yeni sürüm açık sayfayı devralmaz: o açılışta eski sürüm sürer (eski önbellekle; sayfa
        // yenilenmez, bozulmaz), yeni sürüm oyunun bütün pencereleri kapanınca, bir sonraki
        // açılışta devreye girer. İlk kurulumda sayfa hemen denetlenir (clientsClaim): ilk
        // açılıştan sonra çevrim dışı da açılır.
        clientsClaim: true,
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    // Vitest CSS dosyalarını boş modüle çevirir, ?raw ile okunanları da. Stil kaynağını
    // metin olarak okuyan testler (src/gorsel/kurallar.test.ts) için ?raw istekleri
    // Vite'a bırakılır; yan etki olarak yüklenen CSS yine boştur.
    css: { include: [/[?&]raw\b/] },
  },
})
