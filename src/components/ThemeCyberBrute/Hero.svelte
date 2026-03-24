<script>
      export let fullName = 'Alois Sautet'
      export let title = 'Developpeur Web et Web Mobile'
      export let pitch = ''

      $: nameParts = fullName.toUpperCase().split(/\s+/)
      $: leadName = nameParts[0] ?? fullName.toUpperCase()
      $: trailingName = nameParts.slice(1).join('_')
</script>

<!-- HERO SECTION -->
<section id="hero" class="scroll-mt-20 relative min-h-[819px] flex flex-col justify-center px-4 sm:px-8 border-b-2 border-outline-variant">
<div class="scanline-overlay absolute inset-0"></div>
<div class="z-10 max-w-6xl">
<div class="inline-block bg-tertiary-container text-on-tertiary-container px-2 py-1 font-label text-xs font-bold mb-4">
          PORTFOLIO_ONLINE... [OK]
                </div>
<h1 class="text-4xl sm:text-6xl md:text-9xl font-headline font-black text-on-surface leading-none tracking-tighter mb-6 uppercase">
          {leadName}{#if trailingName}<span class="text-primary">_{trailingName}</span>{/if}
</h1>
<p class="font-label text-xl md:text-3xl text-on-surface-variant max-w-3xl leading-tight">
          {`${title}. ${pitch}`.replace(/\s+/g, ' ').trim().toUpperCase()}
                </p>
<div class="mt-12 flex flex-wrap gap-4">
<a href="#projects" class="bg-primary text-on-primary px-8 py-4 font-headline font-bold text-lg hover:shadow-[4px_4px_0px_0px_rgba(255,143,115,0.3)] transition-all">VOIR_PROJETS</a>
<a href="#contact" class="border-2 border-secondary text-secondary px-8 py-4 font-headline font-bold text-lg hover:bg-surface-container-high transition-all">DEMARRER_COLLAB</a>
</div>
</div>
<!-- Absolute Grid Line Decor -->
<div class="absolute right-0 top-0 bottom-0 w-px bg-outline-variant hidden xl:block"></div>
</section>