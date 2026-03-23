<script>
  export let metrics = []

  const fallback = [
    { value: '2025', label: 'Diplome DWWM' },
    { value: '6+', label: 'Experiences pro' },
    { value: 'C1 Anglais', label: 'Bilingue' },
  ]

  const icons = ['school', 'work', 'translate']

  $: cards = (metrics.length ? metrics : fallback).slice(0, 3)
</script>

<section class="gm-stats" aria-label="Chiffres cles">
  {#each cards as card, index}
    <article class="glass-panel gm-stat-card">
      <div class="gm-stat-card__icon" aria-hidden="true">
        <span class="material-symbols-outlined">{icons[index] ?? 'bolt'}</span>
      </div>
      <div>
        <p class="gm-stat-card__value">{card.value}</p>
        <p class="gm-stat-card__label">{card.label}</p>
      </div>
    </article>
  {/each}
</section>
