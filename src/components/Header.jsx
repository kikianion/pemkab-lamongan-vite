import { useEffect, useRef, useState } from 'react'
import left from '../assets/portrait-left.jpg'
import right from '../assets/portrait-right.jpg'

export default function Header({ onSearch }) {
  const [q, setQ] = useState('')
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
      // only collapse below the desktop breakpoint
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
      <form className={`search${collapsed ? ' collapsed' : ''}`} role="search" onSubmit={(e) => { e.preventDefault(); onSearch(q.trim()) }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
        </svg>
        <input type="search" placeholder="Cari layanan..." aria-label="Cari layanan" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit">Go</button>
      </form>
      <div className="brand">
        <img className="avatar" src={left} alt="Bupati Lamongan" />
        <h1>PEMKAB LAMONGAN</h1>
        <img className="avatar" src={right} alt="Wakil Bupati Lamongan" />
      </div>
    </header>
  )
}
