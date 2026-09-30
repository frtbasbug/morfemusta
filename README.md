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
