import './AcilisEkrani.css'

export default function AcilisEkrani({
  onBukalemunKoyu,
}: {
  /** Geçici: ada haritası (Oturum 6) gelene kadar Bukalemun Koyu'na buradan girilir. */
  readonly onBukalemunKoyu?: () => void
}) {
  return (
    <main className="acilis">
      <div className="acilis__gunes" aria-hidden="true" />
      <h1 className="acilis__baslik">Morfemusta Adası</h1>
      {onBukalemunKoyu && (
        <button type="button" className="acilis__dugme" onClick={onBukalemunKoyu}>
          Bukalemun Koyu
        </button>
      )}
      <Ada />
    </main>
  )
}

// Palmiyenin tepesi; yapraklar bu noktanın çevresinde döner.
const TEPE = { x: 236, y: 58 }
const YAPRAK_ACILARI = [165, -150, -110, -70, -30, 15]
const DALGA = 'M0 150 Q20 140 40 150 T80 150 T120 150 T160 150 T200 150 T240 150 T280 150 T320 150'

function Ada() {
  return (
    <svg className="acilis__ada" viewBox="0 0 320 200" aria-hidden="true" focusable="false">
      <ellipse className="ada__kum-golge" cx="160" cy="132" rx="138" ry="30" />
      <ellipse className="ada__kum" cx="160" cy="126" rx="132" ry="28" />
      <path className="ada__tepe" d="M58 124 Q104 58 168 72 Q226 84 258 124 Z" />
      <path className="ada__tepe-golge" d="M58 124 Q104 58 168 72 Q128 86 112 124 Z" />
      <path className="ada__kutuk" d={`M214 118 Q220 88 ${TEPE.x} ${TEPE.y}`} />
      {YAPRAK_ACILARI.map((aci) => (
        <ellipse
          key={aci}
          className="ada__yaprak"
          cx={TEPE.x + 24}
          cy={TEPE.y}
          rx="26"
          ry="8"
          transform={`rotate(${aci} ${TEPE.x} ${TEPE.y})`}
        />
      ))}
      <path className="ada__deniz" d={`${DALGA} V200 H0 Z`} />
      <path className="ada__kopuk" d={DALGA} />
    </svg>
  )
}
