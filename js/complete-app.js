// complete-app.js
// Ana uygulama kodunu içeren bu dosya, diğer modülleri bir araya getirir ve global değişkenleri yönetir

// Gerekli modülleri import et
import gameController from './game-controller.js';
import { setupGameInterface } from './game-interface.js';

// Global erişim için bazı fonksiyonları window nesnesine bağla
// Bu, HTML script bloğundan bu fonksiyonlara erişmenizi sağlar
window.startGame = function(ageGroup, difficultyLevel, ageValue, gameMode) {
    return gameController.initGame(ageGroup, difficultyLevel, ageValue, gameMode);
};

// Oyun arayüzünü başlat
window.setupGameUI = function() {
    setupGameInterface();
};

// Tüm oyun durumunu sıfırla
window.resetGame = function() {
    // Burada oyun durumunu sıfırlama işlemleri yapılır
    return gameController.resetGame();
};

// Sayfa yüklendiğinde çalışacak kod
document.addEventListener('DOMContentLoaded', function() {
    console.log('MorfemUsta: Sözcük Fabrikası başlatılıyor...');
    
    // Eğer daha önceki script'lerde tanımlanmamışsa, burada da tanımlanabilir
    setupEventListeners();
});

// Olay dinleyicilerini ayarla
function setupEventListeners() {
    // Bu kod kısmı HTML içinde inline script içinde de tanımlanabilir
    // Bu durumda, çakışmaları önlemek için bu fonksiyonu atla
    if (window.eventListenersSetup) {
        console.log('Olay dinleyicileri zaten kurulmuş, atlanıyor...');
        return;
    }
    
    console.log('Olay dinleyicileri kuruluyor...');
    
    // Ana sayfa butonları
    const startGameBtn = document.getElementById('start-game');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            showSection('age-selection-section');
        });
    }
    
    // Diğer butonlar ve olay dinleyicileri buraya eklenebilir
    
    // Olay dinleyicilerinin kurulduğunu işaretle
    window.eventListenersSetup = true;
}

// Bölümleri göster/gizle fonksiyonu
function showSection(sectionId) {
    const sections = document.querySelectorAll('main > section');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
}

// Bu modülün başlatıldığını bildir
console.log('complete-app.js modülü başarıyla yüklendi');

// Modülü dışa aktar
export default {
    startGame: window.startGame,
    setupGameUI: window.setupGameUI,
    resetGame: window.resetGame
};
