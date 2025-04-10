// MorfemUsta: Kelime Fabrikası - Morfem Sınıfı

class Morpheme {
    constructor(id, text, type, meaning = '', difficulty = 1) {
        this.id = id;
        this.text = text;
        this.type = type; // 'root' veya 'affix'
        this.meaning = meaning;
        this.difficulty = difficulty; // 1-5 arası zorluk seviyesi
        this.inUse = false; // Morfem şu anda kullanımda mı?
    }

    // HTML element oluşturma
    createHTMLElement() {
        const morphemeBlock = document.createElement('div');
        morphemeBlock.className = `morpheme-block ${this.type}`;
        morphemeBlock.dataset.id = this.id;
        morphemeBlock.dataset.type = this.type;
        morphemeBlock.dataset.text = this.text;
        morphemeBlock.draggable = true;

        // 3D küp oluşturma
        const cube = document.createElement('div');
        cube.className = 'cube';

        // Küp yüzleri
        const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
        faces.forEach(face => {
            const faceDiv = document.createElement('div');
            faceDiv.className = `face ${face}`;
            
            // Ön yüze metin ekle
            if (face === 'front') {
                faceDiv.textContent = this.text;
            }
            
            cube.appendChild(faceDiv);
        });

        morphemeBlock.appendChild(cube);
        return morphemeBlock;
    }

    // Morfem kullanımda olarak işaretle
    markAsUsed() {
        this.inUse = true;
    }

    // Morfem kullanımda değil olarak işaretle
    markAsUnused() {
        this.inUse = false;
    }
}

// Morfem veritabanı
class MorphemeDatabase {
    constructor() {
        this.morphemes = [];
        this.loadMorphemes();
    }

    // Morfemleri yükle (şimdilik sabit veriler)
    loadMorphemes() {
        // Kökler
        const roots = [
            { id: 'r1', text: 'göz', meaning: 'organ of sight', difficulty: 1 },
            { id: 'r2', text: 'ev', meaning: 'house', difficulty: 1 },
            { id: 'r3', text: 'kitap', meaning: 'book', difficulty: 1 },
            { id: 'r4', text: 'yol', meaning: 'road', difficulty: 1 },
            { id: 'r5', text: 'baş', meaning: 'head', difficulty: 1 },
            { id: 'r6', text: 'gel', meaning: 'come', difficulty: 1 },
            { id: 'r7', text: 'git', meaning: 'go', difficulty: 1 },
            { id: 'r8', text: 'yap', meaning: 'do/make', difficulty: 1 },
            { id: 'r9', text: 'oku', meaning: 'read', difficulty: 1 },
            { id: 'r10', text: 'yaz', meaning: 'write', difficulty: 1 }
        ];

        // Ekler
        const affixes = [
            { id: 'a1', text: 'lük', meaning: 'forms nouns from nouns', difficulty: 1 },
            { id: 'a2', text: 'lar', meaning: 'plural suffix', difficulty: 1 },
            { id: 'a3', text: 'cı', meaning: 'profession/occupation', difficulty: 1 },
            { id: 'a4', text: 'lı', meaning: 'with/having', difficulty: 1 },
            { id: 'a5', text: 'sız', meaning: 'without', difficulty: 1 },
            { id: 'a6', text: 'mak', meaning: 'infinitive', difficulty: 1 },
            { id: 'a7', text: 'dı', meaning: 'past tense', difficulty: 1 },
            { id: 'a8', text: 'ecek', meaning: 'future tense', difficulty: 1 },
            { id: 'a9', text: 'iyor', meaning: 'present continuous', difficulty: 1 },
            { id: 'a10', text: 'ci', meaning: 'profession/occupation', difficulty: 1 }
        ];

        // Morfemleri ekle
        roots.forEach(root => {
            this.morphemes.push(new Morpheme(root.id, root.text, 'root', root.meaning, root.difficulty));
        });

        affixes.forEach(affix => {
            this.morphemes.push(new Morpheme(affix.id, affix.text, 'affix', affix.meaning, affix.difficulty));
        });
    }

    // Rastgele morfem seçme
    getRandomMorphemes(rootCount = 3, affixCount = 3) {
        const roots = this.morphemes.filter(m => m.type === 'root' && !m.inUse);
        const affixes = this.morphemes.filter(m => m.type === 'affix' && !m.inUse);
        
        const selectedRoots = this.getRandomElements(roots, rootCount);
        const selectedAffixes = this.getRandomElements(affixes, affixCount);
        
        return [...selectedRoots, ...selectedAffixes];
    }

    // Diziden rastgele elemanlar seçme
    getRandomElements(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // ID'ye göre morfem bulma
    getMorphemeById(id) {
        return this.morphemes.find(m => m.id === id);
    }
}
