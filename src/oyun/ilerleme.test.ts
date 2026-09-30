import { describe, expect, it } from 'vitest'
import { bolgeBul, type Bolge } from './bolgeler.ts'
import type { Gorev } from './gorevler.ts'
import {
  ANAHTAR,
  BOS_ILERLEME,
  ayarlariDegistir,
  ayniGun,
  bolgeBittiMi,
  bolgeDurumlari,
  bugununKartlari,
  degisenBolgeler,
  gorevBitti,
  ilerlemeyiCoz,
  ilerlemeyiKaydet,
  ilerlemeyiSifirla,
  ilerlemeyiYukle,
  kaldigiGorev,
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
      ayarlar: { hareket: 'sistem', renkler: 'renkli' },
    })
  })

  it('kayıt yoksa baştan: hiçbir bölge oynanmamış, kart yok, ayarlar varsayılan', () => {
    expect(ilerlemeyiYukle(bellekDeposu().depo)).toEqual({
      bolgeler: {},
      kartlar: [],
      ayarlar: { hareket: 'sistem', renkler: 'renkli' },
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
    expect(son.ayarlar).toEqual({ hareket: 'sistem', renkler: 'renksiz' })
    expect(son.bolgeler).toEqual({ koy: { bitenler: [1], kaldigi: 1 } })
  })

  it('ayarda yalnız değişen alan yazılır: A renkleri, eski B hareketi değiştirir; ikisi de kalır', () => {
    const { depo, a, b } = ikiPencere()
    a.degistir((i) => ayarlariDegistir(i, { renkler: 'renksiz' }))
    b.degistir((i) => ayarlariDegistir(i, { hareket: 'azalt' }))
    expect(ilerlemeyiYukle(depo).ayarlar).toEqual({ hareket: 'azalt', renkler: 'renksiz' })
  })

  it("sıfırlama yine her şeyi siler: eski B sıfırlarsa A'nın görevleri ve kartları da gider", () => {
    const { depo, a, b } = ikiPencere()
    a.degistir((i) => ayarlariDegistir(oyna(i, KOY, 2), { renkler: 'renksiz' }))
    b.degistir(ilerlemeyiSifirla)
    // Ayarlar kalır (sıfırlama ayarları silmez); A'nın Renksiz'i de geri alınmaz.
    expect(ilerlemeyiYukle(depo)).toEqual({
      ...BOS_ILERLEME,
      ayarlar: { hareket: 'sistem', renkler: 'renksiz' },
    })
    expect(a.tazele()).toBe(true)
    expect(a.ilerleme).toEqual(b.ilerleme)
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
        '"dukkan": {"bitenler": [1], "kaldigi": 1},' +
        '"__proto__": {"bitenler": [1], "kaldigi": 1}}}',
    )
    // koy: geçerli sıralar tekilleşir ve sıralanır; kaldigi görev sayısını aşarsa 0.
    // yok: tabloda yok. dukkan: içeriği yok, ilerlemesi olamaz.
    expect(ilerleme.bolgeler).toEqual({ koy: { bitenler: [1, 3], kaldigi: 0 } })
    expect(Object.getPrototypeOf(ilerleme.bolgeler)).toBe(Object.prototype)
    expect(yukle({ bolgeler: { koy: 'bitti' } }).bolgeler).toEqual({})
    expect(yukle({ bolgeler: { koy: { kaldigi: 4 } } }).bolgeler).toEqual({
      koy: { bitenler: [], kaldigi: 4 },
    })
  })

  it('tanınmayan ayar varsayılana döner, tanınan kalır', () => {
    expect(yukle({ ayarlar: { hareket: 'hızlı', renkler: 'renksiz' } }).ayarlar).toEqual({
      hareket: 'sistem',
      renkler: 'renksiz',
    })
    expect(yukle({ ayarlar: 'azalt' }).ayarlar).toEqual({ hareket: 'sistem', renkler: 'renkli' })
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

  it('koyun bütün görevleri bitince koy tamam; dükkân açılır ama hazırlanıyor', () => {
    const on = oyna(BOS_ILERLEME, KOY, 10)
    expect(bolgeBittiMi(on, KOY)).toBe(true)
    expect(durumlar(on)).toEqual([
      ['koy', 'tamam', undefined],
      ['dukkan', 'hazirlaniyor', 'koy'],
      ['bahce', 'kilitli', 'dukkan'],
      ['uyduruk', 'kilitli', 'bahce'],
    ])
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
    expect(ilerleme.ayarlar).toEqual({ hareket: 'azalt', renkler: 'renkli' })
    ilerlemeyiKaydet(depo, ayarlariDegistir(ilerleme, { renkler: 'renksiz' }))
    expect(ilerlemeyiYukle(depo).ayarlar).toEqual({ hareket: 'azalt', renkler: 'renksiz' })
  })

  it('sıfırlama bütün ilerlemeyi ve kartları siler, ayarları bırakır', () => {
    const ilerleme = ayarlariDegistir(oyna(BOS_ILERLEME, KOY, 10), { renkler: 'renksiz' })
    const sifir = ilerlemeyiSifirla(ilerleme)
    expect(sifir).toEqual({ ...BOS_ILERLEME, ayarlar: { hareket: 'sistem', renkler: 'renksiz' } })
    expect(bolgeDurumlari(sifir).map((b) => b.durum)).toEqual([
      'acik',
      'kilitli',
      'kilitli',
      'kilitli',
    ])
    expect(kaldigiGorev(sifir, KOY)).toBe(0)
  })
})
