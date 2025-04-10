document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded');
  
  // Tüm butonlara event listener ekle
  const buttons = document.querySelectorAll('button');
  console.log('Found buttons:', buttons.length);
  
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      console.log('Button clicked:', this.textContent);
      
      // Buton ID'sine göre özel işlemler
      if (this.id === 'start-game') {
        console.log('Start game button clicked');
        document.getElementById('intro-section').style.display = 'none';
        document.getElementById('age-selection-section').style.display = 'block';
      } else if (this.id === 'how-to-play-btn') {
        console.log('How to play button clicked');
        // Nasıl oynanır bölümünü göster
      }
    });
  });
  
  // Menü öğelerine event listener ekle
  const navLinks = document.querySelectorAll('nav a');
  console.log('Found nav links:', navLinks.length);
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Nav link clicked:', this.textContent);
      
      // Aktif sınıfını güncelle
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // ID'ye göre özel işlemler
      if (this.id === 'nav-home') {
        console.log('Home nav clicked');
        document.getElementById('intro-section').style.display = 'block';
        document.getElementById('age-selection-section').style.display = 'none';
      } else if (this.id === 'nav-how-to-play') {
        console.log('How to play nav clicked');
        // Nasıl oynanır bölümünü göster
      } else if (this.id === 'nav-about') {
        console.log('About nav clicked');
        // Hakkında bölümünü göster
      }
    });
  });
});
