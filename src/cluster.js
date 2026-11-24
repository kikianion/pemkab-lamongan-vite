// Greedy screen-space clustering for map pins.
// Pins live in percent coords (left/top, 0-100) over the map canvas. Distance is
// measured in canvas px divided by zoom scale, so clusters split as the user zooms in.

export const CLUSTER_RADIUS_PX = 44 // on-screen distance under which pins merge

/**
 * @param {Array} pins        items with { left, top } in percent
 * @param {Object} opts
 * @param {number} opts.width   canvas width in px (unscaled)
 * @param {number} opts.height  canvas height in px (unscaled)
 * @param {number} opts.scale   current zoom scale
 * @param {number} opts.maxScale zoom level at which clustering is disabled
 * @param {(p:Object)=>boolean} [opts.canCluster] return false to always show a pin on its own
 * @returns {{ singles: Array, clusters: Array<{id:string,left:number,top:number,count:number,tone:string,members:Array}> }}
 */
export function clusterPins(pins, { width, height, scale, maxScale, canCluster = () => true }) {
  if (!width || !height || scale >= maxScale) return { singles: pins, clusters: [] }

  const limit = CLUSTER_RADIUS_PX / scale
  const groups = []
  const loose = []

  for (const p of pins) {
    if (!canCluster(p) || !Number.isFinite(p.left) || !Number.isFinite(p.top)) {
      loose.push(p)
      continue
    }
    const px = (p.left / 100) * width
    const py = (p.top / 100) * height
    let target = null
    for (const g of groups) {
      if (Math.hypot(g.cx - px, g.cy - py) <= limit) { target = g; break }
    }
    if (target) {
      target.members.push(p)
      const n = target.members.length
      target.cx += (px - target.cx) / n
      target.cy += (py - target.cy) / n
    } else {
      groups.push({ cx: px, cy: py, members: [p] })
    }
  }

  const singles = [...loose]
  const clusters = []
  for (const g of groups) {
    if (g.members.length === 1) {
      singles.push(g.members[0])
    } else {
      clusters.push({
        id: `cluster-${g.members.map((m) => m.id).join('|')}`,
        left: (g.cx / width) * 100,
        top: (g.cy / height) * 100,
        count: g.members.length,
        tone: g.members[0].tone || 'teal',
        members: g.members,
      })
    }
  }
  return { singles, clusters }
}
