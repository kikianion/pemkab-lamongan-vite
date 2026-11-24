import { useEffect, useMemo, useRef, useState } from 'react'
import map from '../assets/map_island_3d.svg'
import CarAnimation, { CAR_ANIMATION_ENABLED } from './CarAnimation'
import Icon, { Lines } from './Icon'
import { PINS as FALLBACK_PINS } from '../data'
import { fetchMapServices, fetchPariwisataMap, fetchIndustriMap, fetchDinasMap } from '../api'
import { latLonToPct } from '../geo'
import { clusterPins } from '../cluster'

const MIN_SCALE = 1
const MAX_SCALE = 3
const PAN_STEP = 40
const CAR_PLAY_KEY = 'mapCarAnimation'
const NO_PINS = []

// The SVG viewBox ratio. The <img> letterboxes the SVG (centered) inside the canvas, so pin
// percentages from the backend (relative to the image itself) must be mapped onto the drawn area.
const MAP_ASPECT = 1795 / 1806

function fitToImage(x, y, w, h) {
  if (!w || !h) return { left: x, top: y }
  let cw = w
  let ch = h
  if (w / h > MAP_ASPECT) cw = h * MAP_ASPECT
  else ch = w / MAP_ASPECT
  const ox = (w - cw) / 2
  const oy = (h - ch) / 2
  return {
    left: ((ox + (x / 100) * cw) / w) * 100,
    top: ((oy + (y / 100) * ch) / h) * 100,
  }
}

// Service marker position: prefer latitude/longitude (same as Pariwisata), fall back to left_pct/top_pct.
function servicePos(s) {
  const pos = latLonToPct(s.latitude, s.longitude)
  if (pos) return { geo: true, left: pos.x, top: pos.y }
  return { geo: false, left: parseFloat(s.left_pct), top: parseFloat(s.top_pct) }
}

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

export default function MapSection({ query, hit, onPin, currentStage, category = 'Siklus hidup warga' }) {
  const q = (query || '').toLowerCase()
  // Filter pins by the active life category button
  const showServices = category === 'Siklus hidup warga'
  const showWisata = category === 'Pariwisata'
  const showIndustri = category === 'Industri'
  const showDinas = category === 'Dinas'
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [markers, setMarkers] = useState([])
  const [wisata, setWisata] = useState([])
  const [other, setOther] = useState([]) // Industri / Dinas markers (active category only)
  const [openCluster, setOpenCluster] = useState(null)
  const canvasRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [carPlaying, setCarPlaying] = useState(() => {
    try { return localStorage.getItem(CAR_PLAY_KEY) !== 'paused' } catch { return true }
  })
  const toggleCar = () => setCarPlaying((p) => {
    const next = !p
    try { localStorage.setItem(CAR_PLAY_KEY, next ? 'playing' : 'paused') } catch { /* storage unavailable */ }
    return next
  })

  const [showLabels, setShowLabels] = useState(true)
  const [isDesktop, setIsDesktop] = useState(false)
  const drag = useRef(null)

  // Track unscaled canvas size (px) so clustering can measure on-screen pin distance
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return undefined
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    if (typeof ResizeObserver === 'undefined') return undefined
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

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
          ...servicePos(s),
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
    let isMounted = true
    fetchPariwisataMap(query).then((data) => {
      if (!isMounted) return
      if (!Array.isArray(data)) { setWisata([]); return }
      const formatted = data
        .map((w) => {
          const pos = latLonToPct(w.latitude, w.longitude)
          if (!pos) return null // skip rows without valid lat/lon
          const name = w.nama || w.name || 'Pariwisata'
          return {
            id: `wisata-${w.id ?? name}`,
            kind: 'wisata',
            tone: 'amber',
            icon: w.icon_url ? 'doc' : (w.icon_raw ? 'doc' : (w.icon || 'doc')),
            iconUrl: w.icon_url || null,
            iconRaw: w.icon_url ? null : (w.icon_raw || null),
            animated: !!(w.icon_url && w.icon_is_animated),
            name,
            kategori: w.kategori,
            kecamatan: w.kecamatan,
            label: [name],
            left: pos.x,
            top: pos.y,
          }
        })
        .filter(Boolean)
      setWisata(formatted)
    })
    return () => { isMounted = false }
  }, [query])

  // Industri / Dinas markers from /api/industri/map and /api/dinas/map
  useEffect(() => {
    const fetcher = category === 'Industri' ? fetchIndustriMap : category === 'Dinas' ? fetchDinasMap : null
    if (!fetcher) { setOther([]); return undefined }
    let isMounted = true
    setOther([])
    fetcher(query).then((data) => {
      if (!isMounted) return
      if (!Array.isArray(data)) { setOther([]); return }
      const tone = category === 'Industri' ? 'blue' : 'purple'
      const formatted = data
        .map((r) => {
          const pos = latLonToPct(r.latitude, r.longitude)
          if (!pos) return null // skip rows without valid lat/lon
          const name = r.nama || r.name || r.title || category
          return {
            id: `${category}-${r.id ?? name}`,
            kind: 'wisata', // same rule as pariwisata: filter by query only, no lifecycle stage
            tone,
            icon: r.icon_url ? 'doc' : (r.icon_raw ? 'doc' : (r.icon || 'work')),
            iconUrl: r.icon_url || null,
            iconRaw: r.icon_url ? null : (r.icon_raw || null),
            animated: !!(r.icon_url && r.icon_is_animated),
            name,
            kategori: r.kategori,
            kecamatan: r.kecamatan,
            url: r.url,
            label: [name],
            left: pos.x,
            top: pos.y,
          }
        })
        .filter(Boolean)
      setOther(formatted)
    })
    return () => { isMounted = false }
  }, [query, category])

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

  // Cluster click: zoom in one level, centered on the cluster (offset kept inside map bounds)
  const zoomToCluster = (c) => {
    const ns = clamp(scale + 1)
    const el = canvasRef.current
    if (el) {
      const w = el.clientWidth
      const h = el.clientHeight
      const maxX = (w - w / ns) / 2
      const maxY = (h - h / ns) / 2
      const ox = w / 2 - (c.left / 100) * w
      const oy = h / 2 - (c.top / 100) * h
      setOffset({
        x: Math.round(Math.max(-maxX, Math.min(maxX, ox))),
        y: Math.round(Math.max(-maxY, Math.min(maxY, oy))),
      })
    }
    setScale(ns)
  }

  const canDrag = isDesktop && scale > 1
  const onPointerDown = (e) => {
    if (!canDrag) return
    // Never hijack clicks on buttons (pins, joystick, zoom)
    if (e.target.closest('.pin, .map-zoom, .map-joystick, .map-car-toggle, .map-label-toggle')) return
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

  // Merge dense pins into clusters (only pins that are currently visible and not highlighted)
  const wisataFitted = useMemo(
    () => wisata.map((p) => ({ ...p, ...fitToImage(p.left, p.top, size.w, size.h) })),
    [wisata, size],
  )
  const servicesFitted = useMemo(
    () => markers.map((p) => (p.geo ? { ...p, ...fitToImage(p.left, p.top, size.w, size.h) } : p)),
    [markers, size],
  )
  const otherFitted = useMemo(
    () => other.map((p) => ({ ...p, ...fitToImage(p.left, p.top, size.w, size.h) })),
    [other, size],
  )
  const activePins = showServices ? servicesFitted : showWisata ? wisataFitted : (showIndustri || showDinas) ? otherFitted : NO_PINS
  const { singles, clusters } = useMemo(() => {
    const visible = (p) => {
      const matchQuery = !q || p.name.toLowerCase().includes(q)
      if (p.kind === 'wisata') return matchQuery
      return matchQuery && (activeStageId === null || p.stage_id === activeStageId)
    }
    return clusterPins(activePins, {
      width: size.w,
      height: size.h,
      scale,
      maxScale: MAX_SCALE,
      canCluster: (p) => visible(p) && p.id !== hit.id,
    })
  }, [activePins, size, scale, q, activeStageId, hit.id])

  return (
    <section
      className={`map${canDrag ? ' draggable' : ''}${carPlaying ? '' : ' anim-paused'}${showLabels ? '' : ' no-labels'}`}
      aria-label="Peta layanan"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <div className="map-intro" style={{ animationDelay: `${INTRO_DELAY_MS}ms`, animationDuration: `${INTRO_DURATION_MS}ms`, '--map-intro-angle': `${INTRO_ANGLE_DEG}deg` }}>
      <div
        ref={canvasRef}
        className="map-canvas"
        style={{ transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)` }}
      >
        <img src={map} alt="Peta Kabupaten Lamongan" draggable={false} />
        <CarAnimation playing={carPlaying} />
        {showServices && singles.map((p) => {
          const matchQuery = !q || p.name.toLowerCase().includes(q)
          const matchStage = activeStageId === null || p.stage_id === activeStageId
          const isVisible = matchQuery && matchStage

          return (
            <button
              key={`${p.id}-${hit.id === p.id ? hit.tick : 0}`}
              className={`pin pin-wisata${!isVisible ? ' hide' : ''}${hit.id === p.id ? ' hit' : ''}`}
              data-tone={p.tone}
              style={{ left: `${p.left}%`, top: `${p.top}%`, '--pin-scale': 1 / scale }}
              onClick={(e) => {
                e.stopPropagation()
                onPin(p)
              }}
            >
              <i><Icon name={p.icon} url={p.iconUrl} raw={p.iconRaw} animated={p.animated} paused={!carPlaying} /></i>
              <svg className="needle" aria-hidden="true" viewBox="0 0 14 12">
                <path className="body" d="M1 0H13L7 11.5z" />
              </svg>
              <span><Lines lines={p.label} /></span>
            </button>
          )
        })}
        {(showWisata || showIndustri || showDinas) && singles.map((p) => {
          const isVisible = !q || p.name.toLowerCase().includes(q)
          return (
            <button
              key={`${p.id}-${hit.id === p.id ? hit.tick : 0}`}
              className={`pin pin-wisata${p.animated ? ' pin-animated' : ''}${!isVisible ? ' hide' : ''}${hit.id === p.id ? ' hit' : ''}`}
              data-tone={p.tone}
              title={[p.name, p.kategori, p.kecamatan].filter(Boolean).join(' - ')}
              style={{ left: `${p.left}%`, top: `${p.top}%`, '--pin-scale': 1 / scale }}
              onClick={(e) => {
                e.stopPropagation()
                onPin(p)
              }}
            >
              <i><Icon name={p.icon} url={p.iconUrl} raw={p.iconRaw} animated={p.animated} paused={!carPlaying} /></i>
              <svg className="needle" aria-hidden="true" viewBox="0 0 14 12">
                <path className="body" d="M1 0H13L7 11.5z" />
              </svg>
              <span><Lines lines={p.label} /></span>
            </button>
          )
        })}
        {clusters.map((c) => (
          <button
            key={c.id}
            className="pin pin-cluster"
            data-tone={c.tone}
            aria-label={`${c.count} lokasi, perbesar peta`}
            title={`${c.count} lokasi`}
            style={{ left: `${c.left}%`, top: `${c.top}%`, '--pin-scale': 1 / scale }}
            onClick={(e) => {
              e.stopPropagation()
              setOpenCluster((id) => (id === c.id ? null : c.id))
            }}
          >
            <i>{c.count}</i>
          </button>
        ))}
        {(() => {
          const opened = clusters.find((c) => c.id === openCluster)
          if (!opened) return null
          return (
            <div
              className="cluster-pop"
              style={{ left: `${opened.left}%`, top: `${opened.top}%`, '--pin-scale': 1 / scale }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cluster-pop-head">
                <b>{opened.count} lokasi</b>
                <button type="button" aria-label="Tutup" onClick={() => setOpenCluster(null)}>&#10005;</button>
              </div>
              <ul>
                {opened.members.map((m) => (
                  <li key={m.id}>
                    <button type="button" onClick={() => { onPin(m); setOpenCluster(null) }}>
                      <i><Icon name={m.icon} url={m.iconUrl} raw={m.iconRaw} /></i>
                      <span>{m.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" className="cluster-pop-zoom" onClick={() => { setOpenCluster(null); zoomToCluster(opened) }}>Perbesar peta</button>
            </div>
          )
        })()}
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
      <button
        className="map-label-toggle"
        aria-label={showLabels ? 'Sembunyikan label' : 'Tampilkan label'}
        aria-pressed={showLabels}
        title={showLabels ? 'Sembunyikan label' : 'Tampilkan label'}
        onClick={() => setShowLabels((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7V4h16v3M9 20h6M12 4v16" />
          {!showLabels && <path d="M3 3l18 18" />}
        </svg>
      </button>
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
