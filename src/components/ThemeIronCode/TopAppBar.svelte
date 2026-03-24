<script>
  import { onMount } from 'svelte'
  import { createHashSectionWatcher } from '../../lib/menu-state'

  export let activeSection = 'hero'
  export let onHireClick = () => {}
  export let onSwitchToBaseLayout = () => {}
  export let showLayoutToggle = true

  let menuOpen = false

  const navItems = [
    { id: 'hero', label: 'FORGE', href: '#hero' },
    { id: 'projects', label: 'ARSENAL', href: '#projects' },
    { id: 'skills', label: 'BLUEPRINTS', href: '#skills' },
    { id: 'timeline', label: 'RECORDS', href: '#timeline' },
  ]

  function closeMenu() {
    menuOpen = false
  }

  onMount(() => {
    const stopWatchingHash = createHashSectionWatcher({
      windowRef: window,
      validSectionIds: navItems.map((item) => item.id),
      fallbackSectionId: 'hero',
      onSectionChange: (nextSection) => {
        activeSection = nextSection
      },
    })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    const onResize = () => {
      if (window.innerWidth >= 768 && menuOpen) {
        closeMenu()
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

<header class="iron-topbar">
  <a href="#hero" class="iron-topbar__logo" aria-label="Retour en haut">THE IRON CODE</a>

  <!-- Navigation desktop -->
  <nav class="iron-topbar__nav hidden md:flex" aria-label="Navigation principale">
    {#each navItems as item}
      <a
        href={item.href}
        class="iron-topbar__nav-link {activeSection === item.id ? 'is-active' : ''}"
      >
        {item.label}
      </a>
    {/each}
    {#if showLayoutToggle}
      <button
        type="button"
        class="iron-topbar__nav-link text-xs opacity-40 hover:opacity-100 ml-2"
        on:click={onSwitchToBaseLayout}
        title="Revenir au layout Editorial"
      >
        [EDITORIAL]
      </button>
    {/if}
  </nav>

  <!-- Droite : CTA desktop + burger mobile -->
  <div class="iron-topbar__right">
    <button type="button" class="iron-topbar__cta hidden md:block" on:click={onHireClick}>
      HIRE THE SMITH
    </button>
    <!-- Burger — barres épaisses comme des barres de métal forgé -->
    <button
      type="button"
      class="iron-burger md:hidden"
      class:iron-burger--open={menuOpen}
      on:click={() => (menuOpen = !menuOpen)}
      aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      aria-expanded={menuOpen}
    >
      <span class="iron-burger__bar"></span>
      <span class="iron-burger__bar"></span>
      <span class="iron-burger__bar"></span>
    </button>
  </div>
</header>

<!-- Menu mobile -->
{#if menuOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div
    class="md:hidden fixed inset-0 z-40 bg-black/70"
    role="presentation"
    on:click={closeMenu}
  ></div>
  <nav
    class="md:hidden fixed top-[5rem] left-0 right-0 z-50 iron-mobile-menu"
    aria-label="Menu mobile"
  >
    {#each navItems as item}
      <a
        href={item.href}
        class="iron-mobile-link {activeSection === item.id ? 'is-active' : ''}"
        on:click={() => {
          activeSection = item.id
          closeMenu()
        }}
        aria-current={activeSection === item.id ? 'page' : undefined}
      >
        {item.label}
      </a>
    {/each}
    <button
      type="button"
      class="iron-topbar__cta iron-mobile-cta"
      on:click={() => {
        onHireClick()
        closeMenu()
      }}
    >
      HIRE THE SMITH
    </button>
    {#if showLayoutToggle}
      <button
        type="button"
        class="iron-mobile-editorial"
        on:click={() => {
          onSwitchToBaseLayout()
          closeMenu()
        }}
      >
        [EDITORIAL_MODE]
      </button>
    {/if}
  </nav>
{/if}
