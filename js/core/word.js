// js/core/word.js
// Sözcük sınıfı

export default class Word {
    constructor(text, morphemes = [], score = 0) {
        this.text = text;
        this.morphemes = morphemes;
        this.score = score;
        this.createdAt = new Date();
    }
    
    getLength() {
        return this.text.length;
    }
    
    getMorphemeCount() {
        return this.morphemes.length;
    }
    
    getLastMorpheme() {
        if (this.morphemes.length === 0) return null;
        return this.morphemes[this.morphemes.length - 1];
    }
}
