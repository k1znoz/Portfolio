<script>
  import { onMount } from 'svelte'
  import { createHashSectionWatcher } from '../../lib/menu-state'

  // Current active section anchor (used to highlight active nav link)
  export let activeSection = 'hero'

  // Callback to smoothly scroll to a contact section / open contact
  export let onHireClick = () => {}

  // Callback to switch back to base layout (editorial)
  export let onSwitchToBaseLayout = () => {}
  export let showLayoutToggle = true

  const navItems = [
    { id: 'hero', label: 'FORGE', href: '#hero' },
    { id: 'projects', label: 'ARSENAL', href: '#projects' },
    { id: 'skills', label: 'BLUEPRINTS', href: '#skills' },
    { id: 'timeline', label: 'RECORDS', href: '#timeline' },
  ]

  onMount(() => {
    return createHashSectionWatcher({
      windowRef: window,
      validSectionIds: navItems.map((item) => item.id),
      fallbackSectionId: 'hero',
      onSectionChange: (nextSection) => {
        activeSection = nextSection
      },
    })
  })
</script>

<header class="iron-topbar">
  <!-- Logo / Brand -->
  <a href="#hero" class="iron-topbar__logo" aria-label="Retour en haut">THE IRON CODE</a>

  <!-- Main navigation — hidden on small screens -->
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
      <!-- Switch layout button -->
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

  <!-- CTA button -->
  <button type="button" class="iron-topbar__cta" on:click={onHireClick}>
    HIRE THE SMITH
  </button>
</header>
