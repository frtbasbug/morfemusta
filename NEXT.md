# Sıradaki

## Son oturum: Oturum 1 — kurulum (2026-09-27)

### Bitenler

- Vite 8 + React 19 + TypeScript 7 iskeleti; Vite `base` ayarı `/morfemusta/`.
- PWA (vite-plugin-pwa): manifest (ad, `start_url`/`scope` `/morfemusta/`, `standalone`,
  192/512 ve maskable ikonlar, Apple dokunma ikonu); service worker her şeyi, yazı tipleri
  dahil, önceden önbelleğe alıyor; yeni sürüm sessizce devreye giriyor.
- "Morfemusta Adası" açılış ekranı: başlık, Andika (pakete gömülü), telefon boyutunda tek
  sütun, ada çizimi.
- Vitest: `src/ekranlar/AcilisEkrani.test.tsx` (2 test).
- Playwright, Pixel 7 profili: `e2e/acilis.spec.ts` (4 test): başlık ve Andika, 320 px'te
  taşma yok, dış sunucuya istek yok, manifest ve ikonlar alt yolda, çevrim dışı açılış.
  Testler bu bulut ortamında da koşuyor (hazır Chromium, Playwright 1.56.1'e sabit).
- GitHub Actions (`.github/workflows/test-ve-yayin.yml`): her push ve PR'da tür denetimi,
  birim ve uçtan uca testler; `main`'e push'ta testten geçen `dist/` GitHub Pages'e
  yayımlanıyor.
- `DESIGN.md`, `CLAUDE.md`, `NEXT.md`.

### Açık kalanlar

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

## Sıradaki hedef: Oturum 2 — biçimbilim motoru I

`src/motor` altında, arayüzden bağımsız, saf TypeScript bir biçimbilim motorunun ilk
parçası. Önerilen kapsam (oturum başında onaylanır):

- Sekiz ünlünün özellik tablosu (kalın/ince, düz/yuvarlak, geniş/dar).
- Arkafonem çözümü: A = {a, e}, I = {ı, i, u, ü}, D = {d, t}, C = {c, ç}.
- Uydurma kelimede puanlanan kategorik kurallar: ünlü uyumu (-lAr, -(I)m),
  -DA/-CI ünsüz benzeşmesi, kaynaştırma (-(y)A).
- Kök + ek birleştirmesinin sonucu: doğru biçim ya da ekin "düşme" nedeni (ör. *evlar*:
  kalınlık uyuşmuyor). Arayüz bu nedeni komik sonuca çevirecek.
- Vitest ile tablo biçiminde testler: *evler, kitapta, balıkçı, kediye*; uydurma
  *fıngıllar, mömüşte*.
- Motorun React, DOM ya da CSS içe aktarmadığını denetleyen bir test.

Sonraki motor oturumlarına bırakılabilecekler: ünsüz yumuşaması (iki biçim de kabul:
*pıtağım / pıtakım*), tek heceli inatçılar (*topu, saçı*), misafir kelimeler
(*saatler, goller*), ünlü düşmesi (*ağzım, burnum*), `icerik/*.csv` okuyucusu.
