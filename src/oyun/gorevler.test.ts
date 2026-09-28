// Görev tablosu: icerik/gorevler/bukalemun-koyu.csv. Tablo yalnız kullanıcının onayıyla
// değişir; testi geçirmek için tabloya dokunulmaz. Doğru biçim görev dosyasında yazılı
// değildir, motordan gelir: her görevin doğru biçimi kıyıdaki seçeneklerden kurulabilmeli.

import { describe, expect, it } from 'vitest'
import { KOK_SOZLUGU, ekle, olasiBicimler } from '../motor/index.ts'
import { bolgeBul } from './bolgeler.ts'
import { gorevleriOku } from './gorevler.ts'
import { adimiKur, denemeyiDegerlendir, dogruMu } from './koy.ts'

// Bukalemun Koyu'nun görevleri, oyundaki gibi bölge tablosundaki yolundan okunur.
const gorevler = bolgeBul('koy')?.gorevler ?? []
const BASLIK = 'sira,kok,ekler,renksiz\n'

describe('Bukalemun Koyu görevleri', () => {
  it('on görev, 1\'den 10\'a sırayla', () => {
    expect(gorevler.map((g) => g.sira)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('kökler sözlükte (uydurma değil)', () => {
    for (const { kok } of gorevler) expect(KOK_SOZLUGU.has(kok), kok).toBe(true)
  })

  it('yalnız -lAr ve -(I)m; zincirli tek görev 10.', () => {
    for (const { etiketler } of gorevler) {
      for (const etiket of etiketler) expect(['PL', 'POSS.1SG']).toContain(etiket)
    }
    expect(gorevler.filter((g) => g.etiketler.length > 1).map((g) => g.sira)).toEqual([10])
    expect(gorevler.find((g) => g.sira === 10)?.etiketler).toEqual(['PL', 'POSS.1SG'])
  })

  it('renksiz tek görev 9.', () => {
    expect(gorevler.filter((g) => g.renksiz).map((g) => g.sira)).toEqual([9])
  })

  it('seçenekler: PL için lar ve ler; POSS.1SG için ım, im, um, üm', () => {
    for (const gorev of gorevler) {
      gorev.etiketler.forEach((etiket, sira) => {
        const yuzeyler = adimiKur(gorev, sira).secenekler.map((s) => s.yuzey)
        const beklenen = etiket === 'PL' ? ['lar', 'ler'] : ['ım', 'im', 'um', 'üm']
        const ad = `${gorev.sira}. görev, ${etiket}`
        expect([...yuzeyler].sort(), ad).toEqual([...beklenen].sort())
      })
    }
  })

  it.each(gorevler)(
    '$sira. görev ($kok + $etiketler): doğru biçim seçeneklerden kurulur',
    (gorev) => {
      const dogruBicim = ekle(gorev.kok, gorev.etiketler).bicim
      expect(olasiBicimler(gorev.kok, gorev.etiketler)).toContain(dogruBicim)

      // Her adımda seçeneklerden tam biri doğrudur; seçilenler kökle doğru biçimi kurar.
      const secilenler: string[] = []
      gorev.etiketler.forEach((_etiket, sira) => {
        const adim = adimiKur(gorev, sira)
        const dogrular = adim.secenekler.filter((s) =>
          dogruMu(denemeyiDegerlendir(gorev, adim, s.yuzey)),
        )
        expect(dogrular.map((s) => s.yuzey)).toEqual([adim.parca.yuzey])
        secilenler.push(adim.parca.yuzey)
      })
      expect(gorev.kok + secilenler.join('')).toBe(dogruBicim)
    },
  )

  it('her yanlış seçeneğin bir uyum nedeni ve cümlesi var (diğer yok)', () => {
    for (const gorev of gorevler) {
      gorev.etiketler.forEach((_etiket, sira) => {
        const adim = adimiKur(gorev, sira)
        for (const { yuzey } of adim.secenekler) {
          const deneme = denemeyiDegerlendir(gorev, adim, yuzey)
          if (dogruMu(deneme)) continue
          expect(deneme.nedenler[0]?.tur, deneme.aday).toBe('uyum')
          expect(deneme.cumle, deneme.aday).toMatch(/uyuşmuyor\./)
        }
      })
    }
  })

  it('doğru biçimler', () => {
    expect(gorevler.map((g) => ekle(g.kok, g.etiketler).bicim)).toEqual([
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
  })
})

describe('gorevleriOku', () => {
  it('satırı okur: ekler + ile ayrılır, renksiz evet ya da boş', () => {
    expect(gorevleriOku(`${BASLIK}1,ev,PL,\n2,top,PL+POSS.1SG,evet\n`)).toEqual([
      { sira: 1, kok: 'ev', etiketler: ['PL'], renksiz: false },
      { sira: 2, kok: 'top', etiketler: ['PL', 'POSS.1SG'], renksiz: true },
    ])
  })

  it('yanlış satırı numarasıyla bildirir', () => {
    expect(() => gorevleriOku(`${BASLIK}2,ev,PL,\n`)).toThrow('Görev tablosu, 2. satır: sıra 1 olur')
    expect(() => gorevleriOku(`${BASLIK}1,ev,PL,\n1,at,PL,\n`)).toThrow('3. satır: sıra 2 olur')
    expect(() => gorevleriOku(`${BASLIK}1,,PL,\n`)).toThrow('kök boş')
    expect(() => gorevleriOku(`${BASLIK}1,ev,,\n`)).toThrow('ek yok')
    expect(() => gorevleriOku(`${BASLIK}1,ev,PLU,\n`)).toThrow('bilinmeyen ek etiketi: "PLU"')
    expect(() => gorevleriOku(`${BASLIK}1,ev,PL,hayır\n`)).toThrow('renksiz boş ya da "evet" olur')
    expect(() => gorevleriOku(`${BASLIK}1,Ev,PL,\n`)).toThrow('2. satır: "Ev" kökünde alfabe dışı harf')
  })

  it('başlık ve alan sayısı csvOku ile denetlenir', () => {
    expect(() => gorevleriOku('sira,kok,ekler\n1,ev,PL\n')).toThrow('CSV başlığı')
  })
})
