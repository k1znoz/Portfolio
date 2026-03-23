<script>
    import { onMount } from 'svelte'
    import { createHashSectionWatcher } from '../../lib/menu-state'
    import { CYBER_NAV_ITEMS } from './navigation'

    export let cvFileUrl = '/files/CV-DEV-25.pdf'

    let currentSection = 'hero'

    const navItems = [
        { id: 'hero', label: 'ACCUEIL', href: '#hero', icon: 'code' },
        ...CYBER_NAV_ITEMS,
    ]

    onMount(() => {
        return createHashSectionWatcher({
            windowRef: window,
            validSectionIds: navItems.map((item) => item.id),
            fallbackSectionId: 'hero',
            onSectionChange: (nextSection) => {
                currentSection = nextSection
            },
        })
    })
</script>

<aside class="fixed left-0 top-0 h-screen w-64 z-40 pt-20 flex flex-col bg-[#0e0e0e] border-r-2 border-[#484848] hidden lg:flex">
<div class="px-6 mb-8">
<div class="text-lg font-bold text-[#e2e2e2] font-headline">SYSTEM_STATUS</div>
<div class="font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-widest text-tertiary">DWWM_CERTIFIED_2025</div>
</div>
<nav class="flex-1 flex flex-col">
{#each navItems as item}
<a
class={`p-3 px-6 flex items-center gap-3 border-b border-[#484848] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest transition-none ${currentSection === item.id ? 'bg-[#ff8f73] text-[#0e0e0e] scale-[0.99]' : 'text-[#e2e2e2] hover:bg-[#191919] hover:text-[#9cff93]'}`}
href={item.href}
on:click={() => (currentSection = item.id)}
aria-current={currentSection === item.id ? 'page' : undefined}
>
<span class="material-symbols-outlined" data-icon={item.icon}>{item.icon}</span>
<span>{item.label}</span>
</a>
{/each}
<a class="text-[#e2e2e2] p-3 px-6 flex items-center gap-3 border-b border-[#484848] font-['Space_Grotesk'] text-xs font-bold uppercase tracking-widest hover:bg-[#191919] hover:text-[#9cff93] transition-none" href={cvFileUrl} target="_blank" rel="noreferrer">
<span class="material-symbols-outlined" data-icon="description">description</span>
<span>CV</span>
</a>
</nav>
<div class="p-6">
<a href={cvFileUrl} target="_blank" rel="noreferrer" class="w-full block text-center bg-secondary text-surface p-3 font-headline font-black text-xs uppercase tracking-widest hover:bg-primary transition-none">
        TELECHARGER_CV
            </a>
</div>
<div class="border-t-2 border-[#484848] mt-auto">
<a class="text-[#e2e2e2] p-3 px-6 flex items-center gap-3 font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-widest hover:text-tertiary transition-none" href="#projects">
<span class="material-symbols-outlined text-sm" data-icon="folder_open">folder_open</span>
<span>ARCHIVES</span>
</a>
<a class="text-[#e2e2e2] p-3 px-6 flex items-center gap-3 font-['Space_Grotesk'] text-[10px] font-bold uppercase tracking-widest hover:text-tertiary transition-none" href="#process">
<span class="material-symbols-outlined text-sm" data-icon="history">history</span>
<span>LOGS</span>
</a>
</div>
</aside>