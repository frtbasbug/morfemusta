// Biçim Denetim Sayfası: sözlükteki her kök, işaretleri ve motorun ürettiği sekiz biçim.
// Oyundan bağlantı almaz; dilbilimci ve geliştirici için ayrı bir giriş sayfasıdır
// (denetim.html). Telefonda her kök bir kart olur, geniş ekranda tablo.
//
// Tablo öğelerinin görünümü CSS ile değiştiği için (kartlar) tablo anlamı rol
// öznitelikleriyle de yazılır; ekran okuyucu bazı tarayıcılarda aksi hâlde tabloyu kaybeder.

import { EK_ENVANTERI } from '../motor/index.ts'
import './DenetimSayfasi.css'
import { DENETIM_ETIKETLERI, denetimSatirlari, type DenetimSatiri } from './veri.ts'

const SUTUN_SAYISI = DENETIM_ETIKETLERI.length + 2

/** Satırları kategorilere ayırır; kategoriler ve satırlar sözlükteki sırasını korur. */
function kategorilereAyir(satirlar: readonly DenetimSatiri[]): [string, DenetimSatiri[]][] {
  const kategoriler = new Map<string, DenetimSatiri[]>()
  for (const satir of satirlar) {
    const { kategori } = satir.girdi
    kategoriler.set(kategori, [...(kategoriler.get(kategori) ?? []), satir])
  }
  return [...kategoriler]
}

export default function DenetimSayfasi({
  satirlar = denetimSatirlari(),
}: {
  satirlar?: readonly DenetimSatiri[]
}) {
  const kategoriler = kategorilereAyir(satirlar)
  const bicimSayisi = satirlar.length * DENETIM_ETIKETLERI.length

  return (
    <main className="denetim">
      <header className="denetim__ust">
        <h1 className="denetim__baslik">Biçim Denetimi</h1>
        <p>
          Sözlükteki {satirlar.length} kök, sekiz ekle: motorun ürettiği {bicimSayisi} biçim.
        </p>
        <p className="denetim__not">
          İşaretler <code>icerik/kokler.csv</code>’den: <em>yumuşar</em>, <em>yumuşamaz</em>{' '}
          (yumusama); <em>ünlü düşer</em> (unlu_dusmesi); <em>ince ek</em>, <em>ikiz</em>,{' '}
          <em>su</em> (istisna).
        </p>
        <nav aria-label="Kategoriler">
          <ul className="denetim__kategoriler">
            {kategoriler.map(([kategori]) => (
              <li key={kategori}>
                <a href={`#kategori-${kategori}`}>{kategori}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <table className="denetim__tablo" role="table">
        <thead className="denetim__tablo-basi" role="rowgroup">
          <tr role="row">
            <th scope="col" role="columnheader">
              Kök
            </th>
            <th scope="col" role="columnheader">
              İşaretler
            </th>
            {DENETIM_ETIKETLERI.map((etiket) => (
              <th key={etiket} scope="col" role="columnheader">
                {etiket}
                <span className="denetim__sablon">{EK_ENVANTERI.get(etiket)?.sablon}</span>
              </th>
            ))}
          </tr>
        </thead>
        {kategoriler.map(([kategori, kategoriSatirlari]) => (
          <tbody key={kategori} id={`kategori-${kategori}`} role="rowgroup">
            <tr className="denetim__kategori" role="row">
              <th colSpan={SUTUN_SAYISI} scope="rowgroup" role="rowheader">
                <h2>{kategori}</h2>
              </th>
            </tr>
            {kategoriSatirlari.map(({ girdi, isaretler, bicimler }) => (
              <tr key={girdi.kok} className="denetim__satir" role="row" data-kok={girdi.kok}>
                <th className="denetim__kok" scope="row" role="rowheader">
                  {girdi.kok}
                </th>
                <td className="denetim__isaretler" role="cell">
                  {isaretler.map((isaret) => (
                    <span key={isaret} className="denetim__isaret">
                      {isaret}
                    </span>
                  ))}
                </td>
                {bicimler.map(({ etiket, bicim }) => (
                  <td key={etiket} className="denetim__bicim" role="cell" data-etiket={etiket}>
                    {/* Kartta etiket biçimin üstünde görünür; ekran okuyucu onu sütun
                        başlığından okur. */}
                    <span className="denetim__hucre-etiketi" aria-hidden="true">
                      {etiket}
                    </span>
                    <span className="denetim__bicim-metni">{bicim}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </main>
  )
}
