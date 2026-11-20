import { useEffect, useState } from 'react'
import Icon from './Icon'
import { CARDS } from '../data'
import { fetchServices } from '../api'

export default function ServiceCards({ stage, activeServiceId }) {
  const [services, setServices] = useState([])

  useEffect(() => {
    let isMounted = true
    fetchServices().then((data) => {
      if (!isMounted) return
      if (Array.isArray(data) && data.length > 0) {
        setServices(data)
      } else {
        setServices([])
      }
    })
    return () => { isMounted = false }
  }, [])

  // Filter based on selected lifecycle stage
  const currentServices = services.filter((s) => s.stage_id === (stage + 1))

  // Fallback to static CARDS if API returns empty
  const displayItems = currentServices.length > 0
    ? currentServices.map((s) => ({
        id: s.id,
        icon: s.icon,
        title: s.title,
        url: s.url,
      }))
    : (CARDS[stage] || []).map(([icon, title]) => ({
        id: title,
        icon,
        title,
        url: null,
      }))

  return (
    <section className="cards">
      {displayItems.map((item) => (
        <button
          className={`card${activeServiceId === item.id ? ' active' : ''}`}
          key={item.id}
          onClick={() => item.url && window.open(item.url, '_blank')}
        >
          <span className="tile"><Icon name={item.icon} /></span>
          <b>{item.title}</b>
        </button>
      ))}
    </section>
  )
}
