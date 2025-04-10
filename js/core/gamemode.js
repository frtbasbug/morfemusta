// js/core/gamemode.js
export default class GameMode {
  constructor(id, name, description, config = {}) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.config = config;
  }
  
  getDefaults(difficultyLevel) {
    switch(this.id) {
      case 'timed':
        // Zorluk seviyesine göre süre ayarla
        switch(difficultyLevel) {
          case 1: return { timeLimit: 180, morphemeCount: 6 }; // 3 dakika, 6 morfem
          case 2: return { timeLimit: 120, morphemeCount: 8 }; // 2 dakika, 8 morfem
          case 3: return { timeLimit: 60, morphemeCount: 10 };  // 1 dakika, 10 morfem
          default: return { timeLimit: 120, morphemeCount: 8 };
        }
      case 'free':
        return { timeLimit: 0, morphemeCount: 8 }; // Zaman sınırı yok
      case 'chain':
        return { timeLimit: 120, morphemeCount: 8 }; // 2 dakika
      case 'category':
        return { timeLimit: 120, morphemeCount: 8, categories: ['noun', 'verb', 'adjective'] };
      default:
        return { timeLimit: 0, morphemeCount: 8 };
    }
  }
}

// Tüm oyun modlarını oluştur ve dışa aktar
export const gameModes = [
  new GameMode('free', 'Serbest Mod', 'Zaman sınırı olmadan, istediğiniz kadar morfem kullanarak sözcükler oluşturun.'),
  new GameMode('timed', 'Zaman Yarışı', 'Belirli bir süre içinde mümkün olduğunca çok sözcük oluşturun.'),
  new GameMode('chain', 'Sözcük Zinciri', 'Her yeni sözcüğü, önceki sözcüğün son morfemiyle başlatın.'),
  new GameMode('category', 'Kategori Modu', 'Belirli bir kategoriye ait sözcükler oluşturun (isimler, fiiller, sıfatlar).')
];

// ID'ye göre oyun modunu bul
export function getGameModeById(id) {
  return gameModes.find(mode => mode.id === id) || gameModes[0];
}
