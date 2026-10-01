# Sıradaki

**Sıradaki hedef: Oturum 13, pilot sonrası düzeltmeler.** Pilotun gözlem formları ve CSV'si
gelince kullanıcı oturumun tarifini verecek. Pilot sürerken main'e yalnız pilot düzeltmeleri
girer, her biri sürüm adını artırır (CLAUDE.md, 17. kural). Açık kalanlar aşağıda.

## Pilot günü yapılacakları

1. **Bir gün önce:** PR birleşip yayınlandıktan sonra her cihazda
   <https://frtbasbug.github.io/morfemusta/pilot.html>'i açın; sürüm *pilot-1* görünmeli.
   Oyunu da bir kez açın. Okulda internet yoksa oyunun Ayarlar'ında Sınıf modu'nu açıp dört
   bölgeye birer kez girin (sesler iner), sonra Sınıf modu'nu kapatın.
2. **Yazdırın:** çocuk sayısınca gözlem formu, veli onay formu (araştırmacının adı, kurumu ve
   iletişim bilgisi elle), her gözlemciye yönerge. Tarayıcıdan A4, ölçek %100.
3. **Her cihazda:** şarj, ses açık, sessiz anahtar kapalı. Ayarlar'da Ses: 1–2. sınıfa Sesli mod,
   3–4. sınıfa Dokununca; Sınıf modu Kapalı. pilot.html'deki "Oyunun ayarları" satırına bakın.
4. **Her çocuk:** pilot.html → kod (P01 ...) → Yeni çocuk → Oyunu aç. Kodu forma yazın.
5. **Gün sonu:** pilot.html → CSV indir (dosya adı günü taşır), dosyayı yedekleyin; formları
   toplayın. Günlüğü sil yalnız CSV alındıktan sonra. Uyarı varsa (günlük durdu, sınıf modu açık)
   önce CSV.
6. **Gözlenecek ek noktalar** (önceki oturumların listelerinden): iOS'ta sesli mod ve efektler
   ilk dokunuştan sonra, sessiz anahtar; etkileşimli tahtada sınıf modu (sayfalı Sözlük);
   parmakla sürükleme; en eski cihazda cihaz.html'in sonucu.

## Son oturum: Oturum 12 — pilot sürümü (2026-10-01)

### Kullanıcının kararları

- **Derleme hedefi bugünkü gibi kalır** (Vite'ın varsayılanı: Safari 16.4+, Chrome 111+, Firefox
  114+). Çok eski tarayıcıda Oturum 11'in uyarısı çıkar (*Bu tarayıcı Morfemusta için çok eski.*
  ve *Cihazı denetle*). Oturum 11'in "Derleme hedefi" maddesi kapandı.
- **Pilotta denemeler yalnız cihazda, çocuk koduyla tutulur;** hiçbir şey kendiliğinden
  gönderilmez.
- **Üç yazdırılabilir belge:** gözlem formu, veli bilgilendirme ve onay formu, gözlemci yönergesi.

### Bitenler

- **Önce denetlendi:** Oturum 11'in işi main'de
  ([frtbasbug/morfemusta#15](https://github.com/frtbasbug/morfemusta/pull/15), `109ad17`):
  sınıf modu, cihaz.html, efektler.
- **Sürüm** (`src/surum.ts`): *pilot-1*, kısa commit ve commit'in günü derlemede pakete girer;
  Hakkında'da ve pilot.html'de: *pilot-1 (a1b2c3d, 2026-10-01)*. CLAUDE.md'ye 17. kural: pilot
  sürerken main'e yalnız pilot düzeltmeleri, her biri sürümü artırır.
- **Deneme günlüğü** (`src/oyun/gunluk.ts`, `src/kabuk/gunluk.tsx`): dört bölgedeki her seçim bir
  satır, 16 sütun (DESIGN.md, "Pilot"). Ayrı anahtar `morfemusta.pilot.v1`. Kod yokken ve sınıf
  modunda yazılmaz. Depo dolunca oyun sürer, günlük durur, işaret yazılır; satırlar silinmez.
  Motorun neden yazımı (`nedenYazimi`) genel kapıdan açıldı.
- **pilot.html** (altıncı giriş; noindex, oyundan bağlantı yok, önbellekte): çocuk kodu ve Yeni
  çocuk, Kodu sil, Oyunu aç; çocuk başına özet; CSV indir, Kopyala, iki adımlı Günlüğü sil;
  uyarılar; sürüm ve belgeler.
- **Belgeler** (`belgeler/*.html`): A4, siyah beyaz, tek sayfa, gömülü Andika.
- **Küçük düzeltmeler:**
  - Sınıf modunda Bahçe: ağaç ekranın tam ortasında ve 1.5 kat; tabela ve o anki kelime ağacın
    sağında, ortasıyla hizalı.
  - Sınıf modunda Koy'un ve Dükkân'ın kelime kartı iri (yazı 3 rem).
  - Haritada tabelanın en çok eni 10.25 rem'den 11.25 rem'e: *Uydurukçuklar* (ve *Bukalemun*)
    yazısı kutusundan taşmıyordu değil, taşıyordu (13.8 px ve 9 px; 412 px'te de, rem'le
    ölçüldüğü için). 320–412 px'te taşma ve çakışma yok.
  - Sınıf modunda Sözlük: yan yana bölgeler sığmayınca bölge bölge sekmeli ve sayfalı (45 kartla
    önce 3169 px kayıyordu). Ayarlar üç sütun, Hakkında iki metin sütunu (önce 468 px kayıyordu);
    Renkler'in a/e örneği başlığın yanına geçti (telefonda da).
- **Testler:** birim (günlük satırı, kodsuz ve sınıf modunda yazılmaması, Yeni çocuk, CSV ve
  Türkçe harfler, depo dolu, özet, sayaç; Bahçe'nin adayı ve kodu; sürüm; pilot sayfası) ve uçtan
  uca: pilot yolu (sesli mod, dört bölge, her bölgede bir yanlış, 40 görev, özet, CSV'nin 58
  satırı ve 16 sütunu, konsol hatası ve dış istek yok), Yeni çocuk, Günlüğü sil, Kopyala, kodsuz
  ve sınıf modu, depo dolu, çevrim dışı; belgeler tek sayfa (page.pdf); harita 390 px; sınıf
  modunda Bahçe, kartlar, çok kartlı Sözlük, Ayarlar (soru açıkken de); axe (pilot.html ve
  belgeler). Pilot testleri WebKit'te de (iPhone 13); CI'a WebKit eklendi, süre sınırı 30 dk.

### Oturumda seçilen küçük ayrıntılar (kullanıcıya ayrıca sorulmadı)

- **Çocuk kodu:** bir büyük harf ve iki ya da üç rakam (P01, P123); küçük harf büyür. Ad
  yazılamasın diye dar tutuldu.
- **CSV ayracı noktalı virgül:** Türkçe Excel'de liste ayracı ; (virgül ondalık işareti);
  virgüllü dosya tek sütunda açılırdı. UTF-8 imi ve CRLF. R'de `read.csv2`, pandas'ta `sep=';'`.
- **Zaman** yerel saatle, saat farkıyla (gözlem formundaki saatlerle karşılaştırılsın).
- **Bir satır, bir seçim:** taşıma anı (bukalemun kelimeye, karo yuvaya, ek ağaca); yalnız
  seçip bırakmak satır değildir. `deneme_no` adım başına; görevden çıkılıp dönülünce sayaç ve
  süre baştan.
- **dogru_bicim** adımındır (zincirde *toplar*, sonra *toplarım*; Bahçe'de sıradaki gövde).
  Uydurukçuklar'ın sınır adımında iki biçim / ile; özetin ilk deneme oranına girmez (yanlışı yok).
- **Bahçe'nin neden kodu:** *meyve:AGT* (motorun ek sırası kodu) ya da *önce:AGT*; aday motorla
  kurulur (*çiçekler*, *yolluk*).
- **Özet:** biten görev = son seçimi doğru olan görev (tur ve görev bir kez); en sık üç neden,
  her yanlışın kodları ayrı ayrı, eşitlikte önce görülen.
- **Günlüğü sil kodu korur;** Yeni çocuk onay sormaz. Yeni çocuk aynı kodla yeniden girilirse
  satırlar eklenir (uyarı yazılır).
- **Veli formuna çocuğun adı alanı** eklendi (onayın kimin için olduğu); kod formda yok (kod ile
  ad aynı kâğıtta eşleşmesin). İsterseniz kalkar.
- **"Adres büyük harflerle"** büyük puntoyla (17 pt) yorumlandı: adresin yolu büyük-küçük harfe
  duyarlıdır, büyük harfle yazılırsa açılmaz.
- **Gözlemci yönergesindeki giriş cümlesi:** *Bu yeni bir kelime oyunu. Oynarken seni izleyip
  not alacağım. Burada yanlış yok; oyunu deniyoruz, seni değil. İstediğin an bırakabilirsin.*
  Yardım yalnız ne yapılacağını söyler (ör. *Bir bukalemunu kelimeye taşı.*).
- **Sınıf modunda sayfalı Sözlük** yalnız yan yana sığmayınca; kartta künye yok.
- **Bulut oturumunda WebKit yok** (Playwright'ın indirme sunucusu ağ kuralında kapalı): WebKit
  testleri yalnız CI'da koştu.

### Açık kalanlar

Oturum 12'de eklenenler (Oturum 13 için):

- **İki sekme aynı anda yazarsa** (iki oyun sekmesi) günlükte satır kaybolabilir: her yazış son
  kaydı okur, ama tarayıcılar arası localStorage eşzamanlı değil. Pilotta tek sekme.
- **Durma işareti de yazılamazsa** (depo tümüyle dolu) günlük o açılışta durur, sonraki açılışta
  yeniden dener; aradaki satırlar yazılmamış olur. pilot.html *Cihazın deposu dolu* der.
- **Görevden çıkıp dönünce** `deneme_no` ve `sure_ms` baştan sayılır (ilk deneme yeniden 1).
- **Sınıf modundaki sayfalı Sözlük tek yönlü:** ekran açıkken pencere büyüse de yan yana dönmez;
  ekran yeniden açılınca dener.
- **Belgeler yalnız Chromium'da tek sayfa ölçüldü;** Safari ve Firefox'ta yazdırma (kenar
  boşlukları, üst-alt bilgi) elle denenmeli. Sayfaların altında 25–30 mm pay var.
- **Özet yalnız pilot.html'de;** gözlem formuyla eşleme (yardım sayısı) elle.
- Önceki açık kalanlar aşağıda (Oturum 11'in bölümünde; "Derleme hedefi" kapandı).

## Önceki oturum: Oturum 11 — cila (2026-10-01)

### Kullanıcının kararları

- **Seslerin hızı 0.9 kalır;** sesler yeniden üretilmedi. `ses.html`'deki örnekler bölümü ve
  örnek sesler (`public/ses/ornek/`, 10 dosya, 101 KB) kalktı. Üreteç örnek üretmez;
  `ses-listesi.json`'da `hizlar` ve `ornekler` yerine `hiz: 0.9`. Oturum 10b'nin "Seslerin
  hızı" maddesi kapandı.
- **Sınıf modu ayrı bir mod:** Ayarlar'da *Sınıf modu: Kapalı / Açık*; adreste `?sinif=1` açar,
  `?sinif=0` kapatır (yer imi).
- **Efektler kodla üretilir** (Web Audio): dosya ve lisans yok.
- **Erişilebilirlik @axe-core/playwright ile taranır** (kullanıcının adını verdiği kitaplık;
  geliştirme bağımlılığı, MPL-2.0; CLAUDE.md, 2. kural).
- **Derleme hedefi sonra:** kullanıcı en eski cihazda `cihaz.html`'i açacak; hedef ona göre
  seçilecek.

### Bitenler

- **Önce denetlendi:** Oturum 10b'nin işi main'de
  ([frtbasbug/morfemusta#14](https://github.com/frtbasbug/morfemusta/pull/14), `d8c15e1`):
  Callirrhoe sesleri ve `icerik/ses-sozcuk.csv`.
- **Sınıf modu:**
  - Kayıt `oyunKaydi`'ndan (`src/oyun/ilerleme.ts`): sınıf modunda ilerleme, kartlar ve kalınan
    yer o açılışın belleğindedir; kayda yalnız ayarlar ve kapatılan ipuçları yazılır.
    Yenileyince baştan; kapanınca cihazın kaydı olduğu gibi döner; aynı açılışta yeniden
    açılınca bellek sürer. Sıfırlama sınıf modunda yalnız belleği siler. Bütün bölgeler açık.
  - `?sinif=1` / `?sinif=0` açılışta ayara yazılır, adresten kalkar, hash kalır
    (`src/kabuk/sinif.ts`, `depo.ts`'in `kaydiKur`'u).
  - İşaret (`SinifIsareti`): bölge ekranının üst çubuğunda; harita, Sözlük, Ayarlar ve akşam
    ekranında sağ üstte. Görünen *Sınıf*, ekran okuyucuya *Sınıf modu: ilerleme kaydedilmiyor.*
  - Görünüm (`src/ekranlar/Sinif.css`; yalnız en az 1024 px genişlikte yatay ekranda): kökün
    yazı boyu ekranla ölçeklenir (1920×1080'de 28 px, 1366×768'de 19.9 px); piksel boylu
    çizimler `--birim` ile büyür (`karakterler.css`, karo, harita işaretleri); bölge
    ekranlarında 60 rem'lik sütun, bukalemunlar tek sırada; Sözlük'te bölgeler yan yana, kart
    sayısıyla orantılı; Ayarlar iki sütun; akşam kartı 52 rem.
  - Ölçüm (`e2e/sinif.spec.ts`): 1920×1080'de harita, dört bölge (başta, Koy'da yanlışta, dördünde
    doğruda), dört bölgenin kartlarıyla Sözlük ve Koy'un akşam ekranı kaydırmasız; en küçük yazı
    28.0 px (*Sınıf* işareti), en küçük dokunma hedefi 77 px. 1366×768'de de kaydırmasız (en
    küçük yazı 19.9 px, hedef 55 px).
- **Efektler** (`src/ses/efekt.ts`): doğru G5 → C6 (320 ms), yanlış A3 (260 ms, yavaş
  yükseliş), büyü C6 E6 G6 C7 arpeji (335 ms); hepsi 400 ms'den kısa ve konuşmadan kısık (en
  yüksek 50 ms'nin RMS'i 0.05'in, tepe 0.25'in altında; konuşma -20 dBFS = 0.1). Kapalı'da
  AudioContext hiç kurulmaz. Dokununca'da yalnız efekt; sesli modda efekt biter bitmez kurulan
  kelime ya da neden cümlesi (gecikme efektin süresi; o arada ekran değişirse söylenmez). Efekt
  `<audio>`'ya dokunmaz: çalan konuşma kesilmez. Dört bölgede doğru ve yanlış; büyü çoğalma,
  cebe girme, halka ve yıldızda.
- **Parıltı** (`src/ekranlar/parilti.ts`): doğruda kelimenin çevresinde altı yıldızcık (her biri
  340 ms, 0–250 ms gecikmeyle); `--parilti-1` (yanak) ve `--parilti-2` (kara), Renksiz'de gri;
  `aria-hidden`, dokunuşu engellemez; hareket azaltmada (cihaz ya da oyunun Azalt'ı) yok. Dört
  bölgede.
- **Çevrim dışı ve güncelleme:** `skipWaiting` kalktı, `registerType: 'prompt'`: yeni sürüm açık
  sayfayı devralmaz, sayfa yenilenmez; o açılış eski sürümle sürer, yeni sürüm sonraki açılışta
  gelir. `clientsClaim` kaldı: ilk açılıştan sonra çevrim dışı da açılır. Uçtan uca: uçak
  modunda yeniden açılış ve Koy'da bir görev (resim ve sesiyle); bir kez girilmiş Dükkân'ın
  sesleri uçak modunda; yeni sürüm (`sw.js?surum=yeni`) bekler, açık sayfa sürer.
- **Cihazda ilerleme:**
  - Ana ekran ipucu (`src/kabuk/ipucu.ts`): iPhone ve iPad Safari'de, ana ekrandan
    açılmamışsa haritanın altında *İlerlemen silinmesin: Paylaş → Ana Ekrana Ekle.* ve kapatma
    düğmesi (44 px); kapatılınca kayda yazılır (`kapananIpuclari`), bir daha çıkmaz (sıfırlamada
    da). Sınıf modunda ve ana ekrandan açılınca yok. 375×667'de harita yine sığar.
  - Çok sekme: `visibilitychange` (görünür olunca) ve `pageshow`'da kayıt yeniden okunur,
    `storage` olayı gibi işlenir (Oturum 6'nın planı).
- **Erişilebilirlik** (`e2e/erisilebilirlik.spec.ts`, axe-core): harita, dört bölge, Koy'da
  yanlış ve doğru, akşam ekranı, Sözlük, Ayarlar (Renkli, Renksiz ve 1920×1080'de sınıf modu);
  ipuçlu harita; denetim.html, galeri.html, ses.html, cihaz.html. Ciddi ya da kritik bulgu yok.
  Bulunup düzeltilen: galeride `<li role="img">` (axe *list*); rol içteki öğeye geçti.
- **Eski cihazlar:**
  - `cihaz.html` (beşinci giriş): tarayıcı ve sürümü, işletim sistemi, ekran (pencere, piksel
    oranı), kullanıcı ajanı; özellikler ✓/✗: service worker, localStorage, Web Audio, Pointer
    Events, `dvh`, kap sorgusu birimleri, ES modülleri, `:has()`, Web Animations. *Kopyala*
    özeti panoya koyar (olmazsa `execCommand`, o da olmazsa metni seçtirir). Modülsüz, ES5,
    satır içi; çevrim dışı da açılır.
  - Eski tarayıcı uyarısı (`index.html`): `noModule` yoksa hemen, varsa `load`'da oyun
    açılmamışsa *Bu tarayıcı Morfemusta için çok eski.* ve *Cihazı denetle* (cihaz.html). Beyaz
    ekran yok. Uyarının ve cihaz.html'in ES5 olduğunu `src/kabuk/es5.test.ts` denetler.
  - Paket: Andika yalnız latin ve latin-ext alt kümeleriyle; oyunun paketine ses listesinin
    yalnız gereken alanları girer (`ses-listesi.json?oyun`: özet, sürüm, bölgeler).
- **Boyutlar** (oyunun sayfası ve önbellek; önce → sonra):

  | | Önce | Sonra |
  |---|---|---|
  | Oyunun JS'i | 424.5 KB (gzip 122.6 KB) | 376.0 KB (gzip 121.1 KB) |
  | – ses parçası (`metinler-*.js`: ses listesi, çalar) | 109.2 KB (gzip 24.9 KB) | 53.6 KB (gzip 20.6 KB) |
  | Oyunun CSS'i (sınıf modu eklendi) | 42.7 KB (gzip 8.2 KB) | 44.9 KB (gzip 8.7 KB) |
  | Ön bellek (Workbox) | 139 girdi, 902.4 KiB | 134 girdi, 879.5 KiB |
  | Ön bellek, diskteki boyutlar (sesler dahil) | 1533.3 KB | 1510.4 KB |
  | Ön bellekteki yazı tipleri | 12 dosya, 308.5 KB | 6 dosya, 229.7 KB |
  | `public/ses/ornek/` (ön bellekte değildi) | 10 dosya, 101 KB | yok |

  Ön bellek az küçüldü: oyunun paketi ses listesinin yalnız gereken alanlarını alır, ama Ses
  Denetim Sayfası listenin tamamını artık kendi parçasında taşır (`ses-*.js`, 3.7 KB'tan 98 KB'a;
  önce paylaşılan parçadaydı). Ön bellekteki sesler değişmedi (75 ses, 574.1 KB).

- **Küçük düzeltmeler:**
  - Sözlük kartında kök ve ek satırı kırılmaz: bir sütuna sığmayan kart iki sütun genişliğinde
    durur (`genisKartlar`, ölçüyle; 360, 375, 390 ve 412 px'te *topum* ve *toplarım* tek satır).
  - Haritanın ileti balonunda hoparlör balonun içinde (360×640 ve 412×839'da sınandı).
  - Uydurukçuklar'ın üst çubuğunda tur: *2. tur · 3 / 10* (dar ekranda tur üstte).
- **Belgeler:** DESIGN.md (Ayarlar, Ses ve resim: Efektler, Koleksiyon ve modlar: Sınıf modu,
  Cihazda ilerleme, Sözlük, Belirteçler), CLAUDE.md, README (sınıf modu ve Cihaz Denetimi
  bağlantısı, efektlerin notu).
- **Testler:** 2090 birim testi ve 116 uçtan uca test (hepsi yeşil; tür denetimi temiz).
  - Birim: sınıf modu (kayda yazılmaz, yenileyince yok, kapanınca cihazın kaydı, ayarlar
    yazılır, öteki pencere), `?sinif=1` / `?sinif=0` ve adresten kalkması, ana ekran ipucu (iOS
    Safari, bir kez, sıfırlamada kalır), efektler (süre, yükselen iki nota, alçak yanlış, büyü
    parıltısı, konuşmadan kısık, Web Audio'nun çizgesi), sonucun planı (Kapalı'da yok,
    Dokununca'da yalnız efekt, sesli modda efekt ve metin), ES5 denetimi, ses listesinin
    alanları ve örneklerin yokluğu.
  - Uçtan uca: sınıf modu (dört bölgede birer görev, yenileme, kapanınca eski ilerleme,
    `?sinif=0`; 1920×1080 ve 1366×768'de taşma, yazı ve hedef ölçüleri), efektler (Kapalı'da
    yok, Dokununca'da notalar, sesli modda sıra ve gecikme, konuşma kesilmez), parıltı (renkler,
    Renksiz, Azalt), çevrim dışı ve güncelleme, iOS ipucu, `visibilitychange` ve `pageshow`,
    axe taramaları, cihaz.html ve Kopyala, eski tarayıcı uyarısı (paket ayrıştırılamaz; ES
    modülü yok), Sözlük kartı, haritanın balonu.

### PR'dan sonra düzeltilen (Codex'in bulgusu, doğrulandı)

- **Daralan ekranda geniş Sözlük kartı kalıyordu:** iki sütunluk kart (`span 2`) tek sütunlu
  ızgarada örtük ikinci bir sütun açar; `gridTemplateColumns` onu da saydığı için işaret hiç
  kalkmazdı (ekran dönünce ya da pencere daralınca). Ölçmeden önce geniş işaretleri kalkıyor.
  Uçtan uca testte 412 px'ten 300 px'e daralma eklendi (eski kodda kırmızıydı).

### Oturumda seçilen küçük ayrıntılar (kullanıcıya ayrıca sorulmadı)

- **İpucu iPad'de de:** iPadOS Safari'de de aynı silme kuralı var; kendini Mac gibi tanıtan
  iPad dokunma noktasından tanınır. iOS'taki Chrome, Firefox ve uygulama içi tarayıcılarda
  ipucu yok (orada Ana Ekrana Ekle Safari'deki gibi değil).
- **İpucunun yeri:** haritanın altında, kesik çerçeveli küçük bir balon; × ile kapanır.
- **Sınıf modunun görünümü** yalnız geniş yatay ekranda (en az 1024 px, yatay); telefonda sınıf
  modu olağan görünümdedir (işaretiyle). Kökün yazı boyu `max(16px, min(1.4584vw, 2.5926vh))`.
- **Sınıf modunda ayarlar kaydedilir** (ses, hareket, renkler); yalnız ilerleme, kartlar ve
  kalınan yer kaydedilmez. Sınıf modunun kendisi de ayardır: yenileyince sürer.
- **cihaz.html'de iki özellik daha:** `:has()` (haritanın zemini) ve Web Animations (hareketler).
- **Eski tarayıcı uyarısı iki yoldan:** `noModule` yoksa hemen; varsa `load`'a kadar oyun
  açılmadıysa (paket bu tarayıcıda ayrıştırılamadı ya da hata verdi). Oyun açılınca
  `html[data-acildi]` yazılır, uyarı hiç görünmez.
- **Efektlerin notaları** (G5 → C6; A3; C6 E6 G6 C7) ve düzeyleri (kazanç 0.1, 0.08, 0.04).
- **Sesli modda kelime efekt bitince gelir** (320 ms; yanlışta 260 ms), üst üste binmez.
- **Parıltı** altı yıldızcık, dört köşeli; renk sırası yanak, kara.
- **Güncelleme sorulmaz:** çocuğa "yeni sürüm var" denmez; sonraki açılışta sessizce gelir.

### Açık kalanlar

Oturum 11'de eklenenler (Oturum 12 için; kullanıcıya ayrıca sorulacak):

- ~~**Derleme hedefi:**~~ Oturum 12'de kapandı: bugünkü hedef kalır. Kullanıcı en eski cihazda `cihaz.html`'i açıp *Kopyala*'nın sonucunu
  verecekti. Hedef ona göre seçilir (Vite `build.target`; `dvh`, kap sorgusu birimleri ve
  `:has()` için geri dönüşler; Oturum 6'nın planı).
- **Ana ekrandaki uygulamada güncelleme:** yeni sürüm oyunun bütün pencereleri kapanınca gelir.
  Telefon uygulamayı arka planda günlerce canlı tutarsa eski sürüm o kadar sürebilir. Gerçek
  telefonda gözlenmeli; gerekirse "uzun süre arka planda kaldıysa görünür olunca yenile" gibi
  bir kural.
- **Güncelleme sırasında iki sürüm:** eski sürüm `ayarlar.sinif`'i ve `kapananIpuclari`'nı
  tanımaz; eski sekme kaydı yazarken düşürür. Sınıf modu kapanır ya da ipucu bir kez daha
  görünür (bir kez). `skipWaiting` kalktığı için eski ve yeni sürüm farklı sekmelerde daha uzun
  birlikte açık kalabilir.
- ~~**Sınıf modunda çok kartlı Sözlük kayar**~~ (Oturum 12'de: sayfalı; Ayarlar üç sütun) (bir açılışta onlarca kelime; ör. Koy 10 ve Bahçe 15
  kart, 1920×1080'de). Ayarlar da kayar (Hakkında uzun). İkisi de ölçütün dışında; gerekirse
  kartlar küçülür.
- **Sınıf modu dikey tahtada ve dar pencerede** olağan görünümde (1024 px'ten dar ya da dikey).
- **Hareket azaltmada büyünün sesi doğrunun sesiyle üst üste çalar** (bekleme yok; Koy'da
  çoğalma ve cep). Kulakla denenmeli.
- **iOS'ta sessiz anahtar:** Web Audio'nun efektleri sessiz anahtar açıkken susabilir, konuşma
  (`<audio>`) çalar. Gerçek telefonda denenmeli; gerekirse `navigator.audioSession`.
- **Efektlerin düzeyi ve tınısı** gerçek cihazda ve tahtanın hoparlöründe dinlenmeli (pilot);
  yanlışın sesi çocuğa cezalandırıcı gelmemeli.
- **Eski tarayıcı uyarısı** yalnız oyun hiç açılmazsa çıkar. Oyun açılır da bir özellik
  eksikliğiyle bozuk görünürse (ör. `:has()` ya da `dvh` yok) uyarı yok; cihaz.html bunları
  gösterir. Render'da hata (açılıştan sonra) beyaz ekran bırakabilir: gerekirse kökte bir hata
  sınırı uyarıyı gösterir.
- **Sözlük'ün geniş kartı ölçüyle açılır** (ResizeObserver): ilk çizimde bir an tek sütunda
  görünebilir. Geniş kartın bıraktığı boşluğa sonraki kart yerleşir (`grid-auto-flow: dense`):
  görünen sırada bir kart öne kayabilir (ekran okuyucunun sırası değişmez).
- **Erişilebilirlik yalnız otomatik denetlendi** (axe, Chromium). VoiceOver ve TalkBack ile elle
  deneme pilotta.
- **Uçtan uca testler yalnız Chromium'da:** efektler, parıltı, sınıf modunun ölçüleri ve
  cihaz.html Safari'de ve Firefox'ta sınanmadı.
- **Pilotta denenecekler** (Oturum 10'un "Gerçek telefonda doğrulama" listesine ek): sınıf modu
  gerçek bir etkileşimli tahtada (dokunma, yazı boyu, hoparlör); iPhone Safari'de ipucu ve
  kapatılması; efektler (iOS'ta ilk dokunuştan sonra); uçak modunda açılış; yeni sürümün
  gelişi; en eski cihazda cihaz.html.

## Daha önceki oturum: Oturum 10b — yeni ses ve sade cümleler (2026-10-01)

### Kullanıcının kararı: yeni ses

- **dfki sesi bırakıldı:** vurgusu ve duraklamaları kötü, lisansı kuşkulu (CC BY-NC-SA 4.0;
  model İngilizce *lessac* sesinden ince ayarlı).
- **Yeni ses:** Google Cloud Text-to-Speech'in Chirp 3: HD sesi, Callirrhoe
  (`tr-TR-Chirp3-HD-Callirrhoe`, `languageCode` tr-TR).
- **Gemini sesleri kullanılmaz:** Gemini API'nin şartları 18 yaş altına yönelik uygulamalarda
  kullanımı yasaklıyor. Text-to-Speech ise Google'ın hizmet listesinde üretken yapay zekâ hizmeti
  değil, Pre-Trained API.
- **Atıf** (README, Hakkında, `public/ses/LISANS.txt`, CLAUDE.md, DESIGN.md): Sesler yapay
  zekâyla, Google Cloud Text-to-Speech'in Chirp 3: HD Callirrhoe sesiyle önceden üretildi.
  Kodun MIT lisansı ses dosyalarını kapsamaz. README: üretim sırasında Google'a yalnız oyunun
  kendi metinleri gider; oyun çalışırken hiçbir istek yapılmaz.
- **Anahtar** yalnız `GOOGLE_TTS_KEY` ortam değişkeninde; depoya, kayda ve PR'a girmez. Her
  commit'ten önce `git grep -n "AI[z]a"` boş döndü (CLAUDE.md'de kural; kalıp `AI[z]a` yazılır ki kuralın kendisi eşleşmesin).

### Bitenler

- **Önce denetlendi:** Oturum 10'un işi main'de (ses.html, `ses-listesi.json`, `ses-uret.py`);
  anahtar ortamda; *Bukalemun Koyu* deneme isteği HTTP 200 (24 kHz LINEAR16).
- **Sade cümleler** (`nedenCumlesi`, `src/motor/neden.ts`): ünsüz nedenlerinin cümlelerinde taş
  ve jöle yerine okulun sözcükleri; harfler ve kök görevden:
  - yumuşama: *Ek ünlüyle başlayınca p yumuşar: b olur.*
  - inatçı: *top inatçıdır: p yumuşamaz.*
  - yumuşamaz: *sepet kelimesinde t yumuşamaz.*
  - sertleşme: *p sert, ekin başı da sert olur: t.*
  - yumuşak: *v yumuşak, ekin başı da yumuşak kalır: d.*; önceki ses ünlüyse *Ünlüden sonra
    ekin başı yumuşak kalır: c.*
  Karolar ve resimleri, ipucundaki *Taş sert, jöle yumuşak.* aynen kaldı. Neden tabloları
  değişmedi (cümle içermiyorlar).
- **Okunuş tablosu:** onaylı iki satır (*Fıstıkçı Şahap'ın Dükkânı* → *Fıstıkçı Şahabın
  Dükkânı*; *Önce Fıstıkçı Şahap'ın Dükkânı bitmeli.* → *Önce Fıstıkçı Şahabın Dükkânı
  bitmeli.*). Özel adda yazım korunur, söyleyiş yumuşar.
- **Ses üretimi** (`scripts/ses-uret.py`, CI'da yok): REST `v1/text:synthesize`, `X-Goog-Api-Key`
  başlığı; `speakingRate` 0.9. LINEAR16 → sessizlik 80 ms pay bırakılarak kırpılır → konuşulan
  kısmın RMS'i -20 dBFS (tepe en çok -1 dBFS) → MP3, mono, 24 kHz, 32 kbit/s (`lameenc`). Boş,
  aşırı kısa ya da uzun ses yeniden istenir (en çok 4 kez), yine olmazsa sonda listelenir; 429 ve
  5xx'te üstel bekleme. Dört istek aynı anda. Piper, model indirme ve `.piper/` kalktı.
- **Bütün sesler yeniden üretildi:** 690 ses, 3.22 MB; ön belleğe giren (arayüz ve Koy) 75 ses,
  629 KB. Örnekler 10 dosya, 109 KB. Google'a iki üretimde toplam 16 821 karakter gönderildi
  (8 411 + 8 410; 700'er metin, yeniden denemeler dahil; ikincisi Codex düzeltmesinden sonra).
  Şüpheli kalan yok.
- **Örnekler** (`ses.html`): aynı beş cümle (jöle cümlesinin yerine yeni yumuşama cümlesi)
  Callirrhoe'yle 0.9 (oyunun hızı) ve 1.0 (olağan). Adreslerinde sürüm var (`?v=`): yeniden
  üretilen örnek eski önbellekten gelmez.
- **Hatalı işaretleri sesin sürümüne bağlı:** anahtar `morfemusta.ses-denetimi.v2`, değer metin
  → `surum`; ses değişince eski işaret görünmez ve okunurken atılır. v1'deki (dfki) işaretler
  okunmaz.
- **Önbellek:** değişiklik gerekmedi. Ön bellekteki seslerin `revision`'ı içeriğin sürümü (yeni
  sesler kendiliğinden iner); öteki bölgelerinki `?v=<sürüm>` ile, eski sürümler bölgeye girişte
  silinir.
- **Testler:** 2027 birim testi ve 88 uçtan uca test (hepsi yeşil; tür denetimi temiz).
  - Birim: yeni cümleler (`neden-unsuz`, `dukkan`, `uyduruk`, `okunus`); `ses-listesi.json`'da ses,
    sağlayıcı, hız (0.9), biçim (24 kHz), her kaydın sürümü, dfki izi yok; okunuş tablosunun iki
    satırı kullanılıyor; örnekler (iki hız, dosya, sürüm); Hakkında'da *Chirp 3: HD* ve
    *Callirrhoe*.
  - Uçtan uca: Dükkân'ın 1. görevinde taş → *Ek ünlüyle başlayınca p yumuşar: b olur.*;
    Uydurukçuklar'da *mömüş* + *de* → *ş sert, ekin başı da sert olur: t.*; *zolku* + *ta* →
    *Ünlüden sonra ekin başı yumuşak kalır: d.*; ses.html'de örneğin adresi sürümlü, eski
    sürümün işareti görünmez.

### PR'dan sonra düzeltilen (Codex'in bulgusu, doğrulandı)

- **MP3'ler 24 kHz değil 22.05 kHz'ti:** `set_in_sample_rate` yalnız girişi söylüyor; LAME
  32 kbit/s'de çıkışı kendisi 22.05 kHz'e indiriyordu, listede yazan biçim yanlıştı (700
  dosyanın başlığı okunarak doğrulandı). Artık `set_out_sample_rate(24000)`; `bicim` dosyaların
  başlığından okunur, beklenen hız değilse betik durur. Sesler yeniden üretildi. Birim testi
  her MP3'ün başlığını okur (eski 22.05 kHz'lik dosyayla kırmızı olduğu denendi).

### Birleşmeden sonra düzeltilen (kullanıcının incelemesi: uzun iç sessizlik)

- **Sorun:** yaklaşık 20 seste iç sessizlik 0.8–1.9 sn'ydi; çoğu uyum cümleleri (*Kalınlıkları
  uyuşmuyor.*, 11'i Koy'da), *pe sert, ekin başı da sert olur: te.* de öyle.
- **Üreteç:** kırpmadan sonra PCM üzerinde 0.5 sn'den uzun her iç sessizlik 0.5 sn'ye iner
  (ortası atılır; sesin sönüşü ve başlayışı kalır). Sessizlik: 10 ms'lik pencerenin RMS'i
  sesin tepesinin 35 dB altı. Baştaki ve sondaki sessizliğin kırpılması da artık bu göreli
  eşikle (önceden sabit genlik 300); denetim aynı ölçüyle bakar.
- **Denetim:** baştaki ya da sondaki sessizlik 0.3 sn'yi, iç sessizlik 0.6 sn'yi geçerse ses
  yeniden istenir, yine olmazsa üreteç hata verir (dosya yazılmaz, çıkış kodu 1).
- **Yalnız kurala uymayanlar yeniden üretildi** (`--yeniden DOSYA`): mevcut MP3'ler ffmpeg'le
  çözülüp aynı ölçüyle tarandı (geçici betik; ffmpeg üretecin bağımlılığı değil). 57 dosya:
  49'unda iç sessizlik 0.5 sn'den uzundu (0.52–1.88), 8 tek kelimede baştaki sessizlik
  0.38–0.77 sn'ydi (*datipüm*, *çevicim*, *cik* ...). 55'i oyunun sesi, 2'si örnek (*yavas-2*,
  *yavas-4*). Öteki 643 dosya bayt bayt aynı kaldı (SHA-1 ile denetlendi). Google'a 2 117
  karakter gönderildi. Toplam 690 ses 3.09 MB; ön bellekte 573 KB; örnekler 102 KB.
- **Codex'in iki bulgusu (doğrulandı, düzeltildi; sahte üreteçle geçici dizinde sınandı):**
  - `--yeniden` listede olmayan bayat sesleri de üretiyordu ("ötekiler değişmez" tutmuyordu).
    Artık öyle bir ses varsa hiç istek gitmeden durur, listesini yazar.
  - Denetimi geçemeyen bayat ses (ör. okunuşu değişmiş) listeye yeni okunuşla, eski dosyanın
    sürümüyle yazılıyordu; sonraki çalıştırma onu güncel sayıp hiç üretmezdi. Artık listede
    eski kaydı kalır (eski kaydı yoksa listeye girmez), sonraki çalıştırma yeniden dener.
- **Sonra yeniden ölçüldü:** baştaki ve sondaki sessizlik her dosyada en çok 0.13 sn; iç
  sessizlik en çok 0.60 sn (MP3'ten çözülünce 15 dosyada 0.51–0.60: kodlamanın payı, denetimin
  0.6 sınırı içinde).

### Birleşmeden sonra eklenen (kullanıcının isteği: sözcük okunuşu)

- **Sorun:** Chirp *Bukalemun*'daki ilk a'yı uzatıyordu (*Bukaaalemun*).
- **Sözcük tablosu** (`icerik/ses-sozcuk.csv`, `sozcuk,ipa`; yalnız kullanıcının onayıyla
  değişir, CLAUDE.md 16. kural). İlk satır (onaylı): *Bukalemun*, `bukaleˈmun`. Tablodaki sözcük
  okunuşta bütün sözcük olarak geçiyorsa (`sozcukOkunuslari`, `src/ses/okunus.ts`; büyük-küçük
  harf tablodaki gibi, *Bukalemunlar*'da eşleşmez) Cloud Text-to-Speech'e
  `input.customPronunciations` (`PHONETIC_ENCODING_IPA`) ile gider. Google alanı Chirp 3: HD'de
  kabul etti (deneme isteği HTTP 200).
- **Sesin kimliği:** `ses-listesi.json`'daki kayda `sozcukler` yazılır (yalnız sözcük geçiyorsa);
  üreteç onu da karşılaştırır, birim testi listeyi tabloyla eşler. Tablo değişince yalnız o
  sözcüğü içeren sesler yeniden üretilir.
- **Değişen sesler (7):** Bukalemun geçen 5 metin (*Bukalemun Koyu*, *Önce Bukalemun Koyu
  bitmeli.*, *Bukalemun en yakın ünlüye bakar.* ile biten üç uyum cümlesi) ve ses.html'deki
  *Bukalemun Koyu* örneği iki hızda (`ornek/yavas-1`, `ornek/olagan-1`). Sessizlik denetiminden
  geçtiler. Öteki 693 dosya bayt bayt aynı (SHA-1). Google'a 309 karakter gönderildi. İkinci
  çalıştırma hiçbir şey üretmedi.

### Oturumda seçilen küçük ayrıntılar (kullanıcıya ayrıca sorulmadı)

- **Kısa parçada boş ses:** Chirp *pe*, *lik* gibi tek heceli parçalarda ara sıra sessiz ses
  veriyor. Yeniden deneme çoğunlukla düzeltiyor; ikinci denemeden sonra sona nokta eklenir
  (yalnız istekte; listedeki okunuş değişmez).
- **Süre sınırları:** en az max(0.15, 0.03 × harf / hız) s, en çok 1.2 + 0.16 × harf / hız s.
- **Yükseklik:** RMS -20 dBFS, tepe sınırı -1 dBFS; sessizlik eşiği 10 ms'lik pencerede ortalama
  genlik 300 (yaklaşık -40 dBFS).
- **`public/ses/LISANS.txt`** adı kaldı; içi yeni atıf.

### Açık kalanlar

Oturum 10b'de eklenenler (Oturum 11 için; kullanıcıya ayrıca sorulacak):

- ~~**Seslerin hızı:** kullanıcı `ses.html`'deki örneklerden seçecek (0.9 ya da 1.0).~~
  Oturum 11'de kapandı: 0.9 kaldı, örnekler kalktı.
- **Seslerin dinlenmesi:** 690 Callirrhoe sesi kulakla denetlenmedi; özellikle uydurma
  kelimeler (*fıngıl*, *zelüe*), harf adları (*pe*, *yumuşak ge*) ve tek heceli ekler (*lik*,
  *çi*). Yanlışlar `ses.html`'de işaretlenip `icerik/ses-okunus.csv`'ye (onayla) yazılır.
- **Chirp sesi zamanla değişebilir:** Google modeli güncellerse aynı metin farklı çıkar;
  yalnız değişenler yeniden üretildiği için ses karışabilir. Gerekirse `--hepsi`.

## Daha önceki oturum: Oturum 10 — ses ve resim (2026-09-30)

### Bitenler

- **Önce:** Oturum 9'un PR'ı ([frtbasbug/morfemusta#10](https://github.com/frtbasbug/morfemusta/pull/10))
  kullanıcının isteğiyle birleştirildi; çalışma dalı güncel main'den kuruldu.
- **Veri, verildiği gibi:** `icerik/emoji.csv` (22 kök) hiç değiştirilmeden kaydedildi;
  `icerik/ses-okunus.csv` başlığı kurulu, boş (`metin,okunus`). İkisi de yalnız kullanıcının
  onayıyla değişir (CLAUDE.md, 16. kural). Sözlük, altın tablo, bölge, görev ve neden tabloları,
  uydurma kökler değişmedi.
- **Ses metinleri** (`src/ses/metinler.ts`, `sesMetinleri()`): oyunun söyleyebileceği her metin,
  bölge bölge (arayüz 9, Koy 66, Dükkân 37, Bahçe 59, Uydurukçuklar 536; toplam 690). Okunuş
  (`src/ses/okunus.ts`): tek harf adıyla (p → pe, ğ → yumuşak ge; ünlüler kendisi), ok ve tire
  okunmaz, tablodaki okunuş önce gelir. Haritanın iletileri `bolgeler.ts`'e taşındı
  (`kilitIletisi`, `HAZIRLANIYOR_ILETISI`): ekran ve ses aynı metni kullanır.
- **Ses üretimi** (`scripts/ses-uret.py`, CI'da yok): Piper, `tr_TR-dfki-medium` (resmî depoda
  tek Türkçe ses; kullanıcının bildirdiği gibi komuttaki fahrettin ve fettah yok). MODEL_CARD:
  veri kümesi github.com/marytts/dfki-ot-data, lisans CC BY-NC-SA 4.0; kart modelin İngilizce
  *lessac* (medium) sesinden ince ayarla eğitildiğini de yazıyor. Hız 1.2 (biraz yavaş). MP3,
  mono, 22.05 kHz, 32 kbit/s (`lameenc`; ffmpeg gerekmez). 690 ses, toplam 3.03 MB; ön belleğe
  giren (arayüz ve Koy) 75 ses, 572 KB. Örnekler: aynı beş cümle iki hızda (1.2 ve 1.0), 120 KB.
  Metinleri `scripts/ses-metinleri.mjs` verir; eşleme `src/ses/ses-listesi.json`'da. Ses
  dosyaları kodun MIT lisansından ayrı, CC BY-NC-SA 4.0 ile yayımlanır (README,
  `public/ses/LISANS.txt`, Hakkında).
- **Çalar** (`src/ses/calar.ts`): tek `<audio>`, yenisi eskisini keser, dizi (ad ve ileti)
  sırayla çalar; dosya fetch'le blob olarak alınır; listede olmayan metne istek gitmez; hata
  yutulur. iOS'ta ilk dokunuşta sessiz bir WAV (`sesiAc`).
- **Önbellek:** arayüzün ve Koy'un sesleri service worker'ın ön belleğinde
  (`additionalManifestEntries`); öteki bölgelerinki bölgeye ilk girişte arka planda
  `morfemusta-ses` önbelleğine iner (`bolgeSesleriniIndir`), service worker oradan verir.
- **Ayarlar:** *Ses*: Kapalı / Dokununca / Sesli mod (varsayılan Dokununca); kayıtta
  `ayarlar.ses` (biçim sürüm 1'de kaldı; eksikse Dokununca). *Hakkında*: kod (MIT), sesler
  (Piper, dfki, CC BY-NC-SA 4.0), emojiler (Twemoji 16.0.1, CC BY 4.0), yazı tipleri (OFL).
- **Sesli mod:** Koy, Dükkân, Bahçe ve Uydurukçuklar'da görev başında kök (Bahçe'de hedef;
  girişte önce bölgenin adı); bukalemun, karo ya da ek seçilince veya sürüklenmeye başlayınca
  aday kelime (Bahçe'de ekin kendisi); doğruda kurulan kelime; yanlışta neden cümlesi.
  Uydurukçuklar'ın sınır adımında karo seçilince kelime, oturunca kelime ve *İkisi de olur*.
  Haritada kilitli ya da hazırlanan bölgeye dokununca adı ve iletisi; akşam ekranında başlık,
  ara yazı ve kelimeler; Sözlük'te karta dokununca kelime.
- **Hoparlör** (Dokununca ve sesli modda): kelimenin (kartın sağ üst köşesinde rozet) ve
  cümlenin (solunda) yanında; haritanın iletisinde, akşam başlığında, Sözlük kartında.
- **Simgeler:** *Sıradaki*'de sağa ok (dört bölgede), *Haritaya dön*'de harita.
- **Resim:** Twemoji 16.0.1'in SVG'leri, yalnız tablodaki 22 emoji (92 KB), özgün depodan
  (`scripts/emoji-indir.mjs`; npm'deki yeniden paket yerine). Koy'un kartında (çoğulda üç),
  Dükkân kartının sol üst köşesinde, Bahçe'de ağacın kökünde, Sözlük kartında. Uydurma kökte
  yok. Kurallar DESIGN.md'de ("Ses ve resim").
- **Ses Denetim Sayfası** (`ses.html`, dördüncü giriş): 690 ses bölge bölge, çal düğmesi,
  okunuşu farklıysa altında; Hatalı işaretleri cihazda (`morfemusta.ses-denetimi.v1`); *Listeyi
  kopyala*. Üstte aynı beş cümle iki hızda; hızı kullanıcı seçecek.
- **Testler:** 2024 birim testi ve 88 uçtan uca test (hepsi yeşil; tür denetimi temiz).
  - Birim: `okunus.test.ts` (harf adları, ok ve tire, tablo), `metinler.test.ts` (gruplar,
    örnek metinler; her metnin `ses-listesi.json`'da dosyası ve güncel okunuşu; artık dosya
    yok), `emoji.test.ts` (her kök sözlükte, her dosya var, Twemoji adları), `Ses.test.tsx`
    (hoparlör Kapalı'da yok), Ayarlar (Ses, Hakkında), ilerleme (`ses` ayarı), kurallar (ses
    dosyaları da taranır).
  - Uçtan uca (`e2e/ses.spec.ts`): sesli modda Koy'un 10 görevi dokun-dokun (girişte ad ve kök,
    seçilince aday, doğruda kurulan kelime, bir yanlışta neden cümlesi, akşamda başlık ve
    kelimeler; konsol hatası ve dış istek yok); haritada kilitli bölge, Sözlük kartı; Kapalı'da
    hiçbir ses ve hoparlör yok; Dokununca'da kendiliğinden çalmaz, hoparlör çalar (44 px);
    Ayarlar; at kartında 🐎, çoğulda üç; Koy'un sesleri service worker önbelleğinde,
    Uydurukçuklar'ınki girişte iner; `ses.html` açılır, çalar, işaretler kalır, *Listeyi
    kopyala* panoya koyar, çevrim dışı açılır.

### PR'dan sonra düzeltilen (Codex'in iki bulgusu, doğrulandı)

- **Çalışma anı önbelleğindeki ses sürümsüzdü:** önceden inmeyen bölgelerin (Dükkân, Bahçe,
  Uydurukçuklar) sesi yeniden üretilirse adı ve adresi aynı kalıyor, `CacheFirst` eskisini hep
  veriyordu. Artık adreste içeriğin sürümü var (`?v=<sürüm>`, `kayitAdresi`); bölge indirilirken
  önbellekteki eski sürümler silinir. Ön bellekteki (arayüz ve Koy) seslerin adresi yalın
  kaldı: sürümünü Workbox tutar. Birim testi (`calar.test.ts`), uçtan uca test (adresi sürümlü).
- **Ekran değişince ses sürüyordu:** çalar modül düzeyinde; haritaya dönünce eski ekranın sözü
  bitene kadar çalıyordu. Artık `App.tsx` ekran değişince susturur (yerleşim etkisi: yeni
  ekranın söyleyişi ondan sonra başlar). Uçtan uca test: ses çalarken Harita'ya dokununca susar,
  dizinin kalanı çalmaz (düzeltme olmadan kırmızıydı).

### Kullanıcının verdikleri

- Oturumun tarifi (sekiz madde) ve emoji tablosu oturum başında geldi. Ses için: yalnız
  tr_TR-dfki-medium (CC BY-NC-SA 4.0; ses dosyaları MIT'ten ayrı), örnekler bu sesin iki hızı;
  huggingface.co ağ ayarına sonradan eklendi.

### Oturumda seçilen küçük ayrıntılar (kullanıcıya ayrıca sorulmadı)

- **Dosya adı:** metnin SHA-1'inin ilk 12 onaltılık hanesi (`public/ses/<özet>.mp3`, ASCII).
- **Hız:** oyunda 1.2; örneklerde 1.2 ve 1.0. Kullanıcı seçince `YAVAS` değişir, `--hepsi` ile
  yeniden üretilir.
- **Örnek cümleler:** *Bukalemun Koyu*; *e ince, a kalın. Kalınlıkları uyuşmuyor.*; *p ünlüden
  önce jöle olur: b.*; *İkisi de olur: pıtakım, pıtağım.*; *Meyvenin üstüne gövde çıkmaz: önce
  çi.*
- **Açık bölgenin adı** haritada değil, bölge ekranında söylenir (girişte, kökten önce):
  haritada söylenen ad bölgeye girer girmez kesilirdi.
- **Resim süstür:** `alt` boş, `data-emoji`'de emoji; kelimenin erişilebilir adı değişmez.
- **Sözlük kartında hoparlör** sağ alt köşede (kart 158 px, kelimenin yanına sığmıyor).
- **Bahçe'de hedefin hoparlörü** tabelanın altında (tabela küçük; köşe rozeti taşardı).
- **Sesli modda da hoparlör var:** yeniden dinlemek için.

### Açık kalanlar

Oturum 10'da eklenenler (Oturum 11 için; kullanıcıya ayrıca sorulacak):

- ~~Seslerin hızı, seslerin dinlenmesi, modelin kökeni~~: dfki sesi Oturum 10b'de bırakıldı;
  yerine geçen maddeler Oturum 10b'nin açık kalanlarında.
- **İki sürüm aynı anda açıkken** eski kod `ayarlar.ses`'i tanımaz: bir ayar değiştirirse ses
  ayarı Dokununca'ya döner (bir kez).
- ~~**Ses listesi paketi büyütüyor.**~~ Oturum 11'de: oyunun paketine yalnız gereken alanlar
  girer (`ses-listesi.json?oyun`); ses parçası 109.2 KB'tan 53.6 KB'a indi.
- **Uydurukçuklar'ın sesleri 2.2 MB (Oturum 10b'de 2.3 MB):** bölgeye ilk girişte hepsi iner (100 görev, 10 tur).
  Gerekirse tur tur indirilir.
- ~~**Haritanın ileti balonunda hoparlör** balonun kenarından biraz taşıyor.~~ Oturum 11'de
  düzeldi: hoparlör balonun içinde.
- **Dükkân'daki değişim yazısı** (*kitap → kitabım*) söylenmiyor; yalnız kurulan kelime.
- **Ekran okuyucuyla sesli mod:** oyunun sesi ve ekran okuyucunun sesi çakışabilir; sesli mod
  ekran okuyucu kullanmayan, okumayan çocuk içindir.
- **Sözlük kartına dokunma** yalnız sesli modda çalar; kart düğme değil (klavyede hoparlör var).

Oturum 9'da eklenenler (Oturum 11 için; kullanıcıya ayrıca sorulacak):

- **İki sürüm aynı anda açıkken** eski kod *pıtağım* kartını tanımaz ve kaydı yazarken atar
  (`kartiCoz` eski sürümde yalnız `ekle`'ninkini kabul ediyordu). Güncelleme sırasında bir kez
  olabilir.
- ~~**Tur numarası ekranda yok.**~~ Oturum 11'de: *2. tur · 3 / 10*.
- **Uydurukçuklar'da parmakla sürükleme** uçtan uca sınanmadı (fareyle sınandı; Koy ve
  Dükkân'da CDP dokunmasıyla sınanıyor).
- **Kaynaştırma nedeninde `su`:** aday kök + yüzeydir (`su` + `a` → *sua*); motorun gövdesi
  (*suy*) nedene girmez. Tablodaki satırlar böyle; *suya* doğru.
- **Uydurma kök denetiminde `ek`** yalnız tek ekle bakar (*kuş + lar*); iki ekli okuma
  (*kuş + lar + ım* gibi uzun kök) aranmaz; bugün kökler iki hecelidir.

Önceki oturumlardan kalanlar:

- **Karo geometrisi tuvalden gelmedi:** `karo.ts`'teki yollar oturumda yazıldı; `cizim.ts` gibi
  bir başvuru testi yok. Tuvalde çizilirse sayılar oradan alınır ve karşılaştırma testi eklenir.
- **Birden çok sınırlı görev yok:** `gorevinSiniri` tam bir sınır ister. Zincirli bir dükkân
  görevi (*kitabımda*: gövde ve ek başı) gelirse ekran sınırları sırayla sormalı.
- **İkizleşen kökte gövde sınırı sayılmıyor** (*hakkı*): bir görev isterse ayrı bir sınır türü
  gerekir.
- **Ek başı nedeninde ünlüden sonraki C/D'nin kalınlığı** ayrıca uyum nedeni de alır (*kitapde*:
  `LOC:sertleşme;LOC:kalınlık`); ekranda yalnız ilk neden görünür.
- **Kilit türetilir, saklanmaz:** bir görev tablosu büyürse bitmiş bölge yeniden açık olur,
  ardındaki bölge kilitlenir. Tablolar yalnız onayla değiştiği için bugün sorun değil;
  gerekirse açılan bölgeler kayda yazılır.
- **Yeni bölge üç yere eklenir** (Uydurukçuklar'la dört bölgenin dördü de dolu):
  - ekranı `App.tsx`'teki `BOLGE_EKRANLARI`'na (kimlikten ekrana; ekranı olmayan bölgeye
    girilmez);
  - görev tablosu `GOREV_TABLOLARI`'na;
  - işareti `AdaHaritasi.tsx`'teki `isaret`'e.
  Haritada yalnız dört bölgenin yeri var (`BOLGE_YERLERI`); beşinci bölge yer ve yol ister
  (test denetler). Kartları görevin kelimesi değilse ekran `onGorevBitti`'ye kartların eklerini
  de verir (bahçe gibi).
- **Tema rengi haritada krem:** tarayıcının çubuğu krem, haritanın denizi yeşilimsi. Gerekirse
  ekrana göre değişir.
- ~~**Sözlük kartında kök + ek satırı kırılıyor.**~~ Oturum 11'de düzeldi: sığmayan kart iki
  sütun genişliğinde.
- **Kılık dışı yüzey hata verir:** `neden`, ekin kılıklarından olmayan yüzeyi reddeder
  (`lır`, `lr`). Saklanan ünlüde (kedi + `im`) seçenek sunacak bir bölge gelirse ayrı bir
  neden gerekir.
- **Koy'da anlam etkisi yalnız PL ve POSS.1SG için** (`ANLAM_ETKILERI`, `src/oyun/koy.ts`).
  -CIk, -lI ve -sIz'in büyüleri Kök Bahçesi'nde (`buyusu`, `src/oyun/bahce.ts`); -DA'nınki ve
  -(y)A'nınki (yıldız) Uydurukçuklar'da (`UYDURUK_BUYULERI`, `src/oyun/uyduruk.ts`).
- **Galerinin uymayan örneği hâlâ elle:** `neden` artık var; istenirse galeri *evlar*'ı
  motordan kurar, nedenini de gösterir.
- **İkonlar yer tutucu:** `scripts/ikon.svg`'deki ada çizimi eski renklerde. Haritadaki adayla
  ya da koddan üretilen bir karakterle yeniden çizilebilir (`npm run ikonlar`).
- **Bukalemun yazısı yalnız kısa eklerle sınandı** (lar, ım, m). Uzun yüzeyler (ör. -lArI,
  -(n)In) gövdeye sığmayabilir.
- **Saklanan ünlüde ince ek hesaba katılmıyor:** ek parçası kökün sözlük işaretini taşımıyor.
  Sözlükte ünlüyle biten ince-ek kökü yok; eklenirse `kilik.test.ts` kırılır.
- **Galerinin örnekleri kodda** (`src/galeri/ornekler.ts`): galeri oyun içeriği değil, görsel
  dilin çizelgesi sayıldı (4. kural); kökler sözlükte olmak zorunda (test denetler).
- **`iş` sözlükte yok:** Oturum 2'nin 85. altın satırı (`iş,AGT,işçi`) uydurma kökle
  çalışıyor. Biçim değişmiyor; istenirse `iş` sözlüğe eklenir (kullanıcı onayıyla).
- **Denetim sayfasında yalnız sözlük kökleri ve sekiz ek var:** uydurma kökler, yapım
  zincirleri (gözlüğüm) ve öteki ekler (ABL, INS, POSS.2SG ...) yok; gerekirse eklenir.
- **Ek adları CSV'de yok:** yönelme, bulunma, ayrılma gibi Türkçe adlar canlandırılacak
  (DESIGN.md, "Terimler resimdir"). Arayüz gerektirince `ekler.csv`'ye sütun eklenebilir.
- **Kökte yalnız 29 küçük harf kabul ediliyor:** *kâr*, *hâlâ* gibi düzeltme işaretli
  kökler ve büyük harf şimdilik hata veriyor (motorda da sözlükte de).
- **Gerçek telefonda doğrulama (PR birleşince):**
  - Adres: <https://frtbasbug.github.io/morfemusta/>.
  - Kurulum: Android Chrome'da "Uygulamayı yükle / Ana ekrana ekle"; iOS Safari'de Paylaş →
    "Ana Ekrana Ekle". Ardından uçak modunda açılış.
  - Geri tuşu: ana ekrana eklenmiş uygulamada (tam ekran) koydan ve Sözlük'ten haritaya,
    haritadan dışarı.
  - Yayından sonraki ilk açılış eski sürümü gösterebilir. `registerSW.js` service worker'ı
    yalnız kaydeder: yeni sürüm arka planda iner ve devreye girer, açık sayfa yenilenmez.
    Uygulama kapatılıp açılınca yeni sürüm gelir.
  - İlerleme: birkaç görev, uygulamayı kapatıp açma; Firefox'ta kalıcı depo izni sorabilir.
  - Renksiz: her kelimede kökün ve ekin etiketi aynı ende (koyda, Sözlük'te, akşamda).
  - Bukalemun Koyu'nda ve dükkânda parmakla sürükleme: uçtan uca testler Chromium'da fareyle
    ve CDP dokunmasıyla sınıyor; iOS Safari'de Pointer Events ile `touch-action` denenmeli.
  - Dükkân: taşın erimesi ve jölenin taşa dönmesi telefonda okunaklı mı; Renksiz'de taş ve
    jöle ayrılıyor mu.
  - Bahçe: halka büyümesi, kartın düşmesi, meyvenin cebe girmesi ve *kalemliğ*'deki erime
    telefonda okunaklı mı; sepetten ağaca parmakla sürükleme; Renksiz'de halka ve meyve.
  - Uydurukçuklar: yaratığın boyu ve süsleri, yıldızın uçuşu, cebe giriş ve tezgâhta *pıtak*
    taşının erimesi telefonda okunaklı mı; bukalemunu ve karoyu yaratığa parmakla sürükleme.
  - Ses: iPhone Safari'de ilk dokunuştan sonra sesli mod çalıyor mu (ana ekrandaki uygulamada
    da); sessiz anahtar açıkken ne oluyor; uçak modunda Koy'un sesleri, bir kez girilmiş
    bölgenin sesleri.
  - Denetim sayfası: <https://frtbasbug.github.io/morfemusta/denetim.html>. Karakter
    Galerisi: <https://frtbasbug.github.io/morfemusta/galeri.html>. Ses Denetim Sayfası:
    <https://frtbasbug.github.io/morfemusta/ses.html>.
- **Yön kilidi yok:** manifest'te `orientation` yazılı değil. Telefonda dikey kilit mi, karar
  bekliyor (sınıf modu Oturum 11'de geldi; tahtada tarayıcıda açılır, manifest'e bağlı değil).
  Yatay telefonda harita 32rem'lik çerçeveyle kaydırılarak görünür.
- **DESIGN.md künyeleri:** Aksu-Koç & Slobin (1985) ile Becker, Ketrez & Nevins (2011)
  yalnız kısa atıfla geçiyor. Tam künye, doğrulanmış kaynaktan eklenebilir.
- **Önbellek boyutu:**
  - ~~Andika'nın Kiril ve Vietnamca alt kümeleri de önbelleğe giriyor.~~ Oturum 11'de: Andika
    da yalnız `latin` ve `latin-ext` (yazı tipleri 308.5 KB'tan 229.7 KB'a).
  - Denetim sayfası, galeri, ses denetim sayfası ve cihaz denetimi de önbelleğe giriyor;
    girmezlerse service worker onları oyuna düşürür, çıkarılmamalı.

## Daha da önceki oturum: Oturum 9 — Uydurukçuklar (2026-09-30)

### Bitenler

- **Veri, verildiği gibi:** `icerik/gorevler/uydurukcuklar.csv` (10 tur × 10 görev, 100 kök),
  `icerik/yasakli-diziler.csv` (43 dizi), `tests/neden-kaynastirma.csv` (22 satır) ve
  `tests/uydurma-denetimi.csv` (15 satır) hiç değiştirilmeden kaydedildi. Onaylı tek veri
  değişikliği: `icerik/bolgeler.csv`'de `uyduruk` satırının `gorevler` sütunu
  `icerik/gorevler/uydurukcuklar.csv`. Sözlük, altın tablo, neden tabloları ve öteki tablolar
  değişmedi. CLAUDE.md'ye 15. kural: uydurma kökler ve yasaklı diziler yalnız kullanıcının
  onayıyla değişir (12. kurala iki yeni test tablosu da eklendi).
- **Motor: kaynaştırma nedeni** (`src/motor/neden.ts`): (y), (n) ve (s) ile başlayan ekte
  kaynaştırmalı ve kaynaştırmasız yüzey de kılıktır (`kaynastirmaKarsiti`). Ünlüden sonra
  ayraçlı ünsüz yoksa ya da ünsüzden sonra varsa `<ETİKET>:kaynaştırma` (eksik / fazla); ek
  başı adımında, ünlü uyumundan önce. Cümleler: *İki ünlü yan yana gelmez: araya y girer.* (n,
  s'de harf değişir) ve *Ünsüzden sonra araya y girmez.* `yuzeySecenekleri(parca, {
  kaynastirma: true })` iki kılık takımını birlikte verir (ya, ye, a, e); `unsuz: true` D ve C
  yuvasının taşını ve jölesini de (da, de, ta, te). 22 satır, `neden.csv`
  ve `neden-unsuz.csv` geçiyor; altın tablonun 202 satırı değişmeden geçiyor.
- **Motor: uydurma kök denetimi** (`src/motor/uydurma.ts`, `uydurmaDenetimi(kok)`): ses, sözlük,
  yasak, ek; ilk bozukluk döner. 15 satır ve görev tablosunun 100 kökü geçiyor.
- **Üreteç** (`scripts/uydurma-uret.mjs`): tohumlu, aynı kurallarla aday kurar, denetimden
  geçirir, görev tablosundakileri atlar; gerçek kelimeleri `scripts/zeyrek-denetimi.py
  --adaylar` ile zeyrek eler (CI'da yok). Çıktı yalnız `uydurma-adaylari.tsv` (git'e girmez).
  Kullanım:

  ```
  pip install zeyrek
  node scripts/uydurma-uret.mjs --tohum 7 --sayi 30               # uydurma-adaylari.tsv
  node scripts/uydurma-uret.mjs --tohum 7 --sayi 30 --cikti a.tsv
  node scripts/uydurma-uret.mjs --tohum 7 --zeyreksiz              # zeyrek yoksa (elenmez)
  NLTK_ALLOW_PROXIED_URLOPEN=1 node scripts/uydurma-uret.mjs ...   # vekil sunucu arkasında
  ```

  Sütunlar: `kok`, `son` (ünlü / pçtk / öteki: görev şekline göre seçmek için), `unlu` (son
  ünlü, yaratığın karakteri). Aynı tohum ve sayı aynı dosyayı verir. Oyuna kök yalnız onayla,
  görev tablosu elle değişerek girer.
- **Oyun mantığı:**
  - Görev tablosu turlu (`tur,sira,kok,ekler`): `Gorev`'e `tur` ve `turdakiSira` eklendi;
    `sira` bütün tablodaki sıradır. `turlar`, `turunYeri` (`src/oyun/gorevler.ts`).
  - İlerleme kaydın biçimi değişmeden: `kaldigi` bütün tablodaki yer (10 = 2. turun başı, 100
    → 1. tura dönüş). `bolgeBittiMi`: bir turu biten bölge tamam (Uydurukçuklar ilk turla).
  - Kart çocuğun kurduğu biçimi saklar (`gorevBitti(..., kelime)`); `kartiCoz` kelimeyi
    `olasiBicimler`'de arar (önceden yalnız `ekle`). *pıtakım* ve *pıtağım* ayrı kartlar.
  - `src/oyun/uyduruk.ts`: adım (kaynaştırmalı kılıklar, Koy'un tohumu), sınır adımı
    (`uydurukSiniri`: gövde sınırında iki karo da doğruysa), `sinirCumlesi`, `kurulanBicim`,
    büyüler, indirgeyici (sec, dene, dustu, birlesti, karoSec, karoDene, buyuye, etki, bitti,
    sonraki).
- **Görsel dil:** yaratık (`src/gorsel/yaratik.ts` saf, `Yaratik.tsx`): son ünlünün karakteri,
  kök başına tohumlu boynuz (yok / iki / tek) ve benek (0 / 2 / 3; en az bir süs); ağız
  `unluCizimi`'nin. Yıldız (`--yanak`). Harita işareti: *fıngıl* 0.42, yazısız. Galeride
  "Uydurukçuklar" bölümü: ilk turun on yaratığı, yıldız, işaret. Sözlük'te uydurma kelimenin
  kartında köşe işareti. DESIGN.md'de "Uydurukçuklar", "Yaratık", "Uydurma kök denetimi".
- **Ekran** (`src/ekranlar/Uydurukcuklar.tsx`): öteki bölgelerin kabuğu; yaratık ve adı hedef,
  kıyıda bukalemunlar; doğruda yay, zıplama, büyü; sınır adımında Dükkân'ın tezgâhı (jölede
  taş erir), *İkisi de olur: pıtakım, pıtağım.*; yanlışta düşüş, üstü çizili aday, ilgili iki
  ses, cümle. Cep yalnız iyelik görevlerinde. Sürükle-bırak (bukalemun ve karo), dokun-dokun,
  klavye.
- **Testler:** 1262 birim testi ve 78 uçtan uca test (hepsi yeşil; PR düzeltmesiyle).
  - Birim: `neden-kaynastirma.test.ts`, `uydurma-denetimi.test.ts`, `uyduruk.test.ts` (100 kök
    denetimden geçer, her turda aynı on görev şekli, her doğru biçim seçeneklerden kurulur,
    tek doğru bukalemun, sınır adımı, indirgeyici), `yaratik.test.ts`, turlar ve kartlar
    (`ilerleme.test.ts`), `Uydurukcuklar.test.tsx`, Sözlük, galeri, harita, kurallar.
  - Uçtan uca (`e2e/uydurukcuklar.spec.ts`): 1. tur dokun-dokun, akşam, haritada tamam, ikinci
    girişte *pıbız*, Sözlük'te 10 kart ve işaretler; yarım tur sürer; 8. görevde *e* →
    kaynaştırma cümlesi, ü ve e etikette; 4. görevde jöle → *pıtağım* kartı, taş → *pıtakım*
    kartı (yeniden yüklemeden sonra da); klavye; sürükle-bırak (bukalemun ve karo); hareket
    azaltma; Pixel 7, 360×640 ve 320×568'de taşma yok, dokunma alanları en az 44 px; Renksiz;
    Harita düğmesi. `kok-bahcesi.spec.ts`: bahçe bitince Uydurukçuklar açılır ve girilir.

### PR'dan sonra düzeltilen (kullanıcının bulgusu)

- **LOC'ta dört kılık:** kıyıda yalnız ünlü kılıkları vardı (*mömüş*: te, ta); benzeşme hiç
  sınanmıyordu. Artık `yuzeySecenekleri(parca, { unsuz: true })` D ve C yuvasının taşını ve
  jölesini de verir (`neden`'in kabul ettiği yüzeyler); Uydurukçuklar kaynaştırmayla birlikte
  açar: LOC'ta da, de, ta, te. Birim testleri (seçenekler, *mömüş* + *de* ve *zolku* + *ta*
  nedenleri) ve uçtan uca testler: 5. görevde *de* → *ş taş, ekin başı da taş olur: t.*; 7.
  görevde *ta* → *Ünlüden sonra ekin başı jöle kalır: d.*; dört bukalemun Pixel 7, 360×640 ve
  320×568'de kaydırmadan sığar. Codex'in incelemesi (`f207c9d`) bulgu vermedi.

### Kullanıcının verdikleri

- Oturumun tarifi (altı madde), dört tablo, onaylı tek veri değişikliği, kaynaştırma ve sınır
  cümleleri, uydurma kök kuralları oturum başında geldi.

### Oturumda seçilen küçük ayrıntılar (kullanıcıya ayrıca sorulmadı)

- **"Sonda" tek ünsüz:** denetimde *sonda ünlü ya da p ç t k s ş z l r m n y* kuralı, son
  ünlüden sonra en çok bir ünsüz olarak okundu (*pıtaks* → ses). 100 kök bu okumayla geçiyor.
- **Tur kayıtta ayrı alan değil:** `kaldigi` bütün tablodaki yer olduğu için tur ondan okunur;
  kaydın biçimi (ve anahtarı) değişmedi.
- **Bölge tamam:** herhangi bir turu bitince (ilk bitenin 1. tur olması sıra gereği).
- **Kaynaştırma karşıtı** zamir n ya da tekrarlanmayan çoğul alan ekte yok (*evine* için
  *eviye* kılık sayılmaz); bugünkü görevlerde yok.
- **Süslerin rengi:** boynuz ve benek `--zemin` (boynuz mürekkep çizgili), yıldız `--yanak`;
  yeni belirteç istenmedi. Yıldız bulunmada yaratığın başının üstünde, yönelmede sağ yanında
  (ardında kesik `--ayrac` iz: hareket azaltmada da yön okunur).
- **Ölçüler:** yaratık 1.8 ölçek (130 px); 44rem'den alçak ekranda 96 px, 37rem'den alçakta
  76 px ve ad 26 px. Cep yalnız iyelik görevlerinde. Sınır cümlesi karo oturunca görünür.
- **Sınır adımında hedefin adı** *pıta … ım*; bittiğinde kurulan biçim. Kart ve akşam ekranı
  çocuğun biçimini gösterir; kök ve ek satırı kökü (*pıtak* + *ım*) gösterir.
- **Yay ve zıplama** Koy'dan kopyalandı (ekranlar arasında ortak modül yok, Dükkân'daki gibi).

## Eski oturum: Oturum 8 — Kök Bahçesi (2026-09-30)

### Bitenler

- **Veri, verildiği gibi:** `icerik/gorevler/kok-bahcesi.csv` (10 ağaç) ve `tests/ek-sirasi.csv`
  (27 satır) hiç değiştirilmeden kaydedildi. Onaylı tek veri değişikliği: `icerik/bolgeler.csv`'de
  `bahce` satırının `gorevler` sütunu `icerik/gorevler/kok-bahcesi.csv`. Sözlük, altın tablo,
  neden tabloları ve öteki tablolar değişmedi. Bahçenin boş olduğunu varsayan eski testler
  (harita, bölgeler, ilerleme; birim ve uçtan uca) bahçe artık açık olacak biçimde güncellendi.
- **Koy düzeltmesi (0. madde):** aday artık motorun doğru biçimindeki gövdeyle kurulur
  (`adim.parca.govde` + seçilen yüzey): *kitap + ım → kitabım*, *kalemlik + im → kalemliğim*.
  Aday `olasiBicimler`'deyse doğrudur; değilse `neden`'e gövde sınırındaki motorun gövdesi
  (*kitab*) verilir, yanlış kılığın nedeni uyumdur, gövde değil. Birim testleri: *kitap* +
  POSS.1SG'de *ım*, *kalem* + LIK+POSS.1SG'nin ikinci adımında *im* doğru; koyun bütün
  adımlarında yalnız motorun yüzeyi doğru. `neden.csv` ve `neden-unsuz.csv` değişmeden geçiyor.
- **Motor: ek sırası** (`src/motor/sira.ts`, `ekSirasiHatasi(etiketler)`): yapım ekleri (tür
  sütunu; kendi aralarında serbest), en çok bir PL, en çok bir iyelik, en sonda en çok bir hâl.
  Soldan sağa ilk bozukluk: `meyve:<ETİKET>` ya da `çekim:<ETİKET>`. `ekle` ve `olasiBicimler`
  sırası bozuk dizide hata atar; kayıttaki bozuk kart atılır, oyun durmaz (test). Altın tablonun
  202 satırı değişmeden geçiyor.
- **Bahçenin mantığı** (`src/oyun/bahce.ts`): `bahceGorevi` (hedef, parçalar: ekle'nin parçaları
  yüzey ve türüyle, gövde kelimeleri, sepet), `denemeyiDegerlendir` (doğru / `meyve` / `önce`),
  cümleler (*Meyvenin üstüne gövde çıkmaz: önce çi.*, *yolculuk: önce cu, sonra luk.*),
  büyüler (`buyusu`, `govdeDegisimi`), indirgeyici (seç, dene, döndü, tutundu, büyü bitti,
  sonraki). Her görevde en az bir yapım, en çok bir çekim, çekim en sonda (test; değilse hata).
- **Kartlar:** `gorevBitti` / `ekrandaGorevBitti` kartların eklerini isteğe bağlı alır; bahçede
  kart yalnız gövdeden düşer (15 gövde kelimesi). Kaydın biçimi değişmedi.
- **Görsel dil:**
  - Ağaç (`src/gorsel/agac.ts`, saf; `Agac.tsx`: `Agac`, `Halka`, `Meyve`, `BahceIsareti`):
    kök (KokYazisi), üst üste halkalar (ekin yazısı birleşen ek görünümünde), yuvarlak taç,
    tacın ucunda meyveler (ekin yazısı üstlerinde). Cebin geometrisi koydan `src/gorsel/cep.ts`'e
    taşındı (ikisi de kullanıyor).
  - İki belirteç: `--govde` #D9B48F, `--yaprak` #A8D5A2; Renksiz'de `--renksiz-zemin`. Halka
    bant, meyve daire: biçimle ayrılır (uçtan uca test). Kalın ve ince renkleri yalnız ek
    yazılarında (`kurallar.test.ts`).
  - Harita işareti: küçük bir ağaç, yazısız. Galeride "Kök Bahçesi" bölümü: *gözlükçüler*
    ağacı, bir halka, bir meyve, işaret. Kurallar DESIGN.md'de ("Kök Bahçesi", "Ağaç").
- **Bahçe ekranı** (`src/ekranlar/KokBahcesi.tsx`): koyun ve dükkânın kabuğu (BolgeUstu,
  sürdürme, akşam: *Bahçede akşam oldu*). Solda ağaç (dokunma hedefi, adı *Ağaç: gözlük*),
  sağında tabela (hedef) ve kelimenin o anki hâli; altında düşen kartlar; en altta sepet
  (bukalemunlar). Sürükle-bırak, dokun-dokun, klavye.
  - Doğru: bukalemun ağaca uçar, halka büyür ve kart düşer (-CIk küçük kart; -lI önceki
    gövdenin küçük kartı üstte; -sIz küçük kart silinir, kesikli çerçeve kalır) ya da meyve
    asılır (-lAr üç meyve; -(I)m meyve cebe). Meyve gövdenin sonunu eritir: halkada taş karo
    jöleye erir, altında *kalemlik → kalemliğim*.
  - Yanlış: ek ağaçta sallanır, sepete döner; cümle görünür.
  - Hareket azaltmada hiçbir hareket yok (uçtan uca test).
- **Harita:** dükkân bitince bahçe açık; bahçe bitince Uydurukçuklar "hazırlanıyor".
- **Testler:** 954 birim testi ve 62 uçtan uca test.
  - Birim: `ek-sirasi.test.ts` (27 satır ve ayrıntılar), `bahce.test.ts` (görev tablosu,
    parçalar, gövde kelimeleri, nedenler, sepetin sırası, büyüler, indirgeyici), Koy düzeltmesi
    (`koy.test.ts`), kartlar (`ilerleme.test.ts`), `KokBahcesi.test.tsx`, galeri, harita,
    kurallar.
  - Uçtan uca (`e2e/kok-bahcesi.spec.ts`): 10 ağaç dokun-dokun, 15 kart, akşam ekranı; haritada
    bahçe tamam; Sözlük'te *çiçekçi* var, *çiçekçiler* yok; 1. ağaçta *ler* → meyve cümlesi;
    6. ağaçta *luk* → önce cümlesi; 7. ağaçta *kalemlik → kalemliğim*; büyülerin kartları;
    klavye; sürükle-bırak; hareket azaltma; Pixel 7, 360×640 ve 320×568'de en yüksek ağaç
    kaydırmadan sığar, dokunma alanları en az 44 px; Renksiz; Harita düğmesi.
    `fistikci-sahap.spec.ts`: dükkân bitince bahçe açılır ve girilir.

### Kullanıcının verdikleri

- Oturumun tarifi (sekiz madde), iki tablo, onaylı tek veri değişikliği, iki cümle kalıbı, iki
  belirteç (`--govde`, `--yaprak`) oturum başında geldi.

### Oturumda seçilen küçük ayrıntılar (kullanıcıya ayrıca sorulmadı)

- **Yerleşim:** ağaç solda, tabela ve kelime sağında; düşen kartlar ağacın altında bir sırada
  (320 px'te kartlar ağacın yanına sığmıyordu). Tabela `--kara` zeminli (haritadaki tabelalar
  gibi).
- **Ölçüler:** kök 132×52 (kök yazısı 24px), halka 96×40 (ek yazısı 20px), taç 148×84, meyve
  48×54 (ek yazısı 18px; üç meyve tacın içine sığsın diye), işaret 30×34. Meyve `--zemin`
  renginde (yeni belirteç istenmedi).
- **Kartlar:** 20px; -CIk'in küçük kartı 18px ve dar çerçeveli (ince renk üstünde 18px'ten
  küçük yazı yok). -lI / -sIz'in küçük kartı önceki gövdedir (bugün kök).
- **Sepetin tohumu:** `sepetTohumu(sira) = sira × 100 + 1`; en yüksek ağaçta sepet *çü, ler,
  lük*.
- **Cep:** iyelikli ağaçlarda (7, 8) cep baştan görünür; meyve oraya düşer.
- **Aynı ek iki kez:** sıradakiyle etiketi ve yüzeyi aynı olan her parça doğru sayılır.

### Açık kalanlar

Oturum 8'de eklenenler (Oturum 11 için; kullanıcıya ayrıca sorulacak; öncekiler Oturum 9'un listesinde):

- **Ek etiketinde ü, 20px'te elipse tam sığmıyor:** galeri testi harfin kutusunun köşelerini
  elipste arar; kök etiketlerinde (24–30px) sığıyor, halkadaki *lük*, *çü*'nün ü'sü (20px)
  kutunun üstünden yaklaşık 3 px taşıyor. Sözlük kartlarındaki ek etiketleri de aynı boyda
  (bugün ölçülmüyor). Göz ile okunaklı; test yalnız kök etiketlerini ölçüyor. Gerekirse
  etiketin `padding-bottom`'u küçük boyda azaltılır.
- **Aynı ek iki kez olan görev** (göz + LIK + AGT + LIK): mantık ikisini de sıradakinin yerine
  sayar (test var); bugünkü tabloda böyle görev yok, ekranda denenmedi.
- **Bahçede yarım kalan ağaç kaydedilmez:** görev bitince kaydedilir (öteki bölgeler gibi);
  ağacın ortasında çıkan çocuk ağacı baştan büyütür, düşen kartlar da ağaç bitince yazılır.
- **-lI ve -sIz'in küçük kartı önceki gövdedir:** bugünkü görevlerde köktür (*tat*, *ses*,
  *su*). Başka bir yapım ekinden sonra gelirse küçük kartta o gövde yazılır (*gözlüklü*'de
  *gözlük*).
- **Kök Bahçesi'nde renksiz görev yok:** tablonun `renksiz` sütunu yok (dükkân gibi).
- **Meyvenin ek yazısı 18px:** üç meyve tacın içine sığsın diye; ince renk üstünde izin verilen
  en küçük boy.

## Eski oturum: Oturum 7 — Fıstıkçı Şahap'ın Dükkânı (2026-09-30)

### Bitenler

- **Veri, verildiği gibi:** `icerik/gorevler/fistikci-sahap.csv` (10 görev) ve
  `tests/neden-unsuz.csv` (30 satır) hiç değiştirilmeden kaydedildi. Onaylı iki küçük değişiklik:
  - `icerik/kokler.csv`'ye `fıstık,yiyecek,evet,,` (yiyecek grubunun sonuna). Sözlük 151 kök;
    sayıyı sınayan testler (sözlük, Biçim Denetim Sayfası birim ve uçtan uca: 151 kök, 1208 biçim)
    güncellendi.
  - `icerik/bolgeler.csv`'de `dukkan` satırının `gorevler` sütunu:
    `icerik/gorevler/fistikci-sahap.csv`.
  - Altın tablo, `tests/neden.csv` ve öteki tablolar değişmedi.
- **Motor:**
  - `sinirSecenekleri(kok, etiketler)` (`src/motor/sinir.ts`): kelimedeki ünsüz sınırları,
    sırayla. Her sınırın yeri (gövde ya da ek başı), yuvanın solu ve sağı (*kita* + *ım*), taş
    ve jöle harfleri, doğru karolar (uydurma kökün gövde sınırında ikisi), asıl karo (gövdede
    taş, ek başında jöle) ve ekin doğru parçası.
    - Gövde sınırı: kök p, ç, t ya da k ile biter, köke gelen ilk ek yüzeyde ünlüyle başlar.
      İkizleşen kökte gövde sınırı yok (*hakkı*).
    - Ek başı: her ekin D ve C yuvası (`unsuzYuvalari`; zamir n'den sonra da: *evinde*).
  - `neden(kok, etiketler, parcalar, govde = kok)`: gövde kök ya da yumuşamış hâli olur, başka
    gövde hata verir. Sırayla gövde sınırı, ek başı, ünlü uyumu sınanır; nedenler bu sırayla
    dizilir. Yeni nedenler: `GÖVDE:yumuşama`, `GÖVDE:inatçı`, `GÖVDE:yumuşamaz`,
    `<ETİKET>:sertleşme`, `<ETİKET>:yumuşak`. Ek başı yereldir (adayda önceki sese bakar).
    Ekin kabul edilen yüzeyleri: ünlü kılıkları × D/C yuvasında taş ya da jöle.
  - `nedenCumlesi`'ne beş cümle (yine yalnız ilk neden).
  - Dışa açılanlar: `olasiEklemeler` (kabul edilen biçimlerin parçaları), `yumusakKarsilik`
    (n'den sonra k → g).
  - `kitap + ım` artık `diğer` değil, `GÖVDE:yumuşama` alır (Oturum 5'in planı). Eski ayrıntı
    testi buna göre güncellendi; `neden.csv`'nin 37 satırı değişmeden geçiyor.
- **Görsel dil:**
  - Ünsüz karosu (`src/gorsel/karo.ts`, `Karo.tsx`): 72×72, taş yontuk çokgen ve çatlak, jöle
    damla ve parıltı; 3 mürekkep çizgi, harf ortada 30px Andika. Geometri `cizim.ts`'e değil,
    ayrı saf dosyaya yazıldı (`cizim.ts`'in sayıları onaysız değişmez); bağımsızlık testi ve
    `tsconfig.motor.json` onu da kapsıyor.
  - İki belirteç: `--tas` #B3ADA4, `--jole` #BFE9CF. Renksiz'de ikisi de `--renksiz-zemin` olur;
    çokgen ve damla ayrılır (uçtan uca test).
  - Galeride "Ünsüz karoları" bölümü: iki karo (harfleri motordan: *kitap* + POSS.1SG) ve harita
    işareti. Kurallar DESIGN.md'de ("Ünsüz karoları").
- **Oyun mantığı** (`src/oyun/dukkan.ts`): görevin tek sınırı (`gorevinSiniri`, değilse hata),
  deneme (`denemeyiDegerlendir`: aday, nedenler, cümle, ilgili iki sesin yeri), indirgeyici
  (seç, dene, sekti, oturdu, rafa, sonraki), raf (`raftakiler`). `gorevleriOku`, `renksiz`
  sütunu olmayan tabloyu da okur.
- **Dükkân ekranı** (`src/ekranlar/FistikciSahap.tsx`): koyun kabuğu aynen (sürdürme, kart,
  akşam: *Dükkânda akşam oldu*). Üst çubuk iki ekranın ortak bileşeni oldu (`BolgeUstu.tsx`;
  sınıflar `bolge-ustu__*`). `App.tsx`'teki `BOLGE_EKRANLARI` artık kimlikten ekrana bir tablo.
  - Kelime kartında sınır boş bir yuva (kesik çerçeve); gövde sınırında kökün son sesinin
    yerinde, ek başında ekin kutusunun içinde (`EkYazisi`'ne isteğe bağlı `yuva`).
  - Tezgâh: taş solda, jöle sağda; altlarında *sert* / *yumuşak*; adları *p, sert*.
  - Doğru: karo yuvaya uçar ve oturur. Ses değişiyorsa yuvada önce asıl karo durur, sonra
    değişir (taş yayvanlaşıp jöleye erir; jöle sıkışıp taşa döner). Altında
    *kitap → kitabım* ya da *-da → kitapta* yazılır. Kelime rafa dizilir; Sıradaki.
  - Yanlış: karo yuvanın üstünde seker, tezgâha döner. Denenen biçim üstü çizili; ilgili iki
    ses vurgulu (ünlü etiketinde, ünsüz çerçevede); altında cümle.
  - Hareket azaltmada hiçbir hareket yok (uçtan uca test: `document.getAnimations()` boş).
- **Harita:** dükkânın işareti yan yana küçük bir taş ve bir jöle karosu, yazısız (0.375 ölçek).
  Koy bitince dükkân açık; dükkân bitince bahçe "hazırlanıyor".
- **Testler:** 859 birim testi ve 52 uçtan uca test.
  - Birim: `sinir.test.ts`, `neden-unsuz.test.ts` (30 satır ve ayrıntılar),
    `dukkan.test.ts` (her görevin tam bir sınırı ve tek doğru karosu, cümleler, ses değişimi,
    indirgeyici), `FistikciSahap.test.tsx`, galeri ve harita.
  - Uçtan uca (`e2e/fistikci-sahap.spec.ts`): 10 görev dokun-dokun, raf, akşam ekranı, haritada
    dükkân tamam ve Sözlük'te 10 kart; 1. görevde taş: *p ünlüden önce jöle olur: b.*; 1. görev
    klavyeyle, fareyle ve parmakla sürükle-bırakla; hareket azaltmada *-da → kitapta*; Pixel 7,
    360×640 ve 320×568'de taşma yok, dokunma alanları en az 44 px; Renksiz; Harita düğmesi.
    `ilerleme.spec.ts`: koy bitince dükkân açılır ve girilir.

### PR'dan sonra düzeltilen (inceleme bulgusu)

- **Görev, raf hareketinden önce kaydedilir.** Önceden `onGorevBitti` rafın 380 ms'lik
  hareketinden sonra çağrılıyordu; Sıradaki ve Harita o arada tıklanabilirdi. Harita'yla
  çıkılınca çağrı yine gidiyordu (geç), ama sayfa o aralıkta kapanır ya da yenilenirse görev ve
  kart yazılmıyordu. Artık `bitti`'ye geçer geçmez kaydedilir, hareket sonra oynar. Uçtan uca
  test: Sıradaki DOM'a girdiği anda kayıtta 10. görev ve kartı var.

### Kullanıcının verdikleri

- Oturumun tarifi (yedi madde), iki tablo, iki onaylı veri değişikliği, beş neden cümlesi, iki
  belirteç (`--tas`, `--jole`) oturum başında geldi.

### Oturumda seçilen küçük ayrıntılar (kullanıcıya ayrıca sorulmadı)

- **Ses değişiminin gösterimi:** yuvada önce asıl ses (kökün taşı ya da ekin jölesi), sonra
  seçilen karo; kelimenin altında *kitap → kitabım* / *-da → kitapta*.
- **Vurgulanan iki ses:** gövdede seçilen ünsüz ve ardındaki ünlü (*p* + *ı*); ek başında önceki
  ses ve seçilen ünsüz (*p* + *d*). Ünlü etiketinde, ünsüz 2px mürekkep çerçevede.
- **Yuva 2.2em** (30px'lik kelimede 66 px); oturan karo yuvaya sığacak kadar küçülür (harf
  yaklaşık 27.5px).
- **Raf:** kelimeler düz yazı, küçük kavanoz etiketleri (0.9rem, krem zemin, mürekkep çerçeve);
  kalın ve ince renkleri rafta yok. Rafta bu turun kelimeleri: kalınan yerden sürdürülünce
  önceki görevlerin kelimeleri de dizili gelir.
- **Karo kartın erişilebilir adı:** seçimde *kita … ım*, oturunca kelime.
- **Galeri örneği:** *kitap* + POSS.1SG'nin karoları (p, b).
- **Taşın çokgeni ve jölenin damlası** oturumda çizildi (`karo.ts`); kullanıcı isterse tuvalde
  yeniden çizilir, sayılar değişir.

## Eski oturum: Oturum 6 — oyun kabuğu (2026-09-28; Oturum 11'in planları burada, yapıldı)

### Bitenler

- **Bölge tablosu, verildiği gibi:** `icerik/bolgeler.csv` (dört bölge). Yalnız kullanıcının
  onayıyla değişir (CLAUDE.md, 13. kural). `gorevler` sütunu boş olan üç bölgeyi Oturum 7, 8 ve
  9 dolduracak.
  - `src/oyun/bolgeler.ts` tabloyu satır numaralı hatalarla okur. Görev tablosunu yoluyla
    bulur: yolların metinleri `GOREV_TABLOLARI`'ndadır (`?raw`). Koyun görevleri artık bölge
    tablosundan gelir; `BUKALEMUN_KOYU_GOREVLERI` kalktı.
- **Ada haritası** (`src/ekranlar/AdaHaritasi.tsx`), açılış ekranı:
  - Çizim kodla yapılmış bir SVG ve süstür (`aria-hidden`): deniz, kara, kıyıda krem köpük,
    dalgalar, ağaçlar ve bölgeleri sırayla bağlayan noktalı yol (Catmull-Rom, `yumusakYol`).
  - Bölgeler sıralı listede gerçek düğmelerdir; tabela biçimindedir. Adı görünen yazının
    aynısıdır (`aria-label`: *Bukalemun Koyu, Açık*).
  - Dört durum var: açık, tamam, kilitli, hazırlanıyor. Her birinin simgesi ve yazısı ayrıdır.
    Kilitli ve hazırlanan tabelanın çerçevesi kesik, zemini kara.
  - Kilitli bölgeye dokununca: *Önce … bitmeli.* İçeriği olmayan açık bölgeye dokununca:
    *Burası hazırlanıyor. Yakında açılacak.* İleti başlığın altında yazılır; yeri (iki satır)
    boşken de ayrılmıştır, harita kaymaz.
  - Koyun işareti küçük bir bukalemun. Ötekilerin işareti yok; kendi oturumları çizecek.
  - Harita yalnız `--deniz`, `--kara`, krem, mürekkep, soluk ve ayraç kullanır; kalın ve ince
    renkleri yok (`kurallar.test.ts` denetler).
  - 412×839, 360×640 ve 320×568'de kaydırmadan sığar. Düğmeler üst üste binmez; en az 44 px.
- **Kilit:** bir bölge, öncekinin bütün görevleri en az bir kez bitince açılır (`bolgeDurumlari`).
  Koy bitince dükkân "hazırlanıyor" olur; bahçe ve uyduruk kilitli kalır.
- **Yönlendirme** (`src/kabuk/yonlendirici.ts`, kitaplıksız):
  - Adresler: `#/`, `#/bolge/<kimlik>`, `#/sozluk`, `#/ayarlar`.
  - Harita köktür. Haritadan açılan ekran `pushState` ile açılır; alt gezinme geçişleri
    `replaceState`'tir. Harita düğmesi `history.back()` yapar. Böylece geri tuşu her ekrandan
    haritaya, haritadan dışarı götürür.
  - Tanınmayan adres, kilitli ya da içeriksiz bölgenin adresi haritaya döner.
  - Açılış ekranındaki geçici düğme ve `AcilisEkrani` kalktı.
- **Alt gezinme** (`AltGezinme.tsx`): Harita, Sözlük, Ayarlar; simge ve yazıyla,
  `aria-current`. Yalnız bu üç ekranda durur. Koydaki "Ana sayfa" düğmesi artık "Harita"
  (harita simgesi).
- **Cihazda ilerleme:**
  - Kodu iki dosyada: `src/oyun/ilerleme.ts` (saf) ve `src/kabuk/depo.ts` (localStorage ve
    `useIlerleme`).
  - Tek anahtar kullanılır: `morfemusta.v1`. Kaydın biçimi `ilerleme.ts`'in başında yazılı.
  - Her görev bitince kaydedilir; ayar değişince de. Koya dönen çocuk kaldığı görevden
    sürdürür; tur bitince sonraki giriş baştan başlar.
  - Bozuk kayıttan yalnız geçerli parçalar alınır. Kartlar motorla sınanır; `__proto__` gibi
    anahtarlar kayda karışamaz.
  - Depo yoksa ya da hata atıyorsa oyun bellekte sürer; konsol hatası çıkmaz.
  - Aynı cihazda açık pencereler (sekme, ana ekrandaki uygulama) aynı kaydı paylaşır. Codex
    PR'da buldu: önce açılan pencere, eski kopyasıyla sonrakinin ilerlemesini, kartlarını ve
    ayarlarını eziyordu. Kullanıcının tarifiyle düzeldi:
    - Her değişiklikte depodaki son kayıt yeniden okunur, değişiklik onun üstüne uygulanır,
      sonra yazılır (`pencereKaydi`).
    - Biten görevler ve kartlar birleşir. Ayarda yalnız değişen alan yazılır. Sıfırlama yine
      bütün ilerlemeyi ve kartları siler.
    - Kalınan yer birleşmez: son görevin bittiği pencere belirler (yeni tur baştan
      başlayabilsin).
    - Depo doluysa (yazılamıyorsa) bellekteki ilerleme sürer; depodaki eski kayıt onu geri
      almaz.
    - `storage` olayı dinlenir: başka sekme yazınca bu sekmenin ilerlemesi ve ayarları hemen
      güncellenir.
  - Codex'in ikinci bulgusu: bölge ekranı açıkken başka sekme ilerlemeyi sıfırlarsa açık ekran
    eski görevinde kalıyordu; o görev bitince kayıt `{bitenler: [5], kaldigi: 5}` olup sonraki
    giriş altıncı görevden başlıyordu. Kullanıcının tarifiyle düzeldi:
    - Bölge ekranı dışarıdan gelen değişikliği izler. Başka pencere bir bölgenin ilerlemesini
      değiştirince (görev, sıfırlama) o bölgenin dış sürümü artar (`degisenBolgeler`); dış sürüm
      ekranın anahtarındadır, ekran en son kayıttan yeniden açılır. Ayar ya da yalnız kart
      değişikliği ve bu pencerenin kendi görevi ekranı kesmez.
    - Sıfırlama geri alınmaz: kayıtta bir sıfırlama kimliği var (`sifirlama`, her sıfırlamada
      bir artar; kaydın biçimi sürüm 1'de, yayımlanmadan önce genişletildi, eksikse 0). Bölge
      ekranı açılırken kimliği alır (kimlik ekranın anahtarında); görev bitince yazmadan önce
      son kayıttakiyle karşılaştırır (`ekrandaGorevBitti`). Farklıysa hiçbir şey yazılmaz, ekran
      son kayıttan, baştan açılır. `storage` olayı ulaşmayan bir sekme de sıfırlamayı geri
      alamaz.
  - İlk başarılı kayıttan sonra, sayfa başına bir kez `navigator.storage.persist()` istenir.
  - "Hiçbir veri cihazdan çıkmaz" CLAUDE.md'ye 14. kural olarak yazıldı.
- **Sözlük** (`Sozluk.tsx`):
  - Kart her görev bitince doğar: kelime; kök ve ekler (birleşen ek görünümü, aralarında +);
    bölge; tarih (`<time>`).
  - Aynı kelime aynı bölgeden ikinci kez kart olmaz; yalnız `sonKurulma` anı güncellenir.
  - Kartlar bölgelere göre gruplu, en yeni önde. Boş Sözlük için bir metin gösterilir.
- **Akşam ekranı** (`AksamEkrani.tsx`) bütün bölgelerin ortak kapanışıdır:
  - Başlık tablonun `aksam` sütunundan gelir.
  - Altında *Bugün kurduğun kelimeler:* ve o bölgede bugün kurulanlar (`bugununKartlari`).
  - Tek düğme: *Haritaya dön*. Puan, seri ve süre yok.
- **Ayarlar** (`Ayarlar.tsx`):
  - Hareket: Sistem gibi / Azalt (`html[data-hareket]`; `hareketAzMi` ve CSS geçişleri bakar).
  - Renkler: Renkli / Renksiz (`html[data-renkler]`; `tema.css`). Renksiz büyüden sonra da gri
    kalır.
  - İlerlemeyi sıfırla, uygulamanın içinde iki adımdır; `confirm` kullanılmaz. Odak önce
    Vazgeç'e gider.
- **Görsel dile taşınanlar:**
  - `EkYazisi` ve `KurulanKelime` koydan `src/gorsel`'e taşındı; koy, Sözlük ve akşam ekranı
    aynı görünümü kullanıyor.
  - Belirteçlere iki renk eklendi: `--deniz`, `--kara`.
  - `genel.css` ve manifest ile tema rengi `tema.css` belirteçlerine taşındı (`--zemin`).
- **Denetim sayfasının zemini** main'de koyu maviydi (`--deniz-koyu`), açık olması
  gerekirken: derlemede paylaşılan `genel.css` sayfanın kendi CSS'inden sonra yükleniyor.
  Artık kendi açık rengi geçerli (`:root:has(.denetim)`); uçtan uca test denetliyor.
- **Testler:** 746 birim testi ve 42 uçtan uca test.
  - Birim testlerinin dağılımı: motor 366 (değişmedi), oyun mantığı 102 (ilerleme 48, bölgeler
    8), görsel dil 205 (kurallar 74), ekranlar 36, kabuk 15, galeri 11, denetim sayfası 11.
  - İlerleme deposunun birim testleri: kaydet, yükle, bozuk veri, depo yok, iki pencere, kilit
    açma, kart tekrarı, bugünün kartları; sıfırlama ve ayarlar.
  - Uçtan uca testler (`harita.spec.ts`, `ilerleme.spec.ts`):
    - ilk açılışta yalnız koy açık;
    - 3 görev oynanır, sayfa yeniden yüklenir, 4. görevden sürer; Sözlük'te 3 kart;
    - 10 görev biter, akşamda bugünün kelimeleri görünür; haritada koy tamam, dükkân
      hazırlanıyor;
    - Renksiz ve Azalt yeniden yüklemeden sonra yerinde;
    - sıfırlama;
    - localStorage hata atarken, bozuk kayıtta ve dolu depoda oyun sürer;
    - iki sekme: görevler, kartlar ve ayar korunur; değişiklik öteki sekmeye hemen yansır;
      `storage` olayı ulaşmayan eski sekme de ötekini ezmez; açık bölge ekranı öteki sekmenin
      görevinden sonra kalınan yerden, sıfırlamasından sonra baştan açılır; sıfırlama geri
      alınmaz (A 5. görevdeyken B sıfırlar, A 5. görevi bitirir: kayıt boş kalır, A baştan
      başlar; birim testinde de);
    - geri tuşu; 360×640'ta sığma;
    - Renksiz'de kalın ve ince ek etiketlerinin enleri farklı, kökün ve ekin etiketi aynı
      ende (`ek-etiketi.spec.ts`).
  - Koyun mevcut testleri haritadan girer (`e2e/yardimcilar.ts`).

### Kullanıcının verdikleri

- Oturumun tarifi (on madde), bölge tablosu, ekran metinleri ve iki yeni belirteç
  (`--deniz` #CFE8E0, `--kara` #F4E6C8) oturum başında geldi. Tablo hiç değiştirilmedi.

### Kullanıcının onayladıkları (oturumda seçildi, PR'da onaylandı)

- **Alt gezinme bölge ekranında yok:** koy 360×640'ta kaydırmadan sığsın diye. Haritaya koyun
  üst çubuğundaki Harita düğmesiyle dönülür.
- **Geri tuşunun düzeni:** harita kök. Alt gezinme geçmişi büyütmez (Android'in alt gezinme
  düzeni); Sözlük'ten Ayarlar'a geçip geri basınca harita açılır.
- **Kart görevin kelimesidir:** zincirde ara gövde (*toplar*) kart olmaz.
- **İki zaman:**
  - Kartın tarihi kelimenin o bölgede ilk kurulduğu andır; Sözlük onu gösterir.
  - Akşam ekranı `sonKurulma`'ya bakar: dün kart olup bugün yeniden kurulan kelime de "bugün
    kurduğun kelimeler"dedir. Yoksa ikinci günün akşamı boş kalırdı.
- **Sıfırlama ayarları silmez** (renk körü bir çocuğun Renksiz'i gibi). Sil'den sonra *İlerleme
  ve kartlar silindi.* yazılır.
- **Koyun işareti:** koyun ilk görevinin bukalemunudur (*at* + *lar*, kalın), 0.42 ölçekle.
  Kullanıcının isteğiyle yazısızdır (`Bukalemun`'un `yazisiz` seçeneği): ek yazısı o boyda
  okunmuyordu, işaret süstür. DESIGN.md'deki 0.9 kuralına ayrık durum olarak yazıldı.

### Kullanıcının kararı: birleşen ekte ünlü etiketi (Renksiz'de de uyum)

- Ek kutusu kalır: ekin sınırını gösterir, bukalemunun renginde ve biçiminde.
- Ekin ünlüsü kök etiketiyle aynı etikettedir (`UnluEtiketi`): kalında geniş, incede dar; düzde
  köşeli, yuvarlakta elips. Uyum, kökteki ve ekteki etiketlerin aynı ende olmasından okunur;
  Renksiz'de de görünür.
- Bukalemun Koyu'ndaki sonuçta (kelime kartı, cep), Sözlük kartlarında ve akşam ekranında
  uygulandı. Sonuç kelimesinde ve Sözlük kartında kökün son ünlüsü de etikette.
- Test: Renksiz'de kalın ve ince ek etiketlerinin enleri farklı, her kelimede kökün ve ekin
  etiketi aynı ende (`e2e/ek-etiketi.spec.ts`: cep, akşam, Sözlük).
- Oturumda seçilip kullanıcının onayladıkları:
  - Ekte birden çok ünlü varsa her biri etikettedir. *ları*'da *a* köke, *ı* da *a*'ya uyar;
    etiketler uyum zincirini gösterir. Bugünkü eklerde tek ünlü var.
  - Etiket yazının boyundadır: kökte 30px, sonuçta 22px, Sözlük'te 20px, cebin önünde 18px.
    Cepteki 18px, yazı cebin ağzına sığsın diye seçildi; ince renk üstünde izin verilen en
    küçük boydur.
  - Sözlük kartının boşlukları daraltıldı. Dar ekranda kök + ek satırı yine kırılıyor;
    kullanıcı küçük saydı, Oturum 11'e kaldı (açık kalanlarda).

### Oturumda seçilen küçük ayrıntılar (kullanıcıya ayrıca sorulmadı)

- **Durumların simgeleri:** açıkta üçgen, tamamda tamam işareti, kilitlide kilit, hazırlananda
  kum saati. Durum adları: Açık, Tamam, Kilitli, Hazırlanıyor.
- **Süs:** Ayarlar'da Renkler'in yanında a/e örnek etiketleri; akşam ekranında hilal simgesi.
- **Tur bitince yeni tur baştan başlar.** Tamam bölge yine oynanabilir.

### Plan: iOS'ta ilerlemenin korunması (kullanıcının kararı; Oturum 11'de yapıldı)

- WebKit, ana ekrana eklenmemiş sitede yedi gün etkileşim olmazsa betiğin yazdığı depoyu
  (localStorage) siler. Ana ekrana eklenen web uygulaması bu silmeden muaftır.
- Oturum 11'de iPhone Safari'de bir kez gösterilen küçük bir "Ana ekrana ekle" ipucu gelir.

### Plan: eski cihazlar (kullanıcının kararı; Oturum 11'de cihaz.html ve uyarı; hedef bekliyor)

- En düşük tarayıcı hedefi Oturum 11'de, en eski cihazda denemeden sonra kararlaştırılır.
- Bugün derleme Vite'ın varsayılan hedefine göredir (baseline-widely-available: Safari 16.4+,
  Chrome 111+, Firefox 114+). Harita `dvh`'ye ve kap sorgusu birimlerine (`cqw`, `cqh`)
  dayanır; hedef düşerse bunların geri dönüşleri de birlikte ele alınır (Lightning CSS, hedefin
  desteklediği özellikler için geri dönüşü derlemede siler).

### Plan: çok sekmede kalan durumlar (kullanıcının kararı; Oturum 11'de ilk madde yapıldı)

- **`storage` olayı ulaşmayan pencere** (arka planda donmuş sekme, geri tuşuyla önbellekten
  dönen sayfa): harita, Sözlük, ayarlar ve açık bölge ekranı, pencere bir sonraki kez yazana
  kadar eski kalır. Yazarken son kayıt okunur: hiçbir şey kaybolmaz, sıfırlama geri alınmaz.
  Ama:
  - başka pencere görev bitirdiyse (sıfırlama yok), açık ekran kendi görevinden sürer, son
    kayıttan yeniden açılmaz;
  - sıfırlamadan sonra böyle bir pencerede bölgeye girilirse ekran eski kimlikle açılır: ilk
    biten görev yazılmaz, ekran baştan açılır, çocuk o görevi yeniden oynar.
  - Öneri: `visibilitychange` ve `pageshow`'da kaydı yeniden okumak (`tazele`), `storage`
    olayı gibi işlemek. **Oturum 11'de yapıldı;** aşağıdaki maddeler açık.
- **Aynı bölge iki pencerede aynı anda:** bir pencerede görev bitince ötekinin açık ekranı son
  kayıttan yeniden açılır; o penceredeki yarım görev (yerleşmiş bukalemun) gider. Tek cihazda
  pek olmaz.
- **Kalınan yer birleşmez:** son görevin bittiği pencere belirler. Eski bir pencere daha önceki
  bir görevi bitirirse kalınan yer geri gider; biten görevler ve kartlar kalır.
- **Dolu depo:** bir pencere yazamıyorken öteki yazarsa, ilkinin yazılamamış ilerlemesi
  ötekinin kaydıyla değişir.
- **Güncelleme sırasında iki sürüm:** yeni sürüm devreye girse de açık sayfa eski kodla sürer
  (sayfa kendiliğinden yenilenmez). Eski kod tanımadığı alanları yazarken düşürür
  (`ilerlemeyiCoz` yalnız bildiklerini alır). Bugün sorun yok: kayıt bu sürümle ilk kez
  yayımlanıyor. Kaydın biçimi değişirse (yeni alan ya da `morfemusta.v2`), eski ve yeni
  sürümün birlikte açık kalabileceği hesaba katılmalı.

### Plan: nedenin iki sınırı (kullanıcının kararı; kod bugün değişmedi)

1. **İstisna (istisna görevleri gelince):**
   - Bugün yerel uyum istisnasızdır. Bu yüzden `saatlar` → `diğer` alır. `saat + ler + ım`
     ise `PL:kalınlık; POSS.1SG:kalınlık` alır, oysa `ler` doğrudur.
   - Plan: yerel uyum, sözlükte `ince-ek` işaretli kökten sonraki ilk eki ince bekleyecek.
     Bu, motorun `ince ek` kuralıyla aynıdır: kalınlık kopyalanmaz, I yuvarlaklığı yine
     kopyalar (golüm).
   - Sonuç: `saat + ler + ım` yalnız `POSS.1SG:kalınlık` alır. `saatlar` da `PL:kalınlık`
     alır; cümlesi istisnayı söyler, metni o gün kullanıcıyla yazılır.
   - `tests/neden.csv`'deki `saatlar` satırı o gün kullanıcının onayıyla değişir (12. kural).
2. **Gövde (Oturum 7'de yapıldı; aşağıda):**
   - Bugün aday = kök + yüzeylerdir. Gövdeyi değiştiren kökte doğru ek de `diğer` alır
     (`kitap + ım` → `kitapım`; `olasiBicimler` yalnız `kitabım`'ı verir). Bukalemun Koyu'nun
     görevlerinde böyle kök yok.
   - Fıstıkçı Şahap'ın Dükkânı'nda çocuk gövdeyi de seçecek (*kitap* / *kitab*). `neden`'e bir
     gövde parçası eklenecek.
