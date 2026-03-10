<script>
  import { chargeCta } from '../lib/premium-interactions'
  import { titleReveal } from '../lib/title-reveal'
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

  function magneticHover(node) {
    const reduceMotionQuery =
      typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

    if (typeof node.animate !== 'function') {
      return {}
    }

    let activeAnimation

    function onPointerMove(event) {
      if (reduceMotionQuery?.matches) {
        return
      }

      const rect = node.getBoundingClientRect()
      const offsetX = event.clientX - (rect.left + rect.width / 2)
      const offsetY = event.clientY - (rect.top + rect.height / 2)
      const translateX = Math.max(-8, Math.min(8, offsetX * 0.16))
      const translateY = Math.max(-6, Math.min(6, offsetY * 0.18))

      activeAnimation?.cancel()
      activeAnimation = node.animate(
        [
          { transform: 'translate3d(0, 0, 0) scale(1)' },
          { transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(1.01)` },
        ],
        {
          duration: 180,
          easing: 'cubic-bezier(0.2, 0.84, 0.24, 1)',
          fill: 'forwards',
        }
      )
    }

    function onPointerLeave() {
      activeAnimation?.cancel()
      node.animate(
        [
          { transform: getComputedStyle(node).transform === 'none' ? 'translate3d(0, 0, 0) scale(1.01)' : getComputedStyle(node).transform },
          { transform: 'translate3d(0, 0, 0) scale(1)' },
        ],
        {
          duration: 220,
          easing: 'cubic-bezier(0.22, 0.7, 0.2, 1)',
          fill: 'forwards',
        }
      )
    }

    node.addEventListener('pointermove', onPointerMove)
    node.addEventListener('pointerleave', onPointerLeave)
    node.addEventListener('blur', onPointerLeave)

    return {
      destroy() {
        node.removeEventListener('pointermove', onPointerMove)
        node.removeEventListener('pointerleave', onPointerLeave)
        node.removeEventListener('blur', onPointerLeave)
        activeAnimation?.cancel()
      },
    }
  }
</script>

<header id="hero" class="panel hero-section">
  <p class="kicker">Portfolio d'Alois</p>
  <h1 use:titleReveal>Developpeur Web & Web Mobile diplome, oriente interfaces utiles et solides.</h1>
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
    <a class="hero-link" href="#projects" use:magneticHover use:chargeCta>Voir les projets</a>
    <a class="hero-link hero-link--ghost" href="#contact" use:magneticHover use:chargeCta
      >Demarrer une collaboration</a
    >
  </div>

  <p class="hero-section__mood">
    Mode actif: <strong>{currentTheme.name}</strong> ({currentTheme.mood})
  </p>
</header>
