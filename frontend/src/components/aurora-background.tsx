"use client"

import { useEffect, useRef } from "react"

interface Spark {
  x: number
  y: number
  dir: "h" | "v"
  speed: number
  progress: number
  length: number
  hue: number
  thickness: number
}

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let rafId: number
    let sparks: Spark[] = []
    const grid = 48
    let cols = 0
    let rows = 0
    let w = 0
    let h = 0
    let lastTime = 0

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const rect = canvas!.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      ctx!.setTransform(1, 0, 0, 1, 0, 0)
      ctx!.scale(dpr, dpr)
      cols = Math.ceil(w / grid)
      rows = Math.ceil(h / grid)
    }

    function spawnSpark(): Spark {
      const horizontal = Math.random() > 0.5
      const hue = Math.random() * 140 + 160
      return {
        x: horizontal ? 0 : Math.floor(Math.random() * cols) * grid,
        y: horizontal ? Math.floor(Math.random() * rows) * grid : 0,
        dir: horizontal ? "h" : "v",
        speed: 0.008 + Math.random() * 0.015,
        progress: 0,
        length: 60 + Math.random() * 120,
        hue,
        thickness: 1 + Math.random() * 1.5,
      }
    }

    function initSparks() {
      const count = Math.min(Math.floor((cols + rows) / 12), 6)
      sparks = Array.from({ length: count }, spawnSpark)
    }

    function drawSpark(s: Spark, dt: number) {
      s.progress += s.speed * dt * 0.06

      let x1: number, y1: number, x2: number, y2: number

      if (s.dir === "h") {
        const travel = w + s.length
        const px = s.progress * travel - s.length
        x1 = px
        y1 = s.y
        x2 = px + s.length
        y2 = s.y
        if (px > w) {
          Object.assign(s, spawnSpark())
          return
        }
      } else {
        const travel = h + s.length
        const py = s.progress * travel - s.length
        x1 = s.x
        y1 = py
        x2 = s.x
        y2 = py + s.length
        if (py > h) {
          Object.assign(s, spawnSpark())
          return
        }
      }

      // Draw illuminated grid lines in a radial area around spark
      const cx = (x1 + x2) / 2
      const cy = (y1 + y2) / 2
      const glowRadius = 250

      // Find grid lines within radius
      const startCol = Math.max(0, Math.floor((cx - glowRadius) / grid))
      const endCol = Math.min(cols, Math.ceil((cx + glowRadius) / grid))
      const startRow = Math.max(0, Math.floor((cy - glowRadius) / grid))
      const endRow = Math.min(rows, Math.ceil((cy + glowRadius) / grid))

      // Draw vertical grid lines within radius
      for (let col = startCol; col <= endCol; col++) {
        const lx = col * grid
        const dist = Math.abs(lx - cx)
        if (dist > glowRadius) continue
        const intensity = Math.pow(1 - dist / glowRadius, 1.5)
        const top = Math.max(0, cy - glowRadius)
        const bottom = Math.min(h, cy + glowRadius)
        const lineGrad = ctx!.createLinearGradient(0, top, 0, bottom)
        lineGrad.addColorStop(0, `hsla(${s.hue}, 80%, 60%, 0)`)
        lineGrad.addColorStop(0.5, `hsla(${s.hue}, 80%, 60%, ${0.18 * intensity})`)
        lineGrad.addColorStop(1, `hsla(${s.hue}, 80%, 60%, 0)`)
        ctx!.strokeStyle = lineGrad
        ctx!.lineWidth = 1
        ctx!.beginPath()
        ctx!.moveTo(lx, top)
        ctx!.lineTo(lx, bottom)
        ctx!.stroke()
      }

      // Draw horizontal grid lines within radius
      for (let row = startRow; row <= endRow; row++) {
        const ly = row * grid
        const dist = Math.abs(ly - cy)
        if (dist > glowRadius) continue
        const intensity = Math.pow(1 - dist / glowRadius, 1.5)
        const left = Math.max(0, cx - glowRadius)
        const right = Math.min(w, cx + glowRadius)
        const lineGrad = ctx!.createLinearGradient(left, 0, right, 0)
        lineGrad.addColorStop(0, `hsla(${s.hue}, 80%, 60%, 0)`)
        lineGrad.addColorStop(0.5, `hsla(${s.hue}, 80%, 60%, ${0.18 * intensity})`)
        lineGrad.addColorStop(1, `hsla(${s.hue}, 80%, 60%, 0)`)
        ctx!.strokeStyle = lineGrad
        ctx!.lineWidth = 1
        ctx!.beginPath()
        ctx!.moveTo(left, ly)
        ctx!.lineTo(right, ly)
        ctx!.stroke()
      }

      // Draw the spark trail itself
      const grad = ctx!.createLinearGradient(x1, y1, x2, y2)
      grad.addColorStop(0, `hsla(${s.hue}, 90%, 65%, 0)`)
      grad.addColorStop(0.5, `hsla(${s.hue}, 90%, 70%, 0.4)`)
      grad.addColorStop(1, `hsla(${s.hue}, 100%, 80%, 1)`)

      ctx!.strokeStyle = grad
      ctx!.lineWidth = s.thickness
      ctx!.lineCap = "round"
      ctx!.shadowBlur = 8
      ctx!.shadowColor = `hsla(${s.hue}, 100%, 70%, 0.8)`
      ctx!.beginPath()
      ctx!.moveTo(x1, y1)
      ctx!.lineTo(x2, y2)
      ctx!.stroke()
      ctx!.shadowBlur = 0
    }

    function frame(time: number) {
      const dt = Math.min(time - lastTime, 50)
      lastTime = time

      ctx!.clearRect(0, 0, w, h)

      for (const s of sparks) {
        drawSpark(s, dt)
      }

      rafId = requestAnimationFrame(frame)
    }

    resize()
    initSparks()

    if (reduceMotion) {
      // Grid is CSS-based, nothing to draw on canvas
    } else {
      rafId = requestAnimationFrame(frame)
    }

    const ro = new ResizeObserver(() => {
      resize()
      initSparks()
    })
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafId)
      ro.disconnect()
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden bg-background aurora-grid">
      <div className="absolute inset-0 aurora-glow" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/10" />
    </div>
  )
}
