// Enhanced and Expanded Morpheme Database for MorfemUsta
// This file contains the expanded database with morphemes from multiple sources
// Includes: expanded verb roots, noun roots, adjective roots, adverb roots, and various affixes

import expandedVerbRoots from '../data/expanded/expanded-verb-roots.js';
import newNounRoots from '../data/new-noun-roots.js';

class SuperEnhancedMorphemeDatabase {
  constructor() {
    this.verbRoots = [];
    this.nounRoots = [];
    this.adjectiveRoots = [];
    this.adverbRoots = [];
    this.affixes = [];
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Initialize with expanded verb roots
    this.verbRoots = expandedVerbRoots;

    // Initialize with noun roots (including the new expanded list)
    this.nounRoots = this.processNewNounRoots(newNounRoots);

    // Initialize with adjective roots (combined from multiple sources, duplicates removed)
    this.adjectiveRoots = [
      // Basic adjectives (easy difficulty)
      {id: "adj1", text: "iyi", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj2", text: "kötü", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj3", text: "güzel", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj4", text: "çirkin", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj5", text: "büyük", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj6", text: "küçük", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj7", text: "uzun", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj8", text: "kısa", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj9", text: "geniş", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj10", text: "dar", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj11", text: "kalın", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj12", text: "ince", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj13", text: "ağır", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj14", text: "hafif", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj15", text: "yüksek", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj16", text: "alçak", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj17", text: "sıcak", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj18", text: "soğuk", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj19", text: "ılık", type: "adjective", frequency: "high", difficulty: "easy"},
      {id: "adj20", text: "sert", type: "adjective", frequency: "high", difficulty: "easy"},
      // Medium difficulty adjectives
      {id: "adj21", text: "yumuşak", type: "adjective", frequency: "high", difficulty: "medium"},
      {id: "adj22", text: "keskin", type: "adjective", frequency: "medium", difficulty: "medium"},
      {id: "adj23", text: "pürüzlü", type: "adjective", frequency: "medium", difficulty: "medium"},
      {id: "adj24", text: "pürüzsüz", type: "adjective", frequency: "medium", difficulty: "medium"},
      {id: "adj25", text: "nemli", type: "adjective", frequency: "medium", difficulty: "medium"},
      {id: "adj26", text: "kuru", type: "adjective", frequency: "high", difficulty: "medium"},
      {id: "adj27", text: "taze", type: "adjective", frequency: "high", difficulty: "medium"},
      {id: "adj28", text: "bayat", type: "adjective", frequency: "medium", difficulty: "medium"},
      {id: "adj29", text: "bozuk", type: "adjective", frequency: "medium", difficulty: "medium"},
      {id: "adj30", text: "sağlam", type: "adjective", frequency: "high", difficulty: "medium"},
      // Hard difficulty adjectives
      {id: "adj31", text: "karmaşık", type: "adjective", frequency: "medium", difficulty: "hard"},
      {id: "adj32", text: "tedirgin", type: "adjective", frequency: "medium", difficulty: "hard"},
      {id: "adj33", text: "bilge", type: "adjective", frequency: "low", difficulty: "hard"},
      {id: "adj34", text: "olağanüstü", type: "adjective", frequency: "medium", difficulty: "hard"},
      {id: "adj35", text: "belirsiz", type: "adjective", frequency: "medium", difficulty: "hard"},
      {id: "adj36", text: "bulanık", type: "adjective", frequency: "medium", difficulty: "hard"},
      {id: "adj37", text: "berrak", type: "adjective", frequency: "medium", difficulty: "hard"},
      {id: "adj38", text: "dalgalı", type: "adjective", frequency: "medium", difficulty: "hard"},
      {id: "adj39", text: "durgun", type: "adjective", frequency: "medium", difficulty: "hard"},
      {id: "adj40", text: "akıcı", type: "adjective", frequency: "medium", difficulty: "hard"}
    ];

    // Initialize with adverb roots (combined from multiple sources, duplicates removed)
    this.adverbRoots = [
      // Basic adverbs (easy difficulty)
      {id: "adv1", text: "hızlı", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv2", text: "yavaş", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv3", text: "çok", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv4", text: "az", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv5", text: "şimdi", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv6", text: "sonra", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv7", text: "önce", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv8", text: "bugün", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv9", text: "dün", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv10", text: "yarın", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv11", text: "içeri", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv12", text: "dışarı", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv13", text: "yukarı", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv14", text: "aşağı", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv15", text: "ileri", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv16", text: "geri", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv17", text: "yakın", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv18", text: "uzak", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv19", text: "hızlıca", type: "adverb", frequency: "high", difficulty: "easy"},
      {id: "adv20", text: "yavaşça", type: "adverb", frequency: "high", difficulty: "easy"},
      // Medium difficulty adverbs
      {id: "adv21", text: "sessizce", type: "adverb", frequency: "medium", difficulty: "medium"},
      {id: "adv22", text: "gizli", type: "adverb", frequency: "medium", difficulty: "medium"},
      {id: "adv23", text: "açık", type: "adverb", frequency: "high", difficulty: "medium"},
      {id: "adv24", text: "gürültülü", type: "adverb", frequency: "medium", difficulty: "medium"},
      {id: "adv25", text: "derin", type: "adverb", frequency: "medium", difficulty: "medium"},
      {id: "adv26", text: "sığ", type: "adverb", frequency: "low", difficulty: "medium"},
      {id: "adv27", text: "düz", type: "adverb", frequency: "medium", difficulty: "medium"},
      {id: "adv28", text: "eğri", type: "adverb", frequency: "low", difficulty: "medium"},
      {id: "adv29", text: "sakin", type: "adverb", frequency: "medium", difficulty: "medium"},
      {id: "adv30", text: "hareketli", type: "adverb", frequency: "low", difficulty: "medium"},
      // Hard difficulty adverbs
      {id: "adv31", text: "karmaşık", type: "adverb", frequency: "low", difficulty: "hard"},
      {id: "adv32", text: "endişeli", type: "adverb", frequency: "low", difficulty: "hard"},
      {id: "adv33", text: "ivedilikle", type: "adverb", frequency: "medium", difficulty: "hard"},
      {id: "adv34", text: "bilhassa", type: "adverb", frequency: "medium", difficulty: "hard"},
      {id: "adv35", text: "bizzat", type: "adverb", frequency: "medium", difficulty: "hard"},
      {id: "adv36", text: "ekseriyetle", type: "adverb", frequency: "medium", difficulty: "hard"},
      {id: "adv37", text: "büsbütün", type: "adverb", frequency: "medium", difficulty: "hard"},
      {id: "adv38", text: "örtülü", type: "adverb", frequency: "medium", difficulty: "hard"},
      {id: "adv39", text: "haykırarak", type: "adverb", frequency: "medium", difficulty: "hard"},
      {id: "adv40", text: "istemeye istemeye", type: "adverb", frequency: "medium", difficulty: "hard"}
    ];

    // Initialize with affixes
    this.affixes = [
      // Noun affixes
      {id: "aff1", text: "lar", type: "plural", compatibleWith: ["noun"], position: "after", variants: ["lar", "ler"], function: "çoğul eki", difficulty: "easy"},
      {id: "aff2", text: "ım", type: "possessive", compatibleWith: ["noun"], position: "after", variants: ["ım", "im", "um", "üm"], function: "iyelik eki (1. tekil şahıs)", difficulty: "easy"},
      {id: "aff3", text: "ın", type: "possessive", compatibleWith: ["noun"], position: "after", variants: ["ın", "in", "un", "ün"], function: "iyelik eki (2. tekil şahıs)", difficulty: "easy"},
      {id: "aff4", text: "ı", type: "possessive", compatibleWith: ["noun"], position: "after", variants: ["ı", "i", "u", "ü"], function: "iyelik eki (3. tekil şahıs)", difficulty: "easy"},
      {id: "aff5", text: "ımız", type: "possessive", compatibleWith: ["noun"], position: "after", variants: ["ımız", "imiz", "umuz", "ümüz"], function: "iyelik eki (1. çoğul şahıs)", difficulty: "medium"},
      {id: "aff6", text: "ınız", type: "possessive", compatibleWith: ["noun"], position: "after", variants: ["ınız", "iniz", "unuz", "ünüz"], function: "iyelik eki (2. çoğul şahıs)", difficulty: "medium"},
      {id: "aff7", text: "ları", type: "possessive", compatibleWith: ["noun"], position: "after", variants: ["ları", "leri"], function: "iyelik eki (3. çoğul şahıs)", difficulty: "medium"},
      
      // Case affixes
      {id: "aff8", text: "ı", type: "accusative", compatibleWith: ["noun"], position: "after", variants: ["ı", "i", "u", "ü"], function: "belirtme durumu eki", difficulty: "easy"},
      {id: "aff9", text: "e", type: "dative", compatibleWith: ["noun"], position: "after", variants: ["a", "e"], function: "yönelme durumu eki", difficulty: "easy"},
      {id: "aff10", text: "de", type: "locative", compatibleWith: ["noun"], position: "after", variants: ["da", "de", "ta", "te"], function: "bulunma durumu eki", difficulty: "easy"},
      {id: "aff11", text: "den", type: "ablative", compatibleWith: ["noun"], position: "after", variants: ["dan", "den", "tan", "ten"], function: "ayrılma durumu eki", difficulty: "easy"},
      {id: "aff12", text: "in", type: "genitive", compatibleWith: ["noun"], position: "after", variants: ["ın", "in", "un", "ün"], function: "ilgi durumu eki", difficulty: "medium"},
      
      // Verb tense affixes
      {id: "aff13", text: "di", type: "past", compatibleWith: ["verb"], position: "after", variants: ["dı", "di", "du", "dü", "tı", "ti", "tu", "tü"], function: "geçmiş zaman eki", difficulty: "easy"},
      {id: "aff14", text: "yor", type: "present", compatibleWith: ["verb"], position: "after", variants: ["yor"], function: "şimdiki zaman eki", difficulty: "easy"},
      {id: "aff15", text: "ecek", type: "future", compatibleWith: ["verb"], position: "after", variants: ["acak", "ecek"], function: "gelecek zaman eki", difficulty: "easy"},
      {id: "aff16", text: "miş", type: "reported", compatibleWith: ["verb"], position: "after", variants: ["mış", "miş", "muş", "müş"], function: "duyulan geçmiş zaman eki", difficulty: "medium"},
      {id: "aff17", text: "ir", type: "aorist", compatibleWith: ["verb"], position: "after", variants: ["ır", "ir", "ur", "ür", "ar", "er"], function: "geniş zaman eki", difficulty: "medium"},
      {id: "aff18", text: "meli", type: "necessitative", compatibleWith: ["verb"], position: "after", variants: ["malı", "meli"], function: "gereklilik kipi eki", difficulty: "medium"},
      {id: "aff19", text: "se", type: "conditional", compatibleWith: ["verb"], position: "after", variants: ["sa", "se"], function: "şart kipi eki", difficulty: "medium"},
      {id: "aff20", text: "e", type: "optative", compatibleWith: ["verb"], position: "after", variants: ["a", "e"], function: "istek kipi eki", difficulty: "medium"},
      
      // Person affixes
      {id: "aff21", text: "im", type: "person", compatibleWith: ["verb"], position: "after", variants: ["ım", "im", "um", "üm"], function: "1. tekil şahıs eki", difficulty: "easy"},
      {id: "aff22", text: "sin", type: "person", compatibleWith: ["verb"], position: "after", variants: ["sın", "sin", "sun", "sün"], function: "2. tekil şahıs eki", difficulty: "easy"},
      {id: "aff23", text: "", type: "person", compatibleWith: ["verb"], position: "after", variants: [""], function: "3. tekil şahıs eki", difficulty: "easy"},
      {id: "aff24", text: "iz", type: "person", compatibleWith: ["verb"], position: "after", variants: ["ız", "iz", "uz", "üz"], function: "1. çoğul şahıs eki", difficulty: "medium"},
      {id: "aff25", text: "siniz", type: "person", compatibleWith: ["verb"], position: "after", variants: ["sınız", "siniz", "sunuz", "sünüz"], function: "2. çoğul şahıs eki", difficulty: "medium"},
      {id: "aff26", text: "ler", type: "person", compatibleWith: ["verb"], position: "after", variants: ["lar", "ler"], function: "3. çoğul şahıs eki", difficulty: "medium"},
      
      // Derivational affixes (noun to verb)
      {id: "aff27", text: "le", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["la", "le"], function: "isimden fiil yapım eki", difficulty: "medium"},
      {id: "aff28", text: "len", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["lan", "len"], function: "isimden fiil yapım eki", difficulty: "medium"},
      {id: "aff29", text: "leş", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["laş", "leş"], function: "isimden fiil yapım eki", difficulty: "medium"},
      
      // Derivational affixes (verb to noun)
      {id: "aff30", text: "me", type: "derivational", compatibleWith: ["verb"], position: "after", variants: ["ma", "me"], function: "fiilden isim yapım eki", difficulty: "medium"},
      {id: "aff31", text: "iş", type: "derivational", compatibleWith: ["verb"], position: "after", variants: ["ış", "iş", "uş", "üş"], function: "fiilden isim yapım eki", difficulty: "medium"},
      {id: "aff32", text: "im", type: "derivational", compatibleWith: ["verb"], position: "after", variants: ["ım", "im", "um", "üm"], function: "fiilden isim yapım eki", difficulty: "medium"},
      
      // Derivational affixes (noun to adjective)
      {id: "aff33", text: "li", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["lı", "li", "lu", "lü"], function: "isimden sıfat yapım eki", difficulty: "medium"},
      {id: "aff34", text: "siz", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["sız", "siz", "suz", "süz"], function: "isimden sıfat yapım eki", difficulty: "medium"},
      {id: "aff35", text: "sel", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["sal", "sel"], function: "isimden sıfat yapım eki", difficulty: "hard"},
      
      // Derivational affixes (verb to adjective)
      {id: "aff36", text: "ik", type: "derivational", compatibleWith: ["verb"], position: "after", variants: ["ık", "ik", "uk", "ük"], function: "fiilden sıfat yapım eki", difficulty: "hard"},
      {id: "aff37", text: "gin", type: "derivational", compatibleWith: ["verb"], position: "after", variants: ["gın", "gin", "gun", "gün", "kın", "kin", "kun", "kün"], function: "fiilden sıfat yapım eki", difficulty: "hard"},
      
      // Derivational affixes (adjective to adverb)
      {id: "aff38", text: "ce", type: "derivational", compatibleWith: ["adjective"], position: "after", variants: ["ca", "ce"], function: "sıfattan zarf yapım eki", difficulty: "medium"},
      
      // Negation affixes
      {id: "aff39", text: "me", type: "negation", compatibleWith: ["verb"], position: "after", variants: ["ma", "me"], function: "olumsuzluk eki", difficulty: "easy"},
      {id: "aff40", text: "siz", type: "negation", compatibleWith: ["noun"], position: "after", variants: ["sız", "siz", "suz", "süz"], function: "yokluk eki", difficulty: "easy"}
    ];
  }

  // Process noun roots from the imported data
  processNewNounRoots(nounRootsData) {
    let processedRoots = [];
    let id = 1;
    
    nounRootsData.forEach(root => {
      processedRoots.push({
        id: `n${id}`,
        text: root.text,
        type: root.type,
        frequency: root.frequency,
        difficulty: root.difficulty
      });
      id++;
    });
    
    return processedRoots;
  }

  // Get morphemes filtered by type
  getMorphemesByType(type) {
    switch(type) {
      case 'verb':
        return this.verbRoots;
      case 'noun':
        return this.nounRoots;
      case 'adjective':
        return this.adjectiveRoots;
      case 'adverb':
        return this.adverbRoots;
      case 'affix':
        return this.affixes;
      default:
        return [];
    }
  }

  // Get morphemes filtered by difficulty
  getMorphemesByDifficulty(difficulty) {
    let result = {
      verbRoots: this.verbRoots.filter(m => m.difficulty === difficulty),
      nounRoots: this.nounRoots.filter(m => m.difficulty === difficulty),
      adjectiveRoots: this.adjectiveRoots.filter(m => m.difficulty === difficulty),
      adverbRoots: this.adverbRoots.filter(m => m.difficulty === difficulty),
      affixes: this.affixes.filter(m => m.difficulty === difficulty)
    };
    return result;
  }

  // Get morphemes filtered by age group
  getMorphemesByAgeGroup(ageGroup) {
    // Different age groups get different difficulty levels
    switch(ageGroup) {
      case 'child': // 7-12
        return {
          verbRoots: this.verbRoots.filter(m => m.difficulty === 'easy'),
          nounRoots: this.nounRoots.filter(m => m.difficulty === 'easy'),
          adjectiveRoots: this.adjectiveRoots.filter(m => m.difficulty === 'easy'),
          adverbRoots: this.adverbRoots.filter(m => m.difficulty === 'easy'),
          affixes: this.affixes.filter(m => m.difficulty === 'easy')
        };
      case 'teen': // 13-18
        return {
          verbRoots: this.verbRoots.filter(m => m.difficulty === 'easy' || m.difficulty === 'medium'),
          nounRoots: this.nounRoots.filter(m => m.difficulty === 'easy' || m.difficulty === 'medium'),
          adjectiveRoots: this.adjectiveRoots.filter(m => m.difficulty === 'easy' || m.difficulty === 'medium'),
          adverbRoots: this.adverbRoots.filter(m => m.difficulty === 'easy' || m.difficulty === 'medium'),
          affixes: this.affixes.filter(m => m.difficulty === 'easy' || m.difficulty === 'medium')
        };
      case 'adult': // 19+
        return {
          verbRoots: this.verbRoots,
          nounRoots: this.nounRoots,
          adjectiveRoots: this.adjectiveRoots,
          adverbRoots: this.adverbRoots,
          affixes: this.affixes
        };
      default:
        return {
          verbRoots: this.verbRoots.filter(m => m.difficulty === 'easy'),
          nounRoots: this.nounRoots.filter(m => m.difficulty === 'easy'),
          adjectiveRoots: this.adjectiveRoots.filter(m => m.difficulty === 'easy'),
          adverbRoots: this.adverbRoots.filter(m => m.difficulty === 'easy'),
          affixes: this.affixes.filter(m => m.difficulty === 'easy')
        };
    }
  }

  // Get statistics about the database
  getDatabaseStats() {
    return {
      totalMorphemes: this.verbRoots.length + this.nounRoots.length + this.adjectiveRoots.length + this.adverbRoots.length + this.affixes.length,
      verbRoots: this.verbRoots.length,
      nounRoots: this.nounRoots.length,
      adjectiveRoots: this.adjectiveRoots.length,
      adverbRoots: this.adverbRoots.length,
      affixes: this.affixes.length,
      difficultyDistribution: {
        easy: {
          verbRoots: this.verbRoots.filter(m => m.difficulty === 'easy').length,
          nounRoots: this.nounRoots.filter(m => m.difficulty === 'easy').length,
          adjectiveRoots: this.adjectiveRoots.filter(m => m.difficulty === 'easy').length,
          adverbRoots: this.adverbRoots.filter(m => m.difficulty === 'easy').length,
          affixes: this.affixes.filter(m => m.difficulty === 'easy').length
        },
        medium: {
          verbRoots: this.verbRoots.filter(m => m.difficulty === 'medium').length,
          nounRoots: this.nounRoots.filter(m => m.difficulty === 'medium').length,
          adjectiveRoots: this.adjectiveRoots.filter(m => m.difficulty === 'medium').length,
          adverbRoots: this.adverbRoots.filter(m => m.difficulty === 'medium').length,
          affixes: this.affixes.filter(m => m.difficulty === 'medium').length
        },
        hard: {
          verbRoots: this.verbRoots.filter(m => m.difficulty === 'hard').length,
          nounRoots: this.nounRoots.filter(m => m.difficulty === 'hard').length,
          adjectiveRoots: this.adjectiveRoots.filter(m => m.difficulty === 'hard').length,
          adverbRoots: this.adverbRoots.filter(m => m.difficulty === 'hard').length,
          affixes: this.affixes.filter(m => m.difficulty === 'hard').length
        }
      }
    };
  }
}

export default SuperEnhancedMorphemeDatabase;
