import { useState } from 'react'
import Sprite from './components/Sprite'
import portraitLeft from './assets/portrait-left.jpg'
import portraitRight from './assets/portrait-right.jpg'
import Header from './components/Header'
import MapSection from './components/MapSection'
import LifeCycle from './components/LifeCycle'
import DebugWidth from './components/DebugWidth'
import ServiceCards from './components/ServiceCards'
import TabBar from './components/TabBar'

const KTP_STAGE = 2

export default function App() {
  const [stage, setStage] = useState(KTP_STAGE)
  const [query, setQuery] = useState('')
  const [hit, setHit] = useState({ id: null, tick: 0 })
  const [tab, setTab] = useState('Beranda')

  const handlePinClick = (pin) => {
    setHit((h) => ({ id: pin.id, tick: h.tick + 1 }))
    // If the service is associated with a specific stage, switch to that stage
    if (typeof pin.stage_id === 'number') {
      setStage(pin.stage_id - 1)
    }
  }

  return (
    <main className="app debug">
      <Sprite />
      <img className="side-portrait left" src={portraitLeft} alt="Bupati Lamongan" />
      <Header onSearch={setQuery} active={tab} onChange={setTab} />
      <MapSection
        query={query}
        hit={hit}
        onPin={handlePinClick}
      />
      <LifeCycle cur={stage} setCur={setStage} />
      <ServiceCards stage={stage} activeServiceId={hit.id} />
      <TabBar active={tab} onChange={setTab} />
      <img className="side-portrait right" src={portraitRight} alt="Wakil Bupati Lamongan" />
      <DebugWidth />
    </main>
  )
}
