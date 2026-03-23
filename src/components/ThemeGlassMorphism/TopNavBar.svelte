<script>
  import { onMount } from 'svelte'
  import { createHashSectionWatcher } from '../../lib/menu-state'

  export let ownerName = 'k1znoz'
  export let onContactClick = () => {}

  let currentSection = 'projects'
  const navItems = [
    { id: 'projects', label: 'Projects', href: '#projects' },
    { id: 'cv', label: 'CV', href: '#cv' },
    { id: 'expertise', label: 'Expertise', href: '#expertise' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ]

  $: brand = String(ownerName || 'k1znoz').toUpperCase()

  function selectSection(sectionId) {
    currentSection = sectionId
  }

  onMount(() => {
    return createHashSectionWatcher({
      windowRef: window,
      validSectionIds: navItems.map((item) => item.id),
      fallbackSectionId: 'projects',
      onSectionChange: (nextSection) => {
        currentSection = nextSection
      },
    })
  })
</script>

<nav class="gm-top-nav" aria-label="Navigation principale">
  <div class="gm-top-nav__inner">
    <a href="#hero" class="gm-top-nav__brand" on:click={() => selectSection('hero')}>{brand}</a>

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

    <button type="button" class="gm-top-nav__cta" on:click={onContactClick}>
      Get in Touch
    </button>
  </div>
</nav>
