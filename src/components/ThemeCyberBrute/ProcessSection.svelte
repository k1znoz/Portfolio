<script>
    export let experiences = []

    function tagify(text) {
        return `#${String(text || '')
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 1)
            .join('')
            .toUpperCase()}`
    }

    $: items = experiences.slice(0, 3)
</script>

<!-- CV / PROCESS SECTION -->
<section id="process" class="scroll-mt-20 p-8 lg:p-12 bg-surface-container-low">
<h2 class="text-4xl font-headline font-black uppercase mb-12 flex items-center gap-4">
                PARCOURS_PRO
                <span class="flex-grow h-0.5 bg-outline-variant"></span>
</h2>
<div class="space-y-0 border-l-2 border-primary ml-4">
    {#each items as experience, index}
        <div class={`relative pl-12 ${index < items.length - 1 ? 'pb-16' : ''}`}>
            <div class={`absolute -left-[9px] top-0 w-4 h-4 ${index === 0 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
            <div class={`font-label text-xs font-black mb-1 ${index === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>
                {String(experience.period || '').toUpperCase()}
            </div>
            <h3 class="text-2xl font-headline font-black text-secondary uppercase mb-2">
                {String(`${experience.role || ''} @ ${experience.company || ''}`).trim()}
            </h3>
            <p class="text-on-surface-variant max-w-2xl text-sm mb-4">
                {String(experience.points?.[0] || '').toUpperCase()}
            </p>
            {#if experience.points?.length}
                <div class="flex gap-4 font-label text-[10px] text-tertiary font-bold">
                    {#each experience.points.slice(0, 3) as point}
                        <span>{tagify(point)}</span>
                    {/each}
                </div>
            {/if}
        </div>
    {/each}
</div>
</section>