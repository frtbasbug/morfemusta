# Sıradaki

## Son oturum: Oturum 6 — oyun kabuğu (2026-09-28)

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
2. **Gövde (tasarımı Oturum 7'de):**
   - Bugün aday = kök + yüzeylerdir. Gövdeyi değiştiren kökte doğru ek de `diğer` alır
     (`kitap + ım` → `kitapım`; `olasiBicimler` yalnız `kitabım`'ı verir). Bukalemun Koyu'nun
     görevlerinde böyle kök yok.
   - Fıstıkçı Şahap'ın Dükkânı'nda çocuk gövdeyi de seçecek (*kitap* / *kitab*). `neden`'e bir
     gövde parçası eklenecek.

### Açık kalanlar

- **Kilit türetilir, saklanmaz:** bir görev tablosu büyürse bitmiş bölge yeniden açık olur,
  ardındaki bölge kilitlenir. Tablolar yalnız onayla değiştiği için bugün sorun değil;
  gerekirse açılan bölgeler kayda yazılır.
- **Yeni bölge üç yere eklenir:**
  - ekranı `App.tsx`'teki `BOLGE_EKRANLARI`'na (ekranı olmayan bölgeye girilmez);
  - görev tablosu `GOREV_TABLOLARI`'na;
  - işareti `AdaHaritasi.tsx`'teki `isaret`'e.
  Haritada yalnız dört bölgenin yeri var (`BOLGE_YERLERI`); beşinci bölge yer ve yol ister
  (test denetler).
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
- **Anlam etkisi yalnız PL ve POSS.1SG için** (`ANLAM_ETKILERI`, `src/oyun/koy.ts`). DESIGN.md
  tablosundaki öteki büyüler (-CIk, -lI, -sIz, -(y)A) sonraki bölgelerde.
- **Sesli mod yok:** 1–2. sınıf için neden cümlesi ve haritanın iletileri okunarak verilmeli
  (DESIGN.md, "Koleksiyon ve modlar").
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
- **Uydurma kökte ikinci biçimin parçaları dışarıda yok:** `olasiBicimler` yalnız dizgi
  döner. Arayüz çocuğun seçtiği yumuşamış biçimi (pıtağım) canlandırmak isterse `ekle.ts`'deki
  `turet` işlevi dışa açılabilir.
- **Denetim sayfasında yalnız sözlük kökleri ve sekiz ek var:** uydurma kökler, yapım
  zincirleri (gözlüğüm) ve öteki ekler (ABL, INS, POSS.2SG ...) yok; gerekirse eklenir.
- **Ek sırası denetlenmiyor (Oturum 8):** Motor etiketleri verilen sırayla ekler;
  `PL+AGT`, `LOC+PL` ya da `PL+LIK` gibi dizileri reddetmez. `ekler.csv`'deki tür sütunu
  bunun için hazır ("meyvenin üstüne gövde çıkmaz", DESIGN.md).
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
  - Bukalemun Koyu'nda parmakla sürükleme: uçtan uca testler Chromium'da fareyle ve CDP
    dokunmasıyla sınıyor; iOS Safari'de Pointer Events ile `touch-action` denenmeli.
  - Denetim sayfası: <https://frtbasbug.github.io/morfemusta/denetim.html>. Karakter
    Galerisi: <https://frtbasbug.github.io/morfemusta/galeri.html>.
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
  - Denetim sayfası ve galeri de önbelleğe giriyor; girmezlerse service worker onları oyuna
    düşürür, çıkarılmamalı.

## Sıradaki hedef: Oturum 7 — Fıstıkçı Şahap'ın Dükkânı

Kapsam oturum başında kullanıcıyla belirlenir. Bilinenler:

- Sert ünsüzler taş, yumuşaklar jöle: -DA ve -CI sertleşir (*kitapta*, *balıkçı*); ünlüyle
  başlayan ekte yumuşama (*kitabı*, *çocuğu*); tek heceli inatçılar (*topu*, *saçı*)
  (DESIGN.md, "MVP bölgeleri").
- Nedenin gövde parçası tasarlanır (yukarıdaki plan, 2. madde): çocuk gövdeyi de seçer
  (*kitap* / *kitab*).
- Dükkânın görev tablosu `icerik/gorevler/`'e gelir ve `GOREV_TABLOLARI`'na eklenir. Bölge
  tablosunun `dukkan` satırındaki `gorevler` sütunu kullanıcının onayıyla dolar (12. ve 13.
  kural).
- Dükkânın ekranı `BOLGE_EKRANLARI`'na, işareti haritaya eklenir. Akşamı ortak ekrandır
  (*Dükkânda akşam oldu*); kartlar Sözlük'e kendiliğinden düşer.
- Sonrası: Oturum 8'de Kök Bahçesi (ek sırası denetimi), Oturum 9'da Uydurukçuklar.
