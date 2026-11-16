import { useRef } from 'react'
import Icon, { Lines } from './Icon'
import { STAGES } from '../data'

const Chevron = ({ d }) => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
)

export default function LifeCycle({ cur, setCur }) {
  const x0 = useRef(null)
  const go = (k) => setCur(Math.max(0, Math.min(STAGES.length - 1, k)))
  return (
    <section className="life" aria-label="Siklus hidup warga">
      <h2>SIKLUS HIDUP WARGA</h2>
      <div
        className="rail"
        onPointerDown={(e) => (x0.current = e.clientX)}
        onPointerUp={(e) => {
          if (x0.current !== null && Math.abs(e.clientX - x0.current) > 40) go(cur + (e.clientX < x0.current ? 1 : -1))
          x0.current = null
        }}
      >
        {STAGES.map((s, k) => (
          <button key={k} className={`item${k === cur ? ' on' : ''}${k < cur ? ' done' : ''}`} aria-pressed={k === cur} onClick={() => go(k)}>
            <span className="ic"><Icon name={s.icon} /></span>
            <span className="lb"><span><Lines lines={s.label} /></span></span>
            <span className="tr" />
            <span className="chip">Swipe</span>
          </button>
        ))}
      </div>
      <button className="arrow l" aria-label="Sebelumnya" disabled={cur === 0} onClick={() => go(cur - 1)}><Chevron d="m15 5-7 7 7 7" /></button>
      <button className="arrow r" aria-label="Berikutnya" disabled={cur === STAGES.length - 1} onClick={() => go(cur + 1)}><Chevron d="m9 5 7 7-7 7" /></button>
    </section>
  )
}
