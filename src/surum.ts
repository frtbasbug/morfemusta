// Oyunun sürümü: adı burada yazılıdır; kısa commit ve commit'in tarihi derlemede pakete girer
// (vite.config.ts, define: __SURUM_COMMIT__, __SURUM_TARIHI__). Ayarlar'daki Hakkında'da,
// pilot.html'de ve deneme günlüğünün her satırında (surum sütunu: yalnız ad) görünür.
//
// Pilot sürerken main'e yalnız pilot düzeltmeleri girer; her biri sürüm adını artırır: pilot-1,
// pilot-1.1, pilot-1.2 (CLAUDE.md, 17. kural).

export const SURUM_ADI = 'pilot-1'

export interface Surum {
  /** Sürümün adı: pilot-1. */
  readonly ad: string
  /** Derlenen commit'in kısa özeti (7 hane); git yoksa "bilinmiyor". */
  readonly commit: string
  /** Commit'in tarihi (YYYY-AA-GG); git yoksa derlemenin günü. */
  readonly tarih: string
}

export const SURUM: Surum = {
  ad: SURUM_ADI,
  commit: __SURUM_COMMIT__,
  tarih: __SURUM_TARIHI__,
}

/** Görünen yazı: pilot-1 (a1b2c3d, 2026-10-01). */
export const surumYazisi = (surum: Surum = SURUM): string =>
  `${surum.ad} (${surum.commit}, ${surum.tarih})`
