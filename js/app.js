// MorfemUsta: Kelime Fabrikası - Ana Uygulama

// Oyun örneği
let game = null;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing MorfemUsta game...");
    
    // UI elementlerini seç
    const startGameBtn = document.getElementById('start-game');
    const howToPlayBtn = document.getElementById('how-to-play');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const introSection = document.querySelector('.intro');
    const gameSection = document.getElementById('game-area');
    const howToPlaySection = document.getElementById('how-to-play-section');

    // Oyuna başla butonu
    startGameBtn.addEventListener('click', () => {
        console.log("Start game button clicked");
        introSection.style.display = 'none';
        howToPlaySection.style.display = 'none';
        gameSection.style.display = 'block';
        
        // Oyunu başlat
        if (!game) {
            console.log("Creating new game instance");
            game = new Game();
        }
        game.start();
        console.log("Game started");
    });

    // Nasıl oynanır butonu
    howToPlayBtn.addEventListener('click', () => {
        console.log("How to play button clicked");
        introSection.style.display = 'none';
        gameSection.style.display = 'none';
        howToPlaySection.style.display = 'block';
    });

    // Ana menüye dön butonu
    backToMenuBtn.addEventListener('click', () => {
        console.log("Back to menu button clicked");
        howToPlaySection.style.display = 'none';
        gameSection.style.display = 'none';
        introSection.style.display = 'block';
    });

    // Pencere yeniden boyutlandırıldığında
    window.addEventListener('resize', () => {
        if (game && game.dragDrop) {
            // Morfem bloklarının konumlarını güncelle
            game.dragDrop.sortMorphemeBlocks();
        }
    });
    
    console.log("MorfemUsta initialization complete");
});

// Oyun durumunu kaydet (localStorage)
function saveGameState() {
    if (game) {
        const gameState = {
            score: game.score,
            level: game.level,
            timestamp: new Date().getTime()
        };
        
        localStorage.setItem('morfemUstaGameState', JSON.stringify(gameState));
    }
}

// Oyun durumunu yükle
function loadGameState() {
    const savedState = localStorage.getItem('morfemUstaGameState');
    
    if (savedState) {
        try {
            const gameState = JSON.parse(savedState);
            
            // 24 saatten eski kayıtları temizle
            const now = new Date().getTime();
            const oneDayMs = 24 * 60 * 60 * 1000;
            
            if (now - gameState.timestamp < oneDayMs) {
                return gameState;
            } else {
                // Eski kayıtları temizle
                localStorage.removeItem('morfemUstaGameState');
            }
        } catch (e) {
            console.error('Oyun durumu yüklenirken hata oluştu:', e);
            localStorage.removeItem('morfemUstaGameState');
        }
    }
    
    return null;
}

// Oyun durumunu periyodik olarak kaydet
setInterval(() => {
    if (game && game.isGameActive) {
        saveGameState();
    }
}, 30000); // Her 30 saniyede bir kaydet
