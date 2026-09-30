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
| `--kara` | #F4E6C8 | ada haritasında kara; kilitli ve hazırlanan bölgenin tabelası |

Kalın ve ince renkleri (ve zeminleri) yalnız dilbilgisel anlam taşır: süste, haritada ya da
arayüzde kullanılmaz. Haritada bukalemun gibi dilbilgisel bir figür kendi renginde durabilir.

**Renksiz mod** (renk körlüğü denetimi): `--kalin` ve `--ince` #8E8C99'a, iki zemin
#E2E1E8'e döner. Sekiz ünlü o zaman da bedenlerinden, kök etiketleri de biçimlerinden ayırt
edilmelidir. Ayarlar'daki Renksiz bunu bütün oyuna uygular (`html[data-renkler="renksiz"]`);
büyüden sonra da gri kalır.

- **Çizgi kalınlıkları:** gövde 3 · göz akı 1.5 · ibik 2.5 · kuyruk ve bacak 5 (altında
  11'lik mürekkep) · kök etiketi 2 · ünlü kartı 2.5, köşe 18.
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
   işlevle gelir.
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

Motorun `neden(kok, etiketler, parcalar)` işlevi, her ek için seçilen yüzeyleri (*lar*, *um*)
alır. Aday, kök ile seçilen yüzeylerin art arda yazılmasıdır. Aday `olasiBicimler` içindeyse
neden yoktur. Değilse ekler soldan sağa yerel uyumla sınanır: ekin ünlüsü, adayda kendinden
önceki son ünlüye göre beklenir ve seçilenle karşılaştırılır; uyuşmayan özellikler (kalınlık,
yuvarlaklık) yazılır. Yerel sınama yüzünden *toplerim* yalnız çoğulun kalınlığını alır: *im*,
önündeki *e*'ye uyduğu için suçlanmaz. Uyum farkı yoksa (istisna: *saatlar*; yumuşama:
*kitapım*) tek neden "diğer"dir. Sözleşmesi `tests/neden.csv`'dir.

Çocuğa yalnız ilk nedenin cümlesi gösterilir (`nedenCumlesi`); önce bakılan ünlü, sonra
seçilen:

| Uyuşmayan | Cümle |
|-----------|-------|
| kalınlık | *e ince, a kalın. Kalınlıkları uyuşmuyor.* |
| yuvarlaklık | *o yuvarlak, ı düz. Yuvarlaklıkları uyuşmuyor.* |
| ikisi | *ö ince ve yuvarlak, ı kalın ve düz. İkisi de uyuşmuyor.* |

Bakılan ünlü kökte değil de önceki bir ekteyse sona *Bukalemun en yakın ünlüye bakar.*
eklenir (*toplarim*). "Diğer" için cümle henüz yoktur.

## Ada haritası

Açılış ekranıdır; başlığı *Morfemusta Adası*. Bölgeler `icerik/bolgeler.csv`'dedir (sıra,
kimlik, ad, akşam, görev tablosu); görev tablosu boş olan bölgenin içeriği henüz yoktur.

- **Çizim süstür:** kodla çizilmiş bir SVG, ekran okuyucudan gizli. Deniz, kara, kıyıda krem
  bir köpük şeridi, dalgalar, ikişer ağaç ve bölgeleri sırayla bağlayan noktalı yol. Sol altta
  koy, denizin girdiği yer.
- **Bölgeler gerçek düğmelerdir:** tablodaki sırayla, sıralı bir listede, yol boyunca dizili.
  Her düğme bir tabeladır: bölgenin adı, altında durumu. Düğmenin adı görünen yazının
  aynısıdır (*Bukalemun Koyu, Açık*).
- **Kilit:** bir bölge, öncekinin bütün görevleri en az bir kez bitince açılır. İlk bölge hep
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
  bukalemunu (*at* + *lar*). Öteki bölgelerin işaretlerini kendi oturumları çizecek.
- **Renkler:** deniz, kara, krem, mürekkep, soluk ve ayraç. Kalın ve ince renkleri kullanılmaz;
  yalnız bukalemun, dilbilgisel bir figür olarak kendi rengindedir. Gölge ve degrade yok.
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
(zincirde *toplarım*; ara gövde *toplar* kart olmaz).

- **Kart:** kelime; kök ve ekler, ekler birleşen ek görünümünde, aralarında artı
  (*top* + **lar** + **ım**); bölge; tarih (kelimenin o bölgede ilk kurulduğu gün).
- **Tekrar:** aynı kelime aynı bölgeden ikinci kez kart olmaz; başka bölgede kurulursa ayrı
  karttır.
- **Ekran:** kartlar bölgelere göre gruplu, bölge tablosunun sırasıyla; her grupta en yeni
  kart önde.
- **Boşsa:** *Sözlüğün henüz boş. Bir kelime kurunca kartı buraya gelir.*
- Kartta yalnız kök ve ek etiketleri saklıdır; biçim ve ekler her açılışta motordan gelir.

## Akşam ekranı

Bölge turunun sonundaki kapanış kartıdır; bütün bölgelerin ortak bileşeni. Adada akşam
olması doğal duraktır ("İlkeler": kısa oturum, doğal durak).

- **Başlık** bölge tablosunun akşam sütunundan: *Koyda akşam oldu*.
- Altında *Bugün kurduğun kelimeler:* ve o bölgede bugün kurulan kelimeler, kurulma sırasıyla,
  ekleri birleşen ek görünümünde. Bugün kurulan, dün kart olup bugün yeniden kurulanı da
  kapsar.
- **Tek düğme:** *Haritaya dön*. Puan, seri ve süre yok.

## Ayarlar

- **Hareket:** *Sistem gibi* (cihazın hareket azaltma ayarına uyar) / *Azalt*
  (`prefers-reduced-motion` ile aynı davranır: hiçbir şey hareket etmez).
- **Renkler:** *Renkli* / *Renksiz* (galerideki Renksiz mod; açıkken renkler büyüden sonra
  da gri kalır). Yanında kalın *a* ile ince *e* etiketi örnek olarak durur.
- **İlerlemeyi sıfırla:** uygulamanın içinde iki adım: *Bütün ilerleme ve kartlar silinecek.*
  *Vazgeç* / *Sil*. Tarayıcının onay penceresi kullanılmaz; odak önce Vazgeç'tedir. Ayarlar
  silinmez.
- Seçimler büyük, dokunması kolay radyo düğmeleridir; seçili olan dolu ve halkası kalındır.

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
  Bir pencerede olan öteki pencerede de hemen görünür.
- Tarayıcı destekliyorsa ilk kayıttan sonra kalıcı depo istenir
  (`navigator.storage.persist()`): yer darlığında kayıt silinmesin.

## MVP bölgeleri

1. **Bukalemun Koyu** — ünlü uyumu (yukarıda).
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

- Her yeni kelime **Sözlük**'e kart olarak düşer ("Sözlük").
- **1–2. sınıf:** okuma gerektirmeyen sesli mod.
- **3–4. sınıf:** parçalama ve yazım.
- **Sınıf modu:** etkileşimli tahta için.
