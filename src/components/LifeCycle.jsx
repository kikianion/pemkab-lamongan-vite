import { useRef, useState } from 'react'
import Icon, { Lines } from './Icon'
import { STAGES } from '../data'

const Chevron = ({ d }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

const CATEGORIES = ['Siklus hidup warga', 'Pariwisata', 'Industri', 'Dinas']

export default function LifeCycle({ cur, setCur }) {
  const x0 = useRef(null)
  const catsRef = useRef(null)
  const scrollCats = (dir) => {
    const el = catsRef.current
    if (el) el.scrollBy({ left: dir * Math.max(120, el.clientWidth * 0.6), behavior: 'smooth' })
  }
  const [cat, setCat] = useState(CATEGORIES[0])
  const isAll = cur === 'all'
  const curNum = typeof cur === 'number' ? cur : -1

  const go = (k) => setCur(Math.max(0, Math.min(STAGES.length - 1, k)))

  return (
    <section className="life debug2" aria-label="Siklus hidup warga" id="life">
      <div className="life-cats-wrap">
      <button type="button" className="life-cats-arrow l" aria-label="Kategori sebelumnya" onClick={() => scrollCats(-1)}><Chevron d="m15 5-7 7 7 7" /></button>
      <div ref={catsRef} className="life-cats debug2" role="tablist" aria-label="Kategori" id="life-cats">
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

      <div className="life-body debug2">
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
      <button className="arrow l" aria-label="Sebelumnya" disabled={curNum <= 0} onClick={() => go(curNum - 1)}><Chevron d="m15 5-7 7 7 7" /></button>
      <button className="arrow r" aria-label="Berikutnya" disabled={curNum >= STAGES.length - 1} onClick={() => go(curNum + 1)}><Chevron d="m9 5 7 7-7 7" /></button>
      </div>
    </section>
  )
}
