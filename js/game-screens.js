// Game Modes Screen HTML
const gameModeScreenHTML = `
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
