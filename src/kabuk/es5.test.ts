// Eski tarayıcıda çalışması gereken betikler ES5'tir: cihaz.html'in denetimi ve index.html'deki
// eski tarayıcı uyarısı. Betik Vite'ın ayrıştırıcısıyla (parseAst, ESTree) okunur; ES2015 ve
// sonrasının sözdizimi (ok işlevi, şablon metni, let/const, sınıf, yayma, varsayılan değer,
// ayrıştırma, for-of, async, ??, ?.) ve çağrıda sondaki virgül aranır.

import { parseAst } from 'vite'
import { describe, expect, it } from 'vitest'
import cihaz from '../../cihaz.html?raw'
import oyun from '../../index.html?raw'

/** Sayfadaki satır içi, modül olmayan betikler. */
const betikler = (html: string) =>
  [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1] ?? '')

interface Dugum {
  readonly type: string
  readonly [alan: string]: unknown
}

const dugumMu = (x: unknown): x is Dugum =>
  typeof x === 'object' && x !== null && typeof (x as Dugum).type === 'string'

/** ES2015 ve sonrasının düğümleri (ESTree). */
const YENI_DUGUMLER = new Set([
  'ArrowFunctionExpression',
  'TemplateLiteral',
  'TaggedTemplateExpression',
  'ClassDeclaration',
  'ClassExpression',
  'SpreadElement',
  'RestElement',
  'ForOfStatement',
  'ObjectPattern',
  'ArrayPattern',
  'AssignmentPattern',
  'AwaitExpression',
  'YieldExpression',
  'ImportExpression',
  'ChainExpression',
  'MetaProperty',
])

function es5Disi(betik: string): string[] {
  const bulunan: string[] = []
  const bak = (dugum: unknown): void => {
    if (Array.isArray(dugum)) {
      for (const d of dugum) bak(d)
      return
    }
    if (!dugumMu(dugum)) return
    const { type } = dugum
    if (YENI_DUGUMLER.has(type)) bulunan.push(type)
    if (type === 'VariableDeclaration' && dugum.kind !== 'var') bulunan.push(`${dugum.kind}`)
    if (type === 'Property' && (dugum.shorthand || dugum.method || dugum.computed)) {
      bulunan.push('Property')
    }
    if (type === 'LogicalExpression' && dugum.operator === '??') bulunan.push('??')
    if (/Function/.test(type) && (dugum.async || dugum.generator)) bulunan.push(type)
    for (const [alan, deger] of Object.entries(dugum)) {
      if (alan !== 'type') bak(deger)
    }
  }
  bak(parseAst(betik))
  // ESTree sondaki virgülü yazmaz: çağrının kapanışından önceki virgül metinden aranır.
  if (/,\s*\)/.test(betik.replace(/'(?:[^'\\]|\\.)*'|\/\/.*$/gm, "''"))) bulunan.push('sondaki virgül')
  return bulunan
}

describe('eski tarayıcı betikleri ES5', () => {
  it("cihaz.html'in denetimi tek, satır içi bir betiktir; ES5'tir", () => {
    const [betik, ...fazla] = betikler(cihaz)
    expect(fazla).toEqual([])
    expect(betik).toContain("'noModule' in document.createElement('script')")
    expect(es5Disi(betik ?? '')).toEqual([])
    expect(cihaz).not.toMatch(/<script[^>]*type="module"/)
  })

  it("index.html'deki eski tarayıcı uyarısı ES5'tir; cihaz.html'e bağlanır", () => {
    const [betik, ...fazla] = betikler(oyun)
    expect(fazla).toEqual([])
    expect(es5Disi(betik ?? '')).toEqual([])
    expect(oyun).toContain('Bu tarayıcı Morfemusta için çok eski.')
    expect(oyun).toContain('<a href="cihaz.html">')
  })

  it('denetim ES2015 sözdizimini yakalar', () => {
    expect(es5Disi('const a = () => `${b}`; f(a,)')).toEqual([
      'const',
      'ArrowFunctionExpression',
      'TemplateLiteral',
      'sondaki virgül',
    ])
  })
})
