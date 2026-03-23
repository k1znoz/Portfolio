<script>
    export let projects = []

    function makeTags(project) {
        const typeTag = String(project.type || 'Projet').split(/[+\s-]/)[0].toUpperCase()
        const modeTag = project.demo?.mode ? String(project.demo.mode).toUpperCase() : 'DEMO'
        const codeTag = project.links?.live ? 'LIVE' : 'SOURCE'
        return [typeTag, modeTag, codeTag]
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

    // Prefer cards that already have an API image, with consistent ordering across themes.
    $: orderedProjects = sortProjectsByDisplayOrder(projects)
    $: imageCards = orderedProjects.filter((project) => Boolean(project.image))
    $: cards = (imageCards.length >= 3 ? imageCards : orderedProjects).slice(0, 3)

    let failedImages = new Set()

    function markImgFailed(projectName) {
        failedImages = new Set([...failedImages, projectName])
    }
</script>

<!-- PROJECT GRID -->
<section id="projects" class="scroll-mt-20 p-8 lg:p-12">
<div class="flex items-end justify-between mb-12 border-b-2 border-primary pb-4">
<h2 class="text-4xl font-headline font-black uppercase">SELECTION_PROJETS</h2>
<span class="font-label text-on-surface-variant text-sm">[01] PORTFOLIO_ACTUEL</span>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0 border-2 border-outline-variant">
    {#each cards as project, index}
        <div class={`bg-surface-container-low border-b-2 border-outline-variant hover:bg-surface-container-high group transition-none ${index < cards.length - 1 ? 'border-r-2' : ''}`}>
            <div class="h-64 relative overflow-hidden bg-surface-container-highest">
                {#if project.image && !failedImages.has(project.name)}
                    <img
                        alt={`Illustration de ${project.name}`}
                        class="w-full h-full object-cover grayscale contrast-125 opacity-50 group-hover:opacity-80 transition-opacity"
                        src={project.image}
                        loading="lazy"
                        on:error={() => markImgFailed(project.name)}
                    />
                {:else}
                    <div class="w-full h-full flex items-center justify-center bg-surface-container-high">
                        <span class="font-headline text-3xl font-black text-outline/20 tracking-tighter uppercase">
                            {String(project.name || 'PROJET').replace(/\s+/g, '_').toUpperCase()}
                        </span>
                    </div>
                {/if}
                <div class="absolute top-4 left-4 bg-primary text-on-primary px-2 py-0.5 font-label text-[10px] font-bold">
                    {project.links?.live ? 'LIVE_DEPLOY' : 'SOURCE_ONLY'}
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-headline font-bold text-on-surface uppercase tracking-tight">{String(project.name || 'PROJET').replace(/\s+/g, '_').toUpperCase()}</h3>
                    <span class="font-label text-xs text-tertiary">{project.date || '-'}</span>
                </div>
                <p class="text-on-surface-variant font-body text-sm mb-6 leading-relaxed">
                    {String(project.summary || '').toUpperCase()}
                </p>
                <div class="flex flex-wrap gap-2 mb-8">
                    {#each makeTags(project) as tag}
                        <span class="bg-surface-container-highest text-on-surface-variant px-2 py-1 text-[10px] font-label font-bold">{tag}</span>
                    {/each}
                </div>
                <div class="flex gap-2">
                    <a href={project.links?.source} target="_blank" rel="noreferrer" class="w-full border-2 border-primary text-primary py-3 font-headline font-black text-sm uppercase hover:bg-primary hover:text-on-primary transition-none flex justify-center items-center gap-2">
                        SOURCE_CODE
                        <span class="material-symbols-outlined text-sm" data-icon="terminal">terminal</span>
                    </a>
                    {#if project.links?.live}
                        <a href={project.links.live} target="_blank" rel="noreferrer" class="w-full border-2 border-secondary text-secondary py-3 font-headline font-black text-sm uppercase hover:bg-secondary hover:text-surface transition-none flex justify-center items-center gap-2">
                            LIVE
                        </a>
                    {/if}
                </div>
            </div>
        </div>
    {/each}
</div>
</section>