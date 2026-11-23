import { useEffect, useRef, useState } from 'react'

function describe(el) {
  let s = el.tagName.toLowerCase()
  if (el.id) s += '#' + el.id
  const cls = typeof el.className === 'string' ? el.className : el.getAttribute('class') || ''
  const names = cls.trim().split(/\s+/).filter(Boolean)
  if (names.length) s += '.' + names.join('.')
  return s
}

export default function DebugOverlay() {
  const [info, setInfo] = useState(null)
  const [labels, setLabels] = useState([])
  const rootRef = useRef(null)

  useEffect(() => {
    document.body.classList.add('debug-ui')

    const onMove = (e) => {
      const el = e.target
      if (!(el instanceof Element) || rootRef.current?.contains(el)) return
      const r = el.getBoundingClientRect()
      setInfo({
        label: describe(el),
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        rect: { top: r.top, left: r.left, width: r.width, height: r.height },
        x: e.clientX,
        y: e.clientY,
      })
    }
    const onLeave = () => setInfo(null)

    let raf = 0
    const scan = () => {
      raf = 0
      const out = []
      for (const el of document.body.querySelectorAll('[id], [class]')) {
        if (rootRef.current?.contains(el)) continue
        if (el.tagName.toLowerCase() !== 'svg' && el.closest('svg')) continue
        const r = el.getBoundingClientRect()
        if (r.width < 24 || r.height < 12) continue
        if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) continue
        out.push({ k: out.length, x: Math.max(r.left, 0), y: Math.max(r.top, 0), label: describe(el) })
        if (out.length >= 300) break
      }
      setLabels(out)
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(scan)
    }
    const mo = new MutationObserver((recs) => {
      if (recs.some((m) => !rootRef.current?.contains(m.target))) schedule()
    })
    mo.observe(document.getElementById('root') || document.body, {
      subtree: true,
      childList: true,
      attributes: true,
    })
    window.addEventListener('scroll', schedule, true)
    window.addEventListener('resize', schedule)
    const timer = setInterval(schedule, 500)
    schedule()

    window.addEventListener('mousemove', onMove, true)
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      document.body.classList.remove('debug-ui')
      window.removeEventListener('mousemove', onMove, true)
      window.removeEventListener('scroll', schedule, true)
      window.removeEventListener('resize', schedule)
      clearInterval(timer)
      mo.disconnect()
      if (raf) cancelAnimationFrame(raf)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const tipLeft = info ? Math.min(info.x + 14, window.innerWidth - 320) : 0
  const tipTop = info ? Math.min(info.y + 18, window.innerHeight - 60) : 0

  return (
    <div ref={rootRef} className="debug-overlay">
      {labels.map((l) => (
        <div key={l.k} className="debug-overlay__label" style={{ left: l.x, top: l.y }}>
          {l.label}
        </div>
      ))}
      {info && (
        <>
          <div
            className="debug-overlay__box"
            style={{
              top: info.rect.top,
              left: info.rect.left,
              width: info.rect.width,
              height: info.rect.height,
            }}
          />
          <div className="debug-overlay__tip" style={{ left: tipLeft, top: tipTop }}>
            <b>{info.label}</b> <span>{info.size}</span>
          </div>
        </>
      )}
    </div>
  )
}
