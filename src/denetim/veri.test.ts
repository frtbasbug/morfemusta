import { describe, expect, it } from 'vitest'
import { KOK_SOZLUGU, kokSozlugunuOku, olasiBicimler } from '../motor/index.ts'
import { DENETIM_ETIKETLERI, denetimSatirlari } from './veri.ts'

const satirlar = denetimSatirlari()
const satir = (kok: string) => satirlar.find((s) => s.girdi.kok === kok)

describe('denetim verisi', () => {
  it('sözlükteki her kök için, sözlükteki sırasıyla bir satır verir', () => {
    expect(satirlar.map((s) => s.girdi.kok)).toEqual([...KOK_SOZLUGU.keys()])
  })

  it('her satırda sekiz etiketin biçimi bu sırayla var', () => {
    expect(DENETIM_ETIKETLERI).toEqual([
      'PL',
      'ACC',
      'DAT',
      'LOC',
      'POSS.1SG',
      'POSS.3SG',
      'GEN',
      'PROP',
    ])
    for (const { bicimler } of satirlar) {
      expect(bicimler.map((b) => b.etiket)).toEqual([...DENETIM_ETIKETLERI])
    }
  })

  it('biçimleri motordan alır', () => {
    const bicimler = (kok: string) => satir(kok)?.bicimler.map((b) => b.bicim)
    expect(bicimler('kitap')).toEqual([
      'kitaplar',
      'kitabı',
      'kitaba',
      'kitapta',
      'kitabım',
      'kitabı',
      'kitabın',
      'kitaplı',
    ])
    expect(bicimler('su')).toEqual([
      'sular',
      'suyu',
      'suya',
      'suda',
      'suyum',
      'suyu',
      'suyun',
      'sulu',
    ])
    expect(bicimler('ağız')).toEqual([
      'ağızlar',
      'ağzı',
      'ağza',
      'ağızda',
      'ağzım',
      'ağzı',
      'ağzın',
      'ağızlı',
    ])
  })

  it('sözlükteki kökte her biçim tektir', () => {
    for (const { girdi, bicimler } of satirlar) {
      for (const { etiket, bicim } of bicimler) {
        expect(olasiBicimler(girdi.kok, [etiket])).toEqual([bicim])
      }
    }
  })

  it('işaretleri okunur adlarıyla verir', () => {
    expect(satir('kedi')?.isaretler).toEqual([])
    expect(satir('kitap')?.isaretler).toEqual(['yumuşar'])
    expect(satir('top')?.isaretler).toEqual(['yumuşamaz'])
    expect(satir('ağız')?.isaretler).toEqual(['ünlü düşer'])
    expect(satir('kalp')?.isaretler).toEqual(['yumuşar', 'ince ek'])
    expect(satir('hak')?.isaretler).toEqual(['yumuşamaz', 'ikiz'])
    expect(satir('su')?.isaretler).toEqual(['su'])
  })

  it('verilen sözlükle çalışır', () => {
    const sozluk = kokSozlugunuOku(
      'kok,kategori,yumusama,unlu_dusmesi,istisna\ngıvak,uydurma,evet,,\n',
    )
    const [givak] = denetimSatirlari(sozluk)
    expect(givak?.isaretler).toEqual(['yumuşar'])
    expect(givak?.bicimler.map((b) => b.bicim)).toEqual([
      'gıvaklar',
      'gıvağı',
      'gıvağa',
      'gıvakta',
      'gıvağım',
      'gıvağı',
      'gıvağın',
      'gıvaklı',
    ])
  })
})
