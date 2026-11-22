import { useState } from 'react'
import Sprite from './components/Sprite'
import portraitLeft from './assets/portrait-left.jpg'
import portraitRight from './assets/portrait-right.jpg'
import Header from './components/Header'
import MapSection from './components/MapSection'
import LifeCycle from './components/LifeCycle'
import DebugWidth from './components/DebugWidth'
import ServiceCards from './components/ServiceCards'
import ServicesTable from './components/ServicesTable'
import TabBar from './components/TabBar'

const KTP_STAGE = 2

export default function App() {
  const [stage, setStage] = useState(KTP_STAGE)
  const [query, setQuery] = useState('')
  const [hit, setHit] = useState({ id: null, tick: 0 })
  const [tab, setTab] = useState('Beranda')

  // Map marker click: highlight only, do not change lifecycle stage
  const handlePinClick = (pin) => {
    setHit((h) => ({ id: pin.id, tick: h.tick + 1 }))
  }

  // "View on map" from Layanan table: keep stage sync
  const handleViewOnMap = (service) => {
    setTab('Peta')
    handlePinClick(service)
    if (typeof service.stage_id === 'number') {
      setStage(service.stage_id - 1)
    }
  }

  const isMapMode = tab === 'Peta'
  const isLayananMode = tab === 'Layanan'

  return (
    <main
      className={`app debug${isMapMode ? ' map-mode' : ''}${
        isLayananMode ? ' layanan-mode' : ''
      }`}
    >
      <Sprite />
      <img className="side-portrait left" src={portraitLeft} alt="Bupati Lamongan" />

      {/* Floating search form morphs between header and tabular header */}
      <form
        className={`search morphing-search ${isLayananMode ? 'docked-table' : 'docked-header'}`}
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <input
          type="search"
          placeholder="Cari layanan publik..."
          aria-label="Cari layanan"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#667',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        )}
      </form>

      {/* Single persistent morphing TabBar (ghost glide animation between header center and top-left map pill) */}
      <div className={`nav-morph-container ${isMapMode ? 'docked-map' : 'docked-header'}`}>
        <TabBar active={tab} onChange={setTab} />
      </div>

      <Header>
        {/* Placeholder spacer in header grid */}
        <div className="header-search-anchor" />
      </Header>

      {/* When in Layanan tab, show full Tabular view */}
      {isLayananMode ? (
        <ServicesTable
          query={query}
          onSelectService={(s) => {
            if (s.stage_id) setStage(s.stage_id - 1)
          }}
          onViewOnMap={handleViewOnMap}
        />
      ) : (
        <>
          <MapSection
            query={query}
            hit={hit}
            onPin={handlePinClick}
            currentStage={stage}
          />
          <LifeCycle cur={stage} setCur={setStage} />
          <ServiceCards stage={stage} activeServiceId={hit.id} />
        </>
      )}

      {/* Mobile bottom navigation */}
      <div className="mobile-bottom-tabs">
        <TabBar active={tab} onChange={setTab} />
      </div>

      <img className="side-portrait right" src={portraitRight} alt="Wakil Bupati Lamongan" />
      <DebugWidth />
    </main>
  )
}
