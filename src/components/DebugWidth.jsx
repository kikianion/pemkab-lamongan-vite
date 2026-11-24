import { useEffect, useState } from 'react'

export default function DebugWidth() {
  const [w, setW] = useState(() => window.innerWidth)

  useEffect(() => {
    const onResize = () => setW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const bp = w >= 1100 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile'
  return <div className="debug-width">{w}px {bp}</div>
}
