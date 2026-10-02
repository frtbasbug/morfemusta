import { describe, expect, it } from 'vitest'
import { bolgeBul, type Bolge } from './bolgeler.ts'
import {
  COCUK_KODU,
  CSV_AYRACI,
  DURMA_ANAHTARI,
  GUNLUK_ANAHTARI,
  SUTUNLAR,
  UTF8_IMI,
  cocukKodunuCoz,
  cocukOzetleri,
  csvDosyaAdi,
  csvMetni,
  denemeSayaci,
  depoDoluMu,
  gorevBitirdiMi,
  gorevinSonBicimi,
  gunluguOku,
  gunlukAcikMi,
  gunluguSil,
  gunlukYazici,
  koduSil,
  koduYaz,
  kopyaMetni,
  oranYazisi,
  puanlanirMi,
  satirKur,
  yeniCocuk,
  yerelZaman,
  type DenemeSatiri,
  type PilotDeposu,
  type Secim,
  type YazmaBaglami,
} from './gunluk.ts'
import {
  ANAHTAR,
  ekrandaPuanYaz,
  eliKapat,
  gorevBitti,
  ilerlemeyiYukle,
  ipucunuKapat,
  oyunKaydi,
  pencereKaydi,
  ayarlariDegistir,
} from './ilerleme.ts'

/** Bellekte bir depo; dolu anahtarlara yazılamaz (QuotaExceededError gibi). */
function bellekDeposu(dolu: (anahtar: string) => boolean = () => false) {
  const kayitlar = new Map<string, string>()
  let yazmaDenemesi = 0
  const depo: PilotDeposu = {
    getItem: (anahtar) => kayitlar.get(anahtar) ?? null,
    setItem: (anahtar, deger) => {
      yazmaDenemesi++
      if (dolu(anahtar)) throw new Error('QuotaExceededError')
      kayitlar.set(anahtar, deger)
    },
    removeItem: (anahtar) => {
      kayitlar.delete(anahtar)
    },
  }
  return {
    depo,
    kayitlar,
    get yazmaDenemesi() {
      return yazmaDenemesi
    },
  }
}

/** Her işlemde hata atan depo: erişimi engellenmiş localStorage gibi. */
const HATALI_DEPO: PilotDeposu = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('SecurityError')
  },
  removeItem: () => {
    throw new Error('SecurityError')
  },
}

const KOY = bolgeBul('koy') as Bolge
const AN = new Date(2026, 9, 1, 10, 15, 3, 250)
const baglam = (degisen: Partial<YazmaBaglami> = {}): YazmaBaglami => ({
  sinif: false,
  sesModu: 'sesli',
  simdi: AN,
  ...degisen,
})

/** Koy'un 1. görevinde yanlış bir seçim: at + ler. */
const SECIM: Secim = {
  bolge: 'koy',
  tur: 1,
  gorev: 1,
  kok: 'at',
  ekler: 'PL',
  dogruBicim: 'atlar',
  secilen: 'ler',
  aday: 'atler',
  dogru: false,
  neden: 'PL:kalınlık',
  denemeNo: 1,
  sureMs: 5230.4,
}

const kayit = (depo: { kayitlar: Map<string, string> }) =>
  JSON.parse(depo.kayitlar.get(GUNLUK_ANAHTARI) ?? 'null') as {
    cocuk: string | null
    satirlar: unknown[]
  } | null

describe('çocuk kodu', () => {
  it('bir büyük harf ve iki ya da üç rakam; boşluk atılır, harf büyür', () => {
    expect(cocukKodunuCoz('P01')).toBe('P01')
    expect(cocukKodunuCoz('  p07 ')).toBe('P07')
    expect(cocukKodunuCoz('A123')).toBe('A123')
    expect(COCUK_KODU.test('P01')).toBe(true)
  })

  it('ad yazılamaz: harf dizisi, Türkçe harf, uzun ya da kısa kod geçmez', () => {
    for (const girdi of ['', 'Ali', 'ALI1', 'Ayşe', 'P1', 'P1234', 'Ç01', 'İ01', 'P-01', '01', 'PP01']) {
      expect(cocukKodunuCoz(girdi), girdi).toBeNull()
    }
  })
})

describe('günlük satırı', () => {
  it('alanları CSV sütunlarıdır, sırasıyla', () => {
    expect(SUTUNLAR).toEqual([
      'zaman',
      'cocuk',
      'surum',
      'bolge',
      'tur',
      'gorev',
      'kok',
      'ekler',
      'dogru_bicim',
      'secilen',
      'aday',
      'sonuc',
      'neden',
      'deneme_no',
      'sure_ms',
      'ses_modu',
    ])
    const satir = satirKur(SECIM, 'P01', 'pilot-1', { sesModu: 'sesli', simdi: AN })
    expect(Object.keys(satir)).toEqual([...SUTUNLAR])
    expect(satir).toEqual({
      zaman: yerelZaman(AN),
      cocuk: 'P01',
      surum: 'pilot-1',
      bolge: 'koy',
      tur: 1,
      gorev: 1,
      kok: 'at',
      ekler: 'PL',
      dogru_bicim: 'atlar',
      secilen: 'ler',
      aday: 'atler',
      sonuc: 'yanlis',
      neden: 'PL:kalınlık',
      deneme_no: 1,
      sure_ms: 5230,
      ses_modu: 'sesli',
    })
  })

  it('doğru seçimde neden boş; süre tam milisaniye, eksi olmaz', () => {
    const satir = satirKur(
      { ...SECIM, secilen: 'lar', aday: 'atlar', dogru: true, neden: 'PL:kalınlık', sureMs: -3 },
      'P01',
      'pilot-1',
      { sesModu: 'dokununca', simdi: AN },
    )
    expect(satir.sonuc).toBe('dogru')
    expect(satir.neden).toBe('')
    expect(satir.sure_ms).toBe(0)
    expect(satir.ses_modu).toBe('dokununca')
  })

  it('zaman yerel saatle ISO 8601, saat farkıyla', () => {
    const zaman = yerelZaman(AN)
    expect(zaman).toMatch(/^2026-10-01T10:15:03\.250[+-]\d{2}:\d{2}$/)
    // Saat farkı çıkarılınca aynı an.
    expect(Date.parse(zaman)).toBe(AN.getTime())
  })
})

describe('günlüğün yazılması', () => {
  it('kod yokken hiçbir deneme yazılmaz', () => {
    const d = bellekDeposu()
    const yazici = gunlukYazici(d.depo, 'pilot-1')
    expect(yazici.yaz(SECIM, baglam())).toBe('kod-yok')
    expect(d.kayitlar.has(GUNLUK_ANAHTARI)).toBe(false)
    expect(d.yazmaDenemesi).toBe(0)
  })

  it('kod girilince açılır, kod silinince kapanır; satırlar kalır', () => {
    const d = bellekDeposu()
    const yazici = gunlukYazici(d.depo, 'pilot-1')
    expect(koduYaz(d.depo, 'P01')).toBe(true)
    expect(yazici.yaz(SECIM, baglam())).toBe('yazildi')
    expect(gunlukAcikMi(d.depo)).toBe(true)
    expect(koduSil(d.depo)).toBe(true)
    expect(gunlukAcikMi(d.depo)).toBe(false)
    expect(gunlukAcikMi(null)).toBe(false)
    expect(yazici.yaz(SECIM, baglam())).toBe('kod-yok')
    const gunluk = gunluguOku(d.depo)
    expect(gunluk.cocuk).toBeNull()
    expect(gunluk.satirlar).toHaveLength(1)
    expect(gunluk.satirlar[0]?.cocuk).toBe('P01')
  })

  it('sınıf modunda hiçbir deneme yazılmaz (kod olsa da)', () => {
    const d = bellekDeposu()
    koduYaz(d.depo, 'P01')
    const once = d.kayitlar.get(GUNLUK_ANAHTARI)
    const yazici = gunlukYazici(d.depo, 'pilot-1')
    expect(yazici.yaz(SECIM, baglam({ sinif: true }))).toBe('sinif')
    expect(d.kayitlar.get(GUNLUK_ANAHTARI)).toBe(once)
    expect(gunluguOku(d.depo).satirlar).toEqual([])
  })

  it('satırlar sırayla eklenir; kod, sürüm, an ve ses modu yazılırken girer', () => {
    const d = bellekDeposu()
    koduYaz(d.depo, 'P01')
    const yazici = gunlukYazici(d.depo, 'pilot-1')
    yazici.yaz(SECIM, baglam())
    yazici.yaz(
      { ...SECIM, secilen: 'lar', aday: 'atlar', dogru: true, denemeNo: 2, sureMs: 9000 },
      baglam({ sesModu: 'kapali' }),
    )
    const { satirlar } = gunluguOku(d.depo)
    expect(satirlar.map((s) => [s.cocuk, s.surum, s.secilen, s.sonuc, s.deneme_no, s.ses_modu])).toEqual([
      ['P01', 'pilot-1', 'ler', 'yanlis', 1, 'sesli'],
      ['P01', 'pilot-1', 'lar', 'dogru', 2, 'kapali'],
    ])
  })

  it('her seçimde son kayıt okunur: kodu başka pencere değiştirdiyse yeni kodla yazılır', () => {
    const d = bellekDeposu()
    koduYaz(d.depo, 'P01')
    const yazici = gunlukYazici(d.depo, 'pilot-1')
    yazici.yaz(SECIM, baglam())
    // pilot.html (başka sekme) yeni çocuğun kodunu yazar.
    yeniCocuk(d.depo, 'P02')
    yazici.yaz(SECIM, baglam())
    expect(gunluguOku(d.depo).satirlar.map((s) => s.cocuk)).toEqual(['P01', 'P02'])
  })

  it('kayıttaki bilinmeyen alanlar ve okunamayan satırlar yazarken atılmaz', () => {
    const d = bellekDeposu()
    d.kayitlar.set(
      GUNLUK_ANAHTARI,
      JSON.stringify({ cocuk: 'P01', satirlar: [{ eski: 'satır' }], gelecek: 1 }),
    )
    gunlukYazici(d.depo, 'pilot-1').yaz(SECIM, baglam())
    const ham = JSON.parse(d.kayitlar.get(GUNLUK_ANAHTARI) ?? '{}') as Record<string, unknown>
    expect(ham.gelecek).toBe(1)
    expect((ham.satirlar as unknown[])[0]).toEqual({ eski: 'satır' })
    const gunluk = gunluguOku(d.depo)
    expect(gunluk.satirlar).toHaveLength(1)
    expect(gunluk.okunamayan).toBe(1)
  })

  it('okunamayan kaydın üstüne yazılmaz', () => {
    const d = bellekDeposu()
    d.kayitlar.set(GUNLUK_ANAHTARI, '{bozuk')
    expect(gunlukYazici(d.depo, 'pilot-1').yaz(SECIM, baglam())).toBe('bozuk')
    expect(d.kayitlar.get(GUNLUK_ANAHTARI)).toBe('{bozuk')
    expect(gunluguOku(d.depo).durum).toBe('bozuk')
    expect(koduYaz(d.depo, 'P01')).toBe(false)
    expect(d.kayitlar.get(GUNLUK_ANAHTARI)).toBe('{bozuk')
  })

  it('depo erişilemezse hata atmaz; günlük kapalı sayılır', () => {
    const yazici = gunlukYazici(HATALI_DEPO, 'pilot-1')
    expect(yazici.yaz(SECIM, baglam())).toBe('kod-yok')
    expect(gunlukYazici(null, 'pilot-1').yaz(SECIM, baglam())).toBe('kod-yok')
    expect(gunluguOku(HATALI_DEPO).durum).toBe('erisilemiyor')
    expect(koduYaz(HATALI_DEPO, 'P01')).toBe(false)
    expect(gunluguSil(HATALI_DEPO)).toBe(false)
    expect(depoDoluMu(HATALI_DEPO)).toBe(true)
  })
})

describe('depo dolunca', () => {
  it('günlük durur, satırlar silinmez, durma işareti yazılır; oyunun kaydı sürer', () => {
    let dolu = false
    const d = bellekDeposu((anahtar) => dolu && anahtar === GUNLUK_ANAHTARI)
    koduYaz(d.depo, 'P01')
    const yazici = gunlukYazici(d.depo, 'pilot-1')
    expect(yazici.yaz(SECIM, baglam())).toBe('yazildi')

    dolu = true
    expect(yazici.yaz(SECIM, baglam())).toBe('durdu')
    expect(d.kayitlar.get(DURMA_ANAHTARI)).toBe(AN.toISOString())
    // Durunca bir daha denenmez: sonraki satırlar sessizce eksilip araya boşluk girmesin.
    const denemeler = d.yazmaDenemesi
    dolu = false
    expect(yazici.yaz(SECIM, baglam())).toBe('durdu')
    expect(d.yazmaDenemesi).toBe(denemeler)
    // Önceki satır yerinde.
    const gunluk = gunluguOku(d.depo)
    expect(gunluk.satirlar).toHaveLength(1)
    expect(gunluk.durdu).toBe(AN.toISOString())

    // Oyunun kaydı (ayrı anahtar) yazılmaya devam eder.
    const oyun = oyunKaydi(d.depo)
    expect(oyun.degistir((i) => gorevBitti(i, KOY, KOY.gorevler[0]!, AN))).toBe(true)
    expect(ilerlemeyiYukle(d.depo).bolgeler.koy?.bitenler).toEqual([1])
  })

  it('durma işareti sonraki açılışta da durdurur; Günlüğü sil işareti kaldırır, yazma sürer', () => {
    let dolu = true
    const d = bellekDeposu((anahtar) => dolu && anahtar === GUNLUK_ANAHTARI)
    d.kayitlar.set(GUNLUK_ANAHTARI, JSON.stringify({ cocuk: 'P01', satirlar: [] }))
    expect(gunlukYazici(d.depo, 'pilot-1').yaz(SECIM, baglam())).toBe('durdu')
    dolu = false
    // Sayfa yeniden açıldı: işaret durdukça yazılmaz.
    expect(gunlukYazici(d.depo, 'pilot-1').yaz(SECIM, baglam())).toBe('durdu')
    expect(gunluguSil(d.depo)).toBe(true)
    expect(d.kayitlar.has(DURMA_ANAHTARI)).toBe(false)
    expect(gunlukYazici(d.depo, 'pilot-1').yaz(SECIM, baglam())).toBe('yazildi')
    expect(gunluguOku(d.depo).cocuk).toBe('P01')
  })

  it('bütün depo doluysa da hata atmaz; oyun bellekte sürer', () => {
    let dolu = false
    const d = bellekDeposu(() => dolu)
    koduYaz(d.depo, 'P01')
    const oyun = oyunKaydi(d.depo)
    const yazici = gunlukYazici(d.depo, 'pilot-1')
    dolu = true
    expect(() => yazici.yaz(SECIM, baglam())).not.toThrow()
    expect(yazici.yaz(SECIM, baglam())).toBe('durdu')
    // İşaret de yazılamadı: pilot.html depoyu kendisi sınar.
    expect(d.kayitlar.has(DURMA_ANAHTARI)).toBe(false)
    expect(depoDoluMu(d.depo)).toBe(true)
    // Oyun: kayıt yazılamaz, ilerleme bellekte sürer.
    expect(oyun.degistir((i) => gorevBitti(i, KOY, KOY.gorevler[0]!, AN))).toBe(false)
    expect(oyun.ilerleme.bolgeler.koy?.bitenler).toEqual([1])
  })

  it('depoDoluMu sınama yazısını siler', () => {
    const d = bellekDeposu()
    expect(depoDoluMu(d.depo)).toBe(false)
    expect([...d.kayitlar.keys()]).toEqual([])
    expect(depoDoluMu(null)).toBe(false)
  })
})

describe('Yeni çocuk', () => {
  it('kodu yazar; oyunun ilerlemesini, kartlarını ve kalınan yerini sıfırlar; ayarlar ve günlük kalır', () => {
    const d = bellekDeposu()
    // Önceki çocuk: Koy'da üç görev, Sesli mod, Renksiz, kapatılmış ipucu ve günlükte satırlar.
    const kayit1 = pencereKaydi(d.depo)
    kayit1.degistir((i) =>
      ipucunuKapat(
        ayarlariDegistir(
          // Üç görev, turun puanı, ilk dakika eli kapalı.
          eliKapat(
            ekrandaPuanYaz(
              KOY.gorevler.slice(0, 3).reduce((x, g) => gorevBitti(x, KOY, g, AN), i),
              KOY,
              KOY.gorevler[2]!,
              { puan: 35, ilk: 3, yer: 3, seri: 0 },
              0,
            ),
            'koy',
          ),
          { ses: 'sesli', renkler: 'renksiz' },
        ),
        'ana-ekran',
      ),
    )
    koduYaz(d.depo, 'P01')
    gunlukYazici(d.depo, 'pilot-1').yaz(SECIM, baglam())
    const once = ilerlemeyiYukle(d.depo)
    expect(once.kartlar).toHaveLength(3)
    expect(once.bolgeler.koy?.tur?.puan).toBe(35)
    expect(once.eller).toEqual(['koy'])

    expect(yeniCocuk(d.depo, 'P02')).toEqual({ kod: true, ilerleme: true })
    const sonra = ilerlemeyiYukle(d.depo)
    // Puan ve yıldızlar (bölgelerin ilerlemesinde) ve ilk dakika elleri de sıfırlanır.
    expect(sonra.bolgeler).toEqual({})
    expect(sonra.eller).toEqual([])
    expect(sonra.kartlar).toEqual([])
    expect(sonra.sifirlama).toBe(once.sifirlama + 1)
    expect(sonra.ayarlar).toEqual(once.ayarlar)
    expect(sonra.kapananIpuclari).toEqual(['ana-ekran'])
    const gunluk = gunluguOku(d.depo)
    expect(gunluk.cocuk).toBe('P02')
    expect(gunluk.satirlar.map((s) => s.cocuk)).toEqual(['P01'])
  })

  it('geçersiz kodda hiçbir şeye dokunulmaz', () => {
    const d = bellekDeposu()
    pencereKaydi(d.depo).degistir((i) => gorevBitti(i, KOY, KOY.gorevler[0]!, AN))
    const oyunun = d.kayitlar.get(ANAHTAR)
    expect(yeniCocuk(d.depo, 'Ali')).toEqual({ kod: false, ilerleme: false })
    expect(d.kayitlar.get(ANAHTAR)).toBe(oyunun)
    expect(d.kayitlar.has(GUNLUK_ANAHTARI)).toBe(false)
  })

  it('kod yazılamazsa (depo dolu) ilerlemeye dokunulmaz', () => {
    const d = bellekDeposu((anahtar) => anahtar === GUNLUK_ANAHTARI)
    pencereKaydi(d.depo).degistir((i) => gorevBitti(i, KOY, KOY.gorevler[0]!, AN))
    expect(yeniCocuk(d.depo, 'P02')).toEqual({ kod: false, ilerleme: false })
    expect(ilerlemeyiYukle(d.depo).bolgeler.koy?.bitenler).toEqual([1])
  })
})

describe('Günlüğü sil', () => {
  it('satırlar ve durma işareti gider, kod kalır', () => {
    const d = bellekDeposu()
    koduYaz(d.depo, 'P03')
    gunlukYazici(d.depo, 'pilot-1').yaz(SECIM, baglam())
    d.kayitlar.set(DURMA_ANAHTARI, AN.toISOString())
    expect(gunluguSil(d.depo)).toBe(true)
    expect(kayit(d)).toEqual({ cocuk: 'P03', satirlar: [] })
    expect(d.kayitlar.has(DURMA_ANAHTARI)).toBe(false)
  })

  it('okunamayan kayıt da silinir; günlük hiç yoksa silinecek bir şey yok', () => {
    const d = bellekDeposu()
    expect(gunluguSil(d.depo)).toBe(true)
    d.kayitlar.set(GUNLUK_ANAHTARI, 'bozuk')
    expect(gunluguSil(d.depo)).toBe(true)
    expect(d.kayitlar.has(GUNLUK_ANAHTARI)).toBe(false)
  })
})

/** Özet için satır: varsayılanlar Koy'un 1. görevinin doğru seçimi. */
const satir = (degisen: Partial<DenemeSatiri>): DenemeSatiri => ({
  zaman: yerelZaman(AN),
  cocuk: 'P01',
  surum: 'pilot-1',
  bolge: 'koy',
  tur: 1,
  gorev: 1,
  kok: 'at',
  ekler: 'PL',
  dogru_bicim: 'atlar',
  secilen: 'lar',
  aday: 'atlar',
  sonuc: 'dogru',
  neden: '',
  deneme_no: 1,
  sure_ms: 1000,
  ses_modu: 'sesli',
  ...degisen,
})

describe('görevin son seçimi', () => {
  it('zincirde son adımın biçimi; Uydurukçuklar\'ın sınır adımında iki biçim', () => {
    expect(gorevinSonBicimi('koy', 'top', ['PL', 'POSS.1SG'])).toBe('toplarım')
    expect(gorevinSonBicimi('dukkan', 'kitap', ['POSS.1SG'])).toBe('kitabım')
    expect(gorevinSonBicimi('bahce', 'göz', ['LIK', 'AGT', 'PL'])).toBe('gözlükçüler')
    expect(gorevinSonBicimi('uyduruk', 'fıngıl', ['PL'])).toBe('fıngıllar')
    expect(gorevinSonBicimi('uyduruk', 'gıvak', ['POSS.1SG'])).toBe('gıvakım/gıvağım')
  })

  it('görevi yalnız son adımın doğru seçimi bitirir', () => {
    const top = { kok: 'top', ekler: 'PL+POSS.1SG', gorev: 10 }
    expect(gorevBitirdiMi(satir({ ...top, dogru_bicim: 'toplar', aday: 'toplar' }))).toBe(false)
    expect(gorevBitirdiMi(satir({ ...top, dogru_bicim: 'toplarım', aday: 'toplarım' }))).toBe(true)
    expect(
      gorevBitirdiMi(
        satir({ ...top, dogru_bicim: 'toplarım', aday: 'toplerim', sonuc: 'yanlis' }),
      ),
    ).toBe(false)
    // Sınır adımı olan görevde bukalemunun doğrusu görevi bitirmez, karo bitirir.
    const givak = { bolge: 'uyduruk', kok: 'gıvak', ekler: 'POSS.1SG', gorev: 4 }
    expect(gorevBitirdiMi(satir({ ...givak, dogru_bicim: 'gıvakım', aday: 'gıvakım' }))).toBe(false)
    expect(
      gorevBitirdiMi(satir({ ...givak, dogru_bicim: 'gıvakım/gıvağım', secilen: 'ğ', aday: 'gıvağım' })),
    ).toBe(true)
    // Motorun kuramadığı satır sayılmaz.
    expect(gorevBitirdiMi(satir({ kok: 'X', ekler: 'YOK' }))).toBe(false)
  })

  it('iki biçim de doğruysa seçim puanlanmaz', () => {
    expect(puanlanirMi(satir({}))).toBe(true)
    expect(puanlanirMi(satir({ dogru_bicim: 'gıvakım/gıvağım' }))).toBe(false)
  })
})

describe('çocuk başına özet', () => {
  // P01: Koy'un 1. görevinde önce yanlış (ler), sonra doğru; 10. görevin iki adımı;
  // Uydurukçuklar'da fıngıl'da yanlış (ler) ve gıvak'ın sınır adımı (puanlanmaz);
  // Dükkân'da taş (GÖVDE:yumuşama), Bahçe'de meyve; Koy'un 1. görevi yeniden (bir kez sayılır).
  const SATIRLAR: DenemeSatiri[] = [
    satir({ secilen: 'ler', aday: 'atler', sonuc: 'yanlis', neden: 'PL:kalınlık' }),
    satir({ deneme_no: 2 }),
    satir({ gorev: 10, kok: 'top', ekler: 'PL+POSS.1SG', dogru_bicim: 'toplar', aday: 'toplar' }),
    satir({ gorev: 10, kok: 'top', ekler: 'PL+POSS.1SG', dogru_bicim: 'toplarım', aday: 'toplarım', secilen: 'ım' }),
    satir({ bolge: 'dukkan', kok: 'kitap', ekler: 'POSS.1SG', dogru_bicim: 'kitabım', secilen: 'p', aday: 'kitapım', sonuc: 'yanlis', neden: 'GÖVDE:yumuşama' }),
    satir({ bolge: 'dukkan', kok: 'kitap', ekler: 'POSS.1SG', dogru_bicim: 'kitabım', secilen: 'b', aday: 'kitabım', deneme_no: 2 }),
    satir({ bolge: 'bahce', kok: 'çiçek', ekler: 'AGT+PL', dogru_bicim: 'çiçekçi', secilen: 'ler', aday: 'çiçekler', sonuc: 'yanlis', neden: 'meyve:AGT' }),
    satir({ bolge: 'bahce', kok: 'çiçek', ekler: 'AGT+PL', dogru_bicim: 'çiçekçi', secilen: 'çi', aday: 'çiçekçi', deneme_no: 2 }),
    satir({ bolge: 'bahce', kok: 'çiçek', ekler: 'AGT+PL', dogru_bicim: 'çiçekçiler', secilen: 'ler', aday: 'çiçekçiler' }),
    satir({ bolge: 'uyduruk', kok: 'fıngıl', dogru_bicim: 'fıngıllar', secilen: 'ler', aday: 'fıngıller', sonuc: 'yanlis', neden: 'PL:kalınlık' }),
    satir({ bolge: 'uyduruk', kok: 'fıngıl', dogru_bicim: 'fıngıllar', aday: 'fıngıllar', deneme_no: 2 }),
    satir({ bolge: 'uyduruk', gorev: 4, kok: 'gıvak', ekler: 'POSS.1SG', dogru_bicim: 'gıvakım', secilen: 'ım', aday: 'gıvakım' }),
    satir({ bolge: 'uyduruk', gorev: 4, kok: 'gıvak', ekler: 'POSS.1SG', dogru_bicim: 'gıvakım/gıvağım', secilen: 'ğ', aday: 'gıvağım' }),
    satir({ zaman: yerelZaman(new Date(AN.getTime() + 60_000)) }),
    // Başka bir çocuk.
    satir({ cocuk: 'P02', secilen: 'ler', aday: 'atler', sonuc: 'yanlis', neden: 'PL:kalınlık' }),
  ]

  it('bölge başına biten görev, ilk denemede doğru oranı, en sık üç neden', () => {
    const [p01, p02] = cocukOzetleri(SATIRLAR)
    expect(p01?.cocuk).toBe('P01')
    expect(p01?.bolgeler.map((b) => [b.bolge.kimlik, b.bitenGorev, b.ilkDeneme])).toEqual([
      ['koy', 2, { dogru: 3, toplam: 4 }],
      ['dukkan', 1, { dogru: 0, toplam: 1 }],
      ['bahce', 1, { dogru: 1, toplam: 2 }],
      ['uyduruk', 2, { dogru: 1, toplam: 2 }],
    ])
    expect(p01?.bitenGorev).toBe(6)
    expect(p01?.ilkDeneme).toEqual({ dogru: 5, toplam: 9 })
    expect(p01?.nedenler).toEqual([
      { neden: 'PL:kalınlık', sayi: 2 },
      { neden: 'GÖVDE:yumuşama', sayi: 1 },
      { neden: 'meyve:AGT', sayi: 1 },
    ])
    expect(p01?.secim).toBe(14)
    expect(p02?.cocuk).toBe('P02')
    expect(p02?.bitenGorev).toBe(0)
    expect(p02?.nedenler).toEqual([{ neden: 'PL:kalınlık', sayi: 1 }])
  })

  it('bir seçimin birden çok nedeni ayrı ayrı sayılır', () => {
    const [ozet] = cocukOzetleri([
      satir({ sonuc: 'yanlis', neden: 'LOC:sertleşme;LOC:kalınlık' }),
      satir({ sonuc: 'yanlis', neden: 'LOC:kalınlık', deneme_no: 2 }),
    ])
    expect(ozet?.nedenler).toEqual([
      { neden: 'LOC:kalınlık', sayi: 2 },
      { neden: 'LOC:sertleşme', sayi: 1 },
    ])
  })

  it('oranın yazısı', () => {
    expect(oranYazisi({ dogru: 48, toplam: 52 })).toBe('48 / 52 (%92)')
    expect(oranYazisi({ dogru: 0, toplam: 0 })).toBe('–')
  })
})

describe('CSV ve kopya', () => {
  const SATIRLAR = [
    satir({ secilen: 'ler', aday: 'atler', sonuc: 'yanlis', neden: 'PL:kalınlık' }),
    satir({ bolge: 'uyduruk', kok: 'mömüş', ekler: 'LOC', dogru_bicim: 'mömüşte', secilen: 'da', aday: 'mömüşda', sonuc: 'yanlis', neden: 'LOC:sertleşme;LOC:kalınlık' }),
    satir({ bolge: 'bahce', kok: 'çiçek', ekler: 'AGT+PL', dogru_bicim: 'çiçekçi', secilen: 'çi', aday: 'çiçekçi' }),
  ]

  it('UTF-8 imiyle başlar; ilk satır sütunlar; ayraç noktalı virgül, satır sonu CRLF', () => {
    const metin = csvMetni(SATIRLAR)
    expect(metin.startsWith(UTF8_IMI)).toBe(true)
    expect(CSV_AYRACI).toBe(';')
    const satirlar = metin.slice(1).split('\r\n')
    expect(satirlar.at(-1)).toBe('')
    expect(satirlar).toHaveLength(SATIRLAR.length + 2)
    expect(satirlar[0]).toBe(SUTUNLAR.join(';'))
    expect(satirlar[1]).toBe(
      `${yerelZaman(AN)};P01;pilot-1;koy;1;1;at;PL;atlar;ler;atler;yanlis;PL:kalınlık;1;1000;sesli`,
    )
    // Ayraç içeren alan tırnak içinde: iki neden.
    expect(satirlar[2]).toContain(';"LOC:sertleşme;LOC:kalınlık";')
    expect(metin).not.toMatch(/[^\r]\n/)
  })

  it('Türkçe harfler UTF-8 baytlarıyla yazılır (Excel imden UTF-8 okur)', () => {
    const baytlar = new TextEncoder().encode(csvMetni(SATIRLAR))
    expect([...baytlar.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    const metin = new TextDecoder('utf-8').decode(baytlar)
    for (const kelime of ['kalınlık', 'mömüşte', 'çiçekçi', 'sertleşme']) {
      expect(metin).toContain(kelime)
    }
    // ı (U+0131): C4 B1.
    const i = [...baytlar].findIndex((b, j) => b === 0xc4 && baytlar[j + 1] === 0xb1)
    expect(i).toBeGreaterThan(0)
  })

  it('tırnak içeren alan ikilenir', () => {
    const metin = csvMetni([satir({ neden: 'a"b', sonuc: 'yanlis' })])
    expect(metin).toContain(';"a""b";')
  })

  it('kopya sekmeyle ayrılır (tabloya yapıştırılınca her alan bir hücre)', () => {
    const satirlar = kopyaMetni(SATIRLAR).split('\n')
    expect(satirlar[0]).toBe(SUTUNLAR.join('\t'))
    expect(satirlar[2]?.split('\t')).toHaveLength(SUTUNLAR.length)
    expect(satirlar[2]).toContain('\tLOC:sertleşme;LOC:kalınlık\t')
    expect(kopyaMetni(SATIRLAR).startsWith(UTF8_IMI)).toBe(false)
  })

  it('dosya adı yerel günle', () => {
    expect(csvDosyaAdi(AN)).toBe('ekle-bakalim-pilot-2026-10-01.csv')
  })
})

describe('deneme sayacı', () => {
  it('adımdaki deneme sayısı ve görevin başından geçen süre; görev değişince sıfırlanır', () => {
    const sayac = denemeSayaci()
    sayac.gorevBasladi('1', 1000)
    expect(sayac.deneme('1', '0', 3500)).toEqual({ denemeNo: 1, sureMs: 2500 })
    expect(sayac.deneme('1', '0', 4000.6)).toEqual({ denemeNo: 2, sureMs: 3001 })
    // Zincirin ikinci adımı: deneme yeniden 1'den, süre görevin başından.
    expect(sayac.deneme('1', '1', 6000)).toEqual({ denemeNo: 1, sureMs: 5000 })
    // Aynı görevin başı ikinci kez (StrictMode) sıfırlamaz.
    sayac.gorevBasladi('1', 6500)
    expect(sayac.deneme('1', '1', 7000)).toEqual({ denemeNo: 2, sureMs: 6000 })
    sayac.gorevBasladi('2', 8000)
    expect(sayac.deneme('2', '0', 8250)).toEqual({ denemeNo: 1, sureMs: 250 })
  })
})
