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

  const DECOY_SCORE_PENALTY = 18
  const STORAGE_KEYS = {
    best: 'mini-reflex-best',
    history: 'mini-reflex-history',
  }

  let playing = false
  let paused = false
  let timeLeft = DEFAULT_SETTINGS.gameDuration
  let score = 0
  let hits = 0
  let combo = 0
  let bestCombo = 0
  let misses = 0
  let decoyHits = 0
  let bestScore = 0
  let target = null
  let arena = null
  let feedbackBursts = []
  let timerId = null
  let spawnId = null
  let countdownId = null
  let countdownValue = 0
  let reactionTimes = []
  let runSummary = null
  let runHistory = []
  let perfectHits = 0
  let goodHits = 0
  let lateHits = 0
  let motionId = null
  let feedbackCounter = 0
  let settings = { ...DIFFICULTY_TEMPLATES.medium }
  let activeDifficulty = 'medium'

  $: isCountingDown = countdownValue > 0
  $: totalClicks = hits + misses
  $: accuracy = totalClicks > 0 ? Math.round((hits / totalClicks) * 100) : 0
  $: avgReactionMs =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((total, value) => total + value, 0) / reactionTimes.length)
      : 0
  $: medianReactionMs = reactionTimes.length > 0 ? computeMedian(reactionTimes) : 0
  $: bestReactionMs = reactionTimes.length > 0 ? Math.min(...reactionTimes) : 0
  $: historyScoreMax = Math.max(1, ...runHistory.map((run) => run.score || 0))
  $: historyReactionMax = Math.max(1, ...runHistory.map((run) => run.avgReactionMs || 0))

  function safeReadBestScore() {
    if (typeof window === 'undefined') return 0

    const raw = window.localStorage.getItem(STORAGE_KEYS.best)
    const parsed = Number.parseInt(raw ?? '0', 10)
    return Number.isFinite(parsed) ? parsed : 0
  }

  function safeReadRunHistory() {
    if (typeof window === 'undefined') return []

    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.history)
      if (!raw) return []

      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []

      return parsed
        .map((run) => ({
          id: String(run.id ?? crypto.randomUUID()),
          score: Math.max(0, Number(run.score) || 0),
          avgReactionMs: Math.max(0, Number(run.avgReactionMs) || 0),
          accuracy: Math.max(0, Math.min(100, Number(run.accuracy) || 0)),
          mode: String(run.mode ?? 'unknown'),
          playedAt: Number(run.playedAt) || Date.now(),
        }))
        .slice(0, 10)
    } catch {
      return []
    }
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
    window.localStorage.setItem(STORAGE_KEYS.best, String(value))
  }

  function persistRunHistory(nextHistory) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(nextHistory.slice(0, 10)))
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

    if (motionId) {
      window.clearInterval(motionId)
      motionId = null
    }
  }

  function clearCountdown() {
    if (countdownId) {
      window.clearInterval(countdownId)
      countdownId = null
    }
  }

  function queueFeedback(type, x, y, size = 46, label = '') {
    const id = `${type}-${feedbackCounter++}`
    feedbackBursts = [...feedbackBursts, { id, type, x, y, size, label }]

    window.setTimeout(() => {
      feedbackBursts = feedbackBursts.filter((burst) => burst.id !== id)
    }, 520)
  }

  function computeMedian(values) {
    if (!values.length) return 0

    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
      return Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    }

    return sorted[mid]
  }

  function getDecoyChance() {
    const baseChanceByDifficulty = {
      easy: 0.08,
      medium: 0.14,
      hard: 0.2,
      custom: 0.14,
    }

    const baseChance = baseChanceByDifficulty[activeDifficulty] ?? 0.14
    return Math.min(0.35, baseChance + score / 1200)
  }

  function getMotionIntensity() {
    const base = activeDifficulty === 'easy' ? 3.5 : activeDifficulty === 'hard' ? 6.8 : 5.2
    return base + Math.min(2.2, score / 180)
  }

  function classifyShotQuality(reactionMs) {
    const perfectThreshold = Math.max(150, Math.min(250, settings.baseTargetInterval * 0.32))
    const goodThreshold = Math.max(280, Math.min(500, settings.baseTargetInterval * 0.68))

    if (reactionMs <= perfectThreshold) {
      return { key: 'perfect', label: 'PERFECT', bonus: 12 }
    }

    if (reactionMs <= goodThreshold) {
      return { key: 'good', label: 'GOOD', bonus: 5 }
    }

    return { key: 'late', label: 'LATE', bonus: 0 }
  }

  function randomTarget() {
    const span = Math.max(1, settings.targetMaxSize - settings.targetMinSize)
    const size = Math.floor(settings.targetMinSize + Math.random() * span)
    const padding = 2
    const baseX = Math.max(padding, Math.min(100 - size / 4, 5 + Math.random() * 90))
    const baseY = Math.max(padding, Math.min(100 - size / 4, 8 + Math.random() * 82))
    const motion = getMotionIntensity()

    return {
      id: crypto.randomUUID(),
      x: baseX,
      y: baseY,
      baseX,
      baseY,
      size,
      isDecoy: Math.random() < getDecoyChance(),
      spawnedAt: Date.now(),
      driftX: (Math.random() * 2 - 1) * motion,
      driftY: (Math.random() * 2 - 1) * motion,
      driftSpeedX: 340 + Math.random() * 520,
      driftSpeedY: 420 + Math.random() * 620,
      driftPhaseX: Math.random() * Math.PI * 2,
      driftPhaseY: Math.random() * Math.PI * 2,
    }
  }

  function updateTargetMotion() {
    if (!playing || paused || isCountingDown || !target) return

    const elapsed = Date.now() - target.spawnedAt
    const offsetX = Math.sin(target.driftPhaseX + elapsed / target.driftSpeedX) * target.driftX
    const offsetY = Math.cos(target.driftPhaseY + elapsed / target.driftSpeedY) * target.driftY
    const maxPos = 100 - target.size / 4

    target = {
      ...target,
      x: Math.max(2, Math.min(maxPos, target.baseX + offsetX)),
      y: Math.max(2, Math.min(maxPos, target.baseY + offsetY)),
    }
  }

  function setMotionLoop() {
    if (motionId) {
      window.clearInterval(motionId)
    }

    motionId = window.setInterval(updateTargetMotion, 40)
  }

  function spawnTarget() {
    if (!playing || paused || isCountingDown) return
    target = randomTarget()
  }

  function setSpawnLoop() {
    if (paused || isCountingDown) return

    if (spawnId) {
      window.clearInterval(spawnId)
    }

    const cadence = Math.max(settings.minTargetInterval, settings.baseTargetInterval - score * 2)
    spawnId = window.setInterval(spawnTarget, cadence)
  }

  function startTimerLoop() {
    if (timerId) {
      window.clearInterval(timerId)
    }

    timerId = window.setInterval(() => {
      if (timeLeft <= 1) {
        endGame()
        return
      }

      timeLeft -= 1
    }, 1000)
  }

  function beginCountdown(onComplete, duration = 3) {
    clearCountdown()
    countdownValue = duration

    countdownId = window.setInterval(() => {
      countdownValue -= 1

      if (countdownValue <= 0) {
        clearCountdown()
        countdownValue = 0
        onComplete()
      }
    }, 1000)
  }

  function startGame() {
    clearLoops()
    clearCountdown()
    settings = normalizeSettings(settings)
    playing = false
    paused = false
    timeLeft = settings.gameDuration
    score = 0
    hits = 0
    combo = 0
    bestCombo = 0
    misses = 0
    decoyHits = 0
    perfectHits = 0
    goodHits = 0
    lateHits = 0
    feedbackBursts = []
    reactionTimes = []
    runSummary = null
    target = null

    beginCountdown(() => {
      playing = true
      target = randomTarget()
      startTimerLoop()
      setSpawnLoop()
      setMotionLoop()
    })
  }

  function endGame() {
    playing = false
    paused = false
    clearLoops()
    clearCountdown()
    target = null

    const finalAccuracy = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0
    const nextRun = {
      id: crypto.randomUUID(),
      score,
      avgReactionMs,
      accuracy: finalAccuracy,
      mode: activeDifficulty,
      playedAt: Date.now(),
    }
    const nextHistory = [nextRun, ...runHistory].slice(0, 10)
    runHistory = nextHistory
    persistRunHistory(nextHistory)

    runSummary = {
      score,
      hits,
      misses,
      decoyHits,
      accuracy: finalAccuracy,
      bestCombo,
      avgReactionMs,
      medianReactionMs,
      bestReactionMs,
      perfectHits,
      goodHits,
      lateHits,
      mode: activeDifficulty,
    }

    if (score > bestScore) {
      bestScore = score
      persistBestScore(bestScore)
    }
  }

  function registerMissAt(x, y, size = 48) {
    queueFeedback('miss', x, y, size)
    misses += 1
    combo = 0
  }

  function hitTarget(event) {
    if (!playing || paused || isCountingDown || !target) return

    const targetRect = event.currentTarget.getBoundingClientRect()
    const centerX = targetRect.left + targetRect.width / 2
    const centerY = targetRect.top + targetRect.height / 2
    const distanceToCenter = Math.hypot(event.clientX - centerX, event.clientY - centerY)
    const hitRadius = targetRect.width / 2

    // Enforce a real circular hitbox so clicks near the edge do not feel magnetized.
    if (distanceToCenter > hitRadius) {
      if (arena) {
        const rect = arena.getBoundingClientRect()
        registerMissAt(event.clientX - rect.left, event.clientY - rect.top)
      }
      return
    }

    if (arena) {
      const arenaRect = arena.getBoundingClientRect()
      const x = targetRect.left - arenaRect.left + targetRect.width / 2
      const y = targetRect.top - arenaRect.top + targetRect.height / 2

      if (target.isDecoy) {
        queueFeedback('decoy', x, y, targetRect.width)
      } else {
        queueFeedback('hit', x, y, targetRect.width)
      }
    }

    if (target.isDecoy) {
      decoyHits += 1
      misses += 1
      combo = 0
      score = Math.max(0, score - DECOY_SCORE_PENALTY)
      target = randomTarget()
      setSpawnLoop()
      return
    }

    const reactionMs = Math.max(0, Date.now() - target.spawnedAt)
    reactionTimes = [...reactionTimes, reactionMs]
    const shotQuality = classifyShotQuality(reactionMs)

    if (shotQuality.key === 'perfect') {
      perfectHits += 1
    } else if (shotQuality.key === 'good') {
      goodHits += 1
    } else {
      lateHits += 1
    }

    if (arena) {
      const arenaRect = arena.getBoundingClientRect()
      const feedbackX = targetRect.left - arenaRect.left + targetRect.width / 2
      const feedbackY = targetRect.top - arenaRect.top + targetRect.height * 0.2
      queueFeedback(`quality-${shotQuality.key}`, feedbackX, feedbackY, targetRect.width * 0.68, shotQuality.label)
    }

    combo += 1
    hits += 1
    bestCombo = Math.max(bestCombo, combo)
    score += 10 + Math.min(settings.comboCap, combo * settings.comboStep) + shotQuality.bonus
    target = randomTarget()
    setSpawnLoop()
  }

  function togglePause() {
    if (!playing || isCountingDown) return

    if (!paused) {
      paused = true
      clearLoops()
      return
    }

    beginCountdown(() => {
      paused = false
      startTimerLoop()
      setSpawnLoop()
      setMotionLoop()
    })
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
    if (!playing || paused || isCountingDown) return
    if (event.target.closest('.reflex-target')) return

    if (arena) {
      const rect = arena.getBoundingClientRect()
      registerMissAt(event.clientX - rect.left, event.clientY - rect.top)
    }
  }

  onMount(() => {
    bestScore = safeReadBestScore()
    runHistory = safeReadRunHistory()
  })

  onDestroy(() => {
    clearLoops()
    clearCountdown()
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
        <input type="number" min="15" max="90" step="5" bind:value={settings.gameDuration} on:input={onManualSettingChange} disabled={playing || isCountingDown} />
      </label>
      <label>
        Apparition (ms)
        <input type="number" min="300" max="1400" step="20" bind:value={settings.baseTargetInterval} on:input={onManualSettingChange} disabled={playing || isCountingDown} />
      </label>
      <label>
        Vitesse max (ms)
        <input type="number" min="200" max="900" step="20" bind:value={settings.minTargetInterval} on:input={onManualSettingChange} disabled={playing || isCountingDown} />
      </label>
      <label>
        Taille min (px)
        <input type="number" min="28" max="80" step="2" bind:value={settings.targetMinSize} on:input={onManualSettingChange} disabled={playing || isCountingDown} />
      </label>
      <label>
        Taille max (px)
        <input type="number" min="40" max="120" step="2" bind:value={settings.targetMaxSize} on:input={onManualSettingChange} disabled={playing || isCountingDown} />
      </label>
      <label>
        Bonus combo
        <input type="number" min="1" max="8" step="1" bind:value={settings.comboStep} on:input={onManualSettingChange} disabled={playing || isCountingDown} />
      </label>
    </div>
    <button type="button" class="mini-reflex-reset" on:click={resetDifficulty} disabled={playing || isCountingDown}>
      Reinitialiser
    </button>
  </details>

  <header class="mini-reflex-hud">
    <p><span>Temps</span> {timeLeft}s</p>
    <p><span>Score</span> {score}</p>
    <p><span>Combo</span> x{combo}</p>
    <p><span>Rates</span> {misses}</p>
    <p><span>Best</span> {bestScore}</p>
    <p><span>React moy.</span> {avgReactionMs > 0 ? `${avgReactionMs}ms` : '--'}</p>
  </header>

  <div class="mini-reflex-controls">
    <button
      type="button"
      class="mini-reflex-pause"
      on:click={togglePause}
      disabled={!playing || isCountingDown}
    >
      {paused ? 'Reprendre' : 'Pause'}
    </button>
  </div>

  <div
    class={`mini-reflex-arena ${playing ? 'is-playing' : ''} ${paused ? 'is-paused' : ''}`}
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
        >
          {#if burst.label}
            <span class="mini-reflex-feedback-label">{burst.label}</span>
          {/if}
        </span>
      {/each}
    </div>

    {#if playing && target && !paused && !isCountingDown}
      <button
        type="button"
        class={`reflex-target ${target.isDecoy ? 'is-decoy' : ''}`}
        style={`left:${target.x}%;top:${target.y}%;width:${target.size}px;height:${target.size}px;`}
        on:pointerdown|preventDefault|stopPropagation={hitTarget}
        aria-label={target.isDecoy ? 'Leurre' : 'Cible'}
      ></button>
    {:else}
      <div class="mini-reflex-overlay">
        {#if isCountingDown}
          <h4>Prepare-toi</h4>
          <p class="mini-reflex-countdown">{countdownValue}</p>
        {:else if paused}
          <h4>Pause</h4>
          <p>Le chrono est fige. Reprends quand tu veux.</p>
          <button type="button" class="mini-reflex-start" on:click={togglePause}>Reprendre</button>
        {:else if runSummary}
          <h4>Recap de run</h4>
          <div class="mini-reflex-recap">
            <p><span>Mode</span> {runSummary.mode}</p>
            <p><span>Score</span> {runSummary.score}</p>
            <p><span>Precision</span> {runSummary.accuracy}%</p>
            <p><span>Hits</span> {runSummary.hits}</p>
            <p><span>Leurres touches</span> {runSummary.decoyHits}</p>
            <p><span>Combo max</span> x{runSummary.bestCombo}</p>
            <p><span>Perfect</span> {runSummary.perfectHits}</p>
            <p><span>Good</span> {runSummary.goodHits}</p>
            <p><span>Late</span> {runSummary.lateHits}</p>
            <p><span>React moy.</span> {runSummary.avgReactionMs > 0 ? `${runSummary.avgReactionMs}ms` : '--'}</p>
            <p><span>React mediane</span> {runSummary.medianReactionMs > 0 ? `${runSummary.medianReactionMs}ms` : '--'}</p>
            <p><span>React best</span> {runSummary.bestReactionMs > 0 ? `${runSummary.bestReactionMs}ms` : '--'}</p>
          </div>
          <button type="button" class="mini-reflex-start" on:click={startGame}>Rejouer</button>
        {:else}
          <h4>Reflex Shot</h4>
          <p>30 secondes. Clique les cibles sans toucher les leurres.</p>
          <div class="mini-reflex-target-guide" aria-label="Exemples de cibles">
            <div class="target-guide-item">
              <span class="target-guide-shape"></span>
              <span>Bonne cible</span>
            </div>
            <div class="target-guide-item">
              <span class="target-guide-shape is-decoy"></span>
              <span>Leurre</span>
            </div>
          </div>
          <button type="button" class="mini-reflex-start" on:click={startGame}>Jouer</button>
        {/if}
      </div>
    {/if}
  </div>

  <div class="mini-reflex-stats" aria-live="polite">
    <p><span>Clics reussis</span> {hits}</p>
    <p><span>Total clics</span> {totalClicks}</p>
    <p><span>Precision</span> {accuracy}%</p>
    <p><span>Meilleur combo</span> x{bestCombo}</p>
  </div>

  <section class="mini-reflex-history" aria-label="Historique des 10 dernieres parties">
    <div class="mini-reflex-history-head">
      <h5>Historique des 10 runs</h5>
      <p>Barres: score. Points: reaction moyenne.</p>
    </div>

    {#if runHistory.length > 0}
      <div class="mini-reflex-history-graph" role="img" aria-label="Evolution des scores et reactions sur les 10 derniers runs">
        {#each runHistory as run (run.id)}
          <div class="history-run" title={`Mode ${run.mode} | Score ${run.score} | React ${run.avgReactionMs}ms | Precision ${run.accuracy}%`}>
            <span class="history-score-bar" style={`height:${Math.max(8, (run.score / historyScoreMax) * 100)}%;`}></span>
            {#if run.avgReactionMs > 0}
              <span class="history-reaction-dot" style={`bottom:${Math.max(8, (run.avgReactionMs / historyReactionMax) * 100)}%;`}></span>
            {/if}
          </div>
        {/each}
      </div>
      <div class="mini-reflex-history-list">
        {#each runHistory as run, index (run.id)}
          <p>
            <span>#{runHistory.length - index}</span>
            {run.mode} · {run.score} pts · {run.avgReactionMs}ms · {run.accuracy}%
          </p>
        {/each}
      </div>
    {:else}
      <p class="mini-reflex-history-empty">Joue une premiere partie pour afficher l'historique.</p>
    {/if}
  </section>
</div>
