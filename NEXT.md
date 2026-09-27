# Sıradaki

## Son oturum: Oturum 2 — biçimbilim motoru I (2026-09-27)

### Bitenler

- **Altın tablo:** `tests/altin-bicimler.csv`, kullanıcının verdiği hâliyle (100 satır).
  `src/motor/altin-bicimler.test.ts` her satırı ayrı bir test olarak koşar; ayrıca tablonun
  100 satır olduğunu denetler. 100/100 geçiyor.
- **Ek envanteri:** `icerik/ekler.csv` (etiket, şablon, tür): PL, POSS.1SG/2SG/3SG/1PL/2PL/3PL,
  ACC, DAT, LOC, ABL, GEN, INS (çekim) ve AGT (yapım). Motor şablonları buradan okur.
- **Motor (`src/motor`, saf TypeScript):**
  - `ses.ts`: sekiz ünlünün üç özelliği (kalın/ince, düz/yuvarlak, geniş/dar), sert ünsüzler,
    alfabe.
  - `sablon.ts`: şablonu birimlere ayırır: A, I, D, C, ayraçlı ünsüz (y)/(s)/(n), ayraçlı
    ünlü (I), düz harf.
  - `envanter.ts` ve `csv.ts`: `ekler.csv`'yi `?raw` ile okur, doğrular (başlık, tür, yinelenen
    etiket, bozuk şablon).
  - `ekle.ts`: `ekle(kok, etiketler)` → `{ bicim, parcalar }`. Her parça etiketi, şablonu,
    türü, yüzey biçimini ve olayları taşır. Olay türleri: `uyum` (bakılan ünlü, sonuç,
    kopyalanan özellikler), `kaynaştırma`, `düşme` (yüzeye çıkmayan ayraçlı birim),
    `benzeşme` (D→t, C→ç), `zamir n`. Her olayda ekin yüzeyindeki `konum` ve kısa bir
    `aciklama` var ("uyum: kalınlık ve yuvarlaklık kopyalandı", "benzeşme: D→t").
  - `index.ts`: genel kapı.
- **Bağımsızlık denetimi:** `bagimsizlik.test.ts` motorun içe aktarmalarını tarar;
  `tsconfig.motor.json` motoru DOM'suz ve Node'suz derler (`npm run typecheck`'e eklendi).
- **Birim testleri:** 148 motor testi (altın tablo 101, olaylar ve parçalar 27, envanter,
  şablon ve CSV 13, bağımsızlık 7) ve 2 ekran testi. Uçtan uca 4 test yeşil.
- **CLAUDE.md:** 8. kural (altın tablo yalnız kullanıcı onayıyla değişir), 9. kural (motor
  testleri kırmızıyken push yok); klasör yapısı ve `?raw` notu güncellendi.

### Açık kalanlar

- **98. satırın kural sütunu (karar bekliyor):** `kedi,POSS.3SG+GEN,kedisinin` satırının
  kural sütununda "kaynaştırma s ve zamir n" yazıyor. Motor, 4. kuraldaki listeye (ACC, DAT,
  LOC, ABL) uyarak buradaki n'yi GEN'in kendi (n)'si sayıyor ve "kaynaştırma: n" olarak
  işaretliyor. Biçim aynı, test geçiyor; oyunun hangi olayı canlandıracağı kullanıcının
  kararı. Değişirse `ekle.ts`'deki `ZAMIR_N_ALAN` ve `ekle.test.ts`'deki ilgili test
  güncellenir.
- **Ek sırası denetlenmiyor:** Motor etiketleri verilen sırayla ekler; `PL+AGT` ya da
  `LOC+PL` gibi dizileri reddetmez. `ekler.csv`'deki tür sütunu bunun için hazır ("meyvenin
  üstüne gövde çıkmaz", DESIGN.md).
- **Yanlış biçimin nedeni yok:** Eski öneriydi: *evlar* için "kalınlık uyuşmuyor" gibi,
  ekin düşme nedenini veren bir denetleyici. Arayüzün komik sonuçları için gerekecek.
- **"Düşme" adı üç yerde:** motorda ayraçlı birimin düşmesi (`düşme: (I)`), DESIGN.md'de
  uymayan ekin "sallanıp düşmesi", Oturum 3'te ünlü düşmesi (*burnum*). Oturum 3'teki
  olaya ayrı bir ad verilmeli (ör. `ünlü düşmesi`).
- **Ek adları CSV'de yok:** yönelme, bulunma, ayrılma gibi Türkçe adlar canlandırılacak
  (DESIGN.md, "Terimler resimdir"). Arayüz gerektirince `ekler.csv`'ye sütun eklenebilir.
- **Kökte yalnız 29 küçük harf kabul ediliyor:** *kâr*, *hâlâ* gibi düzeltme işaretli
  kökler ve büyük harf şimdilik hata veriyor.
- **Gerçek telefonda doğrulama (PR birleşince):** <https://frtbasbug.github.io/morfemusta/>
  Android Chrome'da "Uygulamayı yükle / Ana ekrana ekle"; iOS Safari'de Paylaş →
  "Ana Ekrana Ekle"; ardından uçak modunda açılış. Otomatik testler kurulabilirliği ancak
  dolaylı ölçebiliyor.
- **İkonlar yer tutucu:** `scripts/ikon.svg`'deki ada çizimi. Görsel kimlik belirlenince
  değiştirilir (`npm run ikonlar`).
- **`motion` henüz kurulmadı:** izinli; ilk animasyon gerektiğinde eklenecek.
- **Yön kilidi yok:** manifest'te `orientation` yazılı değil. Telefonda dikey kilit mi,
  sınıf modu (etkileşimli tahta) için yatay mı, karar bekliyor.
- **DESIGN.md künyeleri:** Aksu-Koç & Slobin (1985) ile Becker, Ketrez & Nevins (2011)
  yalnız kısa atıfla geçiyor. Tam künye, doğrulanmış kaynaktan eklenebilir.
- **Önbellek boyutu:** Andika'nın Kiril ve Vietnamca alt kümeleri de önbelleğe giriyor
  (yaklaşık 80 KB). Türkçe için `latin` ve `latin-ext` yeterli; gerekirse
  `workbox.globIgnores` ile ayıklanır.

## Sıradaki hedef: Oturum 3 — biçimbilim motoru II

Oturum 2'de bilerek dışarıda bırakılanlar. Önerilen kapsam (oturum başında onaylanır):

- **Ünsüz yumuşaması:** ünlüyle başlayan ek gelince p→b, ç→c, t→d, k→ğ (nk→ng):
  *kitabı, ağacı, çocuğu*. Tek heceli inatçılar (*topu, saçı*) sözlükte işaretlenir.
  Uydurma kelimede iki biçim de kabul edilir (*pıtağım / pıtakım*); motorun iki biçimi
  birden nasıl döndüreceğine karar verilmeli.
- **Ünlü düşmesi:** *ağzım, burnum, alnım, oğlu*; yalnız sözlükte işaretli köklerde.
- **Sözlük istisnaları:** uyuma uymayan misafir kelimeler (*saatler, goller*); düzeltme
  işaretli kökler (*kâr*).
- Sözlük `icerik/*.csv`'de tutulur (kök ve işaretleri); koda gömülmez.
- Yeni olay türleri (ör. `yumuşama`, `ünlü düşmesi`, `istisna`) aynı parça yapısına girer.
- Yeni altın satırlar yalnız kullanıcının onayıyla `tests/altin-bicimler.csv`'ye eklenir.
