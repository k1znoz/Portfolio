<script>
  import { onDestroy } from 'svelte'

  import '../styles/components/metrics-panel.css'

  export let metrics

  let rootEl
  let observer
  let metricValues = []
  let animatedIndexes = new Set()

  $: metricValues = metrics.map((metric, index) => metricValues[index] ?? metric.value)

  function parseMetric(value) {
    const match = value.match(/^(.*?)(\d+)(.*?)$/)

    if (!match) {
      return null
    }

    return {
      prefix: match[1],
      number: Number(match[2]),
      suffix: match[3],
    }
  }

  function easeOutQuart(progress) {
    return 1 - Math.pow(1 - progress, 4)
  }

  function animateMetric(index) {
    if (animatedIndexes.has(index)) {
      return
    }

    const metric = metrics[index]
    const parsed = parseMetric(metric.value)
    animatedIndexes.add(index)

    if (!parsed) {
      metricValues[index] = metric.value
      return
    }

    const duration = 750 + Math.min(parsed.number, 2400) * 0.12
    const start = performance.now()

    const step = (now) => {
      const rawProgress = Math.min((now - start) / duration, 1)
      const eased = easeOutQuart(rawProgress)
      const nextValue = Math.round(parsed.number * eased)
      metricValues[index] = `${parsed.prefix}${nextValue}${parsed.suffix}`

      if (rawProgress < 1) {
        requestAnimationFrame(step)
      } else {
        metricValues[index] = metric.value
      }
    }

    requestAnimationFrame(step)
  }

  function setupObserver() {
    if (!rootEl || typeof IntersectionObserver === 'undefined') {
      metricValues = metrics.map((metric) => metric.value)
      return
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = [...rootEl.querySelectorAll('.metric-card')]

    if (reduceMotion) {
      metricValues = metrics.map((metric) => metric.value)
      return
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          const index = cards.indexOf(entry.target)
          if (index !== -1) {
            animateMetric(index)
          }

          observer?.unobserve(entry.target)
        })
      },
      {
        threshold: 0.35,
      }
    )

    cards.forEach((card) => observer.observe(card))
  }

  $: if (metrics.length && rootEl) {
    observer?.disconnect()
    setupObserver()
  }

  onDestroy(() => {
    observer?.disconnect()
  })
</script>

<section bind:this={rootEl} class="panel metrics-panel" aria-label="Indicateurs cles">
  {#each metrics as metric, index}
    <article class="metric-card">
      <p class="metric-value">{metricValues[index] ?? metric.value}</p>
      <p>{metric.label}</p>
    </article>
  {/each}
</section>
