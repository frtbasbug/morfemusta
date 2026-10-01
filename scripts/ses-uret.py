#!/usr/bin/env python3
"""Oyunun seslerini Google Cloud Text-to-Speech'le önceden üretir (CI'da yok; elle çalıştırılır).

Metinleri `node scripts/ses-metinleri.mjs` verir (sesMetinleri ve okunuşları). Her metin tek
bir MP3 dosyasıdır: public/ses/<özet>.mp3; özet, metnin SHA-1'inin ilk 12 onaltılık hanesidir.
Eşleme src/ses/ses-listesi.json'dadır (metin → dosya, okunuş, bölgeler, sürüm). Okunuşu, sesi
ya da hızı değişmeyen metin yeniden üretilmez; listede olmayan eski dosyalar silinir.

Ses: Cloud Text-to-Speech'in Chirp 3: HD sesi, tr-TR-Chirp3-HD-Callirrhoe (REST, v1
text:synthesize). Gemini sesleri kullanılmaz: Gemini API'nin şartları 18 yaş altına yönelik
uygulamalarda kullanımı yasaklıyor; Text-to-Speech Google'ın listesinde üretken yapay zekâ
hizmeti değil, Pre-Trained API'dir. Ses dosyaları kodun MIT lisansının dışındadır (README,
Ayarlar'daki Hakkında).

Anahtar yalnız GOOGLE_TTS_KEY ortam değişkenindedir ve X-Goog-Api-Key başlığıyla gider; hiçbir
dosyaya, kayda ya da çıktıya yazılmaz. Google'a yalnız oyunun kendi metinleri (okunuşları) gider.

Yanıt LINEAR16 (24 kHz) olarak istenir; baştaki ve sondaki sessizlik kısa bir pay bırakılarak
kırpılır, bütün sesler aynı yüksekliğe getirilir, sonra MP3'e çevrilir: mono, 24 kHz, 32 kbit/s
(lameenc; ffmpeg gerekmez). Ses boşsa ya da süresi metnin uzunluğuna göre aşırı kısa ya da
uzunsa yeniden istenir; yine olmazsa sonda listelenir. 429 ve 5xx yanıtlarında beklenip
yeniden denenir.

Ses denetim sayfası (ses.html) için aynı beş cümle iki hızda da üretilir (public/ses/ornek/):
oyunun hızı (0.9) ve olağan (1.0).

Kurulum ve kullanım:

    pip install lameenc
    GOOGLE_TTS_KEY=... python3 scripts/ses-uret.py     # yalnız değişenler
    GOOGLE_TTS_KEY=... python3 scripts/ses-uret.py --hepsi
"""

import argparse
import array
import base64
import hashlib
import json
import math
import os
import subprocess
import sys
import threading
import time
import unicodedata
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

KOK = Path(__file__).resolve().parent.parent
SES_DIZINI = KOK / 'public' / 'ses'
ORNEK_DIZINI = SES_DIZINI / 'ornek'
LISTE = KOK / 'src' / 'ses' / 'ses-listesi.json'

ADRES = 'https://texttospeech.googleapis.com/v1/text:synthesize'
DIL = 'tr-TR'
SES = 'tr-TR-Chirp3-HD-Callirrhoe'
SAGLAYICI = 'Google Cloud Text-to-Speech, Chirp 3: HD'

# speakingRate: 1 olağan, küçüğü yavaş. Oyun çocuk için biraz yavaş konuşur.
YAVAS = 0.9
OLAGAN = 1.0
ORNEKLEME = 24000  # Hz; Chirp 3: HD'nin LINEAR16 çıktısı
BIT_HIZI = 32  # kbit/s

# Sessizlik: 10 ms'lik pencerelerde ortalama genlik bu eşiğin altındaysa sessiz sayılır.
PENCERE = ORNEKLEME // 100
SESSIZLIK_ESIGI = 300  # int16 genliği (yaklaşık -40 dBFS)
PAY = 0.08  # saniye: kırpılan sessizliğin başta ve sonda bırakılan payı
# Yükseklik: konuşulan pencerelerin RMS'i bu düzeye getirilir; tepe -1 dBFS'yi aşmaz.
HEDEF_RMS = 0.1 * 32767  # -20 dBFS
TEPE = 0.89 * 32767  # -1 dBFS

DENEME = 4  # boş, aşırı kısa ya da uzun ses için toplam istek sayısı
AG_DENEMESI = 6  # 429 ve 5xx için
ESZAMANLI = 4

# Ses denetim sayfasındaki örnekler: oyunun beş cümlesi, iki hızda.
ORNEK_CUMLELER = [
    'Bukalemun Koyu',
    'e ince, a kalın. Kalınlıkları uyuşmuyor.',
    'Ek ünlüyle başlayınca p yumuşar: b olur.',
    'İkisi de olur: pıtakım, pıtağım.',
    'Meyvenin üstüne gövde çıkmaz: önce çi.',
]

kilit = threading.Lock()
gonderilen_karakter = 0


def ozet(metin):
    return hashlib.sha1(unicodedata.normalize('NFC', metin).encode('utf-8')).hexdigest()[:12]


def metinleri_al():
    cikti = subprocess.run(
        ['node', 'scripts/ses-metinleri.mjs'], cwd=KOK, check=True, capture_output=True, text=True
    )
    return json.loads(cikti.stdout)


def anahtar():
    deger = os.environ.get('GOOGLE_TTS_KEY', '').strip()
    if not deger:
        sys.exit('GOOGLE_TTS_KEY ortam değişkeni yok.')
    return deger


def istek(okunus, hiz):
    """Tek bir sentez isteği: WAV (LINEAR16) baytları. 429 ve 5xx'te bekleyip yeniden dener."""
    global gonderilen_karakter
    govde = json.dumps(
        {
            'input': {'text': okunus},
            'voice': {'languageCode': DIL, 'name': SES},
            'audioConfig': {
                'audioEncoding': 'LINEAR16',
                'speakingRate': hiz,
                'sampleRateHertz': ORNEKLEME,
            },
        }
    ).encode('utf-8')
    for deneme in range(AG_DENEMESI):
        with kilit:
            gonderilen_karakter += len(okunus)
        talep = urllib.request.Request(
            ADRES,
            data=govde,
            headers={'Content-Type': 'application/json', 'X-Goog-Api-Key': anahtar()},
            method='POST',
        )
        try:
            with urllib.request.urlopen(talep, timeout=60) as yanit:
                return base64.b64decode(json.load(yanit)['audioContent'])
        except urllib.error.HTTPError as hata:
            if hata.code == 429 or hata.code >= 500:
                time.sleep(2 ** (deneme + 1))
                continue
            # Hata iletisi yalnız durumu ve Google'ın açıklamasını içerir; anahtar yazılmaz.
            try:
                aciklama = json.load(hata).get('error', {}).get('message', '')
            except (ValueError, AttributeError):
                aciklama = ''
            sys.exit(f'İstek reddedildi: HTTP {hata.code} {aciklama}')
        except (urllib.error.URLError, TimeoutError):
            time.sleep(2 ** (deneme + 1))
    raise RuntimeError(f'{AG_DENEMESI} denemede yanıt alınamadı: {okunus}')


def wav_ornekleri(wav):
    """WAV'ın data parçası: int16 örnekler (mono, ORNEKLEME Hz olmalı)."""
    if wav[:4] != b'RIFF' or wav[8:12] != b'WAVE':
        raise ValueError('yanıt WAV değil')
    i = 12
    kanal = hiz = None
    while i + 8 <= len(wav):
        ad, boy = wav[i : i + 4], int.from_bytes(wav[i + 4 : i + 8], 'little')
        if ad == b'fmt ':
            kanal = int.from_bytes(wav[i + 10 : i + 12], 'little')
            hiz = int.from_bytes(wav[i + 12 : i + 16], 'little')
        elif ad == b'data':
            if (kanal, hiz) != (1, ORNEKLEME):
                raise ValueError(f'beklenmeyen biçim: {kanal} kanal, {hiz} Hz')
            veri = array.array('h')
            veri.frombytes(wav[i + 8 : i + 8 + boy - boy % 2])
            if sys.byteorder != 'little':
                veri.byteswap()
            return veri
        i += 8 + boy + boy % 2
    raise ValueError('WAV\'da data yok')


def pencere_genlikleri(ornekler):
    return [
        sum(abs(x) for x in ornekler[i : i + PENCERE]) / max(1, len(ornekler[i : i + PENCERE]))
        for i in range(0, len(ornekler), PENCERE)
    ]


def isle(ornekler):
    """Sessizliği kırpar (kısa pay bırakır) ve sesi aynı yüksekliğe getirir. Boşsa None."""
    genlikler = pencere_genlikleri(ornekler)
    sesli = [i for i, g in enumerate(genlikler) if g >= SESSIZLIK_ESIGI]
    if not sesli:
        return None
    pay = int(PAY * ORNEKLEME)
    bas = max(0, sesli[0] * PENCERE - pay)
    son = min(len(ornekler), (sesli[-1] + 1) * PENCERE + pay)
    kirpik = ornekler[bas:son]

    konusulan = [x for i in sesli for x in ornekler[i * PENCERE : (i + 1) * PENCERE]]
    rms = math.sqrt(sum(x * x for x in konusulan) / len(konusulan))
    tepe = max(abs(x) for x in kirpik) or 1
    kazanc = min(HEDEF_RMS / rms, TEPE / tepe)
    return array.array('h', (max(-32768, min(32767, round(x * kazanc))) for x in kirpik))


def beklenen_sure(okunus, hiz):
    """Süre sınırları (saniye): metnin uzunluğuna göre aşırı kısa ya da uzun ses yanlıştır."""
    harf = sum(1 for c in okunus if c.isalpha())
    en_az = max(0.15, 0.03 * harf / hiz)
    en_cok = 1.2 + 0.16 * harf / hiz
    return en_az, en_cok


def mp3(ornekler):
    import lameenc

    kodlayici = lameenc.Encoder()
    kodlayici.set_bit_rate(BIT_HIZI)
    kodlayici.set_in_sample_rate(ORNEKLEME)
    kodlayici.set_channels(1)
    kodlayici.set_quality(2)
    pcm = ornekler.tobytes() if sys.byteorder == 'little' else _ters(ornekler)
    return bytes(kodlayici.encode(pcm) + kodlayici.flush())


def _ters(ornekler):
    kopya = array.array('h', ornekler)
    kopya.byteswap()
    return kopya.tobytes()


def uret(okunus, hiz):
    """MP3 baytları ve sorun (yoksa None). Aşırı kısa, uzun ya da boş ses yeniden istenir."""
    en_az, en_cok = beklenen_sure(okunus, hiz)
    sorun = None
    islenmis = None
    for deneme in range(DENEME):
        # Chirp kısa parçada (pe, lik) ara sıra boş ses verir; sonraki denemelerde sona nokta
        # eklenir (söyleyiş değişmez, yalnız cümle kapanır).
        gonderilen = okunus if deneme == 0 or okunus[-1] in '.!?:' else okunus + '.'
        islenmis = isle(wav_ornekleri(istek(gonderilen, hiz)))
        if islenmis is None:
            sorun = 'boş'
            continue
        sure = len(islenmis) / ORNEKLEME
        if sure < en_az:
            sorun = f'kısa ({sure:.2f} s < {en_az:.2f} s)'
        elif sure > en_cok:
            sorun = f'uzun ({sure:.2f} s > {en_cok:.2f} s)'
        else:
            return mp3(islenmis), None
    if islenmis is None:
        islenmis = array.array('h', [0] * PENCERE)
    return mp3(islenmis), sorun


def main():
    ayrac = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ayrac.add_argument('--hepsi', action='store_true', help='hepsini yeniden üret')
    secenekler = ayrac.parse_args()
    anahtar()

    metinler = metinleri_al()
    eski = json.loads(LISTE.read_text(encoding='utf-8')) if LISTE.exists() else {}
    eski_metinler = eski.get('metinler', {}) if eski.get('ses') == SES else {}
    eski_ornekler = {
        o['dosya']: o for o in eski.get('ornekler', []) if eski.get('ses') == SES
    }
    SES_DIZINI.mkdir(parents=True, exist_ok=True)
    ORNEK_DIZINI.mkdir(parents=True, exist_ok=True)
    okunuslar = {m['metin']: m['okunus'] for m in metinler}

    # İşler: (yol, okunuş, hız, etiket). Değişmeyenler atlanır.
    isler = []
    for kayit in metinler:
        metin, okunus = kayit['metin'], kayit['okunus']
        yol = SES_DIZINI / f'{ozet(metin)}.mp3'
        onceki = eski_metinler.get(metin)
        ayni = (
            not secenekler.hepsi
            and onceki is not None
            and onceki.get('okunus') == okunus
            and onceki.get('hiz') == YAVAS
            and yol.exists()
        )
        if not ayni:
            isler.append((yol, okunus, YAVAS, metin))
    ornek_kayitlari = []
    for hiz, ad in ((YAVAS, 'yavas'), (OLAGAN, 'olagan')):
        for n, cumle in enumerate(ORNEK_CUMLELER, 1):
            dosya = f'ornek/{ad}-{n}.mp3'
            yol = SES_DIZINI / dosya
            onceki = eski_ornekler.get(dosya)
            ayni = (
                not secenekler.hepsi
                and onceki is not None
                and onceki.get('metin') == cumle
                and onceki.get('okunus') == okunuslar[cumle]
                and onceki.get('hiz') == hiz
                and yol.exists()
            )
            if not ayni:
                isler.append((yol, okunuslar[cumle], hiz, f'{cumle} ({hiz})'))
            ornek_kayitlari.append((hiz, ad, cumle, dosya, yol))

    sorunlular = []
    bitti = 0

    def is_yap(is_):
        nonlocal bitti
        yol, okunus, hiz, etiket = is_
        veri, sorun = uret(okunus, hiz)
        yol.write_bytes(veri)
        with kilit:
            bitti += 1
            if sorun:
                sorunlular.append((etiket, sorun))
            print(f'{bitti}/{len(isler)}\t{yol.name}\t{okunus}', file=sys.stderr)

    with ThreadPoolExecutor(ESZAMANLI) as havuz:
        list(havuz.map(is_yap, isler))

    liste = {}
    toplam = 0
    for kayit in metinler:
        metin = kayit['metin']
        dosya = f'{ozet(metin)}.mp3'
        veri = (SES_DIZINI / dosya).read_bytes()
        toplam += len(veri)
        liste[metin] = {
            'dosya': dosya,
            'okunus': kayit['okunus'],
            'hiz': YAVAS,
            'bolgeler': kayit['bolgeler'],
            'boyut': len(veri),
            'surum': hashlib.sha1(veri).hexdigest()[:12],
        }
    ornekler = []
    ornek_toplami = 0
    for hiz, ad, cumle, dosya, yol in ornek_kayitlari:
        veri = yol.read_bytes()
        ornek_toplami += len(veri)
        ornekler.append(
            {
                'hiz': hiz,
                'ad': ad,
                'metin': cumle,
                'okunus': okunuslar[cumle],
                'dosya': dosya,
                'surum': hashlib.sha1(veri).hexdigest()[:12],
            }
        )

    kullanilan = {k['dosya'] for k in liste.values()}
    for eski_dosya in SES_DIZINI.glob('*.mp3'):
        if eski_dosya.name not in kullanilan:
            eski_dosya.unlink()

    LISTE.write_text(
        json.dumps(
            {
                'ses': SES,
                'saglayici': SAGLAYICI,
                'bicim': f'MP3, mono, {ORNEKLEME} Hz, {BIT_HIZI} kbit/s',
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
    once = sum(
        k['boyut'] for k in liste.values() if {'arayuz', 'koy'} & set(k['bolgeler'])
    )
    print(
        f'{len(liste)} ses, toplam {toplam / 1024 / 1024:.2f} MB '
        f'(ön bellekte {once / 1024:.0f} KB); örnekler {ornek_toplami / 1024:.0f} KB; '
        f'{len(isler)} metin üretildi, Google\'a {gonderilen_karakter} karakter gönderildi',
        file=sys.stderr,
    )
    if sorunlular:
        print('\nYeniden denendi, yine şüpheli (ses.html\'de dinlenmeli):', file=sys.stderr)
        for etiket, sorun in sorunlular:
            print(f'  {etiket}\t{sorun}', file=sys.stderr)


if __name__ == '__main__':
    main()
