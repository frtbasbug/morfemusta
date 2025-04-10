// MorfemUsta: Kelime Fabrikası - Sözlük Yardımcı Fonksiyonları

class DictionaryUtils {
    constructor() {
        this.dictionary = new Dictionary();
    }

    // Kelime doğrulama
    validateWord(word) {
        return this.dictionary.isValidWord(word);
    }

    // Kelime önerileri
    getSuggestions(prefix, limit = 5) {
        return this.dictionary.getSuggestions(prefix, limit);
    }

    // Kelime puanını hesapla
    calculateWordScore(word, difficulty = 1) {
        if (!word || word.length < 3) return 0;
        
        // Basit puanlama: kelime uzunluğu * zorluk
        return Math.round(word.length * difficulty * 10);
    }
}

// Kelime doğrulama için yardımcı fonksiyonlar
const dictionaryUtils = new DictionaryUtils();

// Dışa aktarma
window.dictionaryUtils = dictionaryUtils;
