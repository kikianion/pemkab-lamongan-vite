import { useState } from 'react'
import map from '../assets/map_island_cropped.svg'
import Icon, { Lines } from './Icon'
import { PINS } from '../data'

const MIN_SCALE = 1
const MAX_SCALE = 3

const PAN_STEP = 40

function JoystickButton({ area, label, disabled, onClick, children }) {
  return (
    <button
      className={`js-${area}`}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{ gridArea: area }}
    >
      {children}
    </button>
  )
}

export default function MapSection({ query, hit, onPin }) {
  const q = query.toLowerCase()
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const clamp = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
  const zoomBy = (d) => setScale((s) => {
    const ns = clamp(s + d)
    if (ns === 1) setOffset({ x: 0, y: 0 })
    return ns
  })
  const reset = () => { setScale(1); setOffset({ x: 0, y: 0 }) }

  const panBy = (dx, dy) => setOffset((o) => ({
    x: Math.round(o.x + dx),
    y: Math.round(o.y + dy),
  }))
  const panDisabled = scale <= 1

  return (
    <section
      className="map"
      aria-label="Peta layanan"
    >
      <div
        className="map-canvas"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
      >
        <img src={map} alt="Peta Kabupaten Lamongan" />
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
      </div>
      <div className="map-joystick" aria-label="Geser peta">
        <JoystickButton area="up" label="Geser atas" disabled={panDisabled} onClick={() => panBy(0, PAN_STEP)}>&#9650;</JoystickButton>
        <JoystickButton area="left" label="Geser kiri" disabled={panDisabled} onClick={() => panBy(PAN_STEP, 0)}>&#9664;</JoystickButton>
        <JoystickButton area="right" label="Geser kanan" disabled={panDisabled} onClick={() => panBy(-PAN_STEP, 0)}>&#9654;</JoystickButton>
        <JoystickButton area="down" label="Geser bawah" disabled={panDisabled} onClick={() => panBy(0, -PAN_STEP)}>&#9660;</JoystickButton>
      </div>
      <div className="map-zoom">
        <button aria-label="Perbesar" onClick={() => zoomBy(0.5)}>+</button>
        <button aria-label="Perkecil" onClick={() => zoomBy(-0.5)}>-</button>
        <button aria-label="Reset" onClick={reset}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12a8 8 0 1 1 2.3 5.6" />
            <path d="M4 5v4h4" />
          </svg>
        </button>
        <button className="locate" hidden aria-label="Lokasi saya" onClick={() => navigator.geolocation?.getCurrentPosition(() => {}, () => {})}>
          <svg viewBox="0 0 32 32" width="22" height="22">
            <circle cx="16" cy="16" r="11" fill="#d83a43" stroke="#fff" strokeWidth="2.5" />
            <path d="M16 1v8M16 23v8M1 16h8M23 16h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="16" r="4" fill="#fff" />
          </svg>
        </button>
      </div>
    </section>
  )
}
