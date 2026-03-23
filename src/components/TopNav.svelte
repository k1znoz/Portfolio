<script>
  import '../styles/components/top-nav.css'

  export let ownerName
  export let themes
  export let currentTheme
  export let layoutThemes = []
  export let currentLayoutTheme
  export let onSwitchTheme
  export let onSelectTheme
  export let onSelectLayoutTheme
  export let showThemeControls = true
  export let isCvPage = false
  export let onOpenCvPage
  export let onOpenAdminPage
  export let onOpenHomePage
</script>

<nav class="panel top-nav">
  <button class="brand brand-button" type="button" on:click={onOpenHomePage}>{ownerName}</button>

  {#if isCvPage}
    <div class="top-nav__links" aria-label="Navigation principale">
      <button type="button" class="nav-link-btn" on:click={onOpenHomePage}>Retour accueil</button>
    </div>
  {:else}
    <div class="top-nav__links" aria-label="Navigation principale">
      <a href="#projects">Projets</a>
      <a href="#about">A propos</a>
      <a href="#contact">Contact</a>
      <button type="button" class="nav-link-btn" on:click={onOpenCvPage}>Page CV</button>
      <button type="button" class="nav-link-btn" on:click={onOpenAdminPage}>Admin</button>
    </div>
  {/if}

  {#if showThemeControls}
    <div class="top-nav__actions">
      <div class="layout-previews" aria-label="Apercu des templates">
        {#each layoutThemes as layoutTheme}
          <button
            type="button"
            class={`layout-preview ${layoutTheme.id === currentLayoutTheme.id ? 'is-active' : ''}`}
            title={layoutTheme.name}
            aria-label={layoutTheme.name}
            aria-pressed={layoutTheme.id === currentLayoutTheme.id}
            on:click={() => onSelectLayoutTheme(layoutTheme.id)}
          >
            <span>{layoutTheme.name}</span>
          </button>
        {/each}
      </div>
      <button type="button" class="theme-switch" on:click={onSwitchTheme}>Changer d'ambiance</button>
      <div class="theme-previews" aria-label="Apercu des themes">
        {#each themes as theme}
          <button
            type="button"
            class={`theme-preview ${theme.id === currentTheme.id ? 'is-active' : ''}`}
            style={`--preview-a:${theme.colors[0]};--preview-b:${theme.colors[1]};`}
            title={theme.name}
            aria-label={theme.name}
            aria-pressed={theme.id === currentTheme.id}
            on:click={() => onSelectTheme(theme.id)}
          >
            <span class="preview-dot"></span>
            <span class="preview-dot"></span>
          </button>
        {/each}
      </div>
      <span
        class="theme-label"
        style={`--current-a:${currentTheme.colors[0]};--current-b:${currentTheme.colors[1]};`}
      >
        <span class="theme-label__swatch" aria-hidden="true"></span>
        <span class="theme-label__text">{currentTheme.name}</span>
        <span class="theme-label__level">{currentTheme.level}</span>
      </span>
    </div>
  {/if}
</nav>
