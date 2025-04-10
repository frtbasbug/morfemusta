# MorfemUsta: Sözcük Fabrikası - Proje Dokümantasyonu

## Proje Özeti

MorfemUsta: Sözcük Fabrikası, Türkçe dilinin morfolojik yapısını öğreten, morfem bloklarını birleştirerek sözcükler oluşturmaya dayalı eğlenceli ve eğitici bir web oyunudur. Oyun, her yaştan kullanıcıya hitap eden, yaş gruplarına göre özelleştirilmiş zorluk seviyeleri ve farklı oyun modları sunan kapsamlı bir dilbilim deneyimi sağlar.

## Teknik Özellikler

### Veritabanı
- 50+ fiil kökü
- 40+ sıfat kökü
- 40+ zarf kökü
- 40+ çeşitli ek (isim ekleri, fiil ekleri, çekim ekleri, yapım ekleri)
- Toplam 170+ morfem

### Yaş Gruplarına Göre Zorluk Seviyeleri
- **Çocuk (7-12)**: Daha basit morfemler, görsel ipuçları, daha uzun süreler
- **Genç (13-18)**: Orta seviye zorluk, eğitici içerik, standart süreler
- **Yetişkin (19+)**: Karmaşık morfemler, bilişsel zorluklar, daha kısa süreler

### Oyun Modları
1. **Serbest Mod**: Zaman sınırı olmadan, rahat bir şekilde sözcük oluşturma
2. **Zaman Yarışı**: Belirli bir süre içinde maksimum puan toplama
3. **Sözcük Zinciri**: Bir önceki sözcüğün son harfiyle başlayan sözcükler oluşturma
4. **Kategori Modu**: Belirli bir kategoriye ait sözcükler oluşturma
5. **Hedef Modu**: Belirli sayıda sözcük oluşturma hedefi
6. **Meydan Okuma**: Sınırlı morfem tipleriyle sözcük oluşturma

### Puanlama Sistemi
- Morfem zorluğuna göre temel puanlar
- Sözcük uzunluğuna göre bonus puanlar
- Hızlı cevaplar için hız bonusu
- Art arda doğru cevaplar için çarpan artışı (streak)

### Kullanıcı Arayüzü
- Modern, minimal ama renkli tasarım
- Yaş gruplarına göre özelleştirilmiş görsel temalar
- 3D küp şeklinde morfem blokları
- Doğru cevaplarda konfeti animasyonu
- Sesli geri bildirimler
- Duyarlı tasarım (responsive design)

### Teknik Altyapı
- HTML5, CSS3, JavaScript (ES6+)
- Modüler kod yapısı
- Yerel depolama (localStorage) ile istatistik takibi
- PWA (Progressive Web App) desteği

## Geliştirme Süreci

### 1. Araştırma ve Planlama
- Dilbilim oyun konseptlerinin araştırılması
- Hedef kitle ve kullanıcı ihtiyaçlarının belirlenmesi
- Oyun mekaniklerinin tasarlanması

### 2. Prototip Geliştirme
- Temel HTML, CSS ve JavaScript yapısının oluşturulması
- Basit sürükle-bırak işlevselliğinin uygulanması
- Temel morfem veritabanının oluşturulması

### 3. Veritabanı Genişletme
- ChatGPT Pro, Claude.ai ve Grok'tan veri toplanması
- Verilerin temizlenmesi ve birleştirilmesi
- Zorluk seviyelerine göre morfem sınıflandırması

### 4. Oyun Mekaniklerinin Geliştirilmesi
- Yaş gruplarına göre zorluk seviyelerinin uygulanması
- Farklı oyun modlarının eklenmesi
- Detaylı puanlama sisteminin geliştirilmesi

### 5. Kullanıcı Arayüzü İyileştirmeleri
- Modern ve duyarlı tasarımın uygulanması
- Animasyonlar ve görsel geri bildirimlerin eklenmesi
- Yaş gruplarına göre arayüz özelleştirmesi

### 6. Test ve Optimizasyon
- Kapsamlı test senaryolarının oluşturulması
- Hataların tespit edilip düzeltilmesi
- Performans optimizasyonu

### 7. Deploy ve Yayınlama
- DigitalOcean App Platform'a deploy
- "morfemusta.tr" alan adı ile bağlantı
- Final sürümün yayınlanması

## Kullanım Kılavuzu

### Oyuna Başlama
1. Ana sayfada "Oyuna Başla" butonuna tıklayın
2. Yaş grubunuzu seçin (Çocuk, Genç, Yetişkin)
3. Zorluk seviyesini seçin (Kolay, Orta, Zor)
4. Oyun modunu seçin

### Sözcük Oluşturma
1. Morfem bloklarına tıklayarak seçin
2. Seçilen morfemler sözcük oluşturma alanında görüntülenir
3. "Sözcüğü Gönder" butonuna tıklayarak sözcüğü doğrulayın
4. Doğru sözcükler için puan kazanın
5. "Temizle" butonuna tıklayarak seçimleri sıfırlayın

### Oyun Modları Kullanımı
- **Serbest Mod**: İstediğiniz kadar sözcük oluşturun
- **Zaman Yarışı**: Süre dolmadan maksimum puan toplayın
- **Sözcük Zinciri**: Her sözcük bir öncekinin son harfiyle başlamalı
- **Kategori Modu**: Belirtilen kategoriye ait sözcükler oluşturun
- **Hedef Modu**: Belirtilen sayıda sözcük oluşturun
- **Meydan Okuma**: Sadece belirtilen morfem tiplerini kullanın

## Gelecek Geliştirmeler

### Kısa Vadeli Planlar
- Daha fazla morfem eklenmesi
- Kullanıcı hesapları ve profilleri
- Liderlik tablosu

### Orta Vadeli Planlar
- Çoklu oyuncu modu
- Daha fazla dil desteği
- Eğitim içeriği ve öğretici bölümler

### Uzun Vadeli Planlar
- Mobil uygulama versiyonu
- Yapay zeka destekli öğrenme asistanı
- Eğitim kurumları için özel sürüm

## Teknik Dokümantasyon

### Dosya Yapısı
```
MorfemUsta/
├── css/
│   ├── style.css
│   ├── enhanced-ui.css
│   ├── feedback-enhancements.css
│   └── visual-enhancements.css
├── js/
│   ├── core/
│   │   ├── difficulty.js
│   │   ├── game.js
│   │   ├── gamemode.js
│   │   ├── morpheme.js
│   │   ├── scoring.js
│   │   ├── unified-database.js
│   │   ├── enhanced-game-mechanics.js
│   │   └── word.js
│   ├── ui/
│   │   └── dragdrop.js
│   ├── utils/
│   │   └── dictionary.js
│   ├── app.js
│   └── final-app.js
├── assets/
│   ├── images/
│   ├── fonts/
│   └── sounds/
├── data/
├── index.html
└── test.html
```

### Ana Sınıflar ve İşlevleri

#### UnifiedMorphemeDatabase
- Tüm morfem verilerini yönetir
- Yaş ve zorluk seviyelerine göre morfem filtreleme
- Sözcük doğrulama ve puanlama

#### EnhancedGameMechanics
- Oyun mantığını yönetir
- Farklı oyun modlarını uygular
- Morfem seçimi ve sözcük oluşturma

#### MorfemUstaApp
- Ana uygulama sınıfı
- Kullanıcı arayüzünü yönetir
- Ekranlar arası geçişleri kontrol eder
- Oyun durumunu takip eder

## Sonuç

MorfemUsta: Sözcük Fabrikası, Türkçe dilinin morfolojik zenginliğini keşfetmek için eğlenceli ve eğitici bir platform sunuyor. Yaş gruplarına göre özelleştirilmiş zorluk seviyeleri, farklı oyun modları ve genişletilmiş veritabanı ile her yaştan kullanıcıya hitap eden kapsamlı bir dilbilim deneyimi sağlıyor.

Oyun, kullanıcıların Türkçe dilbilgisi kurallarını eğlenceli bir şekilde öğrenmelerine ve dilbilim becerilerini geliştirmelerine yardımcı oluyor. Modern ve duyarlı tasarımı sayesinde hem masaüstü hem de mobil cihazlarda mükemmel çalışıyor.

MorfemUsta: Sözcük Fabrikası, dilbilim eğitimini oyunlaştırarak öğrenmeyi daha eğlenceli ve etkili hale getiriyor.
