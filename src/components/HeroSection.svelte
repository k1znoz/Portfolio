<script>
  import '../styles/components/hero-section.css'

  export let currentTheme
  export let stack = []

  const stackIcons = {
    HTML: '/images/icons/html.svg',
    CSS: '/images/icons/css.svg',
    SCSS: '/images/icons/scss.svg',
    JavaScript: '/images/icons/javascript.svg',
    TypeScript: '/images/icons/typescript.svg',
    Svelte: '/images/icons/svelte.svg',
    PHP: '/images/icons/php.svg',
    Laravel: '/images/icons/laravel.svg',
    MySQL: '/images/icons/mysql.svg',
    Java: '/images/icons/java.svg',
  }
</script>

<header id="hero" class="panel hero-section">
  <p class="kicker">Portfolio d'Alois</p>
  <h1>Developpeur Web & Web Mobile diplome, oriente interfaces utiles et solides.</h1>
  <p class="lead">
    Attire par le web depuis longtemps, je transforme des besoins metier en interfaces claires,
    responsives et maintenables, avec une attention particuliere a la qualite de finition.
  </p>

  <div class="hero-stack" aria-label="Langages et outils principaux">
    {#each stack as skill}
      <span class="hero-stack-chip">
        {#if stackIcons[skill]}
          <img class="hero-stack-icon" src={stackIcons[skill]} alt="" loading="eager" decoding="async" />
        {:else}
          <span class="hero-stack-fallback" aria-hidden="true">{skill.slice(0, 2).toUpperCase()}</span>
        {/if}
        <span>{skill}</span>
      </span>
    {/each}
  </div>

  <div class="hero-section__meta">
    <a class="hero-link" href="#projects">Voir les projets</a>
    <a class="hero-link hero-link--ghost" href="#contact">Demarrer une collaboration</a>
  </div>

  <p class="hero-section__mood">
    Mode actif: <strong>{currentTheme.name}</strong> ({currentTheme.mood})
  </p>
</header>
