// js/core/difficulty.js
// Zorluk seviyesi sınıfı

export default class Difficulty {
    constructor(level = 1) {
        this.level = level;
        this.config = this.getConfig(level);
    }
    
    getConfig(level) {
        switch(level) {
            case 1:
                return {
                    name: 'Kolay',
                    morphemeCount: 6,
                    timeLimit: 180, // 3 dakika
                    scoreMultiplier: 1
                };
            case 2:
                return {
                    name: 'Orta',
                    morphemeCount: 8, 
                    timeLimit: 120, // 2 dakika
                    scoreMultiplier: 1.5
                };
            case 3:
                return {
                    name: 'Zor',
                    morphemeCount: 10,
                    timeLimit: 60, // 1 dakika
                    scoreMultiplier: 2
                };
            default:
                return {
                    name: 'Kolay',
                    morphemeCount: 6,
                    timeLimit: 180,
                    scoreMultiplier: 1
                };
        }
    }
    
    getName() {
        return this.config.name;
    }
    
    getScoreMultiplier() {
        return this.config.scoreMultiplier;
    }
}
