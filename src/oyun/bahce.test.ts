// Kök Bahçesi: görev tablosu (icerik/gorevler/kok-bahcesi.csv) ve oyunun durumu. Tablo yalnız
// kullanıcının onayıyla değişir; testi geçirmek için tabloya dokunulmaz. Hedef, parçalar ve
// gövde kelimeleri görev dosyasında yazılı değildir, motordan gelir.

import { describe, expect, it } from 'vitest'
import { KOK_SOZLUGU, ekSirasiHatasi, ekle } from '../motor/index.ts'
import {
  agactakiler,
  bahceBaslangici,
  bahceGorevi,
  bahceIndirgeyici,
  buyusu,
  denemeninAdayi,
  denemeyiDegerlendir,
  dogruMu,
  govdeDegisimi,
  kartEtiketleri,
  nedenKodu,
  sepettekiler,
  simdikiKelime,
  type BahceDurumu,
  type BahceEylemi,
  type BahceGorevi,
} from './bahce.ts'
import { bolgeBul } from './bolgeler.ts'
import type { Gorev } from './gorevler.ts'

const gorevler = bolgeBul('bahce')?.gorevler ?? []
const agaclar = gorevler.map(bahceGorevi)

const agac = (sira: number): BahceGorevi => {
  const bulunan = agaclar.find((a) => a.gorev.sira === sira)
  if (!bulunan) throw new Error(`${sira}. ağaç yok`)
  return bulunan
}

/** Yüzeyiyle parçanın sırası. */
const parcaSirasi = (bahce: BahceGorevi, yuzey: string): number => {
  const parca = bahce.parcalar.find((p) => p.yuzey === yuzey)
  if (!parca) throw new Error(`${bahce.hedef}: ${yuzey} yok`)
  return parca.sira
}

const uygula = (durum: BahceDurumu, ...eylemler: BahceEylemi[]) =>
  eylemler.reduce(bahceIndirgeyici, durum)

/** Sıradaki parçayı taşır ve büyüyü bitirir. */
const dogruTasi = (durum: BahceDurumu) =>
  uygula(durum, { tur: 'dene', sira: durum.kurulan }, { tur: 'tutundu' }, { tur: 'buyuBitti' })

describe('Kök Bahçesi görevleri', () => {
  it("on ağaç, 1'den 10'a sırayla; hepsi renkli; kökler sözlükte", () => {
    expect(gorevler.map((g) => g.sira)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(gorevler.some((g) => g.renksiz)).toBe(false)
    for (const { kok } of gorevler) expect(KOK_SOZLUGU.has(kok), kok).toBe(true)
  })

  it.each(gorevler)(
    '$sira. ağaç ($kok + $etiketler): en az bir yapım, en çok bir çekim eki; çekim en sonda',
    (gorev) => {
      const turler = gorev.etiketler.map((e) => ekle(gorev.kok, [e]).parcalar[0]?.tur)
      expect(turler.filter((t) => t === 'yapım').length).toBeGreaterThanOrEqual(1)
      const cekimler = turler.filter((t) => t === 'çekim')
      expect(cekimler.length).toBeLessThanOrEqual(1)
      if (cekimler.length === 1) expect(turler.at(-1)).toBe('çekim')
      expect(ekSirasiHatasi(gorev.etiketler)).toBeUndefined()
    },
  )

  it('hedefler, sepetteki yüzeyler ve gövde kelimeleri motordan', () => {
    const ozet = agaclar.map(
      (a) =>
        `${a.hedef}: ${a.parcalar.map((p) => `${p.yuzey}${p.tur === 'çekim' ? '*' : ''}`).join(' ')}` +
        ` | ${a.govdeler.map((g) => g.bicim).join(' ')}`,
    )
    expect(ozet).toEqual([
      'çiçekçiler: çi ler* | çiçekçi',
      'tuzluklar: luk lar* | tuzluk',
      'tatlıcı: lı cı | tatlı tatlıcı',
      'sessizlik: siz lik | sessiz sessizlik',
      'kitapçıklar: çık lar* | kitapçık',
      'yolculuk: cu luk | yolcu yolculuk',
      'kalemliğim: lik im* | kalemlik',
      'kediciğim: cik im* | kedicik',
      'susuzluk: suz luk | susuz susuzluk',
      'gözlükçüler: lük çü ler* | gözlük gözlükçü',
    ])
  })

  it('on ağaçta 15 gövde kelimesi; hepsi ayrı', () => {
    const kelimeler = agaclar.flatMap((a) => a.govdeler.map((g) => g.bicim))
    expect(kelimeler).toHaveLength(15)
    expect(new Set(kelimeler).size).toBe(15)
  })

  it('kartlar yalnız gövdeden: çiçekçi var, çiçekçiler yok', () => {
    expect(kartEtiketleri(agac(1))).toEqual([['AGT']])
    expect(kartEtiketleri(agac(10))).toEqual([['LIK'], ['LIK', 'AGT']])
  })

  it('sepette hedefin bütün ekleri, karışık sırada', () => {
    for (const a of agaclar) {
      expect([...a.sepet].sort()).toEqual(a.parcalar.map((p) => p.sira))
    }
    // En yüksek ağaçta sepet: çü, ler, lük.
    expect(agac(10).sepet.map((s) => agac(10).parcalar[s]?.yuzey)).toEqual(['çü', 'ler', 'lük'])
  })

  it('sıradaki parça sepette hep aynı yerde durmaz: ilk adımda da, bütün adımlarda da', () => {
    const ilkYerler = new Set<number>()
    const yerler = new Set<number>()
    for (const gorev of gorevler) {
      let durum = bahceBaslangici([gorev])
      let adim = 0
      while (durum.evre === 'secim') {
        const yer = sepettekiler(durum).findIndex((p) => p.sira === durum.kurulan)
        expect(yer).toBeGreaterThanOrEqual(0)
        if (adim === 0) ilkYerler.add(yer)
        yerler.add(yer)
        durum = dogruTasi(durum)
        adim++
      }
    }
    expect(ilkYerler.size).toBeGreaterThan(1)
    expect([...yerler].sort()).toEqual([0, 1, 2])
  })

  it('görevin kuralı bozuksa hata verir', () => {
    const gorev = (ekler: string): Gorev => ({ sira: 1, tur: 1, turdakiSira: 1, kok: 'göz', etiketler: ekler.split('+'), renksiz: false })
    expect(() => bahceGorevi(gorev('PL'))).toThrow('yapım eki yok')
    expect(() => bahceGorevi(gorev('LIK+PL+POSS.1SG'))).toThrow('birden çok çekim eki var')
    expect(() => bahceGorevi(gorev('LIK+PL+AGT'))).toThrow('ek sırası bozuk')
  })
})

describe('denemeyiDegerlendir', () => {
  it('sıradaki parça doğrudur', () => {
    const a = agac(1)
    expect(denemeyiDegerlendir(a, 0, parcaSirasi(a, 'çi'))).toEqual({ sira: 0, neden: null, cumle: '' })
    expect(denemeyiDegerlendir(a, 1, parcaSirasi(a, 'ler')).neden).toBeNull()
  })

  it('çekim eki seçildi, geride yapım eki var: meyve', () => {
    const a = agac(1)
    const deneme = denemeyiDegerlendir(a, 0, parcaSirasi(a, 'ler'))
    expect(deneme.neden).toMatchObject({ tur: 'meyve', meyve: { yuzey: 'ler' }, once: { yuzey: 'çi' } })
    expect(deneme.cumle).toBe('Meyvenin üstüne gövde çıkmaz: önce çi.')
    expect(dogruMu(deneme)).toBe(false)
  })

  it('meyvenin nedeni ek sırası denetiminden: kurulan + seçilen + kalanlar', () => {
    const a = agac(10)
    // Hiçbir şey kurulmadan ler: PL + LIK + AGT → meyve:LIK, önce lük.
    expect(denemeyiDegerlendir(a, 0, parcaSirasi(a, 'ler')).cumle).toBe(
      'Meyvenin üstüne gövde çıkmaz: önce lük.',
    )
    // lük kurulduktan sonra ler: LIK + PL + AGT → meyve:AGT, önce çü.
    expect(denemeyiDegerlendir(a, 1, parcaSirasi(a, 'ler')).cumle).toBe(
      'Meyvenin üstüne gövde çıkmaz: önce çü.',
    )
  })

  it('başka bir yapım eki seçildi: önce', () => {
    const a = agac(6)
    const deneme = denemeyiDegerlendir(a, 0, parcaSirasi(a, 'luk'))
    expect(deneme.neden).toMatchObject({ tur: 'önce', once: { yuzey: 'cu' }, sonra: { yuzey: 'luk' } })
    expect(deneme.cumle).toBe('yolculuk: önce cu, sonra luk.')
    expect(denemeyiDegerlendir(agac(10), 0, 1).cumle).toBe('gözlükçüler: önce lük, sonra çü.')
  })

  it('her ağaçta her adımda yalnız sıradaki parça doğrudur', () => {
    for (const a of agaclar) {
      for (let kurulan = 0; kurulan < a.parcalar.length; kurulan++) {
        for (const p of a.parcalar.slice(kurulan)) {
          const deneme = denemeyiDegerlendir(a, kurulan, p.sira)
          expect(dogruMu(deneme)).toBe(p.sira === kurulan)
          if (!dogruMu(deneme)) expect(deneme.cumle).not.toBe('')
        }
      }
    }
  })

  it('aynı ek iki kez varsa ikisi de sıradakinin yerine geçer (göz + LIK + AGT + LIK)', () => {
    const a = bahceGorevi({
      sira: 1,
      tur: 1,
      turdakiSira: 1,
      kok: 'göz',
      etiketler: ['LIK', 'AGT', 'LIK'],
      renksiz: false,
    })
    expect(dogruMu(denemeyiDegerlendir(a, 0, 2))).toBe(true)
    expect(denemeyiDegerlendir(a, 0, 1).cumle).toBe('gözlükçülük: önce lük, sonra çü.')
  })
})

describe('deneme günlüğü için: aday ve nedenin kodu', () => {
  it('aday, ağaçtaki eklerle seçilen ekin motordaki biçimi; doğruda sıradaki gövde', () => {
    const a = agac(1)
    expect(denemeninAdayi(a, 0, parcaSirasi(a, 'ler'))).toBe('çiçekler')
    expect(denemeninAdayi(a, 0, parcaSirasi(a, 'çi'))).toBe('çiçekçi')
    expect(denemeninAdayi(agac(6), 0, parcaSirasi(agac(6), 'luk'))).toBe('yolluk')
    // Meyve gövdenin sonunu eritir: kalemlik + im → kalemliğim (yan yana yazılmaz).
    const k = agac(7)
    expect(denemeninAdayi(k, 1, parcaSirasi(k, 'im'))).toBe('kalemliğim')
    for (const b of agaclar) {
      for (let kurulan = 0; kurulan < b.parcalar.length; kurulan++) {
        expect(denemeninAdayi(b, kurulan, kurulan)).toBe(simdikiKelime(b, kurulan + 1))
      }
    }
  })

  it('nedenin kodu: meyve motorun ek sırası koduyla (meyve:AGT), önce sıradaki ekle', () => {
    const a = agac(1)
    const meyve = denemeyiDegerlendir(a, 0, parcaSirasi(a, 'ler')).neden
    expect(nedenKodu(meyve)).toBe('meyve:AGT')
    expect(ekSirasiHatasi(['PL', 'AGT'])).toBe('meyve:AGT')
    expect(nedenKodu(denemeyiDegerlendir(agac(6), 0, parcaSirasi(agac(6), 'luk')).neden)).toBe(
      'önce:AGT',
    )
    expect(nedenKodu(null)).toBe('')
  })
})

describe('büyüler', () => {
  it('her ekin büyüsü: yapım halka ve kart, çekim meyve', () => {
    const buyuler = agaclar.map((a) => a.parcalar.map((p) => `${p.yuzey}:${buyusu(p)}`).join(' '))
    expect(buyuler).toEqual([
      'çi:halka ler:çoğaltır',
      'luk:halka lar:çoğaltır',
      'lı:katar cı:halka',
      'siz:eksiltir lik:halka',
      'çık:küçültür lar:çoğaltır',
      'cu:halka luk:halka',
      'lik:halka im:cebe koyar',
      'cik:küçültür im:cebe koyar',
      'suz:eksiltir luk:halka',
      'lük:halka çü:halka ler:çoğaltır',
    ])
  })

  it('meyve gelince gövdenin sonundaki k ğ olur: kalemlik → kalemliğim, kedicik → kediciğim', () => {
    expect(govdeDegisimi(agac(7), 1)).toEqual({ once: 'kalemlik', sonra: 'kalemliğim', tas: 'k', jole: 'ğ' })
    expect(govdeDegisimi(agac(8), 1)).toEqual({ once: 'kedicik', sonra: 'kediciğim', tas: 'k', jole: 'ğ' })
    expect(govdeDegisimi(agac(2), 1)).toBeNull() // tuzluklar: ünsüzle başlayan ek
    expect(govdeDegisimi(agac(7), 0)).toBeNull()
  })

  it('kelimenin o anki hâli', () => {
    expect([0, 1, 2, 3].map((n) => simdikiKelime(agac(10), n))).toEqual([
      'göz',
      'gözlük',
      'gözlükçü',
      'gözlükçüler',
    ])
  })
})

describe('bahceIndirgeyici', () => {
  it('başlangıç: ilk ağaç, sepet dolu, ağaç boş', () => {
    const durum = bahceBaslangici(gorevler)
    expect(durum).toMatchObject({ gorevYeri: 0, evre: 'secim', kurulan: 0, secili: null })
    expect(sepettekiler(durum).map((p) => p.yuzey)).toEqual(['ler', 'çi'])
    expect(agactakiler(durum)).toEqual([])
  })

  it('kalınan ağaçtan sürdürür; geçersiz yer baştan başlatır', () => {
    expect(bahceBaslangici(gorevler, 6).bahce?.hedef).toBe('kalemliğim')
    expect(bahceBaslangici(gorevler, 10).gorevYeri).toBe(0)
    expect(bahceBaslangici(gorevler, -1).gorevYeri).toBe(0)
  })

  it('yanlış taşıma: ek sepete döner, cümle görünür, ağaç büyümez', () => {
    const bas = bahceBaslangici(gorevler)
    const denendi = uygula(bas, { tur: 'dene', sira: 1 })
    expect(denendi.evre).toBe('deneme')
    expect(uygula(denendi, { tur: 'tutundu' })).toBe(denendi)
    const dondu = uygula(denendi, { tur: 'dondu' })
    expect(dondu).toMatchObject({ evre: 'secim', kurulan: 0, deneme: null })
    expect(dondu.yanlis?.cumle).toBe('Meyvenin üstüne gövde çıkmaz: önce çi.')
    expect(sepettekiler(dondu)).toHaveLength(2)
  })

  it('doğru taşıma: parça ağaca geçer, sepetten çıkar; son parçayla ağaç biter', () => {
    const bas = bahceBaslangici(gorevler)
    const tutundu = uygula(bas, { tur: 'dene', sira: 0 }, { tur: 'tutundu' })
    expect(tutundu).toMatchObject({ evre: 'buyu', kurulan: 1, kullanilanlar: [0] })
    expect(sepettekiler(tutundu).map((p) => p.yuzey)).toEqual(['ler'])
    expect(agactakiler(tutundu).map((p) => p.yuzey)).toEqual(['çi'])
    const ikinci = uygula(tutundu, { tur: 'buyuBitti' })
    expect(ikinci.evre).toBe('secim')
    const bitti = dogruTasi(ikinci)
    expect(bitti.evre).toBe('bitti')
    expect(sepettekiler(bitti)).toEqual([])
    const sonraki = uygula(bitti, { tur: 'sonraki' })
    expect(sonraki).toMatchObject({ gorevYeri: 1, evre: 'secim', kurulan: 0 })
  })

  it('seçim: dokun-dokun seçer, ikinci dokunuş bırakır; sepette olmayan seçilmez', () => {
    const bas = bahceBaslangici(gorevler)
    const secili = uygula(bas, { tur: 'sec', sira: 1 })
    expect(secili.secili).toBe(1)
    expect(uygula(secili, { tur: 'sec', sira: 1 }).secili).toBeNull()
    expect(uygula(bas, { tur: 'sec', sira: 5 })).toBe(bas)
  })

  it('on ağaç biter: kapanış', () => {
    let durum = bahceBaslangici(gorevler)
    for (let i = 0; i < 10; i++) {
      while (durum.evre === 'secim') durum = dogruTasi(durum)
      expect(durum.evre).toBe('bitti')
      durum = uygula(durum, { tur: 'sonraki' })
    }
    expect(durum).toMatchObject({ evre: 'kapanis', bahce: null })
  })
})
