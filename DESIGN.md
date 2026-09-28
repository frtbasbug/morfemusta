# Morfemusta — Tasarım

Bu belge oyunun tasarım özetidir. Kod kararları bu belgeye uymalıdır; belgeyle
çelişen bir karar gerekiyorsa önce belge güncellenir.

## Amaç

Türkçe edinen çocuk isim çekimini iki yaş civarında edinir (Aksu-Koç & Slobin 1985).
Bu yüzden oyun "evler" demeyi öğretmez. Çocuğun zaten bildiği kuralları görünür kılar
ve biçimbilgisel farkındalığı **okumaya, yazıma ve söz varlığına** bağlar.

- **Hedef kitle:** ilkokul 1–4. sınıf.
- **Kâr amacı yok:** reklam, uygulama içi satın alma, hesap ve veri toplama yok.

## Çekirdek mekanik: kelime büyüsü

Çocuk kök ve ek yaratıklarını birleştirir; kurduğu kelime ekrandaki dünyayı değiştirir.

| Ek | Büyü |
|----|------|
| -lAr | çoğaltır |
| -CIk | küçültür |
| -lI | katar |
| -sIz | eksiltir |
| -(y)A | gönderir |

**Ekler bukalemundur.** Biçim kelimeye uymazsa (*evlar*) ek sallanıp düşer.

## İlkeler

- **Terimler resimdir.** Kök/gövde, kalın/ince, düz/yuvarlak, geniş/dar, sert/yumuşak,
  düşme, benzeşme, yönelme/bulunma/ayrılma kelimesi kelimesine canlandırılır.
- **Anlatma, sezdir.** Kural ekranı ve soru ekranı yok; öğrenme mekaniğin içindedir.
- **Uydurma kelime kanıttır** (wug mantığı). Uydurma kelimede yalnız kategorik kurallar
  puanlanır: ünlü uyumu, -DA/-CI benzeşmesi, kaynaştırma. Ünsüz yumuşaması sözlükseldir;
  iki biçim de kabul edilir (Becker, Ketrez & Nevins 2011).
- **Yanlış komik bir sonuç doğurur.** Kırmızı çarpı ya da "yanlış" sesi yok.
- **Uyum ipucu hem renkle hem biçimle verilir** (renk körlüğü).
- **Kısa oturum, doğal durak.** Oyun oturumları 5–10 dakika; birkaç görevden sonra adada
  akşam olur (doğal durma noktası); seri baskısı yok.

## Ünlü karakterleri

Sekiz ünlünün özellikleri bedenlerinde görünür:

| Özellik | Beden |
|---------|-------|
| kalın / ince | tombul / ince |
| yuvarlak / düz | gövde yuvarlak / gövde köşeli |
| geniş / dar | ağız açık / ağız kısık |

Buna göre sekiz karakter:

| Ünlü | Kalın/ince | Düz/yuvarlak | Geniş/dar | Beden |
|------|-----------|--------------|-----------|-------|
| a | kalın | düz | geniş | tombul, köşeli, ağzı açık |
| ı | kalın | düz | dar | tombul, köşeli, ağzı kısık |
| o | kalın | yuvarlak | geniş | tombul, yuvarlak, ağzı açık |
| u | kalın | yuvarlak | dar | tombul, yuvarlak, ağzı kısık |
| e | ince | düz | geniş | ince, köşeli, ağzı açık |
| i | ince | düz | dar | ince, köşeli, ağzı kısık |
| ö | ince | yuvarlak | geniş | ince, yuvarlak, ağzı açık |
| ü | ince | yuvarlak | dar | ince, yuvarlak, ağzı kısık |

Çizimin ölçüleri, renkleri ve kuralları: "Görsel dil".

**Bukalemun bir arkafonemdir.** Her bukalemun yalnız belli özellikleri kopyalar:

- **-lAr** bukalemunu yalnız kalınlığı kopyalar: *lar / ler*.
- **-(I)m** bukalemunu kalınlığı ve yuvarlaklığı kopyalar: *ım / im / um / üm*.

*Saatler*, *goller* gibi istisnalar bavullu **misafir kelimeler** olarak gelir.

### Bu belgedeki gösterim

- Büyük harf arkafonemdir: **A** = {a, e}; **I** = {ı, i, u, ü}; **D** = {d, t};
  **C** = {c, ç}.
- Ayraç içindeki ses her ortamda görünmez: -(y)A'da *y* ünlüden sonra gelir (kaynaştırma);
  -(I)m'de *I* ünsüzden sonra gelir.

## Görsel dil: B · Canlı

Karakterler ve ekranlar tek bir görsel dille çizilir. Geometri `src/gorsel/cizim.ts`'te,
belirteçler `src/gorsel/tema.css`'tedir. Hepsinin örneği Karakter Galerisi'dir
(`galeri.html`; oyundan bağlantı almaz).

### Görsel kod

Terimler resimdir: her özellik tek bir çizim boyutuna bağlıdır.

| Özellik | Çizim boyutu | Ünlü karakteri (72×76) | Bukalemun ek (132×82) | Kök etiketi |
|---------|--------------|------------------------|-----------------------|-------------|
| kalın / ince | gövdenin eni; bukalemunda kalınlığı | en 58 / 34, yükseklik hep 56 | yükseklik 54 / 38, en hep 92 | en/boy 58:56 / 34:56 |
| düz / yuvarlak | gövdenin biçimi | köşesi 7 yuvarlatılmış dikdörtgen / elips | köşesi 10 yuvarlatılmış dikdörtgen / elips | köşesi 4px dikdörtgen / elips |
| geniş / dar | ağız | açık yarım ay / ince yarık | sola açılan ağız / ince yarık | (gösterilmez) |

- **Renk** de kalınlığı gösterir (kalın turuncu, ince mavi), ama hiçbir zaman tek başına
  değil.
- **Bukalemun ek**, ekin yüzeydeki ilk ünlüsünün kılığına girer. -lAr'da (a/e hep düz ve
  geniş) yalnız kalınlığı ve rengi değişir; -(I)m'de (ı/i/u/ü hep dar) biçimi de değişir.
  Başı solda, köke dönük: uyum geriye bakar. Ek yazısı gövdenin ortasındadır.
- **Kök yazısı:** son ünlü bir etiketin içindedir. **Etiket, o ünlünün gövdesinin küçük bir
  kopyasıdır:** en/boy oranı karakterinkiyle aynı (kalında 58:56, incede 34:56); düzde
  köşesi 4px dikdörtgen, yuvarlakta elips. Zemini kalın ya da ince rengi, çerçevesi 2px
  mürekkep. Harf incede de sığar (30px'lik kökte etiketin boyu 1.5em). Uyuma yalnız
  kalınlık ve yuvarlaklık girer; etiket ikisini renksiz de gösterir. Genişlik (ağız)
  etikette yoktur, uyuma girmez.
- **Uymayan ek** (*ev* + *lar*): bukalemun -12 derece eğik durur (dönme noktası %45 %85);
  sonucun üstü çizili ve `--cizik` renginde.
- **Saklanan ünlü** (*kedi* + POSS.1SG → *kedim*): bukalemun zemine karışır. Gövde, ibik,
  göz tümseği, kuyruk ve bacaklar zemin renginde, dış hatları 4 3 kesik mürekkep çizgisi;
  gözü görünür kalır, üstünde yalnız *m* yazar. Biçimi uyumun seçeceği ünlününkidir (*i*).
  Ağzı çizilmez: saklanan ünlü söylenmez.
- **Ünlü kartı:** karakter ve altında harfi; zemini kalın ya da ince zemin rengi.

### Belirteçler

| Renk | Değer | Nerede |
|------|-------|--------|
| `--zemin` | #FFF6E9 | sayfa zemini, göz akı, saklanan bukalemun |
| `--murekkep` | #1E1B3A | çizgi, yazı, ünlü kartının gölgesi |
| `--soluk` | #4A4568 | ikincil yazı, ok |
| `--ayrac` | #8C87A8 | ayraç çizgileri |
| `--kalin` | #FF8A3D | kalın gövde, kalın kök etiketi |
| `--ince` | #2F80ED | ince gövde, ince kök etiketi |
| `--kalin-zemin` | #FFD6BB | kalın ünlü kartı |
| `--ince-zemin` | #B6D3F9 | ince ünlü kartı |
| `--yanak` | #FF9DB4 | yanak |
| `--cizik` | #6B6781 | uymayan sonuç |

**Renksiz mod** (renk körlüğü denetimi): `--kalin` ve `--ince` #8E8C99'a, iki zemin
#E2E1E8'e döner. Sekiz ünlü o zaman da bedenlerinden, kök etiketleri de biçimlerinden ayırt
edilmelidir.

- **Çizgi kalınlıkları:** gövde 3 · göz akı 1.5 · ibik 2.5 · kuyruk ve bacak 5 (altında
  11'lik mürekkep) · kök etiketi 2 · ünlü kartı 2.5, köşe 18.
- **Yazı tipleri:** Andika 400 ve 700 (harfler, metin); Baloo 2 800 (başlık, logo). İkisi
  de OFL-1.1 ve pakete gömülü; dış yazı tipi sunucusu yok.
- **Boyutlar:** ünlü harfi 30px · ek yazısı 20px kalın · kök 30px kalın · sonuç 22px kalın.
- **Karşıtlık:** mürekkebin ince renk üstündeki karşıtlığı 4.3:1'dir; ince renk üstüne
  18px'ten küçük yazı konmaz. Bukalemun ek yazısıyla birlikte ölçeklendiği için 0.9'dan
  küçük çizilmez (132 px'lik kutu en az 118.8 px); sığmayan dar ekranda satır kırılır.

### Üç kural

1. **Karakterler yalnız koddan, üç özellikten üretilir.** Elle çizilmiş karakter dosyası ve
   karaktere özel süs (şapka, el, eşya) yok. Yeni bir görsel öğe sekiz ünlünün hepsine aynı
   işlevle gelir.
2. **Ağız ünlü yüksekliğini gösterir, duygu göstermez.** Oyun durumu ağzı değiştirmez;
   sevinç ve üzüntü hareketle ya da eğimle anlatılır.
3. **Yalnız belirteçlerdeki renkler.** Degrade ve bulanık gölge yok; tek gölge ünlü
   kartlarının 0 4px 0 mürekkep gölgesi.

Birinci ve üçüncü kuralı `src/gorsel/kurallar.test.ts` denetler; ikincisini `cizim.ts`'in
imzası taşır: ağız yalnız üç özellikten çizilir.

## MVP bölgeleri

1. **Bukalemun Koyu** — ünlü uyumu.
2. **Fıstıkçı Şahap'ın Dükkânı** — sert ünsüzler taş, yumuşaklar jöle.
   - -DA ve -CI sertleşir: *kitapta*, *balıkçı*.
   - Ünlüyle başlayan ek gelince yumuşama olur: *kitabı*, *ağacı*, *çocuğu*.
   - Tek heceli inatçılar ayrı bir ailedir: *topu*, *saçı*.
3. **Kök Bahçesi** — yapım ekleri gövdeyi büyütür
   (*göz → gözlük → gözlükçü → gözlükçülük*); çekim ekleri tepeye meyve gibi asılır;
   meyvenin üstüne gövde çıkmaz.
4. **Uydurukçuklar** — uydurma yaratıklar (*fıngıl*, *pıtak*, *mömüş*) çoğaltılır,
   sahiplenilir, bir yere konur: *fıngıllar*, *pıtağım* ya da *pıtakım*, *mömüşte*.

## Sonraki bölgeler

- **Ayna Salonu** — *ağzım, burnum, alnım, boynum, göğsüm, omzum*.
- **Hâl Parkuru** — *eve, evde, evden*.
- **Kim Kimi Kovaladı?** — *Fareyi kedi kovaladı*; -yi silinince *Fare kedi kovaladı*
  olur ve kovalayan fare olur.
- **de/da Dedektifi** — *kitapta* / *kitap da*.
- **Dedektif Mış** — -DI / -mIş.
- **Kuş Dili Kulesi** — *kalem → kagalegem*.
- **Uzun Kelime Treni**.

## Koleksiyon ve modlar

- Her yeni kelime **Sözlük**'e kart olarak düşer.
- **1–2. sınıf:** okuma gerektirmeyen sesli mod.
- **3–4. sınıf:** parçalama ve yazım.
- **Sınıf modu:** etkileşimli tahta için.
