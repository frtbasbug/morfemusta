// js/utils/dictionary.js
// Sözlük yardımcı sınıfı

export default class Dictionary {
    constructor() {
        // Gerçek bir uygulama için sözlük veritabanı bağlantısı kurulabilir
        this.demoWords = [
            'ev', 'evler', 'evci', 'evcilik',
            'gel', 'gelme', 'gelmek', 'geliş',
            'git', 'gitme', 'gitmek', 'gidiş',
            'al', 'almak', 'alış', 'alıcı',
            'ver', 'vermek', 'veriş', 'verici',
            'dur', 'durmak', 'duruş', 'durma'
        ];
    }
    
    // Bir sözcüğün geçerli olup olmadığını kontrol et
    checkWord(word) {
        // Gerçek uygulamada sözlük veritabanında kontrol edilebilir
        // Şimdilik demo amaçlı bir kontrol yapıyoruz
        
        // Demo kelime listesinde kontrol et
        const isInDemoList = this.demoWords.includes(word.toLowerCase());
        
        // Demo listede yoksa, 3+ harf olan her kelimeyi geçerli say
        return isInDemoList || word.length >= 3;
    }
    
    // Belirli bir kategoriye ait sözcükleri getir (Kategori Modu için)
    getWordsByCategory(category) {
        // Gerçek uygulamada kategorilere göre filtreleme yapılabilir
        // Şimdilik demo kategorileri ve sözcükleri döndürüyoruz
        
        const categories = {
            'noun': ['ev', 'evler', 'evcilik'],
            'verb': ['gel', 'git', 'al', 'ver', 'dur'],
            'adjective': ['güzel', 'iyi', 'kötü', 'büyük', 'küçük']
        };
        
        return categories[category] || [];
    }
}
