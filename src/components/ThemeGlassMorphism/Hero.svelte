<script>
  export let title = 'Developpeur Web & Web Mobile'
  export let pitch = ''
  export let heroImage = '/images/projects/Coutellerie-Svelte-Sanity.png'
  export let stackLabel = 'SvelteKit + Laravel'
  export let onOpenProjects = () => {}
  export let onOpenContact = () => {}
</script>

<section id="hero" class="gm-hero scroll-mt-20" aria-label="Presentation">
  <div class="gm-hero__glow gm-hero__glow--cyan" aria-hidden="true"></div>
  <div class="gm-hero__glow gm-hero__glow--purple" aria-hidden="true"></div>

  <div class="gm-hero__content">
    <div class="gm-pill">
      <span class="gm-pill__pulse" aria-hidden="true"></span>
      Available for new projects
    </div>

    <h1>
      Developpeur Web &amp;
      <span>Web Mobile</span>
      diplome.
    </h1>

    <p>
      <strong>{title}.</strong>
      {pitch}
    </p>

    <div class="gm-hero__actions">
      <button type="button" class="gm-btn gm-btn--primary" on:click={onOpenProjects}>
        Voir les projets
      </button>
      <button type="button" class="gm-btn gm-btn--ghost" on:click={onOpenContact}>
        Me contacter
      </button>
    </div>
  </div>

  <div class="gm-hero__media glass-panel">
    <img src={heroImage} alt="Apercu environnement de developpement" loading="lazy" />
    <div class="gm-hero__media-overlay" aria-hidden="true"></div>
    <div class="gm-hero__media-caption">
      <span>Stack actuelle</span>
      <strong>{stackLabel}</strong>
    </div>
  </div>
</section>
