# Morfemusta — çalışma kılavuzu

İlkokul çocukları (1–4. sınıf) için kâr amacı gütmeyen bir Türkçe biçimbilim oyunu.
Tasarım için `DESIGN.md`, güncel durum ve sıradaki hedef için `NEXT.md` okunur.
**Her oturum `NEXT.md` okunarak başlar.**

## Yığın

- **Vite 8 + React 19 + TypeScript 7** (strict). Node 22 (`.nvmrc`).
- **PWA:** vite-plugin-pwa (`generateSW`). Derlemedeki her şey (yazı tipleri dahil) önceden
  önbelleğe alınır; site bir kez açıldıktan sonra çevrim dışı çalışır. Yeni sürüm açık sayfayı
  yenilemez, sonraki açılışta devreye girer.
- **Yazı tipleri:** @fontsource/andika (400 ve 700; harfler ve metin) ve @fontsource/baloo-2
  (800; başlık ve logo), ikisi de yalnız latin ve latin-ext alt kümeleriyle, pakete gömülü.
- **Görsel dil:** B · Canlı (`DESIGN.md`, "Görsel dil"); geometri `src/gorsel/cizim.ts`'te,
  belirteçler `src/gorsel/tema.css`'te.
- **Ses ve resim:** sesler yapay zekâyla, Google Cloud Text-to-Speech'in Chirp 3: HD Callirrhoe
  sesiyle önceden üretilir (kodun MIT lisansı ses dosyalarını kapsamaz), MP3 olarak `public/ses/`'tedir; köklerin resmi Twemoji SVG'leridir
  (CC BY 4.0), `public/emoji/`'dedir. İkisi de pakete gömülüdür (`DESIGN.md`, "Ses ve resim").
  Efektler (doğru, yanlış, büyü) dosya değildir: tarayıcıda Web Audio ile üretilir.
- **Test:** Vitest 5 (birim, `node` ortamı) ve Playwright 1.56.1 (uçtan uca, Pixel 7
  telefon profili, Chromium; `e2e/pilot.spec.ts` ayrıca iPhone 13 profiliyle WebKit'te);
  erişilebilirlik taraması @axe-core/playwright ile.
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
| `npm run test:e2e` | Playwright: siteyi derler, önizler, telefon boyutunda sınar (pilot testleri WebKit'te de; WebKit kurulu değilse yerelde atlanır, CI koşar) |
| `npm run ikonlar` | `scripts/ikon.svg`'den `public/` ikonlarını yeniden üretir |
| `node scripts/denetim-bicimleri.mjs` | Biçim Denetim Sayfası'ndaki bütün biçimleri sekmeli metin olarak yazar |
| `python3 scripts/zeyrek-denetimi.py` | O biçimleri zeyrek ile sınar (elle; CI'da yok, aşağıdaki nota bakın) |
| `python3 scripts/ses-uret.py` | Sesleri Cloud Text-to-Speech'le üretir (`GOOGLE_TTS_KEY` gerekir): `public/ses/*.mp3` ve `src/ses/ses-listesi.json` (elle; CI'da yok, aşağıdaki nota bakın) |
| `node scripts/ses-metinleri.mjs` | Oyunun söyleyebileceği bütün metinler, okunuşlarıyla (JSON; üreteç okur) |
| `NODE_USE_ENV_PROXY=1 node scripts/emoji-indir.mjs` | `icerik/emoji.csv`'deki emojilerin Twemoji SVG'lerini `public/emoji/`'ye indirir |
| `node scripts/uydurma-uret.mjs --tohum 7 --sayi 30` | Uydurma kök adayları: `uydurma-adaylari.tsv` (zeyrek gerekir; `--zeyreksiz` ile onsuz) |

Biçim Denetim Sayfası: <http://localhost:5173/morfemusta/denetim.html> (yayında
`/morfemusta/denetim.html`). Karakter Galerisi: <http://localhost:5173/morfemusta/galeri.html>
(yayında `/morfemusta/galeri.html`). Ses Denetim Sayfası: <http://localhost:5173/morfemusta/ses.html>
(yayında `/morfemusta/ses.html`). Cihaz Denetimi: <http://localhost:5173/morfemusta/cihaz.html>
(yayında `/morfemusta/cihaz.html`). Pilot sayfası: <http://localhost:5173/morfemusta/pilot.html>
(yayında `/morfemusta/pilot.html`); üç belgesi `belgeler/*.html`. Oyun ilk üçüne ve pilot
sayfasına bağlantı vermez; Cihaz Denetimi'ne yalnız eski tarayıcı uyarısından bağlanır. Sınıf modu adresle de açılır: `?sinif=1` (kapatır: `?sinif=0`).

Oturumu kapatmadan önce: `npm run typecheck && npm test && npm run test:e2e`.

## Klasör yapısı

```
.github/workflows/test-ve-yayin.yml   her push ve PR'da test; main'de Pages'e yayın
e2e/                 Playwright testleri (*.spec.ts); ortak yardımcılar yardimcilar.ts'te
public/              ikonlar ve favicon (scripts/ikonlar.mjs üretir); ses/: sesler (ses-uret.py
                     üretir); emoji/: köklerin Twemoji SVG'leri (emoji-indir.mjs indirir)
scripts/             geliştirme araçları: ikon üretimi, denetim biçimleri, zeyrek denetimi, ses
                     üretimi, emoji indirme
src/
  main.tsx           oyunun giriş noktası: yazı tipi, belirteçler (tema.css) ve genel stil
                     burada yüklenir
  App.tsx            kök bileşen: kabuk (yönlendirme, ilerleme, ayarların uygulanması)
  genel.css          genel stil (tema.css belirteçleriyle); .gizli yardımcı sınıfı
  ekranlar/          ekran bileşenleri ve yanlarında birim testleri (*.test.tsx): ada haritası
                     (AdaHaritasi), Bukalemun Koyu, Fıstıkçı Şahap'ın Dükkânı (FistikciSahap),
                     Kök Bahçesi (KokBahcesi), Uydurukçuklar (Uydurukcuklar),
                     bölge ekranlarının üst çubuğu (BolgeUstu), Sözlük, Ayarlar, akşam ekranı,
                     alt gezinme, sınıf modunun işareti ve bağlamı (SinifIsareti);
                     Sinif.css: sınıf modunun görünümü (geniş yatay ekran);
                     hareket.ts: ekranların hareketleri (Web Animations API, hareket azaltmaya
                     uyar); parilti.ts: doğrunun parıltısı; simgeler.tsx: arayüz simgeleri
  kabuk/             hash yönlendirici (yonlendirici.ts), cihaz deposu (depo.ts: localStorage,
                     kalıcı depo isteği, useIlerleme), adresteki sınıf modu (sinif.ts), ana
                     ekran ipucu (ipucu.ts), deneme günlüğünün bağlantısı (gunluk.tsx:
                     GunlukSaglayici, useDenemeGunlugu); testleri yanında (es5.test.ts: eski tarayıcı
                     betiklerinin ES5 denetimi)
  oyun/              oyunun saf mantığı: bölge tablosu (bolgeler.ts), görev tabloları (turlarıyla),
                     seçenekler, Bukalemun Koyu'nun (koy.ts), dükkânın (dukkan.ts), bahçenin
                     (bahce.ts) ve Uydurukçuklar'ın (uyduruk.ts) durumu (indirgeyici),
                     cihazdaki ilerleme (ilerleme.ts:
                     kayıt, kilitler, Sözlük kartları), pilotun deneme günlüğü (gunluk.ts:
                     satır, yazıcı, Yeni çocuk, özet, CSV); testleri yanında
  pilot/             pilot sayfası (pilot.html'in girişi, PilotSayfasi.tsx, testi)
  belgeler/          belgelerin stili (belge.css: A4, siyah beyaz, gömülü Andika)
  surum.ts           sürümün adı (pilot-1); commit ve tarih derlemede (derleme.d.ts)
  motor/             biçimbilim motoru: saf TypeScript, genel kapısı index.ts; testleri yanında;
                     ünsüz sınırı sinir.ts'te (sinirSecenekleri), ek sırası sira.ts'te
                     (ekSirasiHatasi), uydurma kök denetimi uydurma.ts'te (uydurmaDenetimi)
  denetim/           Biçim Denetim Sayfası (denetim.html'in girişi, verisi, testleri)
  gorsel/            görsel dil: çizim geometrisi (cizim.ts), ünsüz karosu (karo.ts, Karo.tsx),
                     ağaç (agac.ts, Agac.tsx), cep (cep.ts), bukalemunun kılığı (kilik.ts),
                     yaratık (yaratik.ts, Yaratik.tsx), köklerin resmi (emoji.ts, KokResmi.tsx),
                     belirteçler (tema.css), karakter bileşenleri; testleri yanında
  galeri/            Karakter Galerisi (galeri.html'in girişi, örnekleri, testleri)
  ses/               ses: oyunun söyleyebileceği metinler (metinler.ts: sesMetinleri), okunuş
                     (okunus.ts: harf adları, okunuş tablosu), çalar (calar.ts: tek ses,
                     önbellek, iOS'ta ilk dokunuş), efektler (efekt.ts: Web Audio, notalar),
                     arayüz (Ses.tsx: ayar, sesli mod, sonucun sesi, hoparlör), ses-listesi.json
                     (metinden dosyaya; ses-uret.py yazar); testleri yanında
  sesdenetim/        Ses Denetim Sayfası (ses.html'in girişi)
icerik/              içerik CSV dosyaları (ekler.csv: ek envanteri; kokler.csv: kök sözlüğü;
                     bolgeler.csv: adanın bölgeleri; yasakli-diziler.csv: uydurma kökte
                     yasak diziler; emoji.csv: köklerin emojisi; ses-okunus.csv: yanlış okunan
                     metinlerin okunuşu; ses-sozcuk.csv: yanlış okunan sözcüklerin IPA
                     okunuşu; gorevler/: bölgelerin görev tabloları,
                     bukalemun-koyu.csv, fistikci-sahap.csv, kok-bahcesi.csv ve uydurukcuklar.csv)
tests/               altin-bicimler.csv: motorun altın tablosu; neden.csv ve neden-unsuz.csv:
                     yanlış biçimin nedenleri (motorun neden işlevinin sözleşmesi; uyum, gövde
                     ve ek başı); neden-kaynastirma.csv: kaynaştırma nedeni; ek-sirasi.csv: ek
                     sırası denetiminin sözleşmesi; uydurma-denetimi.csv: uydurma kök denetimi
index.html           oyun
denetim.html         Biçim Denetim Sayfası (ayrı giriş sayfası)
galeri.html          Karakter Galerisi (ayrı giriş sayfası)
ses.html             Ses Denetim Sayfası (ayrı giriş sayfası)
cihaz.html           Cihaz Denetimi (ayrı giriş sayfası; modülsüz, ES5, satır içi)
pilot.html           pilot sayfası (ayrı giriş sayfası; yetişkin için, adresle açılır)
belgeler/            pilotun üç yazdırılabilir belgesi (gozlem-formu.html, veli-onay-formu.html,
                     gozlemci-yonergesi.html; ayrı giriş sayfaları)
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
   Oturum 4'te kullanıcının isteğiyle: `@fontsource/baloo-2` (OFL-1.1). Oturum 10'da
   kullanıcının isteğiyle: `lameenc` (Python; projenin bağımlılığı değil, yalnız
   `scripts/ses-uret.py` için elle kurulur) ve Twemoji'nin grafikleri (paket değil: tablodaki
   emojilerin SVG dosyaları `public/emoji/`'de). Oturum 10b'de `piper-tts` kalktı: sesler Google
   Cloud Text-to-Speech'in REST arayüzüyle üretilir (kitaplık yok, yalnız `urllib`). Oturum 11'de
   kullanıcının isteğiyle: `@axe-core/playwright` (MPL-2.0; geliştirme bağımlılığı, yalnız
   erişilebilirlik testleri için; `axe-core`'u getirir).
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
12. **`tests/neden.csv`, `tests/neden-unsuz.csv`, `tests/neden-kaynastirma.csv`,
    `tests/ek-sirasi.csv`, `tests/uydurma-denetimi.csv` ve `icerik/gorevler/*.csv` yalnız
    kullanıcının onayıyla değişir.**
    Neden tablosu `neden` işlevinin, ek sırası tablosu `ekSirasiHatasi`'nın, görev tabloları
    oyunun sözleşmesidir: testi geçirmek için
    satır değiştirilmez, silinmez, eklenmez. Bir satır yanlış görünürse iş durur ve
    kullanıcıya sorulur. Görev tablosunda doğru biçim yazılmaz; her zaman motordan gelir.
13. **`icerik/bolgeler.csv` de yalnız kullanıcının onayıyla değişir.** Bölge tablosu adanın
    sözleşmesidir: sıra, kimlik, ad, akşam ekranının başlığı ve görev tablosunun yolu.
    `gorevler` sütunu boş olan bölgenin içeriği henüz yoktur (haritada "hazırlanıyor");
    Oturum 7 (Fıstıkçı Şahap'ın Dükkânı), 8 (Kök Bahçesi) ve 9 (Uydurukçuklar) doldurdu.
    Testi geçirmek için satır değiştirilmez, silinmez, eklenmez. (Oturum 7'de dükkânın,
    Oturum 8'de bahçenin, Oturum 9'da Uydurukçuklar'ın satırı kullanıcının onayıyla doldu.)
14. **Hiçbir veri cihazdan çıkmaz.** İlerleme, Sözlük kartları ve ayarlar yalnız cihazda,
    `localStorage`'da, sürüm numaralı tek anahtarda (`morfemusta.v1`) durur. Sunucuya,
    analitiğe, uzak günlüğe ya da başka bir cihaza gönderilmez; hesap ve eşitleme yok. Depo
    yoksa ya da erişilemiyorsa oyun bellekte sürer. Uçtan uca testler dış isteği ve GET dışı
    isteği denetler.

15. **Uydurma kökler ve yasaklı diziler yalnız kullanıcının onayıyla değişir.** Uydurma kökler
    `icerik/gorevler/uydurukcuklar.csv`'dedir; yasaklı diziler `icerik/yasakli-diziler.csv`'de.
    Testi geçirmek için kök ya da dizi değiştirilmez, silinmez, eklenmez. Üreteç
    (`scripts/uydurma-uret.mjs`) yalnız aday dosyası yazar; oyuna hiçbir kök onaysız girmez.

16. **`icerik/emoji.csv`, `icerik/ses-okunus.csv` ve `icerik/ses-sozcuk.csv` yalnız kullanıcının
    onayıyla değişir.** Emoji tablosu köklerin resmidir (her kökü sözlükte; `emoji.test.ts`
    denetler); okunuş tablosu yanlış okunan metnin okunuşudur, üreteç onu kullanır; sözcük tablosu
    yanlış okunan sözcüğün IPA okunuşudur (`sozcuk,ipa`), üreteç onu geçtiği her metinde
    Cloud Text-to-Speech'e `customPronunciations` olarak verir. Testi geçirmek için satır değiştirilmez,
    silinmez, eklenmez. Bir satır yanlış görünürse iş durur ve kullanıcıya sorulur.

17. **Pilot sürerken main'e yalnız pilot düzeltmeleri girer** ve her biri sürüm adını artırır
    (`src/surum.ts`: pilot-1 → pilot-1.1 → pilot-1.2). Yeni özellik pilot bitene kadar beklemeye
    alınır (NEXT.md'ye yazılır). Pilotun deneme günlüğü yalnız cihazda kalır: hiçbir şey
    kendiliğinden gönderilmez (6. ve 14. kural); günlüğün biçimi değişirse anahtarı da değişir
    (`morfemusta.pilot.v2`).

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
- **Giriş sayfaları:** `index.html` (oyun), `denetim.html` (Biçim Denetim Sayfası),
  `galeri.html` (Karakter Galerisi), `ses.html` (Ses Denetim Sayfası), `cihaz.html` (Cihaz
  Denetimi), `pilot.html` (pilot sayfası) ve üç belge (`belgeler/*.html`). Derleme girişleri `vite.config.ts`'deki
  `build.rolldownOptions.input`'tadır; yeni bir sayfa oraya eklenir. Her sayfa önbelleğe
  girmelidir: service worker önbellekte olmayan bir gezinmeyi `navigateFallback` ile oyunun
  `index.html`'ine düşürür (`e2e/denetim.spec.ts`, `e2e/galeri.spec.ts`, `e2e/ses.spec.ts` ve
  `e2e/cihaz.spec.ts` bunu denetler).
- **Eski tarayıcı:** `cihaz.html` modülsüzdür: tek, satır içi, ES5 betik ve satır içi stil (yazı
  tipi, paket, belirteç yok; renkleri tema.css'tekilerin değerleri, kurallar testi taramaz).
  `index.html`'deki eski tarayıcı uyarısı (`#eski-tarayici`, `role="alert"`, `hidden`) da ES5
  satır içi betiktir: `noModule` yoksa hemen, varsa `load`'da oyun açılmamışsa
  (`html[data-acildi]` yok; `main.tsx` render'dan önce yazar) görünür. İkisinin ES5 olduğunu
  `src/kabuk/es5.test.ts` Vite'ın ayrıştırıcısıyla (`parseAst`, ESTree) denetler: ok işlevi,
  şablon metni, let/const, çağrıda sondaki virgül... TypeScript 7'nin JS derleyici arayüzü
  yok; ayrıştırma için `ts.createSourceFile` kullanılamaz.
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
- **Fıstıkçı Şahap'ın Dükkânı:** doğru karo motordan gelir: `sinirSecenekleri` görevin
  sınırını (gövde ya da ek başı, taş ve jöle harfleri, doğrular) verir; `neden(kok, etiketler,
  parcalar, govde)` adayı sınar. Görev tablosunun `renksiz` sütunu yoktur; `gorevleriOku` bu
  sütunu isteğe bağlı okur. Görevin tam bir sınırı olmalı (`gorevinSiniri` hata verir). Karonun
  geometrisi `src/gorsel/karo.ts`'tedir, `cizim.ts`'e yazılmadı (oradaki sayılar tuvalinkidir).
  Bölge ekranları `App.tsx`'teki `BOLGE_EKRANLARI`'nda, aynı kabuk özellikleriyle durur.
- **Kök Bahçesi:** hedef, sepetteki yüzeyler ve gövde kelimeleri motordan gelir
  (`bahceGorevi`, `src/oyun/bahce.ts`); görevin en az bir yapım, en çok bir çekim eki olmalı ve
  çekim en sonda (değilse hata). Yanlış seçimin nedeni `meyve` (motorun `ekSirasiHatasi`'ndan)
  ya da `önce`dir. Kart yalnız gövdeden düşer: ekran `onGorevBitti(gorev, kartEkleri)` ile
  gövde kelimelerinin eklerini verir, `gorevBitti` onları kart yapar (verilmezse kart görevin
  kelimesidir). Ağacın geometrisi `src/gorsel/agac.ts`'te, cebinki `cep.ts`'te (saf; koy da
  kullanır). Sepetin sırası `sepetTohumu` ile sabittir.
- **Uydurukçuklar:** görev tablosu turludur (`tur,sira,kok,ekler`); `gorevleriOku` onu da okur.
  `Gorev.sira` bütün tablodaki sıradır (1–100), `tur` ve `turdakiSira` ayrıca. İlerleme kaydın
  biçimini değiştirmeden tutulur: `kaldigi` bütün tablodaki yerdir (10 = 2. turun başı), ekran
  `turunYeri` ile turunu oynar. `bolgeBittiMi` bir turu biten bölgeyi tamam sayar (tursuz bölgede
  tek tur bütün görevlerdir). Kıyıdaki kılıklar `adimiKur(..., { kaynastirma: true, unsuz: true })`
  ile gelir (`yuzeySecenekleri`'nin seçenekleri: `neden`'in kabul ettiği bütün yüzeyler; LOC'ta
  da, de, ta, te). Sınır adımında kart çocuğun seçtiği biçimi
  saklar: ekran `onGorevBitti(gorev, undefined, kelime)`; `kartiCoz` kelimeyi
  `olasiBicimler`'de arar. Sözlük ve akşam ekranı parçaları o biçimden okur (`kurulanEkleme`).
- **Ses (`src/ses`):** oyunun söyleyebileceği her metin `sesMetinleri()`'ndedir, bölge bölge
  (arayüz, sonra bölgeler); ekranlar aynı işlevlerle söyler (kök, `adim.parca.govde + yuzey`,
  `adim.bicim`, `deneme.cumle`, `sinirCumlesi`, `simdikiKelime`). Yeni bir söylenecek metin önce
  `metinler.ts`'e girer, sonra sesi üretilir; `metinler.test.ts` her metnin
  `ses-listesi.json`'da dosyası olduğunu ve okunuşunun güncel olduğunu denetler. Okunuş
  (`okunus.ts`): tek harf adıyla (p → pe, ğ → yumuşak ge), ok ve tire okunmaz,
  `icerik/ses-okunus.csv`'deki okunuş önce gelir. Sözcük okunuşu (`sozcukOkunuslari`):
  `icerik/ses-sozcuk.csv`'deki sözcük okunuşta bütün sözcük olarak geçiyorsa (büyük-küçük harf
  tablodaki gibi) IPA'sı listeye (`sozcukler`) ve isteğe girer. Çalar (`calar.ts`): tek `<audio>`, yeni çalma
  eskisini keser; dosya fetch'le blob olarak alınır (Range isteği yok); listede olmayan metin
  için istek gitmez; hata yutulur, konsola yazılmaz. iOS'ta ilk dokunuşta sessiz bir WAV çalınır
  (`sesiAc`, `main.tsx`). Ayar (`ayarlar.ses`: kapali / dokununca / sesli, varsayılan dokununca)
  `SesSaglayici` ile verilir; sağlayıcı yokken Kapalı'dır (birim testleri, galeri). Sesli modda
  bölge ekranı girişte bölgenin adını, sonra kökü söyler (haritadaki ad girişte kesilirdi).
- **Efektler (`src/ses/efekt.ts`):** notalar saf veridir (`EFEKTLER`: doğru, yanlış, büyü);
  tarayıcı onları osilatör ve kazançla çalar (`efektCal`), birim testleri aynı tabloyu örnekler
  (`ornekle`: süre, yükseklik, yükseklik sınırı). Kapalı'da `efektlereIzinVer(false)`
  (`SesSaglayici`): AudioContext hiç kurulmaz. iOS'ta Web Audio ilk dokunuşla açılır
  (`efektleriAc`, `sesiAc`'ın dinleyicisi). Ekranlar sonucu `useSes().sonuc(tur, metin)` ile
  bildirir (`sonucPlani`): efekt, sesli modda ardından metin `cal(metinler, gecikme)` ile
  (gecikme efektin süresi; o arada yeni çalma ya da `sus` gelirse söylenmez). Büyü
  `useSes().buyu()`. Efekt `<audio>`'ya dokunmaz: çalan konuşma kesilmez. Uçtan uca testler
  `OscillatorNode.prototype.start`'ı sarar (`e2e/efekt.spec.ts`).
- **Parıltı (`src/ekranlar/parilti.ts`):** `parlat(oge)` kelimenin kutusunun çevresinde altı
  yıldızcık çizer: `document.body`'ye eklenen sabit (`position: fixed`), `aria-hidden` bir kap,
  Web Animations, bitince kalkar. Renkleri `--parilti-1` ve `--parilti-2` (tema.css; Renksiz'de
  gri). `hareketAzMi()` ise hiç çizmez.
- **Seslerin önbelleği:** `vite.config.ts` `ses-listesi.json`'u okur: arayüzün ve koyun sesleri
  `additionalManifestEntries` ile ön belleğe girer (sürüm dosyanın içeriğinden); öteki
  bölgelerinki `morfemusta-ses` önbelleğine bölgeye ilk girişte arka planda iner
  (`bolgeSesleriniIndir`) ve service worker'ın `runtimeCaching`'i (CacheFirst) oradan verir.
  Kalıp düzenli ifadedir, işlev değil: service worker'a metin olarak kopyalanır. Önceden inmeyen
  seslerin adresinde içeriğin sürümü var (`?v=<sürüm>`, `kayitAdresi`): ses yeniden üretilince
  adres değişir, eski sürümler bölge indirilirken silinir. Ön bellektekilerin adresi yalın kalır
  (Workbox `v`'yi yok saymaz; sorgu eklenirse ön bellekle eşleşmez). Ekran değişince `App.tsx`
  çalan sesi susturur (`useLayoutEffect`: yeni ekranın söyleyişinden önce). Oyunun paketine
  listenin yalnız gereken alanları girer: `ses-listesi.json?oyun`, metinden `[özet, sürüm,
  ...bölgeler]` (`vite.config.ts`'deki `sesListesiOyun` eklentisi; sanal modül, `enforce:
  'pre'`: yoksa Vite'ın JSON eklentisi `.json?oyun`'u önce yakalar). Türü
  `src/ses/ses-listesi-oyun.d.ts`'de. Ses Denetim Sayfası listenin tamamını alır (okunuş
  orada).
- **Ses (karar, Oturum 10b):** Google Cloud Text-to-Speech'in Chirp 3: HD sesi,
  `tr-TR-Chirp3-HD-Callirrhoe`. dfki sesi (Piper) bırakıldı: vurgusu ve duraklamaları kötü,
  lisansı kuşkulu. **Gemini sesleri kullanılmaz:** Gemini API'nin şartları 18 yaş altına yönelik
  uygulamalarda kullanımı yasaklıyor; Text-to-Speech ise Google'ın hizmet listesinde üretken
  yapay zekâ hizmeti değil, Pre-Trained API. Atıf (README, Hakkında): Sesler yapay zekâyla,
  Google Cloud Text-to-Speech'in Chirp 3: HD Callirrhoe sesiyle önceden üretildi. Kodun MIT
  lisansı ses dosyalarını kapsamaz.
- **Ses üretimi (`scripts/ses-uret.py`):** `pip install lameenc`; REST, `v1/text:synthesize`,
  `languageCode` tr-TR, `speakingRate` 0.9 (Oturum 11'de seçildi). Yanıt LINEAR16 (24 kHz):
  baştaki ve sondaki sessizlik 80 ms pay bırakılarak kırpılır, 0.5 sn'den uzun iç sessizlik
  0.5 sn'ye indirilir (sessizlik: 10 ms'lik pencerenin RMS'i sesin tepesinin 35 dB altı),
  konuşulan kısmın RMS'i -20 dBFS'ye getirilir (tepe en çok -1 dBFS), sonra MP3: mono, 24 kHz,
  32 kbit/s (`lameenc`). Denetim: baştaki ya da sondaki sessizlik 0.3 sn'yi, iç sessizlik
  0.6 sn'yi geçerse ses yeniden istenir, yine olmazsa üreteç hata verir (dosya yazılmaz; listede
  eski kaydı kalır, sonraki çalıştırmada yine bayat sayılır). `--yeniden DOSYA` yalnız listedeki
  ses dosyalarını yeniden üretir: Chirp her üretimde biraz farklı okur, onaylanmış sesler
  değişmesin. Listede olmayan bayat ses varsa hiç istek gitmeden durur. Boş, aşırı kısa ya da uzun ses yeniden istenir (Chirp kısa parçada, *pe*, *lik*, ara sıra boş ses verir;
  sonraki denemede sona nokta eklenir); yine olmazsa sonda listelenir. 429 ve 5xx'te beklenip
  yeniden denenir. Okunuşu, sözcüklerinin IPA'sı, sesi ve hızı değişmeyen metin yeniden üretilmez
  (`--hepsi` hepsini üretir; sözcük tablosu değişince yalnız o sözcüğü içeren sesler yeniden
  üretilir); listede olmayan dosya silinir. Betik CI'a girmez.
- **API anahtarı:** yalnız `GOOGLE_TTS_KEY` ortam değişkeninde durur ve `X-Goog-Api-Key`
  başlığıyla gider; depoya, kayda (günlük, çıktı) ve PR'a hiç girmez. **Her commit'ten önce
  `git grep -n "AI[z]a"` boş dönmeli.** Google'a yalnız oyunun kendi metinleri gider; oyun
  çalışırken hiçbir istek yapılmaz.
- **Ses Denetim Sayfası (`ses.html`):** bütün sesler bölge bölge, çal düğmesi ve Hatalı işareti.
  İşaretler oyunun kaydından ayrı bir anahtarda (`morfemusta.ses-denetimi.v2`) ve yalnız bu
  cihazdadır; işaret sesin sürümüne bağlıdır (metin → `surum`): ses yeniden üretilince eski
  işaret görünmez. Listeyi kopyala Hatalı metinleri satır satır panoya koyar. Hız örnekleri
  Oturum 11'de kalktı (hız 0.9 seçildi).
- **Köklerin resmi:** `KokResmi` `icerik/emoji.csv`'deki kökü `public/emoji/<kod noktaları>.svg`
  ile gösterir (Twemoji'nin adı: ZWJ yoksa FE0F atılır); süstür (`alt` boş, `data-emoji`'de
  emoji), `loading="lazy"`: React 19 sunucu çıktısında tembel olmayan resim için `<link
  rel="preload">` yazar, birim testlerinin beklediği çıktı değişirdi. Koy'da kelimenin içinde
  (kart üçe çoğalınca resim de üç), Dükkân'da kartın sol üst köşesinde (320 px'te sığsın),
  Bahçe'de ağacın kökünde, Sözlük'te kelimenin önünde. Uydurma kökte resim yok.
- **Hoparlör:** 44 px; kelimenin hoparlörü kartın sağ üst köşesinde rozet (`hoparlor--kose`,
  kartı kaydırmaz), cümlenin hoparlörü cümlenin solunda (`sesli-cumle`). Haritanın iletisinde
  balonun içinde, sağ ucunda: hoparlörlü balonun dikey boşluğu yoktur (`:has(.hoparlor)`),
  hoparlör balondan taşmaz, iletinin ayrılmış yeri değişmez (`harita.spec.ts`).
- **Ek sırası:** `ekle`, `olasiBicimler` (ve onları çağıran her şey: `neden`,
  `sinirSecenekleri`) sırası bozuk dizide hata atar (`göz + PL + LIK`). Kayıttan okunan böyle
  bir kart atılır (`kartiCoz` hatayı yutar).
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
  bölgenin ilerlemesini değiştirdiyse bölgenin dış sürümü artar (`degisenBolgeler`). Kayıtta
  sıfırlama kimliği (`sifirlama`) de var. `App.tsx` ikisini de bölge ekranının `key`'ine koyar;
  görev `ekrandaGorevBitti` ile yazılır: kimlik değiştiyse yazılmaz, ekran baştan açılır.
  `storage` olayı ulaşmayan pencere kaydı `visibilitychange` (görünür olunca) ve `pageshow`'da
  yeniden okur (`tazele`), olay gibi işler. Çok sekmede kalan durumlar `NEXT.md`'de (Oturum 6'nın
  planı; Oturum 11'in açık kalanları).
- **Sınıf modu:** `ayarlar.sinif` (kapali / acik). Kayıt `oyunKaydi(depo)`'dan gelir
  (`ilerleme.ts`): sınıf modu kapalıyken `pencereKaydi` gibidir; açıkken ilerleme, kartlar ve
  sıfırlama kimliği bellekteki ayrı bir kopyadadır (o açılış boyunca), yalnız ayarlar ve
  kapatılan ipuçları depoya yazılır. Kapanınca cihazın kaydı görünür. `bolgeDurumlari` sınıf
  modunda kilit vermez. Adresteki `?sinif=1` / `?sinif=0` (`src/kabuk/sinif.ts`) `depo.ts`'in
  `kaydiKur`'unda ayara yazılır ve `replaceState` ile adresten kalkar (hash kalır). `App.tsx`
  `html[data-sinif]` yazar, bölge ekranının `key`'ine sınıf modunu da koyar, `SinifSaglayici`
  ile ekranlara verir (`useSinifModu`; işaret `SinifIsareti`). Görünüm `src/ekranlar/Sinif.css`'te,
  yalnız `(min-width: 1024px) and (orientation: landscape)`'te: kökün yazı boyu
  `max(16px, min(1.4584vw, 2.5926vh))` (1920×1080'de 28 px); piksel boylu çizimler
  (karakterler.css'teki ağaç, karo, harita işaretleri) `calc(N * var(--birim))` ile yazılır:
  `--birim` olağanda 1px, sınıf modunda 0.0625rem. `e2e/sinif.spec.ts` 1920×1080 ve 1366×768'de
  taşmayı, en küçük yazıyı (28 px) ve dokunma hedefini (64 px) ölçer.
- **Ana ekran ipucu (`src/kabuk/ipucu.ts`):** iOS Safari (iPhone, iPad; Mac gibi görünen iPad
  dokunma noktasıyla ayrılır; Chrome, Firefox ve uygulama içi tarayıcılar hariç), ana ekrandan
  açılmamışsa (`navigator.standalone`, `display-mode: standalone`), ipucu kapatılmamışsa ve
  sınıf modu kapalıysa haritanın altında. Kapatılan ipucu kayıtta `kapananIpuclari`'dadır
  (sıfırlamada kalır). Uçtan uca testte iPhone kullanıcı ajanıyla sınanır.
- **Saf görsel hesaplar:** `src/gorsel/cizim.ts`, `karo.ts`, `kilik.ts` ve `yaratik.ts` motor gibi DOM'suz derlenir
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
- **Güncelleme:** `registerType: 'prompt'` (`registerSW.js` yalnız kaydeder; sayfa yenilenmez,
  soru sorulmaz) ve `skipWaiting` yok: yeni service worker bekler, açık sayfa eski sürümle ve
  eski önbellekle sürer; oyunun bütün pencereleri kapanınca, sonraki açılışta yeni sürüm
  devreye girer. `clientsClaim` açık: ilk kurulumda sayfa hemen denetlenir, ilk açılıştan sonra
  çevrim dışı da açılır. `e2e/cevrimdisi.spec.ts` yeni sürümü `sw.js?surum=yeni` kaydıyla
  taklit eder.
- **Yazı tipi alt kümeleri:** Andika da Baloo 2 gibi alt küme dosyalarıyla içe aktarılır
  (`@fontsource/andika/latin-400.css`, `latin-ext-400.css`, `latin-700.css`,
  `latin-ext-700.css`; her sayfanın girişinde). Kiril, Yunanca ve Vietnamca önbelleğe girmez.
- **Erişilebilirlik:** `e2e/erisilebilirlik.spec.ts` axe-core'la tarar (harita, dört bölge,
  yanlış ve doğru deneme, Sözlük, Ayarlar, akşam ekranı; Renkli, Renksiz ve sınıf modunda;
  ipuçlu harita; dört geliştirici sayfası). Ciddi ya da kritik bulgu kalmaz.
- **Playwright 1.56.1'e sabittir.** Bulut oturum ortamındaki hazır Chromium
  (`/opt/pw-browsers`, chromium-1194) bu sürümle eşleşir. Yükseltmede bu ortamda tarayıcı
  indirilemeyebilir; o durumda uçtan uca testler yalnız GitHub Actions'ta koşar.
- **Yazı tipi testi:** `document.fonts.check()` kullanılmaz. ı (U+0131) hem `latin` hem
  `latin-ext` aralığında olduğu için, tarayıcı yalnız `latin`'i indirse de `false` döner.
- **Kurulabilirlik:** Başsız Chromium'da CDP `Page.getInstallabilityErrors` her durumda boş
  döner; test olarak işe yaramaz. Kurulabilirlik manifest ve service worker testleriyle
  dolaylı, gerçek telefonda doğrudan denetlenir.
- **Sürüm (`src/surum.ts`):** adı kodda; kısa commit ve commit'in günü `vite.config.ts`'te
  `git log`'dan okunur ve `define` ile pakete girer (`__SURUM_COMMIT__`, `__SURUM_TARIHI__`;
  türleri `src/derleme.d.ts`). Git yoksa "bilinmiyor" ve bugün. Vitest de aynı `define`'ı okur.
- **Deneme günlüğü (`src/oyun/gunluk.ts`):** saf; depo dışarıdan (`PilotDeposu`: getItem,
  setItem, removeItem). Anahtar `morfemusta.pilot.v1` (`{ cocuk, satirlar }`), durma işareti
  `morfemusta.pilot.durdu`. Yazıcı (`gunlukYazici`) her seçimde son kaydı okur, satırı ekler;
  bilinmeyen alan ve satır atılmaz, okunamayan kayda yazılmaz. Depo dolunca bu açılışta durur ve
  işaret yazar. Bölge ekranları seçimi `useDenemeGunlugu(bolge, gorev)`'un `kaydet(adim,
  alanlar)`'ıyla bildirir (`src/kabuk/gunluk.tsx`; deneme sayısı ve görev başından süre
  `denemeSayaci`'ndan). Neden kodu motorun `nedenYazimi`'ndan (genel kapıdan açıldı); Bahçe'nin
  aday kelimesi ve kodu `bahce.ts`'te (`denemeninAdayi`, `nedenKodu`). Uydurukçuklar'ın sınır
  adımında `dogru_bicim` iki biçimdir (`gorevinSonBicimi`, / ile); özette o seçim orana girmez.
- **pilot.html (`src/pilot/`):** yetişkin aracı; oyunun belirteçlerini kullanır. Yeni çocuk
  `yeniCocuk` (kod, sonra `pencereKaydi(depo).degistir(ilerlemeyiSifirla)`). CSV noktalı
  virgüllü ve UTF-8 imli (Türkçe Excel), kopya sekmeli. Oyunun kaynakları pilot.html'e adres
  olarak başvuramaz (`PilotSayfasi.test.tsx` tarar).
- **Belgeler (`belgeler/*.html`, `src/belgeler/belge.css`):** betiksiz HTML girişleri; çizgiler
  kenarlıktır (arka plan değil: tarayıcı arka planı yazdırmasa da çıkar). Tek sayfa olduğunu
  `e2e/belgeler.spec.ts` `page.pdf` ile ölçer (yalnız Chromium).
- **Sınıf modunda Sözlük:** yan yana bölgeler sayfayı kaydırırsa (`sayfaKayiyor`) bölge bölge
  ve sayfalı görünüme geçer (`BolumluSozluk`; tek yönlü, ekran yeniden açılınca yan yana denenir).
  Sayfanın boyu listenin ölçüsünden: sütun sayısı × sabit satır boyu (`grid-auto-rows`). Sayfa
  çubuğunun yeri hep ayrılır (tek sayfada `visibility: hidden`): boy dalgalanmaz.
- **WebKit:** bulut oturumunda Playwright'ın indirme sunucusu kapalı olabilir; o zaman WebKit
  projesi yerelde atlanır (`playwright.config.ts` uyarı yazar), CI koşar.
