# Morfemusta

İlkokul çocukları için kâr amacı gütmeyen bir Türkçe biçimbilim oyunu. Çocuk kök ve ek
yaratıklarını birleştirir; kurduğu kelime adadaki dünyayı değiştirir.

- Oyun: <https://frtbasbug.github.io/morfemusta/> (telefonda ana ekrana eklenebilir,
  çevrim dışı çalışır)
- Sınıf modu (etkileşimli tahta): <https://frtbasbug.github.io/morfemusta/?sinif=1>. Bütün
  bölgeler açıktır, ilerleme kaydedilmez; Ayarlar'dan ya da `?sinif=0` ile kapanır.
- Cihaz Denetimi: <https://frtbasbug.github.io/morfemusta/cihaz.html> (tarayıcının sürümü ve
  oyunun dayandığı özellikler; eski cihazda oyun açılmazsa)
- Pilot sayfası (yetişkin için): <https://frtbasbug.github.io/morfemusta/pilot.html>. Çocuk
  kodu, deneme günlüğünün özeti ve CSV'si, yazdırılacak üç belge (gözlem formu, veli
  bilgilendirme ve onay formu, gözlemci yönergesi).
- Tasarım: [DESIGN.md](DESIGN.md)
- Geliştirme: [CLAUDE.md](CLAUDE.md) (yığın, komutlar, kurallar)
- Durum: [NEXT.md](NEXT.md)

Reklam, uygulama içi satın alma, hesap ve veri toplama yoktur. İlerleme, Sözlük kartları ve
ayarlar yalnız cihazda saklanır; hiçbir veri cihazdan çıkmaz.

Pilotun deneme günlüğü de yalnız cihazda kalır: pilot sayfasında bir çocuk kodu (ad değil, P01
gibi) girilince oyundaki seçimler o cihazda kodla kaydedilir. Hiçbir şey kendiliğinden
gönderilmez; yetişkin günlüğü pilot sayfasından elle indirir (CSV) ya da kopyalar. Kod yokken ve
sınıf modunda hiçbir şey kaydedilmez.

```sh
npm install
npm run dev        # http://localhost:5173/morfemusta/
npm test           # birim testleri
npm run test:e2e   # telefon boyutunda uçtan uca testler
```

## Lisanslar

- **Kod:** MIT ([LICENSE](LICENSE)).
- **Sesler** (`public/ses/`): Sesler yapay zekâyla, Google Cloud Text-to-Speech'in Chirp 3: HD
  Callirrhoe sesiyle önceden üretildi. Kodun MIT lisansı ses dosyalarını kapsamaz. Üretim
  sırasında Google'a yalnız oyunun kendi metinleri gider; oyun çalışırken hiçbir istek yapılmaz
  (sesler pakete gömülüdür). Sesleri yeniden üretmek için (anahtar yalnız ortam değişkeninde):
  `pip install lameenc && GOOGLE_TTS_KEY=... python3 scripts/ses-uret.py`.
- **Efektler** (doğru, yanlış, büyü): dosya değildir; tarayıcıda kodla (Web Audio) üretilir.
- **Emojiler** (`public/emoji/`): [Twemoji](https://github.com/jdecked/twemoji) (sürüm 16.0.1),
  Twitter, Inc. ve katkıcıları. Grafikler [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
  lisanslıdır.
- **Yazı tipleri:** Andika (SIL International) ve Baloo 2 (Ek Type), SIL Open Font License 1.1;
  pakete gömülü.
