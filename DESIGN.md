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
| -(I)m | cebe koyar |
| -CIk | küçültür |
| -lI | katar |
| -sIz | eksiltir |
| -(y)A | gönderir |

Kök Bahçesi'nin büyüleri (halka, meyve, kartlar) kendi bölümündedir.

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
  Başı solda, köke dönük: uyum geriye bakar. Ek yazısı gövdenin ortasındadır. Süs olarak
  küçük çizilen bukalemun (haritadaki koy işareti) yazısızdır.
- **Kök yazısı:** son ünlü bir etiketin içindedir. **Etiket, o ünlünün gövdesinin küçük bir
  kopyasıdır:** en/boy oranı karakterinkiyle aynı (kalında 58:56, incede 34:56); düzde
  köşesi 4px dikdörtgen, yuvarlakta elips. Zemini kalın ya da ince rengi, çerçevesi 2px
  mürekkep. Harf incede de sığar (30px'lik kökte etiketin boyu 1.5em). Uyuma yalnız
  kalınlık ve yuvarlaklık girer; etiket ikisini renksiz de gösterir. Genişlik (ağız)
  etikette yoktur, uyuma girmez.
- **Uymayan ek** (*ev* + *lar*): bukalemun -12 derece eğik durur (dönme noktası %45 %85);
  sonucun üstü çizili ve `--cizik` renginde. Oyunda eğilme bir harekettir: bukalemun eğilir,
  düşer, kıyıya döner ("Bukalemun Koyu").
- **Birleşen ek** (*at* + *lar*): ek, bukalemunun renginde bir kutuda kalır; çerçevesi 2px
  mürekkep, düzde köşeli, yuvarlakta hap biçiminde. Kutu ekin sınırını gösterir. Yazısı
  mürekkep, kökle aynı boyda. **Ekin ünlüsü kök etiketiyle aynı etikettedir:** kalında geniş,
  incede dar; düzde köşeli, yuvarlakta elips. Uyum, kökteki ve ekteki iki etiketin aynı ende
  olmasından okunur; bu yüzden Renksiz'de de görünür (renk gider, en kalır).
  - Sonuç kelimesinde kökün son ünlüsü de etiketindedir: *toplarım*'da *o*, *a* ve *ı* üç
    etikettir; zincirde her etiket bir öncekiyle aynı endedir.
  - Ekte birden çok ünlü varsa her biri etikettedir (-lArI'da *ları*: *a* da *ı* da).
    Saklanan ünlü (*kedi* + *m*) etiket almaz: söylenmez.
  - Bukalemun Koyu'ndaki sonuçta (kelime kartı, cep), Sözlük kartlarında ve akşam ekranında
    böyledir. Etiket yazının boyundadır: kökte 30px, sonuçta 22px, Sözlük'te 20px; cebin
    önünde 18px (cebin ağzına sığsın; ince renk üstünde en küçük boy).
- **Saklanan ünlü** (*kedi* + POSS.1SG → *kedim*): bukalemun zemine karışır. Gövde, ibik,
  göz tümseği, kuyruk ve bacaklar zemin renginde, dış hatları 4 3 kesik mürekkep çizgisi;
  gözü görünür kalır, üstünde yalnız *m* yazar. Biçimi uyumun seçeceği ünlününkidir (*i*).
  Ağzı çizilmez: saklanan ünlü söylenmez.
- **Ünlü kartı:** karakter ve altında harfi; zemini kalın ya da ince zemin rengi.

### Ünsüz karoları

Fıstıkçı Şahap'ın Dükkânı'nda sınırdaki ünsüz bir karodur. Terimler resimdir: **sert ünsüz
taş, yumuşak ünsüz jöle.** Bölgenin adı sert ünsüzlerin okul hatırlatıcısıdır: FıSTıKÇı ŞaHaP
= f s t k ç ş h p.

| Karo | Biçim | İz | Renk | Tür |
|------|-------|----|------|-----|
| taş | köşeleri yontulmuş bir çokgen | kısa bir çatlak (`--cizik`) | `--tas` | sert |
| jöle | yuvarlak bir damla | küçük bir parıltı (`--zemin`) | `--jole` | yumuşak |

- **Kutu 72×72.** İkisinin de çizgisi 3 mürekkep; harf ortada, 30px Andika kalın. Geometri
  `src/gorsel/karo.ts`'te (saf, `cizim.ts` gibi DOM'suz), bileşen `Karo.tsx`'te.
- **Biçim ayırır, renk pekiştirir:** Renksiz'de iki karo aynı gridir, çokgen ve damla yine
  ayrılır.
- **Kalın ve ince renkleri karolarda kullanılmaz;** onlar ünlülerindir.
- **Erişilebilir ad:** harf ve türü (*p, sert*; *b, yumuşak*).
- **Tezgâhta** taş hep solda, jöle hep sağda; altlarında küçük yazıyla türleri: *sert* /
  *yumuşak*.
- **Haritadaki işaret:** yan yana küçük bir taş ve bir jöle karosu (0.375 ölçek, 27 px),
  yazısız; süstür, adı düğmenin yazısıdır.

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
| `--deniz` | #CFE8E0 | ada haritasında deniz |
| `--kara` | #F4E6C8 | ada haritasında kara; kilitli ve hazırlanan bölgenin tabelası; bahçenin tabelası |
| `--tas` | #B3ADA4 | ünsüz karosu: taş (sert ünsüz) |
| `--jole` | #BFE9CF | ünsüz karosu: jöle (yumuşak ünsüz) |
| `--govde` | #D9B48F | Kök Bahçesi: ağacın kökü ve gövde halkaları |
| `--yaprak` | #A8D5A2 | Kök Bahçesi: ağacın tacı |

`--yanak` Uydurukçuklar'ın yıldızında da kullanılır; `--zemin` yaratığın boynuzunda ve
beneğinde.

Kalın ve ince renkleri (ve zeminleri) yalnız dilbilgisel anlam taşır: süste, haritada ya da
arayüzde kullanılmaz. Haritada bukalemun gibi dilbilgisel bir figür kendi renginde durabilir.
Ünsüz karolarında da kullanılmazlar: onlar ünlülerin; karo taş ya da jöle rengindedir. Ağaçta
yalnız ek yazılarında kalırlar; kök, halka ve taç gövde ve yaprak rengindedir.

**Renksiz mod** (renk körlüğü denetimi): `--kalin` ve `--ince` #8E8C99'a, iki zemin,
`--tas`, `--jole`, `--govde` ve `--yaprak` #E2E1E8'e döner. Sekiz ünlü o zaman da
bedenlerinden, kök etiketleri de biçimlerinden, taş ve jöle de biçimlerinden (çokgen ve damla),
halka ve meyve de biçimlerinden (bant ve daire) ayırt edilmelidir. Ayarlar'daki Renksiz bunu bütün oyuna uygular (`html[data-renkler="renksiz"]`);
büyüden sonra da gri kalır.

- **Çizgi kalınlıkları:** gövde 3 · göz akı 1.5 · ibik 2.5 · kuyruk ve bacak 5 (altında
  11'lik mürekkep) · kök etiketi 2 · ünlü kartı 2.5, köşe 18 · ünsüz karosu 3, taşın çatlağı
  2.5 · ağaç (kök, halka, taç, meyve) 3.
- **Yazı tipleri:** Andika 400 ve 700 (harfler, metin); Baloo 2 800 (başlık, logo). İkisi
  de OFL-1.1 ve pakete gömülü; dış yazı tipi sunucusu yok.
- **Boyutlar:** ünlü harfi 30px · ek yazısı 20px kalın · kök 30px kalın · sonuç 22px kalın.
- **Karşıtlık:** mürekkebin ince renk üstündeki karşıtlığı 4.3:1'dir; ince renk üstüne
  18px'ten küçük yazı konmaz. Bukalemun ek yazısıyla birlikte ölçeklendiği için 0.9'dan
  küçük çizilmez (132 px'lik kutu en az 118.8 px); sığmayan dar ekranda satır kırılır.
  Tek ayrık durum haritadaki koy işaretidir: süstür, adı düğmenin yazısıdır. Ek yazısı o boyda
  okunmayacağı için yazısız çizilir, 0.42 ölçekle.

### Üç kural

1. **Karakterler yalnız koddan, üç özellikten üretilir.** Elle çizilmiş karakter dosyası ve
   karaktere özel süs (şapka, el, eşya) yok. Yeni bir görsel öğe sekiz ünlünün hepsine aynı
   işlevle gelir. Uydurukçuklar'ın yaratığının süsleri (boynuz, benek) bu kurala uyar: kökten
   gelirler, sekiz ünlünün hepsine aynı işlevle eklenirler, özellikleri değiştirmezler.
2. **Ağız ünlü yüksekliğini gösterir, duygu göstermez.** Oyun durumu ağzı değiştirmez;
   sevinç ve üzüntü hareketle ya da eğimle anlatılır.
3. **Yalnız belirteçlerdeki renkler.** Degrade ve bulanık gölge yok; tek gölge ünlü
   kartlarının 0 4px 0 mürekkep gölgesi.

Birinci ve üçüncü kuralı `src/gorsel/kurallar.test.ts` denetler; ikincisini `cizim.ts`'in
imzası taşır: ağız yalnız üç özellikten çizilir.

## Bukalemun Koyu

İlk oyun ekranı: ünlü uyumu. Ekranın ortasında kelime kartı, altındaki kıyıda bukalemunlar,
ekranın en altında bir cep. Görevler `icerik/gorevler/bukalemun-koyu.csv`'dedir (kök, ekler,
renksiz); doğru biçim görev dosyasına yazılmaz, motordan gelir (`olasiBicimler`, `ekle`).

- **Seçenekler:** ekin bukalemunları, yani arkafonemin yüzeydeki bütün kılıkları: -lAr için
  *lar, ler*; -(I)m için *ım, im, um, üm*. Kılıkları motor verir (`yuzeySecenekleri`).
  Sıraları her görevde karışık ama sabit tohumlu.
- **Taşıma:** sürükle-bırak, dokun-dokun (önce bukalemun, sonra kelime) ya da klavye (Tab ve
  Enter). Dokunma alanları en az 44 px.
- **Doğruysa büyü:** kökteki ünlünün etiketi ile bukalemun arasında bir yay parlar, bukalemun
  sevinçle zıplar, kelime birleşir ve ek bukalemunun renginde kalır. Anlam resimsiz görünür:
  çoğulda kelime kartı üçe çoğalır, iyelikte ekranın altındaki cebe girer.
- **Zincir** (*top* + PL + POSS.1SG): ilk ek tutunca gövde *toplar* olur, etiket son ünlüye
  (*a*) geçer; sonra iyeliğin bukalemunları gelir.
- **Yanlışsa:** bukalemun eğilir, düşer, kıyıya döner. Kelimenin altında denenen biçim ve
  nedenin cümlesi görünür. Denenen biçim uymayan sonuçtur: üstü çizili ve `--cizik` renginde;
  ilgili iki ünlü etiketindedir, çizgi etiketlere geçmez. Ceza, puan ve süre yok.
- **Renksiz görev:** kalın ve ince aynı gri; bedenler ve kulak yeter. Büyü olunca renkler
  geri gelir (Ayarlar'da Renksiz açıksa gelmez).
- **Hareket azaltma** açıksa (cihazda ya da Ayarlar'da) hiçbir şey hareket etmez; yalnız renk
  ve yazı değişir.
- **Üst çubuk:** Harita düğmesi (harita simgesi), bölgenin adı, görev sırası ("3 / 10").
- **Sürdürme:** her görev bitince ilerleme kaydedilir; koya dönen çocuk kaldığı görevden
  sürdürür. Tur bitince sonraki giriş baştan başlar.
- **Kapanış:** görevler bitince koyda akşam olur: ortak akşam ekranı ("Akşam ekranı").

### Yanlış biçimin nedeni

Motorun `neden(kok, etiketler, parcalar, govde = kok)` işlevi, her ek için seçilen yüzeyleri
(*lar*, *um*) ve gövdeyi alır. Gövde kökün kendisidir ya da gövde sınırında yumuşamış hâli
(*kitab*). Aday, gövde ile seçilen yüzeylerin art arda yazılmasıdır. Aday `olasiBicimler`
içindeyse neden yoktur. Değilse sırayla üç şey sınanır; bulunan nedenler bu sırayla dizilir:

1. **Gövde sınırı** (Fıstıkçı Şahap'ın Dükkânı): kökün son ünsüzü taş mı, jöle mi? Taş
   seçildi, jöle olmalıydı: *yumuşama* (*kitapım*). Jöle seçildi, taş olmalıydı: tek heceli
   kökte *inatçı* (*tobum*), çok heceli kökte *yumuşamaz* (*sepedi*).
2. **Ek başı:** önce kaynaştırma: (y), (n) ve (s) ile başlayan ekte kaynaştırmalı ve
   kaynaştırmasız yüzey de kılıktır (*zelü* + *ye* / *e*). Ayraçlı ünsüz adayda önceki sese göre
   beklenir (yerel): ünlüden sonra girer, ünsüzden sonra girmez. Girmedi, girmeliydi ya da
   girdi, girmemeliydi: *kaynaştırma* (*zelüe*, *fıngılya*). Sonra D ve C, yine önceki sese
   göre: sert ünsüzden sonra taş, değilse jöle. Jöle seçildi, taş olmalıydı: *sertleşme*
   (*kitapda*). Taş seçildi, jöle olmalıydı: *yumuşak* (*evte*, *suçu*).
3. **Ünlü uyumu:** ekler soldan sağa yerel uyumla sınanır: ekin ünlüsü, adayda kendinden önceki
   son ünlüye göre beklenir ve seçilenle karşılaştırılır; uyuşmayan özellikler (kalınlık,
   yuvarlaklık) yazılır. Yerel sınama yüzünden *toplerim* yalnız çoğulun kalınlığını alır:
   *im*, önündeki *e*'ye uyduğu için suçlanmaz.

Hiçbiri bulunamazsa (istisna: *saatlar*; ünlü düşmesi: *ağızım*) tek neden "diğer"dir.
Sözleşmeleri `tests/neden.csv` (uyum), `tests/neden-unsuz.csv` (gövde ve ek başı) ve
`tests/neden-kaynastirma.csv`'dir (kaynaştırma).

Çocuğa yalnız ilk nedenin cümlesi gösterilir (`nedenCumlesi`); önce bakılan ünlü, sonra
seçilen:

| Uyuşmayan | Cümle |
|-----------|-------|
| kalınlık | *e ince, a kalın. Kalınlıkları uyuşmuyor.* |
| yuvarlaklık | *o yuvarlak, ı düz. Yuvarlaklıkları uyuşmuyor.* |
| ikisi | *ö ince ve yuvarlak, ı kalın ve düz. İkisi de uyuşmuyor.* |

Bakılan ünlü kökte değil de önceki bir ekteyse sona *Bukalemun en yakın ünlüye bakar.*
eklenir (*toplarim*). "Diğer" için cümle henüz yoktur.

Gövde ve ek başı nedenlerinin cümleleri; harfler ve kök görevden gelir. Cümleler okulun
sözcükleriyle (sert, yumuşak) konuşur; taş ve jöle karoların resmidir, cümleye girmez:

| Neden | Cümle |
|-------|-------|
| yumuşama | *Ek ünlüyle başlayınca p yumuşar: b olur.* |
| inatçı | *top inatçıdır: p yumuşamaz.* |
| yumuşamaz | *sepet kelimesinde t yumuşamaz.* |
| sertleşme | *p sert, ekin başı da sert olur: t.* |
| yumuşak | *v yumuşak, ekin başı da yumuşak kalır: d.* Önceki ses ünlüyse: *Ünlüden sonra ekin başı yumuşak kalır: c.* |
| kaynaştırma (eksik) | *İki ünlü yan yana gelmez: araya y girer.* (n ve s'de harf değişir) |
| kaynaştırma (fazla) | *Ünsüzden sonra araya y girmez.* |

## Fıstıkçı Şahap'ın Dükkânı

İkinci bölge: ünsüzler. Bu bölgede çocuk ünlüyü değil, sınırdaki ünsüzü seçer: taş mı, jöle
mi ("Ünsüz karoları")? Görevler `icerik/gorevler/fistikci-sahap.csv`'dedir (sıra, kök, ekler);
doğru karo görev dosyasına yazılmaz, motordan gelir (`sinirSecenekleri`, `neden`).

- **İki tür sınır:**
  - **Gövde sınırı (yumuşama):** kök p, ç, t ya da k ile biter, ek ünlüyle başlar. *kita_ım*:
    p (taş) mı, b (jöle) mi? Sözlükteki kökte sözlük işaretine bağlıdır (*kitabım*, *topum*);
    uydurma kökte iki karo da doğrudur (*pıtakı*, *pıtağı*).
  - **Ek başı (benzeşme):** ek D ya da C ile başlar. *kitap_a*: t (taş) mı, d (jöle) mi? Her
    kökte kurala bağlıdır: sert ünsüzden sonra taş.
  - Görev tablosundaki her görevin tam bir sınırı vardır (test denetler).
- **Ekran:** Bukalemun Koyu'nun kabuğu aynen: üst çubuk, sürdürme, Sözlük kartı, akşam ekranı
  (*Dükkânda akşam oldu*). Kelime ortada bir kartta; sınır boş bir yuvadır (kesik çerçeve).
  Ek birleşen ek görünümündedir; ek başının yuvası ekin kutusunun içindedir. Bu bölgede çocuk
  ünlüyü seçmez. Altta tezgâh (taş solda, jöle sağda) ve dükkânın rafı.
- **Taşıma:** sürükle-bırak, dokun-dokun (önce karo, sonra kelime) ya da klavye (Tab ve
  Enter). Dokunma alanları en az 44 px.
- **Doğruysa** karo yuvaya oturur, kelime dükkânın rafına dizilir. Ses değişiyorsa değişim
  görünür: yumuşamada yuvada önce kökün taşı durur, jöleye erir (*kitap → kitabım*);
  benzeşmede önce ekin jölesi durur, taşa döner (*-da → kitapta*). Değişim kelimenin altında da
  yazılır. Değişmiyorsa (*topum*, *evde*) karo yalnız yerine oturur.
- **Yanlışsa** karo yuvanın üstünde seker ve tezgâha döner. Kelimenin altında denenen biçim
  (üstü çizili, `--cizik`) ve nedenin cümlesi görünür; ilgili iki ses vurgulanır: ünlü
  etiketinde, ünsüz çerçevede (gövdede seçilen ünsüz ve ardındaki ünlü; ek başında önceki ses
  ve seçilen ünsüz). Ceza, puan ve süre yok.
- **Raf:** bu turda kurulan kelimeler, sırayla. İki sıranın yeri boşken de ayrılmıştır.
- **Hareket azaltma** açıksa hiçbir şey hareket etmez; yalnız durum değişir.

## Kök Bahçesi

Üçüncü bölge: yapım ve çekim. Terimler resimdir: **yapım eki gövdeyi bir halka büyütür, çekim
eki tepeye meyve gibi asılır; meyvenin üstüne gövde çıkmaz.** Görevler
`icerik/gorevler/kok-bahcesi.csv`'dedir (sıra, kök, ekler); hedef, yüzeyler ve gövde kelimeleri
görev dosyasına yazılmaz, motordan gelir (`ekle`, `ekSirasiHatasi`). Her görevde en az bir
yapım, en çok bir çekim eki vardır ve çekim en sondadır (test denetler).

- **Ek sırası** (motor, `src/motor/sira.ts`): önce yapım ekleri (kendi aralarında serbest), sonra
  en çok bir çoğul, sonra en çok bir iyelik, en sonda en çok bir hâl eki (ACC, DAT, LOC, ABL,
  GEN, INS). Soldan sağa ilk bozukluk döner: çekimden sonra gelen yapım eki `meyve:<ETİKET>`;
  çekimlerin sırası ya da tekrarı bozuksa `çekim:<ETİKET>`. `ekle` ve `olasiBicimler` sırası
  bozuk dizide hata atar. Sözleşmesi `tests/ek-sirasi.csv`'dir.
- **Ekran:** kabuk Bukalemun Koyu'nunki aynen (üst çubuk, sürdürme, akşam ekranı: *Bahçede
  akşam oldu*). Solda ağaç, sağında tabela (hedef kelime: *gözlükçüler*) ve kelimenin o anki
  hâli (*göz*, *gözlük* ...); ağacın altında düşen kartlar, en altta sepet. Bu bölgede çocuk
  ünlü ya da ünsüz seçmez: ekin kılığını motor verir.
- **Sepet:** hedefin ekleri bukalemun olarak, motorun yüzeyleriyle (*lük, çü, ler*), sabit
  tohumla karışık sırada; sıradaki ek hep aynı yerde durmaz (test denetler).
- **Taşıma:** sürükle-bırak, dokun-dokun (önce ek, sonra ağaç) ya da klavye (Tab ve Enter).
  Dokunma alanları en az 44 px.
- **Doğruysa** (sıradaki ek): yapım eki gövdeye bir halka ekler, yeni kelime kart olarak düşer
  (gövde kelimesi); çekim eki meyve olur, tepeye asılır, kart düşürmez.
- **Yanlışsa** ek dala tutunamaz, sallanır ve sepete döner; cümlesi görünür. Ceza, puan ve süre
  yok. Cümlelerde ekler ve hedef görevden gelir:

| Neden | Ne zaman | Cümle |
|-------|----------|-------|
| meyve | çekim eki seçildi, geride yapım eki var (`ekSirasiHatasi` kurulan + seçilen + kalanlar dizisinde `meyve:` verir) | *Meyvenin üstüne gövde çıkmaz: önce çi.* |
| önce | başka bir yapım eki seçildi | *yolculuk: önce cu, sonra luk.* |

- **Büyüler** (resimsiz, kartlarla; büyü düşen kartta görünür, Sözlük'teki kartlar olağan
  boyda):

| Ek | Büyü |
|----|------|
| yapım eki | gövdeye bir halka; yeni kelime kart olarak düşer |
| -CIk | küçültür: düşen kart küçüktür |
| -lI | katar: önceki gövdenin (kökün) küçük kartı yeni kartın üstüne konur (*tat → tatlı*) |
| -sIz | eksiltir: önceki gövdenin küçük kartı silinir, yerinde kesikli boş çerçeve kalır (*ses → sessiz*) |
| -lIk, -CI | yalnız halka ve kart |
| -lAr | meyve üç olur |
| -(I)m | meyve cebe girer (Koy'daki cep) |

  - Meyve gövdenin sonundaki k'yi ğ yapar: Dükkân'daki gibi taş jöleye erir, altında yazılır
    (*kalemlik → kalemliğim*).
- **Kartlar:** bahçede kart yalnız gövdeden düşer: Sözlük'te *çiçekçi* var, *çiçekçiler* yok.
  Akşam ekranında bugün düşen kartlar görünür.
- **Hareket azaltma** açıksa hiçbir şey hareket etmez; yalnız durum değişir.
- **Sığma:** en yüksek ağaç (*gözlükçüler*: iki halka, üç meyve) 360×640'ta ve 320×568'de
  kaydırmadan sığar.

### Ağaç

Ağaç koddan çizilir (`src/gorsel/agac.ts`, saf; bileşeni `Agac.tsx`). Aşağıdan yukarı:

| Parça | Biçim | Renk | Üstünde |
|-------|-------|------|---------|
| kök | gövdenin dibi, iki yana açılan kökler (132×52) | `--govde` | kökün yazısı (`KokYazisi`, 24px) |
| halka | üst ve alt kenarı hafifçe kavisli yatay bant (96×40); halkalar üst üste | `--govde` | ekin yazısı, birleşen ek görünümünde (20px) |
| taç | yuvarlak (148×84) | `--yaprak` | meyveler, tacın alt ucunda |
| meyve | sapıyla bir daire (48×54, yarıçap 21) | `--zemin` | ekin yazısı (18px) |

- Çizgiler 3 mürekkep. **Kalın ve ince renkleri yalnız ek yazılarında kalır.**
- **Biçim ayırır, renk pekiştirir:** halka bant, meyve daire; Renksiz'de de ayrılırlar.
- **Haritadaki işaret:** küçük bir ağaç (gövde ve yuvarlak taç, 30×34), yazısız; süstür, adı
  düğmenin yazısıdır.

## Uydurukçuklar

Dördüncü bölge: uydurma kelime kanıttır (wug). Her görevde adı uydurma bir kök olan bir yaratık
var (*fıngıl*, *pıtak*, *zelü*); çocuk Bukalemun Koyu'ndaki gibi doğru bukalemunu yaratığa
taşır. Görevler `icerik/gorevler/uydurukcuklar.csv`'dedir (tur, sıra, kök, ekler; 10 tur × 10
görev); doğru biçim görev dosyasına yazılmaz, motordan gelir. Her turda aynı on görev şekli
vardır (test denetler).

| Ek | Görev | Kılıklar | Büyü (resimsiz) |
|----|-------|----------|-----------------|
| -lAr | çoğalt | *lar, ler* | yaratık üçe çoğalır |
| -(I)m | sahiplen | *ım, im, um, üm* | yaratık cebe girer (Koy'daki cep) |
| -DA | bir yere koy | *da, de, ta, te* | küçük bir yıldız yaratığın üstünde durur (bulunma) |
| -(y)A | ona gönder | *ya, ye, a, e* | yıldız yaratığa doğru uçar (yönelme); ardında kesik bir iz |

- **Yalnız kategorik kurallar puanlanır:** ünlü uyumu, benzeşme, kaynaştırma (`neden`). Kıyıya
  `neden`'in kabul ettiği bütün kılıklar gelir: -(y)A'da kaynaştırmalı ve kaynaştırmasız,
  -DA'da D yuvasının taşı ve jölesi (*mömüş* + *de*: *ş sert, ekin başı da sert olur: t.*).
  Seçeneklerin sırası sabit tohumla karışıktır (Koy'daki gibi).
- **Sınır adımı:** kök p, ç, t ya da k ile bitip iyelik alınca doğru bukalemun oturduktan sonra
  Dükkân'ın tezgâhı gelir (taş solda, jöle sağda). İki karo da doğrudur (Becker, Ketrez &
  Nevins 2011); cümle: *İkisi de olur: pıtakım, pıtağım.* Jöle seçilirse kökün taşı erir.
  Kurulan biçim çocuğun seçtiğidir; Sözlük kartı onu saklar.
- **Yanlışsa** bukalemun düşer, kıyıya döner; denenen biçim üstü çizili, ilgili iki ses vurgulu
  (ünlü etiketinde, ünsüz çerçevede), altında cümle. Ceza, puan ve süre yok.
- **Turlar:** yarım kalan tur kaldığı yerden sürer. Tur bitince akşam olur (*Uydurukçuklarda
  akşam oldu*); bölgeye sonraki girişte bir sonraki tur gelir, 10. turdan sonra 1. tura
  dönülür. Tur kayıttadır: kalınan yer bütün tablodaki yerdir (10: 2. turun başı). Bölge ilk
  tur bitince tamam sayılır.
- **Kabuk** öteki bölgelerinki aynen: üst çubuk (sıra turdaki: *3 / 10*), sürdürme, akşam
  ekranı. Taşıma sürükle-bırak, dokun-dokun (önce bukalemun ya da karo, sonra yaratık) ya da
  klavye (Tab ve Enter). Dokunma alanları en az 44 px.
- **Hareket azaltma** açıksa hiçbir şey hareket etmez; yıldız, kopyalar ve cep hemen yerinde.
- **Sığma:** en kalabalık görev (dört bukalemun ve cep) 360×640'ta ve 320×568'de kaydırmadan
  sığar; alçak ekranda yaratık küçülür.

### Yaratık

- **Yaratık adındaki son ünlünün karakteridir** ("Ünlü karakterleri"): *pıtak* kalın, düz,
  geniş; *zelü* ince, yuvarlak, dar. Büyük boy (1.8 ölçek; alçak ekranda küçülür). Adı altında,
  kök yazısıyla (son ünlüsü etikette).
- **Süsler kökten gelir:** kök başına sabit tohumlu (FNV-1a) küçük boynuz (yok, iki ya da tek)
  ve benekler (0, 2 ya da 3; en az bir süs var). Geometri `src/gorsel/yaratik.ts`'te (saf,
  `cizim.ts`'in sayılarına dokunmaz). Süs sekiz ünlünün hepsine aynı işlevle gelir; karakterin
  üç özelliğini değiştirmez; gözlere ve ağza değmez.
- **Ağız hiçbir zaman değişmez** (üç kural).
- **Renkler:** boynuz krem, mürekkep çizgili (ibik gibi); benek krem; yıldız `--yanak`,
  mürekkep çizgili. Kalın ve ince renkleri süste kullanılmaz; gövde ünlünün rengindedir.
- **Haritadaki işaret:** küçük bir yaratık (ilk görevin yaratığı, *fıngıl*; 0.42 ölçek), yazısız.
- **Sözlük kartı:** uydurma kelimenin (kökü sözlükte olmayan) kartının köşesinde küçük bir
  yaratık işareti; ekran okuyucuya *Uydurma kelime*.

### Uydurma kök denetimi

Motorun `uydurmaDenetimi(kok)` işlevi sırayla sınar, ilk bozukluğu döner (sözleşmesi
`tests/uydurma-denetimi.csv`; görev tablosunun 100 kökü de geçer):

1. **ses:** iki hece; ilk ses *b c ç d f g h k m n p s ş t v y z*'den biri; ilk hece ünsüz +
   ünlü; iki ünlü arasında bir ya da iki ünsüz (ikiyse ilki *l r n m s ş z y*'den biri, ikisi
   aynı değil, n'den sonra b ya da p yok); sonda ünlü ya da *p ç t k s ş z l r m n y*'den tek
   bir ünsüz; ikinci hecede o ve ö yok; iki hece aynı ünsüz ve ünlüyle başlamaz; ğ ve j yok.
   Kök içi ünlü uyumu aranmaz (*zelü* en yakın ünlü kuralını sınar).
2. **sözlük:** kök sözlükte.
3. **yasak:** kök ya da oyun biçimleri (PL, POSS.1SG, LOC, DAT, ACC) yasaklı bir dizi içerir
   (`icerik/yasakli-diziler.csv`); "başta" dizileri yalnız kökün başında aranır.
4. **ek:** kök, başka bir kök ile envanterdeki bir ekin en az iki harflik yüzeyi gibi okunur
   (*kuş + lar*).

Aday kökleri `scripts/uydurma-uret.mjs` üretir (tohumlu, aynı kurallarla; gerçek kelimeler
zeyrek'le elenir). Çıktı yalnız bir aday dosyasıdır: oyuna kök kullanıcının onayıyla girer.

## Ada haritası

Açılış ekranıdır; başlığı *Morfemusta Adası*. Bölgeler `icerik/bolgeler.csv`'dedir (sıra,
kimlik, ad, akşam, görev tablosu); görev tablosu boş olan bölgenin içeriği henüz yoktur.

- **Çizim süstür:** kodla çizilmiş bir SVG, ekran okuyucudan gizli. Deniz, kara, kıyıda krem
  bir köpük şeridi, dalgalar, ikişer ağaç ve bölgeleri sırayla bağlayan noktalı yol. Sol altta
  koy, denizin girdiği yer.
- **Bölgeler gerçek düğmelerdir:** tablodaki sırayla, sıralı bir listede, yol boyunca dizili.
  Her düğme bir tabeladır: bölgenin adı, altında durumu. Düğmenin adı görünen yazının
  aynısıdır (*Bukalemun Koyu, Açık*).
- **Kilit:** bir bölge, öncekinin bir turu bitince açılır: tursuz bölgede bütün görevleri en az
  bir kez, Uydurukçuklar'da ilk turu. İlk bölge hep
  açıktır; içeriği olmayan bölge bitmez, ardındaki bölge kilitli kalır.
- **Durum yalnız renkle verilmez;** simge ve yazıyla da görünür:

| Durum | Simge | Tabela | Dokununca |
|-------|-------|--------|-----------|
| açık | üçgen | düz çerçeve, krem | bölgeye girilir |
| tamam | tamam işareti | düz çerçeve, krem | bölgeye girilir (yeni tur) |
| kilitli | kilit | kesik çerçeve, kara, soluk yazı | *Önce Fıstıkçı Şahap'ın Dükkânı bitmeli.* |
| hazırlanıyor | kum saati | kesik çerçeve, kara, soluk yazı | *Burası hazırlanıyor. Yakında açılacak.* |

- **İleti** başlığın altında, bir balonda yazılır. Yeri boşken de ayrılmıştır: ileti gelince
  harita kaymaz, çocuğun sonraki dokunuşu yerini şaşırmaz.
- **İşaretler:** Bukalemun Koyu'nun işareti küçük bir bukalemundur: koyun ilk görevinin
  bukalemunu (*at* + *lar*). Fıstıkçı Şahap'ın Dükkânı'nınki yan yana küçük bir taş ve bir jöle
  karosudur, yazısız. Kök Bahçesi'ninki küçük bir ağaçtır, yazısız. Uydurukçuklar'ınki küçük bir
  yaratıktır, yazısız.
- **Renkler:** deniz, kara, krem, mürekkep, soluk ve ayraç. Kalın ve ince renkleri kullanılmaz;
  yalnız bukalemun ve karolar, dilbilgisel figürler olarak kendi renklerindedir. Gölge ve
  degrade yok.
- **Sığma:** harita 360×640'ta kaydırmadan sığar (320×568'de de). Çizim ve düğmeler, kalan
  alana en/boy oranı korunarak sığan bir kutudadır; düğmeler üst üste binmez.

### Gezinme

- **Alt gezinme:** Harita, Sözlük, Ayarlar; simge ve yazıyla, dokunma alanı en az 44 px.
  Açık ekranın öğesi dolu ve `aria-current`. Bu üç ekranın altında durur; bölge ekranında
  yoktur: oyun ekranı bütün yüksekliği kullanır, haritaya üst çubuktaki Harita düğmesiyle
  dönülür.
- **Adresler** (hash): `#/` harita, `#/bolge/<kimlik>`, `#/sozluk`, `#/ayarlar`. Açılmamış ya
  da içeriği olmayan bölgenin adresi haritaya döner.
- **Geri tuşu:** harita köktür. Bölgeden, Sözlük'ten ve Ayarlar'dan geri tuşu haritaya,
  haritadan oyunun dışına götürür. Alt gezinmedeki geçişler geçmişi büyütmez (Android'in alt
  gezinme düzeni); Harita düğmesi de geri gider.

## Sözlük

Doğru kurulan her kelime Sözlük'e kart olarak düşer: görevin kelimesi, görev bitince
(zincirde *toplarım*; ara gövde *toplar* kart olmaz). Kök Bahçesi'nde tersine, kart yalnız
gövdeden düşer: her yapım adımının kelimesi (*çiçekçi*; *çiçekçiler* değil).

- **Kart:** kelime; kök ve ekler, ekler birleşen ek görünümünde, aralarında artı
  (*top* + **lar** + **ım**); bölge; tarih (kelimenin o bölgede ilk kurulduğu gün).
- **Tekrar:** aynı kelime aynı bölgeden ikinci kez kart olmaz; başka bölgede kurulursa ayrı
  karttır.
- **Ekran:** kartlar bölgelere göre gruplu, bölge tablosunun sırasıyla; her grupta en yeni
  kart önde.
- **Boşsa:** *Sözlüğün henüz boş. Bir kelime kurunca kartı buraya gelir.*
- Kartta kelime, kök ve ek etiketleri saklıdır; ekler her açılışta motordan gelir. Kelime
  motorun kabul ettiği biçimlerden biridir: uydurma kökte çocuğun seçtiği (*pıtağım* ya da
  *pıtakım*; ikisi ayrı karttır).

## Akşam ekranı

Bölge turunun sonundaki kapanış kartıdır; bütün bölgelerin ortak bileşeni. Adada akşam
olması doğal duraktır ("İlkeler": kısa oturum, doğal durak).

- **Başlık** bölge tablosunun akşam sütunundan: *Koyda akşam oldu*.
- Altında *Bugün kurduğun kelimeler:* ve o bölgede bugün kurulan kelimeler, kurulma sırasıyla,
  ekleri birleşen ek görünümünde. Bugün kurulan, dün kart olup bugün yeniden kurulanı da
  kapsar.
- **Tek düğme:** *Haritaya dön*. Puan, seri ve süre yok.

## Ayarlar

- **Ses:** *Kapalı* / *Dokununca* / *Sesli mod*; varsayılan Dokununca ("Ses ve resim").
- **Hareket:** *Sistem gibi* (cihazın hareket azaltma ayarına uyar) / *Azalt*
  (`prefers-reduced-motion` ile aynı davranır: hiçbir şey hareket etmez).
- **Renkler:** *Renkli* / *Renksiz* (galerideki Renksiz mod; açıkken renkler büyüden sonra
  da gri kalır). Yanında kalın *a* ile ince *e* etiketi örnek olarak durur.
- **İlerlemeyi sıfırla:** uygulamanın içinde iki adım: *Bütün ilerleme ve kartlar silinecek.*
  *Vazgeç* / *Sil*. Tarayıcının onay penceresi kullanılmaz; odak önce Vazgeç'tedir. Ayarlar
  silinmez.
- Seçimler büyük, dokunması kolay radyo düğmeleridir; seçili olan dolu ve halkası kalındır.
- **Hakkında:** kodun (MIT), seslerin (Google Cloud Text-to-Speech, Chirp 3: HD Callirrhoe; MIT
  ses dosyalarını kapsamaz), emojilerin
  (Twemoji, CC BY 4.0) ve yazı tiplerinin (OFL-1.1) lisansı ve atfı. Bağlantı yok.

## Cihazda ilerleme

- İlerleme, kartlar ve ayarlar yalnız cihazda, `localStorage`'da, sürüm numaralı tek anahtarda
  durur: `morfemusta.v1`. Hiçbir veri cihazdan çıkmaz; hesap, sunucu, eşitleme yok.
- Her görev bitince kaydedilir; ayar değişince de. Bölgeye dönen çocuk kaldığı görevden
  sürdürür.
- Bozuk kayıttan yalnız geçerli parçalar alınır; gerisi baştan başlar. Depo yoksa ya da
  erişilemiyorsa oyun bellekte sürer; hata ve konsol iletisi çıkmaz.
- Aynı cihazda açık pencereler (tarayıcıdaki sekme, ana ekrandaki uygulama) aynı kaydı paylaşır.
  Her değişiklikte son kayıt yeniden okunur, değişiklik onun üstüne uygulanır: önce açılmış bir
  pencere sonrakinin ilerlemesini, kartlarını ve ayarlarını ezmez. Biten görevler ve kartlar
  birleşir; ayarda yalnız değişen alan yazılır; sıfırlama yine her şeyi siler (ayarlar kalır).
  Bir pencerede olan öteki pencerede de hemen görünür. Bölge ekranı açıkken başka pencere o
  bölgenin ilerlemesini değiştirirse (görev, sıfırlama) ekran kalınan yerden yeniden açılır,
  sıfırlamadan sonra baştan; ayar değişikliği oyunu kesmez.
- Sıfırlama geri alınmaz. Kayıtta bir sıfırlama kimliği var; her sıfırlamada artar. Bölge
  ekranı açılırken kimliği alır, görev bitince yazmadan önce karşılaştırır. Farklıysa ekran
  açıkken ilerleme sıfırlanmıştır: hiçbir şey yazılmaz, ekran baştan açılır.
- Tarayıcı destekliyorsa ilk kayıttan sonra kalıcı depo istenir
  (`navigator.storage.persist()`): yer darlığında kayıt silinmesin.

## Ses ve resim

Okumayı henüz sökmemiş 1–2. sınıf çocuğu oyunu yalnız dinleyerek oynayabilmelidir ("Koleksiyon ve
modlar"). Sesler önceden üretilir ve cihazda çalar; hiçbir şey cihazdan çıkmaz. Resim, kelimenin
ne olduğunu okumadan gösterir.

### Ses

- **Ne söylenir:** oyunun söyleyebileceği her metin önceden bellidir (`sesMetinleri`, bölge
  bölge): her görevin kökü (Bahçe'de hedefi) ve doğru biçimi; her seçeneğin kuracağı aday kelime
  (*atlar*, *atler*; *kitapım*, *kitabım*; *zelüye*, *zelüe*); Bahçe'nin ekleri ve gövde
  kelimeleri; her yanlış adayın neden cümlesi; *İkisi de olur* cümleleri; bölge adları, akşam
  başlıkları ve haritanın iletileri.
- **Okunuş:** tek harf adıyla söylenir (*p* → *pe*, *b* → *be*, *ğ* → *yumuşak ge*; ünlüler
  kendisi): *Ek ünlüyle başlayınca p yumuşar: b olur.* → *Ek ünlüyle başlayınca pe yumuşar: be
  olur.* Ok ve tire okunmaz. Yanlış okunan metnin okunuşu `icerik/ses-okunus.csv`'ye yazılır
  (yalnız onayla). Özel adda yazım korunur, söyleyiş yumuşar: *Fıstıkçı Şahap'ın Dükkânı* →
  *Fıstıkçı Şahabın Dükkânı*.
- **Ses:** Sesler yapay zekâyla, Google Cloud Text-to-Speech'in Chirp 3: HD Callirrhoe sesiyle
  önceden üretildi; çocuk için biraz yavaş (0.9). Kodun MIT lisansı ses dosyalarını kapsamaz.
  Gemini sesleri kullanılmaz (Gemini API'nin şartları 18 yaş altına yönelik uygulamalarda
  kullanımı yasaklıyor). Bütün sesler aynı yükseklikte, baştaki ve sondaki sessizlik kırpılmış; iç duraklama en çok
  yarım saniye (çocuk beklemesin).
  Biçim MP3, mono, 24 kHz, 32 kbit/s (iOS Safari dahil her tarayıcıda çalar).
- **Ayar** (Ayarlar'da *Ses*):

| Ayar | Ne olur |
|------|---------|
| Kapalı | hiçbir ses çalmaz, hoparlör görünmez |
| Dokununca (varsayılan) | kelimenin ya da cümlenin yanındaki küçük hoparlöre dokununca çalar |
| Sesli mod | oyun kendisi söyler (aşağıda); hoparlör yeniden dinlemek için durur |

- **Sesli mod:**
  - Görev başlayınca kök söylenir (Bahçe'de hedef); bölgeye girişte önce bölgenin adı.
  - Bir bukalemun (Dükkân'da karo, Bahçe'de ek) seçilince ya da sürüklenmeye başlayınca kuracağı
    aday kelime söylenir (Bahçe'de ekin kendisi): çocuk seçimini kulağıyla yapar.
  - Doğruda kurulan kelime, yanlışta neden cümlesi söylenir. Uydurukçuklar'ın sınır adımında
    karo seçilince kelime (*pıtakım*, *pıtağım*), oturunca kelime ve *İkisi de olur* cümlesi.
  - Haritada kilitli ya da hazırlanan bölgeye dokununca adı ve iletisi; akşam ekranında başlık ve
    kelimeler; Sözlük'te karta dokununca kelime.
- **Aynı anda tek ses çalar;** yenisi eskisini keser.
- **Düğmeler simgeden tanınır:** *Sıradaki*'de sağa ok, *Haritaya dön*'de harita; yazı yanında
  durur. Bölge ekranındaki Harita düğmesi zaten simgedir.
- **Hoparlör:** 44 px'lik yuvarlak düğme, mürekkep çizgili. Kelimenin hoparlörü kartın sağ üst
  köşesinde bir rozettir (kartı kaydırmaz); cümlenin hoparlörü cümlenin solundadır.
- **Önbellek:** arayüzün ve Bukalemun Koyu'nun sesleri önbellekte hazırdır; öteki bölgelerin
  sesleri bölgeye ilk girişte arka planda iner. Ses yoksa ya da çalınamıyorsa oyun sessiz sürer;
  hata ve konsol iletisi çıkmaz. iOS'ta ses ilk dokunuştan sonra açılır.
- **Denetim:** Ses Denetim Sayfası (`ses.html`) bütün sesleri bölge bölge çalar; yanlış okunan
  Hatalı işaretlenir (işaretler yalnız cihazda), *Listeyi kopyala* onları satır satır panoya
  koyar. Üstte aynı beş cümle iki hızda (biraz yavaş, olağan) örnek olarak durur.

### Resim

- **Köklerin resmi emojidir:** `icerik/emoji.csv`'deki kökler (yalnız onayla değişir; her kökü
  sözlükte) emojisiyle görünür. Emojiler tek bir açık lisanslı setten, Twemoji'den (CC BY 4.0;
  atıf Hakkında'da ve README'de), SVG olarak pakete girer: yalnız tablodakiler.
- **Nerede:** Bukalemun Koyu'nun kelime kartında, kelimenin önünde (çoğul büyüsünde kart üçe
  çoğalınca resim de üç olur); Dükkân'ın kelime kartının sol üst köşesinde; Bahçe'de ağacın
  kökünde, kök yazısının önünde; Sözlük kartında kelimenin önünde.
- **Uydurma kökte emoji yok; yaratık var** (Uydurukçuklar).
- **Resim süstür:** yazının boyundadır; ekran okuyucudan gizlidir, kelimenin adı değişmez.
  Karakter değildir: karakterler yine yalnız koddan, üç özellikten üretilir ("Üç kural").
- **Kalın ve ince renkleri** resimde yoktur; emojinin kendi renkleri belirteç sayılmaz, yalnız
  resmin içindedir.

## MVP bölgeleri

1. **Bukalemun Koyu** — ünlü uyumu (yukarıda).
2. **Fıstıkçı Şahap'ın Dükkânı** — sert ünsüzler taş, yumuşaklar jöle (yukarıda).
   - -DA ve -CI sertleşir: *kitapta*, *balıkçı*.
   - Ünlüyle başlayan ek gelince yumuşama olur: *kitabı*, *ağacı*, *çocuğu*.
   - Tek heceli inatçılar ayrı bir ailedir: *topu*, *saçı*.
3. **Kök Bahçesi** — yapım ekleri gövdeyi büyütür
   (*göz → gözlük → gözlükçü → gözlükçülük*); çekim ekleri tepeye meyve gibi asılır;
   meyvenin üstüne gövde çıkmaz (yukarıda).
4. **Uydurukçuklar** — uydurma yaratıklar (*fıngıl*, *pıtak*, *mömüş*, *zelü*) çoğaltılır,
   sahiplenilir, bir yere konur, onlara gönderilir: *fıngıllar*, *pıtağım* ya da *pıtakım*,
   *mömüşte*, *zelüye* (yukarıda).

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

- Her yeni kelime **Sözlük**'e kart olarak düşer ("Sözlük").
- **1–2. sınıf:** okuma gerektirmeyen sesli mod ("Ses ve resim").
- **3–4. sınıf:** parçalama ve yazım.
- **Sınıf modu:** etkileşimli tahta için.
