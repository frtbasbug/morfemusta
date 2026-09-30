# Sıradaki

## Son oturum: Oturum 10 — ses ve resim (2026-09-30)

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
- **Testler:** 2022 birim testi ve 87 uçtan uca test (hepsi yeşil; tür denetimi temiz).
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

- **Seslerin hızı:** kullanıcı `ses.html`'deki örneklerden seçecek (1.2 ya da 1.0).
- **Seslerin dinlenmesi:** 690 ses üretildi, hiçbiri kulakla denetlenmedi; özellikle uydurma
  kelimeler (*fıngıl*, *zelüe*) ve harf adları. Yanlışlar `ses.html`'de işaretlenip
  `icerik/ses-okunus.csv`'ye (onayla) yazılır, sesler yeniden üretilir.
- **Modelin kökeni:** MODEL_CARD, dfki sesinin İngilizce *lessac* sesinden ince ayarla
  eğitildiğini yazıyor; lessac veri kümesinin lisansı ayrıca incelenebilir.
- **İki sürüm aynı anda açıkken** eski kod `ayarlar.ses`'i tanımaz: bir ayar değiştirirse ses
  ayarı Dokununca'ya döner (bir kez).
- **Ses listesi paketi büyütüyor:** `ses-listesi.json` (okunuş, boyut, sürüm dahil) JS paketine
  giriyor (110 KB, gzip ile 25 KB). Oyun yalnız metin → dosya ve bölgeleri kullanıyor; liste
  ikiye ayrılabilir.
- **Uydurukçuklar'ın sesleri 2.2 MB:** bölgeye ilk girişte hepsi iner (100 görev, 10 tur).
  Gerekirse tur tur indirilir.
- **Haritanın ileti balonunda hoparlör** balonun kenarından biraz taşıyor (iletinin ayrılmış
  yeri değişmesin diye). Telefonda göz ile bakılmalı.
- **Dükkân'daki değişim yazısı** (*kitap → kitabım*) söylenmiyor; yalnız kurulan kelime.
- **Ekran okuyucuyla sesli mod:** oyunun sesi ve ekran okuyucunun sesi çakışabilir; sesli mod
  ekran okuyucu kullanmayan, okumayan çocuk içindir.
- **Sözlük kartına dokunma** yalnız sesli modda çalar; kart düğme değil (klavyede hoparlör var).

Oturum 9'da eklenenler (Oturum 11 için; kullanıcıya ayrıca sorulacak):

- **İki sürüm aynı anda açıkken** eski kod *pıtağım* kartını tanımaz ve kaydı yazarken atar
  (`kartiCoz` eski sürümde yalnız `ekle`'ninkini kabul ediyordu). Güncelleme sırasında bir kez
  olabilir.
- **Tur numarası ekranda yok:** üst çubukta yalnız *3 / 10*. Gerekirse *2. tur* yazılır.
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
- **Sözlük kartında kök + ek satırı kırılıyor (Oturum 11; kullanıcı küçük saydı):**
  - 360 px'te Sözlük iki sütundur, kart 158 px'tir; *topum* ve *toplarım*'da ek alt satıra
    kayıyor.
  - 375–412 px'te yalnız *toplarım* (iki ek) kırılıyor.
  - 320 px'te Sözlük tek sütundur; hiçbir kart kırılmıyor.
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
- **Yön kilidi yok:** manifest'te `orientation` yazılı değil. Telefonda dikey kilit mi,
  sınıf modu (etkileşimli tahta) için yatay mı, karar bekliyor. Yatay telefonda harita
  32rem'lik çerçeveyle kaydırılarak görünür.
- **DESIGN.md künyeleri:** Aksu-Koç & Slobin (1985) ile Becker, Ketrez & Nevins (2011)
  yalnız kısa atıfla geçiyor. Tam künye, doğrulanmış kaynaktan eklenebilir.
- **Önbellek boyutu:**
  - Andika'nın Kiril ve Vietnamca alt kümeleri de önbelleğe giriyor (yaklaşık 80 KB). Türkçe
    için `latin` ve `latin-ext` yeter; Baloo 2 bu yüzden yalnız onlarla yükleniyor.
  - Andika için de alt küme dosyaları içe aktarılabilir ya da `workbox.globIgnores` ile
    ayıklanabilir.
  - Denetim sayfası, galeri ve ses denetim sayfası da önbelleğe giriyor; girmezlerse service
    worker onları oyuna düşürür, çıkarılmamalı.

## Önceki oturum: Oturum 9 — Uydurukçuklar (2026-09-30)

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

## Daha önceki oturum: Oturum 8 — Kök Bahçesi (2026-09-30)

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

## Daha da önceki oturum: Oturum 7 — Fıstıkçı Şahap'ın Dükkânı (2026-09-30)

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

## Eski oturum: Oturum 6 — oyun kabuğu (2026-09-28; Oturum 11'in planları burada)

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

### Plan: iOS'ta ilerlemenin korunması (kullanıcının kararı; Oturum 11, kod bugün yok)

- WebKit, ana ekrana eklenmemiş sitede yedi gün etkileşim olmazsa betiğin yazdığı depoyu
  (localStorage) siler. Ana ekrana eklenen web uygulaması bu silmeden muaftır.
- Oturum 11'de iPhone Safari'de bir kez gösterilen küçük bir "Ana ekrana ekle" ipucu gelir.

### Plan: eski cihazlar (kullanıcının kararı; Oturum 11, kod bugün yok)

- En düşük tarayıcı hedefi Oturum 11'de, en eski cihazda denemeden sonra kararlaştırılır.
- Bugün derleme Vite'ın varsayılan hedefine göredir (baseline-widely-available: Safari 16.4+,
  Chrome 111+, Firefox 114+). Harita `dvh`'ye ve kap sorgusu birimlerine (`cqw`, `cqh`)
  dayanır; hedef düşerse bunların geri dönüşleri de birlikte ele alınır (Lightning CSS, hedefin
  desteklediği özellikler için geri dönüşü derlemede siler).

### Plan: çok sekmede kalan durumlar (kullanıcının kararı; Oturum 11, kod bugün yok)

- **`storage` olayı ulaşmayan pencere** (arka planda donmuş sekme, geri tuşuyla önbellekten
  dönen sayfa): harita, Sözlük, ayarlar ve açık bölge ekranı, pencere bir sonraki kez yazana
  kadar eski kalır. Yazarken son kayıt okunur: hiçbir şey kaybolmaz, sıfırlama geri alınmaz.
  Ama:
  - başka pencere görev bitirdiyse (sıfırlama yok), açık ekran kendi görevinden sürer, son
    kayıttan yeniden açılmaz;
  - sıfırlamadan sonra böyle bir pencerede bölgeye girilirse ekran eski kimlikle açılır: ilk
    biten görev yazılmaz, ekran baştan açılır, çocuk o görevi yeniden oynar.
  - Öneri: `visibilitychange` ve `pageshow`'da kaydı yeniden okumak (`tazele`), `storage`
    olayı gibi işlemek.
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

## Sıradaki hedef: Oturum 11 — açık kalanlar

Kapsam oturum başında kullanıcıyla belirlenir: açık kalanlar (yukarıda, Oturum 10'un
bölümünde), Oturum 6'daki üç plan (iOS'ta ilerlemenin korunması, eski cihazlar, çok sekmede
kalan durumlar), seslerin hızı ve dinlenmesi, gerçek telefonda doğrulama.
