// MorfemUsta: Sözcük Fabrikası - Geliştirilmiş Oyun Mantığı

class Game {
    constructor() {
        console.log("Game constructor called");
        this.morphemeDB = new MorphemeDatabase();
        this.dictionary = new Dictionary();
        this.currentWord = new Word();
        this.dragDrop = null;
        this.score = 0;
        this.level = 1;
        this.timer = null;
        this.timeLeft = 0;
        this.isGameActive = false;
        this.lastFeedback = "";
    }

    // Oyunu başlat
    start() {
        console.log("Game.start() called");
        this.isGameActive = true;
        this.score = 0;
        this.level = 1;
        this.updateUI();
        
        // Sürükle-bırak işlevselliğini başlat
        console.log("Creating DragDrop instance");
        this.dragDrop = new DragDrop(this);
        
        // Buton işlevlerini ayarla
        this.setupButtons();
        
        // Yeni morfemler yükle
        console.log("Loading new morphemes");
        this.loadNewMorphemes();
    }

    // Buton işlevlerini ayarla
    setupButtons() {
        console.log("Setting up button event listeners");
        // Sözcük kontrol butonu
        document.getElementById('check-word').addEventListener('click', () => {
            console.log("Check word button clicked");
            this.checkCurrentWord();
        });
        
        // Temizle butonu
        document.getElementById('clear-word').addEventListener('click', () => {
            console.log("Clear button clicked");
            this.clearCurrentWord();
        });
        
        // Yeni morfemler butonu
        document.getElementById('new-morphemes').addEventListener('click', () => {
            console.log("New morphemes button clicked");
            this.loadNewMorphemes();
        });
    }

    // Yeni morfemler yükle
    loadNewMorphemes() {
        console.log("loadNewMorphemes called");
        // Mevcut sözcüğü temizle
        this.clearCurrentWord();
        
        // Seviyeye göre morfem sayısını ayarla
        const rootCount = Math.min(3 + Math.floor(this.level / 2), 5);
        const affixCount = Math.min(3 + Math.floor(this.level / 2), 5);
        
        console.log(`Getting random morphemes: ${rootCount} roots, ${affixCount} affixes`);
        // Rastgele morfemler al
        const morphemes = this.morphemeDB.getRandomMorphemes(rootCount, affixCount);
        console.log(`Got ${morphemes.length} morphemes`);
        
        // Morfem bloklarını oluştur
        if (this.dragDrop) {
            console.log("Creating morpheme blocks");
            this.dragDrop.createMorphemeBlocks(morphemes);
        } else {
            console.error("dragDrop is null, cannot create morpheme blocks");
        }
    }

    // Morfemi sözcüğe ekle
    addMorphemeToWord(morpheme) {
        console.log(`Adding morpheme to word: ${morpheme.text}`);
        this.currentWord.addMorpheme(morpheme);
        this.updateWordDisplay();
    }

    // Morfemi sözcükten çıkar
    removeMorphemeFromWord(morphemeId) {
        console.log(`Removing morpheme from word: ${morphemeId}`);
        this.currentWord.removeMorpheme(morphemeId);
        this.updateWordDisplay();
    }

    // Sözcük gösterimini güncelle
    updateWordDisplay() {
        console.log(`Current word: ${this.currentWord.text}`);
        // Sözcük gösterimi UI güncellemesi burada yapılacak
        // (Şu anda sürükle-bırak ile otomatik güncelleniyor)
        
        // Geri bildirim alanını temizle
        this.clearFeedback();
    }

    // Mevcut sözcüğü kontrol et
    checkCurrentWord() {
        console.log("Checking current word");
        if (this.currentWord.morphemes.length === 0) {
            this.showFeedback('Lütfen bir sözcük oluşturun.', 'warning');
            return;
        }
        
        const word = this.currentWord.text;
        console.log(`Checking word: "${word}"`);
        
        // Geliştirilmiş sözcük doğrulama
        const validationResult = this.dictionary.isValidWord(word);
        
        if (validationResult.valid) {
            // Geçerli sözcük
            const points = this.currentWord.calculateScore();
            this.score += points;
            this.showFeedback(`${validationResult.message} +${points} puan kazandınız.`, 'success');
            
            // Seviye kontrolü
            if (this.score >= this.level * 100) {
                this.levelUp();
            }
            
            // UI güncelle
            this.updateUI();
            
            // Yeni morfemler yükle
            this.loadNewMorphemes();
        } else {
            // Geçersiz sözcük
            this.showFeedback(validationResult.message, 'error');
        }
    }

    // Mevcut sözcüğü temizle
    clearCurrentWord() {
        console.log("Clearing current word");
        // Sözcük gösterimindeki tüm morfem bloklarını morfem konteynerine taşı
        const wordDisplay = document.getElementById('word-display');
        const morphemeContainer = document.getElementById('morpheme-container');
        
        if (!wordDisplay || !morphemeContainer) {
            console.error("Cannot find word-display or morpheme-container elements");
            return;
        }
        
        const blocks = Array.from(wordDisplay.querySelectorAll('.morpheme-block'));
        console.log(`Found ${blocks.length} blocks in word display`);
        
        blocks.forEach(block => {
            const morphemeId = block.dataset.id;
            const morpheme = this.morphemeDB.getMorphemeById(morphemeId);
            
            if (morpheme) {
                morpheme.markAsUnused();
            }
            
            morphemeContainer.appendChild(block);
        });
        
        // Sözcüğü temizle
        this.currentWord.clear();
        
        // Geri bildirim alanını temizle
        this.clearFeedback();
    }

    // Seviye atla
    levelUp() {
        this.level++;
        this.showFeedback(`Tebrikler! Seviye ${this.level}'e yükseldiniz.`, 'success');
    }

    // UI'ı güncelle
    updateUI() {
        console.log(`Updating UI - Score: ${this.score}, Level: ${this.level}`);
        const scoreElement = document.getElementById('score');
        const levelElement = document.getElementById('level');
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
            // Skor artışı animasyonu
            scoreElement.classList.add('score-increase');
            setTimeout(() => {
                scoreElement.classList.remove('score-increase');
            }, 500);
        }
        
        if (levelElement) levelElement.textContent = this.level;
    }

    // Geri bildirim göster
    showFeedback(message, type = 'info') {
        // Konsola yazdır
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Geri bildirim alanını oluştur veya güncelle
        let feedbackElement = document.getElementById('feedback-message');
        
        if (!feedbackElement) {
            feedbackElement = document.createElement('div');
            feedbackElement.id = 'feedback-message';
            
            const gameBoard = document.querySelector('.game-board');
            if (gameBoard) {
                gameBoard.insertBefore(feedbackElement, gameBoard.firstChild);
            }
        }
        
        // Geri bildirim tipine göre stil uygula
        feedbackElement.className = `feedback ${type}`;
        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block';
        
        // Geri bildirimi sakla
        this.lastFeedback = message;
    }
    
    // Geri bildirim alanını temizle
    clearFeedback() {
        const feedbackElement = document.getElementById('feedback-message');
        if (feedbackElement) {
            feedbackElement.style.display = 'none';
        }
    }
}
