// Game Controller - Handles game initialization, state management, and gameplay logic
class GameController {
  constructor() {
    this.gameState = {
      mode: 'free', // free, time, chain, category
      difficulty: '1', // 1: easy, 2: medium, 3: hard
      ageGroup: 'adult', // child, teen, adult
      score: 0,
      timeRemaining: 0,
      createdWords: [],
      availableMorphemes: [],
      currentWord: [],
      isGameActive: false
    };
    
    this.database = null;
    this.gameMechanics = null;
    this.timerInterval = null;
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  // Initialize the game with selected options
  initGame(mode, difficulty, ageGroup) {
    console.log(`Initializing game: Mode=${mode}, Difficulty=${difficulty}, AgeGroup=${ageGroup}`);
    
    // Set game state
    this.gameState.mode = mode;
    this.gameState.difficulty = difficulty;
    this.gameState.ageGroup = ageGroup;
    this.gameState.score = 0;
    this.gameState.createdWords = [];
    this.gameState.currentWord = [];
    this.gameState.isGameActive = true;
    
    // Initialize database and game mechanics
    this.database = new SuperEnhancedMorphemeDatabase();
    this.gameMechanics = new EnhancedGameMechanics();
    
    // Set time based on mode
    if (mode === 'time') {
      this.gameState.timeRemaining = this.getDifficultyBasedTime(difficulty);
      this.startTimer();
    }
    
    // Generate initial morphemes
    this.generateMorphemes();
    
    // Update UI
    this.updateGameUI();
    
    // Show game play section
    this.showSection('game-play-section');
    
    console.log('Game initialized successfully');
  }
  
  // Get time limit based on difficulty
  getDifficultyBasedTime(difficulty) {
    switch(difficulty) {
      case '1': return 180; // 3 minutes for easy
      case '2': return 120; // 2 minutes for medium
      case '3': return 60;  // 1 minute for hard
      default: return 180;
    }
  }
  
  // Start the game timer
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    const timerElement = document.getElementById('time-remaining');
    
    this.timerInterval = setInterval(() => {
      this.gameState.timeRemaining--;
      
      if (this.gameState.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.endGame();
      }
      
      // Update timer display
      const minutes = Math.floor(this.gameState.timeRemaining / 60);
      const seconds = this.gameState.timeRemaining % 60;
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }
  
  // Generate morphemes based on difficulty and age group
  generateMorphemes() {
    const morphemeCount = this.getDifficultyBasedMorphemeCount(this.gameState.difficulty);
    
    // Get morphemes from database based on age group
    let morphemes = [];
    switch(this.gameState.ageGroup) {
      case 'child':
        morphemes = this.database.getChildMorphemes();
        break;
      case 'teen':
        morphemes = this.database.getTeenMorphemes();
        break;
      case 'adult':
      default:
        morphemes = this.database.getAdultMorphemes();
        break;
    }
    
    // Randomly select morphemes
    this.gameState.availableMorphemes = this.getRandomMorphemes(morphemes, morphemeCount);
    
    console.log(`Generated ${morphemeCount} morphemes for ${this.gameState.ageGroup} age group`);
  }
  
  // Get number of morphemes based on difficulty
  getDifficultyBasedMorphemeCount(difficulty) {
    switch(difficulty) {
      case '1': return 6;  // 6 morphemes for easy
      case '2': return 8;  // 8 morphemes for medium
      case '3': return 10; // 10 morphemes for hard
      default: return 6;
    }
  }
  
  // Get random morphemes from the pool
  getRandomMorphemes(morphemePool, count) {
    const shuffled = [...morphemePool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  // Add morpheme to current word
  addMorphemeToWord(morpheme) {
    this.gameState.currentWord.push(morpheme);
    this.updateCurrentWordDisplay();
  }
  
  // Remove morpheme from current word
  removeMorphemeFromWord(index) {
    this.gameState.currentWord.splice(index, 1);
    this.updateCurrentWordDisplay();
  }
  
  // Clear current word
  clearCurrentWord() {
    this.gameState.currentWord = [];
    this.updateCurrentWordDisplay();
  }
  
  // Submit current word
  submitWord() {
    if (this.gameState.currentWord.length === 0) {
      alert('Lütfen bir sözcük oluşturmak için morfem seçin.');
      return;
    }
    
    // Create word from morphemes
    const word = this.gameMechanics.createWordFromMorphemes(this.gameState.currentWord);
    
    // Validate word
    if (!this.gameMechanics.isValidWord(word)) {
      alert('Geçersiz sözcük. Lütfen geçerli bir sözcük oluşturun.');
      return;
    }
    
    // Check if word already exists
    if (this.gameState.createdWords.some(w => w.word === word.word)) {
      alert('Bu sözcüğü zaten oluşturdunuz.');
      return;
    }
    
    // Add word to created words
    this.gameState.createdWords.push(word);
    
    // Calculate score
    const wordScore = this.gameMechanics.calculateWordScore(word, this.gameState.difficulty);
    this.gameState.score += wordScore;
    
    // Update UI
    this.updateCreatedWordsList();
    this.updateScoreDisplay();
    
    // Clear current word
    this.clearCurrentWord();
    
    // Generate new morphemes if needed (based on game mode)
    if (this.gameState.mode === 'chain') {
      // In chain mode, keep the last morpheme
      const lastMorpheme = this.gameState.currentWord[this.gameState.currentWord.length - 1];
      this.clearCurrentWord();
      this.addMorphemeToWord(lastMorpheme);
    }
    
    console.log(`Word "${word.word}" submitted. Score: ${wordScore}`);
  }
  
  // End the game
  endGame() {
    this.gameState.isGameActive = false;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    // Update results screen
    document.getElementById('final-score').textContent = this.gameState.score;
    document.getElementById('words-count').textContent = this.gameState.createdWords.length;
    
    // Calculate time played
    let timePlayed = '';
    if (this.gameState.mode === 'time') {
      const totalSeconds = this.getDifficultyBasedTime(this.gameState.difficulty);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      timePlayed = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timePlayed = 'Sınırsız';
    }
    document.getElementById('time-played').textContent = timePlayed;
    
    // Update final words list
    const finalWordsList = document.getElementById('final-words-list');
    finalWordsList.innerHTML = '';
    
    this.gameState.createdWords.forEach(word => {
      const listItem = document.createElement('li');
      listItem.textContent = `${word.word} (${this.gameMechanics.calculateWordScore(word, this.gameState.difficulty)} puan)`;
      finalWordsList.appendChild(listItem);
    });
    
    // Show results section
    this.showSection('results-section');
    
    console.log('Game ended. Final score:', this.gameState.score);
  }
  
  // Update game UI
  updateGameUI() {
    // Update mode and difficulty display
    document.getElementById('current-mode').textContent = this.getModeDisplayName(this.gameState.mode);
    document.getElementById('current-difficulty').textContent = this.getDifficultyDisplayName(this.gameState.difficulty);
    
    // Update score display
    this.updateScoreDisplay();
    
    // Update timer display if in time mode
    if (this.gameState.mode === 'time') {
      document.getElementById('timer-container').style.display = 'block';
      const minutes = Math.floor(this.gameState.timeRemaining / 60);
      const seconds = this.gameState.timeRemaining % 60;
      document.getElementById('time-remaining').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      document.getElementById('timer-container').style.display = 'none';
    }
    
    // Update available morphemes
    this.updateAvailableMorphemesDisplay();
    
    // Update current word display
    this.updateCurrentWordDisplay();
    
    // Update created words list
    this.updateCreatedWordsList();
  }
  
  // Update score display
  updateScoreDisplay() {
    document.getElementById('current-score').textContent = this.gameState.score;
  }
  
  // Update available morphemes display
  updateAvailableMorphemesDisplay() {
    const container = document.getElementById('available-morphemes');
    container.innerHTML = '';
    
    this.gameState.availableMorphemes.forEach((morpheme, index) => {
      const morphemeElement = document.createElement('div');
      morphemeElement.className = 'morpheme-block';
      morphemeElement.textContent = morpheme.text;
      morphemeElement.dataset.index = index;
      morphemeElement.dataset.type = morpheme.type;
      
      // Add click event
      morphemeElement.addEventListener('click', () => {
        this.addMorphemeToWord(morpheme);
      });
      
      container.appendChild(morphemeElement);
    });
  }
  
  // Update current word display
  updateCurrentWordDisplay() {
    const container = document.getElementById('current-word');
    container.innerHTML = '';
    
    this.gameState.currentWord.forEach((morpheme, index) => {
      const morphemeElement = document.createElement('div');
      morphemeElement.className = 'morpheme-block selected';
      morphemeElement.textContent = morpheme.text;
      morphemeElement.dataset.index = index;
      
      // Add click event to remove
      morphemeElement.addEventListener('click', () => {
        this.removeMorphemeFromWord(index);
      });
      
      container.appendChild(morphemeElement);
    });
  }
  
  // Update created words list
  updateCreatedWordsList() {
    const container = document.getElementById('created-words-list');
    container.innerHTML = '';
    
    this.gameState.createdWords.forEach(word => {
      const listItem = document.createElement('li');
      listItem.textContent = `${word.word} (${this.gameMechanics.calculateWordScore(word, this.gameState.difficulty)} puan)`;
      container.appendChild(listItem);
    });
  }
  
  // Get display name for game mode
  getModeDisplayName(mode) {
    switch(mode) {
      case 'free': return 'Serbest Mod';
      case 'time': return 'Zaman Yarışı';
      case 'chain': return 'Sözcük Zinciri';
      case 'category': return 'Kategori Modu';
      default: return 'Serbest Mod';
    }
  }
  
  // Get display name for difficulty
  getDifficultyDisplayName(difficulty) {
    switch(difficulty) {
      case '1': return 'Kolay';
      case '2': return 'Orta';
      case '3': return 'Zor';
      default: return 'Kolay';
    }
  }
  
  // Show section and hide others
  showSection(sectionId) {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
      section.style.display = section.id === sectionId ? 'block' : 'none';
    });
  }
  
  // Initialize event listeners
  initEventListeners() {
    // These will be set up when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
      // Game control buttons
      const submitWordBtn = document.getElementById('submit-word');
      const clearWordBtn = document.getElementById('clear-word');
      const newMorphemesBtn = document.getElementById('new-morphemes');
      const endGameBtn = document.getElementById('end-game');
      
      // Result screen buttons
      const playAgainBtn = document.getElementById('play-again');
      const backToHomeBtn = document.getElementById('back-to-home');
      
      if (submitWordBtn) {
        submitWordBtn.addEventListener('click', () => this.submitWord());
      }
      
      if (clearWordBtn) {
        clearWordBtn.addEventListener('click', () => this.clearCurrentWord());
      }
      
      if (newMorphemesBtn) {
        newMorphemesBtn.addEventListener('click', () => {
          this.generateMorphemes();
          this.updateAvailableMorphemesDisplay();
        });
      }
      
      if (endGameBtn) {
        endGameBtn.addEventListener('click', () => this.endGame());
      }
      
      if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
          // Go back to age selection
          this.showSection('age-selection-section');
        });
      }
      
      if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', () => {
          // Go back to intro
          this.showSection('intro-section');
        });
      }
    });
  }
}

// Export the GameController class
export default GameController;
