import { useEffect, useRef, useState } from 'react'
import left from '../assets/portrait-left.jpg'
import right from '../assets/portrait-right.jpg'
import frontLogo from '../assets/front-logo.gif'
import frontLogoFinal from '../assets/front-logo-final.png'

export default function Header({ children, navSlot }) {
  const [collapsed, setCollapsed] = useState(false)
  const topRef = useRef(null)
  const initialMapTop = useRef(0)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    // Front logo GIF plays for exactly 1 cycle (5880ms) on initial load, then stays on the final frame image
    const timer = setTimeout(() => {
      setIsFinished(true)
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
            src={isFinished ? frontLogoFinal : frontLogo}
            alt="Logo Pemkab Lamongan"
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
