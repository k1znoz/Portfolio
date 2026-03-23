<script>
  import '../styles/components/template-theme-section.css'

  export let layoutThemes = []
  export let currentLayoutTheme
  export let onSelectLayoutTheme
</script>

<section class="panel template-theme-section" aria-labelledby="template-theme-title">
  <div class="template-theme-section__head">
    <p class="kicker">Templates</p>
    <h2 id="template-theme-title">Choisir un theme de presentation</h2>
    <p>
      Chaque variante reprend les memes informations (projets, CV, contact), avec une mise en forme
      differente.
    </p>
  </div>

  <div class="template-theme-grid" role="group" aria-label="Selection de theme de presentation">
    {#each layoutThemes as theme}
      <button
        type="button"
        class={`template-theme-btn ${theme.id === currentLayoutTheme.id ? 'is-active' : ''}`}
        aria-pressed={theme.id === currentLayoutTheme.id}
        on:click={() => onSelectLayoutTheme(theme.id)}
      >
        <span class="template-theme-btn__name">{theme.name}</span>
        <span class="template-theme-btn__desc">{theme.description}</span>
        <span class="template-theme-btn__files">{theme.sourceFiles.join(' • ')}</span>
      </button>
    {/each}
  </div>
</section>
