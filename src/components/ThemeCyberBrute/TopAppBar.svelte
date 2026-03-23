<script>
	export let ownerName = 'k1znoz'
	export let githubUrl = 'https://github.com/k1znoz'
	export let onJumpProjects = () => {}
	export let onSwitchToBaseLayout = () => {}
	export let showLayoutToggle = true

	$: brand = `${ownerName}_PORTFOLIO`.replace(/\s+/g, '_').toUpperCase()
</script>

<header class="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0e0e0e] border-b-2 border-[#484848] flat no shadows">
<div class="text-2xl font-black tracking-[-0.05em] text-[#ff8f73] font-headline uppercase">{brand}</div>
<nav class="hidden md:flex gap-8 items-center h-full">
<a class="font-['Space_Grotesk'] uppercase tracking-tighter font-bold text-[#ff8f73] border-b-2 border-[#ff8f73] pb-1 hover:bg-[#1f1f1f] hover:text-[#ff8f73] transition-none" href="#projects">PROJETS</a>
<a class="font-['Space_Grotesk'] uppercase tracking-tighter font-bold text-[#e2e2e2] hover:bg-[#1f1f1f] hover:text-[#ff8f73] transition-none" href={githubUrl} target="_blank" rel="noreferrer">GITHUB</a>
<a class="font-['Space_Grotesk'] uppercase tracking-tighter font-bold text-[#e2e2e2] hover:bg-[#1f1f1f] hover:text-[#ff8f73] transition-none" href="#contact">CONTACT</a>
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
