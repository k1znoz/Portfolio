<script>
  import '../styles/components/metrics-panel.css'

  export let metrics
</script>

<section class="panel metrics-panel" aria-label="Indicateurs cles">
  {#each metrics as metric}
    <article class="metric-card">
      <p class="metric-value">{metric.value}</p>
      <p>{metric.label}</p>
    </article>
  {/each}
</section>
