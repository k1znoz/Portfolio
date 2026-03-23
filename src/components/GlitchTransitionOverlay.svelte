<script>
  import { onDestroy } from 'svelte'

  export let trigger = 0
  export let mode = 'theme'

  let canvasEl
  let ctx
  let visible = false
  let rafId = 0
  let startTime = 0
  let width = 0
  let height = 0
  let dpr = 1
  let lastTrigger = trigger

  const durationByMode = {
    theme: 1040,
    layout: 860,
    route: 520,
  }

  const paletteByMode = {
    theme: {
      a: [255, 82, 82],
      b: [72, 220, 255],
      c: [255, 211, 130],
    },
    layout: {
      a: [255, 143, 115],
      b: [79, 194, 255],
      c: [255, 232, 154],
    },
    route: {
      a: [190, 161, 118],
      b: [168, 101, 80],
      c: [255, 240, 220],
    },
  }

  function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  function setupCanvas() {
    if (!canvasEl) {
      return
    }

    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
    width = Math.floor(window.innerWidth)
    height = Math.floor(window.innerHeight)

    canvasEl.width = Math.max(1, Math.floor(width * dpr))
    canvasEl.height = Math.max(1, Math.floor(height * dpr))
    canvasEl.style.width = `${width}px`
    canvasEl.style.height = `${height}px`

    ctx = canvasEl.getContext('2d', { alpha: true })
    if (!ctx) {
      return
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function fillScreen(color, alpha) {
    if (!ctx) return
    ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`
    ctx.fillRect(0, 0, width, height)
  }

  function drawScanlines(alpha) {
    if (!ctx) return
    ctx.save()
    ctx.globalAlpha = alpha
    for (let y = 0; y < height; y += 3) {
      if (y % 2 === 0) {
        continue
      }
      ctx.fillStyle = 'rgba(255,255,255,0.12)'
      ctx.fillRect(0, y, width, 1)
    }
    ctx.restore()
  }

  function drawSlices(progress, palette) {
    if (!ctx) return
    const slices = mode === 'layout' ? 24 : 32
    const glitchWindow = Math.max(0, 1 - progress * 1.02)

    ctx.save()
    for (let i = 0; i < slices; i += 1) {
      const baseY = (i / slices) * height
      const bandHeight = 10 + ((i * 17 + Math.floor(progress * 1300)) % 58)
      const jitter = ((Math.sin(progress * 40 + i * 2.3) + Math.cos(progress * 34 + i * 1.7)) * 0.5)
      const offsetX = jitter * 86 * glitchWindow
      const alpha = 0.12 + (0.34 * glitchWindow)

      ctx.fillStyle = `rgba(${palette.a[0]}, ${palette.a[1]}, ${palette.a[2]}, ${alpha})`
      ctx.fillRect(offsetX, baseY, width, bandHeight)

      ctx.fillStyle = `rgba(${palette.b[0]}, ${palette.b[1]}, ${palette.b[2]}, ${alpha * 0.94})`
      ctx.fillRect(-offsetX * 0.7, baseY + 1, width, Math.max(2, bandHeight - 2))
    }
    ctx.restore()
  }

  function drawRgbSplit(progress, palette) {
    if (!ctx) return
    const splitPower = Math.max(0, 1 - progress * 1.08)
    const shift = 28 * splitPower

    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    ctx.fillStyle = `rgba(${palette.a[0]}, ${palette.a[1]}, ${palette.a[2]}, ${0.32 * splitPower})`
    ctx.fillRect(shift, 0, width, height)
    ctx.fillStyle = `rgba(${palette.b[0]}, ${palette.b[1]}, ${palette.b[2]}, ${0.28 * splitPower})`
    ctx.fillRect(-shift, 0, width, height)

    ctx.fillStyle = `rgba(${palette.c[0]}, ${palette.c[1]}, ${palette.c[2]}, ${0.18 * splitPower})`
    ctx.fillRect(shift * 0.5, 0, width, height)
    ctx.restore()
  }

  function drawPulse(progress, palette) {
    if (!ctx) return
    const pulseA = Math.sin(progress * Math.PI * 4.5)
    const pulseB = Math.cos(progress * Math.PI * 5.2)
    const flash = Math.max(0, pulseA * 0.28 + pulseB * 0.22)

    fillScreen(palette.c, flash)
  }

  function renderFrame(now) {
    if (!ctx) {
      return
    }

    const duration = durationByMode[mode] ?? durationByMode.theme
    const elapsed = now - startTime
    const progress = Math.min(1, elapsed / duration)
    const palette = paletteByMode[mode] ?? paletteByMode.theme

    ctx.clearRect(0, 0, width, height)

    const baseFade = Math.max(0, 0.48 * (1 - progress * 0.9))
    fillScreen(palette.a, baseFade * 0.58)
    drawPulse(progress, palette)
    drawSlices(progress, palette)
    drawRgbSplit(progress, palette)
    drawScanlines(0.3 * (1 - progress * 0.72))

    if (progress < 1) {
      rafId = window.requestAnimationFrame(renderFrame)
      return
    }

    visible = false
    ctx.clearRect(0, 0, width, height)
  }

  function start() {
    if (prefersReducedMotion()) {
      return
    }

    setupCanvas()
    if (!ctx) {
      return
    }

    if (rafId) {
      window.cancelAnimationFrame(rafId)
      rafId = 0
    }

    visible = true
    startTime = performance.now()
    rafId = window.requestAnimationFrame(renderFrame)
  }

  function onResize() {
    setupCanvas()
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize)
  }

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onResize)
    }

    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
  })

  $: if (trigger !== lastTrigger) {
    lastTrigger = trigger
    start()
  }
</script>

<canvas
  bind:this={canvasEl}
  class={`glitch-transition-canvas ${visible ? 'is-active' : ''}`}
  aria-hidden="true"
></canvas>

<style>
  .glitch-transition-canvas {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 74;
    opacity: 0;
    transition: opacity 80ms linear;
    mix-blend-mode: plus-lighter;
  }

  .glitch-transition-canvas.is-active {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .glitch-transition-canvas {
      display: none;
    }
  }
</style>