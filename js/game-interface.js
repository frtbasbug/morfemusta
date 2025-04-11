// game-interface.js
// Oyun arayüzünü oluşturmak ve yönetmek için kullanılan modül

// Gerekli modülleri import et
import { gameModes } from './core/gamemode.js';

// Oyun arayüzünü oluştur
export function setupGameInterface(game) {
    console.log('Oyun arayüzü oluşturuluyor...');
    
    // Oyun modu ve zorluk seviyesine göre arayüzü ayarla
    const gameMode = game.gameMode;
    const difficulty = game.difficulty;
    
    // Oyun başlığını ayarla
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
        // Oyun modu bilgisini ekle
        const modeBadge = document.createElement('div');
        modeBadge.className = 'mode-badge';
        modeBadge.textContent = gameMode.name;
        gameHeader.prepend(modeBadge);
    }
    
    // Zamanlayıcıyı göster/gizle
    const timerContainer = document.querySelector('.timer-container');
    if (timerContainer) {
        // Oyun moduna göre zamanlayıcıyı ayarla
        const modeConfig = gameMode.getDefaults(difficulty.level);
        if (modeConfig.timeLimit > 0) {
            timerContainer.style.display = 'block';
        } else {
            timerContainer.style.display = 'none';
        }
    }
    
    // Morfem bloklarını oluştur
    createMorphemeBlocks(game);
    
    // Sürükle-bırak işlemlerini ayarla
    setupDragAndDrop();
    
    // Oyun kontrol butonlarını ayarla
    setupGameControls(game);
    
    console.log('Oyun arayüzü başarıyla oluşturuldu');
}

// Morfem bloklarını oluştur
function createMorphemeBlocks(game) {
    const morphemeContainer = document.getElementById('morpheme-container');
    if (!morphemeContainer) return;
    
    // Morfem konteynırını temizle
    morphemeContainer.innerHTML = '';
    
    // Oyun modu ve zorluk seviyesine göre morfem sayısını belirle
    const modeConfig = game.gameMode.getDefaults(game.difficulty.level);
    const morphemeCount = modeConfig.morphemeCount;
    
    // Rastgele morfemler oluştur
    const morphemes = game.getMorphemes(morphemeCount);
    
    // Morfemleri ekrana ekle
    morphemes.forEach(morpheme => {
        const morphemeBlock = document.createElement('div');
        morphemeBlock.className = 'morpheme-block';
        morphemeBlock.setAttribute('data-morpheme-id', morpheme.id);
        morphemeBlock.textContent = morpheme.text;
        
        // Morfeme tıklama olayı ekle
        morphemeBlock.addEventListener('click', function() {
            toggleMorphemeSelection(this);
        });
        
        morphemeContainer.appendChild(morphemeBlock);
    });
}

// Morfem seçimini aç/kapat
function toggleMorphemeSelection(morphemeElement) {
    morphemeElement.classList.toggle('selected');
    
    // Seçilen morfemleri sözcük oluşturma alanına ekle/çıkar
    updateWordBuildingArea();
}

// Sözcük oluşturma alanını güncelle
function updateWordBuildingArea() {
    const wordBuildingArea = document.getElementById('word-building-area');
    if (!wordBuildingArea) return;
    
    // Seçilen morfemleri al
    const selectedMorphemes = document.querySelectorAll('.morpheme-block.selected');
    
    // Sözcük oluşturma alanını temizle
    wordBuildingArea.innerHTML = '';
    
    // Sözcük görünümünü oluştur
    if (selectedMorphemes.length > 0) {
        const wordPreview = document.createElement('div');
        wordPreview.className = 'word-preview';
        
        let wordText = '';
        selectedMorphemes.forEach(morpheme => {
            wordText += morpheme.textContent;
        });
        
        wordPreview.textContent = wordText;
        wordBuildingArea.appendChild(wordPreview);
    } else {
        // Hiç morfem seçilmemişse bilgi mesajı göster
        const infoMessage = document.createElement('p');
        infoMessage.className = 'info-message';
        infoMessage.textContent = 'Sözcük oluşturmak için morfem bloklarına tıklayın.';
        wordBuildingArea.appendChild(infoMessage);
    }
}

// Sürükle-bırak işlemlerini ayarla
function setupDragAndDrop() {
    // Burada sürükle-bırak işlemlerini ayarlayan kod yer alacak
    // Örnek olarak basit bir işlev eklenmiştir
    console.log('Sürükle-bırak işlemleri ayarlandı');
}

// Oyun kontrol butonlarını ayarla
function setupGameControls(game) {
    // Sözcük gönderme butonu
    const submitWordBtn = document.getElementById('submit-word');
    if (submitWordBtn) {
        submitWordBtn.addEventListener('click', function() {
            submitWord(game);
        });
    }
    
    // Yeni morfemler butonu
    const newMorphemesBtn = document.getElementById('new-morphemes');
    if (newMorphemesBtn) {
        newMorphemesBtn.addEventListener('click', function() {
            createMorphemeBlocks(game);
        });
    }
    
    // Oyunu bitirme butonu
    const endGameBtn = document.getElementById('end-game');
    if (endGameBtn) {
        endGameBtn.addEventListener('click', function() {
            endGame(game);
        });
    }
}

// Sözcük gönderme işlemi
function submitWord(game) {
    // Seçilen morfemleri al
    const selectedMorphemes = document.querySelectorAll('.morpheme-block.selected');
    
    if (selectedMorphemes.length === 0) {
        alert('Lütfen en az bir morfem seçin.');
        return;
    }
    
    // Seçilen morfemleri bir dizi olarak oluştur
    const morphemeArray = Array.from(selectedMorphemes).map(element => {
        return {
            id: element.getAttribute('data-morpheme-id'),
            text: element.textContent
        };
    });
    
    // Sözcüğü oluştur ve doğrula
    const wordResult = game.createWord(morphemeArray);
    
    if (wordResult.success) {
        // Başarılı ise sözcük listesine ekle
        addWordToList(wordResult.word, wordResult.score);
        
        // Seçili morfemleri sıfırla
        selectedMorphemes.forEach(element => {
            element.classList.remove('selected');
        });
        
        // Sözcük oluşturma alanını temizle
        updateWordBuildingArea();
        
        // Puanı güncelle
        updateScore(game.score);
    } else {
        // Başarısız ise hata mesajı göster
        alert(wordResult.message || 'Geçersiz sözcük. Lütfen tekrar deneyin.');
    }
}

// Sözcüğü listeye ekle
function addWordToList(word, score) {
    const wordsList = document.getElementById('created-words-list');
    if (!wordsList) return;
    
    const wordItem = document.createElement('li');
    wordItem.innerHTML = `<strong>${word}</strong> <span class="word-score">+${score}</span>`;
    
    // Yeni eklenen sözcüğü vurgula
    wordItem.classList.add('new-word');
    
    // Sözcüğü listenin başına ekle
    if (wordsList.firstChild) {
        wordsList.insertBefore(wordItem, wordsList.firstChild);
    } else {
        wordsList.appendChild(wordItem);
    }
    
    // Bir süre sonra vurgulamayı kaldır
    setTimeout(() => {
        wordItem.classList.remove('new-word');
    }, 2000);
}

// Puanı güncelle
function updateScore(score) {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
        
        // Puan animasyonu ekle
        scoreElement.classList.add('score-updated');
        setTimeout(() => {
            scoreElement.classList.remove('score-updated');
        }, 1000);
    }
}

// Oyunu bitir
function endGame(game) {
    if (confirm('Oyunu sonlandırmak istediğinize emin misiniz?')) {
        // Oyunu sonlandır
        game.end();
        
        // Ana menüye dön
        const sections = document.querySelectorAll('main > section');
        sections.forEach(section => {
            section.style.display = section.id === 'intro-section' ? 'block' : 'none';
        });
    }
}

// Modülü dışa aktar
export default {
    setupGameInterface
};
