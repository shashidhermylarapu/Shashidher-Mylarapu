// Draws each work as a "website screenshot" that the projector shows on the screen
const W = 2048
const H = 1152
const COND = '"Sofia Sans Condensed", "Arial Narrow", sans-serif'
const MONO = '"Spline Sans Mono", ui-monospace, monospace'

function wrap(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w } else line = test
  }
  lines.push(line)
  return lines
}

function graphic(ctx, kind, accent, x, y, w, h) {
  ctx.save()
  ctx.strokeStyle = accent
  ctx.fillStyle = accent
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (kind === 'grid') {
    const n = 7, gap = 18, s = (Math.min(w, h) - gap * (n - 1)) / n
    const hot = new Set([9, 24, 31, 38])
    for (let i = 0; i < n * n; i++) {
      const cx = x + (i % n) * (s + gap), cy = y + Math.floor(i / n) * (s + gap)
      ctx.globalAlpha = hot.has(i) ? 1 : 0.16
      ctx.fillRect(cx, cy, s, s)
    }
    ctx.globalAlpha = 1
    ctx.beginPath(); ctx.arc(x + 2.5 * (s + gap) + s / 2, y + 1.3 * (s + gap) + s / 2, s * 1.6, 0, Math.PI * 2); ctx.stroke()
  } else if (kind === 'bars') {
    const vals = [0.42, 0.58, 0.5, 0.74, 0.66, 0.89]
    const bw = w / (vals.length * 1.6)
    vals.forEach((v, i) => {
      ctx.globalAlpha = i === vals.length - 1 ? 1 : 0.22
      ctx.fillRect(x + i * bw * 1.6, y + h - v * h, bw, v * h)
    })
  } else if (kind === 'line') {
    const pts = [0.2, 0.35, 0.3, 0.52, 0.47, 0.7, 0.66, 0.86]
    ctx.globalAlpha = 0.18
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x, y + (h / 4) * i); ctx.lineTo(x + w, y + (h / 4) * i); ctx.lineWidth = 2; ctx.stroke() }
    ctx.globalAlpha = 1; ctx.lineWidth = 10
    ctx.beginPath()
    pts.forEach((p, i) => { const px = x + (w / (pts.length - 1)) * i, py = y + h - p * h; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py) })
    ctx.stroke()
    const last = { x: x + w, y: y + h - pts[pts.length - 1] * h }
    ctx.beginPath(); ctx.arc(last.x, last.y, 22, 0, Math.PI * 2); ctx.fill()
  } else if (kind === 'nodes') {
    const nodes = [[0.5, 0.12], [0.15, 0.48], [0.85, 0.48], [0.3, 0.88], [0.7, 0.88], [0.5, 0.55]]
    ctx.globalAlpha = 0.35; ctx.lineWidth = 4
    const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [5, 0], [5, 3], [5, 4], [1, 5], [2, 5]]
    edges.forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(x + nodes[a][0] * w, y + nodes[a][1] * h); ctx.lineTo(x + nodes[b][0] * w, y + nodes[b][1] * h); ctx.stroke() })
    ctx.globalAlpha = 1
    nodes.forEach(([nx, ny], i) => { ctx.beginPath(); ctx.arc(x + nx * w, y + ny * h, i === 5 ? 46 : 26, 0, Math.PI * 2); i === 5 ? ctx.fill() : (ctx.fillStyle = '#f4f3ef', ctx.fill(), ctx.fillStyle = accent, ctx.stroke()) })
  } else if (kind === 'docs') {
    for (let i = 3; i >= 0; i--) {
      const ox = x + i * 34, oy = y + i * 30
      ctx.globalAlpha = 1; ctx.fillStyle = '#f4f3ef'; ctx.fillRect(ox, oy, w * 0.62, h * 0.78)
      ctx.fillStyle = accent; ctx.globalAlpha = i === 0 ? 1 : 0.35; ctx.lineWidth = 4; ctx.strokeRect(ox, oy, w * 0.62, h * 0.78)
    }
    ctx.globalAlpha = 0.7
    for (let l = 0; l < 6; l++) ctx.fillRect(x + 40, y + 60 + l * 46, (w * 0.62 - 80) * (1 - l * 0.08), 14)
    ctx.globalAlpha = 1; ctx.lineWidth = 12
    ctx.beginPath(); ctx.arc(x + w * 0.72, y + h * 0.62, h * 0.2, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x + w * 0.72 + h * 0.15, y + h * 0.62 + h * 0.15); ctx.lineTo(x + w * 0.95, y + h * 0.98); ctx.stroke()
  } else if (kind === 'scan') {
    ctx.globalAlpha = 0.2; ctx.fillRect(x, y, w, h)
    ctx.globalAlpha = 1; ctx.lineWidth = 8
    const c = 70
    ;[[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([cx, cy, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(cx + c * dx, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + c * dy); ctx.stroke()
    })
    ctx.beginPath(); ctx.ellipse(x + w * 0.62, y + h * 0.4, 70, 46, 0.4, 0, Math.PI * 2); ctx.fill()
    ctx.fillRect(x, y + h * 0.55, w, 6)
  }
  ctx.restore()
}

export function drawPoster(work, index, total) {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const pad = 96

  ctx.fillStyle = '#f4f3ef'
  ctx.fillRect(0, 0, W, H)

  // faux site nav
  ctx.fillStyle = '#101010'
  ctx.font = `500 30px ${MONO}`
  ctx.textBaseline = 'top'
  ctx.fillText('SHASHIDHER M.', pad, 64)
  ctx.textAlign = 'right'
  ctx.fillText(`CASE ${String(index + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}     ${work.category.toUpperCase()}     ${work.year}`, W - pad, 64)
  ctx.textAlign = 'left'
  ctx.fillRect(pad, 120, W - pad * 2, 2)

  // title
  ctx.font = `800 150px ${COND}`
  ctx.textBaseline = 'alphabetic'
  const lines = wrap(ctx, work.title.toUpperCase(), 1150)
  lines.forEach((l, i) => ctx.fillText(l, pad - 6, 300 + i * 138))

  ctx.font = `400 30px ${MONO}`
  ctx.fillStyle = '#5a5a5a'
  wrap(ctx, work.summary.toUpperCase(), 1000).slice(0, 4).forEach((l, i) => ctx.fillText(l, pad, 300 + lines.length * 138 + 30 + i * 44))

  // metric
  ctx.fillStyle = work.accent
  ctx.font = `800 300px ${COND}`
  ctx.fillText(work.metric, pad - 10, H - 120)
  ctx.font = `500 30px ${MONO}`
  ctx.fillStyle = '#101010'
  ctx.fillText(work.metricLabel.toUpperCase(), pad, H - 70)

  graphic(ctx, work.graphic, work.accent, 1330, 220, 600, 600)

  ctx.font = `500 26px ${MONO}`
  ctx.fillStyle = '#101010'
  ctx.textAlign = 'right'
  ctx.fillText(work.org.toUpperCase(), W - pad, H - 70)
  return canvas
}
