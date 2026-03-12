<script>
  import { onDestroy, onMount } from 'svelte'

  import '../styles/components/tower-defense-game.css'

  export let compact = false

  const TOWER_COST = 60
  const SLOT_POINTS = [0.2, 0.34, 0.48, 0.62, 0.76]

  let canvas
  let wrapper
  let ctx

  let width = 860
  let height = compact ? 280 : 420
  let laneY = height * 0.6
  let slots = []

  let running = false
  let gameOver = false
  let gold = 120
  let lives = 20
  let wave = 1
  let kills = 0
  let leaks = 0
  let bestWave = 1

  let towers = []
  let enemies = []
  let projectiles = []
  let wavePlan = { remaining: 0, timer: 0, interval: 900 }

  let rafId = 0
  let lastTs = 0

  function readBestWave() {
    if (typeof window === 'undefined') return 1

    const raw = window.localStorage.getItem('td-best-wave')
    const parsed = Number.parseInt(raw ?? '1', 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  }

  function persistBestWave(value) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('td-best-wave', String(value))
  }

  function recalcGeometry() {
    if (!wrapper || !canvas) return

    const dpr = window.devicePixelRatio || 1
    width = Math.max(320, Math.floor(wrapper.clientWidth))
    height = compact ? 280 : Math.max(360, Math.floor(window.innerHeight * 0.58))
    laneY = height * 0.62

    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    slots = SLOT_POINTS.map((ratio) => ({
      x: width * ratio,
      y: laneY - 54,
      occupied: false,
    }))

    towers = towers
      .map((tower) => {
        const linkedSlot = slots[tower.slotIndex]
        if (!linkedSlot) return null

        return {
          ...tower,
          x: linkedSlot.x,
          y: linkedSlot.y,
        }
      })
      .filter(Boolean)
  }

  function resetState() {
    running = false
    gameOver = false
    gold = 120
    lives = 20
    wave = 1
    kills = 0
    leaks = 0

    towers = []
    enemies = []
    projectiles = []
    wavePlan = { remaining: 0, timer: 0, interval: 900 }

    slots = slots.map((slot) => ({ ...slot, occupied: false }))
    lastTs = 0
  }

  function setupWave() {
    wavePlan.remaining = 6 + wave * 2
    wavePlan.interval = Math.max(320, 940 - wave * 42)
    wavePlan.timer = 280

    if (wave > bestWave) {
      bestWave = wave
      persistBestWave(bestWave)
    }
  }

  function startGame() {
    if (gameOver) {
      resetState()
    }

    if (wavePlan.remaining <= 0 && enemies.length === 0) {
      setupWave()
    }

    running = true
  }

  function pauseGame() {
    running = false
  }

  function restartGame() {
    resetState()
    setupWave()
    running = true
  }

  function spawnEnemy() {
    const hp = 34 + wave * 9
    const speed = 38 + wave * 4.5

    enemies.push({
      id: crypto.randomUUID(),
      x: width + 18,
      y: laneY,
      hp,
      maxHp: hp,
      speed,
      radius: 14,
    })

  }

  function updateWave(dt) {
    if (wavePlan.remaining > 0) {
      wavePlan.timer -= dt * 1000

      if (wavePlan.timer <= 0) {
        spawnEnemy()
        wavePlan.remaining -= 1
        wavePlan.timer = wavePlan.interval
      }
    }

    if (wavePlan.remaining <= 0 && enemies.length === 0) {
      wave += 1
      gold += 35
      setupWave()
    }
  }

  function updateTowers(dt) {
    for (const tower of towers) {
      tower.cooldown -= dt * 1000
      if (tower.cooldown > 0) {
        continue
      }

      const target = enemies
        .filter((enemy) => Math.abs(enemy.x - tower.x) <= tower.range)
        .sort((a, b) => a.x - b.x)[0]

      if (!target) {
        continue
      }

      tower.cooldown = tower.fireRate

      const dx = target.x - tower.x
      const dy = target.y - tower.y
      const distance = Math.hypot(dx, dy) || 1

      projectiles.push({
        x: tower.x,
        y: tower.y,
        vx: (dx / distance) * tower.projectileSpeed,
        vy: (dy / distance) * tower.projectileSpeed,
        damage: tower.damage,
      })
    }
  }

  function updateProjectiles(dt) {
    for (const projectile of projectiles) {
      projectile.x += projectile.vx * dt
      projectile.y += projectile.vy * dt

      const hit = enemies.find(
        (enemy) => Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y) < enemy.radius + 4
      )

      if (hit) {
        hit.hp -= projectile.damage
        projectile.hit = true
      }
    }

    projectiles = projectiles.filter(
      (projectile) =>
        !projectile.hit &&
        projectile.x >= -18 &&
        projectile.x <= width + 18 &&
        projectile.y >= -18 &&
        projectile.y <= height + 18
    )
  }

  function updateEnemies(dt) {
    for (const enemy of enemies) {
      enemy.x -= enemy.speed * dt

      if (enemy.hp <= 0) {
        enemy.dead = true
        kills += 1
        gold += 18
      }

      if (enemy.x <= 22) {
        enemy.dead = true
        leaks += 1
        lives -= 1
      }
    }

    enemies = enemies.filter((enemy) => !enemy.dead)

    if (lives <= 0) {
      running = false
      gameOver = true
    }
  }

  function update(dt) {
    if (!running || gameOver) {
      return
    }

    updateWave(dt)
    updateTowers(dt)
    updateProjectiles(dt)
    updateEnemies(dt)
  }

  function draw() {
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    ctx.fillStyle = 'rgba(15, 19, 23, 0.55)'
    ctx.fillRect(0, laneY - 24, width, 48)

    ctx.strokeStyle = 'rgba(225, 197, 167, 0.26)'
    ctx.lineWidth = 2
    ctx.setLineDash([7, 9])
    ctx.beginPath()
    ctx.moveTo(18, laneY)
    ctx.lineTo(width - 12, laneY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(222, 172, 128, 0.35)'
    ctx.fillRect(4, laneY - 32, 16, 64)

    for (const slot of slots) {
      ctx.beginPath()
      ctx.arc(slot.x, slot.y, 16, 0, Math.PI * 2)
      ctx.fillStyle = slot.occupied ? 'rgba(72, 126, 98, 0.7)' : 'rgba(255, 255, 255, 0.12)'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = slot.occupied ? 'rgba(76, 224, 148, 0.82)' : 'rgba(255, 255, 255, 0.2)'
      ctx.stroke()
    }

    for (const tower of towers) {
      ctx.beginPath()
      ctx.arc(tower.x, tower.y, 14, 0, Math.PI * 2)
      ctx.fillStyle = '#2e7f58'
      ctx.fill()
      ctx.strokeStyle = '#7bf2b4'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(tower.x, tower.y)
      ctx.lineTo(tower.x + 18, tower.y + 18)
      ctx.strokeStyle = 'rgba(216, 247, 230, 0.9)'
      ctx.lineWidth = 3
      ctx.stroke()
    }

    for (const enemy of enemies) {
      ctx.beginPath()
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2)
      ctx.fillStyle = '#b03f3f'
      ctx.fill()
      ctx.strokeStyle = '#ffd2ce'
      ctx.lineWidth = 2
      ctx.stroke()

      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
      ctx.fillRect(enemy.x - 18, enemy.y - 24, 36, 5)
      ctx.fillStyle = '#63f7a9'
      ctx.fillRect(enemy.x - 18, enemy.y - 24, 36 * hpRatio, 5)
    }

    for (const projectile of projectiles) {
      ctx.beginPath()
      ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#e6ff7c'
      ctx.fill()
    }

    if (!running && !gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.32)'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#fff7f1'
      ctx.font = '700 22px "Bricolage Grotesque"'
      ctx.textAlign = 'center'
      ctx.fillText('Clique Start pour lancer la vague', width / 2, height / 2)
    }

    if (gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#fff1ea'
      ctx.font = '700 25px "Bricolage Grotesque"'
      ctx.textAlign = 'center'
      ctx.fillText('Defaite', width / 2, height / 2 - 8)
      ctx.font = '500 16px "Space Mono"'
      ctx.fillText(`Vague atteinte: ${Math.max(1, wave - 1)}`, width / 2, height / 2 + 18)
    }
  }

  function frame(ts) {
    if (!lastTs) {
      lastTs = ts
    }

    const dt = Math.min((ts - lastTs) / 1000, 0.05)
    lastTs = ts

    update(dt)
    draw()

    rafId = window.requestAnimationFrame(frame)
  }

  function tryPlaceTower(x, y) {
    if (gold < TOWER_COST || gameOver) return

    const slotIndex = slots.findIndex(
      (slot) => !slot.occupied && Math.hypot(slot.x - x, slot.y - y) <= 24
    )

    if (slotIndex === -1) return

    const slot = slots[slotIndex]
    slot.occupied = true

    towers = [
      ...towers,
      {
        slotIndex,
        x: slot.x,
        y: slot.y,
        range: 230,
        fireRate: 620,
        cooldown: 220,
        damage: 22,
        projectileSpeed: 360,
      },
    ]

    gold -= TOWER_COST
  }

  function onCanvasPointerDown(event) {
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    tryPlaceTower(x, y)
  }

  onMount(() => {
    bestWave = readBestWave()
    ctx = canvas.getContext('2d')

    const onResize = () => {
      recalcGeometry()
      draw()
    }

    recalcGeometry()
    draw()
    window.addEventListener('resize', onResize)
    rafId = window.requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('resize', onResize)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  })

  onDestroy(() => {
    if (rafId) {
      window.cancelAnimationFrame(rafId)
    }
  })
</script>

<div class={`tower-defense ${compact ? 'is-compact' : ''}`}>
  <header class="tower-hud">
    <p><span>Vague</span> {Math.max(1, wave - (wavePlan.remaining > 0 || enemies.length > 0 ? 0 : 1))}</p>
    <p><span>Vie</span> {Math.max(0, lives)}</p>
    <p><span>Or</span> {gold}</p>
    <p><span>Kills</span> {kills}</p>
    <p><span>Fuites</span> {leaks}</p>
    <p><span>Best</span> {bestWave}</p>
  </header>

  <div class="tower-controls">
    <button type="button" on:click={startGame} disabled={running && !gameOver}>Start</button>
    <button type="button" on:click={pauseGame} disabled={!running || gameOver}>Pause</button>
    <button type="button" on:click={restartGame}>Restart</button>
    <p class="tower-cost">Tour simple: {TOWER_COST} or</p>
  </div>

  <div class="tower-stage" bind:this={wrapper}>
    <canvas bind:this={canvas} on:pointerdown={onCanvasPointerDown} aria-label="Mini jeu Tower Defense"></canvas>
  </div>

  <p class="tower-hint">
    Place des tours sur les emplacements au-dessus de la lane pour stopper les vagues.
  </p>
</div>
