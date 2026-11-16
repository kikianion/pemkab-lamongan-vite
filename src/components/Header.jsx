import { useState } from 'react'
import left from '../assets/portrait-left.jpg'
import right from '../assets/portrait-right.jpg'

export default function Header({ onSearch }) {
  const [q, setQ] = useState('')
  return (
    <header className="top">
      <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); onSearch(q.trim()) }}>
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
