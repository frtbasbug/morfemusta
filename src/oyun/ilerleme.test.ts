import { describe, expect, it } from 'vitest'
import { bolgeBul, type Bolge } from './bolgeler.ts'
import type { Gorev } from './gorevler.ts'
import {
  ANAHTAR,
  BOS_ILERLEME,
  VARSAYILAN_AYARLAR,
  ayarlariDegistir,
  ayniGun,
  bolgeBittiMi,
  bolgeDurumlari,
  bugununKartlari,
  degisenBolgeler,
  ekrandaGorevBitti,
  gorevBitti,
  ilerlemeyiCoz,
  ilerlemeyiKaydet,
  ilerlemeyiSifirla,
  ilerlemeyiYukle,
  ipucunuKapat,
  kaldigiGorev,
  oyunKaydi,
  pencereKaydi,
  sozlukGruplari,
  type Depo,
  type Ilerleme,
} from './ilerleme.ts'

const KOY = bolgeBul('koy') as Bolge

/** Bellekte bir depo: localStorage'ın kullanılan parçası. */
function bellekDeposu(ilk?: string) {
  const kayitlar = new Map<string, string>()
  if (ilk !== undefined) kayitlar.set(ANAHTAR, ilk)
  const depo: Depo = {
    getItem: (anahtar) => kayitlar.get(anahtar) ?? null,
    setItem: (anahtar, deger) => {
      kayitlar.set(anahtar, deger)
    },
  }
  return { depo, kayitlar }
}

/** Her işlemde hata atan depo: erişimi engellenmiş ya da dolu localStorage gibi. */
const HATALI_DEPO: Depo = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

// Yerel saatle kurulur: "bugün" yerel güne göredir.
const DUN = new Date(2026, 8, 27, 18, 30)
const BUGUN = new Date(2026, 8, 28, 10, 0)
const dakikaSonra = (an: Date, dakika: number) => new Date(an.getTime() + dakika * 60_000)

/** Bölgenin ilk n görevi sırayla biter; her görev bir dakika sonra. */
function oyna(ilerleme: Ilerleme, bolge: Bolge, n: number, baslangic = BUGUN): Ilerleme {
  return bolge.gorevler
    .slice(0, n)
    .reduce((i, gorev, yer) => gorevBitti(i, bolge, gorev, dakikaSonra(baslangic, yer)), ilerleme)
}

const gorev = (sira: number, kok: string, etiketler: string[]): Gorev => ({
  sira,
  tur: 1,
  turdakiSira: sira,
  kok,
  etiketler,
  renksiz: false,
})

// Sınama için küçük bir ada: içerikli iki bölge ve içeriksiz bir bölge.
const ADA: Bolge = {
  sira: 1,
  kimlik: 'ada',
  ad: 'Ada',
  aksam: 'Adada akşam oldu',
  gorevler: [gorev(1, 'ev', ['PL']), gorev(2, 'at', ['PL'])],
}
const TEPE: Bolge = {
  sira: 2,
  kimlik: 'tepe',
  ad: 'Tepe',
  aksam: 'Tepede akşam oldu',
  gorevler: [gorev(1, 'ev', ['PL'])],
}
const OVA: Bolge = { sira: 3, kimlik: 'ova', ad: 'Ova', aksam: 'Ovada akşam oldu', gorevler: [] }
const KUCUK_ADA = [ADA, TEPE, OVA]

describe('kaydet ve yükle', () => {
  it('kaydedilen ilerleme aynen yüklenir: bölgeler, kartlar, ayarlar', () => {
    const { depo } = bellekDeposu()
    const ilerleme = ayarlariDegistir(oyna(BOS_ILERLEME, KOY, 3), { renkler: 'renksiz' })
    expect(ilerlemeyiKaydet(depo, ilerleme)).toBe(true)
    expect(ilerlemeyiYukle(depo)).toEqual(ilerleme)
  })

  it('tek anahtar: morfemusta.v1; biçimi sürüm 1', () => {
    const { depo, kayitlar } = bellekDeposu()
    ilerlemeyiKaydet(depo, oyna(BOS_ILERLEME, KOY, 1))
    expect([...kayitlar.keys()]).toEqual(['morfemusta.v1'])
    expect(JSON.parse(kayitlar.get(ANAHTAR) ?? '')).toEqual({
      bolgeler: { koy: { bitenler: [1], kaldigi: 1 } },
      kartlar: [
        {
          kelime: 'atlar',
          kok: 'at',
          etiketler: ['PL'],
          bolge: 'koy',
          tarih: BUGUN.toISOString(),
          sonKurulma: BUGUN.toISOString(),
        },
      ],
      ayarlar: { hareket: 'sistem', renkler: 'renkli', ses: 'dokununca', sinif: 'kapali' },
      kapananIpuclari: [],
      sifirlama: 0,
    })
  })

  it('kayıt yoksa baştan: hiçbir bölge oynanmamış, kart yok, ayarlar varsayılan', () => {
    expect(ilerlemeyiYukle(bellekDeposu().depo)).toEqual({
      bolgeler: {},
      kartlar: [],
      ayarlar: { hareket: 'sistem', renkler: 'renkli', ses: 'dokununca', sinif: 'kapali' },
      kapananIpuclari: [],
      sifirlama: 0,
    })
  })
})

describe('depo yok', () => {
  it('depo verilmezse oyun bellekte sürer: yükleme boş, kayıt false', () => {
    expect(ilerlemeyiYukle(null)).toEqual(BOS_ILERLEME)
    expect(ilerlemeyiKaydet(null, oyna(BOS_ILERLEME, KOY, 1))).toBe(false)
  })

  it('depo hata atarsa hata dışarı çıkmaz', () => {
    expect(() => ilerlemeyiYukle(HATALI_DEPO)).not.toThrow()
    expect(ilerlemeyiYukle(HATALI_DEPO)).toEqual(BOS_ILERLEME)
    expect(() => ilerlemeyiKaydet(HATALI_DEPO, BOS_ILERLEME)).not.toThrow()
    expect(ilerlemeyiKaydet(HATALI_DEPO, BOS_ILERLEME)).toBe(false)
  })

  it('bellekteki ilerleme depo olmadan da ilerler', () => {
    const ilerleme = oyna(BOS_ILERLEME, KOY, 2)
    ilerlemeyiKaydet(HATALI_DEPO, ilerleme)
    expect(kaldigiGorev(ilerleme, KOY)).toBe(2)
    expect(ilerleme.kartlar.map((k) => k.kelime)).toEqual(['atlar', 'evler'])
  })
})

describe('iki pencere (sekme, ana ekrandaki uygulama) aynı depoyu paylaşır', () => {
  const gorevi = (sira: number) => KOY.gorevler[sira - 1] as Gorev

  /** A ve B aynı sahte depoyu açar; B tazelemez, eski anlık görüntüde kalır. */
  function ikiPencere() {
    const { depo } = bellekDeposu()
    const b = pencereKaydi(depo)
    const a = pencereKaydi(depo)
    return { depo, a, b }
  }

  it('A iki görev bitirir, eski anlık görüntüdeki B bir görev bitirir: üç görev ve kartları kalır', () => {
    const { depo, a, b } = ikiPencere()
    a.degistir((i) => oyna(i, KOY, 2))
    expect(b.ilerleme).toEqual(BOS_ILERLEME)

    // B yazmadan önce son kaydı okur; değişiklik onun üstüne uygulanır.
    expect(b.degistir((i) => gorevBitti(i, KOY, gorevi(3), dakikaSonra(BUGUN, 5)))).toBe(true)
    const son = ilerlemeyiYukle(depo)
    expect(son.bolgeler).toEqual({ koy: { bitenler: [1, 2, 3], kaldigi: 3 } })
    expect(son.kartlar.map((k) => k.kelime)).toEqual(['atlar', 'evler', 'kuşlar'])
    expect(b.ilerleme).toEqual(son)
  })

  it('A ayarı değiştirir, eski anlık görüntüdeki B görev bitirir: ayar korunur', () => {
    const { depo, a, b } = ikiPencere()
    a.degistir((i) => ayarlariDegistir(i, { renkler: 'renksiz' }))
    b.degistir((i) => gorevBitti(i, KOY, gorevi(1), BUGUN))
    const son = ilerlemeyiYukle(depo)
    expect(son.ayarlar).toEqual({ ...VARSAYILAN_AYARLAR, renkler: 'renksiz' })
    expect(son.bolgeler).toEqual({ koy: { bitenler: [1], kaldigi: 1 } })
  })

  it('ayarda yalnız değişen alan yazılır: A renkleri, eski B hareketi değiştirir; ikisi de kalır', () => {
    const { depo, a, b } = ikiPencere()
    a.degistir((i) => ayarlariDegistir(i, { renkler: 'renksiz' }))
    b.degistir((i) => ayarlariDegistir(i, { hareket: 'azalt' }))
    expect(ilerlemeyiYukle(depo).ayarlar).toEqual({
      ...VARSAYILAN_AYARLAR,
      hareket: 'azalt',
      renkler: 'renksiz',
    })
  })

  it("sıfırlama yine her şeyi siler: eski B sıfırlarsa A'nın görevleri ve kartları da gider", () => {
    const { depo, a, b } = ikiPencere()
    a.degistir((i) => ayarlariDegistir(oyna(i, KOY, 2), { renkler: 'renksiz' }))
    b.degistir(ilerlemeyiSifirla)
    // Ayarlar kalır (sıfırlama ayarları silmez); A'nın Renksiz'i de geri alınmaz.
    expect(ilerlemeyiYukle(depo)).toEqual({
      ...BOS_ILERLEME,
      ayarlar: { ...VARSAYILAN_AYARLAR, renkler: 'renksiz' },
      sifirlama: 1,
    })
    expect(a.tazele()).toBe(true)
    expect(a.ilerleme).toEqual(b.ilerleme)
  })

  it('sıfırlama geri alınmaz: A 5. görevdeyken B sıfırlar; A 5. görevi bitirince kayıt boş kalır, A baştan başlar', () => {
    const { depo, a, b } = ikiPencere()
    a.degistir((i) => oyna(i, KOY, 4))
    // A'nın bölge ekranı 5. görevde açık; açılırken kaydın sıfırlama kimliğini aldı.
    expect(kaldigiGorev(a.ilerleme, KOY)).toBe(4)
    const acilis = a.ilerleme.sifirlama

    b.degistir(ilerlemeyiSifirla)
    const bos = ilerlemeyiYukle(depo)
    expect(bos).toEqual({ ...BOS_ILERLEME, sifirlama: acilis + 1 })

    // A, sıfırlamayı görmeden 5. görevi bitirir. Yazmadan önce kimliği karşılaştırır: farklı,
    // hiçbir şey yazılmaz.
    expect(a.degistir((i) => ekrandaGorevBitti(i, KOY, gorevi(5), BUGUN, acilis))).toBe(false)
    expect(ilerlemeyiYukle(depo)).toEqual(bos)
    // A son kaydı aldı: kimliği değişti (ekran yeniden açılır), baştan başlar.
    expect(a.ilerleme).toEqual(bos)
    expect(a.ilerleme.sifirlama).not.toBe(acilis)
    expect(kaldigiGorev(a.ilerleme, KOY)).toBe(0)
  })

  it('kimlik aynıysa ekranda biten görev kaydedilir', () => {
    const { depo, a } = ikiPencere()
    const acilis = a.ilerleme.sifirlama
    expect(a.degistir((i) => ekrandaGorevBitti(i, KOY, gorevi(1), BUGUN, acilis))).toBe(true)
    expect(ilerlemeyiYukle(depo)).toEqual(gorevBitti(BOS_ILERLEME, KOY, gorevi(1), BUGUN))
  })

  it('aynı kelimeyi iki pencere kurarsa tek kart kalır', () => {
    const { depo } = bellekDeposu()
    const a = pencereKaydi(depo)
    const b = pencereKaydi(depo)
    a.degistir((i) => gorevBitti(i, KOY, gorevi(1), BUGUN))
    b.degistir((i) => gorevBitti(i, KOY, gorevi(1), dakikaSonra(BUGUN, 3)))
    expect(ilerlemeyiYukle(depo).kartlar).toEqual([
      expect.objectContaining({
        kelime: 'atlar',
        tarih: BUGUN.toISOString(),
        sonKurulma: dakikaSonra(BUGUN, 3).toISOString(),
      }),
    ])
  })

  it('tazele: kaydı başka bir pencere değiştirdiyse alır; kendi yazdığında bir şey değişmez', () => {
    const { depo } = bellekDeposu()
    const a = pencereKaydi(depo)
    const b = pencereKaydi(depo)
    expect(a.tazele()).toBe(false)
    b.degistir((i) => oyna(i, KOY, 1))
    expect(b.tazele()).toBe(false)
    expect(a.tazele()).toBe(true)
    expect(a.ilerleme).toEqual(b.ilerleme)
    expect(a.tazele()).toBe(false)
  })

  it('depo dolu: yazılamayan ilerleme bellekte sürer, depodaki eski kayıt onu geri almaz', () => {
    const kayitlar = new Map<string, string>()
    let dolu = false
    const depo: Depo = {
      getItem: (anahtar) => kayitlar.get(anahtar) ?? null,
      setItem: (anahtar, deger) => {
        if (dolu) throw new Error('QuotaExceededError')
        kayitlar.set(anahtar, deger)
      },
    }
    const pencere = pencereKaydi(depo)
    expect(pencere.degistir((i) => gorevBitti(i, KOY, gorevi(1), BUGUN))).toBe(true)
    dolu = true
    expect(pencere.degistir((i) => gorevBitti(i, KOY, gorevi(2), BUGUN))).toBe(false)
    expect(pencere.degistir((i) => gorevBitti(i, KOY, gorevi(3), BUGUN))).toBe(false)
    expect(pencere.ilerleme.bolgeler).toEqual({ koy: { bitenler: [1, 2, 3], kaldigi: 3 } })
    expect(ilerlemeyiYukle(depo).bolgeler).toEqual({ koy: { bitenler: [1], kaldigi: 1 } })
  })

  it('depo yok ya da hata atıyor: pencere bellekte sürer, hata dışarı çıkmaz', () => {
    for (const depo of [null, HATALI_DEPO]) {
      const pencere = pencereKaydi(depo)
      expect(pencere.degistir((i) => oyna(i, KOY, 2))).toBe(false)
      expect(pencere.tazele()).toBe(false)
      expect(kaldigiGorev(pencere.ilerleme, KOY)).toBe(2)
    }
  })

  it('bozuk kayıt baştan başlar; ilk değişiklik onu düzeltir', () => {
    const { depo, kayitlar } = bellekDeposu('{bozuk')
    const pencere = pencereKaydi(depo)
    expect(pencere.ilerleme).toEqual(BOS_ILERLEME)
    expect(pencere.degistir((i) => oyna(i, KOY, 1))).toBe(true)
    expect(JSON.parse(kayitlar.get(ANAHTAR) ?? '')).toMatchObject({
      bolgeler: { koy: { bitenler: [1], kaldigi: 1 } },
    })
  })

  it('değişiklik yoksa yazılmaz', () => {
    const { depo, kayitlar } = bellekDeposu()
    const pencere = pencereKaydi(depo)
    expect(pencere.degistir((i) => i)).toBe(false)
    expect(kayitlar.size).toBe(0)
  })

  describe('değişen bölgeler (açık bölge ekranı kalınan yerden yeniden açılsın diye)', () => {
    const iki = oyna(BOS_ILERLEME, KOY, 2)

    it('başka pencere görev bitirirse ya da sıfırlarsa bölge değişmiştir', () => {
      expect(degisenBolgeler(iki, gorevBitti(iki, KOY, gorevi(3), BUGUN))).toEqual(['koy'])
      expect(degisenBolgeler(iki, ilerlemeyiSifirla(iki))).toEqual(['koy'])
      expect(degisenBolgeler(BOS_ILERLEME, iki)).toEqual(['koy'])
    })

    it('ayar ya da yalnız kart değişirse bölge değişmemiştir: oyun kesilmez', () => {
      expect(degisenBolgeler(iki, ayarlariDegistir(iki, { renkler: 'renksiz' }))).toEqual([])
      const sonra = dakikaSonra(BUGUN, 30).toISOString()
      const kartlar = iki.kartlar.map((k) => ({ ...k, sonKurulma: sonra }))
      expect(degisenBolgeler(iki, { ...iki, kartlar })).toEqual([])
      expect(degisenBolgeler(iki, iki)).toEqual([])
    })
  })
})

describe('bozuk veri', () => {
  const gecerli = oyna(BOS_ILERLEME, KOY, 2)
  const yukle = (ham: unknown) =>
    ilerlemeyiYukle(bellekDeposu(typeof ham === 'string' ? ham : JSON.stringify(ham)).depo)

  it.each([['{bozuk'], [''], ['null'], ['[]'], ['42'], ['"metin"']])(
    '%j okunamaz: baştan başlanır',
    (metin) => {
      expect(ilerlemeyiYukle(bellekDeposu(metin).depo)).toEqual(BOS_ILERLEME)
    },
  )

  it('geçerli parçalar kalır, bozuk kart atılır', () => {
    const [atlar, evler] = gecerli.kartlar
    const ilerleme = yukle({
      ...gecerli,
      kartlar: [
        atlar,
        { ...evler, kelime: 'evlar' }, // motorun kurmadığı biçim
        { ...evler, bolge: 'yok' }, // bilinmeyen bölge
        { ...evler, etiketler: ['PLU'] }, // bilinmeyen ek
        { ...evler, kelime: 'evlerci', etiketler: ['PL', 'AGT'] }, // sırası bozuk: motor hata atar
        { ...evler, etiketler: [] },
        { ...evler, tarih: 'dün' },
        { ...evler, kok: 42 },
        'kart',
        null,
        evler,
        { ...evler, tarih: DUN.toISOString() }, // aynı kelime ikinci kez: ilki kalır
      ],
    })
    expect(ilerleme.kartlar).toEqual([atlar, evler])
    expect(ilerleme.bolgeler).toEqual(gecerli.bolgeler)
  })

  it('bölge ilerlemesi denetlenir: bilinmeyen bölge ve görevde olmayan sıra atılır', () => {
    // JSON'daki "__proto__" anahtarı nesnenin kendi alanıdır; kayda karışmamalı.
    const ilerleme = yukle(
      '{"bolgeler": {' +
        '"koy": {"bitenler": [3, 1, 1, 11, 0, -2, 2.5, "4", null], "kaldigi": 12},' +
        '"yok": {"bitenler": [1], "kaldigi": 1},' +
        '"uyduruk": {"bitenler": [1, 100, 101], "kaldigi": 100},' +
        '"__proto__": {"bitenler": [1], "kaldigi": 1}}}',
    )
    // koy: geçerli sıralar tekilleşir ve sıralanır; kaldigi görev sayısını aşarsa 0.
    // yok: tabloda yok. uyduruk: 100 görevi var (10 tur); sıra ve kaldigi bütün tablodadır.
    expect(ilerleme.bolgeler).toEqual({
      koy: { bitenler: [1, 3], kaldigi: 0 },
      uyduruk: { bitenler: [1, 100], kaldigi: 100 },
    })
    // İçeriği olmayan bölgenin ilerlemesi olamaz.
    expect(
      ilerlemeyiCoz({ bolgeler: { ova: { bitenler: [1], kaldigi: 1 } } }, KUCUK_ADA).bolgeler,
    ).toEqual({})
    expect(Object.getPrototypeOf(ilerleme.bolgeler)).toBe(Object.prototype)
    expect(yukle({ bolgeler: { koy: 'bitti' } }).bolgeler).toEqual({})
    expect(yukle({ bolgeler: { koy: { kaldigi: 4 } } }).bolgeler).toEqual({
      koy: { bitenler: [], kaldigi: 4 },
    })
  })

  it('sıfırlama kimliği sıfır ya da pozitif tam sayıdır; değilse 0', () => {
    expect(yukle({ sifirlama: 3 }).sifirlama).toBe(3)
    for (const sifirlama of [-1, 2.5, '3', null, Number.MAX_SAFE_INTEGER + 2]) {
      expect(yukle({ sifirlama }).sifirlama).toBe(0)
    }
    expect(yukle({}).sifirlama).toBe(0)
  })

  it('tanınmayan ayar varsayılana döner, tanınan kalır', () => {
    expect(
      yukle({ ayarlar: { hareket: 'hızlı', renkler: 'renksiz', ses: 'yüksek', sinif: 'evet' } })
        .ayarlar,
    ).toEqual({ hareket: 'sistem', renkler: 'renksiz', ses: 'dokununca', sinif: 'kapali' })
    expect(yukle({ ayarlar: { ses: 'sesli' } }).ayarlar.ses).toBe('sesli')
    expect(yukle({ ayarlar: { ses: 'kapali' } }).ayarlar.ses).toBe('kapali')
    expect(yukle({ ayarlar: { sinif: 'acik' } }).ayarlar.sinif).toBe('acik')
    expect(yukle({ ayarlar: 'azalt' }).ayarlar).toEqual(VARSAYILAN_AYARLAR)
  })

  it('kapatılan ipuçları: yalnız bilinenler kalır; eksikse hiçbiri', () => {
    expect(yukle({ kapananIpuclari: ['ana-ekran', 'yok', 3] }).kapananIpuclari).toEqual([
      'ana-ekran',
    ])
    expect(yukle({ kapananIpuclari: 'ana-ekran' }).kapananIpuclari).toEqual([])
    expect(yukle({}).kapananIpuclari).toEqual([])
  })

  it('son kurulma ilk tarihten önce olamaz; eksikse ilk tarih', () => {
    const [atlar] = gecerli.kartlar
    const kartlar = (ham: object) => ilerlemeyiCoz({ kartlar: [{ ...atlar, ...ham }] }).kartlar
    expect(kartlar({ sonKurulma: DUN.toISOString() })[0]?.sonKurulma).toBe(atlar?.tarih)
    expect(kartlar({ sonKurulma: undefined })[0]?.sonKurulma).toBe(atlar?.tarih)
  })
})

describe('kilit açma', () => {
  const durumlar = (ilerleme: Ilerleme, bolgeler?: readonly Bolge[]) =>
    bolgeDurumlari(ilerleme, bolgeler).map((b) => [b.bolge.kimlik, b.durum, b.onceki?.kimlik])

  it('ilk açılışta yalnız Bukalemun Koyu açık', () => {
    expect(durumlar(BOS_ILERLEME)).toEqual([
      ['koy', 'acik', undefined],
      ['dukkan', 'kilitli', 'koy'],
      ['bahce', 'kilitli', 'dukkan'],
      ['uyduruk', 'kilitli', 'bahce'],
    ])
  })

  it('koyun bir görevi eksikken dükkân kilitli kalır', () => {
    const dokuz = oyna(BOS_ILERLEME, KOY, 9)
    expect(bolgeBittiMi(dokuz, KOY)).toBe(false)
    expect(durumlar(dokuz).slice(0, 2)).toEqual([
      ['koy', 'acik', undefined],
      ['dukkan', 'kilitli', 'koy'],
    ])
  })

  it('koyun bütün görevleri bitince koy tamam; dükkân açılır', () => {
    const on = oyna(BOS_ILERLEME, KOY, 10)
    expect(bolgeBittiMi(on, KOY)).toBe(true)
    expect(durumlar(on)).toEqual([
      ['koy', 'tamam', undefined],
      ['dukkan', 'acik', 'koy'],
      ['bahce', 'kilitli', 'dukkan'],
      ['uyduruk', 'kilitli', 'bahce'],
    ])
  })

  it('dükkân bitince dükkân tamam; bahçe açılır', () => {
    const dukkan = bolgeBul('dukkan') as Bolge
    const ikisi = oyna(oyna(BOS_ILERLEME, KOY, 10), dukkan, 10)
    expect(durumlar(ikisi)).toEqual([
      ['koy', 'tamam', undefined],
      ['dukkan', 'tamam', 'koy'],
      ['bahce', 'acik', 'dukkan'],
      ['uyduruk', 'kilitli', 'bahce'],
    ])
  })

  it('bahçe bitince bahçe tamam; Uydurukçuklar açılır', () => {
    const dukkan = bolgeBul('dukkan') as Bolge
    const bahce = bolgeBul('bahce') as Bolge
    const ucu = oyna(oyna(oyna(BOS_ILERLEME, KOY, 10), dukkan, 10), bahce, 10)
    expect(durumlar(ucu)).toEqual([
      ['koy', 'tamam', undefined],
      ['dukkan', 'tamam', 'koy'],
      ['bahce', 'tamam', 'dukkan'],
      ['uyduruk', 'acik', 'bahce'],
    ])
  })

  it('Uydurukçuklar ilk tur bitince tamam; tur bitince sonraki giriş sonraki turdan', () => {
    const uyduruk = bolgeBul('uyduruk') as Bolge
    expect(uyduruk.gorevler).toHaveLength(100)
    const dokuz = oyna(BOS_ILERLEME, uyduruk, 9)
    expect(bolgeBittiMi(dokuz, uyduruk)).toBe(false)
    expect(kaldigiGorev(dokuz, uyduruk)).toBe(9)
    const on = oyna(BOS_ILERLEME, uyduruk, 10)
    expect(bolgeBittiMi(on, uyduruk)).toBe(true)
    // Tur kayıtta: kaldigi 10, 2. turun başı (pıbız).
    expect(on.bolgeler.uyduruk?.kaldigi).toBe(10)
    expect(uyduruk.gorevler[kaldigiGorev(on, uyduruk)]?.kok).toBe('pıbız')
    // 10. turdan sonra 1. tura dönülür.
    const hepsi = oyna(BOS_ILERLEME, uyduruk, 100)
    expect(hepsi.bolgeler.uyduruk?.kaldigi).toBe(100)
    expect(kaldigiGorev(hepsi, uyduruk)).toBe(0)
    // Yalnız 2. tur biterse de bölge tamamdır (turlarından biri).
    const ikinci = uyduruk.gorevler
      .slice(10, 20)
      .reduce((i, g) => gorevBitti(i, uyduruk, g, BUGUN), BOS_ILERLEME)
    expect(bolgeBittiMi(ikinci, uyduruk)).toBe(true)
  })

  it('kartın kelimesi uydurma kökte çocuğun seçtiği biçimdir; kayıttan da okunur', () => {
    const uyduruk = bolgeBul('uyduruk') as Bolge
    const givak = uyduruk.gorevler[3] as Gorev
    expect(givak.kok).toBe('gıvak')
    const jole = gorevBitti(BOS_ILERLEME, uyduruk, givak, BUGUN, undefined, 'gıvağım')
    const tas = gorevBitti(jole, uyduruk, givak, BUGUN, undefined, 'gıvakım')
    expect(tas.kartlar.map((k) => k.kelime)).toEqual(['gıvağım', 'gıvakım'])
    expect(ilerlemeyiCoz(JSON.parse(JSON.stringify(tas))).kartlar).toEqual(tas.kartlar)
    // Motorun kabul etmediği kelime verilirse ekle'ninki yazılır; kayıttaki de atılır.
    const yanlis = gorevBitti(BOS_ILERLEME, uyduruk, givak, BUGUN, undefined, 'pıtabım')
    expect(yanlis.kartlar.map((k) => k.kelime)).toEqual(['gıvakım'])
    expect(
      ilerlemeyiCoz({ kartlar: [{ ...tas.kartlar[0], kelime: 'pıtabım' }] }).kartlar,
    ).toEqual([])
  })

  it('görevler hangi sırayla ya da kaç turda biterse bitsin: her biri en az bir kez', () => {
    const ilk = gorevBitti(BOS_ILERLEME, ADA, ADA.gorevler[1] as Gorev, BUGUN)
    expect(durumlar(ilk, KUCUK_ADA)[1]).toEqual(['tepe', 'kilitli', 'ada'])
    const ikinci = gorevBitti(ilk, ADA, ADA.gorevler[0] as Gorev, dakikaSonra(BUGUN, 5))
    expect(durumlar(ikinci, KUCUK_ADA)).toEqual([
      ['ada', 'tamam', undefined],
      ['tepe', 'acik', 'ada'],
      ['ova', 'kilitli', 'tepe'],
    ])
    expect(durumlar(oyna(ikinci, TEPE, 1), KUCUK_ADA)).toEqual([
      ['ada', 'tamam', undefined],
      ['tepe', 'tamam', 'ada'],
      ['ova', 'hazirlaniyor', 'tepe'],
    ])
  })

  it('içeriği olmayan bölge bitmez: ardındaki bölge kilitli kalır', () => {
    expect(bolgeBittiMi(BOS_ILERLEME, OVA)).toBe(false)
  })
})

describe('kalınan görev', () => {
  it('bölgeye dönen çocuk kaldığı görevden sürdürür', () => {
    expect(kaldigiGorev(BOS_ILERLEME, KOY)).toBe(0)
    const uc = oyna(BOS_ILERLEME, KOY, 3)
    expect(uc.bolgeler.koy).toEqual({ bitenler: [1, 2, 3], kaldigi: 3 })
    expect(kaldigiGorev(uc, KOY)).toBe(3)
  })

  it('tur bitince sonraki giriş baştan başlar; bitenler kalır', () => {
    const on = oyna(BOS_ILERLEME, KOY, 10)
    expect(on.bolgeler.koy?.kaldigi).toBe(10)
    expect(kaldigiGorev(on, KOY)).toBe(0)
    const yeniTur = oyna(on, KOY, 1, dakikaSonra(BUGUN, 60))
    expect(kaldigiGorev(yeniTur, KOY)).toBe(1)
    expect(bolgeBittiMi(yeniTur, KOY)).toBe(true)
  })
})

describe('kart tekrarı', () => {
  it('doğru kurulan her kelime bir kart: kelime, kök, ekler, bölge, tarih', () => {
    const ilerleme = oyna(BOS_ILERLEME, KOY, 10)
    expect(ilerleme.kartlar.map((k) => k.kelime)).toEqual([
      'atlar',
      'evler',
      'kuşlar',
      'gözler',
      'kızım',
      'elim',
      'topum',
      'gözüm',
      'gülüm',
      'toplarım',
    ])
    expect(ilerleme.kartlar.at(-1)).toEqual({
      kelime: 'toplarım',
      kok: 'top',
      etiketler: ['PL', 'POSS.1SG'],
      bolge: 'koy',
      tarih: dakikaSonra(BUGUN, 9).toISOString(),
      sonKurulma: dakikaSonra(BUGUN, 9).toISOString(),
    })
  })

  it('aynı kelime aynı bölgeden ikinci kez kart olmaz; tarihi ilk kurulduğu gün kalır', () => {
    const dun = oyna(BOS_ILERLEME, KOY, 2, DUN)
    const bugun = oyna(dun, KOY, 10, BUGUN)
    expect(bugun.kartlar).toHaveLength(10)
    const atlar = bugun.kartlar.find((k) => k.kelime === 'atlar')
    expect(atlar).toMatchObject({ tarih: DUN.toISOString(), sonKurulma: BUGUN.toISOString() })
  })

  it('kartların ekleri verilirse kartlar onlardır, sırayla (Kök Bahçesi: yalnız gövde)', () => {
    const bahce = bolgeBul('bahce') as Bolge
    const gozlukculer = bahce.gorevler[9] as Gorev
    const ilerleme = gorevBitti(BOS_ILERLEME, bahce, gozlukculer, BUGUN, [['LIK'], ['LIK', 'AGT']])
    expect(ilerleme.kartlar.map((k) => [k.kelime, k.etiketler])).toEqual([
      ['gözlük', ['LIK']],
      ['gözlükçü', ['LIK', 'AGT']],
    ])
    expect(ilerleme.bolgeler.bahce).toEqual({ bitenler: [10], kaldigi: 10 })
    // Aynı kelime ikinci kez kart olmaz; yalnız son kurulma anı değişir.
    const sonra = dakikaSonra(BUGUN, 5)
    const tekrar = gorevBitti(ilerleme, bahce, gozlukculer, sonra, [['LIK'], ['LIK', 'AGT']])
    expect(tekrar.kartlar).toHaveLength(2)
    expect(tekrar.kartlar.map((k) => k.sonKurulma)).toEqual([sonra.toISOString(), sonra.toISOString()])
    // Kaydedilip yüklenince kartlar kalır (motorun kurduğu kelimeler).
    expect(ilerlemeyiCoz(JSON.parse(JSON.stringify(ilerleme))).kartlar).toEqual(ilerleme.kartlar)
  })

  it('aynı kelime başka bölgede kurulursa ayrı kart olur', () => {
    const ilerleme = oyna(oyna(BOS_ILERLEME, ADA, 1), TEPE, 1, dakikaSonra(BUGUN, 3))
    expect(ilerleme.kartlar.map((k) => [k.bolge, k.kelime])).toEqual([
      ['ada', 'evler'],
      ['tepe', 'evler'],
    ])
  })
})

describe('bugünün kartları', () => {
  it('bölgede bugün kurulan kelimeler, kurulma sırasıyla; dün kurulup bugün yeniden kurulan da', () => {
    const dun = oyna(BOS_ILERLEME, KOY, 3, DUN)
    const bugun = gorevBitti(
      gorevBitti(dun, KOY, KOY.gorevler[3] as Gorev, BUGUN),
      KOY,
      KOY.gorevler[1] as Gorev,
      dakikaSonra(BUGUN, 1),
    )
    expect(bugununKartlari(bugun, 'koy', dakikaSonra(BUGUN, 2)).map((k) => k.kelime)).toEqual([
      'gözler',
      'evler',
    ])
    expect(bugununKartlari(dun, 'koy', BUGUN)).toEqual([])
    expect(bugununKartlari(dun, 'koy', DUN).map((k) => k.kelime)).toEqual([
      'atlar',
      'evler',
      'kuşlar',
    ])
  })

  it('başka bölgenin kartları girmez', () => {
    const ilerleme = oyna(oyna(BOS_ILERLEME, ADA, 2), TEPE, 1, dakikaSonra(BUGUN, 5))
    expect(bugununKartlari(ilerleme, 'ada', BUGUN).map((k) => k.kelime)).toEqual([
      'evler',
      'atlar',
    ])
    expect(bugununKartlari(ilerleme, 'tepe', BUGUN)).toHaveLength(1)
  })

  it('gün yerel saate göre değişir', () => {
    expect(ayniGun(new Date(2026, 8, 28, 0, 0), new Date(2026, 8, 28, 23, 59))).toBe(true)
    expect(ayniGun(new Date(2026, 8, 28, 23, 59), new Date(2026, 8, 29, 0, 0))).toBe(false)
  })
})

describe('Sözlük grupları', () => {
  it('bölge sırasıyla gruplu; her grupta en yeni kart önde; boş grup yok', () => {
    const ilerleme = oyna(oyna(BOS_ILERLEME, TEPE, 1, DUN), ADA, 2)
    const gruplar = sozlukGruplari(ilerleme, KUCUK_ADA)
    expect(gruplar.map((g) => [g.bolge.kimlik, g.kartlar.map((k) => k.kelime)])).toEqual([
      ['ada', ['atlar', 'evler']],
      ['tepe', ['evler']],
    ])
  })

  it('aynı anda kazanılan kartlarda sonraki önde; kartsız sözlük boş', () => {
    const ilerleme = oyna(BOS_ILERLEME, KOY, 3)
    const ayniAnda = {
      ...ilerleme,
      kartlar: ilerleme.kartlar.map((k) => ({ ...k, tarih: BUGUN.toISOString() })),
    }
    expect(sozlukGruplari(ayniAnda)[0]?.kartlar.map((k) => k.kelime)).toEqual([
      'kuşlar',
      'evler',
      'atlar',
    ])
    expect(sozlukGruplari(BOS_ILERLEME)).toEqual([])
  })
})

describe('ayarlar ve sıfırlama', () => {
  it('ayarlar değişir ve kaydedilir', () => {
    const { depo } = bellekDeposu()
    const ilerleme = ayarlariDegistir(BOS_ILERLEME, { hareket: 'azalt' })
    expect(ilerleme.ayarlar).toEqual({ ...VARSAYILAN_AYARLAR, hareket: 'azalt' })
    ilerlemeyiKaydet(depo, ayarlariDegistir(ilerleme, { renkler: 'renksiz' }))
    expect(ilerlemeyiYukle(depo).ayarlar).toEqual({
      ...VARSAYILAN_AYARLAR,
      hareket: 'azalt',
      renkler: 'renksiz',
    })
  })

  it('sıfırlama bütün ilerlemeyi ve kartları siler; ayarları ve kapatılan ipuçlarını bırakır', () => {
    const ilerleme = ipucunuKapat(
      ayarlariDegistir(oyna(BOS_ILERLEME, KOY, 10), { renkler: 'renksiz' }),
      'ana-ekran',
    )
    const sifir = ilerlemeyiSifirla(ilerleme)
    expect(sifir).toEqual({
      ...BOS_ILERLEME,
      ayarlar: { ...VARSAYILAN_AYARLAR, renkler: 'renksiz' },
      kapananIpuclari: ['ana-ekran'],
      sifirlama: 1,
    })
    // Her sıfırlamada kimlik bir artar.
    expect(ilerlemeyiSifirla(sifir).sifirlama).toBe(2)
    expect(bolgeDurumlari(sifir).map((b) => b.durum)).toEqual([
      'acik',
      'kilitli',
      'kilitli',
      'kilitli',
    ])
    expect(kaldigiGorev(sifir, KOY)).toBe(0)
  })
})

describe('sınıf modu (etkileşimli tahta)', () => {
  const DUKKAN = bolgeBul('dukkan') as Bolge
  const ilkGorev = (bolge: Bolge) => bolge.gorevler[0] as Gorev
  const sinifiAc = (i: Ilerleme) => ayarlariDegistir(i, { sinif: 'acik' })
  const sinifiKapat = (i: Ilerleme) => ayarlariDegistir(i, { sinif: 'kapali' })

  /** Cihazında koyun üç görevi biten, Renksiz seçili bir pencere. */
  function cihazi(ilk = ayarlariDegistir(oyna(BOS_ILERLEME, KOY, 3), { renkler: 'renksiz' })) {
    const { depo, kayitlar } = bellekDeposu(JSON.stringify(ilk))
    return { depo, kayitlar, kayit: oyunKaydi(depo), metin: () => kayitlar.get(ANAHTAR) }
  }

  it('açılınca ayar kayda yazılır; ilerleme sıfırdan, bellekte başlar', () => {
    const { kayit, depo } = cihazi()
    expect(kayit.degistir(sinifiAc)).toBe(true)
    expect(ilerlemeyiYukle(depo).ayarlar.sinif).toBe('acik')
    expect(kayit.ilerleme.bolgeler).toEqual({})
    expect(kayit.ilerleme.kartlar).toEqual([])
    expect(kayit.ilerleme.ayarlar).toEqual({ ...VARSAYILAN_AYARLAR, renkler: 'renksiz', sinif: 'acik' })
  })

  it('bütün bölgeler açık; kilit yok', () => {
    expect(bolgeDurumlari(sinifiAc(BOS_ILERLEME)).map((b) => b.durum)).toEqual([
      'acik',
      'acik',
      'acik',
      'acik',
    ])
    // İçeriği olmayan bölge yine hazırlanıyor; biten bölge tamam.
    expect(
      bolgeDurumlari(sinifiAc(oyna(BOS_ILERLEME, ADA, 2)), KUCUK_ADA).map((b) => b.durum),
    ).toEqual(['tamam', 'acik', 'hazirlaniyor'])
  })

  it('görevler, kartlar ve kalınan yer kayda yazılmaz; yalnız bellekte durur', () => {
    const { kayit, metin } = cihazi()
    kayit.degistir(sinifiAc)
    const once = metin()
    const acilis = kayit.ilerleme.sifirlama
    expect(
      kayit.degistir((i) => ekrandaGorevBitti(i, KOY, ilkGorev(KOY), BUGUN, acilis)),
    ).toBe(false)
    kayit.degistir((i) => gorevBitti(i, DUKKAN, ilkGorev(DUKKAN), BUGUN))
    expect(metin()).toBe(once)
    expect(kayit.ilerleme.bolgeler).toEqual({
      koy: { bitenler: [1], kaldigi: 1 },
      dukkan: { bitenler: [1], kaldigi: 1 },
    })
    expect(kayit.ilerleme.kartlar.map((k) => k.kelime)).toEqual(['atlar', 'kitabım'])
    expect(sozlukGruplari(kayit.ilerleme).map((g) => g.bolge.kimlik)).toEqual(['koy', 'dukkan'])
    expect(kaldigiGorev(kayit.ilerleme, KOY)).toBe(1)
  })

  it('sayfa yenilenince (yeni kayıt) sınıf modu açık kalır, ilerleme sıfırdan başlar', () => {
    const { kayit, depo } = cihazi()
    kayit.degistir(sinifiAc)
    kayit.degistir((i) => oyna(i, KOY, 2))
    const yeni = oyunKaydi(depo)
    expect(yeni.ilerleme.ayarlar.sinif).toBe('acik')
    expect(yeni.ilerleme.bolgeler).toEqual({})
    expect(yeni.ilerleme.kartlar).toEqual([])
  })

  it('kapanınca cihazın kaydı olduğu gibi geri gelir; yeniden açılınca o açılışın ilerlemesi sürer', () => {
    const ilk = ayarlariDegistir(oyna(BOS_ILERLEME, KOY, 3), { renkler: 'renksiz' })
    const { kayit, depo } = cihazi(ilk)
    kayit.degistir(sinifiAc)
    kayit.degistir((i) => oyna(i, KOY, 5))
    kayit.degistir(sinifiKapat)
    expect(kayit.ilerleme).toEqual(ilk)
    expect(ilerlemeyiYukle(depo)).toEqual(ilk)
    kayit.degistir(sinifiAc)
    expect(kayit.ilerleme.bolgeler).toEqual({ koy: { bitenler: [1, 2, 3, 4, 5], kaldigi: 5 } })
  })

  it('ayar değişikliği sınıf modunda da kayda yazılır; yalnız değişen alan', () => {
    const { kayit, depo } = cihazi()
    kayit.degistir(sinifiAc)
    kayit.degistir((i) => oyna(i, KOY, 1))
    expect(kayit.degistir((i) => ayarlariDegistir(i, { ses: 'sesli' }))).toBe(true)
    const son = ilerlemeyiYukle(depo)
    expect(son.ayarlar).toEqual({ ...VARSAYILAN_AYARLAR, renkler: 'renksiz', ses: 'sesli', sinif: 'acik' })
    // Cihazın ilerlemesi değişmedi: koyun üç görevi.
    expect(son.bolgeler).toEqual({ koy: { bitenler: [1, 2, 3], kaldigi: 3 } })
    expect(kayit.ilerleme.ayarlar.ses).toBe('sesli')
    expect(kayit.ilerleme.bolgeler).toEqual({ koy: { bitenler: [1], kaldigi: 1 } })
  })

  it('sıfırlama yalnız o açılışın ilerlemesini siler; cihazın kaydı kalır', () => {
    const { kayit, metin } = cihazi()
    kayit.degistir(sinifiAc)
    kayit.degistir((i) => oyna(i, KOY, 2))
    const once = metin()
    kayit.degistir(ilerlemeyiSifirla)
    expect(metin()).toBe(once)
    expect(kayit.ilerleme.bolgeler).toEqual({})
    expect(kayit.ilerleme.sifirlama).toBe(1)
  })

  it('başka pencere: cihazın ilerlemesi sınıfınkini değiştirmez, ayarı görünür', () => {
    const { kayit, depo } = cihazi()
    kayit.degistir(sinifiAc)
    kayit.degistir((i) => oyna(i, KOY, 1))
    const oteki = pencereKaydi(depo)
    oteki.degistir((i) => oyna(i, KOY, 6))
    const once = kayit.ilerleme
    expect(kayit.tazele()).toBe(false)
    expect(kayit.ilerleme).toBe(once)
    oteki.degistir((i) => ayarlariDegistir(i, { hareket: 'azalt' }))
    expect(kayit.tazele()).toBe(true)
    expect(kayit.ilerleme.ayarlar.hareket).toBe('azalt')
    expect(kayit.ilerleme.bolgeler).toEqual({ koy: { bitenler: [1], kaldigi: 1 } })
    // Öteki pencere sınıf modunu kapatınca cihazın kaydı görünür.
    oteki.degistir(sinifiKapat)
    expect(kayit.tazele()).toBe(true)
    expect(kayit.ilerleme.bolgeler).toEqual(ilerlemeyiYukle(depo).bolgeler)
  })

  it('depo yoksa sınıf modu yine açılır (bu açılış boyunca)', () => {
    const kayit = oyunKaydi(null)
    expect(kayit.degistir(sinifiAc)).toBe(false)
    expect(kayit.ilerleme.ayarlar.sinif).toBe('acik')
    kayit.degistir((i) => oyna(i, KOY, 1))
    expect(kayit.ilerleme.bolgeler).toEqual({ koy: { bitenler: [1], kaldigi: 1 } })
  })

  it('sınıf modu kapalıyken kayıt pencereKaydi gibidir', () => {
    const { kayit, depo } = cihazi()
    kayit.degistir((i) => oyna(i, KOY, 4))
    expect(ilerlemeyiYukle(depo).bolgeler).toEqual({ koy: { bitenler: [1, 2, 3, 4], kaldigi: 4 } })
  })
})

describe('ipuçları', () => {
  it('kapatılan ipucu kayda yazılır; ikinci kez kapatmak bir şey değiştirmez', () => {
    const { depo } = bellekDeposu()
    const kayit = oyunKaydi(depo)
    expect(kayit.degistir((i) => ipucunuKapat(i, 'ana-ekran'))).toBe(true)
    expect(ilerlemeyiYukle(depo).kapananIpuclari).toEqual(['ana-ekran'])
    expect(kayit.degistir((i) => ipucunuKapat(i, 'ana-ekran'))).toBe(false)
  })

  it('sınıf modunda kapatılan ipucu da cihazın kaydına yazılır', () => {
    const { depo } = bellekDeposu()
    const kayit = oyunKaydi(depo)
    kayit.degistir((i) => ayarlariDegistir(i, { sinif: 'acik' }))
    kayit.degistir((i) => ipucunuKapat(i, 'ana-ekran'))
    expect(ilerlemeyiYukle(depo).kapananIpuclari).toEqual(['ana-ekran'])
    expect(kayit.ilerleme.kapananIpuclari).toEqual(['ana-ekran'])
  })
})
