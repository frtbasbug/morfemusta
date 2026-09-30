#!/usr/bin/env python3
"""Oyunun seslerini Piper'la önceden üretir (CI'da yok; elle çalıştırılır).

Metinleri `node scripts/ses-metinleri.mjs` verir (sesMetinleri ve okunuşları). Her metin tek
bir MP3 dosyasıdır: public/ses/<özet>.mp3; özet, metnin SHA-1'inin ilk 12 onaltılık hanesidir.
Eşleme src/ses/ses-listesi.json'dadır (metin → dosya, okunuş, bölgeler, sürüm). Okunuşu, sesi
ya da hızı değişmeyen metin yeniden üretilmez; listede olmayan eski dosyalar silinir.

Ses: Piper'ın tr_TR-dfki-medium sesi (rhasspy/piper-voices). Lisansı CC BY-NC-SA 4.0'dır
(veri kümesi: github.com/marytts/dfki-ot-data); ses dosyaları kodun MIT lisansından ayrı, aynı
lisansla yayımlanır (README, Ayarlar'daki Hakkında). Biçim: MP3, mono, 22.05 kHz, 32 kbit/s:
iOS Safari dahil her tarayıcıda çalar, konuşmaya yeter.

Ses denetim sayfası (ses.html) için aynı beş cümle iki hızda da üretilir (public/ses/ornek/):
biraz yavaş (oyunun hızı) ve olağan.

Kurulum ve kullanım:

    pip install piper-tts lameenc
    python3 scripts/ses-uret.py                 # model .piper/ altına iner (huggingface.co)
    python3 scripts/ses-uret.py --hepsi         # hepsini yeniden üret
    python3 scripts/ses-uret.py --model yol/tr_TR-dfki-medium.onnx
"""

import argparse
import hashlib
import json
import subprocess
import sys
import unicodedata
import urllib.request
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
SES_DIZINI = KOK / 'public' / 'ses'
ORNEK_DIZINI = SES_DIZINI / 'ornek'
LISTE = KOK / 'src' / 'ses' / 'ses-listesi.json'
MODEL_DIZINI = KOK / '.piper'

SES = 'tr_TR-dfki-medium'
MODEL_ADRESI = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/'
LISANS = 'CC BY-NC-SA 4.0'

# Piper'ın length_scale'i: 1 olağan, büyüğü yavaş. Oyun çocuk için biraz yavaş konuşur.
YAVAS = 1.2
OLAGAN = 1.0
BIT_HIZI = 32  # kbit/s

# Ses denetim sayfasındaki örnekler: oyunun beş cümlesi, iki hızda.
ORNEK_CUMLELER = [
    'Bukalemun Koyu',
    'e ince, a kalın. Kalınlıkları uyuşmuyor.',
    'p ünlüden önce jöle olur: b.',
    'İkisi de olur: pıtakım, pıtağım.',
    'Meyvenin üstüne gövde çıkmaz: önce çi.',
]


def ozet(metin):
    return hashlib.sha1(unicodedata.normalize('NFC', metin).encode('utf-8')).hexdigest()[:12]


def metinleri_al():
    cikti = subprocess.run(
        ['node', 'scripts/ses-metinleri.mjs'], cwd=KOK, check=True, capture_output=True, text=True
    )
    return json.loads(cikti.stdout)


def okunus_al(metinler):
    """Örnek cümlelerin okunuşu: oyunun okunuşuyla aynı (ses-metinleri.mjs)."""
    return {m['metin']: m['okunus'] for m in metinler}


def modeli_hazirla(yol):
    if yol:
        return Path(yol)
    MODEL_DIZINI.mkdir(exist_ok=True)
    for ad in (f'{SES}.onnx', f'{SES}.onnx.json', 'MODEL_CARD'):
        hedef = MODEL_DIZINI / ad
        if not hedef.exists():
            print(f'indiriliyor: {ad}', file=sys.stderr)
            urllib.request.urlretrieve(MODEL_ADRESI + ad, hedef)
    kart = (MODEL_DIZINI / 'MODEL_CARD').read_text(encoding='utf-8')
    # Kart lisansı bağlantıyla yazar: creativecommons.org/licenses/by-nc-sa/4.0/
    if 'licenses/by-nc-sa/4.0' not in kart:
        sys.exit(f'MODEL_CARD beklenen lisansı ({LISANS}) yazmıyor; dur ve incele:\n{kart}')
    return MODEL_DIZINI / f'{SES}.onnx'


class Uretec:
    def __init__(self, model):
        from piper import PiperVoice

        self.ses = PiperVoice.load(model)
        self.ornekleme = self.ses.config.sample_rate

    def mp3(self, okunus, hiz):
        import lameenc
        from piper import SynthesisConfig

        pcm = b''.join(
            parca.audio_int16_bytes
            for parca in self.ses.synthesize(okunus, syn_config=SynthesisConfig(length_scale=hiz))
        )
        kodlayici = lameenc.Encoder()
        kodlayici.set_bit_rate(BIT_HIZI)
        kodlayici.set_in_sample_rate(self.ornekleme)
        kodlayici.set_channels(1)
        kodlayici.set_quality(2)
        return bytes(kodlayici.encode(pcm) + kodlayici.flush())


def main():
    ayrac = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ayrac.add_argument('--model', help='Piper modeli (.onnx); verilmezse .piper/ altına iner')
    ayrac.add_argument('--hepsi', action='store_true', help='hepsini yeniden üret')
    secenekler = ayrac.parse_args()

    metinler = metinleri_al()
    eski = json.loads(LISTE.read_text(encoding='utf-8')) if LISTE.exists() else {}
    eski_metinler = eski.get('metinler', {}) if eski.get('ses') == SES else {}
    uretec = Uretec(modeli_hazirla(secenekler.model))
    SES_DIZINI.mkdir(parents=True, exist_ok=True)
    ORNEK_DIZINI.mkdir(parents=True, exist_ok=True)

    liste = {}
    toplam = 0
    for i, kayit in enumerate(metinler, 1):
        metin, okunus = kayit['metin'], kayit['okunus']
        dosya = f'{ozet(metin)}.mp3'
        yol = SES_DIZINI / dosya
        onceki = eski_metinler.get(metin)
        ayni = (
            not secenekler.hepsi
            and onceki is not None
            and onceki.get('okunus') == okunus
            and onceki.get('hiz') == YAVAS
            and yol.exists()
        )
        if not ayni:
            yol.write_bytes(uretec.mp3(okunus, YAVAS))
            print(f'{i}/{len(metinler)}\t{dosya}\t{okunus}', file=sys.stderr)
        veri = yol.read_bytes()
        toplam += len(veri)
        liste[metin] = {
            'dosya': dosya,
            'okunus': okunus,
            'hiz': YAVAS,
            'bolgeler': kayit['bolgeler'],
            'boyut': len(veri),
            'surum': hashlib.sha1(veri).hexdigest()[:12],
        }

    okunuslar = okunus_al(metinler)
    ornekler = []
    for hiz, ad in ((YAVAS, 'yavas'), (OLAGAN, 'olagan')):
        for n, cumle in enumerate(ORNEK_CUMLELER, 1):
            dosya = f'ornek/{ad}-{n}.mp3'
            yol = SES_DIZINI / dosya
            if secenekler.hepsi or not yol.exists():
                yol.write_bytes(uretec.mp3(okunuslar[cumle], hiz))
            ornekler.append({'hiz': hiz, 'ad': ad, 'metin': cumle, 'dosya': dosya})

    kullanilan = {k['dosya'] for k in liste.values()}
    for eski_dosya in SES_DIZINI.glob('*.mp3'):
        if eski_dosya.name not in kullanilan:
            eski_dosya.unlink()

    LISTE.write_text(
        json.dumps(
            {
                'ses': SES,
                'lisans': LISANS,
                'bicim': f'MP3, mono, {uretec.ornekleme} Hz, {BIT_HIZI} kbit/s',
                'hizlar': {'yavas': YAVAS, 'olagan': OLAGAN},
                'metinler': dict(sorted(liste.items())),
                'ornekler': ornekler,
            },
            ensure_ascii=False,
            indent=1,
        )
        + '\n',
        encoding='utf-8',
    )
    print(f'{len(liste)} ses, toplam {toplam / 1024 / 1024:.2f} MB', file=sys.stderr)


if __name__ == '__main__':
    main()
