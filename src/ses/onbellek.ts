// Seslerin önbelleğinin adı (iç ad; oyunun eski adını taşır, değişmez). Bölgeye ilk girişte
// inen sesler oraya iner, service worker de oradan verir (vite.config.ts'teki SES_ONBELLEGI).
// Ayrı dosyada: eski adresin temizliği (src/kabuk/eskiAdres.ts) çaları yüklemeden kullanır.

/** Bölgeye ilk girişte inen seslerin önbelleği; service worker de oradan verir. */
export const SES_ONBELLEGI = 'morfemusta-ses'
