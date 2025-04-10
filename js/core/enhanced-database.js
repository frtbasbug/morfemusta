// MorfemUsta: Sözcük Fabrikası - Genişletilmiş Veritabanı
// Grok'tan gelen zarf (adverb) verileri

class EnhancedMorphemeDatabase {
    constructor() {
        this.roots = [];
        this.affixes = [];
        this.nextRootId = 1000;
        this.nextAffixId = 2000;
        
        // Temel veritabanını yükle
        this.loadBasicDatabase();
        
        // Grok'tan gelen zarf verilerini yükle
        this.loadGrokAdverbs();
    }
    
    // Temel veritabanını yükleme
    loadBasicDatabase() {
        // İsim kökleri
        const nounRoots = [
            {id: 1, text: 'ev', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 2, text: 'göz', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 3, text: 'su', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 4, text: 'baş', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 5, text: 'el', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 6, text: 'dil', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 7, text: 'yol', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 8, text: 'taş', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 9, text: 'kuş', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 10, text: 'dağ', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'}
        ];
        
        // Fiil kökleri
        const verbRoots = [
            {id: 101, text: 'gel', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'},
            {id: 102, text: 'git', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'},
            {id: 103, text: 'yap', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'},
            {id: 104, text: 'bak', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'},
            {id: 105, text: 'gör', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'},
            {id: 106, text: 'al', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'},
            {id: 107, text: 'ver', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'},
            {id: 108, text: 'dur', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'},
            {id: 109, text: 'koş', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'},
            {id: 110, text: 'oku', type: 'root', rootType: 'verb', frequency: 'high', difficulty: 'easy'}
        ];
        
        // ChatGPT Pro'dan gelen isim kökleri
        const chatGptNounRoots = [
            {id: 201, text: 'kitap', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 202, text: 'okul', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 203, text: 'araba', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 204, text: 'çocuk', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 205, text: 'anne', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 206, text: 'baba', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 207, text: 'masa', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 208, text: 'sandalye', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 209, text: 'kapı', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 210, text: 'pencere', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 211, text: 'kalem', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 212, text: 'defter', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 213, text: 'silgi', type: 'root', rootType: 'noun', frequency: 'medium', difficulty: 'easy'},
            {id: 214, text: 'öğretmen', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 215, text: 'öğrenci', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 216, text: 'arkadaş', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 217, text: 'kardeş', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 218, text: 'aile', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 219, text: 'ev', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 220, text: 'bahçe', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 221, text: 'ağaç', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 222, text: 'çiçek', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 223, text: 'hayvan', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 224, text: 'köpek', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 225, text: 'kedi', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 226, text: 'kuş', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 227, text: 'balık', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 228, text: 'yemek', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 229, text: 'su', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 230, text: 'ekmek', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 231, text: 'süt', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 232, text: 'meyve', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 233, text: 'sebze', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 234, text: 'elma', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 235, text: 'portakal', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 236, text: 'gün', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 237, text: 'ay', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 238, text: 'yıl', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 239, text: 'zaman', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 240, text: 'saat', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 241, text: 'dakika', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 242, text: 'saniye', type: 'root', rootType: 'noun', frequency: 'medium', difficulty: 'medium'},
            {id: 243, text: 'hava', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 244, text: 'güneş', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 245, text: 'ay', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'},
            {id: 246, text: 'yıldız', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 247, text: 'dünya', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 248, text: 'deniz', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'medium'},
            {id: 249, text: 'nehir', type: 'root', rootType: 'noun', frequency: 'medium', difficulty: 'medium'},
            {id: 250, text: 'göl', type: 'root', rootType: 'noun', frequency: 'high', difficulty: 'easy'}
        ];
        
        // Ekler
        const affixes = [
            {id: 1001, text: 'lar', type: 'affix', affixType: 'plural', compatibleWith: ['noun'], position: 'after', frequency: 'high', difficulty: 'easy'},
            {id: 1002, text: 'ler', type: 'affix', affixType: 'plural', compatibleWith: ['noun'], position: 'after', frequency: 'high', difficulty: 'easy'},
            {id: 1003, text: 'cı', type: 'affix', affixType: 'derivational', compatibleWith: ['noun'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1004, text: 'ci', type: 'affix', affixType: 'derivational', compatibleWith: ['noun'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1005, text: 'cu', type: 'affix', affixType: 'derivational', compatibleWith: ['noun'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1006, text: 'cü', type: 'affix', affixType: 'derivational', compatibleWith: ['noun'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1007, text: 'lık', type: 'affix', affixType: 'derivational', compatibleWith: ['noun', 'adjective'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1008, text: 'lik', type: 'affix', affixType: 'derivational', compatibleWith: ['noun', 'adjective'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1009, text: 'luk', type: 'affix', affixType: 'derivational', compatibleWith: ['noun', 'adjective'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1010, text: 'lük', type: 'affix', affixType: 'derivational', compatibleWith: ['noun', 'adjective'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1011, text: 'mak', type: 'affix', affixType: 'infinitive', compatibleWith: ['verb'], position: 'after', frequency: 'high', difficulty: 'easy'},
            {id: 1012, text: 'mek', type: 'affix', affixType: 'infinitive', compatibleWith: ['verb'], position: 'after', frequency: 'high', difficulty: 'easy'},
            {id: 1013, text: 'dı', type: 'affix', affixType: 'past', compatibleWith: ['verb'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1014, text: 'di', type: 'affix', affixType: 'past', compatibleWith: ['verb'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1015, text: 'du', type: 'affix', affixType: 'past', compatibleWith: ['verb'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1016, text: 'dü', type: 'affix', affixType: 'past', compatibleWith: ['verb'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1017, text: 'tı', type: 'affix', affixType: 'past', compatibleWith: ['verb'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: 1018, text: 'ti', type: 'affix', affixType: 'past', compatibleWith: ['verb'], position: 'after', frequency: 'high', difficulty: 'medium'}
        ];
        
        // Tekrar eden kökleri kaldır
        const uniqueRoots = this.removeDuplicateRoots([...nounRoots, ...verbRoots, ...chatGptNounRoots]);
        
        // Veritabanına ekle
        this.roots = [...uniqueRoots];
        this.affixes = [...affixes];
        
        // Sonraki ID'leri güncelle
        this.updateNextIds();
    }
    
    // Grok'tan gelen zarf verilerini yükleme
    loadGrokAdverbs() {
        const grokAdverbs = [
            {text: "şimdi", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "dün", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "yarın", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "erken", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "geç", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "içeri", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "dışarı", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "yukarı", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "aşağı", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "ileri", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "geri", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "hızlı", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "yavaş", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "az", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "çok", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "fazla", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "biraz", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "gizli", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "açık", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "sessiz", type: "adverb", frequency: "medium", difficulty: "easy"},
            {text: "gürültülü", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "derin", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "sığ", type: "adverb", frequency: "low", difficulty: "medium"},
            {text: "düz", type: "adverb", frequency: "medium", difficulty: "easy"},
            {text: "eğri", type: "adverb", frequency: "low", difficulty: "medium"},
            {text: "sert", type: "adverb", frequency: "medium", difficulty: "easy"},
            {text: "yumuşak", type: "adverb", frequency: "medium", difficulty: "easy"},
            {text: "tatlı", type: "adverb", frequency: "low", difficulty: "medium"},
            {text: "acı", type: "adverb", frequency: "low", difficulty: "medium"},
            {text: "sakin", type: "adverb", frequency: "medium", difficulty: "easy"},
            {text: "hareketli", type: "adverb", frequency: "low", difficulty: "medium"},
            {text: "güçlü", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "zayıf", type: "adverb", frequency: "low", difficulty: "medium"},
            {text: "sağlam", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "basit", type: "adverb", frequency: "medium", difficulty: "easy"},
            {text: "karmaşık", type: "adverb", frequency: "low", difficulty: "hard"},
            {text: "yakın", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "uzak", type: "adverb", frequency: "medium", difficulty: "easy"},
            {text: "sessizce", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "hızlıca", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "yavaşça", type: "adverb", frequency: "high", difficulty: "easy"},
            {text: "dikkatli", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "dikkatsiz", type: "adverb", frequency: "low", difficulty: "medium"},
            {text: "düzenli", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "dağınık", type: "adverb", frequency: "low", difficulty: "medium"},
            {text: "neşeli", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "huzurlu", type: "adverb", frequency: "low", difficulty: "medium"},
            {text: "endişeli", type: "adverb", frequency: "low", difficulty: "hard"},
            {text: "saygılı", type: "adverb", frequency: "medium", difficulty: "medium"},
            {text: "hoş", type: "adverb", frequency: "medium", difficulty: "easy"}
        ];
        
        // Zarfları köklere dönüştür ve ekle
        const adverbRoots = grokAdverbs.map(adverb => {
            return {
                id: this.nextRootId++,
                text: adverb.text,
                type: 'root',
                rootType: 'adverb',
                frequency: adverb.frequency,
                difficulty: adverb.difficulty
            };
        });
        
        // Veritabanına ekle
        this.roots = [...this.roots, ...adverbRoots];
        
        // Zarf ekleri ekle
        const adverbAffixes = [
            {id: this.nextAffixId++, text: 'ce', type: 'affix', affixType: 'adverbial', compatibleWith: ['adjective', 'adverb'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: this.nextAffixId++, text: 'ca', type: 'affix', affixType: 'adverbial', compatibleWith: ['adjective', 'adverb'], position: 'after', frequency: 'high', difficulty: 'medium'},
            {id: this.nextAffixId++, text: 'leyin', type: 'affix', affixType: 'adverbial', compatibleWith: ['noun'], position: 'after', frequency: 'medium', difficulty: 'hard'},
            {id: this.nextAffixId++, text: 'en', type: 'affix', affixType: 'adverbial', compatibleWith: ['adjective'], position: 'after', frequency: 'high', difficulty: 'medium'}
        ];
        
        // Veritabanına ekle
        this.affixes = [...this.affixes, ...adverbAffixes];
    }
    
    // Tekrar eden kökleri kaldırma
    removeDuplicateRoots(roots) {
        const uniqueRoots = [];
        const textMap = new Map();
        
        for (const root of roots) {
            if (!textMap.has(root.text)) {
                textMap.set(root.text, root);
                uniqueRoots.push(root);
            }
        }
        
        return uniqueRoots;
    }
    
    // Sonraki ID'leri güncelleme
    updateNextIds() {
        if (this.roots.length > 0) {
            const maxRootId = Math.max(...this.roots.map(root => root.id));
            this.nextRootId = maxRootId + 1;
        }
        
        if (this.affixes.length > 0) {
            const maxAffixId = Math.max(...this.affixes.map(affix => affix.id));
            this.nextAffixId = maxAffixId + 1;
        }
    }
    
    // Rastgele morfemler alma
    getRandomMorphemes(rootCount, affixCount, difficultyManager) {
        const settings = difficultyManager.getCurrentSettings();
        const ageGroup = difficultyManager.getAgeGroup();
        const difficultyLevel = difficultyManager.getDifficultyLevel();
        
        // Zorluk seviyesine göre filtreleme
        let filteredRoots = this.roots;
        let filteredAffixes = this.affixes;
        
        // Yaş grubuna göre filtreleme
        if (ageGroup === 'child') {
            // Çocuklar için kolay morfemler
            filteredRoots = this.roots.filter(root => root.difficulty === 'easy');
            filteredAffixes = this.affixes.filter(affix => affix.difficulty === 'easy');
        } else if (ageGroup === 'teen') {
            // Gençler için zorluk seviyesine göre filtreleme
            if (difficultyLevel === 0) { // Kolay
                filteredRoots = this.roots.filter(root => root.difficulty === 'easy' || root.difficulty === 'medium');
                filteredAffixes = this.affixes.filter(affix => affix.difficulty === 'easy');
            } else if (difficultyLevel === 1) { // Orta
                filteredRoots = this.roots;
                filteredAffixes = this.affixes.filter(affix => affix.difficulty === 'easy' || affix.difficulty === 'medium');
            } else { // Zor
                filteredRoots = this.roots;
                filteredAffixes = this.affixes;
            }
        } else { // Yetişkin
            // Yetişkinler için zorluk seviyesine göre filtreleme
            if (difficultyLevel === 0) { // Kolay
                filteredRoots = this.roots;
                filteredAffixes = this.affixes.filter(affix => affix.difficulty === 'easy' || affix.difficulty === 'medium');
            } else if (difficultyLevel === 1) { // Orta
                filteredRoots = this.roots;
                filteredAffixes = this.affixes;
            } else { // Zor
                // Zor morfemler daha fazla
                filteredRoots = this.roots;
                filteredAffixes = this.affixes;
                // Zor morfemler daha yüksek olasılıkla seçilir
            }
        }
        
        // Rastgele kökler seçme
        const selectedRoots = this.getRandomElements(filteredRoots, rootCount);
        
        // Rastgele ekler seçme
        const selectedAffixes = this.getRandomElements(filteredAffixes, affixCount);
        
        // Tüm morfemleri birleştir
        return [...selectedRoots, ...selectedAffixes];
    }
    
    // Rastgele elementler seçme
    getRandomElements(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    // ID'ye göre morfem bulma
    getMorphemeById(id) {
        const root = this.roots.find(r => r.id === id);
        if (root) return root;
        
        const affix = this.affixes.find(a => a.id === id);
        if (affix) return affix;
        
        return null;
    }
    
    // Veritabanı istatistiklerini alma
    getDatabaseStats() {
        const rootTypes = {};
        this.roots.forEach(root => {
            if (!rootTypes[root.rootType]) {
                rootTypes[root.rootType] = 0;
            }
            rootTypes[root.rootType]++;
        });
        
        const affixTypes = {};
        this.affixes.forEach(affix => {
            if (!affixTypes[affix.affixType]) {
                affixTypes[affix.affixType] = 0;
            }
            affixTypes[affix.affixType]++;
        });
        
        return {
            totalRoots: this.roots.length,
            totalAffixes: this.affixes.length,
            rootTypes,
            affixTypes
        };
    }
}
