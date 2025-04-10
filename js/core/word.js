// MorfemUsta: Kelime Fabrikası - Kelime İşleme Sınıfı

class Word {
    constructor() {
        this.morphemes = []; // Kelimeyi oluşturan morfemler
        this.text = ''; // Birleştirilmiş kelime metni
    }

    // Morfem ekle
    addMorpheme(morpheme) {
        this.morphemes.push(morpheme);
        this.updateText();
        return this;
    }

    // Morfem çıkar
    removeMorpheme(morphemeId) {
        this.morphemes = this.morphemes.filter(m => m.id !== morphemeId);
        this.updateText();
        return this;
    }

    // Tüm morfemleri temizle
    clear() {
        this.morphemes = [];
        this.text = '';
        return this;
    }

    // Kelime metnini güncelle
    updateText() {
        this.text = this.morphemes.map(m => m.text).join('');
        return this.text;
    }

    // Kelimenin geçerli olup olmadığını kontrol et
    isValid() {
        // Basit prototip için, en az bir kök ve bir ek içeren kelimeler geçerli kabul edilecek
        const hasRoot = this.morphemes.some(m => m.type === 'root');
        const hasAffix = this.morphemes.some(m => m.type === 'affix');
        
        return hasRoot && hasAffix && this.text.length >= 3;
    }

    // Kelime puanını hesapla
    calculateScore() {
        if (!this.isValid()) return 0;
        
        // Basit puanlama: kelime uzunluğu * ortalama zorluk
        const length = this.text.length;
        const avgDifficulty = this.morphemes.reduce((sum, m) => sum + m.difficulty, 0) / this.morphemes.length;
        
        return Math.round(length * avgDifficulty * 10);
    }
}

// Kelime doğrulama ve sözlük sınıfı
class Dictionary {
    constructor() {
        this.validWords = new Set();
        this.loadDictionary();
    }

    // Sözlük verilerini yükle (şimdilik sabit veriler)
    loadDictionary() {
        // Prototip için basit bir sözlük
        const words = [
            'evler', 'evli', 'evsiz', 'gözlük', 'gözler', 'gözlü', 'gözcü',
            'kitaplar', 'kitaplık', 'kitapçı', 'yollar', 'yolcu', 'yolsuz',
            'başlık', 'başlar', 'başsız', 'gelmek', 'geldi', 'gelecek', 'geliyor',
            'gitmek', 'gitti', 'gidecek', 'gidiyor', 'yapmak', 'yaptı', 'yapacak', 'yapıyor',
            'okumak', 'okudu', 'okuyacak', 'okuyor', 'yazmak', 'yazdı', 'yazacak', 'yazıyor'
        ];
        
        words.forEach(word => this.validWords.add(word));
    }

    // Kelime geçerli mi kontrol et
    isValidWord(word) {
        // Prototip için, oluşturulan kelime sözlükte varsa veya geçerli bir yapıya sahipse kabul et
        return this.validWords.has(word.toLowerCase()) || this.hasValidStructure(word);
    }

    // Kelimenin geçerli bir yapıya sahip olup olmadığını kontrol et
    hasValidStructure(word) {
        // Prototip için basit bir kontrol: en az 3 harf ve bir kök + bir ek yapısı
        // Gerçek uygulamada daha karmaşık morfolojik analiz gerekecek
        return word.length >= 3;
    }

    // Kelime önerileri getir
    getSuggestions(prefix, limit = 5) {
        const suggestions = [];
        
        for (const word of this.validWords) {
            if (word.startsWith(prefix.toLowerCase()) && suggestions.length < limit) {
                suggestions.push(word);
            }
        }
        
        return suggestions;
    }
}
