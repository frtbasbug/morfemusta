# Sıradaki

## Son oturum: Oturum 3 — biçimbilim motoru II (2026-09-27)

### Bitenler

- **Altın tablo:** `tests/altin-bicimler.csv`'nin sonuna kullanıcının verdiği 100 satır
  olduğu gibi eklendi. Tabloda 202 satır var: Oturum 2'nin 100 satırı, onun sonunda
  onaylanan 2 satır (*evleri*, *kitaplarında*) ve Oturum 3'ün 100 satırı. `beklenen`
  sütununda `|` ile ayrılmış biçimler (`pıtağı|pıtakı`) için `olasiBicimler` tam bu kümeyi
  döner; tek biçimli satırda `ekle` o biçimi, `olasiBicimler` de yalnız onu döner. 202/202
  geçiyor.
- **Kök sözlüğü:** `icerik/kokler.csv`, kullanıcının verdiği hâliyle (150 kök; kategori,
  yumusama, unlu_dusmesi, istisna). `src/motor/sozluk.ts` `?raw` ile okur ve işaretleri
  doğrular (p/ç/t/k ile biten kökte yumusama zorunlu, ünlü düşmesi için ünsüz + ünlü + ünsüz
  sonu, ince-ek yalnız son ünlüsü kalın kökte, ikiz ve su'nun koşulları); yanlış satırı
  numarasıyla bildirir.
- **Ek envanteri:** `icerik/ekler.csv`'ye dört yapım eki: PROP -lI, PRIV -sIz, LIK -lIk,
  DIM -CIk.
- **Motor (`src/motor/ekle.ts`):**
  - Ünsüz yumuşaması (p→b, ç→c, t→d, k→ğ; nk→ng), ünlü düşmesi, ince ek, ikizleşme ve su
    kuralı; sözlük işaretleri yalnız köke gelen ilk eke uygulanır. -lIk ya da -CIk ile biten
    türemiş gövdenin k'si ünlüyle başlayan ekten önce hep ğ olur (gözlüğüm, kediciğim).
  - Uydurma kelime: sözlükte olmayan kök uydurmadır. `ekle` kökü bozmayan biçimi verir
    (pıtakı); `olasiBicimler(kok, etiketler)` kabul edilen bütün biçimleri, ilki `ekle`'ninki
    olmak üzere döner (pıtakı, pıtağı). Ünlü düşmesi, ikizleşme, ince ek ve su yalnız
    sözlükte işaretli kökte olur.
  - Parçalar artık `govde` de taşır: ekin geldiği gövde, ekin yol açtığı değişikliklerle
    ("kitab" → kitabı). Yeni olaylar: `yumuşama` ("yumuşama: k→ğ", "yumuşama: nk→ng"),
    `ünlü düşmesi`, `ikizleşme`, `ince ek`, `su` ("su: y"). Gövde olaylarının konumu
    parçanın gövdesinde, ek olaylarınınki yüzeyindedir (`govdeOlayiMi`).
  - `ekle`'nin üçüncü parametresi artık bir nesne: `{ envanter, sozluk }` (ikisi de
    isteğe bağlı).
- **Biçim Denetim Sayfası:** `denetim.html` (ayrı giriş sayfası, oyundan bağlantı yok,
  `noindex`). Sözlükteki her kök için işaretler ve PL, ACC, DAT, LOC, POSS.1SG, POSS.3SG,
  GEN, PROP biçimleri; kategoriye göre gruplu. Telefonda her kök bir kart (iki sütun, 36rem'den
  sonra dört), 75rem'den geniş ekranda tablo. Veri `src/denetim/veri.ts`'tedir; sayfa da
  `scripts/denetim-bicimleri.mjs` de onu kullanır.
- **Zeyrek denetimi:** `scripts/zeyrek-denetimi.py` (CI'da yok). Oturumda çalıştırıldı
  (zeyrek 0.1.3, nltk 3.10.3): 1200 biçimin 1200'ü çözümlendi; çözümlenemeyen yok; beklenen
  kök ve ekle eşleşmeyen yok. Denetim ayırt edici: bilerek yanlış kurulan 18 biçimden
  (kitapı, tobu, saatlar, golu, hakı, çocukum ...) 16'sını yakaladı; kaçan ikisi zeyrek'in
  eş sesli girdileri (ağızım, sırım).
- **Testler:** 319 birim testi (motor 306: altın tablo 203, ekle 60, sözlük 22, envanter
  13, bağımsızlık 8; denetim sayfası 11; açılış ekranı 2) ve 9 uçtan uca test (açılış 4,
  denetim 5: telefonda ve 320 px'te taşmadan açılış, en uzun biçimler bölünmüyor, kategori
  bağlantısı, dış istek yok, oyunda bağlantı yok, service worker varken ve çevrim dışı
  açılış).
- **CLAUDE.md:** 10. kural (`icerik/kokler.csv` yalnız kullanıcının onayıyla değişir), iki
  giriş sayfası, kök sözlüğü ve zeyrek notları, komutlar ve klasör yapısı.

### Açık kalanlar

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
- **Yanlış biçimin nedeni yok (Oturum 5):** *evlar* için "kalınlık uyuşmuyor" gibi, ekin
  düşme nedenini veren bir denetleyici. Arayüzün komik sonuçları için gerekecek.
- **Ek adları CSV'de yok:** yönelme, bulunma, ayrılma gibi Türkçe adlar canlandırılacak
  (DESIGN.md, "Terimler resimdir"). Arayüz gerektirince `ekler.csv`'ye sütun eklenebilir.
- **Kökte yalnız 29 küçük harf kabul ediliyor:** *kâr*, *hâlâ* gibi düzeltme işaretli
  kökler ve büyük harf şimdilik hata veriyor (motorda da sözlükte de).
- **Gerçek telefonda doğrulama (PR'lar birleşince):** <https://frtbasbug.github.io/morfemusta/>
  Android Chrome'da "Uygulamayı yükle / Ana ekrana ekle"; iOS Safari'de Paylaş →
  "Ana Ekrana Ekle"; ardından uçak modunda açılış. Denetim sayfası:
  <https://frtbasbug.github.io/morfemusta/denetim.html>.
- **İkonlar yer tutucu:** `scripts/ikon.svg`'deki ada çizimi. Görsel kimlik belirlenince
  değiştirilir (`npm run ikonlar`).
- **`motion` henüz kurulmadı:** izinli; ilk animasyon gerektiğinde eklenecek.
- **Yön kilidi yok:** manifest'te `orientation` yazılı değil. Telefonda dikey kilit mi,
  sınıf modu (etkileşimli tahta) için yatay mı, karar bekliyor.
- **DESIGN.md künyeleri:** Aksu-Koç & Slobin (1985) ile Becker, Ketrez & Nevins (2011)
  yalnız kısa atıfla geçiyor. Tam künye, doğrulanmış kaynaktan eklenebilir.
- **Önbellek boyutu:** Andika'nın Kiril ve Vietnamca alt kümeleri de önbelleğe giriyor
  (yaklaşık 80 KB). Türkçe için `latin` ve `latin-ext` yeterli; gerekirse
  `workbox.globIgnores` ile ayıklanır. Denetim sayfası da önbelleğe giriyor (JS ve CSS
  yaklaşık 17 KB); girmezse service worker onu oyuna düşürür, çıkarılmamalı.

## Sıradaki hedef: Oturum 4

Kapsam oturum başında kullanıcıyla belirlenir. Bilinen plan: yanlış biçimin nedeni
Oturum 5'te, ek sırası denetimi Oturum 8'de. Motor ilk bölgeler için yeterli (uyum,
benzeşme, kaynaştırma, yumuşama, ünlü düşmesi, yapım ekleri, uydurma kelime).

Öneri: **ilk oyun ekranı, Bukalemun Koyu (ünlü uyumu).** Çocuk kök yaratığına -lAr ya da
-(I)m bukalemununu takar; motor doğru biçimi verir, kelime dünyayı değiştirir (DESIGN.md,
"Çekirdek mekanik"). Yanlış seçimin komik sonucu Oturum 5'teki nedenle gelir.

- Kökler `icerik/kokler.csv`'den, görevler `icerik/*.csv`'den okunur (koda gömülmez).
- Uyum ipucu hem renkle hem biçimle verilir (renk körlüğü); telefonda tek sütun.
