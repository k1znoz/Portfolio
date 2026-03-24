<script>
  import { onMount } from 'svelte'
  import { createHashSectionWatcher } from '../lib/menu-state'

  const items = [
    { id: 'hero', label: 'Accueil', href: '#hero' },
    { id: 'cv', label: 'CV', href: '#cv' },
    { id: 'projects', label: 'Projets', href: '#projects' },
    { id: 'about', label: 'Parcours', href: '#about' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ]

  let currentSection = 'hero'

  onMount(() => {
    return createHashSectionWatcher({
      windowRef: window,
      validSectionIds: items.map((item) => item.id),
      fallbackSectionId: 'hero',
      onSectionChange: (nextSection) => {
        currentSection = nextSection
      },
    })
  })
</script>

<nav class="editorial-side-bubbles" aria-label="Navigation rapide section par section">
  {#each items as item}
    <a
      href={item.href}
      class:active={currentSection === item.id}
      aria-current={currentSection === item.id ? 'page' : undefined}
      on:click={() => (currentSection = item.id)}
      title={item.label}
    >
      <span class="dot" aria-hidden="true"></span>
      <span class="label">{item.label}</span>
    </a>
  {/each}
</nav>

<style>
  .editorial-side-bubbles {
    position: fixed;
    right: 0.85rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 50;
    display: grid;
    gap: 0.42rem;
    width: 9.6rem;
  }

  .editorial-side-bubbles a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 1.9rem;
    padding: 0.15rem 0.66rem;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--outline), transparent 8%);
    background: color-mix(in srgb, var(--surface-strong), transparent 10%);
    color: color-mix(in srgb, var(--text), transparent 10%);
    text-decoration: none;
    box-shadow: inset 0 -1px 0 color-mix(in srgb, #000, transparent 84%);
    transition: transform 160ms ease, background-color 160ms ease, color 160ms ease;
  }

  .editorial-side-bubbles .dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 999px;
    flex-shrink: 0;
    background: color-mix(in srgb, var(--text), transparent 22%);
    border: 1px solid color-mix(in srgb, var(--outline), transparent 30%);
    transition: transform 160ms ease, background-color 160ms ease;
  }

  .editorial-side-bubbles .label {
    font-size: 0.74rem;
    font-weight: 600;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-family: 'Inter', sans-serif;
  }

  .editorial-side-bubbles a:hover {
    transform: translateX(-2px);
  }

  .editorial-side-bubbles a:hover .dot {
    transform: scale(1.1);
  }

  .editorial-side-bubbles a.active {
    background: color-mix(in srgb, var(--accent), var(--surface) 78%);
    color: var(--text);
    border-color: color-mix(in srgb, var(--accent), transparent 18%);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent), transparent 72%);
  }

  .editorial-side-bubbles a.active .dot {
    background: var(--accent);
    transform: scale(1.12);
  }

  @media (max-width: 1024px) {
    .editorial-side-bubbles {
      display: none;
    }
  }
</style>
