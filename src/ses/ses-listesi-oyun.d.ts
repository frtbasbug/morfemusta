// Oyunun paketindeki ses listesi (vite.config.ts, sesListesiOyun): metinden [dosyanın özeti
// (.mp3'süz), sürüm, ...bölgeler] dizisine.
declare module '*/ses-listesi.json?oyun' {
  const metinler: Readonly<Record<string, readonly [string, string, ...string[]]>>
  export default metinler
}
