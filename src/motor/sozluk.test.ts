import { describe, expect, it } from 'vitest'
import { KOK_SOZLUGU, kokSozlugunuOku } from './sozluk.ts'

const BASLIK = 'kok,kategori,yumusama,unlu_dusmesi,istisna\n'
const oku = (satirlar: string) => kokSozlugunuOku(BASLIK + satirlar)

describe('kök sözlüğü (icerik/kokler.csv)', () => {
  it('151 kökü sözlükteki sırasıyla taşır', () => {
    // Oturum 7'de kullanıcının onayıyla fıstık eklendi (Fıstıkçı Şahap'ın Dükkânı).
    const kokler = [...KOK_SOZLUGU.keys()]
    expect(kokler).toHaveLength(151)
    expect(KOK_SOZLUGU.get('fıstık')).toMatchObject({ kategori: 'yiyecek', yumusama: true })
    expect(kokler.slice(0, 3)).toEqual(['kedi', 'köpek', 'kuş'])
    expect(kokler.at(-1)).toBe('kız')
  })

  it('işaretleri okur', () => {
    expect(KOK_SOZLUGU.get('kedi')).toEqual({
      kok: 'kedi',
      kategori: 'hayvan',
      yumusama: undefined,
      unluDusmesi: false,
      istisna: undefined,
    })
    expect(KOK_SOZLUGU.get('kitap')?.yumusama).toBe(true)
    expect(KOK_SOZLUGU.get('top')?.yumusama).toBe(false)
    expect(KOK_SOZLUGU.get('ağız')?.unluDusmesi).toBe(true)
    expect(KOK_SOZLUGU.get('kalp')).toMatchObject({ yumusama: true, istisna: 'ince-ek' })
    expect(KOK_SOZLUGU.get('hak')).toMatchObject({ yumusama: false, istisna: 'ikiz' })
    expect(KOK_SOZLUGU.get('su')?.istisna).toBe('su')
  })

  it('Unicode ayrışık yazılmış dosyayı da okur', () => {
    expect(oku('ağız,beden,,evet,\n'.normalize('NFD')).get('ağız')?.unluDusmesi).toBe(true)
  })
})

describe('kök sözlüğü: doğrulama', () => {
  it('başlığı yanlış dosyayı reddeder', () => {
    expect(() => kokSozlugunuOku('kok,kategori\nev,ev\n')).toThrow('CSV başlığı')
  })

  it.each([
    [',hayvan,,,', '2. satır: kök boş'],
    ['Kedi,hayvan,,,', 'alfabe dışı harf var: "K"'],
    ['kedi,hayvan,,,\nkedi,hayvan,,,', '3. satır: "kedi" kökü ikinci kez'],
    ['pst,uydurma,,,', 'ünlü yok'],
    ['kedi,,,,', 'kategorisi boş'],
  ])('kökü denetler: %s', (satirlar, neden) => {
    expect(() => oku(satirlar)).toThrow(neden)
  })

  it.each([
    ['kitap,okul,,,', 'yumusama "evet" ya da "hayır" olur'],
    ['kitap,okul,var,,', 'yumusama "evet" ya da "hayır" olur, "var" değil'],
    ['kedi,hayvan,evet,,', 'p, ç, t ya da k ile bitmiyor'],
  ])('yumuşama işaretini denetler: %s', (satirlar, neden) => {
    expect(() => oku(satirlar)).toThrow(neden)
  })

  it.each([
    ['burun,beden,,hayır,', 'unlu_dusmesi boş ya da "evet" olur'],
    ['kedi,hayvan,,evet,', 'düşebilecek son ünlü yok'],
    ['orm,uydurma,,evet,', 'düşebilecek son ünlü yok'],
    ['ıraa,uydurma,,evet,', 'düşebilecek son ünlü yok'],
    ['un,uydurma,,evet,', 'düşebilecek son ünlü yok'],
  ])('ünlü düşmesi işaretini denetler: %s', (satirlar, neden) => {
    expect(() => oku(satirlar)).toThrow(neden)
  })

  it.each([
    ['saat,ev,hayır,,misafir', 'istisna boş, "ince-ek", "ikiz" ya da "su" olur'],
    ['ses,dil,,,ince-ek', 'son ünlüsü zaten ince'],
    ['arı,hayvan,,,ikiz', 'ikiz yalnız ünsüzle biten'],
    ['kap,ev,evet,,ikiz', 'ikiz yalnız ünsüzle biten, yumuşamayan'],
    ['tuz,yiyecek,,,su', 'su işareti yalnız ünlüyle biten kökte'],
  ])('istisna işaretini denetler: %s', (satirlar, neden) => {
    expect(() => oku(satirlar)).toThrow(neden)
  })
})
