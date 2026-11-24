// Lat/lon -> percent mapping for the stylized (non-projected) Lamongan SVG map.
// The SVG has no real projection, so a geographic bounding box is stretched
// linearly over the full image. These 4 constants are the ONLY calibration knob
// and MUST match the admin editor. Override via .env.local (VITE_GEO_*) if needed.
const num = (v, d) => (Number.isFinite(Number(v)) && v !== undefined && v !== '' ? Number(v) : d)

export const GEO = {
  latMin: num(import.meta.env.VITE_GEO_LAT_MIN, -7.35), // bottom of SVG
  latMax: num(import.meta.env.VITE_GEO_LAT_MAX, -6.85), // top of SVG
  lonMin: num(import.meta.env.VITE_GEO_LON_MIN, 112.05), // left of SVG
  lonMax: num(import.meta.env.VITE_GEO_LON_MAX, 112.55), // right of SVG
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

// Returns { x, y } in percent (0-100) or null when coordinates are missing/invalid.
export function latLonToPct(lat, lon) {
  if (lat === null || lat === undefined || lat === '' || lon === null || lon === undefined || lon === '') return null
  const la = Number(lat)
  const lo = Number(lon)
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null
  const x = ((lo - GEO.lonMin) / (GEO.lonMax - GEO.lonMin)) * 100
  const y = ((GEO.latMax - la) / (GEO.latMax - GEO.latMin)) * 100
  return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) }
}
