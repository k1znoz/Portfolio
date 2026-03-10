<script>
  import { cubicOut } from 'svelte/easing'

  import { chargeCta, panelSpotlight, tiltCard } from '../lib/premium-interactions'
  import { titleReveal } from '../lib/title-reveal'
  import '../styles/components/projects-section.css'

  export let projects

  let activePreview = null

  function togglePreview(projectName) {
    activePreview = activePreview === projectName ? null : projectName
  }

  function getPreviewLabel(project) {
    if (!project.demo) return 'Apercu'
    return project.demo.mode === 'sandbox' ? 'Ouvrir sandbox' : 'Apercu live'
  }

  function canEmbedDemo(project) {
    return Boolean(project.demo && project.demo.mode === 'live')
  }

  function cinematicPreview(node, { duration = 540 } = {}) {
    return {
      duration,
      easing: cubicOut,
      css: (t, u) => {
        const blur = (1 - t) * 7
        const clipTop = u * 18
        const clipBottom = u * 6

        return `
          opacity: ${t};
          transform: translateY(${u * 12}px) scale(${0.985 + 0.015 * t});
          filter: blur(${blur}px) saturate(${0.85 + t * 0.2});
          clip-path: inset(${clipTop}% 0 ${clipBottom}% 0 round 12px);
        `
      },
    }
  }
</script>

<section id="projects" class="panel projects-section" use:panelSpotlight>
  <div class="section-head">
    <h2 use:titleReveal>Selection de projets</h2>
    <a href="/projects">Voir le dossier complet</a>
  </div>

  <div class="project-list">
    {#each projects as project (project.name)}
      <article class="project-row" use:tiltCard={{ intensity: 4.8, scale: 1.007 }}>
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
              use:chargeCta
              on:click={() => togglePreview(project.name)}
            >
              {activePreview === project.name ? 'Masquer apercu' : getPreviewLabel(project)}
            </button>
          </div>

          {#if activePreview === project.name && project.demo}
            <div class="project-preview-wrap" transition:cinematicPreview>
              {#if canEmbedDemo(project)}
                <iframe
                  class="project-preview"
                  src={project.demo.url}
                  title={`Apercu de ${project.name}`}
                  loading="lazy"
                  referrerpolicy="no-referrer"
                ></iframe>
              {/if}
              <p class="preview-note">
                {#if project.demo.mode === 'sandbox'}
                  Pour eviter les alertes cookies tierces du sandbox, la demo s'ouvre uniquement dans
                  un nouvel onglet.
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
