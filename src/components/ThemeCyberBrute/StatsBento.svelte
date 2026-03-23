<script>
	export let metrics = []

	const fallback = [
		{ value: '2025', label: 'Diplome DWWM obtenu' },
		{ value: '6+', label: 'Experiences professionnelles' },
		{ value: 'C1', label: 'Anglais bilingue' },
	]

	function toTerminalLabel(label) {
		return String(label || '')
			.replace(/[^\w\s]/g, ' ')
			.replace(/\s+/g, '_')
			.toUpperCase()
	}

	$: cards = (metrics.length ? metrics : fallback).slice(0, 3)
</script>

<!-- STATS BENTO -->
<section id="stack" class="scroll-mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b-2 border-outline-variant">
	{#each cards as metric, index}
		<div class={`p-10 group hover:bg-surface-container transition-colors ${index < cards.length - 1 ? 'border-r-2 border-outline-variant' : ''}`}>
			<div class="font-label text-xs text-on-surface-variant mb-2">/ {toTerminalLabel(metric.label)}</div>
			<div class="font-headline text-6xl font-black text-primary group-hover:scale-110 transition-transform origin-left">{metric.value}</div>
		</div>
	{/each}
</section>