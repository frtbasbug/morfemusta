import { describe, expect, it } from 'vitest'
import metin from '../../icerik/emoji.csv?raw'
import { KOK_SOZLUGU } from '../motor/index.ts'
import { EMOJILER, emojiDosyasi, emojiTablosunuOku } from './emoji.ts'

const dosyalar = Object.keys(
  import.meta.glob('../../public/emoji/*.svg', { query: '?url', eager: true }),
).map((yol) => yol.split('/').at(-1) ?? '')

describe('emoji tablosu (icerik/emoji.csv)', () => {
  it('başlık kok,emoji; 22 kök', () => {
    expect(metin.split(/\r?\n/)[0]).toBe('kok,emoji')
    expect(EMOJILER.size).toBe(22)
    expect(EMOJILER.get('at')?.emoji).toBe('🐎')
  })

  it.each([...EMOJILER.keys()])('%s sözlükte', (kok) => {
    expect(KOK_SOZLUGU.has(kok)).toBe(true)
  })

  it('her emojinin SVG dosyası public/emoji/ altında; tabloda olmayan dosya yok', () => {
    const gerekenler = [...EMOJILER.values()].map((r) => r.dosya)
    expect([...dosyalar].sort()).toEqual([...new Set(gerekenler)].sort())
  })

  it("dosya adı Twemoji'nin: kod noktaları, ZWJ yoksa FE0F atılır", () => {
    expect(emojiDosyasi('🐎')).toBe('1f40e.svg')
    expect(emojiDosyasi('👁️')).toBe('1f441.svg')
    expect(emojiDosyasi('✏️')).toBe('270f.svg')
    expect(emojiDosyasi('🛣️')).toBe('1f6e3.svg')
    expect(emojiDosyasi('👁️‍🗨️')).toBe('1f441-fe0f-200d-1f5e8-fe0f.svg')
  })

  it('boş alan ve tekrar satır numarasıyla hata verir', () => {
    expect(() => emojiTablosunuOku('kok,emoji\nat,\n')).toThrow('2. satır')
    expect(() => emojiTablosunuOku('kok,emoji\nat,🐎\nat,🐴\n')).toThrow('3. satır')
  })
})
