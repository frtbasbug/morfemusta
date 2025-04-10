// MorfemUsta: Sözcük Fabrikası - Detaylı Puan Sistemi

class ScoringSystem {
    constructor() {
        // Temel puan ayarları
        this.baseScores = {
            root: 10,        // Her kök için temel puan
            affix: 10,       // Her ek için temel puan
            wordLength: 5,   // Sözcük uzunluğu başına puan (harf sayısı)
            correctWord: 20  // Doğru sözcük için bonus
        };
        
        // Zorluk seviyesine göre çarpanlar
        this.difficultyMultipliers = {
            easy: 1.0,
            medium: 1.5,
            hard: 2.0
        };
        
        // Morfem zorluğuna göre puanlar
        this.morphemeDifficultyScores = {
            easy: 5,
            medium: 10,
            hard: 15
        };
        
        // Hız bonusu ayarları
        this.speedBonus = {
            threshold: 10,    // Saniye cinsinden hız eşiği
            multiplier: 1.5   // Eşik altında kalındığında çarpan
        };
        
        // Doğruluk çarpanı ayarları
        this.streakMultiplier = {
            base: 1.0,        // Başlangıç çarpanı
            increment: 0.1,   // Her doğru cevap için artış
            maxMultiplier: 3.0 // Maksimum çarpan
        };
        
        // Seviye başına puan hedefleri
        this.levelThresholds = [];
        this.initializeLevelThresholds();
        
        // Oyuncu istatistikleri
        this.stats = {
            totalScore: 0,
            currentLevel: 1,
            correctWords: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageWordLength: 0,
            totalWordsCreated: 0,
            totalMorphemesUsed: 0
        };
    }
    
    // Seviye başına puan hedeflerini başlat
    initializeLevelThresholds() {
        // İlk 10 seviye için hedefler (her seviye için gereken toplam puan)
        this.levelThresholds = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];
        
        // 10. seviyeden sonraki hedefler için formül
        for (let level = 11; level <= 50; level++) {
            const threshold = Math.round(this.levelThresholds[10] * Math.pow(1.25, level - 10));
            this.levelThresholds.push(threshold);
        }
    }
    
    // Sözcük için puan hesapla
    calculateWordScore(word, morphemes, timeSpent, difficultyManager) {
        if (!word || !morphemes || morphemes.length === 0) {
            return 0;
        }
        
        // Temel puanları hesapla
        let score = 0;
        
        // Kök ve ek sayısına göre puan
        const rootCount = morphemes.filter(m => m.type === 'root').length;
        const affixCount = morphemes.filter(m => m.type === 'affix').length;
        
        score += rootCount * this.baseScores.root;
        score += affixCount * this.baseScores.affix;
        
        // Sözcük uzunluğuna göre puan
        score += word.length * this.baseScores.wordLength;
        
        // Doğru sözcük bonusu
        score += this.baseScores.correctWord;
        
        // Morfem zorluğuna göre bonus puanlar
        morphemes.forEach(morpheme => {
            if (morpheme.difficulty) {
                score += this.morphemeDifficultyScores[morpheme.difficulty];
            } else {
                // Varsayılan olarak orta zorluk
                score += this.morphemeDifficultyScores.medium;
            }
        });
        
        // Hız bonusu
        if (timeSpent < this.speedBonus.threshold) {
            score = Math.round(score * this.speedBonus.multiplier);
        }
        
        // Doğruluk çarpanı (streak)
        const streakMultiplier = this.streakMultiplier.base + 
                                (this.stats.currentStreak * this.streakMultiplier.increment);
        
        // Maksimum çarpanı aşmamak için kontrol
        const finalStreakMultiplier = Math.min(streakMultiplier, this.streakMultiplier.maxMultiplier);
        score = Math.round(score * finalStreakMultiplier);
        
        // Zorluk seviyesi çarpanı
        if (difficultyManager) {
            const settings = difficultyManager.getCurrentSettings();
            score = Math.round(score * settings.pointMultiplier);
        }
        
        return score;
    }
    
    // Doğru cevap için puan ekle ve istatistikleri güncelle
    addScore(word, morphemes, timeSpent, difficultyManager) {
        // Puanı hesapla
        const score = this.calculateWordScore(word, morphemes, timeSpent, difficultyManager);
        
        // İstatistikleri güncelle
        this.stats.totalScore += score;
        this.stats.correctWords++;
        this.stats.currentStreak++;
        this.stats.longestStreak = Math.max(this.stats.longestStreak, this.stats.currentStreak);
        this.stats.totalWordsCreated++;
        this.stats.totalMorphemesUsed += morphemes.length;
        
        // Ortalama sözcük uzunluğunu güncelle
        const totalLength = this.stats.averageWordLength * (this.stats.totalWordsCreated - 1) + word.length;
        this.stats.averageWordLength = totalLength / this.stats.totalWordsCreated;
        
        // Seviye kontrolü
        this.checkLevelUp();
        
        return {
            score: score,
            totalScore: this.stats.totalScore,
            level: this.stats.currentLevel,
            streak: this.stats.currentStreak
        };
    }
    
    // Yanlış cevap için istatistikleri güncelle
    recordIncorrectWord() {
        // Streak'i sıfırla
        this.stats.currentStreak = 0;
        this.stats.totalWordsCreated++;
    }
    
    // Seviye atlama kontrolü
    checkLevelUp() {
        const currentLevel = this.stats.currentLevel;
        const nextLevel = currentLevel + 1;
        
        // Bir sonraki seviye için yeterli puan var mı?
        if (nextLevel < this.levelThresholds.length && 
            this.stats.totalScore >= this.levelThresholds[nextLevel]) {
            this.stats.currentLevel = nextLevel;
            return true;
        }
        
        return false;
    }
    
    // Bir sonraki seviye için gereken puanı hesapla
    getPointsToNextLevel() {
        const currentLevel = this.stats.currentLevel;
        const nextLevel = currentLevel + 1;
        
        if (nextLevel < this.levelThresholds.length) {
            return this.levelThresholds[nextLevel] - this.stats.totalScore;
        }
        
        // Maksimum seviyeye ulaşıldı
        return 0;
    }
    
    // Mevcut seviye ilerleme yüzdesini hesapla
    getLevelProgressPercentage() {
        const currentLevel = this.stats.currentLevel;
        const nextLevel = currentLevel + 1;
        
        if (nextLevel >= this.levelThresholds.length) {
            return 100; // Maksimum seviyeye ulaşıldı
        }
        
        const currentThreshold = this.levelThresholds[currentLevel];
        const nextThreshold = this.levelThresholds[nextLevel];
        const totalPointsInLevel = nextThreshold - currentThreshold;
        const pointsEarnedInLevel = this.stats.totalScore - currentThreshold;
        
        return Math.min(100, Math.round((pointsEarnedInLevel / totalPointsInLevel) * 100));
    }
    
    // İstatistikleri getir
    getStats() {
        return {
            ...this.stats,
            pointsToNextLevel: this.getPointsToNextLevel(),
            levelProgress: this.getLevelProgressPercentage()
        };
    }
    
    // İstatistikleri sıfırla
    resetStats() {
        this.stats = {
            totalScore: 0,
            currentLevel: 1,
            correctWords: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageWordLength: 0,
            totalWordsCreated: 0,
            totalMorphemesUsed: 0
        };
    }
}

// Dışa aktarma
window.ScoringSystem = ScoringSystem;
