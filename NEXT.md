# Sıradaki

## Son oturum: Oturum 4 — görsel dil (2026-09-27)

### Bitenler

- **Görsel yön B · Canlı** koda geçti; `DESIGN.md`'ye "Görsel dil" bölümü yazıldı (görsel kod,
  belirteçler, üç kural). CLAUDE.md'de 11. kural bu üç kuralı anar.
- **Geometri (`src/gorsel/cizim.ts`):** tuvaldeki başvuru kodunun TypeScript hâli. Sayılar ve
  yollar birebir: sekiz ünlünün iki çizimi de başvuru koduyla karşılaştırıldı, aynı çıktı.
  Saftır: React'e ve DOM'a bağımlı değil; `tsconfig.motor.json` onu da DOM'suz derler.
  Kutular ve yuvarlak parçaların yarıçapları (`UNLU`, `BUKALEMUN`) yorumlardan sabite geçti.
- **Belirteçler (`src/gorsel/tema.css`):** on renk, Renksiz kipin iki grisi, çizgi
  kalınlıkları, yazı tipleri, yazı boyları; `.renksiz` sınıfı.
- **Yazı tipleri:** Baloo 2 (800) `@fontsource/baloo-2` ile pakete gömüldü (kullanıcının
  isteğiyle, OFL-1.1). woff2 dosyaları service worker önbelleğinde; Google Fonts'a istek yok.
- **Bileşenler (`src/gorsel/`):** `Unlu` (72×76), `Bukalemun` (132×82), `KokYazisi`; hepsi
  `role="img"` ve `aria-label` taşır ("a: kalın, düz, geniş"; "lar bukalemunu, a kılığında:
  kalın, düz, geniş"). Renkler CSS değişkenlerinden (`karakterler.css`); `boyut` yalnız ölçekler.
  Ünlü kartı (`.unlu-karti`, çizgi 2.5, köşe 18, tek gölge) da görsel dilin parçası.
- **Bukalemunun kılığı (`src/gorsel/kilik.ts`):** `bukalemunKiligi(parca)`, ekle()
  sonucundaki ekin ilk yüzey ünlüsünü alır. Ek ünlüsüz kalırsa (kedim) bukalemun saklanır ve
  biçimi, saklanan ünlüye uyumun seçeceği ünlününki olur (i). Bunun için motorun iç `uyum`
  işlevi dışa açıldı; motorun davranışı, altın tablo ve sözlük değişmedi.
- **Karakter Galerisi (`galeri.html`):** ayrı giriş sayfası, oyundan bağlantı yok, `noindex`.
  Sekiz ünlü okul çizelgesi düzeninde; -lAr (kuşlar, gözler), -(I)m (kızım, evim, yolum,
  gözüm), saklanan (kedim), uymayan (ev + lar, elle kurulan tek örnek). Üstte yapışkan başlık
  ve Renksiz düğmesi (`aria-pressed`).
- **Testler:** 402 birim testi (yeni 83: çizim 26, bileşenler 27, kılık 23, galeri 7; motor
  306 değişmedi) ve 14 uçtan uca test (yeni 5, galeri: telefonda ve 320 px'te açılış, 8 ünlü
  ve 8 bukalemun görünür, konsol hatası yok, Baloo 2 yüklü; Renksiz'de `--kalin` = `--ince`;
  Google Fonts'a ve başka sunucuya istek yok; oyunda bağlantı yok; çevrim dışı açılış).
  Piksel karşılaştırmalı ekran görüntüsü testi yok.

### Açık kalanlar

- **Kullanıcı onayı bekliyor:** Renksiz kipte sekiz ünlü bedenlerinden ayırt ediliyor mu?
  Telefonda gözle bakılacak: <https://frtbasbug.github.io/morfemusta/galeri.html> (PR
  birleşince) ya da `npm run dev` ile <http://localhost:5173/morfemusta/galeri.html>.
- **Saklanan bukalemunun kuyruk ucu:** kuyruğun 11'lik kesik alt çizgisi sarmalın dar
  yerinde üst üste biniyor; uçta kesikler küçük bir yumak gibi görünüyor. Geometri tuvalden,
  değiştirilmedi; gözle bakılmalı.
- **Bukalemunun göz bebeği göz akının ortasında:** başvuru kodunda bebek için kayma yok
  (ünlü karakterinde bebek 0.8 aşağıda). Bakış köke dönsün istenirse tuvalde karar verilir.
- **Oyunun açılış ekranı eski paletle:** `genel.css`'teki ada renkleri ve Andika başlık
  duruyor; görsel dil henüz yalnız galeride. Ada haritası (Oturum 6) yeni dile geçer.
- **İkonlar yer tutucu:** `scripts/ikon.svg`'deki ada çizimi. Görsel dil belirlendi; ikonlar
  ona göre yeniden çizilebilir (`npm run ikonlar`).
- **`motion` henüz kurulmadı:** izinli; Oturum 5'teki büyü ve düşüş için gerekecek.
- **`iş` sözlükte yok:** Oturum 2'nin 85. altın satırı (`iş,AGT,işçi`) artık uydurma kökle
  çalışıyor. Biçim değişmiyor (AGT ünsüzle başlar, ş yumuşamaz); istenirse `iş` sözlüğe
  eklenir (kullanıcı onayıyla).
- **Uydurma kökte ikinci biçimin parçaları dışarıda yok:** `olasiBicimler` yalnız dizgi
  döner. Arayüz çocuğun seçtiği yumuşamış biçimi (pıtağım) canlandırmak isterse
  `ekle.ts`'deki `turet` işlevi dışa açılabilir.
- **Denetim sayfasında yalnız sözlük kökleri ve sekiz ek var:** uydurma kökler, yapım
  zincirleri (gözlüğüm) ve öteki ekler (ABL, INS, POSS.2SG ...) yok; gerekirse eklenir.
- **Ek sırası denetlenmiyor (Oturum 8):** Motor etiketleri verilen sırayla ekler;
  `PL+AGT`, `LOC+PL` ya da `PL+LIK` gibi dizileri reddetmez. `ekler.csv`'deki tür sütunu
  bunun için hazır ("meyvenin üstüne gövde çıkmaz", DESIGN.md).
- **Ek adları CSV'de yok:** yönelme, bulunma, ayrılma gibi Türkçe adlar canlandırılacak
  (DESIGN.md, "Terimler resimdir"). Arayüz gerektirince `ekler.csv`'ye sütun eklenebilir.
- **Kökte yalnız 29 küçük harf kabul ediliyor:** *kâr*, *hâlâ* gibi düzeltme işaretli
  kökler ve büyük harf şimdilik hata veriyor (motorda da sözlükte de).
- **Gerçek telefonda doğrulama:** <https://frtbasbug.github.io/morfemusta/> Android
  Chrome'da "Uygulamayı yükle / Ana ekrana ekle"; iOS Safari'de Paylaş → "Ana Ekrana Ekle";
  ardından uçak modunda açılış. Denetim sayfası ve galeri de çevrim dışı açılmalı.
- **Yön kilidi yok:** manifest'te `orientation` yazılı değil. Telefonda dikey kilit mi,
  sınıf modu (etkileşimli tahta) için yatay mı, karar bekliyor.
- **DESIGN.md künyeleri:** Aksu-Koç & Slobin (1985) ile Becker, Ketrez & Nevins (2011)
  yalnız kısa atıfla geçiyor. Tam künye, doğrulanmış kaynaktan eklenebilir.
- **Önbellek boyutu:** Andika'nın Kiril ve Vietnamca alt kümeleri (yaklaşık 80 KB) ve Baloo
  2'nin Devanagari ve Vietnamca alt kümeleri (yaklaşık 62 KB) de önbelleğe giriyor. Türkçe
  için `latin` ve `latin-ext` yeterli; gerekirse `workbox.globIgnores` ile ayıklanır.
  Denetim sayfası ve galeri de önbelleğe giriyor; girmezlerse service worker onları oyuna
  düşürür, çıkarılmamalı.

## Sıradaki hedef: Oturum 5 — Bukalemun Koyu

Oturum 4'ün PR'ı birleşmeden açılmaz; kapsam ve iki tablo (`icerik/gorevler/bukalemun-koyu.csv`,
`tests/neden.csv`) kullanıcının oturum metnindedir. Kısaca:

- İlk oyun ekranı: ortada kök (`KokYazisi`), altındaki kıyıda bukalemunlar (`Bukalemun`);
  çocuk doğru bukalemunu köke taşır (sürükle-bırak, dokun-dokun, klavye). Doğru biçim hep
  motordan gelir (`olasiBicimler`, `ekle`).
- Motora `neden(kok, etiketler, parcalar)` ve `nedenCumlesi(neden)`: yanlış biçimin nedeni
  yerel uyumla bulunur (*toplerim*'de suç yalnız *ler*'in).
- Doğruda büyü, yanlışta eğilip düşme; ağız hiçbir durumda değişmez (DESIGN.md, "Görsel
  dil", 2. kural). Renksiz görevde `.renksiz` sınıfı kullanılır.
