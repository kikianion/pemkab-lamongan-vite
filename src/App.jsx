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

  return (
    <main className="app debug">
      <Sprite />
      <img className="side-portrait left" src={portraitLeft} alt="Bupati Lamongan" />
      <Header onSearch={setQuery} />
      <MapSection
        query={query}
        hit={hit}
        onPin={(id) => { setHit((h) => ({ id, tick: h.tick + 1 })); setStage(KTP_STAGE) }}
      />
      <LifeCycle cur={stage} setCur={setStage} />
      <ServiceCards stage={stage} />
      <TabBar active={tab} onChange={setTab} />
      <img className="side-portrait right" src={portraitRight} alt="Wakil Bupati Lamongan" />
      <DebugWidth />
    </main>
  )
}
