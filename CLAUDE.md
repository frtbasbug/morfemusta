# Morfemusta — çalışma kılavuzu

İlkokul çocukları (1–4. sınıf) için kâr amacı gütmeyen bir Türkçe biçimbilim oyunu.
Tasarım için `DESIGN.md`, güncel durum ve sıradaki hedef için `NEXT.md` okunur.
**Her oturum `NEXT.md` okunarak başlar.**

## Yığın

- **Vite 8 + React 19 + TypeScript 7** (strict). Node 22 (`.nvmrc`).
- **PWA:** vite-plugin-pwa (`generateSW`, `autoUpdate`). Derlemedeki her şey (yazı tipleri
  dahil) önceden önbelleğe alınır; site bir kez açıldıktan sonra çevrim dışı çalışır.
- **Yazı tipleri:** @fontsource/andika (400 ve 700; harfler ve metin) ve @fontsource/baloo-2
  (800; başlık ve logo, yalnız latin ve latin-ext alt kümeleri), pakete gömülü.
- **Görsel dil:** B · Canlı (`DESIGN.md`, "Görsel dil"); geometri `src/gorsel/cizim.ts`'te,
  belirteçler `src/gorsel/tema.css`'te.
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
`/morfemusta/denetim.html`). Karakter Galerisi: <http://localhost:5173/morfemusta/galeri.html>
(yayında `/morfemusta/galeri.html`). Oyun ikisine de bağlantı vermez.

Oturumu kapatmadan önce: `npm run typecheck && npm test && npm run test:e2e`.

## Klasör yapısı

```
.github/workflows/test-ve-yayin.yml   her push ve PR'da test; main'de Pages'e yayın
e2e/                 Playwright testleri (*.spec.ts); ortak yardımcılar yardimcilar.ts'te
public/              ikonlar ve favicon (scripts/ikonlar.mjs üretir)
scripts/             geliştirme araçları: ikon üretimi, denetim biçimleri, zeyrek denetimi
src/
  main.tsx           oyunun giriş noktası: yazı tipi, belirteçler (tema.css) ve genel stil
                     burada yüklenir
  App.tsx            kök bileşen: kabuk (yönlendirme, ilerleme, ayarların uygulanması)
  genel.css          genel stil (tema.css belirteçleriyle); .gizli yardımcı sınıfı
  ekranlar/          ekran bileşenleri ve yanlarında birim testleri (*.test.tsx): ada haritası
                     (AdaHaritasi), Bukalemun Koyu, Sözlük, Ayarlar, akşam ekranı, alt gezinme;
                     hareket.ts: ekranların hareketleri (Web Animations API, hareket azaltmaya
                     uyar); simgeler.tsx: arayüz simgeleri
  kabuk/             hash yönlendirici (yonlendirici.ts) ve cihaz deposu (depo.ts: localStorage,
                     kalıcı depo isteği, useIlerleme); testleri yanında
  oyun/              oyunun saf mantığı: bölge tablosu (bolgeler.ts), görev tabloları, seçenekler,
                     Bukalemun Koyu'nun durumu (indirgeyici), cihazdaki ilerleme (ilerleme.ts:
                     kayıt, kilitler, Sözlük kartları); testleri yanında
  motor/             biçimbilim motoru: saf TypeScript, genel kapısı index.ts; testleri yanında
  denetim/           Biçim Denetim Sayfası (denetim.html'in girişi, verisi, testleri)
  gorsel/            görsel dil: çizim geometrisi (cizim.ts), bukalemunun kılığı (kilik.ts),
                     belirteçler (tema.css), karakter bileşenleri; testleri yanında
  galeri/            Karakter Galerisi (galeri.html'in girişi, örnekleri, testleri)
icerik/              içerik CSV dosyaları (ekler.csv: ek envanteri; kokler.csv: kök sözlüğü;
                     bolgeler.csv: adanın bölgeleri; gorevler/: bölgelerin görev tabloları,
                     ör. bukalemun-koyu.csv)
tests/               altin-bicimler.csv: motorun altın tablosu; neden.csv: yanlış biçimin
                     nedenleri (motorun neden işlevinin sözleşmesi)
index.html           oyun
denetim.html         Biçim Denetim Sayfası (ayrı giriş sayfası)
galeri.html          Karakter Galerisi (ayrı giriş sayfası)
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
   Oturum 4'te kullanıcının isteğiyle: `@fontsource/baloo-2` (OFL-1.1).
3. **Biçimbilim motoru `src/motor` altındadır ve arayüzden bağımsızdır.** Motor saf
   TypeScript'tir: React'i, DOM'u, CSS'i ya da `src/motor` dışındaki uygulama kodunu içe
   aktarmaz. Arayüz motoru kullanır, motor arayüzü bilmez. Motor Vitest ile `node`
   ortamında sınanır.
4. **İçerik `icerik/*.csv` dosyalarından okunur.** Kelime listeleri ve görevler koda
   gömülmez.
5. **Dış CDN yok.** Yazı tipi ve sesler pakete gömülüdür; çalışma anında başka bir sunucuya
   istek gitmez. Her sayfanın uçtan uca testi (`e2e/*.spec.ts`) bunu denetler.
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
11. **Görsel dil `DESIGN.md`'deki üç kurala uyar.** Karakterler yalnız `src/gorsel/cizim.ts`'ten,
    üç özellikten üretilir; ağız duygu göstermez; renkler yalnız `src/gorsel/tema.css`'teki
    belirteçlerdendir. `cizim.ts`'teki sayılar ve yollar tuvaldekilerdir, kullanıcının onayı
    olmadan değişmez (`cizim.test.ts` başvuru koduyla karşılaştırır).
12. **`tests/neden.csv` ve `icerik/gorevler/*.csv` yalnız kullanıcının onayıyla değişir.**
    Neden tablosu `neden` işlevinin, görev tabloları oyunun sözleşmesidir: testi geçirmek için
    satır değiştirilmez, silinmez, eklenmez. Bir satır yanlış görünürse iş durur ve
    kullanıcıya sorulur. Görev tablosunda doğru biçim yazılmaz; her zaman motordan gelir.
13. **`icerik/bolgeler.csv` de yalnız kullanıcının onayıyla değişir.** Bölge tablosu adanın
    sözleşmesidir: sıra, kimlik, ad, akşam ekranının başlığı ve görev tablosunun yolu.
    `gorevler` sütunu boş olan bölgenin içeriği henüz yoktur (haritada "hazırlanıyor");
    onları Oturum 7 (Fıstıkçı Şahap'ın Dükkânı), 8 (Kök Bahçesi) ve 9 (Uydurukçuklar)
    dolduracak. Testi geçirmek için satır değiştirilmez, silinmez, eklenmez.
14. **Hiçbir veri cihazdan çıkmaz.** İlerleme, Sözlük kartları ve ayarlar yalnız cihazda,
    `localStorage`'da, sürüm numaralı tek anahtarda (`morfemusta.v1`) durur. Sunucuya,
    analitiğe, uzak günlüğe ya da başka bir cihaza gönderilmez; hesap ve eşitleme yok. Depo
    yoksa ya da erişilemiyorsa oyun bellekte sürer. Uçtan uca testler dış isteği ve GET dışı
    isteği denetler.

## Adlandırma

- Kod içi adlar ve yorumlar Türkçedir (`AdaHaritasi`, `yaziTipi`). Dosya ve klasör
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
- **Üç giriş sayfası:** `index.html` (oyun), `denetim.html` (Biçim Denetim Sayfası) ve
  `galeri.html` (Karakter Galerisi). Derleme girişleri `vite.config.ts`'deki
  `build.rolldownOptions.input`'tadır; yeni bir sayfa oraya eklenir. Her sayfa önbelleğe
  girmelidir: service worker önbellekte olmayan bir gezinmeyi `navigateFallback` ile oyunun
  `index.html`'ine düşürür (`e2e/denetim.spec.ts` ve `e2e/galeri.spec.ts` bunu denetler).
- **Görsel dilin bileşenleri:** SVG'de yalnız geometri yazılır; dolgu, çizgi ve kalınlıklar
  `src/gorsel/karakterler.css`'teki sınıflardan ve `tema.css` değişkenlerinden gelir.
  Karakterlerdeki çizgi kalınlıkları birimsizdir (SVG kullanıcı birimi), karakterle
  ölçeklenir. Bileşenler `tema.css`'i kendileri yükler; yazı tipleri sayfa girişinde yüklenir
  (galeri: `src/galeri/main.tsx`). `.renksiz` sınıfının içinde kalın ve ince aynı gridir.
  Kök etiketinin (`UnluEtiketi`) en/boy oranı `cizim.ts`'teki `unluGovdesi`'nden gelir, CSS'te
  yazılmaz. Bukalemun 0.9 ölçeğin altına küçültülmez: ek yazısı ince rengin üstünde 18px'in
  altına inerdi (galeride dar ekranda satır kırılır; `e2e/galeri.spec.ts` denetler). Tek ayrık
  durum haritadaki koy işaretidir (0.42, `yazisiz`: süs; DESIGN.md, "Karşıtlık").
  Birleşen ek (`EkYazisi`) ve kurulan kelime (`KurulanKelime`) de `src/gorsel`'dedir: koy,
  Sözlük ve akşam ekranı aynı görünümü kullanır. Ekin her ünlüsü, kökün son ünlüsü gibi
  `UnluEtiketi`'ndedir; uyum etiketlerin eninden okunur, Renksiz'de de. Etiket kökte
  `--boyut-kok` boyundadır; ek kutusunda, sonuç kelimesinde ve Sözlük kartında yazının
  boyunu alır (`font-size: 1em`).
- **Oyunun mantığı (`src/oyun`):** saf TypeScript; `tsconfig.motor.json` onu da DOM'suz
  derler, `src/oyun/bagimsizlik.test.ts` içe aktarmaları tarar (yalnız motorun genel kapısı,
  kendi dosyaları, `icerik/bolgeler.csv?raw` ve `icerik/gorevler/*.csv?raw`). Bölge tablosu
  görev tablosunu yoluyla gösterir; yolların metinleri `bolgeler.ts`'teki `GOREV_TABLOLARI`'ndadır
  (yeni görev tablosu oraya da eklenir; `bolgeler.test.ts` denetler). Doğruluk motordan gelir: aday `neden` ile
  sınanır, seçenekler (bukalemunun kılıkları) `yuzeySecenekleri`'nden. Seçeneklerin sırası
  `secenekTohumu` ile sabittir; görev tablosu değişirse sıralar da değişir (`koy.test.ts`
  yalnız özelliklerini denetler: doğru bukalemun her yere düşer).
- **Hareketler (`src/ekranlar/hareket.ts`):** Web Animations API; `motion` kurulmadı.
  Hareket azaltma açıksa `oynat` ve `bekle` hemen döner; CSS geçişleri
  `@media (prefers-reduced-motion: no-preference)` içinde ve `:root:not([data-hareket='azalt'])`
  altındadır. Hareket iki yoldan azalır: cihazın ayarı ya da oyunun Ayarlar'ındaki Azalt
  (`html[data-hareket="azalt"]`; `hareketAzMi` ikisine de bakar). Hareket kalıcı stil bırakmaz
  (fill yok): kalıcı durum hareketten önce satır içi stile yazılır. Seçilen bukalemunun
  kalkışı `translate` özelliğiyledir, `transform`'la değil: CSS geçişi basamaklamada
  animasyonların üstündedir; `transform`'a geçiş konsaydı taşıma hareketlerini bozardı.
- **Sürükle-bırak:** Pointer Events ve `setPointerCapture`; bukalemun düğmelerinde
  `touch-action: none`. Sürüklemenin sonundaki tıklama seçim sayılmaz; klavyenin tıklaması
  (`detail` 0) hiç yutulmaz. Uçtan uca testte fareyle `page.mouse`, parmakla CDP
  `Input.dispatchTouchEvent` kullanılır.
- **Playwright'ta hareket azaltma:** `test.use({ contextOptions: { reducedMotion: 'reduce' } })`.
  `reducedMotion` doğrudan `use` seçeneği değildir; tür denetimi yakalar, çalışma anında sessizce
  yok sayılır.
- **Sayfa zemini:** `genel.css` zemini kremdir; haritada `:root:has(.kabuk--harita)` sayfanın
  zeminini denize çevirir. Ekranın zemini sayfanınkinden farklı olursa, 2.625 piksel oranlı
  telefonda (412 px = 1081.5 cihaz pikseli) sağ kenarda ince bir çizgi görünür.
- **CSS yükleme sırası:** derlemede sayfalar arasında paylaşılan CSS parçası (`genel.css`),
  sayfanın kendi CSS'inden **sonra** yüklenir. `genel.css`'i ezmesi gereken kural daha özgül
  seçiciyle yazılır (`:root:has(.kabuk--harita)`, `:root:has(.denetim) body`); aynı özgüllükte
  sıraya güvenilmez.
- **Kurallar testi bütün oyunu tarar:** `src/gorsel/kurallar.test.ts`; ekranlar, kabuk,
  `App.tsx`, `main.tsx` ve `genel.css` (renk yalnız belirteçlerden, gölge ve degrade yok).
  Haritanın stili ve kodu kalın ve ince renklerini (zeminleriyle) hiç anmaz. Biçim Denetim
  Sayfası geliştirici aracıdır, kendi renkleri vardır.
- **Kabuk:** `App.tsx` yönlendirir, ilerlemeyi tutar, ayarları belgenin köküne yazar
  (`html[data-hareket]`, `html[data-renkler]`; tema.css Renksiz'i `:root[data-renkler='renksiz']`
  ile uygular). Yönlendirici (`src/kabuk/yonlendirici.ts`) hash'le çalışır: haritadan açılan
  ekran `pushState`, alt gezinmedeki geçiş `replaceState`; haritaya dönüş, ekran haritadan
  açıldıysa `history.back()` (geçmiş iki adımı aşmaz). Adres elle değişirse `hashchange`,
  geri/ileri `popstate` ile okunur. Harita, Sözlük ve Ayarlar açılınca odak başlıklarına geçer.
- **Cihazdaki ilerleme:** `src/oyun/ilerleme.ts` saf mantıktır, depoyu dışarıdan alır
  (`Depo`: `getItem`, `setItem`); tarayıcıdaki bağlantı `src/kabuk/depo.ts`'tedir. Kayıt
  biçimi `ilerleme.ts`'in başında yazılıdır; biçim değişirse anahtar da değişir
  (`morfemusta.v2`) ve eski kayıt taşınır. Okunan kayıt denetlenir (`ilerlemeyiCoz`): kart
  motorun kurduğu kelime olmalı. Uçtan uca testler kaydı `localStorage`'a yazarak da kurabilir
  (anahtar `e2e/yardimcilar.ts`'te). Aynı cihazdaki pencereler (sekme, ana ekrandaki
  uygulama) kaydı paylaşır: `pencereKaydi` her değişikliği depodaki son kayda uygular (bellekteki
  kopyaya değil); `useIlerleme` başka pencerenin yazdığını `storage` olayıyla alır. O pencere bir
  bölgenin ilerlemesini değiştirdiyse bölgenin dış sürümü artar (`degisenBolgeler`); `App.tsx`
  bunu bölge ekranının `key`'ine koyar, ekran kalınan yerden yeniden açılır.
- **Saf görsel hesaplar:** `src/gorsel/cizim.ts` ve `kilik.ts` motor gibi DOM'suz derlenir
  (`tsconfig.motor.json`) ve yalnız motorun genel kapısını içe aktarır
  (`src/gorsel/bagimsizlik.test.ts`). Ünlü tablosu motorunkidir. Saklanan ünlünün kılığı
  motorun `uyum` işlevinden gelir (Oturum 4'te dışa açıldı); uyum kuralı arayüzde yazılmaz.
- **Vitest ve CSS:** Vitest CSS dosyalarını boş modüle çevirir, `?raw` ile okunanları da.
  `vite.config.ts`'deki `test.css.include` yalnız `?raw` isteklerini Vite'a bırakır; stil
  kaynağını tarayan `src/gorsel/kurallar.test.ts` buna dayanır.
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
