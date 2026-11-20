import { useEffect, useRef, useState } from 'react'
import left from '../assets/portrait-left.jpg'
import right from '../assets/portrait-right.jpg'
import TabBar from './TabBar'

export default function Header({ active, onChange, children }) {
  const [collapsed, setCollapsed] = useState(false)
  const topRef = useRef(null)
  const initialMapTop = useRef(0)

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
      {/* Header Search Slot - Children passed from App for FLIP morphing */}
      <div className={`header-search-slot${collapsed ? ' collapsed' : ''}`}>
        {children}
      </div>

      <div className="brand">
        <img className="avatar" src={left} alt="Bupati Lamongan" />
        <h1>PEMKAB LAMONGAN</h1>
        <img className="avatar" src={right} alt="Wakil Bupati Lamongan" />
      </div>

      <div className="tabs--header">
        <TabBar active={active} onChange={onChange} />
      </div>
    </header>
  )
}
