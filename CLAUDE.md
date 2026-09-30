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
- **Ses ve resim:** sesler Piper'la önceden üretilir (`tr_TR-dfki-medium`, CC BY-NC-SA 4.0; kodun
  MIT lisansından ayrı), MP3 olarak `public/ses/`'tedir; köklerin resmi Twemoji SVG'leridir
  (CC BY 4.0), `public/emoji/`'dedir. İkisi de pakete gömülüdür (`DESIGN.md`, "Ses ve resim").
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
| `python3 scripts/ses-uret.py` | Sesleri Piper'la üretir: `public/ses/*.mp3` ve `src/ses/ses-listesi.json` (elle; CI'da yok, aşağıdaki nota bakın) |
| `node scripts/ses-metinleri.mjs` | Oyunun söyleyebileceği bütün metinler, okunuşlarıyla (JSON; üreteç okur) |
| `NODE_USE_ENV_PROXY=1 node scripts/emoji-indir.mjs` | `icerik/emoji.csv`'deki emojilerin Twemoji SVG'lerini `public/emoji/`'ye indirir |
| `node scripts/uydurma-uret.mjs --tohum 7 --sayi 30` | Uydurma kök adayları: `uydurma-adaylari.tsv` (zeyrek gerekir; `--zeyreksiz` ile onsuz) |

Biçim Denetim Sayfası: <http://localhost:5173/morfemusta/denetim.html> (yayında
`/morfemusta/denetim.html`). Karakter Galerisi: <http://localhost:5173/morfemusta/galeri.html>
(yayında `/morfemusta/galeri.html`). Ses Denetim Sayfası: <http://localhost:5173/morfemusta/ses.html>
(yayında `/morfemusta/ses.html`). Oyun üçüne de bağlantı vermez.

Oturumu kapatmadan önce: `npm run typecheck && npm test && npm run test:e2e`.

## Klasör yapısı

```
.github/workflows/test-ve-yayin.yml   her push ve PR'da test; main'de Pages'e yayın
e2e/                 Playwright testleri (*.spec.ts); ortak yardımcılar yardimcilar.ts'te
public/              ikonlar ve favicon (scripts/ikonlar.mjs üretir); ses/: sesler (ses-uret.py
                     üretir; ornek/: Ses Denetim Sayfası'nın örnekleri); emoji/: köklerin
                     Twemoji SVG'leri (emoji-indir.mjs indirir)
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
                     alt gezinme;
                     hareket.ts: ekranların hareketleri (Web Animations API, hareket azaltmaya
                     uyar); simgeler.tsx: arayüz simgeleri
  kabuk/             hash yönlendirici (yonlendirici.ts) ve cihaz deposu (depo.ts: localStorage,
                     kalıcı depo isteği, useIlerleme); testleri yanında
  oyun/              oyunun saf mantığı: bölge tablosu (bolgeler.ts), görev tabloları (turlarıyla),
                     seçenekler, Bukalemun Koyu'nun (koy.ts), dükkânın (dukkan.ts), bahçenin
                     (bahce.ts) ve Uydurukçuklar'ın (uyduruk.ts) durumu (indirgeyici),
                     cihazdaki ilerleme (ilerleme.ts:
                     kayıt, kilitler, Sözlük kartları); testleri yanında
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
                     önbellek, iOS'ta ilk dokunuş), arayüz (Ses.tsx: ayar, sesli mod, hoparlör),
                     ses-listesi.json (metinden dosyaya; ses-uret.py yazar); testleri yanında
  sesdenetim/        Ses Denetim Sayfası (ses.html'in girişi)
icerik/              içerik CSV dosyaları (ekler.csv: ek envanteri; kokler.csv: kök sözlüğü;
                     bolgeler.csv: adanın bölgeleri; yasakli-diziler.csv: uydurma kökte
                     yasak diziler; emoji.csv: köklerin emojisi; ses-okunus.csv: yanlış okunan
                     metinlerin okunuşu; gorevler/: bölgelerin görev tabloları,
                     bukalemun-koyu.csv, fistikci-sahap.csv, kok-bahcesi.csv ve uydurukcuklar.csv)
tests/               altin-bicimler.csv: motorun altın tablosu; neden.csv ve neden-unsuz.csv:
                     yanlış biçimin nedenleri (motorun neden işlevinin sözleşmesi; uyum, gövde
                     ve ek başı); neden-kaynastirma.csv: kaynaştırma nedeni; ek-sirasi.csv: ek
                     sırası denetiminin sözleşmesi; uydurma-denetimi.csv: uydurma kök denetimi
index.html           oyun
denetim.html         Biçim Denetim Sayfası (ayrı giriş sayfası)
galeri.html          Karakter Galerisi (ayrı giriş sayfası)
ses.html             Ses Denetim Sayfası (ayrı giriş sayfası)
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
   kullanıcının isteğiyle: `piper-tts` ve `lameenc` (Python; projenin bağımlılığı değil, yalnız
   `scripts/ses-uret.py` için elle kurulur) ve Twemoji'nin grafikleri (paket değil: tablodaki
   emojilerin SVG dosyaları `public/emoji/`'de).
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

16. **`icerik/emoji.csv` ve `icerik/ses-okunus.csv` yalnız kullanıcının onayıyla değişir.** Emoji
    tablosu köklerin resmidir (her kökü sözlükte; `emoji.test.ts` denetler); okunuş tablosu yanlış
    okunan metnin okunuşudur, üreteç onu kullanır. Testi geçirmek için satır değiştirilmez,
    silinmez, eklenmez. Bir satır yanlış görünürse iş durur ve kullanıcıya sorulur.

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
- **Dört giriş sayfası:** `index.html` (oyun), `denetim.html` (Biçim Denetim Sayfası),
  `galeri.html` (Karakter Galerisi) ve `ses.html` (Ses Denetim Sayfası). Derleme girişleri `vite.config.ts`'deki
  `build.rolldownOptions.input`'tadır; yeni bir sayfa oraya eklenir. Her sayfa önbelleğe
  girmelidir: service worker önbellekte olmayan bir gezinmeyi `navigateFallback` ile oyunun
  `index.html`'ine düşürür (`e2e/denetim.spec.ts`, `e2e/galeri.spec.ts` ve `e2e/ses.spec.ts` bunu
  denetler).
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
  `icerik/ses-okunus.csv`'deki okunuş önce gelir. Çalar (`calar.ts`): tek `<audio>`, yeni çalma
  eskisini keser; dosya fetch'le blob olarak alınır (Range isteği yok); listede olmayan metin
  için istek gitmez; hata yutulur, konsola yazılmaz. iOS'ta ilk dokunuşta sessiz bir WAV çalınır
  (`sesiAc`, `main.tsx`). Ayar (`ayarlar.ses`: kapali / dokununca / sesli, varsayılan dokununca)
  `SesSaglayici` ile verilir; sağlayıcı yokken Kapalı'dır (birim testleri, galeri). Sesli modda
  bölge ekranı girişte bölgenin adını, sonra kökü söyler (haritadaki ad girişte kesilirdi).
- **Seslerin önbelleği:** `vite.config.ts` `ses-listesi.json`'u okur: arayüzün ve koyun sesleri
  `additionalManifestEntries` ile ön belleğe girer (sürüm dosyanın içeriğinden); öteki
  bölgelerinki `morfemusta-ses` önbelleğine bölgeye ilk girişte arka planda iner
  (`bolgeSesleriniIndir`) ve service worker'ın `runtimeCaching`'i (CacheFirst) oradan verir.
  Kalıp düzenli ifadedir, işlev değil: service worker'a metin olarak kopyalanır.
- **Ses üretimi (`scripts/ses-uret.py`):** `pip install piper-tts lameenc`; model
  (`tr_TR-dfki-medium`) huggingface.co'dan `.piper/`'a iner (git'e girmez); betik MODEL_CARD'da
  lisansı (by-nc-sa/4.0) arar. Hız: Piper'ın `length_scale`'i 1.2 (biraz yavaş); örnekler 1.2 ve
  1.0. MP3, mono, 22.05 kHz, 32 kbit/s (`lameenc`; ffmpeg gerekmez). Okunuşu, sesi ve hızı
  değişmeyen metin yeniden üretilmez; listede olmayan dosya silinir. Ses dosyaları kodun MIT
  lisansından ayrı, CC BY-NC-SA 4.0 ile yayımlanır (README, Hakkında).
- **Ses Denetim Sayfası (`ses.html`):** bütün sesler bölge bölge, çal düğmesi ve Hatalı işareti.
  İşaretler oyunun kaydından ayrı bir anahtarda (`morfemusta.ses-denetimi.v1`) ve yalnız bu
  cihazdadır; Listeyi kopyala Hatalı metinleri satır satır panoya koyar. Üstte aynı beş cümle
  iki hızda (`ses-listesi.json`'daki `ornekler`).
- **Köklerin resmi:** `KokResmi` `icerik/emoji.csv`'deki kökü `public/emoji/<kod noktaları>.svg`
  ile gösterir (Twemoji'nin adı: ZWJ yoksa FE0F atılır); süstür (`alt` boş, `data-emoji`'de
  emoji), `loading="lazy"`: React 19 sunucu çıktısında tembel olmayan resim için `<link
  rel="preload">` yazar, birim testlerinin beklediği çıktı değişirdi. Koy'da kelimenin içinde
  (kart üçe çoğalınca resim de üç), Dükkân'da kartın sol üst köşesinde (320 px'te sığsın),
  Bahçe'de ağacın kökünde, Sözlük'te kelimenin önünde. Uydurma kökte resim yok.
- **Hoparlör:** 44 px; kelimenin hoparlörü kartın sağ üst köşesinde rozet (`hoparlor--kose`,
  kartı kaydırmaz), cümlenin hoparlörü cümlenin solunda (`sesli-cumle`). Haritanın iletisinde
  eksi kenar boşluğuyla: iletinin ayrılmış yeri değişmez (`harita.spec.ts`).
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
  Çok sekmede kalan durumlar `NEXT.md`'de (Oturum 11).
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
