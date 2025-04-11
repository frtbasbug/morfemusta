// game-controller.js

// Diğer modülleri import et
import Morpheme from './core/morpheme.js';
import Word from './core/word.js';
import Dictionary from './utils/dictionary.js';
import Difficulty from './core/difficulty.js';
import Scoring from './core/scoring.js';
import { getGameModeById } from './core/gamemode.js';
import Database from './core/super-enhanced-database.js';
import GameMechanics from './core/updated-game-mechanics.js';
import Game from './core/game.js';
import { setupGameInterface } from './game-interface.js';

// Ana oyun kontrolcüsü
class GameController {
    constructor() {
        this.game = null;
        this.difficulty = null;
        this.ageGroup = null;
        this.ageValue = null;
        this.gameMode = null;
    }

    initGame(ageGroup, difficultyLevel, ageValue, gameModeId = 'free') {
        this.ageGroup = ageGroup;
        this.ageValue = ageValue;
        this.difficulty = new Difficulty(difficultyLevel);
        this.gameMode = getGameModeById(gameModeId);
        
        console.log(`Oyun başlatılıyor: Yaş Grubu: ${ageGroup}, Zorluk: ${difficultyLevel}, Yaş: ${ageValue}, Mod: ${gameModeId}`);
        
        // Oyun başlatma
        this.game = new Game(this.ageGroup, this.difficulty, this.gameMode);
        
        // Oyun arayüzüne geçiş
        this.startGameInterface();
        
        return true;
    }
    
    startGameInterface() {
        // Oyun arayüzünü oluştur ve göster
        setupGameInterface(this.game);
        
        // Seçilen oyun modu için özellikleri ayarla
        const gameModeConfig = this.gameMode.getDefaults(this.difficulty.level);
        
        // Zaman sınırı varsa, zamanlayıcıyı başlat
        if (gameModeConfig.timeLimit > 0) {
            this.startTimer(gameModeConfig.timeLimit);
        }
        
        // Morfem bloklarını oluştur
        this.createMorphemeBlocks(gameModeConfig.morphemeCount);
    }
    
    startTimer(seconds) {
        const timerElement = document.getElementById('timer');
        if (!timerElement) return;
        
        let remainingTime = seconds;
        timerElement.textContent = this.formatTime(remainingTime);
        
        this.timer = setInterval(() => {
            remainingTime--;
            timerElement.textContent = this.formatTime(remainingTime);
            
            if (remainingTime <= 0) {
                clearInterval(this.timer);
                this.endGame();
            }
        }, 1000);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }
    
    createMorphemeBlocks(count) {
        // Burada morfem bloklarını oluşturma işlemi yapılacak
        console.log(`${count} morfem bloğu oluşturuluyor...`);
    }
    
    endGame() {
        // Oyunu sonlandır ve sonuçları göster
        console.log('Oyun sona erdi.');
        
        // Sonuç ekranını göster
        this.showResults();
    }
    
    showResults() {
        // Sonuç ekranını hazırla ve göster
        console.log('Sonuçlar gösteriliyor...');
        
        // Burası sonuç ekranı oluşturma işlemleri
    }
    
    resetGame() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.game = null;
        return true;
    }
}

// Singleton olarak dışa aktar
const gameController = new GameController();
export default gameController;
