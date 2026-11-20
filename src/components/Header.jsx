import { useEffect, useRef, useState } from 'react'
import left from '../assets/portrait-left.jpg'
import right from '../assets/portrait-right.jpg'
import frontLogo from '../assets/front-logo.gif'

export default function Header({ children, navSlot }) {
  const [collapsed, setCollapsed] = useState(false)
  const topRef = useRef(null)
  const initialMapTop = useRef(0)
  const canvasRef = useRef(null)
  const [freezeGif, setFreezeGif] = useState(false)

  useEffect(() => {
    // Front logo GIF: freeze on the final frame after playing once (5880ms)
    const timer = setTimeout(() => {
      const img = document.querySelector('.brand-logo-desktop')
      const canvas = canvasRef.current
      if (img && canvas) {
        canvas.width = img.naturalWidth || img.clientWidth || 60
        canvas.height = img.naturalHeight || img.clientHeight || 60
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          setFreezeGif(true)
        }
      }
    }, 5880)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const mapEl = () => document.querySelector('.map')

    const measure = () => {
      const m = mapEl()
      if (m) initialMapTop.current = m.getBoundingClientRect().top + window.scrollY
    }
    const onScroll = () => {
      if (window.innerWidth >= 1100) { setCollapsed(false); return }
      const m = mapEl()
      if (!m) return
      const mapViewportTop = m.getBoundingClientRect().top
      setCollapsed(mapViewportTop <= initialMapTop.current / 2)
    }
    const onResize = () => { measure(); onScroll() }
    measure()
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <header className="top" ref={topRef}>
      {/* Header Search Slot */}
      <div className={`header-search-slot${collapsed ? ' collapsed' : ''}`}>
        {children}
      </div>

      <div className="brand">
        <img className="avatar" src={left} alt="Bupati Lamongan" />
        <div className="brand-logo-wrap">
          <img
            className="brand-logo-desktop"
            src={frontLogo}
            alt="Logo Pemkab Lamongan"
            style={{ display: freezeGif ? 'none' : 'block' }}
          />
          <canvas
            ref={canvasRef}
            className="brand-logo-desktop brand-logo-canvas"
            style={{ display: freezeGif ? 'block' : 'none' }}
          />
        </div>
        <h1>PEMKAB LAMONGAN</h1>
        <img className="avatar" src={right} alt="Wakil Bupati Lamongan" />
      </div>

      {/* Target anchor slot for the desktop navigation buttons */}
      <div className="tabs--header">
        {navSlot}
      </div>
    </header>
  )
}
