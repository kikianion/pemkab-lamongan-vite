const API_BASE = '/api'

export async function fetchStages() {
  try {
    const res = await fetch(`${API_BASE}/stages`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Failed to load stages from API, falling back to local data', err)
    return null
  }
}

export async function fetchMapServices(query = '') {
  try {
    const url = query
      ? `${API_BASE}/services/map?q=${encodeURIComponent(query)}`
      : `${API_BASE}/services/map`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Failed to load map services from API, falling back to local data', err)
    return null
  }
}

export async function fetchServices(stageId = null) {
  try {
    const url = stageId ? `${API_BASE}/services?stage_id=${stageId}` : `${API_BASE}/services`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Failed to load services from API, falling back to local data', err)
    return null
  }
}

export async function fetchPariwisataMap(query = '') {
  try {
    const url = query
      ? `${API_BASE}/pariwisata/map?q=${encodeURIComponent(query)}`
      : `${API_BASE}/pariwisata/map`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Failed to load pariwisata map from API, falling back to local data', err)
    return null
  }
}

async function fetchMapList(path, query, label) {
  try {
    const url = query ? `${API_BASE}/${path}?q=${encodeURIComponent(query)}` : `${API_BASE}/${path}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`Failed to load ${label} map from API`, err)
    return null
  }
}

export const fetchIndustriMap = (query = '') => fetchMapList('industri/map', query, 'industri')
export const fetchDinasMap = (query = '') => fetchMapList('dinas/map', query, 'dinas')

export async function fetchTourism() {
  try {
    const res = await fetch(`${API_BASE}/pariwisata`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Failed to load tourism from API, falling back to local data', err)
    return null
  }
}
