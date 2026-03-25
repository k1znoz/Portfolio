<script>
	import { onMount } from 'svelte'
	import { createHashSectionWatcher } from '../../lib/menu-state'
	import { CYBER_NAV_ITEMS } from './navigation'

	export let ownerName = 'k1znoz'
	export let githubUrl = 'https://github.com/k1znoz'
	export let cvFileUrl = '/files/CV-DEV-25.pdf'
	export let onOpenAdminPage = () => {}
	export let onJumpProjects = () => {}
	export let onSwitchToBaseLayout = () => {}
	export let showLayoutToggle = true

	let currentSection = 'projects'
	let menuOpen = false
	const navItems = CYBER_NAV_ITEMS

	$: brand = `${ownerName}_PORTFOLIO`.replace(/\s+/g, '_').toUpperCase()

	function closeMenu() {
		menuOpen = false
	}

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

<header class="fixed top-0 w-full z-50 flex justify-between items-center px-4 sm:px-6 h-16 bg-[#0e0e0e] border-b-2 border-[#484848]">
	<div class="text-xl sm:text-2xl font-black tracking-[-0.05em] text-[#ff8f73] font-headline uppercase truncate max-w-[50%]">{brand}</div>

	<!-- Desktop nav -->
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
		<button
			type="button"
			class="font-['Space_Grotesk'] uppercase tracking-tighter font-bold text-[#e2e2e2] bg-transparent border-0 hover:bg-[#1f1f1f] hover:text-[#ff8f73] transition-none"
			on:click={onOpenAdminPage}
		>
			ADMIN
		</button>
	</nav>

	<!-- Actions desktop + burger mobile -->
	<div class="flex items-center gap-2 sm:gap-4 text-[#ff8f73]">
		<button
			type="button"
			class="hidden md:flex p-2 hover:bg-[#1f1f1f] active:translate-x-1 active:translate-y-1 transition-none"
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
			class="hidden md:flex p-2 hover:bg-[#1f1f1f] active:translate-x-1 active:translate-y-1 transition-none"
			title="Ouvrir GitHub"
			aria-label="Ouvrir GitHub"
		>
			<span class="material-symbols-outlined" data-icon="code">code</span>
		</a>
		{#if showLayoutToggle}
			<button
				type="button"
				class="hidden md:flex p-2 hover:bg-[#1f1f1f] active:translate-x-1 active:translate-y-1 transition-none"
				title="Revenir au layout de base"
				aria-label="Revenir au layout de base"
				on:click={onSwitchToBaseLayout}
			>
				<span class="material-symbols-outlined" data-icon="settings_input_component">settings_input_component</span>
			</button>
		{/if}

		<!-- Burger — mobile uniquement -->
		<button
			type="button"
			class="flex md:hidden flex-col justify-center items-center gap-[5px] w-10 h-10 hover:bg-[#1f1f1f] active:translate-x-[1px] active:translate-y-[1px] p-2"
			on:click={() => (menuOpen = !menuOpen)}
			aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
			aria-expanded={menuOpen}
		>
			<span class="cyber-bar" class:bar-1-open={menuOpen}></span>
			<span class="cyber-bar" class:bar-2-open={menuOpen}></span>
			<span class="cyber-bar" class:bar-3-open={menuOpen}></span>
		</button>
	</div>
</header>

<!-- Overlay mobile -->
{#if menuOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
	<div class="md:hidden fixed inset-0 z-40 bg-black/60" role="presentation" on:click={closeMenu}></div>
	<nav
		class="md:hidden fixed top-16 left-0 right-0 z-50 bg-[#0e0e0e] border-b-2 border-[#484848] cyber-mobile-menu"
		aria-label="Menu mobile"
	>
		<div class="scanline-overlay absolute inset-0 pointer-events-none opacity-20"></div>
		<div class="relative z-10">
			{#each navItems as item}
				<a
					href={item.href}
					class="cyber-mobile-link"
					class:is-active={currentSection === item.id}
					on:click={() => { currentSection = item.id; closeMenu() }}
					aria-current={currentSection === item.id ? 'page' : undefined}
				>
					<span class="cyber-mobile-prompt">{currentSection === item.id ? '>' : '_'}</span>
					{item.label}
				</a>
			{/each}
			<a href={cvFileUrl} target="_blank" rel="noreferrer" class="cyber-mobile-link" on:click={closeMenu}>
				<span class="cyber-mobile-prompt">_</span>CV.PDF
			</a>
			<button
				type="button"
				class="cyber-mobile-link w-full text-left"
				on:click={() => { onOpenAdminPage(); closeMenu() }}
			>
				<span class="cyber-mobile-prompt">_</span>ADMIN
			</button>
			<div class="border-t border-[#1f1f1f] flex items-center gap-1 px-4 py-2">
				<button type="button" class="p-2 hover:bg-[#1f1f1f] text-[#ff8f73]" on:click={() => { onJumpProjects(); closeMenu() }} aria-label="Terminal">
					<span class="material-symbols-outlined text-base" data-icon="terminal">terminal</span>
				</button>
				<a href={githubUrl} target="_blank" rel="noreferrer" class="p-2 hover:bg-[#1f1f1f] text-[#ff8f73]" on:click={closeMenu} aria-label="GitHub">
					<span class="material-symbols-outlined text-base" data-icon="code">code</span>
				</a>
				{#if showLayoutToggle}
					<button type="button" class="ml-auto p-2 hover:bg-[#1f1f1f] text-[#ff8f73]/50 hover:text-[#ff8f73] font-mono text-xs" on:click={() => { onSwitchToBaseLayout(); closeMenu() }}>
						[EDITORIAL]
					</button>
				{/if}
			</div>
		</div>
	</nav>
{/if}

<style>
	/* Barres du burger — animation par steps (pas de smooth : cohérent avec le style cyber "no transitions") */
	.cyber-bar {
		display: block;
		width: 1.25rem;
		height: 2px;
		background: #ff8f73;
		transition: transform 160ms steps(4), opacity 80ms steps(1);
		transform-origin: center;
	}

	.bar-1-open { transform: translateY(7px) rotate(45deg); }
	.bar-2-open { opacity: 0; transform: scaleX(0); }
	.bar-3-open { transform: translateY(-7px) rotate(-45deg); }

	/* Menu dropdown */
	.cyber-mobile-menu {
		font-family: 'Space Grotesk', sans-serif;
	}

	.cyber-mobile-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1.5rem;
		color: #e2e2e2;
		font-family: 'Space Grotesk', sans-serif;
		font-weight: 700;
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: -0.02em;
		text-decoration: none;
		border-bottom: 1px solid #1a1a1a;
	}

	.cyber-mobile-link:hover,
	.cyber-mobile-link.is-active {
		background: #131313;
		color: #ff8f73;
	}

	.cyber-mobile-prompt {
		font-family: 'Space Mono', monospace;
		color: #484848;
		font-size: 0.9rem;
		min-width: 0.8rem;
	}

	.cyber-mobile-link.is-active .cyber-mobile-prompt {
		color: #ff8f73;
	}
</style>
