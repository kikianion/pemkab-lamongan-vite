import { useEffect, useRef, useState } from 'react'
import map from '../assets/map_island_cropped.svg'
import Icon, { Lines } from './Icon'
import { PINS as FALLBACK_PINS } from '../data'
import { fetchMapServices } from '../api'

const MIN_SCALE = 1
const MAX_SCALE = 3

export default function MapSection({ query, hit, onPin }) {
  const q = (query || '').toLowerCase()
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [markers, setMarkers] = useState([])

  const [isDesktop, setIsDesktop] = useState(false)
  const drag = useRef(null)

  useEffect(() => {
    let isMounted = true
    fetchMapServices(query).then((data) => {
      if (!isMounted) return
      if (Array.isArray(data) && data.length > 0) {
        // Map backend service schema to marker format
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
        // Fallback to static data if API unreachable
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

  const canDrag = isDesktop && scale > 1
  const onPointerDown = (e) => {
    if (!canDrag) return
    if (e.target.closest('.map-zoom, .map-joystick')) return
    drag.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current) return
    setOffset({
      x: Math.round(e.clientX - drag.current.x),
      y: Math.round(e.clientY - drag.current.y),
    })
  }
  const onPointerUp = () => { drag.current = null }

  return (
    <section
      className={`map${canDrag ? ' draggable' : ''}`}
      aria-label="Peta layanan"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div
        className="map-canvas"
        style={{ transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)` }}
      >
        <img src={map} alt="Peta Kabupaten Lamongan" draggable={false} />
        {markers.map((p) => {
          const hidden = q && !p.name.toLowerCase().includes(q)
          return (
            <button
              key={`${p.id}-${hit.id === p.id ? hit.tick : 0}`}
              className={`pin${hidden ? ' hide' : ''}${hit.id === p.id ? ' hit' : ''}`}
              data-tone={p.tone}
              style={{ left: `${p.left}%`, top: `${p.top}%`, '--pin-scale': 1 / scale }}
              onClick={() => onPin(p)}
            >
              <i><Icon name={p.icon} /></i>
              <span><Lines lines={p.label} /></span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
