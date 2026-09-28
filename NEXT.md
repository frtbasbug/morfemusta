# Sıradaki

## Son oturum: Oturum 5 — Bukalemun Koyu (2026-09-28)

### Bitenler

- **İki tablo, verildiği gibi:** `icerik/gorevler/bukalemun-koyu.csv` (10 görev) ve
  `tests/neden.csv` (37 satır). İkisi de kullanıcının onayı olmadan değişmez (CLAUDE.md,
  12. kural).
- **Motor, `src/motor/neden.ts`:**
  - `neden(kok, etiketler, parcalar)`: aday `olasiBicimler` içindeyse boş liste. Değilse
    ekler soldan sağa yerel uyumla sınanır: beklenen ünlüyü motorun kendi `uyum` işlevi
    verir, adaydaki önceki son ünlüye bakarak. Uyum farkı yoksa tek neden `diğer`. Her
    neden bakılan ve seçilen ünlüyü, adaydaki yerleriyle taşır; bakılanın kökte olup
    olmadığını da bilir. `neden.csv`'nin 37 satırının hepsi geçiyor.
  - `nedenCumlesi(nedenler)`: yalnız ilk neden için üç cümle; bakılan ünlü önceki ekteyse
    sona "Bukalemun en yakın ünlüye bakar." eklenir.
  - `yuzeySecenekleri(parca)`: bukalemunun kılıkları (lar/ler; ım/im/um/üm). Her ünlü
    yuvasının alabileceği ünlüler motorun `uyum` işlevinden toplanır; arkafonem tablosu
    ikinci kez yazılmadı. `neden` seçilen yüzeyi bununla doğrular.
  - `csvOku` genel kapıdan dışa açıldı (görev tablosu için). Altın tablo (202 satır) ve
    sözlük değişmedi.
- **Oyunun mantığı, `src/oyun/` (saf TypeScript):**
  - `gorevler.ts`: görev tablosunu satır numaralı hatalarla okur.
  - `karistir.ts`: mulberry32 ile sabit tohumlu karıştırma.
  - `koy.ts`: adımlar, seçenekler ve oyunun durumu. Durum bir indirgeyicide tutulur, evreleri
    `secim`, `deneme`, `buyu`, `bitti` ve `kapanis`; anlam etkileri de burada.
  - `tsconfig.motor.json` bu klasörü DOM'suz derler, `bagimsizlik.test.ts` içe aktarmaları
    tarar.
- **Ekran, `src/ekranlar/BukalemunKoyu.tsx` (hareketler `hareket.ts`'te, Web Animations
  API):**
  - Ortada kelime kartı (`KokYazisi`), altında kıyıda bukalemunlar, en altta cep.
  - Taşımanın üç yolu: sürükle-bırak (Pointer Events; fare ve parmak), dokun-dokun ve
    klavye (Tab, Enter; Esc seçimi bırakır).
  - Doğru taşımada büyü: bukalemun kelimenin sonuna uçar, kökteki etiketten bukalemunun
    gözüne bir yay çizilip parlar, bukalemun iki kez zıplar. Kelime birleşir ve ek
    bukalemunun renginde kalır. Sonuç `ekle()`'nin parçasından gelir.
  - Anlam etkisi: çoğulda kart üçe çoğalır; iyelikte kart cebe girer (FLIP), cebin önünde
    kelime yazılı. Zincirde gövde `toplar` olur, etiket a'ya geçer.
  - Yanlış taşımada bukalemun kelimeye uçar, -12 derece eğilir, düşer, kıyıya döner. Altta
    denenen biçim (üstü çizili; ilgili iki ünlü `UnluEtiketi` içinde) ve cümle görünür. Ceza, puan ve
    süre yok; ağız hiç değişmez.
  - Renksiz görevde (9.) `.renksiz` büyüye kadar sürer. Hareket azaltmada hiçbir hareket
    oynamaz.
  - Kapanış kartı: "Koyda akşam oldu", kurulan on kelime ekleri renkli.
  - Ana sayfada geçici "Bukalemun Koyu" düğmesi; koyda ana sayfa düğmesi (ev simgesi).
  - Oyun ekranı yalnız `tema.css` belirteçlerini kullanıyor; `kurallar.test.ts` onu da
    tarıyor. Başlıklar için Baloo 2 oyunun girişine de yüklendi (yalnız latin ve latin-ext).
- **Düzen:** 412×839, 360×640 ve 320×568'de yatay taşma yok. 360×640 ve 320×568'de kart,
  dört bukalemun ve cep kaydırmadan ekrana sığıyor, neden cümlesi açıkken de. Bukalemunlar
  0.9 ölçeğin altına inmiyor.
- **Testler:** 594 birim testi ve 23 uçtan uca test.
  - Birim testlerinin dağılımı: motor 366 (neden 59), oyun mantığı 43, görsel dil 152
    (kurallar 35), ekranlar 11, galeri 11, denetim sayfası 11.
  - Görev tablosunun testi: her görevin doğru biçimi seçeneklerden kurulur, her adımda tam
    bir seçenek doğrudur. Her yanlış seçeneğin bir uyum nedeni ve cümlesi var.
  - Uçtan uca, Bukalemun Koyu 8 test:
    - on görev dokun-dokun oynanıp kapanış kartına varılır; üç kart, cep, renksiz görev ve
      zincir de denetlenir;
    - yanlış denemede "Kalınlıkları uyuşmuyor." cümlesi görünür, a ile e etiketlenir,
      bukalemun -12 derece eğilir, ağızlar değişmez;
    - 1. görev klavyeyle, fareyle sürükleyerek ve parmakla sürükleyerek oynanır;
    - hareket azaltmada hiç hareket oynamaz;
    - üç ekran boyunda taşma yok, dokunma alanları en az 44 px, ek yazısı en az 18 px;
    - ana sayfaya dönülür, dış sunucuya istek gitmez.

### Kullanıcının verdikleri

- Oturumun tarifi (oyun, seçenekler, nedenin algoritması, üç cümle, ekranın davranışı) ve iki
  tablo oturum başında kullanıcıdan geldi; tablolar hiç değiştirilmedi.

### Kullanıcının onayladıkları (tarifte açık kalan yerler)

- **Nedenin gösterimi:** cümle kelime kartının altında. Üstünde denenen biçim durur (*atler*):
  ilgili iki ünlü `UnluEtiketi` içinde. "İlgili iki ünlü vurgulanır" böyle yorumlandı. Öteki
  harfler `--cizik` renginde ve üstü çizili: ilk sürümde çizgi yoktu. Codex bunu PR'da buldu
  (DESIGN.md, "Uymayan ek": sonucun üstü çizili ve `--cizik` renginde); doğrulanıp düzeltildi.
  Çizgi etiketlere geçmez.
- **Cep:** ekranın en altında, dikişli bir cep önü. Kart cebe girince yalnız üst kenarı
  görünür; kelime cebin önünde yazılı. Kelime kartı gölgesiz, çünkü tek gölge ünlü kartınınki.
- **Birleşen ek:** bukalemunun renginde, 2px mürekkep çerçeveli; düzde köşeli, yuvarlakta hap.
  DESIGN.md'nin görsel koduna yazıldı.
- **Metinler:** "Sıradaki", "Ana sayfa", "Koyda akşam oldu", "Bugün kurduğun kelimeler:" ve
  ekran okuyucu yönergesi ("Bir bukalemunu kelimeye taşı: sürükle, ya da önce bukalemuna
  sonra kelimeye dokun."). Görev sırası "3 / 10" diye yazılıyor; puan değil, yer.
- **"Diğer" nedenin cümlesi şimdilik yok:** `nedenCumlesi` boş döner; Bukalemun Koyu'nda
  çıkmıyor. Cümlesi, gerektiği bölgede kullanıcıyla yazılır.

### Oturumda seçilen küçük ayrıntılar (kullanıcıya ayrıca sorulmadı)

- **Büyünün süresi:** doğru taşımadan Sıradaki'ye kadar yaklaşık 3,5 saniye; yanlışta
  uçuş, eğilme, düşüş ve dönüş yaklaşık 1,6 saniye.
- **Seçeneklerin tohumu:** `sira × 100 + adım`. Doğru bukalemun dört yerin dördüne de düşüyor.
- **Klavyede odak:** bukalemun seçilince odak kelime kartına geçer (Enter taşır); görev bitince
  Sıradaki'ye, yeni görevde ilk bukalemuna geçer.

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

- **Kılık dışı yüzey hata verir:** `neden`, ekin kılıklarından olmayan yüzeyi reddeder
  (`lır`, `lr`). Saklanan ünlüde (kedi + `im`) seçenek sunacak bir bölge gelirse ayrı bir
  neden gerekir.
- **Anlam etkisi yalnız PL ve POSS.1SG için** (`ANLAM_ETKILERI`, `src/oyun/koy.ts`). DESIGN.md
  tablosundaki öteki büyüler (-CIk, -lI, -sIz, -(y)A) sonraki bölgelerde.
- **Açılış ekranı eski renklerle ve geçici düğmeyle:** `AcilisEkrani` ve `genel.css` gök ve
  deniz renklerini kullanıyor; manifest'teki `theme_color` ve `background_color` da.
  Ada haritası (Oturum 6) açılışı `tema.css`'e taşır ve geçici düğmeyi kaldırır.
- **Sesli mod yok:** 1–2. sınıf için neden cümlesi okunarak verilmeli (DESIGN.md, "Koleksiyon
  ve modlar").
- **İlerleme saklanmıyor:** koydan çıkınca oyun baştan başlar. Saklanacaksa yalnız cihazda
  (6. kural).
- **Galerinin uymayan örneği hâlâ elle:** `neden` artık var; istenirse galeri *evlar*'ı
  motordan kurar, nedenini de gösterir.
- **İkonlar yer tutucu:** `scripts/ikon.svg`'deki ada çizimi. Koddan üretilen bir karakterle
  yeniden çizilebilir (`npm run ikonlar`).
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
  - Bukalemun Koyu'nda parmakla sürükleme: uçtan uca testler Chromium'da fareyle ve CDP
    dokunmasıyla sınıyor; iOS Safari'de Pointer Events ile `touch-action` denenmeli.
  - Denetim sayfası: <https://frtbasbug.github.io/morfemusta/denetim.html>. Karakter
    Galerisi: <https://frtbasbug.github.io/morfemusta/galeri.html>.
- **Yön kilidi yok:** manifest'te `orientation` yazılı değil. Telefonda dikey kilit mi,
  sınıf modu (etkileşimli tahta) için yatay mı, karar bekliyor.
- **DESIGN.md künyeleri:** Aksu-Koç & Slobin (1985) ile Becker, Ketrez & Nevins (2011)
  yalnız kısa atıfla geçiyor. Tam künye, doğrulanmış kaynaktan eklenebilir.
- **Önbellek boyutu:**
  - Andika'nın Kiril ve Vietnamca alt kümeleri de önbelleğe giriyor (yaklaşık 80 KB). Türkçe
    için `latin` ve `latin-ext` yeter; Baloo 2 bu yüzden yalnız onlarla yükleniyor.
  - Andika için de alt küme dosyaları içe aktarılabilir ya da `workbox.globIgnores` ile
    ayıklanabilir.
  - Denetim sayfası ve galeri de önbelleğe giriyor; girmezlerse service worker onları oyuna
    düşürür, çıkarılmamalı.

## Sıradaki hedef: Oturum 6 — ada haritası

Kapsam oturum başında kullanıcıyla belirlenir. Bilinenler:

- Açılış ekranındaki geçici "Bukalemun Koyu" düğmesi kalkar; koya haritadan girilir.
- Açılış ekranı ve `genel.css`, `tema.css` belirteçlerine taşınır; manifest renkleri de.
- Sonrası: Oturum 7'de nedenin gövde parçasının tasarımı (Fıstıkçı Şahap'ın Dükkânı; yukarıda
  "Plan"), Oturum 8'de ek sırası denetimi.
