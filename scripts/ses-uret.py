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

Hız 0.9'dur (biraz yavaş; kullanıcının seçimi, Oturum 11).

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
LISTE = KOK / 'src' / 'ses' / 'ses-listesi.json'

ADRES = 'https://texttospeech.googleapis.com/v1/text:synthesize'
DIL = 'tr-TR'
SES = 'tr-TR-Chirp3-HD-Callirrhoe'
SAGLAYICI = 'Google Cloud Text-to-Speech, Chirp 3: HD'

# speakingRate: 1 olağan, küçüğü yavaş. Oyun çocuk için biraz yavaş konuşur.
YAVAS = 0.9
ORNEKLEME = 24000  # Hz; Chirp 3: HD'nin LINEAR16 çıktısı
BIT_HIZI = 32  # kbit/s

# Boş ses: hiçbir 10 ms'lik pencerenin ortalama genliği bu eşiğe varmıyorsa ses boştur.
PENCERE = ORNEKLEME // 100
SESSIZLIK_ESIGI = 300  # int16 genliği (yaklaşık -40 dBFS)
PAY = 0.08  # saniye: kırpılan sessizliğin başta ve sonda bırakılan payı
# İç sessizlik: 10 ms'lik pencerenin RMS'i sesin tepesinin 35 dB altındaysa sessizdir. 0.5 sn'den
# uzun iç sessizlik 0.5 sn'ye indirilir (uyum cümlelerinde Chirp 0.8–1.9 sn duruyordu).
GORECE_ESIK_DB = 35
IC_SESSIZLIK = 0.5  # saniye: iç sessizliğin en uzun hâli (kısaltma)
# Denetim: bunları geçen ses hatadır (üreteç durur).
EN_COK_KENAR = 0.3  # saniye: baştaki ya da sondaki sessizlik
EN_COK_IC = 0.6  # saniye: iç sessizlik
# Yükseklik: konuşulan pencerelerin RMS'i bu düzeye getirilir; tepe -1 dBFS'yi aşmaz.
HEDEF_RMS = 0.1 * 32767  # -20 dBFS
TEPE = 0.89 * 32767  # -1 dBFS

DENEME = 4  # boş, aşırı kısa ya da uzun ses için toplam istek sayısı
AG_DENEMESI = 6  # 429 ve 5xx için
ESZAMANLI = 4

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


def girdi(okunus, sozcukler):
    """İsteğin input alanı: metin ve (varsa) sözcüklerin IPA okunuşu (customPronunciations)."""
    alan = {'text': okunus}
    if sozcukler:
        alan['customPronunciations'] = {
            'pronunciations': [
                {
                    'phrase': s['sozcuk'],
                    'phoneticEncoding': 'PHONETIC_ENCODING_IPA',
                    'pronunciation': s['ipa'],
                }
                for s in sozcukler
            ]
        }
    return alan


def istek(okunus, hiz, sozcukler=()):
    """Tek bir sentez isteği: WAV (LINEAR16) baytları. 429 ve 5xx'te bekleyip yeniden dener."""
    global gonderilen_karakter
    govde = json.dumps(
        {
            'input': girdi(okunus, sozcukler),
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


def sessiz_pencereler(ornekler):
    """Her 10 ms'lik pencere sessiz mi: RMS'i sesin tepesinin GORECE_ESIK_DB altında."""
    tepe = max((abs(x) for x in ornekler), default=0)
    esik = tepe * 10 ** (-GORECE_ESIK_DB / 20)
    sonuc = []
    for i in range(0, len(ornekler), PENCERE):
        parca = ornekler[i : i + PENCERE]
        rms = math.sqrt(sum(x * x for x in parca) / len(parca))
        sonuc.append(rms < esik)
    return sonuc


def sessizlikler(ornekler):
    """Baştaki, sondaki ve en uzun iç sessizlik (saniye)."""
    sessiz = sessiz_pencereler(ornekler)
    if all(sessiz):
        sure = len(ornekler) / ORNEKLEME
        return sure, sure, 0.0
    ilk = sessiz.index(False)
    son = len(sessiz) - 1 - sessiz[::-1].index(False)
    en_uzun = dizi = 0
    for s in sessiz[ilk : son + 1]:
        dizi = dizi + 1 if s else 0
        en_uzun = max(en_uzun, dizi)
    pencere = PENCERE / ORNEKLEME
    return ilk * pencere, (len(sessiz) - 1 - son) * pencere, en_uzun * pencere


def ic_sessizligi_kisalt(ornekler):
    """IC_SESSIZLIK'ten uzun her iç sessizliği IC_SESSIZLIK'e indirir (ortasından keser)."""
    sessiz = sessiz_pencereler(ornekler)
    if all(sessiz):
        return ornekler
    ilk = sessiz.index(False)
    son = len(sessiz) - 1 - sessiz[::-1].index(False)
    en_cok = round(IC_SESSIZLIK * ORNEKLEME / PENCERE)
    atilacak = set()
    i = ilk
    while i <= son:
        if not sessiz[i]:
            i += 1
            continue
        j = i
        while j <= son and sessiz[j]:
            j += 1
        uzunluk = j - i
        if uzunluk > en_cok:
            # Sessizliğin iki ucu kalır (sesin sönüşü ve başlayışı), ortası atılır.
            yarim = en_cok // 2
            atilacak.update(range(i + yarim, j - (en_cok - yarim)))
        i = j
    if not atilacak:
        return ornekler
    sonuc = array.array('h')
    for k in range(len(sessiz)):
        if k not in atilacak:
            sonuc.extend(ornekler[k * PENCERE : (k + 1) * PENCERE])
    return sonuc


def sessizlik_sorunu(ornekler):
    """Denetim: kenar sessizliği EN_COK_KENAR'ı, iç sessizlik EN_COK_IC'yi geçerse sorun."""
    bas, son, ic = sessizlikler(ornekler)
    if bas > EN_COK_KENAR or son > EN_COK_KENAR:
        return f'kenar sessizliği uzun (baş {bas:.2f} s, son {son:.2f} s)'
    if ic > EN_COK_IC:
        return f'iç sessizlik uzun ({ic:.2f} s)'
    return None


def isle(ornekler):
    """Sessizliği kırpar (kısa pay bırakır), uzun iç sessizliği kısaltır, sesi aynı yüksekliğe
    getirir. Boşsa None."""
    # Hiçbir pencere SESSIZLIK_ESIGI'ne varmıyorsa ses boştur. Kırpma göreli eşikle yapılır
    # (tepenin 35 dB altı): denetim de aynı ölçüyle bakar.
    if max(pencere_genlikleri(ornekler), default=0) < SESSIZLIK_ESIGI:
        return None
    sesli = [i for i, s in enumerate(sessiz_pencereler(ornekler)) if not s]
    pay = int(PAY * ORNEKLEME)
    bas = max(0, sesli[0] * PENCERE - pay)
    son = min(len(ornekler), (sesli[-1] + 1) * PENCERE + pay)
    kirpik = ic_sessizligi_kisalt(ornekler[bas:son])

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
    # Çıkış hızı açıkça verilir: verilmezse LAME 32 kbit/s'de 22.05 kHz'e indirir.
    kodlayici.set_out_sample_rate(ORNEKLEME)
    kodlayici.set_channels(1)
    kodlayici.set_quality(2)
    pcm = ornekler.tobytes() if sys.byteorder == 'little' else _ters(ornekler)
    return bytes(kodlayici.encode(pcm) + kodlayici.flush())


MP3_HIZLARI = {3: (44100, 48000, 32000), 2: (22050, 24000, 16000), 0: (11025, 12000, 8000)}


def mp3_ornekleme(veri):
    """MP3'ün ilk çerçeve başlığındaki örnekleme hızı (Hz)."""
    i = 0
    if veri[:3] == b'ID3':
        i = 10 + ((veri[6] << 21) | (veri[7] << 14) | (veri[8] << 7) | veri[9])
    while i + 3 < len(veri) and not (veri[i] == 0xFF and veri[i + 1] & 0xE0 == 0xE0):
        i += 1
    if i + 3 >= len(veri):
        raise ValueError('MP3 çerçevesi yok')
    return MP3_HIZLARI[(veri[i + 1] >> 3) & 3][(veri[i + 2] >> 2) & 3]


def _ters(ornekler):
    kopya = array.array('h', ornekler)
    kopya.byteswap()
    return kopya.tobytes()


def uret(okunus, hiz, sozcukler=()):
    """MP3 baytları ve sorun (yoksa None). Aşırı kısa, uzun ya da boş ses yeniden istenir."""
    en_az, en_cok = beklenen_sure(okunus, hiz)
    sorun = None
    sessizlik = None
    islenmis = None
    for deneme in range(DENEME):
        # Chirp kısa parçada (pe, lik) ara sıra boş ses verir; sonraki denemelerde sona nokta
        # eklenir (söyleyiş değişmez, yalnız cümle kapanır).
        gonderilen = okunus if deneme == 0 or okunus[-1] in '.!?:' else okunus + '.'
        islenmis = isle(wav_ornekleri(istek(gonderilen, hiz, sozcukler)))
        if islenmis is None:
            sorun = 'boş'
            continue
        sure = len(islenmis) / ORNEKLEME
        sessizlik = sessizlik_sorunu(islenmis)
        if sessizlik:
            sorun = sessizlik
        elif sure < en_az:
            sorun = f'kısa ({sure:.2f} s < {en_az:.2f} s)'
        elif sure > en_cok:
            sorun = f'uzun ({sure:.2f} s > {en_cok:.2f} s)'
        else:
            return mp3(islenmis), None
    if sessizlik:
        raise SessizlikHatasi(f'{okunus}: {sessizlik}')
    if islenmis is None:
        islenmis = array.array('h', [0] * PENCERE)
    return mp3(islenmis), sorun


class SessizlikHatasi(Exception):
    """Denetimi geçemeyen ses: üreteç durur, dosya yazılmaz."""


def main():
    ayrac = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ayrac.add_argument('--hepsi', action='store_true', help='hepsini yeniden üret')
    ayrac.add_argument(
        '--yeniden',
        metavar='DOSYA',
        help='yalnız bu dosyadaki ses dosyalarını yeniden üret (satır satır: abc123.mp3); '
        'ötekiler değişmez. Listede olmayan bayat ses varsa hiç istek gitmeden durur',
    )
    secenekler = ayrac.parse_args()
    anahtar()
    yeniden = set()
    if secenekler.yeniden:
        yeniden = {
            satir.strip()
            for satir in Path(secenekler.yeniden).read_text(encoding='utf-8').splitlines()
            if satir.strip()
        }

    metinler = metinleri_al()
    eski = json.loads(LISTE.read_text(encoding='utf-8')) if LISTE.exists() else {}
    eski_metinler = eski.get('metinler', {}) if eski.get('ses') == SES else {}
    SES_DIZINI.mkdir(parents=True, exist_ok=True)

    # İşler: (yol, okunuş, hız, etiket, sözcükler). Değişmeyenler atlanır: sesin kimliği okunuş,
    # ses, hız ve okunuşta geçen sözcüklerin IPA'sıdır (icerik/ses-sozcuk.csv). --yeniden verilince yalnız
    # listedekiler üretilir; listede olmayan bayat ses varsa hiç istek gitmeden durulur.
    isler = []
    bayatlar = []
    for kayit in metinler:
        metin, okunus = kayit['metin'], kayit['okunus']
        sozcukler = kayit.get('sozcukler', [])
        yol = SES_DIZINI / f'{ozet(metin)}.mp3'
        onceki = eski_metinler.get(metin)
        ayni = (
            not secenekler.hepsi
            and onceki is not None
            and onceki.get('okunus') == okunus
            and onceki.get('sozcukler', []) == sozcukler
            and onceki.get('hiz') == YAVAS
            and yol.exists()
        )
        if yeniden and not ayni and yol.name not in yeniden:
            bayatlar.append(f'{yol.name}\t{metin}')
        elif not ayni or yol.name in yeniden:
            isler.append((yol, okunus, YAVAS, metin, sozcukler))

    if bayatlar:
        sys.exit(
            '--yeniden ile durdu: listede olmayan bu sesler de güncel değil (okunuş, ses ya da '
            'hız değişti ya da dosya yok). Önce --yeniden olmadan çalıştırın ya da listeye '
            'ekleyin:\n  ' + '\n  '.join(bayatlar)
        )

    sorunlular = []
    hatalar = []
    basarisiz = set()  # denetimi geçemeyen işlerin yolu: listede eski kaydı kalır
    bitti = 0

    def is_yap(is_):
        nonlocal bitti
        yol, okunus, hiz, etiket, sozcukler = is_
        try:
            veri, sorun = uret(okunus, hiz, sozcukler)
        except SessizlikHatasi as hata:
            with kilit:
                hatalar.append((etiket, str(hata)))
                basarisiz.add(yol)
            return
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
        if SES_DIZINI / dosya in basarisiz:
            # Denetimi geçemeyen ses: eski kaydı (eski okunuşu, sürümü) kalır, sonraki
            # çalıştırmada yine bayat sayılır. Eski kaydı yoksa listeye girmez.
            if metin in eski_metinler:
                liste[metin] = eski_metinler[metin]
                toplam += eski_metinler[metin].get('boyut', 0)
            continue
        veri = (SES_DIZINI / dosya).read_bytes()
        toplam += len(veri)
        liste[metin] = {
            'dosya': dosya,
            'okunus': kayit['okunus'],
            # Yalnız sözcük tablosundan bir sözcük geçiyorsa yazılır.
            **({'sozcukler': kayit['sozcukler']} if kayit.get('sozcukler') else {}),
            'hiz': YAVAS,
            'bolgeler': kayit['bolgeler'],
            'boyut': len(veri),
            'surum': hashlib.sha1(veri).hexdigest()[:12],
        }

    # Biçim dosyalardan okunur: kodlayıcı hızı değiştirirse liste yalan söylemez.
    hizlar = {mp3_ornekleme((SES_DIZINI / k['dosya']).read_bytes()) for k in liste.values()}
    if hizlar != {ORNEKLEME}:
        sys.exit(f'MP3 örnekleme hızı beklenen değil: {sorted(hizlar)} (beklenen {ORNEKLEME})')

    kullanilan = {k['dosya'] for k in liste.values()}
    for eski_dosya in SES_DIZINI.glob('*.mp3'):
        if eski_dosya.name not in kullanilan:
            eski_dosya.unlink()

    LISTE.write_text(
        json.dumps(
            {
                'ses': SES,
                'saglayici': SAGLAYICI,
                'bicim': f'MP3, mono, {hizlar.pop()} Hz, {BIT_HIZI} kbit/s',
                'hiz': YAVAS,
                'metinler': dict(sorted(liste.items())),
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
        f'(ön bellekte {once / 1024:.0f} KB); '
        f'{len(isler)} metin üretildi, Google\'a {gonderilen_karakter} karakter gönderildi',
        file=sys.stderr,
    )
    if hatalar:
        print('\nSessizlik denetimini geçemedi (dosya yazılmadı):', file=sys.stderr)
        for etiket, hata in hatalar:
            print(f'  {etiket}\t{hata}', file=sys.stderr)
    if sorunlular:
        print('\nYeniden denendi, yine şüpheli (ses.html\'de dinlenmeli):', file=sys.stderr)
        for etiket, sorun in sorunlular:
            print(f'  {etiket}\t{sorun}', file=sys.stderr)
    if hatalar:
        sys.exit(1)


if __name__ == '__main__':
    main()
