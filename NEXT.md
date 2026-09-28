# Sıradaki

## Son oturum: Oturum 4 — görsel dil (2026-09-28)

### Bitenler

- **Görsel kod (`src/gorsel/cizim.ts`):** tuvaldeki başvuru kodu TypeScript'e taşındı; hiçbir
  sayı ve yol değişmedi. `cizim.test.ts` sekiz bileşimde başvuru koduyla karşılaştırır
  (başvuru kodunun yalnız tür eklenmiş kopyası testte durur); oturumda başvuru kodu olduğu
  gibi de çalıştırıldı, çıktısı birebir aynı. Ünlü tablosu motorunkidir, ikinci tablo yok.
  Saf TypeScript: `tsconfig.motor.json` DOM'suz derler, `bagimsizlik.test.ts` içe aktarmaları
  tarar.
- **Belirteçler (`src/gorsel/tema.css`):** on renk, Renksiz mod (`.renksiz`: kalın ve ince
  #8E8C99, iki zemin #E2E1E8), çizgi kalınlıkları, yazı tipleri, boyutlar.
- **Bileşenler (`src/gorsel/`):** `Unlu` (72×76), `Bukalemun` (132×82), `KokYazisi`,
  `UnluKarti`. Her karakterde `role="img"` ve `aria-label` ("a: kalın, düz, geniş";
  "lar bukalemunu, a: kalın, düz, geniş"; "m bukalemunu, saklanan i: ince, düz, dar").
  `boyut` yalnız ölçekler. SVG'de yalnız geometri var; renkler CSS değişkenlerinden.
- **Bukalemunun kılığı (`src/gorsel/kilik.ts`):** `ekle()` sonucundaki ek parçasının yüzeydeki
  ilk ünlüsü. Ek ünlüsüz kalırsa saklanan (I)'nın uyumla olacağı ünlü; bunu motorun `uyum`
  işlevi verir. Uyumsuz durum `uyumsuz` prop'uyla seçilir.
- **Motor:** yalnız iç `uyum` işlevi dışa açıldı (`src/motor/index.ts`). Davranış, altın
  tablo (202/202) ve sözlük değişmedi.
- **Yazı tipleri:** `@fontsource/baloo-2` eklendi (800; yalnız latin ve latin-ext, yaklaşık
  34 KB). woff2 dosyaları PWA önbelleğinde; Google Fonts'a istek yok.
- **Karakter Galerisi (`galeri.html`, `src/galeri/`):** sekiz ünlü okul çizelgesi düzeninde;
  -lAr (kuşlar, gözler); -(I)m (kızım, evim, yolum, gözüm); saklanan (kedim); uymayan
  (*evlar*, tek elle kurulan örnek). Her satır kök, bukalemun, ok, sonuç. Üstte Renksiz
  düğmesi (`aria-pressed`). Oyundan bağlantı yok, `noindex`, önbellekte. Dar ekranda bütün
  bukalemunlar aynı oranda küçülür (kök ve sonuç sütunları sabit).
- **Kurallar testi (`src/gorsel/kurallar.test.ts`):** renk değeri yalnız `tema.css`'te;
  degrade ve bulanıklık yok; tek gölge ünlü kartınınki; görsel kodda resim dosyası yok.
  Vitest CSS'i boşalttığı için `vite.config.ts`'e `test.css.include` (yalnız `?raw`) eklendi.
- **Testler:** 454 birim testi (görsel 126: çizim 43, bileşenler 34, kurallar 27, kılık 19,
  bağımsızlık 3; galeri 9; motor 306; denetim sayfası 11; açılış ekranı 2) ve 14 uçtan uca
  test (açılış 4, denetim 5, galeri 5: telefonda ve 320 px'te taşmadan açılış, sekiz ünlü ve
  sekiz bukalemun, konsol hatası yok; yazı tipleri gömülü, Google Fonts'a ve başka sunucuya
  istek yok; Renksiz'de `--kalin` = `--ince`; oyunda bağlantı yok; çevrim dışı açılış, yazı
  tipleriyle).
- **DESIGN.md:** "Görsel dil" bölümü (görsel kod, belirteçler, üç kural). **CLAUDE.md:**
  11. kural, yeni kitaplık, üç giriş sayfası, görsel dil notları.

### Kullanıcının onayını bekleyenler

- **Renksiz modda sekiz ünlü bedenlerinden ayırt ediliyor mu:** bitti ölçütü, gözle onay.
- **Tarifte açık kalan yerlerdeki yorumlar:**
  1. Saklanan bukalemunda ağız çizilmiyor (saklanan ünlü söylenmez); göz tümseği de zemine
     karışıyor. Yalnız göz akı ve bebek düz çizgiyle görünür.
  2. Ünlü kartının zemini kalın ya da ince zemin rengi (`--kalin-zemin`, `--ince-zemin`).
  3. Kök etiketi 1.2em kare (düz ünlüde, köşe 4px) ya da daire (yuvarlakta).
  4. "-lAr'da yalnız eni ve rengi değişir": bukalemunda kalınlık yüksekliktir (54 / 38, en
     hep 92). DESIGN.md'de "kalınlığı ve rengi" diye yazıldı.
- **Kök etiketinde kalınlık yalnız renkle gösteriliyor** (harfin kendisi dışında). Renksiz
  modda etiket kalın ile inceyi ayırmıyor; "renk hiçbir zaman tek başına değil" ilkesiyle
  gerilimde. Öneri: etiketin eni de kalınlığa bağlanabilir (kalında geniş, incede dar).

### Açık kalanlar

- **Oyunun ekranı henüz eski renklerle:** `AcilisEkrani` ve `src/genel.css` gök ve deniz
  renklerini kullanıyor; manifest'teki `theme_color` ve `background_color` da. "Yalnız
  belirteçlerdeki renkler" kuralı oyuna ilk oyun ekranıyla gelir (`genel.css` `tema.css`'e
  geçer).
- **İkonlar yer tutucu:** `scripts/ikon.svg`'deki ada çizimi. Görsel dil belli oldu; ikon
  koddan üretilen bir karakterle yeniden çizilebilir (`npm run ikonlar`).
- **`motion` henüz kurulmadı:** uymayan ekin "sallanıp düşmesi", sevinç ve üzüntü hareketleri
  için gerekecek (ağız değişmez, 2. kural).
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
- **Yanlış biçimin nedeni yok (Oturum 5):** *evlar* için "kalınlık uyuşmuyor" gibi, ekin
  düşme nedenini veren bir denetleyici. Arayüzün komik sonuçları için gerekecek.
- **Ek adları CSV'de yok:** yönelme, bulunma, ayrılma gibi Türkçe adlar canlandırılacak
  (DESIGN.md, "Terimler resimdir"). Arayüz gerektirince `ekler.csv`'ye sütun eklenebilir.
- **Kökte yalnız 29 küçük harf kabul ediliyor:** *kâr*, *hâlâ* gibi düzeltme işaretli
  kökler ve büyük harf şimdilik hata veriyor (motorda da sözlükte de).
- **Gerçek telefonda doğrulama (PR birleşince):** <https://frtbasbug.github.io/morfemusta/>
  Android Chrome'da "Uygulamayı yükle / Ana ekrana ekle"; iOS Safari'de Paylaş →
  "Ana Ekrana Ekle"; ardından uçak modunda açılış. Denetim sayfası:
  <https://frtbasbug.github.io/morfemusta/denetim.html>. Karakter Galerisi:
  <https://frtbasbug.github.io/morfemusta/galeri.html>.
- **Yön kilidi yok:** manifest'te `orientation` yazılı değil. Telefonda dikey kilit mi,
  sınıf modu (etkileşimli tahta) için yatay mı, karar bekliyor.
- **DESIGN.md künyeleri:** Aksu-Koç & Slobin (1985) ile Becker, Ketrez & Nevins (2011)
  yalnız kısa atıfla geçiyor. Tam künye, doğrulanmış kaynaktan eklenebilir.
- **Önbellek boyutu:** Andika'nın Kiril ve Vietnamca alt kümeleri de önbelleğe giriyor
  (yaklaşık 80 KB). Türkçe için `latin` ve `latin-ext` yeterli; Baloo 2 bu yüzden yalnız
  onlarla yükleniyor. Andika için de alt küme dosyaları içe aktarılabilir ya da
  `workbox.globIgnores` ile ayıklanır. Denetim sayfası ve galeri de önbelleğe giriyor;
  girmezlerse service worker onları oyuna düşürür, çıkarılmamalı.

## Sıradaki hedef: Oturum 5

Kapsam oturum başında kullanıcıyla belirlenir. Bilinen plan: yanlış biçimin nedeni Oturum
5'te, ek sırası denetimi Oturum 8'de.

Öneri: **yanlış biçimin nedeni.** Motorda, `ekle`'nin yanında saf bir denetleyici: verilen
bir biçimin (çocuğun taktığı bukalemun, ör. *ev* + *lar*) neden uymadığını söyler
("kalınlık uyuşmuyor: kök ince, ek kalın"). Galerideki uymayan örnek o zaman elle değil,
motordan kurulur. Ardından ilk oyun ekranı, Bukalemun Koyu, hazır görsel dille (karakterler,
kılık, eğim) kurulabilir.

- Neden, arayüzün canlandırabileceği biçimde verilir: hangi özellik (kalınlık, yuvarlaklık)
  hangi ünlüde uyuşmuyor.
- Uydurma kelimede yalnız kategorik kurallar puanlanır (DESIGN.md).
