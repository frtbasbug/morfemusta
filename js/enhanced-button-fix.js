document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded - Enhanced button fix script');
  
  // Ana sayfa butonları
  const startGameBtn = document.getElementById('start-game');
  const howToPlayBtn = document.getElementById('how-to-play-btn');
  
  // Yaş seçim ekranı butonları
  const continueToGameModesBtn = document.getElementById('continue-to-game-modes');
  const backToIntroBtn = document.getElementById('back-to-intro');
  
  // Nasıl oynanır ve hakkında ekranı butonları
  const backFromHowToPlayBtn = document.getElementById('back-from-how-to-play');
  const backFromAboutBtn = document.getElementById('back-from-about');
  
  // Yaş grubu kartları
  const ageGroupCards = document.querySelectorAll('.age-group-card');
  
  // Zorluk seviyesi butonları
  const difficultyLevels = document.querySelectorAll('.difficulty-level');
  
  // Menü öğeleri
  const navLinks = document.querySelectorAll('nav a');
  
  // Bölümleri göster/gizle fonksiyonu
  function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
      section.style.display = section.id === sectionId ? 'block' : 'none';
    });
  }
  
  // Ana sayfa butonları
  if (startGameBtn) {
    startGameBtn.addEventListener('click', function() {
      console.log('Start game button clicked');
      showSection('age-selection-section');
    });
  }
  
  if (howToPlayBtn) {
    howToPlayBtn.addEventListener('click', function() {
      console.log('How to play button clicked');
      showSection('how-to-play-section');
    });
  }
  
  // Yaş seçim ekranı butonları
  if (continueToGameModesBtn) {
  continueToGameModesBtn.addEventListener('click', function() {
    // Seçilen yaş grubu ve zorluk seviyesini al
    const selectedAgeGroup = document.querySelector('.age-group-card.selected')?.dataset.ageGroup || 'adult';
    const selectedDifficulty = document.querySelector('.difficulty-level.selected')?.dataset.difficulty || '1';
    
    // Kullanıcıya bilgi ver
    alert('Seçilen yaş grubu: ' + selectedAgeGroup + '\nZorluk seviyesi: ' + selectedDifficulty + '\n\nOyun geliştirme aşamasında, yakında kullanıma sunulacak!');
    
    // Ana sayfaya geri dön
    showSection('intro-section');
  });
}

  
  if (backToIntroBtn) {
    backToIntroBtn.addEventListener('click', function() {
      console.log('Back to intro button clicked');
      showSection('intro-section');
    });
  }
  
  // Nasıl oynanır ve hakkında ekranı butonları
  if (backFromHowToPlayBtn) {
    backFromHowToPlayBtn.addEventListener('click', function() {
      console.log('Back from how to play button clicked');
      showSection('intro-section');
    });
  }
  
  if (backFromAboutBtn) {
    backFromAboutBtn.addEventListener('click', function() {
      console.log('Back from about button clicked');
      showSection('intro-section');
    });
  }
  
  // Yaş grubu kartları
  ageGroupCards.forEach(card => {
    card.addEventListener('click', function() {
      console.log('Age group card clicked:', this.querySelector('h3').textContent);
      
      // Aktif sınıfını güncelle
      ageGroupCards.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      
      // Yaş grubunu kaydet
      const ageGroup = this.dataset.ageGroup;
      console.log('Selected age group:', ageGroup);
      
      // Yaş input değerini güncelle
      const ageInput = document.getElementById('age-input');
      if (ageInput) {
        if (ageGroup === 'child') {
          ageInput.value = '10';
        } else if (ageGroup === 'teen') {
          ageInput.value = '15';
        } else if (ageGroup === 'adult') {
          ageInput.value = '25';
        }
      }
    });
  });
  
  // Zorluk seviyesi butonları
  difficultyLevels.forEach(level => {
    level.addEventListener('click', function() {
      console.log('Difficulty level clicked:', this.textContent);
      
      // Aktif sınıfını güncelle
      difficultyLevels.forEach(l => l.classList.remove('selected'));
      this.classList.add('selected');
      
      // Zorluk seviyesini kaydet
      const difficulty = this.dataset.difficulty;
      console.log('Selected difficulty:', difficulty);
    });
  });
  
  // Menü öğeleri
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Nav link clicked:', this.textContent);
      
      // Aktif sınıfını güncelle
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // ID'ye göre özel işlemler
      if (this.id === 'nav-home') {
        showSection('intro-section');
      } else if (this.id === 'nav-how-to-play') {
        showSection('how-to-play-section');
      } else if (this.id === 'nav-about') {
        showSection('about-section');
      }
    });
  });
  
  // Sayfa yüklendiğinde varsayılan bölümü göster
  showSection('intro-section');
  
  console.log('All event listeners added successfully');
});
