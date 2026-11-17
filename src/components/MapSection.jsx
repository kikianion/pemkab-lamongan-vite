import { useRef, useState } from 'react'
import map from '../assets/map_island_cropped.svg'
import Icon, { Lines } from './Icon'
import { PINS } from '../data'

const MIN_SCALE = 1
const MAX_SCALE = 3

export default function MapSection({ query, hit, onPin }) {
  const q = query.toLowerCase()
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const drag = useRef(null)

  const clamp = (s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))
  const zoomBy = (d) => setScale((s) => {
    const ns = clamp(s + d)
    if (ns === 1) setOffset({ x: 0, y: 0 })
    return ns
  })
  const reset = () => { setScale(1); setOffset({ x: 0, y: 0 }) }

  const onPointerDown = (e) => {
    if (scale <= 1) return
    drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    setOffset({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })
  }
  const onPointerUp = () => { drag.current = null }

  return (
    <section
      className="map"
      aria-label="Peta layanan"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
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
      <div className="map-zoom">
        <button aria-label="Perbesar" onClick={() => zoomBy(0.5)}>+</button>
        <button aria-label="Perkecil" onClick={() => zoomBy(-0.5)}>-</button>
        <button aria-label="Reset" onClick={reset}>0</button>
        <button className="locate" aria-label="Lokasi saya" onClick={() => navigator.geolocation?.getCurrentPosition(() => {}, () => {})}>
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
