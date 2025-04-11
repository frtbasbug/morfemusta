// js/core/scoring.js
// Puanlama sistemi

export default class Scoring {
    constructor(difficultyLevel = 1) {
        this.difficultyLevel = difficultyLevel;
        this.scoreMultiplier = this.getScoreMultiplier(difficultyLevel);
    }
    
    getScoreMultiplier(difficultyLevel) {
        switch(difficultyLevel) {
            case 1: return 1;    // Kolay
            case 2: return 1.5;  // Orta
            case 3: return 2;    // Zor
            default: return 1;
        }
    }
    
    calculateScore(morphemes) {
        if (!morphemes || morphemes.length === 0) return 0;
        
        // Basit bir puanlama algoritması:
        // Her bir morfem 10 puan değerindedir
        const baseScore = morphemes.length * 10;
        
        // Sözcük uzunluğu da puanı artırır
        const wordLength = morphemes.reduce((total, m) => total + m.text.length, 0);
        const lengthBonus = wordLength * 2;
        
        // Toplam puanı hesapla ve zorluk çarpanı ile çarp
        const totalScore = Math.round((baseScore + lengthBonus) * this.scoreMultiplier);
        
        return totalScore;
    }
}
