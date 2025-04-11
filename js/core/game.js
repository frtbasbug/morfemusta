// js/core/game.js
// Oyun sınıfı - oyunun temel işlevselliklerini içerir

import Database from './super-enhanced-database.js';
import Morpheme from './morpheme.js';
import Word from './word.js';
import Dictionary from '../utils/dictionary.js';
import Scoring from './scoring.js';

export default class Game {
    constructor(ageGroup, difficulty, gameMode) {
        this.ageGroup = ageGroup;
        this.difficulty = difficulty;
        this.gameMode = gameMode;
        this.score = 0;
        this.words = [];
        this.database = new Database();
        this.dictionary = new Dictionary();
        this.scoring = new Scoring(difficulty.level);
        
        // Oyun moduna göre ek özellikleri ayarla
        this.config = gameMode ? gameMode.getDefaults(difficulty.level) : { 
            timeLimit: 0,
            morphemeCount: 8
        };
        
        console.log('Oyun başlatıldı:', { 
            ageGroup, 
            difficulty: difficulty.level,
            gameMode: gameMode ? gameMode.id : 'default',
            config: this.config
        });
    }
    
    getMorphemes(count = 8) {
        // Farklı uygulama senaryolarında gerçek morpheme veritabanından alınabilir
        // Burada basit bir test için demo morfemler oluşturuyoruz
        
        try {
            // Gerçek DB bağlantısı olsaydı buradan alınırdı
            // return this.database.getRandomMorphemes(count, this.ageGroup, this.difficulty.level);
            
            // Demo için morfemler
            const demoMorphemes = [
                { id: 'ev', text: 'ev' },
                { id: 'gel', text: 'gel' },
                { id: 'git', text: 'git' },
                { id: 'ler', text: 'ler' },
                { id: 'lar', text: 'lar' },
                { id: 'ci', text: 'ci' },
                { id: 'di', text: 'di' },
                { id: 'mek', text: 'mek' },
                { id: 'lik', text: 'lik' },
                { id: 'al', text: 'al' },
                { id: 'ver', text: 'ver' },
                { id: 'dur', text: 'dur' },
                { id: 'ma', text: 'ma' },
                { id: 'me', text: 'me' },
                { id: 'siz', text: 'siz' },
                { id: 'iş', text: 'iş' }
            ];
            
            // Rastgele sayıda morfem seç
            const selectedMorphemes = [];
            const availableMorphemes = [...demoMorphemes];
            
            for (let i = 0; i < count && availableMorphemes.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * availableMorphemes.length);
                selectedMorphemes.push(availableMorphemes[randomIndex]);
                availableMorphemes.splice(randomIndex, 1);
            }
            
            return selectedMorphemes;
        } catch (error) {
            console.error('Morfemler alınırken hata oluştu:', error);
            
            // Hata durumunda basit morfemler döndür
            return Array(count).fill().map((_, i) => ({
                id: `morpheme-${i}`,
                text: `mor${i}`
            }));
        }
    }
    
    createWord(morphemes) {
        try {
            if (!morphemes || morphemes.length === 0) {
                return {
                    success: false,
                    message: 'Lütfen en az bir morfem seçin.'
                };
            }
            
            // Morfemleri birleştir
            const wordText = morphemes.map(m => m.text).join('');
            
            // Gerçek uygulamada sözlükte kontrol edilebilir
            // const isValidWord = this.dictionary.checkWord(wordText);
            
            // Demo için her zaman geçerli kabul et
            const isValidWord = true;
            
            if (!isValidWord) {
                return {
                    success: false,
                    message: `"${wordText}" geçerli bir sözcük değil.`
                };
            }
            
            // Sözcüğün puanını hesapla
            const wordScore = this.scoring.calculateScore(morphemes);
            
            // Sözcüğü kaydet
            const newWord = new Word(wordText, morphemes, wordScore);
            this.words.push(newWord);
            
            // Toplam puanı güncelle
            this.score += wordScore;
            
            return {
                success: true,
                word: wordText,
                score: wordScore
            };
        } catch (error) {
            console.error('Sözcük oluşturulurken hata:', error);
            return {
                success: false,
                message: 'Sözcük oluşturulurken bir hata oluştu.'
            };
        }
    }
    
    end() {
        // Oyun sonlandırma işlemleri
        console.log('Oyun sonlandırılıyor...');
        
        // Özet bilgi oluştur
        const summary = {
            totalScore: this.score,
            wordsCreated: this.words.length,
            words: this.words.map(w => ({
                text: w.text,
                score: w.score
            }))
        };
        
        console.log('Oyun özeti:', summary);
        
        return summary;
    }
}
