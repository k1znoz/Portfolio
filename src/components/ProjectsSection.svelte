<script>
  import '../styles/components/projects-section.css'

  export let projects

  let activePreview = null

  function togglePreview(projectName) {
    activePreview = activePreview === projectName ? null : projectName
  }

  function getPreviewLabel(project) {
    if (!project.demo) return 'Apercu'
    return project.demo.mode === 'sandbox' ? 'Demo sandbox' : 'Apercu live'
  }
</script>

<section id="projects" class="panel projects-section">
  <div class="section-head">
    <h2>Selection de projets</h2>
    <a href="/projects">Voir le dossier complet</a>
  </div>

  <div class="project-list">
    {#each projects as project (project.name)}
      <article class="project-row">
        <p class="project-date">{project.date}</p>

        <div class="project-main">
          <p class="project-type">{project.type}</p>
          <h3>{project.name}</h3>
          <p>{project.summary}</p>

          <div class="project-links">
            {#if project.links.live}
              <a href={project.links.live}>Live</a>
            {/if}
            <a href={project.links.source}>Code</a>
            <button
              type="button"
              class="preview-toggle"
              aria-expanded={activePreview === project.name}
              on:click={() => togglePreview(project.name)}
            >
              {activePreview === project.name ? 'Masquer apercu' : getPreviewLabel(project)}
            </button>
          </div>

          {#if activePreview === project.name && project.demo}
            <div class="project-preview-wrap">
              <iframe
                class="project-preview"
                src={project.demo.url}
                title={`Apercu de ${project.name}`}
                loading="lazy"
                referrerpolicy="no-referrer"
              ></iframe>
              <p class="preview-note">
                {#if project.demo.mode === 'sandbox'}
                  Apercu via sandbox pour un projet non deploye publiquement.
                {:else}
                  Si l'aperçu ne s'affiche pas, le site bloque l'embed.
                {/if}
                Ouvre la demo dans un nouvel onglet:
                <a href={project.demo.url} target="_blank" rel="noreferrer">ouvrir la demo</a>.
              </p>
            </div>
          {/if}
        </div>
      </article>
    {/each}
  </div>

</section>
