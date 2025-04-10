// MorfemUsta: Sözcük Fabrikası - Farklı Oyun Modları

class GameModeManager {
    constructor(game) {
        this.game = game;
        
        // Oyun modları
        this.modes = {
            free: {
                id: "free",
                name: "Serbest Mod",
                description: "Zaman sınırı olmadan, rahat bir şekilde sözcük oluşturma modu.",
                hasTimeLimit: false,
                hasWordTarget: false,
                hasSpecialRules: false
            },
            timed: {
                id: "timed",
                name: "Zaman Yarışı",
                description: "Belirli bir süre içinde maksimum puan toplama modu.",
                hasTimeLimit: true,
                hasWordTarget: false,
                hasSpecialRules: false,
                timeLimit: 180 // saniye
            },
            wordChain: {
                id: "wordChain",
                name: "Sözcük Zinciri",
                description: "Bir önceki sözcüğün son harfiyle başlayan sözcükler oluşturma modu.",
                hasTimeLimit: true,
                hasWordTarget: false,
                hasSpecialRules: true,
                timeLimit: 240, // saniye
                specialRule: "chainRule"
            },
            category: {
                id: "category",
                name: "Kategori Modu",
                description: "Belirli bir kategoriye ait sözcükler oluşturma modu.",
                hasTimeLimit: true,
                hasWordTarget: false,
                hasSpecialRules: true,
                timeLimit: 240, // saniye
                specialRule: "categoryRule",
                categories: ["Hayvanlar", "Bitkiler", "Meslekler", "Şehirler", "Eşyalar"]
            },
            target: {
                id: "target",
                name: "Hedef Modu",
                description: "Belirli sayıda sözcük oluşturma hedefi olan mod.",
                hasTimeLimit: false,
                hasWordTarget: true,
                hasSpecialRules: false,
                wordTarget: 10
            },
            challenge: {
                id: "challenge",
                name: "Meydan Okuma",
                description: "Sadece belirli morfem kategorileriyle sözcük oluşturma modu.",
                hasTimeLimit: true,
                hasWordTarget: true,
                hasSpecialRules: true,
                timeLimit: 300, // saniye
                wordTarget: 8,
                specialRule: "limitedMorphemes"
            }
        };
        
        // Varsayılan mod
        this.currentMode = this.modes.free;
        this.timer = null;
        this.timeRemaining = 0;
        this.lastWord = "";
        this.currentCategory = "";
        this.limitedMorphemeTypes = [];
    }
    
    // Oyun modunu ayarla
    setGameMode(modeId, difficultyManager = null) {
        if (this.modes[modeId]) {
            this.currentMode = this.modes[modeId];
            console.log(`Oyun modu ayarlandı: ${this.currentMode.name}`);
            
            // Zorluk yöneticisi varsa, zaman sınırını ayarla
            if (difficultyManager && this.currentMode.hasTimeLimit) {
                const settings = difficultyManager.getCurrentSettings();
                this.currentMode.timeLimit = settings.timeLimit;
            }
            
            // Özel mod ayarları
            this.setupSpecialModeSettings(modeId);
            
            return true;
        }
        
        console.error(`Geçersiz oyun modu: ${modeId}`);
        return false;
    }
    
    // Özel mod ayarlarını yap
    setupSpecialModeSettings(modeId) {
        switch(modeId) {
            case "wordChain":
                this.lastWord = "";
                break;
                
            case "category":
                // Rastgele bir kategori seç
                const categories = this.modes.category.categories;
                this.currentCategory = categories[Math.floor(Math.random() * categories.length)];
                console.log(`Seçilen kategori: ${this.currentCategory}`);
                break;
                
            case "challenge":
                // Sınırlı morfem tiplerini belirle
                const allTypes = ["noun", "verb", "adjective", "adverb"];
                // Rastgele 2 tip seç
                this.limitedMorphemeTypes = [];
                while (this.limitedMorphemeTypes.length < 2) {
                    const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
                    if (!this.limitedMorphemeTypes.includes(randomType)) {
                        this.limitedMorphemeTypes.push(randomType);
                    }
                }
                console.log(`Sınırlı morfem tipleri: ${this.limitedMorphemeTypes.join(", ")}`);
                break;
        }
    }
    
    // Oyunu başlat
    startGame() {
        // Zamanlayıcıyı başlat (eğer mod için gerekiyorsa)
        if (this.currentMode.hasTimeLimit) {
            this.timeRemaining = this.currentMode.timeLimit;
            this.startTimer();
        }
        
        // Oyun başlangıç mesajı
        return {
            mode: this.currentMode.name,
            message: `${this.currentMode.name} başladı! ${this.getModeSummary()}`,
            timeLimit: this.currentMode.hasTimeLimit ? this.currentMode.timeLimit : null,
            wordTarget: this.currentMode.hasWordTarget ? this.currentMode.wordTarget : null,
            specialRule: this.currentMode.hasSpecialRules ? this.getSpecialRuleDescription() : null
        };
    }
    
    // Zamanlayıcıyı başlat
    startTimer() {
        // Önceki zamanlayıcıyı temizle
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Yeni zamanlayıcı başlat
        this.timer = setInterval(() => {
            this.timeRemaining--;
            
            // Zamanlayıcı güncellemesi
            if (this.game && typeof this.game.updateTimer === 'function') {
                this.game.updateTimer(this.timeRemaining);
            }
            
            // Süre doldu mu?
            if (this.timeRemaining <= 0) {
                this.endGame("timeUp");
            }
        }, 1000);
    }
    
    // Zamanlayıcıyı durdur
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    // Oyunu bitir
    endGame(reason) {
        this.stopTimer();
        
        let message = "";
        switch(reason) {
            case "timeUp":
                message = "Süre doldu!";
                break;
            case "targetReached":
                message = "Hedef tamamlandı!";
                break;
            case "userQuit":
                message = "Oyun sonlandırıldı.";
                break;
            default:
                message = "Oyun bitti.";
        }
        
        // Oyun sonu işlemleri
        if (this.game && typeof this.game.handleGameEnd === 'function') {
            this.game.handleGameEnd(reason, message);
        }
        
        return {
            reason: reason,
            message: message
        };
    }
    
    // Sözcük doğrulama kurallarını kontrol et
    validateWordForMode(word, morphemes) {
        // Mod özel kuralları
        if (this.currentMode.hasSpecialRules) {
            switch(this.currentMode.specialRule) {
                case "chainRule":
                    // Sözcük zinciri kuralı
                    if (this.lastWord && this.lastWord.length > 0) {
                        const lastChar = this.lastWord.charAt(this.lastWord.length - 1);
                        const firstChar = word.charAt(0);
                        
                        if (lastChar !== firstChar) {
                            return {
                                valid: false,
                                message: `Sözcük, bir önceki sözcüğün son harfi olan "${lastChar}" ile başlamalıdır.`
                            };
                        }
                    }
                    break;
                    
                case "categoryRule":
                    // Kategori kuralı - burada basit bir kontrol yapıyoruz
                    // Gerçek uygulamada daha kapsamlı bir kategori kontrolü gerekir
                    const categoryWords = this.getCategoryWords(this.currentCategory);
                    if (!categoryWords.includes(word.toLowerCase())) {
                        return {
                            valid: false,
                            message: `Sözcük "${this.currentCategory}" kategorisine ait olmalıdır.`
                        };
                    }
                    break;
                    
                case "limitedMorphemes":
                    // Sınırlı morfem tipleri kuralı
                    for (const morpheme of morphemes) {
                        if (morpheme.rootType && !this.limitedMorphemeTypes.includes(morpheme.rootType)) {
                            return {
                                valid: false,
                                message: `Sadece ${this.limitedMorphemeTypes.join(" ve ")} tipindeki morfemler kullanılabilir.`
                            };
                        }
                    }
                    break;
            }
        }
        
        // Tüm kurallar geçildi
        return {
            valid: true,
            message: "Sözcük mod kurallarına uygun."
        };
    }
    
    // Sözcük oluşturulduğunda
    onWordCreated(word, morphemes, isValid) {
        if (isValid) {
            // Sözcük zinciri modu için son sözcüğü güncelle
            if (this.currentMode.id === "wordChain") {
                this.lastWord = word;
            }
            
            // Hedef modu için hedef kontrolü
            if (this.currentMode.hasWordTarget) {
                const stats = this.game.scoringSystem.getStats();
                if (stats.correctWords >= this.currentMode.wordTarget) {
                    this.endGame("targetReached");
                }
            }
        }
    }
    
    // Mod özeti
    getModeSummary() {
        let summary = this.currentMode.description;
        
        if (this.currentMode.hasTimeLimit) {
            summary += ` Süre: ${this.formatTime(this.currentMode.timeLimit)}.`;
        }
        
        if (this.currentMode.hasWordTarget) {
            summary += ` Hedef: ${this.currentMode.wordTarget} sözcük.`;
        }
        
        if (this.currentMode.hasSpecialRules) {
            summary += ` ${this.getSpecialRuleDescription()}`;
        }
        
        return summary;
    }
    
    // Özel kural açıklaması
    getSpecialRuleDescription() {
        switch(this.currentMode.specialRule) {
            case "chainRule":
                return "Her sözcük, bir önceki sözcüğün son harfiyle başlamalıdır.";
                
            case "categoryRule":
                return `Kategori: ${this.currentCategory}. Sadece bu kategoriye ait sözcükler geçerlidir.`;
                
            case "limitedMorphemes":
                return `Sadece ${this.limitedMorphemeTypes.join(" ve ")} tipindeki morfemler kullanılabilir.`;
                
            default:
                return "";
        }
    }
    
    // Süreyi formatla (saniye -> MM:SS)
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    // Kategori sözcüklerini getir (basit örnek)
    getCategoryWords(category) {
        // Gerçek uygulamada bu veriler daha kapsamlı bir veritabanından gelmeli
        const categoryWords = {
            "Hayvanlar": ["kedi", "köpek", "at", "kuş", "balık", "aslan", "kaplan", "fil", "zürafa", "maymun"],
            "Bitkiler": ["çiçek", "ağaç", "ot", "çalı", "yaprak", "kök", "dal", "tohum", "meyve", "sebze"],
            "Meslekler": ["öğretmen", "doktor", "mühendis", "avukat", "aşçı", "pilot", "hemşire", "polis", "itfaiyeci", "çiftçi"],
            "Şehirler": ["istanbul", "ankara", "izmir", "bursa", "antalya", "adana", "konya", "trabzon", "samsun", "gaziantep"],
            "Eşyalar": ["masa", "sandalye", "yatak", "dolap", "kitap", "kalem", "telefon", "bilgisayar", "televizyon", "çanta"]
        };
        
        return categoryWords[category] || [];
    }
    
    // Mevcut modu getir
    getCurrentMode() {
        return this.currentMode;
    }
    
    // Tüm modları getir
    getAllModes() {
        return this.modes;
    }
}

// Dışa aktarma
window.GameModeManager = GameModeManager;
