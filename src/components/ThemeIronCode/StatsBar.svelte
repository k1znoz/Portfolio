<script>
  // Each entry: { value: string, label: string }
  export let metrics = []

  // Defaults sourced from portfolio data
  const defaultStats = [
    { value: '5+',  label: 'ANS PRO // SENIOR_LEVEL' },
    { value: '42+', label: 'PROJETS LIVRÉS // PRODUCTION_READY' },
    { value: '99%', label: 'SCORE PERFORMANCE // LIGHTHOUSE_OPTIMIZED' },
  ]

  $: stats = metrics.length
    ? metrics.map((m, i) => ({ value: m.value, label: m.label ?? defaultStats[i]?.label ?? '' }))
    : defaultStats
</script>

<!-- STATS BAR ------------------------------------------------------------- -->
<section id="stats" class="iron-stats" aria-label="Chiffres clés">
  <div class="iron-stats__grid">
    {#each stats as stat}
      <div class="iron-stats__item">
        <span class="iron-stats__value">{stat.value}</span>
        <span class="iron-stats__label">{stat.label}</span>
      </div>
    {/each}
  </div>
</section>
