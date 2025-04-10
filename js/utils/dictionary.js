// MorfemUsta: Sözcük Fabrikası - Genişletilmiş Sözcük Veritabanı

class Dictionary {
    constructor() {
        this.validWords = new Set();
        this.validRoots = new Set();
        this.validAffixes = new Map(); // Ek -> Uyumlu kök tipleri
        this.affixRules = new Map(); // Ek -> Uyumluluk kuralları
        this.loadDictionary();
    }

    // Sözlük verilerini yükle
    loadDictionary() {
        // Geçerli Türkçe sözcükler
        const words = [
            // İsimler
            'ev', 'evler', 'evli', 'evsiz', 'evlilik', 'evsel', 'evcilik',
            'göz', 'gözlük', 'gözler', 'gözlü', 'gözcü', 'gözlem', 'gözlemci',
            'kitap', 'kitaplar', 'kitaplık', 'kitapçı', 'kitapsız', 'kitapçılık',
            'yol', 'yollar', 'yolcu', 'yolsuz', 'yolluk', 'yolculuk',
            'baş', 'başlık', 'başlar', 'başsız', 'başçı', 'başlangıç',
            'su', 'sular', 'sulu', 'susuz', 'suluk', 'sucu',
            'dil', 'diller', 'dilli', 'dilsiz', 'dilci', 'dilbilim', 'dilbilimci',
            'ağaç', 'ağaçlar', 'ağaçlık', 'ağaçsız', 'ağaççı',
            'deniz', 'denizler', 'denizci', 'denizel', 'denizcilik',
            'dağ', 'dağlar', 'dağlık', 'dağcı', 'dağcılık',
            'kuş', 'kuşlar', 'kuşçu', 'kuşçuluk',
            'balık', 'balıklar', 'balıkçı', 'balıkçılık',
            'çiçek', 'çiçekler', 'çiçekçi', 'çiçekçilik', 'çiçekli', 'çiçeksiz',
            'araba', 'arabalar', 'arabacı', 'arabalı', 'arabasız',
            'okul', 'okullar', 'okulsuz', 'okullu',
            'öğrenci', 'öğrenciler', 'öğrencilik',
            'öğretmen', 'öğretmenler', 'öğretmenlik',
            'bilim', 'bilimler', 'bilimsel', 'bilimci', 'bilimcilik',
            'sanat', 'sanatlar', 'sanatçı', 'sanatsal', 'sanatçılık',
            'müzik', 'müzikler', 'müzikçi', 'müziksel', 'müzisyen',
            'spor', 'sporlar', 'sporcu', 'sporculuk',
            'oyun', 'oyunlar', 'oyuncu', 'oyunculuk', 'oyuncak',
            
            // Fiiller
            'gel', 'gelmek', 'geldi', 'gelecek', 'geliyor', 'gelir', 'gelse', 'gelsin',
            'git', 'gitmek', 'gitti', 'gidecek', 'gidiyor', 'gider', 'gitse', 'gitsin',
            'yap', 'yapmak', 'yaptı', 'yapacak', 'yapıyor', 'yapar', 'yapsa', 'yapsın',
            'oku', 'okumak', 'okudu', 'okuyacak', 'okuyor', 'okur', 'okusa', 'okusun',
            'yaz', 'yazmak', 'yazdı', 'yazacak', 'yazıyor', 'yazar', 'yazsa', 'yazsın',
            'bak', 'bakmak', 'baktı', 'bakacak', 'bakıyor', 'bakar', 'baksa', 'baksın',
            'gör', 'görmek', 'gördü', 'görecek', 'görüyor', 'görür', 'görse', 'görsün',
            'al', 'almak', 'aldı', 'alacak', 'alıyor', 'alır', 'alsa', 'alsın',
            'ver', 'vermek', 'verdi', 'verecek', 'veriyor', 'verir', 'verse', 'versin',
            'dur', 'durmak', 'durdu', 'duracak', 'duruyor', 'durur', 'dursa', 'dursun',
            'koş', 'koşmak', 'koştu', 'koşacak', 'koşuyor', 'koşar', 'koşsa', 'koşsun',
            'konuş', 'konuşmak', 'konuştu', 'konuşacak', 'konuşuyor', 'konuşur', 'konuşsa', 'konuşsun',
            'anla', 'anlamak', 'anladı', 'anlayacak', 'anlıyor', 'anlar', 'anlasa', 'anlasın',
            'dinle', 'dinlemek', 'dinledi', 'dinleyecek', 'dinliyor', 'dinler', 'dinlese', 'dinlesin',
            'söyle', 'söylemek', 'söyledi', 'söyleyecek', 'söylüyor', 'söyler', 'söylese', 'söylesin',
            'düşün', 'düşünmek', 'düşündü', 'düşünecek', 'düşünüyor', 'düşünür', 'düşünse', 'düşünsün',
            'bil', 'bilmek', 'bildi', 'bilecek', 'biliyor', 'bilir', 'bilse', 'bilsin',
            'öğren', 'öğrenmek', 'öğrendi', 'öğrenecek', 'öğreniyor', 'öğrenir', 'öğrense', 'öğrensin',
            'öğret', 'öğretmek', 'öğretti', 'öğretecek', 'öğretiyor', 'öğretir', 'öğretse', 'öğretsin',
            'çalış', 'çalışmak', 'çalıştı', 'çalışacak', 'çalışıyor', 'çalışır', 'çalışsa', 'çalışsın'
        ];
        
        // Geçerli kökler
        const roots = [
            {text: 'ev', type: 'noun'},
            {text: 'göz', type: 'noun'},
            {text: 'kitap', type: 'noun'},
            {text: 'yol', type: 'noun'},
            {text: 'baş', type: 'noun'},
            {text: 'su', type: 'noun'},
            {text: 'dil', type: 'noun'},
            {text: 'ağaç', type: 'noun'},
            {text: 'deniz', type: 'noun'},
            {text: 'dağ', type: 'noun'},
            {text: 'kuş', type: 'noun'},
            {text: 'balık', type: 'noun'},
            {text: 'çiçek', type: 'noun'},
            {text: 'araba', type: 'noun'},
            {text: 'okul', type: 'noun'},
            {text: 'öğrenci', type: 'noun'},
            {text: 'öğretmen', type: 'noun'},
            {text: 'bilim', type: 'noun'},
            {text: 'sanat', type: 'noun'},
            {text: 'müzik', type: 'noun'},
            {text: 'spor', type: 'noun'},
            {text: 'oyun', type: 'noun'},
            
            {text: 'gel', type: 'verb'},
            {text: 'git', type: 'verb'},
            {text: 'yap', type: 'verb'},
            {text: 'oku', type: 'verb'},
            {text: 'yaz', type: 'verb'},
            {text: 'bak', type: 'verb'},
            {text: 'gör', type: 'verb'},
            {text: 'al', type: 'verb'},
            {text: 'ver', type: 'verb'},
            {text: 'dur', type: 'verb'},
            {text: 'koş', type: 'verb'},
            {text: 'konuş', type: 'verb'},
            {text: 'anla', type: 'verb'},
            {text: 'dinle', type: 'verb'},
            {text: 'söyle', type: 'verb'},
            {text: 'düşün', type: 'verb'},
            {text: 'bil', type: 'verb'},
            {text: 'öğren', type: 'verb'},
            {text: 'öğret', type: 'verb'},
            {text: 'çalış', type: 'verb'}
        ];
        
        // Geçerli ekler ve uyumluluk kuralları
        const affixes = [
            {text: 'ler', type: 'plural', compatibleWith: ['noun'], position: 'after'},
            {text: 'lar', type: 'plural', compatibleWith: ['noun'], position: 'after'},
            {text: 'lı', type: 'with', compatibleWith: ['noun'], position: 'after'},
            {text: 'li', type: 'with', compatibleWith: ['noun'], position: 'after'},
            {text: 'lu', type: 'with', compatibleWith: ['noun'], position: 'after'},
            {text: 'lü', type: 'with', compatibleWith: ['noun'], position: 'after'},
            {text: 'sız', type: 'without', compatibleWith: ['noun'], position: 'after'},
            {text: 'siz', type: 'without', compatibleWith: ['noun'], position: 'after'},
            {text: 'suz', type: 'without', compatibleWith: ['noun'], position: 'after'},
            {text: 'süz', type: 'without', compatibleWith: ['noun'], position: 'after'},
            {text: 'lık', type: 'noun_from_noun', compatibleWith: ['noun'], position: 'after'},
            {text: 'lik', type: 'noun_from_noun', compatibleWith: ['noun'], position: 'after'},
            {text: 'luk', type: 'noun_from_noun', compatibleWith: ['noun'], position: 'after'},
            {text: 'lük', type: 'noun_from_noun', compatibleWith: ['noun'], position: 'after'},
            {text: 'cı', type: 'profession', compatibleWith: ['noun'], position: 'after'},
            {text: 'ci', type: 'profession', compatibleWith: ['noun'], position: 'after'},
            {text: 'cu', type: 'profession', compatibleWith: ['noun'], position: 'after'},
            {text: 'cü', type: 'profession', compatibleWith: ['noun'], position: 'after'},
            {text: 'çı', type: 'profession', compatibleWith: ['noun'], position: 'after'},
            {text: 'çi', type: 'profession', compatibleWith: ['noun'], position: 'after'},
            {text: 'çu', type: 'profession', compatibleWith: ['noun'], position: 'after'},
            {text: 'çü', type: 'profession', compatibleWith: ['noun'], position: 'after'},
            {text: 'sel', type: 'adjective_from_noun', compatibleWith: ['noun'], position: 'after'},
            {text: 'sal', type: 'adjective_from_noun', compatibleWith: ['noun'], position: 'after'},
            
            {text: 'mek', type: 'infinitive', compatibleWith: ['verb'], position: 'after'},
            {text: 'mak', type: 'infinitive', compatibleWith: ['verb'], position: 'after'},
            {text: 'di', type: 'past_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'dı', type: 'past_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'du', type: 'past_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'dü', type: 'past_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'ti', type: 'past_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'tı', type: 'past_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'tu', type: 'past_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'tü', type: 'past_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'ecek', type: 'future_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'acak', type: 'future_tense', compatibleWith: ['verb'], position: 'after'},
            {text: 'iyor', type: 'present_continuous', compatibleWith: ['verb'], position: 'after'},
            {text: 'ıyor', type: 'present_continuous', compatibleWith: ['verb'], position: 'after'},
            {text: 'uyor', type: 'present_continuous', compatibleWith: ['verb'], position: 'after'},
            {text: 'üyor', type: 'present_continuous', compatibleWith: ['verb'], position: 'after'},
            {text: 'ir', type: 'aorist', compatibleWith: ['verb'], position: 'after'},
            {text: 'ır', type: 'aorist', compatibleWith: ['verb'], position: 'after'},
            {text: 'ur', type: 'aorist', compatibleWith: ['verb'], position: 'after'},
            {text: 'ür', type: 'aorist', compatibleWith: ['verb'], position: 'after'},
            {text: 'er', type: 'aorist', compatibleWith: ['verb'], position: 'after'},
            {text: 'ar', type: 'aorist', compatibleWith: ['verb'], position: 'after'},
            {text: 'se', type: 'conditional', compatibleWith: ['verb'], position: 'after'},
            {text: 'sa', type: 'conditional', compatibleWith: ['verb'], position: 'after'},
            {text: 'sin', type: 'imperative', compatibleWith: ['verb'], position: 'after'},
            {text: 'sın', type: 'imperative', compatibleWith: ['verb'], position: 'after'},
            {text: 'sun', type: 'imperative', compatibleWith: ['verb'], position: 'after'},
            {text: 'sün', type: 'imperative', compatibleWith: ['verb'], position: 'after'}
        ];
        
        // Sözcükleri ekle
        words.forEach(word => this.validWords.add(word.toLowerCase()));
        
        // Kökleri ekle
        roots.forEach(root => {
            this.validRoots.add(root.text.toLowerCase());
            // Kök bilgilerini sakla
            this.validRoots[root.text.toLowerCase()] = {type: root.type};
        });
        
        // Ekleri ve kuralları ekle
        affixes.forEach(affix => {
            this.validAffixes.set(affix.text.toLowerCase(), affix.compatibleWith);
            this.affixRules.set(affix.text.toLowerCase(), {
                position: affix.position,
                type: affix.type
            });
        });
    }

    // Sözcük geçerli mi kontrol et
    isValidWord(word) {
        word = word.toLowerCase();
        
        // 1. Sözlükte var mı kontrol et
        if (this.validWords.has(word)) {
            return {
                valid: true,
                message: "Tebrikler! Bu geçerli bir Türkçe sözcük."
            };
        }
        
        // 2. Morfolojik yapı kontrolü
        const validationResult = this.validateMorphology(word);
        return validationResult;
    }

    // Morfolojik yapı kontrolü
    validateMorphology(word) {
        // Basit prototip için, sözcüğü kök ve ek olarak ayırmaya çalışalım
        for (const root of this.validRoots) {
            if (word.startsWith(root)) {
                const rootType = this.validRoots[root]?.type;
                const suffix = word.substring(root.length);
                
                // Ek var mı kontrol et
                if (suffix.length > 0) {
                    // Ek geçerli mi ve kök tipiyle uyumlu mu kontrol et
                    if (this.validAffixes.has(suffix)) {
                        const compatibleTypes = this.validAffixes.get(suffix);
                        if (compatibleTypes.includes(rootType)) {
                            return {
                                valid: true,
                                message: `Tebrikler! "${root}" kökü ve "${suffix}" eki ile geçerli bir sözcük oluşturdunuz.`
                            };
                        } else {
                            return {
                                valid: false,
                                message: `"${suffix}" eki "${rootType}" tipi köklerle kullanılamaz.`
                            };
                        }
                    } else {
                        // Birden fazla ek olabilir, daha karmaşık analiz gerekir
                        // Basit prototip için bu kısmı atlıyoruz
                        return {
                            valid: false,
                            message: `"${suffix}" geçerli bir ek değil veya birden fazla ek içeriyor.`
                        };
                    }
                } else {
                    // Sadece kök
                    return {
                        valid: true,
                        message: `"${root}" geçerli bir Türkçe kök.`
                    };
                }
            }
        }
        
        return {
            valid: false,
            message: "Bu sözcük geçerli bir Türkçe sözcük değil veya tanınmayan bir yapıya sahip."
        };
    }

    // Sözcük önerileri getir
    getSuggestions(prefix, limit = 5) {
        prefix = prefix.toLowerCase();
        const suggestions = [];
        
        for (const word of this.validWords) {
            if (word.startsWith(prefix) && suggestions.length < limit) {
                suggestions.push(word);
            }
        }
        
        return suggestions;
    }
}

// Dışa aktarma
window.Dictionary = Dictionary;
