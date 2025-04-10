// MorfemUsta: Sözcük Fabrikası - Yaş Gruplarına Göre Zorluk Seviyeleri

class DifficultyManager {
    constructor() {
        this.ageGroups = {
            child: { min: 7, max: 12, name: "Çocuk" },
            teen: { min: 13, max: 18, name: "Genç" },
            adult: { min: 19, max: 99, name: "Yetişkin" }
        };
        
        this.currentAgeGroup = null;
        this.currentDifficulty = 1; // 1: Kolay, 2: Orta, 3: Zor
        
        // Yaş gruplarına göre zorluk ayarları
        this.difficultySettings = {
            child: {
                rootCount: { min: 2, max: 4 },
                affixCount: { min: 2, max: 3 },
                timeLimit: { min: 120, max: 180 }, // saniye
                wordComplexity: 0.3, // 0-1 arası, 1 en karmaşık
                visualHints: true,
                feedbackDetail: "high",
                pointMultiplier: 0.8
            },
            teen: {
                rootCount: { min: 3, max: 5 },
                affixCount: { min: 3, max: 5 },
                timeLimit: { min: 90, max: 120 },
                wordComplexity: 0.6,
                visualHints: true,
                feedbackDetail: "medium",
                pointMultiplier: 1.0
            },
            adult: {
                rootCount: { min: 4, max: 6 },
                affixCount: { min: 4, max: 6 },
                timeLimit: { min: 60, max: 90 },
                wordComplexity: 0.9,
                visualHints: false,
                feedbackDetail: "low",
                pointMultiplier: 1.2
            }
        };
    }
    
    // Yaş grubunu belirle
    setAgeGroup(age) {
        if (age >= this.ageGroups.child.min && age <= this.ageGroups.child.max) {
            this.currentAgeGroup = "child";
        } else if (age >= this.ageGroups.teen.min && age <= this.ageGroups.teen.max) {
            this.currentAgeGroup = "teen";
        } else if (age >= this.ageGroups.adult.min && age <= this.ageGroups.adult.max) {
            this.currentAgeGroup = "adult";
        } else {
            // Varsayılan olarak genç kategorisi
            this.currentAgeGroup = "teen";
        }
        
        console.log(`Yaş grubu belirlendi: ${this.ageGroups[this.currentAgeGroup].name}`);
        return this.currentAgeGroup;
    }
    
    // Zorluk seviyesini ayarla (1: Kolay, 2: Orta, 3: Zor)
    setDifficultyLevel(level) {
        if (level >= 1 && level <= 3) {
            this.currentDifficulty = level;
        } else {
            this.currentDifficulty = 1; // Varsayılan: Kolay
        }
        
        console.log(`Zorluk seviyesi ayarlandı: ${this.getDifficultyName()}`);
        return this.currentDifficulty;
    }
    
    // Zorluk seviyesi adını getir
    getDifficultyName() {
        switch(this.currentDifficulty) {
            case 1: return "Kolay";
            case 2: return "Orta";
            case 3: return "Zor";
            default: return "Kolay";
        }
    }
    
    // Mevcut ayarlara göre kök sayısını belirle
    getRootCount() {
        const settings = this.difficultySettings[this.currentAgeGroup];
        const range = settings.rootCount.max - settings.rootCount.min;
        const difficultyFactor = (this.currentDifficulty - 1) / 2; // 0 ile 1 arasında
        
        // Zorluk seviyesine göre kök sayısını ayarla
        const count = Math.round(settings.rootCount.min + (range * difficultyFactor));
        return count;
    }
    
    // Mevcut ayarlara göre ek sayısını belirle
    getAffixCount() {
        const settings = this.difficultySettings[this.currentAgeGroup];
        const range = settings.affixCount.max - settings.affixCount.min;
        const difficultyFactor = (this.currentDifficulty - 1) / 2; // 0 ile 1 arasında
        
        // Zorluk seviyesine göre ek sayısını ayarla
        const count = Math.round(settings.affixCount.min + (range * difficultyFactor));
        return count;
    }
    
    // Mevcut ayarlara göre zaman sınırını belirle (saniye)
    getTimeLimit() {
        const settings = this.difficultySettings[this.currentAgeGroup];
        const range = settings.timeLimit.min - settings.timeLimit.max; // Not: min > max çünkü daha düşük süre daha zor
        const difficultyFactor = (this.currentDifficulty - 1) / 2; // 0 ile 1 arasında
        
        // Zorluk seviyesine göre zaman sınırını ayarla (daha yüksek zorluk = daha az süre)
        const timeLimit = Math.round(settings.timeLimit.max + (range * difficultyFactor));
        return timeLimit;
    }
    
    // Görsel ipuçları aktif mi?
    hasVisualHints() {
        const settings = this.difficultySettings[this.currentAgeGroup];
        // Çocuklar için her zaman aktif, diğer yaş grupları için zorluk seviyesine bağlı
        if (this.currentAgeGroup === "child") {
            return true;
        }
        
        // Kolay seviyede aktif, orta seviyede yaş grubuna bağlı, zor seviyede kapalı
        if (this.currentDifficulty === 1) {
            return true;
        } else if (this.currentDifficulty === 2) {
            return settings.visualHints;
        } else {
            return false;
        }
    }
    
    // Geri bildirim detay seviyesini belirle
    getFeedbackDetail() {
        const settings = this.difficultySettings[this.currentAgeGroup];
        return settings.feedbackDetail;
    }
    
    // Puan çarpanını belirle
    getPointMultiplier() {
        const settings = this.difficultySettings[this.currentAgeGroup];
        // Temel çarpan + zorluk seviyesi bonusu
        const difficultyBonus = (this.currentDifficulty - 1) * 0.2; // Zorluk başına %20 bonus
        return settings.pointMultiplier + difficultyBonus;
    }
    
    // Mevcut ayarları getir
    getCurrentSettings() {
        return {
            ageGroup: this.currentAgeGroup,
            ageGroupName: this.ageGroups[this.currentAgeGroup].name,
            difficultyLevel: this.currentDifficulty,
            difficultyName: this.getDifficultyName(),
            rootCount: this.getRootCount(),
            affixCount: this.getAffixCount(),
            timeLimit: this.getTimeLimit(),
            visualHints: this.hasVisualHints(),
            feedbackDetail: this.getFeedbackDetail(),
            pointMultiplier: this.getPointMultiplier()
        };
    }
}

// Dışa aktarma
window.DifficultyManager = DifficultyManager;
