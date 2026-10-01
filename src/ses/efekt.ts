// Kısa ses efektleri (DESIGN.md, "Ses ve resim"): tarayıcıda Web Audio ile üretilir; ses dosyası
// ve lisansı yoktur, hiçbir şey cihazdan çıkmaz.
//
//   dogru   kısa, yükselen iki nota
//   yanlis  yumuşak, alçak bir ses; cezalandırıcı değil
//   buyu    kısa bir parıltı: çoğalma, cebe girme, halka, yıldız
//
// Her biri 400 ms'den kısadır ve konuşmadan kısıktır (sesler -20 dBFS'ye getirilir; efektlerin en
// yüksek 50 ms'si onun yarısının altında). Efekt konuşmayı kesmez: <audio> öğesine dokunmaz, Web
// Audio'nun kendi çıkışında çalar. Ayara uyması (Kapalı'da hiçbir şey) Ses.tsx'tedir.
//
// Notalar saf veridir: tarayıcı onları osilatörle çalar (efektCal), birim testleri aynı tabloyu
// örnekleyip süresini ve yüksekliğini ölçer (ornekle).

export type EfektTuru = 'dogru' | 'yanlis' | 'buyu'

export interface Nota {
  /** Hz. */
  readonly frekans: number
  /** Efektin başından (saniye). */
  readonly baslangic: number
  /** Saniye: yükseliş ve sönüş dahil. */
  readonly sure: number
  /** Tepe genliği (0–1). */
  readonly kazanc: number
  /** Yükseliş süresi (saniye); sonra üstel sönüş. */
  readonly yukselis: number
  readonly dalga: 'sine' | 'triangle'
}

export const EFEKTLER: Readonly<Record<EfektTuru, readonly Nota[]>> = {
  // Yükselen dörtlü: G5 → C6.
  dogru: [
    { frekans: 783.99, baslangic: 0, sure: 0.14, kazanc: 0.1, yukselis: 0.008, dalga: 'triangle' },
    { frekans: 1046.5, baslangic: 0.1, sure: 0.22, kazanc: 0.1, yukselis: 0.008, dalga: 'triangle' },
  ],
  // Yumuşak ve alçak bir "tunk": A3, yavaş yükselir, kısa söner.
  yanlis: [
    { frekans: 220, baslangic: 0, sure: 0.26, kazanc: 0.08, yukselis: 0.035, dalga: 'triangle' },
  ],
  // Parıltı: yüksek, hızlı bir arpej (C6 E6 G6 C7).
  buyu: [
    { frekans: 1046.5, baslangic: 0, sure: 0.16, kazanc: 0.04, yukselis: 0.004, dalga: 'sine' },
    { frekans: 1318.51, baslangic: 0.045, sure: 0.16, kazanc: 0.04, yukselis: 0.004, dalga: 'sine' },
    { frekans: 1567.98, baslangic: 0.09, sure: 0.16, kazanc: 0.04, yukselis: 0.004, dalga: 'sine' },
    { frekans: 2093, baslangic: 0.135, sure: 0.2, kazanc: 0.04, yukselis: 0.004, dalga: 'sine' },
  ],
}

/** Sönüşün vardığı genlik: üstel sönüş sıfıra inemez. */
const SESSIZ = 0.0001

/** Efektin süresi (saniye): son notanın bittiği an. */
export const efektSuresi = (tur: EfektTuru): number =>
  Math.max(...EFEKTLER[tur].map((n) => n.baslangic + n.sure))

/** Notanın t anındaki (başından saniye) genliği: doğrusal yükseliş, üstel sönüş. */
function zarf(nota: Nota, t: number): number {
  if (t < 0 || t > nota.sure) return 0
  if (t < nota.yukselis) return (nota.kazanc * t) / nota.yukselis
  const oran = (t - nota.yukselis) / (nota.sure - nota.yukselis)
  return nota.kazanc * (SESSIZ / nota.kazanc) ** oran
}

function dalga(tur: Nota['dalga'], evre: number): number {
  if (tur === 'sine') return Math.sin(2 * Math.PI * evre)
  // Üçgen: -1 ile 1 arasında.
  const kesir = evre - Math.floor(evre)
  return 1 - 4 * Math.abs(kesir - 0.5)
}

/**
 * Efektin örnekleri (birim testleri için): tarayıcının çaldığıyla aynı notalar, aynı zarf.
 * Örnekleme hızı Hz.
 */
export function ornekle(tur: EfektTuru, hiz = 24000): Float32Array {
  const notalar = EFEKTLER[tur]
  const ornekler = new Float32Array(Math.ceil(efektSuresi(tur) * hiz))
  for (let i = 0; i < ornekler.length; i++) {
    const t = i / hiz
    let toplam = 0
    for (const nota of notalar) {
      const yerel = t - nota.baslangic
      toplam += zarf(nota, yerel) * dalga(nota.dalga, nota.frekans * yerel)
    }
    ornekler[i] = toplam
  }
  return ornekler
}

/** Web Audio'nun kullanılan parçası (testte sahtesi verilir). */
export interface SesBaglami {
  readonly currentTime: number
  readonly state: string
  readonly destination: unknown
  resume(): Promise<void>
  createOscillator(): {
    type: string
    readonly frequency: { value: number }
    connect(hedef: unknown): unknown
    start(an: number): void
    stop(an: number): void
  }
  createGain(): {
    readonly gain: {
      setValueAtTime(deger: number, an: number): unknown
      linearRampToValueAtTime(deger: number, an: number): unknown
      exponentialRampToValueAtTime(deger: number, an: number): unknown
    }
    connect(hedef: unknown): unknown
  }
}

let baglam: SesBaglami | null = null
/** Ses ayarı Kapalı değilse true (Ses.tsx): Kapalı'da Web Audio hiç açılmaz. */
let izinli = false

/** Ses ayarı değişince (SesSaglayici): Kapalı'da efekt çalmaz, Web Audio açılmaz. */
export function efektlereIzinVer(izin: boolean): void {
  izinli = izin
}

/** Tarayıcının AudioContext'i (Safari'de webkitAudioContext); yoksa ya da açılamazsa null. */
function tarayiciBaglami(): SesBaglami | null {
  if (baglam) return baglam
  if (typeof window === 'undefined') return null
  const Kurucu =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Kurucu) return null
  try {
    baglam = new Kurucu() as unknown as SesBaglami
  } catch {
    return null
  }
  return baglam
}

/**
 * Web Audio'yu açar: iOS'ta ancak bir dokunuşla açılır. İlk dokunuşta (calar.ts, sesiAc) ve
 * sonraki dokunuşlarda (askıya alındıysa) çağrılır.
 */
export function efektleriAc(): void {
  if (!izinli) return
  const b = tarayiciBaglami()
  if (b && b.state !== 'running') b.resume().catch(() => {})
}

/**
 * Efekti çalar; çaldıysa true. Web Audio yoksa ya da çalamazsa sessizce false döner (hata yok,
 * konsola yazılmaz). Çalan konuşmaya dokunmaz.
 */
export function efektCal(
  tur: EfektTuru,
  b: SesBaglami | null = izinli ? tarayiciBaglami() : null,
): boolean {
  if (!b) return false
  try {
    if (b.state === 'suspended') b.resume().catch(() => {})
    const simdi = b.currentTime + 0.01
    for (const nota of EFEKTLER[tur]) {
      const bas = simdi + nota.baslangic
      const osilator = b.createOscillator()
      osilator.type = nota.dalga
      osilator.frequency.value = nota.frekans
      const kazanc = b.createGain()
      kazanc.gain.setValueAtTime(SESSIZ, bas)
      kazanc.gain.linearRampToValueAtTime(nota.kazanc, bas + nota.yukselis)
      kazanc.gain.exponentialRampToValueAtTime(SESSIZ, bas + nota.sure)
      osilator.connect(kazanc)
      kazanc.connect(b.destination)
      osilator.start(bas)
      osilator.stop(bas + nota.sure + 0.02)
    }
    return true
  } catch {
    return false
  }
}
