// Enhanced Morpheme Database for MorfemUsta
// This file contains the expanded database with morphemes from multiple AI sources
// Includes: verb roots, noun roots, adjective roots, adverb roots, and various affixes
import newNounRoots from '../data/new-noun-roots.js';

class EnhancedMorphemeDatabase {
  constructor() {
    this.verbRoots = [];
    this.nounRoots = [];
    this.adjectiveRoots = [];
    this.adverbRoots = [];
    this.affixes = [];
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Initialize with verb roots
    this.verbRoots = [
      // Turkish verb roots from multiple sources
      {id: "v1", text: "gel", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v2", text: "git", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v3", text: "al", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v4", text: "ver", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v5", text: "yap", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v6", text: "et", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v7", text: "ol", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v8", text: "bul", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v9", text: "gör", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v10", text: "sor", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v11", text: "de", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v12", text: "söyle", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v13", text: "konuş", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v14", text: "anlat", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v15", text: "dinle", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v16", text: "duy", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v17", text: "bak", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v18", text: "izle", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v19", text: "oku", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v20", text: "yaz", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v21", text: "çiz", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v22", text: "çal", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v23", text: "oyna", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v24", text: "koş", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v25", text: "yürü", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v26", text: "dur", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v27", text: "otur", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v28", text: "kalk", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v29", text: "yat", type: "verb", frequency: "high", difficulty: "easy"},
      {id: "v30", text: "uyu", type: "verb", frequency: "high", difficulty: "easy"},
      // Additional verb roots for medium difficulty
      {id: "v31", text: "düşün", type: "verb", frequency: "high", difficulty: "medium"},
      {id: "v32", text: "anla", type: "verb", frequency: "high", difficulty: "medium"},
      {id: "v33", text: "öğren", type: "verb", frequency: "high", difficulty: "medium"},
      {id: "v34", text: "öğret", type: "verb", frequency: "high", difficulty: "medium"},
      {id: "v35", text: "hatırla", type: "verb", frequency: "high", difficulty: "medium"},
      {id: "v36", text: "unut", type: "verb", frequency: "high", difficulty: "medium"},
      {id: "v37", text: "başla", type: "verb", frequency: "high", difficulty: "medium"},
      {id: "v38", text: "bitir", type: "verb", frequency: "high", difficulty: "medium"},
      {id: "v39", text: "değiş", type: "verb", frequency: "high", difficulty: "medium"},
      {id: "v40", text: "dönüş", type: "verb", frequency: "high", difficulty: "medium"},
      // Advanced verb roots for hard difficulty
      {id: "v41", text: "gerçekleştir", type: "verb", frequency: "medium", difficulty: "hard"},
      {id: "v42", text: "varsay", type: "verb", frequency: "medium", difficulty: "hard"},
      {id: "v43", text: "öngör", type: "verb", frequency: "medium", difficulty: "hard"},
      {id: "v44", text: "kanıtla", type: "verb", frequency: "medium", difficulty: "hard"},
      {id: "v45", text: "savun", type: "verb", frequency: "medium", difficulty: "hard"},
      {id: "v46", text: "eleştir", type: "verb", frequency: "medium", difficulty: "hard"},
      {id: "v47", text: "yorumla", type: "verb", frequency: "medium", difficulty: "hard"},
      {id: "v48", text: "çözümle", type: "verb", frequency: "medium", difficulty: "hard"},
      {id: "v49", text: "sentezle", type: "verb", frequency: "low", difficulty: "hard"},
      {id: "v50", text: "sorgula", type: "verb", frequency: "medium", difficulty: "hard"}
    ];

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
      
      // Person affixes
      {id: "aff19", text: "im", type: "person", compatibleWith: ["verb"], position: "after", variants: ["ım", "im", "um", "üm"], function: "1. tekil şahıs eki", difficulty: "easy"},
      {id: "aff20", text: "sin", type: "person", compatibleWith: ["verb"], position: "after", variants: ["sın", "sin", "sun", "sün"], function: "2. tekil şahıs eki", difficulty: "easy"},
      {id: "aff21", text: "", type: "person", compatibleWith: ["verb"], position: "after", variants: [""], function: "3. tekil şahıs eki", difficulty: "easy"},
      {id: "aff22", text: "iz", type: "person", compatibleWith: ["verb"], position: "after", variants: ["ız", "iz", "uz", "üz"], function: "1. çoğul şahıs eki", difficulty: "medium"},
      {id: "aff23", text: "siniz", type: "person", compatibleWith: ["verb"], position: "after", variants: ["sınız", "siniz", "sunuz", "sünüz"], function: "2. çoğul şahıs eki", difficulty: "medium"},
      {id: "aff24", text: "ler", type: "person", compatibleWith: ["verb"], position: "after", variants: ["lar", "ler"], function: "3. çoğul şahıs eki", difficulty: "medium"},
      
      // Derivational affixes (noun to verb)
      {id: "aff25", text: "le", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["la", "le"], function: "isimden fiil yapım eki", difficulty: "medium"},
      {id: "aff26", text: "len", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["lan", "len"], function: "isimden fiil yapım eki", difficulty: "medium"},
      {id: "aff27", text: "leş", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["laş", "leş"], function: "isimden fiil yapım eki", difficulty: "medium"},
      
      // Derivational affixes (verb to noun)
      {id: "aff28", text: "me", type: "derivational", compatibleWith: ["verb"], position: "after", variants: ["ma", "me"], function: "fiilden isim yapım eki", difficulty: "medium"},
      {id: "aff29", text: "iş", type: "derivational", compatibleWith: ["verb"], position: "after", variants: ["ış", "iş", "uş", "üş"], function: "fiilden isim yapım eki", difficulty: "medium"},
      {id: "aff30", text: "im", type: "derivational", compatibleWith: ["verb"], position: "after", variants: ["ım", "im", "um", "üm"], function: "fiilden isim yapım eki", difficulty: "medium"},
      
      // Derivational affixes (noun to adjective)
      {id: "aff31", text: "li", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["lı", "li", "lu", "lü"], function: "isimden sıfat yapım eki", difficulty: "easy"},
      {id: "aff32", text: "siz", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["sız", "siz", "suz", "süz"], function: "isimden sıfat yapım eki", difficulty: "easy"},
      {id: "aff33", text: "sel", type: "derivational", compatibleWith: ["noun"], position: "after", variants: ["sal", "sel"], function: "isimden sıfat yapım eki", difficulty: "medium"},
      
      // Derivational affixes (adjective to adverb)
      {id: "aff34", text: "ce", type: "derivational", compatibleWith: ["adjective"], position: "after", variants: ["ca", "ce"], function: "sıfattan zarf yapım eki", difficulty: "easy"},
      {id: "aff35", text: "en", type: "derivational", compatibleWith: ["adjective"], position: "after", variants: ["en"], function: "sıfattan zarf yapım eki", difficulty: "medium"},
      
      // Negation and question affixes
      {id: "aff36", text: "me", type: "negation", compatibleWith: ["verb"], position: "after", variants: ["ma", "me"], function: "olumsuzluk eki", difficulty: "easy"},
      {id: "aff37", text: "mi", type: "question", compatibleWith: ["verb", "noun", "adjective", "adverb"], position: "after", variants: ["mı", "mi", "mu", "mü"], function: "soru eki", difficulty: "easy"},
      
      // Conditional and ability affixes
      {id: "aff38", text: "se", type: "conditional", compatibleWith: ["verb"], position: "after", variants: ["sa", "se"], function: "şart kipi eki", difficulty: "medium"},
      {id: "aff39", text: "ebil", type: "ability", compatibleWith: ["verb"], position: "after", variants: ["abil", "ebil"], function: "yeterlilik kipi eki", difficulty: "medium"},
      
      // Advanced affixes
      {id: "aff40", text: "ken", type: "adverbial", compatibleWith: ["verb"], position: "after", variants: ["ken"], function: "zarf-fiil eki", difficulty: "hard"}
    ];
  }

  // Process new noun roots and add IDs
  processNewNounRoots(newRoots) {
    const processedRoots = [];
    
    // Add existing noun roots if any
    // (In this case, we're starting fresh with the new expanded list)
    
    // Process and add new noun roots with IDs
    newRoots.forEach((root, index) => {
      processedRoots.push({
        id: `n${index + 1}`,
        text: root.text,
        type: root.type,
        frequency: root.frequency,
        difficulty: root.difficulty
      });
    });
    
    return processedRoots;
  }

  // Get morphemes filtered by age group and difficulty level
  getMorphemesByAgeAndDifficulty(ageGroup, difficultyLevel) {
    let result = {
      verbRoots: [],
      nounRoots: [],
      adjectiveRoots: [],
      adverbRoots: [],
      affixes: []
    };
    
    // Define difficulty filters based on age group and selected difficulty level
    let difficultyFilter;
    
    if (ageGroup === 'child') { // 7-12
      if (difficultyLevel === 'easy') {
        difficultyFilter = ['easy'];
      } else if (difficultyLevel === 'medium') {
        difficultyFilter = ['easy', 'medium'];
      } else { // hard
        difficultyFilter = ['easy', 'medium'];
      }
    } else if (ageGroup === 'teen') { // 13-18
      if (difficultyLevel === 'easy') {
        difficultyFilter = ['easy'];
      } else if (difficultyLevel === 'medium') {
        difficultyFilter = ['easy', 'medium'];
      } else { // hard
        difficultyFilter = ['easy', 'medium', 'hard'];
      }
    } else { // adult (19+)
      if (difficultyLevel === 'easy') {
        difficultyFilter = ['easy'];
      } else if (difficultyLevel === 'medium') {
        difficultyFilter = ['easy', 'medium'];
      } else { // hard
        difficultyFilter = ['easy', 'medium', 'hard'];
      }
    }
    
    // Filter morphemes based on difficulty
    result.verbRoots = this.verbRoots.filter(root => difficultyFilter.includes(root.difficulty));
    result.nounRoots = this.nounRoots.filter(root => difficultyFilter.includes(root.difficulty));
    result.adjectiveRoots = this.adjectiveRoots.filter(root => difficultyFilter.includes(root.difficulty));
    result.adverbRoots = this.adverbRoots.filter(root => difficultyFilter.includes(root.difficulty));
    result.affixes = this.affixes.filter(affix => difficultyFilter.includes(affix.difficulty));
    
    return result;
  }
  
  // Get all morphemes
  getAllMorphemes() {
    return {
      verbRoots: this.verbRoots,
      nounRoots: this.nounRoots,
      adjectiveRoots: this.adjectiveRoots,
      adverbRoots: this.adverbRoots,
      affixes: this.affixes
    };
  }
  
  // Get morpheme counts
  getMorphemeCounts() {
    return {
      verbRoots: this.verbRoots.length,
      nounRoots: this.nounRoots.length,
      adjectiveRoots: this.adjectiveRoots.length,
      adverbRoots: this.adverbRoots.length,
      affixes: this.affixes.length,
      total: this.verbRoots.length + this.nounRoots.length + this.adjectiveRoots.length + this.adverbRoots.length + this.affixes.length
    };
  }
}

export default EnhancedMorphemeDatabase;
