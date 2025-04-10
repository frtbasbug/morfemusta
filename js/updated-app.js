// Main application file for MorfemUsta
// Integrates the super enhanced database and game mechanics

import SuperEnhancedMorphemeDatabase from './core/super-enhanced-database.js';
import EnhancedGameMechanics from './core/enhanced-game-mechanics.js';

// Main application class
class MorfemUstaApp {
  constructor() {
    this.database = new SuperEnhancedMorphemeDatabase();
    this.gameMechanics = new EnhancedGameMechanics();
    this.currentScreen = 'welcome'; // welcome, age-select, difficulty-select, mode-select, game, results
    this.userAgeGroup = '';
    this.userDifficultyLevel = '';
    this.userGameMode = '';
    this.gameOptions = {};
    
    // Initialize the application
    this.init();
  }
  
  // Initialize the application
  init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Show welcome screen
    this.showScreen('welcome');
    
    // Listen for game over event
    document.addEventListener('gameOver', (event) => {
      this.handleGameOver(event.detail);
    });
  }
  
  // Set up event listeners
  setupEventListeners() {
    // Welcome screen
    document.getElementById('start-button').addEventListener('click', () => {
      this.showScreen('age-select');
    });
    
    // Age selection
    document.querySelectorAll('.age-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.userAgeGroup = e.target.dataset.age;
        this.showScreen('difficulty-select');
      });
    });
    
    // Difficulty selection
    document.querySelectorAll('.difficulty-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.userDifficultyLevel = e.target.dataset.difficulty;
        this.showScreen('mode-select');
      });
    });
    
    // Game mode selection
    document.querySelectorAll('.mode-option').forEach(option => {
      option.addEventListener('click', (e) => {
        this.userGameMode = e.target.dataset.mode;
        this.setupGameOptions();
        this.startGame();
      });
    });
    
    // Game screen
    document.getElementById('submit-word-button').addEventListener('click', () => {
      this.submitWord();
    });
    
    document.getElementById('clear-button').addEventListener('click', () => {
      this.clearSelectedMorphemes();
    });
    
    // Results screen
    document.getElementById('play-again-button').addEventListener('click', () => {
      this.showScreen('age-select');
    });
    
    document.getElementById('home-button').addEventListener('click', () => {
      this.showScreen('welcome');
    });
    
    // Morpheme selection
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('morpheme-block')) {
        this.handleMorphemeClick(e.target);
      }
    });
  }
  
  // Show a specific screen
  showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    // Show the requested screen
    document.getElementById(`${screenName}-screen`).classList.remove('hidden');
    
    // Update current screen
    this.currentScreen = screenName;
    
    // Perform any screen-specific initialization
    if (screenName === 'game') {
      this.initializeGameScreen();
    }
  }
  
  // Set up game options based on selected game mode
  setupGameOptions() {
    this.gameOptions = {};
    
    switch(this.userGameMode) {
      case 'timed':
        // For timed mode, set time limit
        this.gameOptions.timeLimit = this.getTimeLimitForAgeAndDifficulty();
        break;
      case 'target':
        // For target mode, set target word count
        this.gameOptions.targetCount = this.getTargetCountForAgeAndDifficulty();
        break;
      case 'category':
        // For category mode, select a random category
        this.gameOptions.category = this.getRandomCategory();
        break;
      case 'challenge':
        // For challenge mode, select random morpheme types
        this.gameOptions.morphemeTypes = this.getRandomChallengeTypes();
        break;
    }
  }
  
  // Get time limit based on age group and difficulty
  getTimeLimitForAgeAndDifficulty() {
    if (this.userAgeGroup === 'child') {
      switch(this.userDifficultyLevel) {
        case 'easy': return 120; // 2 minutes
        case 'medium': return 90; // 1.5 minutes
        case 'hard': return 60; // 1 minute
      }
    } else if (this.userAgeGroup === 'teen') {
      switch(this.userDifficultyLevel) {
        case 'easy': return 90; // 1.5 minutes
        case 'medium': return 60; // 1 minute
        case 'hard': return 45; // 45 seconds
      }
    } else { // adult
      switch(this.userDifficultyLevel) {
        case 'easy': return 60; // 1 minute
        case 'medium': return 45; // 45 seconds
        case 'hard': return 30; // 30 seconds
      }
    }
    return 60; // Default: 1 minute
  }
  
  // Get target count based on age group and difficulty
  getTargetCountForAgeAndDifficulty() {
    if (this.userAgeGroup === 'child') {
      switch(this.userDifficultyLevel) {
        case 'easy': return 5;
        case 'medium': return 8;
        case 'hard': return 10;
      }
    } else if (this.userAgeGroup === 'teen') {
      switch(this.userDifficultyLevel) {
        case 'easy': return 8;
        case 'medium': return 12;
        case 'hard': return 15;
      }
    } else { // adult
      switch(this.userDifficultyLevel) {
        case 'easy': return 10;
        case 'medium': return 15;
        case 'hard': return 20;
      }
    }
    return 10; // Default: 10 words
  }
  
  // Get random category for category mode
  getRandomCategory() {
    const categories = ["hayvanlar", "bitkiler", "meslekler", "renkler", "yiyecekler", "şehirler", "duygular", "hareketler"];
    return categories[Math.floor(Math.random() * categories.length)];
  }
  
  // Get random challenge types for challenge mode
  getRandomChallengeTypes() {
    const allTypes = ["verb", "noun", "adjective", "adverb", "plural", "possessive", "case", "tense", "person", "derivational"];
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 types
    const shuffled = [...allTypes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
  
  // Start the game
  startGame() {
    // Initialize game mechanics with selected options
    this.gameMechanics.initGame(
      this.userAgeGroup,
      this.userDifficultyLevel,
      this.userGameMode,
      this.gameOptions
    );
    
    // Show game screen
    this.showScreen('game');
  }
  
  // Initialize game screen
  initializeGameScreen() {
    // Clear previous game state
    document.getElementById('morpheme-container').innerHTML = '';
    document.getElementById('word-building-area').innerHTML = '';
    document.getElementById('feedback-area').innerHTML = '';
    document.getElementById('score-display').textContent = '0';
    
    // Update game mode info
    this.updateGameModeInfo();
    
    // Create morpheme blocks
    this.createMorphemeBlocks();
  }
  
  // Update game mode specific information
  updateGameModeInfo() {
    const gameModeInfoElement = document.getElementById('game-mode-info');
    let infoText = '';
    
    switch(this.userGameMode) {
      case 'free':
        infoText = 'Serbest Mod: İstediğiniz kadar sözcük oluşturun.';
        break;
      case 'timed':
        infoText = `Zaman Yarışı: ${this.gameOptions.timeLimit} saniye içinde maksimum puan toplayın.`;
        // Show timer
        document.getElementById('timer').classList.remove('hidden');
        break;
      case 'target':
        infoText = `Hedef Modu: ${this.gameOptions.targetCount} sözcük oluşturun.`;
        // Show target counter
        document.getElementById('target-counter').classList.remove('hidden');
        document.getElementById('target-counter').textContent = `0 / ${this.gameOptions.targetCount}`;
        break;
      case 'chain':
        infoText = 'Sözcük Zinciri: Her sözcük bir öncekinin son harfiyle başlamalı.';
        break;
      case 'category':
        infoText = `Kategori Modu: "${this.gameOptions.category}" kategorisinde sözcükler oluşturun.`;
        break;
      case 'challenge':
        const typeNames = this.gameOptions.morphemeTypes.map(type => this.getTypeName(type)).join(', ');
        infoText = `Meydan Okuma: Sadece şu tipleri kullanın: ${typeNames}`;
        break;
    }
    
    gameModeInfoElement.textContent = infoText;
  }
  
  // Get Turkish name for morpheme type
  getTypeName(type) {
    const typeMap = {
      'verb': 'fiil',
      'noun': 'isim',
      'adjective': 'sıfat',
      'adverb': 'zarf',
      'plural': 'çoğul eki',
      'possessive': 'iyelik eki',
      'case': 'durum eki',
      'tense': 'zaman eki',
      'person': 'şahıs eki',
      'derivational': 'yapım eki'
    };
    
    return typeMap[type] || type;
  }
  
  // Create morpheme blocks
  createMorphemeBlocks() {
    const morphemeContainer = document.getElementById('morpheme-container');
    const gameState = this.gameMechanics.getGameState();
    
    gameState.morphemesInPlay.forEach(morpheme => {
      const morphemeBlock = document.createElement('div');
      morphemeBlock.classList.add('morpheme-block');
      morphemeBlock.classList.add(`morpheme-type-${morpheme.type}`);
      morphemeBlock.dataset.morphemeId = morpheme.id;
      morphemeBlock.dataset.morphemeType = morpheme.type;
      morphemeBlock.dataset.morphemeText = morpheme.text;
      
      // Add difficulty class for styling
      morphemeBlock.classList.add(`difficulty-${morpheme.difficulty || 'medium'}`);
      
      // Create text element
      const textElement = document.createElement('span');
      textElement.classList.add('morpheme-text');
      textElement.textContent = morpheme.text;
      morphemeBlock.appendChild(textElement);
      
      // Create type label
      const typeLabel = document.createElement('span');
      typeLabel.classList.add('morpheme-type-label');
      typeLabel.textContent = this.getTypeName(morpheme.type);
      morphemeBlock.appendChild(typeLabel);
      
      // Add to container
      morphemeContainer.appendChild(morphemeBlock);
    });
  }
  
  // Handle morpheme block click
  handleMorphemeClick(morphemeElement) {
    const morphemeId = morphemeElement.dataset.morphemeId;
    const morphemeType = morphemeElement.dataset.morphemeType;
    const morphemeText = morphemeElement.dataset.morphemeText;
    
    // Find the morpheme in the game state
    const gameState = this.gameMechanics.getGameState();
    const morpheme = gameState.morphemesInPlay.find(m => m.id === morphemeId);
    
    if (!morpheme) return;
    
    // Check if already selected
    if (morphemeElement.classList.contains('selected')) {
      // Remove from selected
      this.gameMechanics.removeMorpheme(morphemeId);
      morphemeElement.classList.remove('selected');
      
      // Remove from word building area
      const wordBuildingArea = document.getElementById('word-building-area');
      const selectedBlock = wordBuildingArea.querySelector(`[data-morpheme-id="${morphemeId}"]`);
      if (selectedBlock) {
        wordBuildingArea.removeChild(selectedBlock);
      }
    } else {
      // Add to selected
      this.gameMechanics.addMorpheme(morpheme);
      morphemeElement.classList.add('selected');
      
      // Add to word building area
      const wordBuildingArea = document.getElementById('word-building-area');
      const selectedBlock = morphemeElement.cloneNode(true);
      selectedBlock.classList.add('selected-morpheme');
      wordBuildingArea.appendChild(selectedBlock);
    }
  }
  
  // Submit the current word
  submitWord() {
    const result = this.gameMechanics.submitWord();
    
    // Display feedback
    this.displayFeedback(result);
    
    // Update score
    this.updateScore();
    
    // Update game mode specific displays
    this.updateGameModeDisplays();
    
    // Clear selected morphemes if valid
    if (result.valid) {
      this.clearSelectedMorphemes();
      
      // Show confetti animation for correct answers
      this.showConfetti();
    }
  }
  
  // Display feedback for word submission
  displayFeedback(result) {
    const feedbackArea = document.getElementById('feedback-area');
    feedbackArea.innerHTML = '';
    
    const feedbackElement = document.createElement('div');
    feedbackElement.classList.add('feedback');
    feedbackElement.classList.add(result.valid ? 'feedback-valid' : 'feedback-invalid');
    
    // Create message element
    const messageElement = document.createElement('p');
    messageElement.textContent = result.message;
    feedbackElement.appendChild(messageElement);
    
    // Add score if valid
    if (result.valid && result.score) {
      const scoreElement = document.createElement('p');
      scoreElement.classList.add('feedback-score');
      scoreElement.textContent = `+${result.score} puan`;
      feedbackElement.appendChild(scoreElement);
    }
    
    feedbackArea.appendChild(feedbackElement);
    
    // Auto-hide feedback after 5 seconds
    setTimeout(() => {
      feedbackElement.classList.add('fade-out');
      setTimeout(() => {
        if (feedbackArea.contains(feedbackElement)) {
          feedbackArea.removeChild(feedbackElement);
        }
      }, 500);
    }, 5000);
  }
  
  // Update score display
  updateScore() {
    const scoreDisplay = document.getElementById('score-display');
    const gameState = this.gameMechanics.getGameState();
    scoreDisplay.textContent = gameState.score;
    
    // Add animation for score change
    scoreDisplay.classList.add('score-change');
    setTimeout(() => {
      scoreDisplay.classList.remove('score-change');
    }, 500);
  }
  
  // Update game mode specific displays
  updateGameModeDisplays() {
    const gameState = this.gameMechanics.getGameState();
    
    switch(this.userGameMode) {
      case 'target':
        // Update target counter
        const targetCounter = document.getElementById('target-counter');
        targetCounter.textContent = `${gameState.wordsCreated} / ${this.gameOptions.targetCount}`;
        break;
      case 'chain':
        // Update previous word display
        const previousWordDisplay = document.getElementById('previous-word');
        if (previousWordDisplay) {
          previousWordDisplay.textContent = `Önceki Sözcük: ${this.gameMechanics.previousWord || '-'}`;
        }
        break;
    }
  }
  
  // Clear selected morphemes
  clearSelectedMorphemes() {
    // Clear in game mechanics
    this.gameMechanics.clearSelectedMorphemes();
    
    // Clear in UI
    document.querySelectorAll('.morpheme-block.selected').forEach(block => {
      block.classList.remove('selected');
    });
    
    document.getElementById('word-building-area').innerHTML = '';
  }
  
  // Show confetti animation for correct answers
  showConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    confettiContainer.innerHTML = '';
    
    // Create confetti pieces
    const confettiCount = 50;
    const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
    
    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.classList.add('confetti');
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.animationDelay = `${Math.random() * 3}s`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confettiContainer.appendChild(confetti);
    }
    
    // Remove confetti after animation
    setTimeout(() => {
      confettiContainer.innerHTML = '';
    }, 3000);
  }
  
  // Handle game over
  handleGameOver(results) {
    // Update results screen
    document.getElementById('final-score').textContent = results.score;
    document.getElementById('words-created').textContent = results.wordsCreated;
    document.getElementById('max-streak').textContent = results.maxStreak;
    
    // Show results screen
    this.showScreen('results');
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MorfemUstaApp();
});

export default MorfemUstaApp;
