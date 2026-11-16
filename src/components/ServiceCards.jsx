import Icon from './Icon'
import { CARDS } from '../data'

export default function ServiceCards({ stage }) {
  return (
    <section className="cards">
      {CARDS[stage].map(([icon, title]) => (
        <button className="card" key={title}>
          <span className="tile"><Icon name={icon} /></span>
          <b>{title}</b>
        </button>
      ))}
    </section>
  )
}
