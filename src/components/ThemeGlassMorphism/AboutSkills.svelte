<script>
  export let experiences = []

  const gauges = [
    { label: 'Developpement web et mobile', level: 'Expert', value: 90, tone: 'cyan' },
    { label: 'Rigueur et adaptation', level: 'Core', value: 95, tone: 'purple' },
    { label: 'Culture qualite', level: 'Standard', value: 85, tone: 'cyan' },
  ]

  $: leadPoint = String(experiences?.[0]?.points?.[0] || '')
</script>

<section id="expertise" class="gm-about-skill scroll-mt-20" aria-label="Parcours et expertise">
  <article class="glass-panel gm-about">
    <h2>Parcours hybride</h2>
    <p>
      Ancien professionnel du terrain, j'ai forge ma rigueur dans le service avant de pivoter
      vers ma passion initiale: le developpement web.
    </p>
    <blockquote>
      "{leadPoint || 'Du service a la rigueur terrain, puis le developpement web: une evolution logique vers la construction de produits solides.'}"
    </blockquote>
  </article>

  <article class="glass-panel gm-skill">
    <h2>Expertise technique</h2>

    {#each gauges as gauge}
      <div class="gm-skill__row">
        <div class="gm-skill__head">
          <span>{gauge.label}</span>
          <strong>{gauge.level}</strong>
        </div>
        <div class="gm-skill__track">
          <span class={`gm-skill__fill tone-${gauge.tone}`} style={`width:${gauge.value}%`}></span>
        </div>
      </div>
    {/each}
  </article>
</section>
