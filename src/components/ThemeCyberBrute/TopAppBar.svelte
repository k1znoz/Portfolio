<script>
	import { onMount } from 'svelte'
	import { createHashSectionWatcher } from '../../lib/menu-state'
	import { CYBER_NAV_ITEMS } from './navigation'

	export let ownerName = 'k1znoz'
	export let githubUrl = 'https://github.com/k1znoz'
	export let cvFileUrl = '/files/CV-DEV-25.pdf'
	export let onJumpProjects = () => {}
	export let onSwitchToBaseLayout = () => {}
	export let showLayoutToggle = true

	let currentSection = 'projects'
	const navItems = CYBER_NAV_ITEMS

	$: brand = `${ownerName}_PORTFOLIO`.replace(/\s+/g, '_').toUpperCase()

	onMount(() => {
		return createHashSectionWatcher({
			windowRef: window,
			validSectionIds: navItems.map((item) => item.id),
			fallbackSectionId: 'projects',
			onSectionChange: (nextSection) => {
				currentSection = nextSection
			},
		})
	})
</script>

<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0e0e0e] border-b-2 border-[#484848] flat no shadows">
<div class="text-2xl font-black tracking-[-0.05em] text-[#ff8f73] font-headline uppercase">{brand}</div>
<nav class="hidden md:flex gap-8 items-center h-full">
{#each navItems as item}
	<a
		class={`font-['Space_Grotesk'] uppercase tracking-tighter font-bold pb-1 transition-none hover:bg-[#1f1f1f] hover:text-[#ff8f73] ${currentSection === item.id ? 'text-[#ff8f73] border-b-2 border-[#ff8f73]' : 'text-[#e2e2e2]'}`}
		href={item.href}
		on:click={() => (currentSection = item.id)}
		aria-current={currentSection === item.id ? 'page' : undefined}
	>
		{item.label}
	</a>
{/each}
<a class="font-['Space_Grotesk'] uppercase tracking-tighter font-bold text-[#e2e2e2] hover:bg-[#1f1f1f] hover:text-[#ff8f73] transition-none" href={cvFileUrl} target="_blank" rel="noreferrer">CV</a>
</nav>
<div class="flex items-center gap-4 text-[#ff8f73]">
<button
	type="button"
	class="p-2 hover:bg-[#1f1f1f] active:translate-x-1 active:translate-y-1 transition-none"
	title="Aller aux projets"
	aria-label="Aller aux projets"
	on:click={onJumpProjects}
>
<span class="material-symbols-outlined" data-icon="terminal">terminal</span>
</button>
<a
	href={githubUrl}
	target="_blank"
	rel="noreferrer"
	class="p-2 hover:bg-[#1f1f1f] active:translate-x-1 active:translate-y-1 transition-none"
	title="Ouvrir GitHub"
	aria-label="Ouvrir GitHub"
>
	<span class="material-symbols-outlined" data-icon="code">code</span>
</a>
{#if showLayoutToggle}
	<button
		type="button"
		class="p-2 hover:bg-[#1f1f1f] active:translate-x-1 active:translate-y-1 transition-none"
		title="Revenir au layout de base"
		aria-label="Revenir au layout de base"
		on:click={onSwitchToBaseLayout}
	>
		<span class="material-symbols-outlined" data-icon="settings_input_component">settings_input_component</span>
	</button>
{/if}
</div>
</header>
