const P = { viewBox: '0 0 24 24', width: 30, height: 30, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinejoin: 'round', strokeLinecap: 'round' }
const TABS = [
  ['Beranda', <svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 3 3 10.5V20a1 1 0 0 0 1 1h5v-6h6v6h5a1 1 0 0 0 1-1v-9.5z" fill="currentColor" /></svg>],
  ['Peta', <svg {...P}><path d="m3 6.5 6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5zM9 4v13.5M15 6.5V20" /></svg>],
  ['Layanan', <svg {...P}><path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5" /></svg>],
  ['Lapor', <svg {...P}><path d="M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-6l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM15 9.5h3.5M17 8l1.5 1.5L17 11" /></svg>],
]

export default function TabBar({ active, onChange }) {
  return (
    <nav className="tabs" aria-label="Navigasi utama">
      {TABS.map(([name, icon]) => (
        <a key={name} href="#" className={name === active ? 'on' : ''} onClick={(e) => { e.preventDefault(); onChange(name) }}>
          {icon}{name}
        </a>
      ))}
    </nav>
  )
}
