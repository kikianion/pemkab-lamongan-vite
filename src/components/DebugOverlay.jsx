import { useEffect, useRef, useState } from 'react'

// Elements that cannot host ::before / ::after labels
const NO_PSEUDO = new Set([
  'img', 'input', 'br', 'hr', 'svg', 'canvas', 'video', 'audio', 'iframe',
  'textarea', 'select', 'option', 'source', 'meta', 'link', 'script', 'style',
])

function describe(el) {
  let s = el.tagName.toLowerCase()
  if (el.id) s += '#' + el.id
  const cls = typeof el.className === 'string' ? el.className : el.getAttribute('class') || ''
  const names = cls.trim().split(/\s+/).filter(Boolean)
  if (names.length) s += '.' + names.join('.')
  return s
}

// True when the element's own CSS already uses this pseudo-element
// (content that is not our own debug label).
function pseudoInUse(el, pseudo) {
  const c = getComputedStyle(el, pseudo).content
  if (!c || c === 'none' || c === 'normal') return false
  const mine = el.getAttribute('data-debug-label')
  return !(mine && c.slice(1, -1) === mine)
}

/*
 * Debug outline: no separate layer.
 * The real DOM elements are tagged with data-debug-label / data-debug-pseudo
 * and styled in styles.css (outline + ::before/::after label at the element's
 * top-left).
 * The label is position:absolute with no offsets, so it sits at the element's
 * own top-left (static position) and never changes any box size.
 * Only the small hover tooltip is rendered by this component.
 */
export default function DebugOverlay({ level = 1 }) {
  const [info, setInfo] = useState(null)
  const rootRef = useRef(null)

  useEffect(() => {
    document.body.classList.add(level === 2 ? 'debug-ui2' : 'debug-ui')

    let hovered = null
    const clearHover = () => {
      if (hovered) hovered.removeAttribute('data-debug-hover')
      hovered = null
    }
    const onMove = (e) => {
      const el = e.target
      if (!(el instanceof Element) || rootRef.current?.contains(el)) return
      if (hovered !== el) {
        clearHover()
        el.setAttribute('data-debug-hover', '')
        hovered = el
      }
      const r = el.getBoundingClientRect()
      setInfo({
        label: describe(el),
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        x: e.clientX,
        y: e.clientY,
      })
    }
    const onLeave = () => { clearHover(); setInfo(null) }

    const unmark = (el) => {
      el.removeAttribute('data-debug-label')
      el.removeAttribute('data-debug-pseudo')
    }

    let raf = 0
    const scan = () => {
      raf = 0
      const keep = new Set()
      const selector = level === 2 ? '.debug2' : '[id], [class]'
      document.body.querySelectorAll(selector).forEach((el) => {
        if (rootRef.current?.contains(el)) return
        if (NO_PSEUDO.has(el.tagName.toLowerCase()) || el.closest('svg')) return
        const r = el.getBoundingClientRect()
        if (r.width < 24 || r.height < 12) return
        const label = level === 2 && el.id ? '#' + el.id : describe(el)
        const mode = !pseudoInUse(el, '::before') ? 'before' : !pseudoInUse(el, '::after') ? 'after' : null
        if (!mode) return
        keep.add(el)
        if (el.getAttribute('data-debug-label') !== label) el.setAttribute('data-debug-label', label)
        if (el.getAttribute('data-debug-pseudo') !== mode) el.setAttribute('data-debug-pseudo', mode)
      })
      document.querySelectorAll('[data-debug-label]').forEach((el) => {
        if (!keep.has(el)) unmark(el)
      })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(scan)
    }

    // Only react to structural/class/id changes; our own data-* attributes are
    // outside this filter, so tagging elements never re-triggers the observer.
    const mo = new MutationObserver((recs) => {
      if (recs.some((m) => !rootRef.current?.contains(m.target))) schedule()
    })
    mo.observe(document.getElementById('root') || document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class', 'id'],
    })
    window.addEventListener('resize', schedule)
    const timer = setInterval(schedule, 1000)
    schedule()

    setInfo(null)
    if (level !== 2) {
      window.addEventListener('mousemove', onMove, true)
      document.documentElement.addEventListener('mouseleave', onLeave)
    }
    return () => {
      document.body.classList.remove('debug-ui', 'debug-ui2')
      window.removeEventListener('mousemove', onMove, true)
      window.removeEventListener('resize', schedule)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      clearInterval(timer)
      mo.disconnect()
      if (raf) cancelAnimationFrame(raf)
      clearHover()
      document.querySelectorAll('[data-debug-label]').forEach(unmark)
    }
  }, [level])

  const tipLeft = info ? Math.min(info.x + 14, window.innerWidth - 320) : 0
  const tipTop = info ? Math.min(info.y + 18, window.innerHeight - 60) : 0

  return (
    <div ref={rootRef} className="debug-overlay">
      {info && (
        <div className="debug-overlay__tip" style={{ left: tipLeft, top: tipTop }}>
          <b>{info.label}</b> <span>{info.size}</span>
        </div>
      )}
    </div>
  )
}
