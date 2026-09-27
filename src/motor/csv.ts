// Küçük bir CSV okuyucusu (RFC 4180): alanlar virgülle ayrılır; çift tırnaklı bir alanda
// virgül, satır sonu ve "" (tek tırnak işareti) bulunabilir; satır sonu LF ya da CRLF'dir.
// İlk satır başlıktır; her kayıt başlıktaki adlarla eşlenir. Boş satırlar atlanır.

export interface CsvKaydi {
  /** Kaydın dosyadaki satır numarası (başlık 1. satırdır); hata iletileri için. */
  readonly satirNo: number
  readonly alanlar: Readonly<Record<string, string>>
}

export function csvOku(metin: string, basliklar: readonly string[]): CsvKaydi[] {
  const [baslik, ...govde] = satirlaraAyir(metin)
  if (!baslik) throw new Error('CSV boş')
  if (baslik.alanlar.join(',') !== basliklar.join(',')) {
    throw new Error(
      `CSV başlığı "${baslik.alanlar.join(',')}"; beklenen "${basliklar.join(',')}"`,
    )
  }
  return govde.map(({ satirNo, alanlar }) => {
    if (alanlar.length !== basliklar.length) {
      throw new Error(
        `CSV ${satirNo}. satır: ${basliklar.length} alan beklenirken ${alanlar.length} alan var`,
      )
    }
    return {
      satirNo,
      alanlar: Object.fromEntries(basliklar.map((ad, i) => [ad, alanlar[i] ?? ''])),
    }
  })
}

interface HamSatir {
  satirNo: number
  alanlar: string[]
}

function satirlaraAyir(metin: string): HamSatir[] {
  const temiz = metin.replace(/^﻿/, '')
  const satirlar: HamSatir[] = []
  let alanlar: string[] = []
  let alan = ''
  let tirnakta = false
  let satirNo = 1
  let baslangic = 1

  const satiriBitir = () => {
    alanlar.push(alan)
    // Boş satır tek boş alan olarak okunur; atlanır.
    if (alanlar.length > 1 || alanlar[0] !== '') {
      satirlar.push({ satirNo: baslangic, alanlar })
    }
    alanlar = []
    alan = ''
  }

  for (let i = 0; i < temiz.length; i++) {
    const c = temiz.charAt(i)
    if (tirnakta) {
      if (c === '"' && temiz.charAt(i + 1) === '"') {
        alan += '"'
        i++
      } else if (c === '"') {
        tirnakta = false
      } else {
        if (c === '\n') satirNo++
        alan += c
      }
    } else if (c === '"' && alan === '') {
      tirnakta = true
    } else if (c === ',') {
      alanlar.push(alan)
      alan = ''
    } else if (c === '\n' || (c === '\r' && temiz.charAt(i + 1) === '\n')) {
      if (c === '\r') i++
      satiriBitir()
      satirNo++
      baslangic = satirNo
    } else {
      alan += c
    }
  }
  if (tirnakta) throw new Error(`CSV ${baslangic}. satır: tırnak kapanmamış`)
  if (alan !== '' || alanlar.length > 0) satiriBitir()
  return satirlar
}
