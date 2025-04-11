// js/core/morpheme.js
// Morfem sınıfı

export default class Morpheme {
    constructor(id, text, type = 'root', complexity = 1) {
        this.id = id;
        this.text = text;
        this.type = type; // 'root' (kök), 'suffix' (ek), vb.
        this.complexity = complexity; // Zorluk seviyesi: 1-3
    }
    
    getLength() {
        return this.text.length;
    }
    
    getComplexity() {
        return this.complexity;
    }
    
    isRoot() {
        return this.type === 'root';
    }
    
    isSuffix() {
        return this.type === 'suffix';
    }
}
