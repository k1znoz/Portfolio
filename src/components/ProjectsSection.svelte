<script>
  import { cubicOut } from 'svelte/easing'

  import { chargeCta, panelSpotlight, tiltCard } from '../lib/premium-interactions'
  import MiniReflexGame from './MiniReflexGame.svelte'
  import TowerDefenseGame from './TowerDefenseGame.svelte'
  import { titleReveal } from '../lib/title-reveal'
  import '../styles/components/projects-section.css'

  export let projects

  let activePreview = null

  function togglePreview(projectName) {
    activePreview = activePreview === projectName ? null : projectName
  }

  function getPreviewLabel(project) {
    if (!project.demo) return 'Apercu'
    if (project.demo.mode === 'internal') return 'Jouer'
    return project.demo.mode === 'sandbox' ? 'Demo sandbox' : 'Apercu live'
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
    <a href="https://github.com/k1znoz?tab=repositories" target="_blank" rel="noreferrer">
      Voir le dossier complet
    </a>
  </div>

  <div class="project-list">
    {#each projects as project (project.name)}
      <article
        class="project-row"
        use:tiltCard={{
          intensity: 4.8,
          scale: 1.007,
          disabled: activePreview === project.name && project.demo?.mode === 'internal',
        }}
      >
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
            {#if project.demo?.mode === 'internal'}
              <a href={project.demo.path ?? '/game'} target="_blank" rel="noreferrer">Ouvrir en grand</a>
            {/if}
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
              {#if project.demo.mode === 'internal' && project.demo.game === 'mini-reflex'}
                <MiniReflexGame />
              {:else if project.demo.mode === 'internal' && project.demo.game === 'tower-defense'}
                <TowerDefenseGame compact={true} />
              {:else}
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
              {/if}
            </div>
          {/if}
        </div>
      </article>
    {/each}
  </div>

</section>
