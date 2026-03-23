<script>
  // Current active section anchor (used to highlight active nav link)
  export let activeSection = 'forge'

  // Callback to smoothly scroll to a contact section / open contact
  export let onHireClick = () => {}

  // Callback to switch back to base layout (editorial)
  export let onSwitchToBaseLayout = () => {}
  export let showLayoutToggle = true

  const navItems = [
    { id: 'forge',     label: 'FORGE',      href: '#hero' },
    { id: 'arsenal',   label: 'ARSENAL',    href: '#projects' },
    { id: 'grades',    label: 'BLUEPRINTS', href: '#skills' },
    { id: 'records',   label: 'RECORDS',    href: '#timeline' },
  ]
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
