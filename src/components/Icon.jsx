import { useEffect, useRef, useState } from 'react'

const svgCache = new Map()

// Inline SVG so CSS (animation-play-state) can pause it. Falls back to <img> on fetch failure.
function InlineSvg({ url, paused }) {
  const boxRef = useRef(null)
  const [markup, setMarkup] = useState(() => svgCache.get(url) ?? null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (svgCache.has(url)) { setMarkup(svgCache.get(url)); return undefined }
    let alive = true
    fetch(url)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text() })
      .then((t) => {
        const clean = t.replace(/<script[\s\S]*?<\/script>/gi, '')
        svgCache.set(url, clean)
        if (alive) setMarkup(clean)
      })
      .catch(() => { if (alive) setFailed(true) })
    return () => { alive = false }
  }, [url])
  // SMIL (<animate>) and CSS animations: pause both
  useEffect(() => {
    const svg = boxRef.current?.querySelector('svg')
    if (!svg) return
    svg.style.setProperty('animation-play-state', paused ? 'paused' : 'running')
    svg.querySelectorAll('*').forEach((el) => el.style.setProperty('animation-play-state', paused ? 'paused' : 'running'))
    if (paused) svg.pauseAnimations?.()
    else svg.unpauseAnimations?.()
  }, [paused, markup])
  if (failed || !markup) {
    return failed ? <img className="icon-img" src={url} alt="" aria-hidden="true" draggable={false} /> : null
  }
  return <span ref={boxRef} className="icon-inline" aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />
}

export default function Icon({ name, url, raw, animated, paused }) {
  // Custom icon from backend: <img> so animated SVG/GIF plays (<use> would freeze it)
  if (url && animated && /\.svg(\?|$)/i.test(url)) return <InlineSvg url={url} paused={paused} />
  if (url) return <img className="icon-img" src={url} alt="" aria-hidden="true" draggable={false} />
  // Emoji / plain text fallback
  if (raw) return <span className="icon-emoji" aria-hidden="true">{raw}</span>
  return (
    <svg aria-hidden="true">
      <use href={`#i-${name}`} />
    </svg>
  )
}

export const Lines = ({ lines }) =>
  lines.map((l, i) => (
    <span key={i}>
      {i > 0 && <br />}
      {l}
    </span>
  ))
