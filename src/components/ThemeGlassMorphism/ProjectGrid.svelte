<script>
  import { sortProjectsByDisplayOrder } from '../../lib/project-order'

  export let projects = []

  let failedImages = new Set()

  function markImgFailed(projectName) {
    failedImages = new Set([...failedImages, projectName])
  }


  function projectTags(project) {
    const main = String(project.type || 'WEB').split(/[+\s-]/)[0].toUpperCase()
    const second = project.links?.live ? 'LIVE' : 'SOURCE'
    return [main, second]
  }

  $: ordered = sortProjectsByDisplayOrder(projects)
  $: cards = ordered.slice(0, 6)
</script>

<section id="projects" class="gm-projects scroll-mt-20" aria-label="Selection de projets">
  <header class="gm-section-head">
    <div>
      <h2>Selection de projets</h2>
      <p>Exploration technique a travers des applications web reelles et experimentales.</p>
    </div>
    <span>[ {cards.length} PROJETS ]</span>
  </header>

  <div class="gm-project-grid">
    {#each cards as project}
      <article class="glass-panel gm-project-card">
        <div class="gm-project-card__media">
          {#if project.image && !failedImages.has(project.name)}
            <img
              src={project.image}
              alt={`Apercu de ${project.name}`}
              loading="lazy"
              on:error={() => markImgFailed(project.name)}
            />
          {:else}
            <div class="gm-project-card__placeholder">
              {String(project.name || 'Projet').toUpperCase()}
            </div>
          {/if}
        </div>

        <div class="gm-project-card__body">
          <h3>
            {project.name}
            <span class="material-symbols-outlined" aria-hidden="true">arrow_outward</span>
          </h3>

          <p>{project.summary}</p>

          <div class="gm-project-card__tags">
            {#each projectTags(project) as tag}
              <span>{tag}</span>
            {/each}
          </div>

          <div class="gm-project-card__links">
            {#if project.links?.source}
              <a href={project.links.source} target="_blank" rel="noreferrer">Source</a>
            {/if}
            {#if project.links?.live}
              <a href={project.links.live} target="_blank" rel="noreferrer">Live</a>
            {/if}
          </div>
        </div>
      </article>
    {/each}
  </div>
</section>
