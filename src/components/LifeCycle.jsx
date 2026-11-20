import { useRef } from 'react'
import Icon, { Lines } from './Icon'
import { STAGES } from '../data'

const Chevron = ({ d }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

export default function LifeCycle({ cur, setCur }) {
  const x0 = useRef(null)
  const isAll = cur === 'all'
  const curNum = typeof cur === 'number' ? cur : -1

  const go = (k) => setCur(Math.max(0, Math.min(STAGES.length - 1, k)))

  return (
    <section className="life" aria-label="Siklus hidup warga">
      <div className="life-header-row">
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
    </section>
  )
}
