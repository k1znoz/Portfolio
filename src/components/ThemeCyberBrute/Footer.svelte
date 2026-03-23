<script>
	export let ownerName = 'k1znoz'
	export let currentYear = new Date().getFullYear()
	export let githubHandle = 'k1znoz'
	export let stackLabel = 'SVELTE + LARAVEL'
	export let location = 'VOUTEZAC'

	$: footerBrand = `©${currentYear}_${ownerName}_PORTFOLIO`.replace(/\s+/g, '_').toUpperCase()
</script>

<!-- FOOTER -->
<footer class="fixed bottom-0 w-full z-50 flex justify-between items-center px-4 py-1 bg-[#131313] border-t-2 border-[#484848] flat no shadows">
<div class="font-['Space_Grotesk'] text-[10px] uppercase font-medium text-[#9cff93]">{footerBrand}</div>
<div class="flex gap-6">
<span class="font-['Space_Grotesk'] text-[10px] uppercase font-medium text-[#484848] hover:text-[#ff8f73] cursor-pointer">GITHUB: {String(githubHandle).toUpperCase()}</span>
<span class="font-['Space_Grotesk'] text-[10px] uppercase font-medium text-[#484848] hover:text-[#ff8f73] cursor-pointer">STACK: {String(stackLabel).toUpperCase()}</span>
<span class="font-['Space_Grotesk'] text-[10px] uppercase font-medium text-[#484848] hover:text-[#ff8f73] cursor-pointer">LOCALISATION: {String(location).toUpperCase()}</span>
</div>
</footer>
