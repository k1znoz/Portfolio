<script>
  import { onMount } from 'svelte'
  import { createHashSectionWatcher } from '../../lib/menu-state'

  export let ownerName = 'k1znoz'
  export let onContactClick = () => {}

  let currentSection = 'projects'
  let menuOpen = false
  const navItems = [
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'cv', label: 'CV', href: '#cv' },
    { id: 'expertise', label: 'Expertise', href: '#expertise' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ]

  $: brand = String(ownerName || 'k1znoz').toUpperCase()

  function selectSection(sectionId) {
    currentSection = sectionId
    menuOpen = false
  }

  onMount(() => {
    const stopWatchingHash = createHashSectionWatcher({
      windowRef: window,
      validSectionIds: navItems.map((item) => item.id),
      fallbackSectionId: 'projects',
      onSectionChange: (nextSection) => {
        currentSection = nextSection
      },
    })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        menuOpen = false
      }
    }

    const onResize = () => {
      if (window.innerWidth >= 860 && menuOpen) {
        menuOpen = false
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)

    return () => {
      stopWatchingHash?.()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
    }
  })
</script>

<nav class="gm-top-nav" aria-label="Navigation principale">
  <div class="gm-top-nav__inner">
    <a href="#hero" class="gm-top-nav__brand" on:click={() => selectSection('hero')}>{brand}</a>

    <!-- Liens desktop -->
    <div class="gm-top-nav__links" role="list">
      {#each navItems as item}
        <a
          href={item.href}
          class:gm-link-active={currentSection === item.id}
          aria-current={currentSection === item.id ? 'page' : undefined}
          on:click={() => selectSection(item.id)}
        >
          {item.label}
        </a>
      {/each}
    </div>

    <!-- CTA desktop -->
    <button type="button" class="gm-top-nav__cta gm-cta-header" on:click={onContactClick}>
      Get in Touch
    </button>

    <!-- Burger mobile -->
    <button
      type="button"
      class="gm-burger"
      class:gm-burger--open={menuOpen}
      on:click={() => (menuOpen = !menuOpen)}
      aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={menuOpen}
    >
      <span class="gm-burger__bar"></span>
      <span class="gm-burger__bar"></span>
      <span class="gm-burger__bar"></span>
    </button>
  </div>

  <!-- Menu mobile -->
  {#if menuOpen}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
    <div class="gm-mobile-overlay" role="presentation" on:click={() => (menuOpen = false)}></div>
    <div class="gm-mobile-menu glass-panel" role="dialog" aria-label="Menu mobile">
      {#each navItems as item}
        <a
          href={item.href}
          class="gm-mobile-link"
          class:gm-link-active={currentSection === item.id}
          aria-current={currentSection === item.id ? 'page' : undefined}
          on:click={() => selectSection(item.id)}
        >
          {item.label}
        </a>
      {/each}
      <button
        type="button"
        class="gm-top-nav__cta gm-mobile-cta"
        on:click={() => {
          onContactClick()
          menuOpen = false
        }}
      >
        Get in Touch
      </button>
    </div>
  {/if}
</nav>
