import map from '../assets/map.svg'
import Icon, { Lines } from './Icon'
import { PINS } from '../data'

export default function MapSection({ query, hit, onPin }) {
  const q = query.toLowerCase()
  return (
    <section className="map" aria-label="Peta layanan">
      <img src={map} alt="Peta Kabupaten Lamongan" />
      <button className="locate" aria-label="Lokasi saya" onClick={() => navigator.geolocation?.getCurrentPosition(() => {}, () => {})}>
        <svg viewBox="0 0 32 32" width="34" height="34">
          <circle cx="16" cy="16" r="11" fill="#d83a43" stroke="#fff" strokeWidth="2.5" />
          <path d="M16 1v8M16 23v8M1 16h8M23 16h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="16" r="4" fill="#fff" />
        </svg>
      </button>
      {PINS.map((p) => {
        const hidden = q && !p.name.toLowerCase().includes(q)
        return (
          <button
            key={`${p.id}-${hit.id === p.id ? hit.tick : 0}`}
            className={`pin${hidden ? ' hide' : ''}${hit.id === p.id ? ' hit' : ''}`}
            data-tone={p.tone}
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
            onClick={() => onPin(p.id)}
          >
            <i><Icon name={p.icon} /></i>
            <span><Lines lines={p.label} /></span>
          </button>
        )
      })}
    </section>
  )
}
