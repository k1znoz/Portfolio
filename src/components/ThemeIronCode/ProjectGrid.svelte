<script>
  // Array of project objects from portfolio.js
  export let projects = []

  // Map known project names to their Iron Code "stack tag"
  function resolveTag(project) {
    const type = String(project.type ?? '').toUpperCase()
    if (type.includes('LARAVEL')) return 'E-COMMERCE // LARAVEL'
    if (type.includes('SVELTE') && type.includes('LARAVEL')) return 'FULLSTACK // SVELTE+LARAVEL'
    if (type.includes('SVELTE')) return 'APP // SVELTE'
    if (type.includes('VUE')) return 'PWA // VUE.JS'
    if (type.includes('RUST')) return 'TOOLING // RUST'
    if (type.includes('TOWER') || type.includes('CANVAS')) return 'GAME // SVELTE'
    return type.split(/[+\s]/)[0] ?? 'WEB'
  }

  // Shared visual order across themes.
  const PROJECT_DISPLAY_ORDER = [
    'Coutellerie-svelte-laravel',
    'MariageLV',
    'GrainesDeJardin',
    'LivingSoils',
  ]

  function getProjectOrderIndex(projectName) {
    const index = PROJECT_DISPLAY_ORDER.indexOf(projectName)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }

  function sortProjectsByDisplayOrder(items) {
    return [...items].sort((a, b) => {
      const rankA = getProjectOrderIndex(a?.name)
      const rankB = getProjectOrderIndex(b?.name)

      if (rankA !== rankB) {
        return rankA - rankB
      }

      return String(a?.name ?? '').localeCompare(String(b?.name ?? ''))
    })
  }

  // Prefer projects with API image, and keep a consistent ordering across themes.
  $: orderedProjects = sortProjectsByDisplayOrder(projects)
  $: screenshotProjects = orderedProjects.filter((project) => Boolean(project.image))
  $: cards = (screenshotProjects.length >= 4 ? screenshotProjects : orderedProjects).slice(0, 4)

  // Track images that failed to load so we can reactively show the placeholder
  let failedImages = new Set()

  function markImgFailed(projectName) {
    failedImages = new Set([...failedImages, projectName])
  }
</script>

<!-- ARSENAL / PROJECT GRID ------------------------------------------------ -->
<section id="projects" class="iron-projects scroll-mt-20" aria-label="Arsenal des réalisations">
  <!-- Section header -->
  <div class="iron-projects__header">
    <div>
      <h2 class="font-headline text-4xl font-black uppercase tracking-tighter text-on-surface">
        ARSENAL DES RÉALISATIONS
      </h2>
      <p class="font-label text-primary mt-2 tracking-widest">SELECTED_OUTPUTS_V4.0</p>
    </div>
    <p class="hidden md:block font-body text-secondary text-sm max-w-xs text-right">
      Chaque pièce est forgée avec une attention maniaque aux détails et à la performance.
    </p>
  </div>

  <!-- 2-column grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
    {#each cards as project}
      <article class="iron-project-card group">
        <!-- Image area -->
        <div class="iron-project-card__img-wrapper">
          {#if project.image && !failedImages.has(project.name)}
            <!-- Local curated screenshot -->
            <img
              src={project.image}
              alt="Aperçu de {project.name}"
              loading="lazy"
              on:error={() => markImgFailed(project.name)}
            />
          {:else}
            <!-- Brushed metal placeholder -->
            <div class="brushed-metal w-full h-full flex items-center justify-center bg-surface-bright">
              <span class="font-headline text-4xl font-black text-outline/20 tracking-tighter uppercase">
                {project.name.replace(/\s+/g, '_')}
              </span>
            </div>
          {/if}
          <div class="iron-project-card__gradient"></div>
        </div>

        <!-- Card body -->
        <div class="iron-project-card__body">
          <div class="flex justify-between items-start mb-4">
            <h3 class="font-headline text-2xl font-bold uppercase tracking-tight text-on-surface">
              {project.name.toUpperCase()}
            </h3>
            <span class="iron-project-card__tag">{resolveTag(project)}</span>
          </div>

          <p class="font-body text-secondary text-sm mb-6 leading-relaxed">
            {project.summary}
          </p>

          <div class="flex gap-4">
            {#if project.links?.source}
              <a
                href={project.links.source}
                target="_blank"
                rel="noreferrer noopener"
                class="iron-project-card__link"
              >
                EXAMINER LA STRUCTURE
                <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
              </a>
            {/if}
            {#if project.links?.live}
              <a
                href={project.links.live}
                target="_blank"
                rel="noreferrer noopener"
                class="iron-project-card__link opacity-60 hover:opacity-100"
              >
                LIVE
              </a>
            {/if}
          </div>
        </div>
      </article>
    {/each}
  </div>
</section>
