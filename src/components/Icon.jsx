import { useEffect, useState } from 'react'

const blobCache = new Map()

// Static (no animation) blob URL of an SVG: strips SMIL + <script>, injects CSS animation:none.
function blobSrc(url, freeze) {
  const key = `${freeze ? 'f' : 'p'}|${url}`
  if (blobCache.has(key)) return Promise.resolve(blobCache.get(key))
  return fetch(url)
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.text() })
    .then((t) => {
      const clean = t.replace(/<script[\s\S]*?<\/script>/gi, '')
      const frozenTxt = !freeze ? clean : clean
        .replace(/<(animate|animateTransform|animateMotion|set)\b[\s\S]*?(\/>|<\/\1>)/gi, '')
        .replace(/<svg([^>]*)>/i, '<svg$1><style>*{animation:none!important;transition:none!important}</style>')
      const blob = URL.createObjectURL(new Blob([frozenTxt], { type: 'image/svg+xml' }))
      blobCache.set(key, blob)
      return blob
    })
}

// <img> keeps animation when playing; swaps to frozen blob URL when paused.
function InlineSvg({ url, paused }) {
  const [src, setSrc] = useState(url)
  useEffect(() => {
    let alive = true
    blobSrc(url, paused)
      .then((b) => { if (alive) setSrc(b) })
      .catch((e) => { console.warn('icon blob fetch failed (CORS?)', url, e); if (alive) setSrc(url) })
    return () => { alive = false }
  }, [url, paused])
  return <img className="icon-img" src={src} alt="" aria-hidden="true" draggable={false} />
}

export default function Icon({ name, url, raw, animated, paused }) {
  // Custom icon from backend: <img> so animated SVG/GIF plays (<use> would freeze it)
  if (url && /\.svg(\?|$)/i.test(url)) return <InlineSvg url={url} paused={paused} />
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
