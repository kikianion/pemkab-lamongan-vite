import { MAP_SERVICES, MAP_WISATA, MAP_INDUSTRI, MAP_DINAS } from './data'

// VITE_API_BASE: backend API base URL (e.g. http://127.0.0.1:8000/api). Default: '/api' (Vite proxy).
export const API_BASE = String(import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '')

// Static fallback list filtered by search query (same shape as the API response).
const staticList = (list, query) => {
  const q = (query || '').toLowerCase()
  return q ? list.filter((r) => (r.nama || r.title || '').toLowerCase().includes(q)) : list
}

// VITE_USE_API=false -> skip all backend calls, use static src/data.js. Default: true.
export const USE_API = String(import.meta.env.VITE_USE_API ?? 'true').toLowerCase() !== 'false'

export async function fetchStages() {
  if (!USE_API) return null
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
  if (!USE_API) return staticList(MAP_SERVICES, query)
  try {
    const url = query
      ? `${API_BASE}/services/map?q=${encodeURIComponent(query)}`
      : `${API_BASE}/services/map`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Failed to load map services from API, falling back to local data', err)
    return staticList(MAP_SERVICES, query)
  }
}

export async function fetchServices(stageId = null) {
  if (!USE_API) return null
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
  if (!USE_API) return staticList(MAP_WISATA, query)
  try {
    const url = query
      ? `${API_BASE}/pariwisata/map?q=${encodeURIComponent(query)}`
      : `${API_BASE}/pariwisata/map`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Failed to load pariwisata map from API, falling back to local data', err)
    return staticList(MAP_WISATA, query)
  }
}

async function fetchMapList(path, query, label, fallback) {
  if (!USE_API) return staticList(fallback, query)
  try {
    const url = query ? `${API_BASE}/${path}?q=${encodeURIComponent(query)}` : `${API_BASE}/${path}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`Failed to load ${label} map from API, falling back to local data`, err)
    return staticList(fallback, query)
  }
}

export const fetchIndustriMap = (query = '') => fetchMapList('industri/map', query, 'industri', MAP_INDUSTRI)
export const fetchDinasMap = (query = '') => fetchMapList('dinas/map', query, 'dinas', MAP_DINAS)

// Portal branding + leadership (title, bupati/wakil names and avatar URLs). null -> caller uses local defaults.
export async function fetchWebSettings() {
  if (!USE_API) return null
  try {
    const res = await fetch(`${API_BASE}/web-settings`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Failed to load web settings from API, using local defaults', err)
    return null
  }
}

export async function fetchTourism() {
  if (!USE_API) return null
  try {
    const res = await fetch(`${API_BASE}/pariwisata`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Failed to load tourism from API, falling back to local data', err)
    return null
  }
}
