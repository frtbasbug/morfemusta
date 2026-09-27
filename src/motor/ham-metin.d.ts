// Vite'ın `?raw` içe aktarması: dosyanın metni derlemede bir dizeye gömülür.
// Uygulamada vite/client da bunu tanımlar; motor kendi tür denetiminde (tsconfig.motor.json)
// Vite türlerini yüklemediği için tanımı burada tutar.
declare module '*.csv?raw' {
  const metin: string
  export default metin
}
