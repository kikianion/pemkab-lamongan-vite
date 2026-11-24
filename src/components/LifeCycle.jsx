import { useEffect, useRef, useState } from 'react'
import Icon, { Lines } from './Icon'
import ServiceCards from './ServiceCards'
import { STAGES, TOURISM, INDUSTRI, DINAS } from '../data'
import { fetchTourism } from '../api'

const Chevron = ({ d }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const CATEGORIES = ['Siklus hidup warga', 'Pariwisata', 'Industri', 'Dinas']

// Tabs that show a plain vertical list of cards (no lifecycle grouping)
const LIST_PANELS = {
  Pariwisata: TOURISM,
  Industri: INDUSTRI,
  Dinas: DINAS,
}

export default function LifeCycle({ cur, setCur, activeServiceId, cat: catProp, setCat: setCatProp }) {
  const x0 = useRef(null)
  const catsRef = useRef(null)
  const scrollCats = (dir) => {
    const el = catsRef.current
    if (el) el.scrollBy({ left: dir * Math.max(120, el.clientWidth * 0.6), behavior: 'smooth' })
  }
  // Active category can be controlled by parent (so the map can filter by it)
  const [catLocal, setCatLocal] = useState(CATEGORIES[0])
  const cat = catProp ?? catLocal
  const setCat = setCatProp ?? setCatLocal
  const [apiTourism, setApiTourism] = useState(null)

  useEffect(() => {
    let isMounted = true
    fetchTourism().then((data) => {
      if (!isMounted) return
      setApiTourism(Array.isArray(data) && data.length > 0 ? data : null)
    })
    return () => { isMounted = false }
  }, [])

  // Pariwisata: API data when available, otherwise the local fallback list
  const tourismItems = apiTourism
    ? apiTourism.map((t) => ({
        id: t.id,
        icon: t.icon_url || t.icon_raw ? 'doc' : (t.icon || 'doc'),
        iconUrl: t.icon_url || null,
        iconRaw: t.icon_url ? null : (t.icon_raw || null),
        title: t.title ?? t.nama ?? t.name ?? '',
        url: t.url ?? null,
      }))
    : TOURISM
  const listItems = cat === 'Pariwisata' ? tourismItems : LIST_PANELS[cat]
  const isAll = cur === 'all'
  const curNum = typeof cur === 'number' ? cur : -1

  const go = (k) => setCur(Math.max(0, Math.min(STAGES.length - 1, k)))

  return (
    <section className="life debug2" aria-label="Siklus hidup warga" id="life">
      <div className="life-cats-wrap">
      <button type="button" className="life-cats-arrow l" aria-label="Kategori sebelumnya" onClick={() => scrollCats(-1)}><Chevron d="m15 5-7 7 7 7" /></button>
      <div ref={catsRef} className="life-cats xdebug2" role="tablist" aria-label="Kategori" id="life-cats">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="tab"
            aria-selected={cat === c}
            className={`life-cat${cat === c ? ' on' : ''}`}
            onClick={(e) => {
              setCat(c)
              e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <button type="button" className="life-cats-arrow r" aria-label="Kategori berikutnya" onClick={() => scrollCats(1)}><Chevron d="m9 5 7 7-7 7" /></button>
      </div>
      {cat === CATEGORIES[0] && (
      <div className="life-panel" role="tabpanel" id="life-panel-siklus" aria-label={CATEGORIES[0]}>
      <div className="life-header-row xdebug2" id="life-header-row">
        <h2>SIKLUS HIDUP WARGA</h2>
        <button
          type="button"
          className={`all-stages-btn${isAll ? ' active' : ''}`}
          onClick={() => setCur(isAll ? 0 : 'all')}
          title="Tampilkan semua layanan dan titik lokasi tanpa filter tahapan"
        >
          <span className="dot"></span>
          <span>{isAll ? '✓ Semua Layanan (Aktif)' : 'Tampilkan Semua Layanan'}</span>
        </button>
      </div>

      <div className="life-body xdebug2">
      <div
        className="rail"
        onPointerDown={(e) => (x0.current = e.clientX)}
        onPointerUp={(e) => {
          if (x0.current !== null && Math.abs(e.clientX - x0.current) > 40) {
            const nextIdx = (curNum >= 0 ? curNum : 0) + (e.clientX < x0.current ? 1 : -1)
            go(nextIdx)
          }
          x0.current = null
        }}
      >
        {STAGES.map((s, k) => (
          <button
            key={k}
            className={`item${k === curNum ? ' on' : ''}${curNum >= 0 && k < curNum ? ' done' : ''}`}
            aria-pressed={k === curNum}
            onClick={() => go(k)}
          >
            <span className="ic"><Icon name={s.icon} /></span>
            <span className="lb"><span><Lines lines={s.label} /></span></span>
            <span className="tr" />
            <span className="chip">&#x2B24;</span>
          </button>
        ))}
      </div>
      <button className="arrow l " aria-label="Sebelumnya" disabled={curNum <= 0} onClick={() => go(curNum - 1)}><Chevron d="m15 5-7 7 7 7" /></button>
      <button className="arrow r " aria-label="Berikutnya" disabled={curNum >= STAGES.length - 1} onClick={() => go(curNum + 1)}><Chevron d="m9 5 7 7-7 7" /></button>
      </div>
      <ServiceCards stage={cur} activeServiceId={activeServiceId} />
      </div>
      )}

      {LIST_PANELS[cat] && (
      <div className="life-panel debug2" role="tabpanel" key={cat} id={`life-panel-${cat.toLowerCase()}`} aria-label={cat}>
        <div className="life-header-row">
          <h2>{cat.toUpperCase()}</h2>
        </div>
        <div className="cards cards-vertical">
          {listItems.map((item) => (
            <button
              className="card"
              key={item.id}
              type="button"
              onClick={() => item.url && window.open(item.url, '_blank')}
            >
              <span className="tile"><Icon name={item.icon} url={item.iconUrl} raw={item.iconRaw} /></span>
              <b>{item.title}</b>
            </button>
          ))}
        </div>
      </div>
      )}
    </section>
  )
}
