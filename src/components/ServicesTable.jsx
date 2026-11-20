import { useEffect, useState } from 'react'
import Icon from './Icon'
import { fetchServices } from '../api'

export default function ServicesTable({ query, onSelectService }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState('all')

  useEffect(() => {
    let isMounted = true
    fetchServices().then((data) => {
      if (!isMounted) return
      if (Array.isArray(data)) {
        setServices(data)
      }
      setLoading(false)
    })
    return () => { isMounted = false }
  }, [])

  const q = (query || '').toLowerCase().trim()

  const filtered = services.filter((s) => {
    const matchQuery = !q || s.title.toLowerCase().includes(q)
    const matchStage = selectedStage === 'all' || String(s.stage_id) === String(selectedStage)
    return matchQuery && matchStage
  })

  const stagesList = [
    { id: 'all', label: 'Semua Layanan' },
    { id: '1', label: 'Kelahiran' },
    { id: '2', label: 'Sekolah' },
    { id: '3', label: 'KTP & Kuliah' },
    { id: '4', label: 'Kerja' },
    { id: '5', label: 'Lansia' },
  ]

  return (
    <section className="services-tabular-section" aria-label="Daftar Layanan Publik">
      <div className="tabular-header-bar">
        <div className="tabular-title-group">
          <h2>Katalog Layanan Publik</h2>
          <span className="tabular-count-badge">{filtered.length} Layanan</span>
        </div>
        {/* Placeholder slot where the search box visually docks */}
        <div id="search-slot-table" className="search-dock-target"></div>
      </div>

      <div className="tabular-filter-pills">
        {stagesList.map((stg) => (
          <button
            key={stg.id}
            type="button"
            className={`stage-pill-btn${selectedStage === stg.id ? ' active' : ''}`}
            onClick={() => setSelectedStage(stg.id)}
          >
            {stg.label}
          </button>
        ))}
      </div>

      <div className="tabular-card">
        {loading ? (
          <div className="tabular-loading">Memuat daftar layanan...</div>
        ) : filtered.length === 0 ? (
          <div className="tabular-empty">
            Tidak ada layanan yang sesuai dengan kriteria pencarian "{query}".
          </div>
        ) : (
          <div className="tabular-table-wrapper">
            <table className="services-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Icon</th>
                  <th>Nama Layanan</th>
                  <th>Tahapan Siklus</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-icon-box">
                        <Icon name={item.icon} />
                      </div>
                    </td>
                    <td>
                      <div className="table-service-title">{item.title}</div>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-service-link"
                        >
                          {item.url.replace(/^https?:\/\//, '').slice(0, 35)}... ↗
                        </a>
                      )}
                    </td>
                    <td>
                      <span className="table-stage-badge">
                        {item.stage
                          ? Array.isArray(item.stage.label)
                            ? item.stage.label.join(' ')
                            : item.stage.label
                          : `Tahap ${item.stage_id}`}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-group">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="table-btn-primary"
                          >
                            Buka Layanan ↗
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="table-btn-secondary"
                            onClick={() => onSelectService && onSelectService(item)}
                          >
                            Lihat Info
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
