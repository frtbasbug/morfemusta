// Game Interface Integration - Connects all game components
import GameController from './game-controller.js';

// Game screens HTML template
const gameScreensHTML = `
<section class="game-modes" id="game-modes-section" style="display: none;">
  <h2>Oyun Modunu Seçin</h2>
  <div class="game-modes-container" role="group" aria-label="Oyun Modları">
    <div class="game-mode-card" data-mode="free">
      <h3>Serbest Mod</h3>
      <p>Zaman sınırı olmadan, istediğiniz kadar morfem kullanarak sözcükler oluşturun.</p>
    </div>
    <div class="game-mode-card" data-mode="time">
      <h3>Zaman Yarışı</h3>
      <p>Belirli bir süre içinde mümkün olduğunca çok sözcük oluşturun.</p>
    </div>
    <div class="game-mode-card" data-mode="chain">
      <h3>Sözcük Zinciri</h3>
      <p>Her yeni sözcüğü, önceki sözcüğün son morfemiyle başlatın.</p>
    </div>
    <div class="game-mode-card" data-mode="category">
      <h3>Kategori Modu</h3>
      <p>Belirli bir kategoriye ait sözcükler oluşturun (isimler, fiiller, sıfatlar).</p>
    </div>
  </div>
  <button id="start-selected-mode" class="btn primary">Oyunu Başlat</button>
  <button id="back-to-age-selection" class="btn secondary">Geri Dön</button>
</section>

<!-- Oyun Ekranı -->
<section class="game-play" id="game-play-section" style="display: none;">
  <div class="game-header">
    <div class="game-info">
      <div class="mode-display">Mod: <span id="current-mode">Serbest</span></div>
      <div class="difficulty-display">Zorluk: <span id="current-difficulty">Kolay</span></div>
    </div>
    <div class="game-stats">
      <div class="score">Puan: <span id="current-score">0</span></div>
      <div class="timer" id="timer-container">Süre: <span id="time-remaining">0:00</span></div>
    </div>
  </div>
  
  <div class="game-area">
    <div class="morpheme-container" id="available-morphemes">
      <!-- Morfemler burada dinamik olarak oluşturulacak -->
    </div>
    
    <div class="word-building-area">
      <div class="current-word-container" id="current-word">
        <!-- Seçilen morfemler burada gösterilecek -->
      </div>
      <div class="word-actions">
        <button id="submit-word" class="btn primary">Sözcüğü Gönder</button>
        <button id="clear-word" class="btn secondary">Temizle</button>
      </div>
    </div>
    
    <div class="created-words-container">
      <h3>Oluşturulan Sözcükler</h3>
      <ul id="created-words-list">
        <!-- Oluşturulan sözcükler burada listelenecek -->
      </ul>
    </div>
  </div>
  
  <div class="game-controls">
    <button id="new-morphemes" class="btn secondary">Yeni Morfemler</button>
    <button id="end-game" class="btn warning">Oyunu Bitir</button>
  </div>
</section>

<!-- Sonuç Ekranı -->
<section class="results" id="results-section" style="display: none;">
  <h2>Oyun Sonuçları</h2>
  <div class="results-summary">
    <div class="final-score">Toplam Puan: <span id="final-score">0</span></div>
    <div class="words-created">Oluşturulan Sözcük Sayısı: <span id="words-count">0</span></div>
    <div class="time-played">Oynama Süresi: <span id="time-played">0:00</span></div>
  </div>
  
  <div class="word-list-container">
    <h3>Oluşturduğunuz Sözcükler</h3>
    <ul id="final-words-list">
      <!-- Oluşturulan sözcükler burada listelenecek -->
    </ul>
  </div>
  
  <div class="result-actions">
    <button id="play-again" class="btn primary">Tekrar Oyna</button>
    <button id="back-to-home" class="btn secondary">Ana Sayfaya Dön</button>
  </div>
</section>
`;

// CSS for game screens
const gameScreensCSS = `
/* Game Modes Screen */
.game-modes-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.game-mode-card {
  background-color: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.game-mode-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #6c63ff;
}

.game-mode-card.selected {
  background-color: #e6e6ff;
  border-color: #6c63ff;
  box-shadow: 0 5px 15px rgba(108, 99, 255, 0.2);
}

.game-mode-card h3 {
  color: #333;
  margin-bottom: 10px;
}

/* Game Play Screen */
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 10px;
}

.game-info, .game-stats {
  display: flex;
  gap: 20px;
}

.mode-display, .difficulty-display, .score, .timer {
  font-weight: bold;
}

.game-area {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.morpheme-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
  min-height: 100px;
}

.morpheme-block {
  background-color: #6c63ff;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.morpheme-block:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.morpheme-block.selected {
  background-color: #4b45b2;
}

.word-building-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.current-word-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 15px;
  background-color: #e6e6ff;
  border-radius: 10px;
  min-height: 60px;
}

.word-actions {
  display: flex;
  gap: 10px;
}

.created-words-container {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
}

.created-words-container h3 {
  margin-bottom: 10px;
  color: #333;
}

#created-words-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

#created-words-list li {
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.game-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* Results Screen */
.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
  text-align: center;
}

.final-score, .words-created, .time-played {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  font-size: 1.2em;
}

.final-score span, .words-created span, .time-played span {
  display: block;
  font-size: 1.5em;
  font-weight: bold;
  margin-top: 10px;
  color: #6c63ff;
}

.word-list-container {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.word-list-container h3 {
  margin-bottom: 15px;
  color: #333;
}

#final-words-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

#final-words-list li {
  padding: 10px;
  background-color: #e6e6ff;
  border-radius: 5px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .game-area {
    grid-template-columns: 2fr 1fr;
  }
  
  .morpheme-container {
    grid-column: 1 / -1;
  }
}

@media (max-width: 767px) {
  .game-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .result-actions {
    flex-direction: column;
  }
}
`;

// Main game interface class
class GameInterface {
  constructor() {
    this.gameController = new GameController();
    this.selectedGameMode = 'free';
    this.selectedAgeGroup = 'adult';
    this.selectedDifficulty = '1';
    
    // Initialize the interface
    this.init();
  }
  
  // Initialize the interface
  init() {
    console.log('Initializing game interface');
    
    // Add game screens to the DOM
    this.addGameScreensToDOM();
    
    // Add game CSS to the DOM
    this.addGameCSSToDOM();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('Game interface initialized');
  }
  
  // Add game screens to the DOM
  addGameScreensToDOM() {
    // Get the main element
    const mainElement = document.querySelector('main');
    
    if (!mainElement) {
      console.error('Main element not found');
      return;
    }
    
    // Append game screens HTML
    mainElement.insertAdjacentHTML('beforeend', gameScreensHTML);
    
    console.log('Game screens added to DOM');
  }
  
  // Add game CSS to the DOM
  addGameCSSToDOM() {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = gameScreensCSS;
    
    // Append to head
    document.head.appendChild(styleElement);
    
    console.log('Game CSS added to DOM');
  }
  
  // Set up event listeners
  setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
      // Age selection screen
      const continueToGameModesBtn = document.getElementById('continue-to-game-modes');
      const backToIntroBtn = document.getElementById('back-to-intro');
      const ageGroupCards = document.querySelectorAll('.age-group-card');
      const difficultyLevels = document.querySelectorAll('.difficulty-level');
      
      // Game modes screen
      const gameModeCards = document.querySelectorAll('.game-mode-card');
      const startSelectedModeBtn = document.getElementById('start-selected-mode');
      const backToAgeSelectionBtn = document.getElementById('back-to-age-selection');
      
      // Age group cards
      ageGroupCards.forEach(card => {
        card.addEventListener('click', () => {
          // Remove selected class from all cards
          ageGroupCards.forEach(c => c.classList.remove('selected'));
          
          // Add selected class to clicked card
          card.classList.add('selected');
          
          // Update selected age group
          this.selectedAgeGroup = card.dataset.ageGroup;
          console.log('Selected age group:', this.selectedAgeGroup);
        });
      });
      
      // Difficulty levels
      difficultyLevels.forEach(level => {
        level.addEventListener('click', () => {
          // Remove selected class from all levels
          difficultyLevels.forEach(l => l.classList.remove('selected'));
          
          // Add selected class to clicked level
          level.classList.add('selected');
          
          // Update selected difficulty
          this.selectedDifficulty = level.dataset.difficulty;
          console.log('Selected difficulty:', this.selectedDifficulty);
        });
      });
      
      // Continue to game modes button
      if (continueToGameModesBtn) {
        continueToGameModesBtn.addEventListener('click', () => {
          console.log('Continue to game modes button clicked');
          
          // Get selected age group
          const selectedAgeGroupCard = document.querySelector('.age-group-card.selected');
          if (selectedAgeGroupCard) {
            this.selectedAgeGroup = selectedAgeGroupCard.dataset.ageGroup;
          }
          
          // Get selected difficulty
          const selectedDifficultyLevel = document.querySelector('.difficulty-level.selected');
          if (selectedDifficultyLevel) {
            this.selectedDifficulty = selectedDifficultyLevel.dataset.difficulty;
          }
          
          // Show game modes section
          this.showSection('game-modes-section');
        });
      }
      
      // Back to intro button
      if (backToIntroBtn) {
        backToIntroBtn.addEventListener('click', () => {
          console.log('Back to intro button clicked');
          this.showSection('intro-section');
        });
      }
      
      // Game mode cards
      gameModeCards.forEach(card => {
        card.addEventListener('click', () => {
          // Remove selected class from all cards
          gameModeCards.forEach(c => c.classList.remove('selected'));
          
          // Add selected class to clicked card
          card.classList.add('selected');
          
          // Update selected game mode
          this.selectedGameMode = card.dataset.mode;
          console.log('Selected game mode:', this.selectedGameMode);
        });
      });
      
      // Start selected mode button
      if (startSelectedModeBtn) {
        startSelectedModeBtn.addEventListener('click', () => {
          console.log('Start selected mode button clicked');
          
          // Get selected game mode
          const selectedGameModeCard = document.querySelector('.game-mode-card.selected');
          if (selectedGameModeCard) {
            this.selectedGameMode = selectedGameModeCard.dataset.mode;
          }
          
          // Initialize game with selected options
          this.gameController.initGame(
            this.selectedGameMode,
            this.selectedDifficulty,
            this.selectedAgeGroup
          );
        });
      }
      
      // Back to age selection button
      if (backToAgeSelectionBtn) {
        backToAgeSelectionBtn.addEventListener('click', () => {
          console.log('Back to age selection button clicked');
          this.showSection('age-selection-section');
        });
      }
    });
  }
  
  // Show section and hide others
  showSection(sectionId) {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
      section.style.display = section.id === sectionId ? 'block' : 'none';
    });
  }
}

// Export the GameInterface class
export default GameInterface;
