# Morfemusta

İlkokul çocukları için kâr amacı gütmeyen bir Türkçe biçimbilim oyunu. Çocuk kök ve ek
yaratıklarını birleştirir; kurduğu kelime adadaki dünyayı değiştirir.

- Oyun: <https://frtbasbug.github.io/morfemusta/> (telefonda ana ekrana eklenebilir,
  çevrim dışı çalışır)
- Tasarım: [DESIGN.md](DESIGN.md)
- Geliştirme: [CLAUDE.md](CLAUDE.md) (yığın, komutlar, kurallar)
- Durum: [NEXT.md](NEXT.md)

Reklam, uygulama içi satın alma, hesap ve veri toplama yoktur. İlerleme, Sözlük kartları ve
ayarlar yalnız cihazda saklanır; hiçbir veri cihazdan çıkmaz.

```sh
npm install
npm run dev        # http://localhost:5173/morfemusta/
npm test           # birim testleri
npm run test:e2e   # telefon boyutunda uçtan uca testler
```

## Lisanslar

- **Kod:** MIT ([LICENSE](LICENSE)).
- **Sesler** (`public/ses/`): [Piper](https://github.com/rhasspy/piper) metinden sese aracıyla,
  `tr_TR-dfki-medium` sesiyle üretildi ([rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices);
  veri kümesi: [DFKI, marytts/dfki-ot-data](https://github.com/marytts/dfki-ot-data)). Sesin
  lisansı [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)'dır; ses dosyaları
  kodun MIT lisansından ayrı, aynı lisansla (CC BY-NC-SA 4.0) yayımlanır. Sesleri yeniden
  üretmek için: `pip install piper-tts lameenc && python3 scripts/ses-uret.py`.
- **Emojiler** (`public/emoji/`): [Twemoji](https://github.com/jdecked/twemoji) (sürüm 16.0.1),
  Twitter, Inc. ve katkıcıları. Grafikler [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
  lisanslıdır.
- **Yazı tipleri:** Andika (SIL International) ve Baloo 2 (Ek Type), SIL Open Font License 1.1;
  pakete gömülü.
