// Main application file for MorfemUsta
// Integrates the super-enhanced database and game mechanics

import SuperEnhancedMorphemeDatabase from './core/super-enhanced-database.js';
import EnhancedGameMechanics from './core/updated-game-mechanics.js';

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

    // Utility to get DOM element with error handling
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Element not found: ${selector}`);
        }
        return element;
    }

    // Set up event listeners
    setupEventListeners() {
        // Event delegation for option selections
        const optionsContainer = this.getElement('#options-container');
        if (optionsContainer) {
            optionsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('age-option')) {
                    this.userAgeGroup = e.target.dataset.age;
                    this.showScreen('difficulty-select');
                } else if (e.target.classList.contains('difficulty-option')) {
                    this.userDifficultyLevel = e.target.dataset.difficulty;
                    this.showScreen('mode-select');
                } else if (e.target.classList.contains('mode-option')) {
                    this.userGameMode = e.target.dataset.mode;
                    this.setupGameOptions();
                    this.startGame();
                }
            });
        }

        // Welcome screen
        const startButton = this.getElement('#start-button');
        if (startButton) {
            startButton.addEventListener('click', () => this.showScreen('age-select'));
        }

        // Results screen buttons
        const playAgainButton = this.getElement('#play-again-button');
        if (playAgainButton) {
            playAgainButton.addEventListener('click', () => this.showScreen('age-select'));
        }

        const homeButton = this.getElement('#home-button');
        if (homeButton) {
            homeButton.addEventListener('click', () => this.showScreen('welcome'));
        }
    }

    // Show a specific screen
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        // Show the requested screen
        const screenElement = this.getElement(`#${screenName}-screen`);
        if (screenElement) {
            screenElement.classList.remove('hidden');
        }

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

        switch (this.userGameMode) {
            case 'timed':
                this.gameOptions.timeLimit = this.getTimeLimitForAgeAndDifficulty();
                break;
            case 'target':
                this.gameOptions.targetCount = this.getTargetCountForAgeAndDifficulty();
                break;
            case 'category':
                this.gameOptions.category = this.getRandomCategory();
                break;
            case 'challenge':
                this.gameOptions.morphemeTypes = this.getRandomChallengeTypes();
                break;
        }
    }

    // Get time limit based on age group and difficulty
    getTimeLimitForAgeAndDifficulty() {
        const limits = {
            child: { easy: 120, medium: 90, hard: 60 },
            teen: { easy: 90, medium: 60, hard: 45 },
            adult: { easy: 60, medium: 45, hard: 30 },
        };
        return limits[this.userAgeGroup]?.[this.userDifficultyLevel] || 60;
    }

    // Get target count based on age group and difficulty
    getTargetCountForAgeAndDifficulty() {
        const targets = {
            child: { easy: 5, medium: 8, hard: 10 },
            teen: { easy: 8, medium: 12, hard: 15 },
            adult: { easy: 10, medium: 15, hard: 20 },
        };
        return targets[this.userAgeGroup]?.[this.userDifficultyLevel] || 10;
    }

    // Get random category for category mode
    getRandomCategory() {
        const categories = ["hayvanlar", "bitkiler", "meslekler", "renkler", "yiyecekler", "şehirler", "duygular", "hareketler"];
        return categories[Math.floor(Math.random() * categories.length)];
    }

    // Get random challenge types for challenge mode
    getRandomChallengeTypes() {
        const allTypes = ["verb", "noun", "adjective", "adverb", "plural", "possessive", "case", "tense", "person", "derivational"];
        return allTypes.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
    }

    // Start the game
    startGame() {
        this.gameMechanics.initGame(
            this.userAgeGroup,
            this.userDifficultyLevel,
            this.userGameMode,
            this.gameOptions
        );
        this.showScreen('game');
    }

    // Initialize game screen
    initializeGameScreen() {
        // Clear previous game state
        ['morpheme-container', 'word-building-area', 'feedback-area'].forEach(id => {
            const element = this.getElement(`#${id}`);
            if (element) element.innerHTML = '';
        });
        this.getElement('#score-display').textContent = '0';

        // Update game mode info
        this.updateGameModeInfo();

        // Create morpheme blocks
        this.createMorphemeBlocks();
    }

    // Update game mode specific information
    updateGameModeInfo() {
        const gameModeInfoElement = this.getElement('#game-mode-info');
        if (!gameModeInfoElement) return;

        const infoText = {
            free: "Serbest Mod: İstediğiniz kadar sözcük oluşturun.",
            timed: `Zaman Yarışı: ${this.gameOptions.timeLimit} saniye içinde maksimum puan toplayın.`,
            target: `Hedef Modu: ${this.gameOptions.targetCount} sözcük oluşturun.`,
            category: `Kategori Modu: "${this.gameOptions.category}" kategorisinde sözcükler oluşturun.`,
            challenge: `Meydan Okuma: Sadece şu tipleri kullanın: ${this.gameOptions.morphemeTypes.join(', ')}`,
        };

        gameModeInfoElement.textContent = infoText[this.userGameMode] || '';
    }

    // Create morpheme blocks
    createMorphemeBlocks() {
        const morphemeContainer = this.getElement('#morpheme-container');
        if (!morphemeContainer) return;

        const gameState = this.gameMechanics.getGameState();
        gameState.morphemesInPlay.forEach(morpheme => {
            const morphemeBlock = this.createMorphemeBlock(morpheme);
            morphemeContainer.appendChild(morphemeBlock);
        });
    }

    // Helper function: Create a single morpheme block
    createMorphemeBlock(morpheme) {
        const morphemeBlock = document.createElement('div');
        morphemeBlock.classList.add('morpheme-block', `morpheme-type-${morpheme.type}`, `difficulty-${morpheme.difficulty || 'medium'}`);
        morphemeBlock.dataset.morphemeId = morpheme.id;
        morphemeBlock.dataset.morphemeType = morpheme.type;
        morphemeBlock.dataset.morphemeText = morpheme.text;

        const textElement = document.createElement('span');
        textElement.classList.add('morpheme-text');
        textElement.textContent = morpheme.text;
        morphemeBlock.appendChild(textElement);

        const typeLabel = document.createElement('span');
        typeLabel.classList.add('morpheme-type-label');
        typeLabel.textContent = this.getTypeName(morpheme.type);
        morphemeBlock.appendChild(typeLabel);

        return morphemeBlock;
    }

    // Get Turkish name for morpheme type
    getTypeName(type) {
        const typeMap = {
            verb: 'fiil',
            noun: 'isim',
            adjective: 'sıfat',
            adverb: 'zarf',
            plural: 'çoğul eki',
            possessive: 'iyelik eki',
            case: 'durum eki',
            tense: 'zaman eki',
            person: 'şahıs eki',
            derivational: 'yapım eki',
        };
        return typeMap[type] || type;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MorfemUstaApp();
});

export default MorfemUstaApp;
