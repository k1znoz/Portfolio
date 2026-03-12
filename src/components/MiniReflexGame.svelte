<script>
  import { onDestroy, onMount } from 'svelte'

  import '../styles/components/mini-reflex-game.css'

  const DEFAULT_SETTINGS = {
    gameDuration: 30,
    baseTargetInterval: 820,
    minTargetInterval: 380,
    targetMinSize: 44,
    targetMaxSize: 74,
    comboStep: 2,
    comboCap: 20,
  }

  const DIFFICULTY_TEMPLATES = {
    easy: {
      gameDuration: 40,
      baseTargetInterval: 980,
      minTargetInterval: 520,
      targetMinSize: 56,
      targetMaxSize: 84,
      comboStep: 2,
      comboCap: 18,
    },
    medium: { ...DEFAULT_SETTINGS },
    hard: {
      gameDuration: 30,
      baseTargetInterval: 680,
      minTargetInterval: 300,
      targetMinSize: 34,
      targetMaxSize: 58,
      comboStep: 3,
      comboCap: 30,
    },
  }

  let playing = false
  let timeLeft = DEFAULT_SETTINGS.gameDuration
  let score = 0
  let hits = 0
  let combo = 0
  let bestCombo = 0
  let misses = 0
  let bestScore = 0
  let target = null
  let arena = null
  let feedbackBursts = []
  let timerId = null
  let spawnId = null
  let feedbackCounter = 0
  let settings = { ...DIFFICULTY_TEMPLATES.medium }
  let activeDifficulty = 'medium'

  $: totalClicks = hits + misses
  $: accuracy = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0

  function safeReadBestScore() {
    if (typeof window === 'undefined') return 0

    const raw = window.localStorage.getItem('mini-reflex-best')
    const parsed = Number.parseInt(raw ?? '0', 10)
    return Number.isFinite(parsed) ? parsed : 0
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  function normalizeSettings(raw) {
    const normalized = {
      gameDuration: clamp(Number(raw.gameDuration) || DEFAULT_SETTINGS.gameDuration, 15, 90),
      baseTargetInterval: clamp(
        Number(raw.baseTargetInterval) || DEFAULT_SETTINGS.baseTargetInterval,
        300,
        1400
      ),
      minTargetInterval: clamp(
        Number(raw.minTargetInterval) || DEFAULT_SETTINGS.minTargetInterval,
        200,
        900
      ),
      targetMinSize: clamp(Number(raw.targetMinSize) || DEFAULT_SETTINGS.targetMinSize, 28, 80),
      targetMaxSize: clamp(Number(raw.targetMaxSize) || DEFAULT_SETTINGS.targetMaxSize, 40, 120),
      comboStep: clamp(Number(raw.comboStep) || DEFAULT_SETTINGS.comboStep, 1, 8),
      comboCap: clamp(Number(raw.comboCap) || DEFAULT_SETTINGS.comboCap, 8, 40),
    }

    if (normalized.targetMinSize > normalized.targetMaxSize) {
      const swap = normalized.targetMinSize
      normalized.targetMinSize = normalized.targetMaxSize
      normalized.targetMaxSize = swap
    }

    if (normalized.minTargetInterval > normalized.baseTargetInterval) {
      normalized.minTargetInterval = normalized.baseTargetInterval
    }

    return normalized
  }

  function persistBestScore(value) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('mini-reflex-best', String(value))
  }

  function clearLoops() {
    if (timerId) {
      window.clearInterval(timerId)
      timerId = null
    }

    if (spawnId) {
      window.clearInterval(spawnId)
      spawnId = null
    }
  }

  function queueFeedback(type, x, y, size = 46) {
    const id = `${type}-${feedbackCounter++}`
    feedbackBursts = [...feedbackBursts, { id, type, x, y, size }]

    window.setTimeout(() => {
      feedbackBursts = feedbackBursts.filter((burst) => burst.id !== id)
    }, 520)
  }

  function randomTarget() {
    const span = Math.max(1, settings.targetMaxSize - settings.targetMinSize)
    const size = Math.floor(settings.targetMinSize + Math.random() * span)
    const padding = 2
    const x = Math.max(padding, Math.min(100 - size / 4, 5 + Math.random() * 90))
    const y = Math.max(padding, Math.min(100 - size / 4, 8 + Math.random() * 82))

    return {
      id: crypto.randomUUID(),
      x,
      y,
      size,
    }
  }

  function spawnTarget() {
    if (!playing) return
    target = randomTarget()
  }

  function setSpawnLoop() {
    if (spawnId) {
      window.clearInterval(spawnId)
    }

    const cadence = Math.max(settings.minTargetInterval, settings.baseTargetInterval - score * 2)
    spawnId = window.setInterval(spawnTarget, cadence)
  }

  function startGame() {
    clearLoops()
    settings = normalizeSettings(settings)
    playing = true
    timeLeft = settings.gameDuration
    score = 0
    hits = 0
    combo = 0
    bestCombo = 0
    misses = 0
    feedbackBursts = []
    target = randomTarget()

    timerId = window.setInterval(() => {
      if (timeLeft <= 1) {
        endGame()
        return
      }

      timeLeft -= 1
    }, 1000)

    setSpawnLoop()
  }

  function endGame() {
    playing = false
    clearLoops()
    target = null

    if (score > bestScore) {
      bestScore = score
      persistBestScore(bestScore)
    }
  }

  function hitTarget(event) {
    if (!playing || !target) return

    if (arena) {
      const arenaRect = arena.getBoundingClientRect()
      const targetRect = event.currentTarget.getBoundingClientRect()
      const x = targetRect.left - arenaRect.left + targetRect.width / 2
      const y = targetRect.top - arenaRect.top + targetRect.height / 2
      queueFeedback('hit', x, y, targetRect.width)
    }

    combo += 1
    hits += 1
    bestCombo = Math.max(bestCombo, combo)
    score += 10 + Math.min(settings.comboCap, combo * settings.comboStep)
    target = randomTarget()
    setSpawnLoop()
  }

  function resetDifficulty() {
    settings = { ...DIFFICULTY_TEMPLATES.medium }
    activeDifficulty = 'medium'
  }

  function applyDifficulty(level) {
    if (!DIFFICULTY_TEMPLATES[level]) return
    settings = { ...DIFFICULTY_TEMPLATES[level] }
    activeDifficulty = level
  }

  function onManualSettingChange() {
    activeDifficulty = 'custom'
  }

  function missArena(event) {
    if (!playing) return
    if (event.target.closest('.reflex-target')) return

    if (arena) {
      const rect = arena.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      queueFeedback('miss', x, y, 48)
    }

    misses += 1
    combo = 0
  }

  onMount(() => {
    bestScore = safeReadBestScore()
  })

  onDestroy(() => {
    clearLoops()
  })
</script>

<div class="mini-reflex" role="region" aria-label="Mini jeu Reflex Shot">
  <details class="mini-reflex-settings" open>
    <summary>Difficulte modifiable</summary>
    <div class="mini-reflex-presets" role="group" aria-label="Templates de difficulte">
      <button
        type="button"
        class={`preset-btn ${activeDifficulty === 'easy' ? 'is-active' : ''}`}
        on:click={() => applyDifficulty('easy')}
        disabled={playing}
      >
        Facile
      </button>
      <button
        type="button"
        class={`preset-btn ${activeDifficulty === 'medium' ? 'is-active' : ''}`}
        on:click={() => applyDifficulty('medium')}
        disabled={playing}
      >
        Moyen
      </button>
      <button
        type="button"
        class={`preset-btn ${activeDifficulty === 'hard' ? 'is-active' : ''}`}
        on:click={() => applyDifficulty('hard')}
        disabled={playing}
      >
        Difficile
      </button>
      <span class="preset-current">Mode: {activeDifficulty === 'custom' ? 'Custom' : activeDifficulty}</span>
    </div>

    <div class="mini-reflex-settings-grid">
      <label>
        Duree (sec)
        <input type="number" min="15" max="90" step="5" bind:value={settings.gameDuration} on:input={onManualSettingChange} disabled={playing} />
      </label>
      <label>
        Apparition (ms)
        <input type="number" min="300" max="1400" step="20" bind:value={settings.baseTargetInterval} on:input={onManualSettingChange} disabled={playing} />
      </label>
      <label>
        Vitesse max (ms)
        <input type="number" min="200" max="900" step="20" bind:value={settings.minTargetInterval} on:input={onManualSettingChange} disabled={playing} />
      </label>
      <label>
        Taille min (px)
        <input type="number" min="28" max="80" step="2" bind:value={settings.targetMinSize} on:input={onManualSettingChange} disabled={playing} />
      </label>
      <label>
        Taille max (px)
        <input type="number" min="40" max="120" step="2" bind:value={settings.targetMaxSize} on:input={onManualSettingChange} disabled={playing} />
      </label>
      <label>
        Bonus combo
        <input type="number" min="1" max="8" step="1" bind:value={settings.comboStep} on:input={onManualSettingChange} disabled={playing} />
      </label>
    </div>
    <button type="button" class="mini-reflex-reset" on:click={resetDifficulty} disabled={playing}>
      Reinitialiser
    </button>
  </details>

  <header class="mini-reflex-hud">
    <p><span>Temps</span> {timeLeft}s</p>
    <p><span>Score</span> {score}</p>
    <p><span>Combo</span> x{combo}</p>
    <p><span>Rates</span> {misses}</p>
    <p><span>Best</span> {bestScore}</p>
  </header>

  <div
    class={`mini-reflex-arena ${playing ? 'is-playing' : ''}`}
    bind:this={arena}
    on:pointerdown={missArena}
    role="application"
    aria-live="polite"
  >
    <div class="mini-reflex-feedback-layer" aria-hidden="true">
      {#each feedbackBursts as burst (burst.id)}
        <span
          class={`mini-reflex-feedback mini-reflex-feedback-${burst.type}`}
          style={`left:${burst.x}px;top:${burst.y}px;--burst-size:${burst.size}px;`}
        ></span>
      {/each}
    </div>

    {#if playing && target}
      <button
        type="button"
        class="reflex-target"
        style={`left:${target.x}%;top:${target.y}%;width:${target.size}px;height:${target.size}px;`}
        on:pointerdown|preventDefault|stopPropagation={hitTarget}
        aria-label="Cible"
      ></button>
    {:else}
      <div class="mini-reflex-overlay">
        <h4>Reflex Shot</h4>
        <p>30 secondes. Clique les cibles le plus vite possible.</p>
        <button type="button" class="mini-reflex-start" on:click={startGame}>
          {score > 0 ? 'Rejouer' : 'Jouer'}
        </button>
      </div>
    {/if}
  </div>

  <div class="mini-reflex-stats" aria-live="polite">
    <p><span>Clics reussis</span> {hits}</p>
    <p><span>Total clics</span> {totalClicks}</p>
    <p><span>Precision</span> {accuracy}%</p>
    <p><span>Meilleur combo</span> x{bestCombo}</p>
  </div>
</div>
