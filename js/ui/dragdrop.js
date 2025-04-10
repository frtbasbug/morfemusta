// MorfemUsta: Kelime Fabrikası - Sürükle-Bırak İşlevselliği

class DragDrop {
    constructor(game) {
        console.log("DragDrop constructor called");
        this.game = game;
        this.draggedElement = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.setupEventListeners();
    }

    // Olay dinleyicilerini ayarla
    setupEventListeners() {
        console.log("Setting up drag-drop event listeners");
        // Morfem konteynerı için olay dinleyicileri
        const morphemeContainer = document.getElementById('morpheme-container');
        if (!morphemeContainer) {
            console.error("Cannot find morpheme-container element");
            return;
        }
        
        morphemeContainer.addEventListener('dragstart', this.handleDragStart.bind(this));
        console.log("Added dragstart listener to morpheme container");
        
        // Kelime gösterimi için olay dinleyicileri
        const wordDisplay = document.getElementById('word-display');
        if (!wordDisplay) {
            console.error("Cannot find word-display element");
            return;
        }
        
        wordDisplay.addEventListener('dragover', this.handleDragOver.bind(this));
        wordDisplay.addEventListener('drop', this.handleDrop.bind(this));
        wordDisplay.addEventListener('dragenter', this.handleDragEnter.bind(this));
        wordDisplay.addEventListener('dragleave', this.handleDragLeave.bind(this));
        console.log("Added drag event listeners to word display");
        
        // Morfem bloklarını kelime gösteriminden çıkarmak için tıklama olayı
        wordDisplay.addEventListener('click', this.handleWordDisplayClick.bind(this));
        console.log("Added click listener to word display");
    }

    // Sürükleme başladığında
    handleDragStart(e) {
        console.log("Drag start event triggered");
        if (e.target.classList.contains('morpheme-block')) {
            this.draggedElement = e.target;
            e.dataTransfer.setData('text/plain', e.target.dataset.id);
            e.dataTransfer.effectAllowed = 'move';
            
            // Sürükleme görsel efekti
            setTimeout(() => {
                e.target.classList.add('dragging');
            }, 0);
            
            // Sürükleme ofsetini kaydet
            const rect = e.target.getBoundingClientRect();
            this.offsetX = e.clientX - rect.left;
            this.offsetY = e.clientY - rect.top;
            
            console.log(`Dragging morpheme: ${e.target.dataset.id}`);
        } else {
            console.log("Drag start on non-morpheme element");
        }
    }

    // Sürükleme üzerinde
    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Bırakma işlemini etkinleştir
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    // Sürükleme alanına girildiğinde
    handleDragEnter(e) {
        if (e.target.id === 'word-display') {
            console.log("Drag entered word display");
            e.target.classList.add('drag-over');
        }
    }

    // Sürükleme alanından çıkıldığında
    handleDragLeave(e) {
        if (e.target.id === 'word-display') {
            console.log("Drag left word display");
            e.target.classList.remove('drag-over');
        }
    }

    // Bırakma işlemi
    handleDrop(e) {
        console.log("Drop event triggered");
        e.preventDefault();
        
        // Drag-over sınıfını kaldır
        document.getElementById('word-display').classList.remove('drag-over');
        
        if (this.draggedElement) {
            // Sürükleme sınıfını kaldır
            this.draggedElement.classList.remove('dragging');
            
            const morphemeId = e.dataTransfer.getData('text/plain');
            console.log(`Dropped morpheme ID: ${morphemeId}`);
            
            const morpheme = this.game.morphemeDB.getMorphemeById(morphemeId);
            
            if (morpheme) {
                console.log(`Found morpheme: ${morpheme.text}`);
                // Morfemin zaten kelimede olup olmadığını kontrol et
                const isAlreadyInWord = this.game.currentWord.morphemes.some(m => m.id === morpheme.id);
                
                if (!isAlreadyInWord) {
                    // Morfemi kelimeye ekle
                    this.game.addMorphemeToWord(morpheme);
                    
                    // Morfemi kullanımda olarak işaretle
                    morpheme.markAsUsed();
                    
                    // Morfem bloğunu kelime gösterimine taşı
                    const wordDisplay = document.getElementById('word-display');
                    wordDisplay.appendChild(this.draggedElement);
                    
                    // Kelime gösterimindeki morfem bloklarını sırala
                    this.sortMorphemeBlocks();
                    
                    console.log(`Added morpheme ${morpheme.text} to word`);
                } else {
                    console.log(`Morpheme ${morpheme.text} is already in word`);
                }
            } else {
                console.error(`Could not find morpheme with ID: ${morphemeId}`);
            }
            
            this.draggedElement = null;
        } else {
            console.log("No dragged element found on drop");
        }
        
        return false;
    }

    // Kelime gösterimindeki morfem bloklarına tıklandığında
    handleWordDisplayClick(e) {
        console.log("Word display clicked");
        if (e.target.closest('.morpheme-block')) {
            const morphemeBlock = e.target.closest('.morpheme-block');
            const morphemeId = morphemeBlock.dataset.id;
            console.log(`Clicked on morpheme block: ${morphemeId}`);
            
            // Morfemi kelimeden çıkar
            this.game.removeMorphemeFromWord(morphemeId);
            
            // Morfemi kullanımda değil olarak işaretle
            const morpheme = this.game.morphemeDB.getMorphemeById(morphemeId);
            if (morpheme) {
                morpheme.markAsUnused();
            }
            
            // Morfem bloğunu morfem konteynerine geri taşı
            const morphemeContainer = document.getElementById('morpheme-container');
            morphemeContainer.appendChild(morphemeBlock);
            console.log(`Moved morpheme block back to container`);
        }
    }

    // Kelime gösterimindeki morfem bloklarını sırala
    sortMorphemeBlocks() {
        console.log("Sorting morpheme blocks");
        const wordDisplay = document.getElementById('word-display');
        const blocks = Array.from(wordDisplay.querySelectorAll('.morpheme-block'));
        
        // Blokları DOM'dan geçici olarak kaldır
        blocks.forEach(block => block.remove());
        
        // Blokları morfem sırasına göre yeniden ekle
        this.game.currentWord.morphemes.forEach(morpheme => {
            const block = blocks.find(b => b.dataset.id === morpheme.id);
            if (block) {
                wordDisplay.appendChild(block);
            }
        });
    }

    // Yeni morfem bloklarını oluştur
    createMorphemeBlocks(morphemes) {
        console.log(`Creating ${morphemes.length} morpheme blocks`);
        const container = document.getElementById('morpheme-container');
        if (!container) {
            console.error("Cannot find morpheme-container element");
            return;
        }
        
        container.innerHTML = ''; // Mevcut blokları temizle
        
        morphemes.forEach(morpheme => {
            console.log(`Creating block for morpheme: ${morpheme.text} (${morpheme.type})`);
            const block = morpheme.createHTMLElement();
            container.appendChild(block);
        });
        
        console.log("Morpheme blocks created");
    }
}
