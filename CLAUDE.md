# Morfemusta — çalışma kılavuzu

İlkokul çocukları (1–4. sınıf) için kâr amacı gütmeyen bir Türkçe biçimbilim oyunu.
Tasarım için `DESIGN.md`, güncel durum ve sıradaki hedef için `NEXT.md` okunur.
**Her oturum `NEXT.md` okunarak başlar.**

## Yığın

- **Vite 8 + React 19 + TypeScript 7** (strict). Node 22 (`.nvmrc`).
- **PWA:** vite-plugin-pwa (`generateSW`, `autoUpdate`). Derlemedeki her şey (yazı tipleri
  dahil) önceden önbelleğe alınır; site bir kez açıldıktan sonra çevrim dışı çalışır.
- **Yazı tipi:** @fontsource/andika (400 ve 700), pakete gömülü.
- **Test:** Vitest 5 (birim, `node` ortamı) ve Playwright 1.56.1 (uçtan uca, Pixel 7
  telefon profili, Chromium).
- **Yayın:** GitHub Actions → GitHub Pages, <https://frtbasbug.github.io/morfemusta/>.
  Vite `base` ayarı `/morfemusta/`.

## Komutlar

| Komut | İş |
|-------|----|
| `npm run dev` | Geliştirme sunucusu: <http://localhost:5173/morfemusta/> (service worker yok) |
| `npm run build` | `dist/` altına derler; service worker ve manifest burada üretilir |
| `npm run preview` | Derlenmiş siteyi sunar: <http://localhost:4173/morfemusta/> |
| `npm run typecheck` | Uygulama, araç kodu ve motorun tür denetimi (motor DOM'suz derlenir) |
| `npm test` | Vitest birim testleri |
| `npm run test:e2e` | Playwright: siteyi derler, önizler, telefon boyutunda sınar |
| `npm run ikonlar` | `scripts/ikon.svg`'den `public/` ikonlarını yeniden üretir |
| `node scripts/denetim-bicimleri.mjs` | Biçim Denetim Sayfası'ndaki bütün biçimleri sekmeli metin olarak yazar |
| `python3 scripts/zeyrek-denetimi.py` | O biçimleri zeyrek ile sınar (elle; CI'da yok, aşağıdaki nota bakın) |

Biçim Denetim Sayfası: <http://localhost:5173/morfemusta/denetim.html> (yayında
`/morfemusta/denetim.html`). Oyundan bağlantı verilmez.

Oturumu kapatmadan önce: `npm run typecheck && npm test && npm run test:e2e`.

## Klasör yapısı

```
.github/workflows/test-ve-yayin.yml   her push ve PR'da test; main'de Pages'e yayın
e2e/                 Playwright testleri (*.spec.ts)
public/              ikonlar ve favicon (scripts/ikonlar.mjs üretir)
scripts/             geliştirme araçları: ikon üretimi, denetim biçimleri, zeyrek denetimi
src/
  main.tsx           oyunun giriş noktası: yazı tipi ve genel stil burada yüklenir
  App.tsx            kök bileşen
  genel.css          renk belirteçleri (CSS değişkenleri) ve genel stil
  ekranlar/          ekran bileşenleri ve yanlarında birim testleri (*.test.tsx)
  motor/             biçimbilim motoru: saf TypeScript, genel kapısı index.ts; testleri yanında
  denetim/           Biçim Denetim Sayfası (denetim.html'in girişi, verisi, testleri)
icerik/              içerik CSV dosyaları (ekler.csv: ek envanteri; kokler.csv: kök sözlüğü)
tests/               altin-bicimler.csv: motorun altın tablosu
index.html           oyun
denetim.html         Biçim Denetim Sayfası (ayrı giriş sayfası)
DESIGN.md  NEXT.md  CLAUDE.md
```

## Kurallar

1. **Her oturumda tek hedef.** Hedef `NEXT.md`'de yazılıdır; oturumda başka işe girişilmez.
   Yol üstünde görülen başka işler `NEXT.md`'ye "açık kalanlar" olarak yazılır.
2. **İzinli kitaplıklar:** `react`, `motion`, `vite-plugin-pwa`, `@fontsource/andika`,
   `vitest`, `playwright`. **Yeni bir kitaplık için önce onay istenir.**
   Oturum 1'de iskeletin parçası olarak şu araçlar da kuruldu: `react-dom`, `vite`,
   `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`,
   `@types/node`, `@playwright/test`. Oturum 3'te kullanıcının isteğiyle: `zeyrek`
   (Python; projenin bağımlılığı değil, yalnız `scripts/zeyrek-denetimi.py` için elle kurulur).
3. **Biçimbilim motoru `src/motor` altındadır ve arayüzden bağımsızdır.** Motor saf
   TypeScript'tir: React'i, DOM'u, CSS'i ya da `src/motor` dışındaki uygulama kodunu içe
   aktarmaz. Arayüz motoru kullanır, motor arayüzü bilmez. Motor Vitest ile `node`
   ortamında sınanır.
4. **İçerik `icerik/*.csv` dosyalarından okunur.** Kelime listeleri ve görevler koda
   gömülmez.
5. **Dış CDN yok.** Yazı tipi ve sesler pakete gömülüdür; çalışma anında başka bir sunucuya
   istek gitmez. `e2e/acilis.spec.ts` bunu denetler.
6. **Hiçbir kişisel veri toplanmaz.** Analitik, çerez, hesap, reklam, uzak günlük yok.
   İlerleme saklanması gerekirse yalnız cihazda saklanır, hiçbir yere gönderilmez.
7. **Oturum, testler yeşilken push ile kapanır.** Tür denetimi, birim ve uçtan uca testler
   yeşil olur, `NEXT.md` güncellenir, sonra push edilir.
8. **Altın tablo yalnız kullanıcının onayıyla değişir.** `tests/altin-bicimler.csv` motorun
   sözleşmesidir. Testi geçirmek için satır değiştirilmez, silinmez, eklenmez. Bir satır
   yanlış görünürse iş durur ve kullanıcıya sorulur.
9. **Motor testleri kırmızıyken push yok.** `src/motor` altındaki testlerden (altın tablo
   dahil) biri bile kırmızıysa hiçbir dala push edilmez; ara push da yapılmaz.
10. **`icerik/kokler.csv` yalnız kullanıcının onayıyla değişir.** Kök sözlüğü de motorun
    sözleşmesidir: testi geçirmek için kök ya da işaret değiştirilmez, silinmez, eklenmez.
    Bir satır yanlış görünürse iş durur ve kullanıcıya sorulur.

## Adlandırma

- Kod içi adlar ve yorumlar Türkçedir (`AcilisEkrani`, `yaziTipi`). Dosya ve klasör
  adlarında yalnız ASCII kullanılır (`icerik`, `ekranlar`).
- Dilbilim terimleri `DESIGN.md`'deki gibi kullanılır. Ekler arkafonemle yazılır:
  -lAr, -(I)m, -DA, -CI, -(y)A.

## Teknik notlar ve tuzaklar

- **Alt yol:** Site `/morfemusta/` altında çalışır. `public/` dosyalarına kodda
  `import.meta.env.BASE_URL` ile başvurulur; `/` ile başlayan mutlak yol yazılmaz
  (`index.html`'dekileri Vite kendisi dönüştürür).
- **Service worker yalnız derlemede vardır.** PWA davranışını `npm run test:e2e` ya da
  `npm run build && npm run preview` ile sına.
- **Önbellek kalıbı:** Çalışma anında ayrı dosya olarak istenen yeni bir dosya türü (ör. ses
  için `.mp3`/`.ogg`) eklenirse `vite.config.ts` içindeki `workbox.globPatterns`'a da
  eklenmeli; yoksa o dosya çevrim dışı açılmaz.
- **İki giriş sayfası:** `index.html` (oyun) ve `denetim.html` (Biçim Denetim Sayfası).
  Derleme girişleri `vite.config.ts`'deki `build.rolldownOptions.input`'tadır; yeni bir
  sayfa oraya eklenir. Her sayfa önbelleğe girmelidir: service worker önbellekte olmayan bir
  gezinmeyi `navigateFallback` ile oyunun `index.html`'ine düşürür (`e2e/denetim.spec.ts`
  bunu denetler).
- **Kök sözlüğü (`icerik/kokler.csv`):** sözlükte olmayan kök uydurmadır. Sonu p, ç, t ya
  da k olan her kökte `yumusama` (evet/hayır) yazılı olmalıdır; `src/motor/sozluk.ts`
  işaretleri yüklerken doğrular ve yanlış satırı numarasıyla bildirir.
- **Zeyrek denetimi:** `pip install zeyrek`; betik biçimleri `node scripts/denetim-bicimleri.mjs`
  ile alır (npm bağımlılıkları kurulu olmalı). NLTK'nin `punkt_tab` verisi vekil sunucu
  arkasında inmezse `NLTK_ALLOW_PROXIED_URLOPEN=1` ile çalıştırılır. Zeyrek'in sözlüğünde
  eksik ve eş sesli girdiler var: listedeki biçim için motor değiştirilmez, yalnız incelenir.
- **İçerik CSV'leri `?raw` ile okunur** (`import metin from '../../icerik/ekler.csv?raw'`).
  Vite dosyanın metnini JS paketine gömer; ayrı `.csv` dosyası sunulmadığı için
  `globPatterns`'a eklemek gerekmez, çevrim dışı da çalışır. Motor kendi tür denetiminde
  (`tsconfig.motor.json`) Vite türlerini yüklemez; bu içe aktarmanın türü
  `src/motor/ham-metin.d.ts`'dedir.
- **Motorun bağımsızlığı iki yoldan denetlenir:** `src/motor/bagimsizlik.test.ts` içe
  aktarmaları tarar (yalnız `./*.ts` ve `../../icerik/*.csv?raw` izinli);
  `tsconfig.motor.json` motoru `lib: ["ES2023"]` ile, DOM ve Node türleri olmadan derler.
- **Güncelleme:** vite-plugin-pwa 1.x, `autoUpdate` modunda `clientsClaim` ve
  `skipWaiting` ayarlarını kendiliğinden eklemiyor; bu yüzden `vite.config.ts`'de açıkça
  yazılı. Yeni sürüm sessizce devreye girer.
- **Playwright 1.56.1'e sabittir.** Bulut oturum ortamındaki hazır Chromium
  (`/opt/pw-browsers`, chromium-1194) bu sürümle eşleşir. Yükseltmede bu ortamda tarayıcı
  indirilemeyebilir; o durumda uçtan uca testler yalnız GitHub Actions'ta koşar.
- **Yazı tipi testi:** `document.fonts.check()` kullanılmaz. ı (U+0131) hem `latin` hem
  `latin-ext` aralığında olduğu için, tarayıcı yalnız `latin`'i indirse de `false` döner.
- **Kurulabilirlik:** Başsız Chromium'da CDP `Page.getInstallabilityErrors` her durumda boş
  döner; test olarak işe yaramaz. Kurulabilirlik manifest ve service worker testleriyle
  dolaylı, gerçek telefonda doğrudan denetlenir.
