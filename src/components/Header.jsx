import { useEffect, useRef, useState } from 'react'
import left from '../assets/portrait-left.jpg'
import right from '../assets/portrait-right.jpg'
import frontLogo from '../assets/front-logo.gif'
import { fetchWebSettings } from '../api'

const DEFAULT_TITLE = 'PEMKAB LAMONGAN'

export default function Header({ children, navSlot }) {
  const [collapsed, setCollapsed] = useState(false)
  const topRef = useRef(null)
  const initialMapTop = useRef(0)
  const [settings, setSettings] = useState(null)

  // Portal title + leader avatars from /api/web-settings; local values stay as fallback
  useEffect(() => {
    let alive = true
    fetchWebSettings().then((s) => { if (alive && s) setSettings(s) })
    return () => { alive = false }
  }, [])

  const title = settings?.app_title || settings?.site_title || DEFAULT_TITLE
  // Split the portal title into two lines: primary (first words) + smaller secondary (last two words)
  const titleWords = String(title).trim().split(/\s+/)
  const titleSub = titleWords.length > 2 ? titleWords.slice(-2).join(' ') : ''
  const titleMain = titleWords.length > 2 ? titleWords.slice(0, -2).join(' ') : title
  const bupatiSrc = settings?.bupati_avatar || settings?.bupati?.foto_url || left
  const wakilSrc = settings?.wakil_avatar || settings?.wakil_bupati?.foto_url || right
  const bupatiAlt = settings?.bupati_name ? `Bupati: ${settings.bupati_name}` : 'Bupati Lamongan'
  const wakilAlt = settings?.wakil_bupati_name ? `Wakil Bupati: ${settings.wakil_bupati_name}` : 'Wakil Bupati Lamongan'
  // If a backend avatar URL fails to load, fall back to the bundled portrait
  const onAvatarError = (fallback) => (e) => {
    if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback
  }

  useEffect(() => {
    const mapEl = () => document.querySelector('.map')

    const measure = () => {
      const m = mapEl()
      if (m) initialMapTop.current = m.getBoundingClientRect().top + window.scrollY
    }
    const onScroll = () => {
      if (window.innerWidth >= 1100) {
        setCollapsed(false)
        document.body.removeAttribute('data-search-collapsed')
        return
      }
      const m = mapEl()
      if (!m) return
      const mapViewportTop = m.getBoundingClientRect().top
      const next = mapViewportTop <= initialMapTop.current / 2
      setCollapsed(next)
      if (next) document.body.setAttribute('data-search-collapsed', '')
      else document.body.removeAttribute('data-search-collapsed')
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
    <header className="top debug2" ref={topRef}>
      {/* Header Search Slot */}
      <div className={`header-search-slot${collapsed ? ' collapsed' : ''}`}>
        {children}
      </div>

      <div className="brand">
        <img className="avatar" src={bupatiSrc} alt={bupatiAlt} onError={onAvatarError(left)} />
        <div className="brand-logo-wrap">
          <img
            className="brand-logo-desktop"
            src={frontLogo}
            alt="Logo Pemkab Lamongan"
          />
        </div>
        <h1>
          <span className="brand-title-main">{titleMain}</span>
          {titleSub && <span className="brand-title-sub">{titleSub}</span>}
        </h1>
        <img className="avatar" src={wakilSrc} alt={wakilAlt} onError={onAvatarError(right)} />
      </div>

      {/* Target anchor slot for the desktop navigation buttons */}
      <div className="tabs--header">
        {navSlot}
      </div>
    </header>
  )
}
