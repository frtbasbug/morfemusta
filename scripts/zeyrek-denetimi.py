#!/usr/bin/env python3
"""Biçim Denetim Sayfası'ndaki bütün biçimleri zeyrek çözümleyicisiyle sınar.

Biçimler sayfanın kullandığı işlevden (src/denetim/veri.ts) gelir; betik onları
`node scripts/denetim-bicimleri.mjs` ile alır. İki liste yazar:

1. Zeyrek'in hiç çözümleyemediği biçimler.
2. Çözümlenen ama hiçbir çözümlemesi beklenen kök ve ekle eşleşmeyen biçimler: kökü
   sözlükteki kök olan bir ad ([kitap:Noun], [sabah:Noun,Time]; özel ad değil) ve beklenen
   biçimbirim (kitap + ACC için Acc).

Zeyrek'in sözlüğünde eksik olabilir: listedeki bir biçim motorun hatası sayılmaz, motor bu
listeye bakılarak değiştirilmez; biçim elle incelenir. Tersine, boş liste de kanıt değildir:
zeyrek'te eş sesli girdiler var (ör. ünlüsü düşmeyen bir ağız, ikizleşmeyen bir sır); bu
yüzden ağızım ya da sırım gibi yanlış biçimler de çözümlenir. CI'da koşmaz.

Depo kökünde, npm bağımlılıkları kuruluyken:

    pip install zeyrek
    python3 scripts/zeyrek-denetimi.py

NLTK'nin punkt_tab verisi inmezse (vekil sunucu arkasında):

    NLTK_ALLOW_PROXIED_URLOPEN=1 python3 scripts/zeyrek-denetimi.py

Uydurma kök adayları (scripts/uydurma-uret.mjs kullanır): standart girdiden satır satır
kökleri okur, zeyrek'in çözümleyebildiklerini (gerçek kelime ya da gerçek kelime + ek gibi
okunanları) standart çıktıya yazar:

    printf 'gıvak\nkalem\n' | python3 scripts/zeyrek-denetimi.py --adaylar
"""

import csv
import io
import logging
import re
import subprocess
import sys
from pathlib import Path

KOK_DIZINI = Path(__file__).resolve().parent.parent

# Denetim sayfasındaki etiketlerin zeyrek (Zemberek) biçimbirim adları.
ZEYREK_BICIMBIRIMI = {
    'PL': 'A3pl',
    'ACC': 'Acc',
    'DAT': 'Dat',
    'LOC': 'Loc',
    'POSS.1SG': 'P1sg',
    'POSS.3SG': 'P3sg',
    'GEN': 'Gen',
    'PROP': 'With',
}


def bicimleri_al():
    """Denetim sayfasındaki biçimler: [{kok, etiket, bicim}]."""
    cikti = subprocess.run(
        ['node', 'scripts/denetim-bicimleri.mjs'],
        cwd=KOK_DIZINI,
        check=True,
        capture_output=True,
        text=True,
        encoding='utf-8',
    ).stdout
    return list(csv.DictReader(io.StringIO(cikti), delimiter='\t'))


def nltk_verisini_hazirla():
    """Zeyrek kelimeleri NLTK'nin punkt_tab verisiyle ayırır; yoksa indirir."""
    import nltk

    try:
        nltk.data.find('tokenizers/punkt_tab')
    except LookupError:
        try:
            nltk.download('punkt_tab', quiet=True, raise_on_error=True)
        except Exception as hata:
            sys.exit(
                f'NLTK punkt_tab verisi indirilemedi: {hata}\n'
                'Vekil sunucu arkasındaysanız şöyle çalıştırın:\n'
                '  NLTK_ALLOW_PROXIED_URLOPEN=1 python3 scripts/zeyrek-denetimi.py'
            )


# Zeyrek çözümlemesinin başındaki sözlük girdisi: [kitap:Noun], [sabah:Noun,Time], [Kitab:Noun,Prop]
KOK_GIRDISI = re.compile(r'\[([^:\]]+):([^,\]]+)(?:,([^\]]+))?\]')


def kok_girdisi(cozumleme):
    """'[sabah:Noun,Time] sabah:Noun+A3sg+ı:Acc' → ('sabah', 'Noun', 'Time')"""
    eslesme = KOK_GIRDISI.match(cozumleme.formatted)
    return eslesme.groups() if eslesme else (None, None, None)


def beklenen_cozumleme_mi(cozumleme, kok, bicimbirim):
    """Sözlükteki bütün kökler addır; sıfat ya da özel ad girdisiyle eşleşme sayılmaz."""
    lemma, tur, ikincil = kok_girdisi(cozumleme)
    return (
        lemma == kok
        and tur == 'Noun'
        and ikincil != 'Prop'
        and bicimbirim in cozumleme.morphemes
    )


def ozet(cozumleme):
    """[kitap:Noun] kitab:Noun+A3sg+ı:Acc → kitap:Noun+A3sg+Acc"""
    girdi = cozumleme.formatted.split(']')[0].lstrip('[')
    return '+'.join([girdi, *cozumleme.morphemes[1:]])


def zeyrek_hazirla():
    nltk_verisini_hazirla()
    # Zeyrek bulduğu her çözümlemeyi WARNING düzeyinde günlüğe yazar.
    logging.getLogger('zeyrek').setLevel(logging.ERROR)
    import zeyrek

    return zeyrek.MorphAnalyzer()


def adaylari_ele():
    """Standart girdideki köklerden zeyrek'in çözümleyebildiklerini yazar."""
    kokler = [satir.strip() for satir in sys.stdin if satir.strip()]
    cozumleyici = zeyrek_hazirla()
    for kok in kokler:
        cozumlemeler = [c for kelime in cozumleyici.analyze(kok) for c in kelime if c.pos != 'Unk']
        if cozumlemeler:
            print(kok)


def main():
    if '--adaylar' in sys.argv[1:]:
        adaylari_ele()
        return
    satirlar = bicimleri_al()
    nltk_verisini_hazirla()

    # Zeyrek bulduğu her çözümlemeyi WARNING düzeyinde günlüğe yazar.
    logging.getLogger('zeyrek').setLevel(logging.ERROR)
    import zeyrek

    cozumleyici = zeyrek.MorphAnalyzer()
    cozulemeyen = []
    eslesmeyen = []
    for satir in satirlar:
        cozumlemeler = [
            c
            for kelime in cozumleyici.analyze(satir['bicim'])
            for c in kelime
            if c.pos != 'Unk'
        ]
        if not cozumlemeler:
            cozulemeyen.append(satir)
            continue
        bicimbirim = ZEYREK_BICIMBIRIMI[satir['etiket']]
        if not any(beklenen_cozumleme_mi(c, satir['kok'], bicimbirim) for c in cozumlemeler):
            eslesmeyen.append((satir, cozumlemeler))

    kok_sayisi = len({s['kok'] for s in satirlar})
    print(f'Zeyrek denetimi: {kok_sayisi} kök, {len(satirlar)} biçim')
    print(f'Çözümlenen: {len(satirlar) - len(cozulemeyen)} / {len(satirlar)}')
    print()
    print(f'1. Çözümlenemeyen biçimler ({len(cozulemeyen)}):')
    for s in cozulemeyen:
        print(f'   {s["kok"]:<12} {s["etiket"]:<9} {s["bicim"]}')
    print()
    print(f'2. Çözümlenen ama beklenen kök ve ekle eşleşmeyen biçimler ({len(eslesmeyen)}):')
    for s, cozumlemeler in eslesmeyen:
        bulunan = ', '.join(sorted({ozet(c) for c in cozumlemeler}))
        print(f'   {s["kok"]:<12} {s["etiket"]:<9} {s["bicim"]:<14} zeyrek: {bulunan}')


if __name__ == '__main__':
    main()
