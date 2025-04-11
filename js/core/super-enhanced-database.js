// js/core/super-enhanced-database.js
// Genişletilmiş morfem veritabanı

import Morpheme from './morpheme.js';

export default class Database {
    constructor() {
        // Gerçek bir uygulamada bu veriler sunucudan yüklenebilir
        this.morphemes = this.initializeMorphemes();
    }
    
    initializeMorphemes() {
        // Demo morfemler (gerçek uygulamada 482 morfem olacaktır)
        // Burada sadece birkaç örnek sunuyoruz
        const demoMorphemes = [
            // Kökler (isimler)
            new Morpheme('ev', 'ev', 'root', 1),
            new Morpheme('su', 'su', 'root', 1),
            new Morpheme('kitap', 'kitap', 'root', 1),
            new Morpheme('okul', 'okul', 'root', 1),
            new Morpheme('yol', 'yol', 'root', 1),
            new Morpheme('dil', 'dil', 'root', 1),
            
            // Kökler (fiiller)
            new Morpheme('gel', 'gel', 'root', 1),
            new Morpheme('git', 'git', 'root', 1),
            new Morpheme('al', 'al', 'root', 1),
            new Morpheme('ver', 'ver', 'root', 1),
            new Morpheme('gör', 'gör', 'root', 1),
            new Morpheme('bak', 'bak', 'root', 1),
            
            // Ekler (isim çekim ekleri)
            new Morpheme('ler', 'ler', 'suffix', 1),
            new Morpheme('lar', 'lar', 'suffix', 1),
            new Morpheme('de', 'de', 'suffix', 1),
            new Morpheme('da', 'da', 'suffix', 1),
            new Morpheme('den', 'den', 'suffix', 1),
            new Morpheme('dan', 'dan', 'suffix', 1),
            
            // Ekler (yapım ekleri)
            new Morpheme('ci', 'ci', 'suffix', 2),
            new Morpheme('lık', 'lık', 'suffix', 2),
            new Morpheme('li', 'li', 'suffix', 2),
            new Morpheme('siz', 'siz', 'suffix', 2),
            
            // Ekler (fiil çekim ekleri)
            new Morpheme('di', 'di', 'suffix', 2),
            new Morpheme('miş', 'miş', 'suffix', 2),
            new Morpheme('ecek', 'ecek', 'suffix', 2),
            
            // Ekler (fiilden isim)
            new Morpheme('mek', 'mek', 'suffix', 1),
            new Morpheme('ma', 'ma', 'suffix', 1),
            new Morpheme('iş', 'iş', 'suffix', 2),
            
            // Daha karmaşık morfemler
            new Morpheme('bilir', 'bilir', 'suffix', 3),
            new Morpheme('ebilir', 'ebilir', 'suffix', 3),
            new Morpheme('meden', 'meden', 'suffix', 3),
            new Morpheme('dikçe', 'dikçe', 'suffix', 3)
        ];
        
        return demoMorphemes;
    }
    
    // Belirli bir yaş grubu ve zorluk seviyesine göre morfem getir
    getMorphemesByAgeAndDifficulty(ageGroup, difficultyLevel) {
        // Yaş grubuna göre filtreleme
        let filteredMorphemes = [...this.morphemes];
        
        switch(ageGroup) {
            case 'child': // 7-12 yaş: sadece kolay morfemler
                filteredMorphemes = filteredMorphemes.filter(m => m.complexity === 1);
                break;
            case 'teen': // 13-18 yaş: kolay ve orta zorlukta morfemler
                filteredMorphemes = filteredMorphemes.filter(m => m.complexity <= 2);
                break;
            case 'adult': // 19+ yaş: tüm morfemler
                // Filtreleme yok, tüm morfemler kullanılabilir
                break;
            default:
                // Varsayılan olarak tüm morfemleri kullan
                break;
        }
        
        return filteredMorphemes;
    }
    
    // Rastgele morfem al
    getRandomMorphemes(count, ageGroup, difficultyLevel) {
        // Yaş grubu ve zorluk seviyesine göre morfemleri filtrele
        const filteredMorphemes = this.getMorphemesByAgeAndDifficulty(ageGroup, difficultyLevel);
        
        if (filteredMorphemes.length === 0) {
            return [];
        }
        
        // Rastgele morfemler seç
        const selectedMorphemes = [];
        const availableMorphemes = [...filteredMorphemes];
        
        for (let i = 0; i < count && availableMorphemes.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availableMorphemes.length);
            selectedMorphemes.push(availableMorphemes[randomIndex]);
            availableMorphemes.splice(randomIndex, 1);
        }
        
        return selectedMorphemes;
    }
}
