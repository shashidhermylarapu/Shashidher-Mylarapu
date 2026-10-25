// Animated canvases projected onto the side walls of the room.
// They are drawn light-on-black and rendered additively, so black reads as "no light".
const W = 1280
const H = 720
const COND = '"Sofia Sans Condensed", "Arial Narrow", sans-serif'
const MONO = '"Spline Sans Mono", ui-monospace, monospace'
const INK = 'rgba(236,236,236,.92)'
const DIM = 'rgba(236,236,236,.42)'

function makeCanvas() {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  return c
}

function header(ctx, left, right) {
  ctx.fillStyle = DIM
  ctx.font = `400 24px ${MONO}`
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillText(left, 56, 44)
  ctx.textAlign = 'right'
  ctx.fillText(right, W - 56, 44)
  ctx.textAlign = 'left'
  ctx.fillRect(56, 86, W - 112, 2)
}

// Lighten the work accent so it still reads as projected light
function glow(hex, mix = 0.45) {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * mix))
  return `rgb(${ch.join(',')})`
}

const ease = (t) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3)

// FIG. A — a training run typed out like a terminal session
export function createTerminal() {
  const canvas = makeCanvas()
  const ctx = canvas.getContext('2d')
  let work = null
  let t0 = 0

  const PROMPT = 'shashidher@mle:~$ '
  const CPS = 34 // typed characters per second

  return {
    canvas,
    setWork(w) { work = w; t0 = performance.now() },
    draw(now) {
      if (!work) return
      const { cmd, steps, result } = work.run
      let t = (now - t0) / 1000
      const tCmd = cmd.length / CPS
      const tSteps = tCmd + 0.4
      const tTrain = tSteps + steps.length * 0.75
      const tResult = tTrain + 2.2
      const tEnd = tResult + result.length * 0.45 + 5
      if (t > tEnd) { t0 = now; t = 0 }

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      header(ctx, 'FIG. A — TRAINING RUN', work.title.toUpperCase())

      let y = 128
      ctx.font = `400 30px ${MONO}`
      ctx.fillStyle = DIM
      ctx.fillText(PROMPT, 56, y)
      const px = 56 + ctx.measureText(PROMPT).width
      ctx.fillStyle = INK
      const typed = cmd.slice(0, Math.floor(t * CPS))
      ctx.fillText(typed, px, y)
      let cursorX = px + ctx.measureText(typed).width
      let cursorY = y

      y += 64
      steps.forEach((s, i) => {
        const ts = tSteps + i * 0.75
        if (t < ts) return
        ctx.fillStyle = DIM
        ctx.fillText('▸', 56, y)
        ctx.fillStyle = INK
        ctx.fillText(s.toUpperCase(), 96, y)
        ctx.textAlign = 'right'
        ctx.fillStyle = t > ts + 0.5 ? INK : DIM
        ctx.fillText(t > ts + 0.5 ? 'OK' : '…', W - 56, y)
        ctx.textAlign = 'left'
        cursorX = -1
        y += 50
      })

      if (t >= tTrain) {
        y += 10
        const p = ease((t - tTrain) / 2)
        const cells = 28
        ctx.fillStyle = DIM
        ctx.fillText('TRAIN', 56, y)
        const bx = 196, bw = 760, cw = bw / cells
        for (let i = 0; i < cells; i++) {
          ctx.fillStyle = i < Math.round(p * cells) ? glow(work.accent, 0.55) : 'rgba(236,236,236,.12)'
          ctx.fillRect(bx + i * cw, y + 4, cw - 6, 26)
        }
        ctx.fillStyle = INK
        ctx.textAlign = 'right'
        ctx.fillText(`${Math.round(p * 100)}%`, W - 56, y)
        ctx.textAlign = 'left'
        y += 70
      }

      result.forEach((r, i) => {
        const tr = tResult + i * 0.45
        if (t < tr) return
        const a = ease((t - tr) / 0.4)
        ctx.globalAlpha = a
        ctx.fillStyle = glow(work.accent, 0.6)
        ctx.font = `800 46px ${COND}`
        ctx.fillText(`✓ ${r.toUpperCase()}`, 56, y - (1 - a) * 12)
        ctx.globalAlpha = 1
        ctx.font = `400 30px ${MONO}`
        y += 58
        cursorX = -1
      })

      // blinking block cursor
      if (Math.floor(now / 480) % 2 === 0) {
        ctx.fillStyle = INK
        if (cursorX >= 0) ctx.fillRect(cursorX + 4, cursorY + 2, 16, 30)
        else ctx.fillRect(56, Math.min(y, H - 60), 16, 30)
      }
    },
  }
}

function parseMetric(m) {
  const match = m.match(/^([^\d]*)([\d.,]+)(.*)$/)
  if (!match) return null
  const [, pre, num, post] = match
  const decimals = num.includes('.') ? num.split('.')[1].length : 0
  return { pre, value: parseFloat(num.replace(/,/g, '')), post, decimals }
}

// FIG. B — the project's stack as a living system map with data packets flowing through it
export function createSystemMap() {
  const canvas = makeCanvas()
  const ctx = canvas.getContext('2d')
  let work = null
  let t0 = 0

  return {
    canvas,
    setWork(w) { work = w; t0 = performance.now() },
    draw(now) {
      if (!work) return
      const t = (now - t0) / 1000
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      header(ctx, 'FIG. B — SYSTEM MAP', work.category.toUpperCase())

      // metric counts up
      const m = parseMetric(work.metric)
      const p = ease(t / 1.4)
      const shown = m ? `${m.pre}${(m.value * p).toFixed(m.decimals)}${m.post}` : work.metric
      ctx.fillStyle = glow(work.accent, 0.5)
      ctx.font = `800 210px ${COND}`
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(shown, 50, 300)
      ctx.fillStyle = INK
      ctx.font = `400 26px ${MONO}`
      ctx.fillText(work.metricLabel.toUpperCase(), 58, 344)
      ctx.textBaseline = 'top'

      // pipeline nodes
      const nodes = work.stack
      const n = nodes.length
      const margin = 56, gap = 54, top = 430, bh = 112
      const bw = (W - margin * 2 - gap * (n - 1)) / n
      const active = Math.floor(t / 0.9) % n
      const xs = nodes.map((_, i) => margin + i * (bw + gap))

      // connectors with travelling packets
      for (let i = 0; i < n - 1; i++) {
        const x1 = xs[i] + bw, x2 = xs[i + 1], cy = top + bh / 2
        ctx.fillStyle = DIM
        ctx.fillRect(x1, cy - 1, x2 - x1, 2)
        for (let k = 0; k < 2; k++) {
          const f = ((t * 0.9 + k * 0.5 + i * 0.18) % 1)
          ctx.fillStyle = glow(work.accent, 0.6)
          ctx.fillRect(x1 + f * (x2 - x1) - 5, cy - 5, 10, 10)
        }
      }

      nodes.forEach((label, i) => {
        const x = xs[i]
        const on = i === active
        ctx.lineWidth = 3
        ctx.strokeStyle = on ? INK : DIM
        if (on) { ctx.fillStyle = 'rgba(236,236,236,.9)'; ctx.fillRect(x, top, bw, bh) }
        ctx.strokeRect(x, top, bw, bh)
        ctx.fillStyle = on ? '#000' : DIM
        ctx.font = `400 18px ${MONO}`
        ctx.fillText(String(i + 1).padStart(2, '0'), x + 16, top + 14)
        // shrink long labels to fit the box
        let size = 30
        const text = label.toUpperCase()
        ctx.font = `800 ${size}px ${COND}`
        while (ctx.measureText(text).width > bw - 32 && size > 16) { size -= 1; ctx.font = `800 ${size}px ${COND}` }
        ctx.fillStyle = on ? '#000' : INK
        ctx.fillText(text, x + 16, top + bh - size - 16)
      })

      ctx.fillStyle = DIM
      ctx.font = `400 22px ${MONO}`
      ctx.fillText('DATA  →  MODEL  →  PRODUCTION', margin, top + bh + 46)
      ctx.textAlign = 'right'
      ctx.fillText(work.org.toUpperCase(), W - margin, top + bh + 46)
      ctx.textAlign = 'left'
    },
  }
}
