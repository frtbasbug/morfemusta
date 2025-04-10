// Game mechanics integration with super enhanced database
// This file updates the game mechanics to work with the expanded morpheme database

import SuperEnhancedMorphemeDatabase from './super-enhanced-database.js';

class EnhancedGameMechanics {
  constructor() {
    this.database = new SuperEnhancedMorphemeDatabase();
    this.currentAgeGroup = "adult"; // Default: adult
    this.currentDifficultyLevel = "medium"; // Default: medium
    this.currentGameMode = "free"; // Default: free mode
    this.score = 0;
    this.streak = 0;
    this.morphemesInPlay = [];
    this.selectedMorphemes = [];
    this.timeLimit = 0;
    this.timer = null;
    this.targetCount = 0;
    this.wordsCreated = 0;
    this.previousWord = "";
    this.category = "";
    this.challengeMorphemeTypes = [];
  }

  // Initialize game with settings
  initGame(ageGroup, difficultyLevel, gameMode, options = {}) {
    this.currentAgeGroup = ageGroup || "adult";
    this.currentDifficultyLevel = difficultyLevel || "medium";
    this.currentGameMode = gameMode || "free";
    this.score = 0;
    this.streak = 0;
    this.selectedMorphemes = [];
    
    // Set game mode specific settings
    switch(this.currentGameMode) {
      case "timed":
        this.timeLimit = options.timeLimit || this.getDefaultTimeLimit();
        this.startTimer();
        break;
      case "target":
        this.targetCount = options.targetCount || this.getDefaultTargetCount();
        break;
      case "chain":
        this.previousWord = "";
        break;
      case "category":
        this.category = options.category || this.getRandomCategory();
        break;
      case "challenge":
        this.challengeMorphemeTypes = options.morphemeTypes || this.getRandomChallengeTypes();
        break;
    }
    
    // Load morphemes based on age group and difficulty
    this.loadMorphemes();
  }
  
  // Load morphemes from database
  loadMorphemes() {
    const morphemeCount = this.getMorphemeCountForDifficulty();
    const morphemes = this.database.getMorphemesByAgeGroup(this.currentAgeGroup);
    
    // Select random morphemes from each type based on difficulty
    const verbCount = Math.floor(morphemeCount * 0.3); // 30% verbs
    const nounCount = Math.floor(morphemeCount * 0.3); // 30% nouns
    const adjectiveCount = Math.floor(morphemeCount * 0.15); // 15% adjectives
    const adverbCount = Math.floor(morphemeCount * 0.15); // 15% adverbs
    const affixCount = Math.floor(morphemeCount * 0.1); // 10% affixes
    
    // Helper function to get random items from array
    const getRandomItems = (array, count) => {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, array.length));
    };
    
    // Get random morphemes of each type
    const randomVerbs = getRandomItems(morphemes.verbRoots, verbCount);
    const randomNouns = getRandomItems(morphemes.nounRoots, nounCount);
    const randomAdjectives = getRandomItems(morphemes.adjectiveRoots, adjectiveCount);
    const randomAdverbs = getRandomItems(morphemes.adverbRoots, adverbCount);
    const randomAffixes = getRandomItems(morphemes.affixes, affixCount);
    
    // Combine all morphemes
    this.morphemesInPlay = [
      ...randomVerbs,
      ...randomNouns,
      ...randomAdjectives,
      ...randomAdverbs,
      ...randomAffixes
    ];
    
    // Filter morphemes for challenge mode if needed
    if (this.currentGameMode === "challenge" && this.challengeMorphemeTypes.length > 0) {
      this.morphemesInPlay = this.morphemesInPlay.filter(morpheme => 
        this.challengeMorphemeTypes.includes(morpheme.type)
      );
    }
  }
  
  // Get default morpheme count based on difficulty
  getMorphemeCountForDifficulty() {
    switch(this.currentDifficultyLevel) {
      case "easy": return 12;
      case "medium": return 18;
      case "hard": return 24;
      default: return 18;
    }
  }
  
  // Get default time limit based on age group and difficulty
  getDefaultTimeLimit() {
    if (this.currentAgeGroup === "child") {
      switch(this.currentDifficultyLevel) {
        case "easy": return 120; // 2 minutes
        case "medium": return 90; // 1.5 minutes
        case "hard": return 60; // 1 minute
      }
    } else if (this.currentAgeGroup === "teen") {
      switch(this.currentDifficultyLevel) {
        case "easy": return 90; // 1.5 minutes
        case "medium": return 60; // 1 minute
        case "hard": return 45; // 45 seconds
      }
    } else { // adult
      switch(this.currentDifficultyLevel) {
        case "easy": return 60; // 1 minute
        case "medium": return 45; // 45 seconds
        case "hard": return 30; // 30 seconds
      }
    }
    return 60; // Default: 1 minute
  }
  
  // Get default target count based on age group and difficulty
  getDefaultTargetCount() {
    if (this.currentAgeGroup === "child") {
      switch(this.currentDifficultyLevel) {
        case "easy": return 5;
        case "medium": return 8;
        case "hard": return 10;
      }
    } else if (this.currentAgeGroup === "teen") {
      switch(this.currentDifficultyLevel) {
        case "easy": return 8;
        case "medium": return 12;
        case "hard": return 15;
      }
    } else { // adult
      switch(this.currentDifficultyLevel) {
        case "easy": return 10;
        case "medium": return 15;
        case "hard": return 20;
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
  
  // Start timer for timed mode
  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    let timeRemaining = this.timeLimit;
    this.timer = setInterval(() => {
      timeRemaining--;
      
      // Update UI with time remaining
      this.updateTimerDisplay(timeRemaining);
      
      if (timeRemaining <= 0) {
        clearInterval(this.timer);
        this.endGame();
      }
    }, 1000);
  }
  
  // Update timer display
  updateTimerDisplay(timeRemaining) {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      timerElement.textContent = `Kalan Süre: ${timeRemaining} saniye`;
    }
  }
  
  // Add morpheme to selected list
  addMorpheme(morpheme) {
    this.selectedMorphemes.push(morpheme);
    return this.selectedMorphemes;
  }
  
  // Remove morpheme from selected list
  removeMorpheme(morphemeId) {
    this.selectedMorphemes = this.selectedMorphemes.filter(m => m.id !== morphemeId);
    return this.selectedMorphemes;
  }
  
  // Clear selected morphemes
  clearSelectedMorphemes() {
    this.selectedMorphemes = [];
    return this.selectedMorphemes;
  }
  
  // Submit word for validation
  submitWord() {
    if (this.selectedMorphemes.length === 0) {
      return {
        valid: false,
        message: "Lütfen en az bir morfem seçin.",
        score: 0
      };
    }
    
    // Validate word based on game mode
    let validationResult = this.validateWordForGameMode();
    
    if (validationResult.valid) {
      // Calculate score
      const wordScore = this.calculateScore();
      
      // Update game state
      this.score += wordScore;
      this.streak++;
      this.wordsCreated++;
      
      // Update previous word for chain mode
      if (this.currentGameMode === "chain") {
        const wordText = this.getWordText();
        this.previousWord = wordText;
      }
      
      // Check if target reached for target mode
      if (this.currentGameMode === "target" && this.wordsCreated >= this.targetCount) {
        this.endGame();
      }
      
      validationResult.score = wordScore;
    } else {
      // Reset streak on invalid word
      this.streak = 0;
    }
    
    return validationResult;
  }
  
  // Validate word based on current game mode
  validateWordForGameMode() {
    // Basic validation - check if the word structure makes sense
    // This is a simplified validation that could be expanded with more linguistic rules
    
    // Check if there's at least one root
    const hasRoot = this.selectedMorphemes.some(m => 
      ['verb', 'noun', 'adjective', 'adverb'].includes(m.type)
    );
    
    if (!hasRoot) {
      return {
        valid: false,
        message: "Geçerli bir sözcük için en az bir kök morfem gereklidir."
      };
    }
    
    // Check affix compatibility and order
    // This is a simplified version - a real implementation would have more complex rules
    const rootTypes = this.selectedMorphemes
      .filter(m => ['verb', 'noun', 'adjective', 'adverb'].includes(m.type))
      .map(m => m.type);
    
    const affixes = this.selectedMorphemes
      .filter(m => !['verb', 'noun', 'adjective', 'adverb'].includes(m.type));
    
    // Check if affixes are compatible with the roots
    // This is a very simplified check
    for (const affix of affixes) {
      if (affix.compatibleWith && !affix.compatibleWith.some(type => rootTypes.includes(type))) {
        return {
          valid: false,
          message: `'${affix.text}' eki seçilen kök morfemlerle uyumlu değil.`
        };
      }
    }
    
    // Additional validation based on game mode
    switch(this.currentGameMode) {
      case "chain":
        return this.validateChainWord();
      case "category":
        return this.validateCategoryWord();
      default:
        return {
          valid: true,
          message: "Tebrikler! Geçerli bir sözcük oluşturdunuz."
        };
    }
  }
  
  // Validate word for chain mode
  validateChainWord() {
    if (this.previousWord === "") {
      // First word in chain, no validation needed
      return {
        valid: true,
        message: "Tebrikler! İlk sözcüğü oluşturdunuz. Bir sonraki sözcük bu sözcüğün son harfiyle başlamalı."
      };
    }
    
    const wordText = this.getWordText();
    const lastChar = this.previousWord.charAt(this.previousWord.length - 1);
    const firstChar = wordText.charAt(0);
    
    if (firstChar !== lastChar) {
      return {
        valid: false,
        message: `Sözcük zinciri kuralına göre, sözcüğünüz '${lastChar}' harfi ile başlamalı.`
      };
    }
    
    return {
      valid: true,
      message: "Tebrikler! Sözcük zincirini başarıyla devam ettirdiniz."
    };
  }
  
  // Validate word for category mode
  validateCategoryWord() {
    // This is a simplified validation for category mode
    // In a real implementation, you would check if the word belongs to the category
    // using a category database or API
    
    return {
      valid: true,
      message: `Tebrikler! '${this.category}' kategorisine uygun bir sözcük oluşturdunuz.`
    };
  }
  
  // Get text representation of current word
  getWordText() {
    return this.selectedMorphemes.map(m => m.text).join("");
  }
  
  // Calculate score for current word
  calculateScore() {
    // Base score calculation
    let score = 0;
    
    // Points for each morpheme based on difficulty
    for (const morpheme of this.selectedMorphemes) {
      switch(morpheme.difficulty) {
        case "easy":
          score += 10;
          break;
        case "medium":
          score += 20;
          break;
        case "hard":
          score += 30;
          break;
        default:
          score += 10;
      }
    }
    
    // Bonus for word length
    score += this.selectedMorphemes.length * 5;
    
    // Apply streak bonus
    if (this.streak > 1) {
      score = Math.floor(score * (1 + (this.streak * 0.1)));
    }
    
    // Apply game mode specific bonuses
    switch(this.currentGameMode) {
      case "timed":
        // Faster submissions get higher scores in timed mode
        score = Math.floor(score * 1.2);
        break;
      case "chain":
        // Longer chains get higher scores
        score = Math.floor(score * (1 + (this.wordsCreated * 0.05)));
        break;
      case "category":
        // Category mode has a fixed bonus
        score = Math.floor(score * 1.1);
        break;
      case "challenge":
        // Challenge mode has a higher bonus
        score = Math.floor(score * 1.3);
        break;
    }
    
    return score;
  }
  
  // End the game
  endGame() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    // Prepare game results
    const results = {
      score: this.score,
      wordsCreated: this.wordsCreated,
      maxStreak: this.streak,
      gameMode: this.currentGameMode,
      ageGroup: this.currentAgeGroup,
      difficultyLevel: this.currentDifficultyLevel
    };
    
    // Trigger game over event
    this.triggerGameOver(results);
    
    return results;
  }
  
  // Trigger game over event
  triggerGameOver(results) {
    const event = new CustomEvent('gameOver', { detail: results });
    document.dispatchEvent(event);
  }
  
  // Get current game state
  getGameState() {
    return {
      ageGroup: this.currentAgeGroup,
      difficultyLevel: this.currentDifficultyLevel,
      gameMode: this.currentGameMode,
      score: this.score,
      streak: this.streak,
      morphemesInPlay: this.morphemesInPlay,
      selectedMorphemes: this.selectedMorphemes,
      wordsCreated: this.wordsCreated
    };
  }
}

export default EnhancedGameMechanics;
