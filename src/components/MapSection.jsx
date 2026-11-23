import { useEffect, useRef, useState } from 'react'
import map from '../assets/map_island_3d.svg'
import CarAnimation, { CAR_ANIMATION_ENABLED } from './CarAnimation'
import Icon, { Lines } from './Icon'
import { PINS as FALLBACK_PINS } from '../data'
import { fetchMapServices } from '../api'

const MIN_SCALE = 1
const MAX_SCALE = 3
const PAN_STEP = 40
const CAR_PLAY_KEY = 'mapCarAnimation'

// Delay (ms) after page load before the map intro animation starts. Set VITE_MAP_INTRO_DELAY in .env.local.
const INTRO_DELAY_MS = Math.max(0, Number(import.meta.env.VITE_MAP_INTRO_DELAY ?? 2000) || 0)

// Duration (ms) of the map intro animation (zoom + rotate + fade in). Set VITE_MAP_INTRO_DURATION in .env.local.
const INTRO_DURATION_MS = Math.max(0, Number(import.meta.env.VITE_MAP_INTRO_DURATION ?? 2000) || 0)

// Starting rotation angle (degrees) of the map intro animation. Set VITE_MAP_INTRO_ANGLE in .env.local.
const INTRO_ANGLE_DEG = Number.isFinite(Number(import.meta.env.VITE_MAP_INTRO_ANGLE ?? -45)) ? Number(import.meta.env.VITE_MAP_INTRO_ANGLE ?? -45) : -45

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

export default function MapSection({ query, hit, onPin, currentStage }) {
  const q = (query || '').toLowerCase()
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [markers, setMarkers] = useState([])
  const [carPlaying, setCarPlaying] = useState(() => {
    try { return localStorage.getItem(CAR_PLAY_KEY) !== 'paused' } catch { return true }
  })
  const toggleCar = () => setCarPlaying((p) => {
    const next = !p
    try { localStorage.setItem(CAR_PLAY_KEY, next ? 'playing' : 'paused') } catch { /* storage unavailable */ }
    return next
  })

  const [isDesktop, setIsDesktop] = useState(false)
  const drag = useRef(null)

  useEffect(() => {
    let isMounted = true
    fetchMapServices(query).then((data) => {
      if (!isMounted) return
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map((s) => ({
          id: s.id,
          stage_id: s.stage_id,
          tone: s.tone || 'teal',
          icon: s.icon,
          name: s.title,
          label: Array.isArray(s.map_label) && s.map_label.length > 0 ? s.map_label : [s.title],
          left: parseFloat(s.left_pct),
          top: parseFloat(s.top_pct),
          url: s.url,
        }))
        setMarkers(formatted)
      } else if (!data) {
        setMarkers(FALLBACK_PINS)
      } else {
        setMarkers([])
      }
    })
    return () => { isMounted = false }
  }, [query])

  useEffect(() => {
    const mq = window.matchMedia('(min-width:768px)')
    const sync = () => setIsDesktop(mq.matches)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])

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

  const canDrag = isDesktop && scale > 1
  const onPointerDown = (e) => {
    if (!canDrag) return
    // Never hijack clicks on buttons (pins, joystick, zoom)
    if (e.target.closest('.pin, .map-zoom, .map-joystick, .map-car-toggle')) return
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOffsetX: offset.x,
      initOffsetY: offset.y,
      moved: false,
      pointerId: e.pointerId,
      target: e.currentTarget,
    }
  }

  const onPointerMove = (e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.startX
    const dy = e.clientY - drag.current.startY
    if (!drag.current.moved && Math.hypot(dx, dy) > 5) {
      drag.current.moved = true
      drag.current.target.setPointerCapture?.(drag.current.pointerId)
    }
    if (drag.current.moved) {
      setOffset({
        x: Math.round(drag.current.initOffsetX + dx),
        y: Math.round(drag.current.initOffsetY + dy),
      })
    }
  }

  const onPointerUp = () => { drag.current = null }

  // Target stage ID is 1-indexed (currentStage 0 -> stage_id 1)
  const activeStageId = typeof currentStage === 'number' ? currentStage + 1 : null

  return (
    <section
      className={`map${canDrag ? ' draggable' : ''}`}
      aria-label="Peta layanan"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div className="map-intro" style={{ animationDelay: `${INTRO_DELAY_MS}ms`, animationDuration: `${INTRO_DURATION_MS}ms`, '--map-intro-angle': `${INTRO_ANGLE_DEG}deg` }}>
      <div
        className="map-canvas"
        style={{ transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)` }}
      >
        <img src={map} alt="Peta Kabupaten Lamongan" draggable={false} />
        <CarAnimation playing={carPlaying} />
        {markers.map((p) => {
          const matchQuery = !q || p.name.toLowerCase().includes(q)
          const matchStage = activeStageId === null || p.stage_id === activeStageId
          const isVisible = matchQuery && matchStage

          return (
            <button
              key={`${p.id}-${hit.id === p.id ? hit.tick : 0}`}
              className={`pin${!isVisible ? ' hide' : ''}${hit.id === p.id ? ' hit' : ''}`}
              data-tone={p.tone}
              style={{ left: `${p.left}%`, top: `${p.top}%`, '--pin-scale': 1 / scale }}
              onClick={(e) => {
                e.stopPropagation()
                onPin(p)
              }}
            >
              <i><Icon name={p.icon} /></i>
              <span><Lines lines={p.label} /></span>
            </button>
          )
        })}
      </div>
      </div>
      <div className="map-fade" aria-hidden="true" />
      <div className="map-fade-corner map-fade-corner-l" aria-hidden="true" />
      <div className="map-fade-corner map-fade-corner-r" aria-hidden="true" />
      {CAR_ANIMATION_ENABLED && (
        <button
          className="map-car-toggle"
          aria-label={carPlaying ? 'Jeda animasi mobil' : 'Putar animasi mobil'}
          aria-pressed={carPlaying}
          onClick={toggleCar}
        >
          {carPlaying ? (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          )}
        </button>
      )}
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
