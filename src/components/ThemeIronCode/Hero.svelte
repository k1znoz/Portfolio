<script>
  // Personal data
  export let fullName = 'Alois Sautet'
  export let title = 'Developpeur Web & Web Mobile'
  export let pitch = "Attire par le monde du web depuis longtemps, je forge des interfaces robustes et performantes avec la pile Svelte et Laravel."

  // Callback for the primary CTA ("Commencer le projet")
  export let onContactClick = () => {}

  $: firstWord = fullName.split(' ')[0].toUpperCase()
  $: techLine = `${title.toUpperCase()} : FORGERON SVELTE & LARAVEL`
</script>

<!-- HERO ------------------------------------------------------------------ -->
<section id="hero" class="iron-hero scroll-mt-20">
  <!-- ambient radial blob -->
  <div class="iron-hero__ambient" aria-hidden="true"></div>

  <div class="z-10 w-full">
    <!-- System status badge -->
    <p class="font-label text-primary font-bold tracking-[0.4em] mb-4 text-sm uppercase">
      SYSTEM_READY // INITIALIZING_FORGE
    </p>

    <!-- Giant headline -->
    <h1 class="iron-hero__headline">
      <span class="iron-hero__headline-accent molten-glow">{firstWord}</span>
      <span class="iron-hero__headline-main">{techLine}</span>
    </h1>

    <!-- Pitch + CTA row -->
    <div class="flex flex-col md:flex-row gap-8 items-start md:items-center mt-12">
      <!-- Pitch -->
      <div class="border-l-4 border-primary-container pl-6 py-2 max-w-xl">
        <p class="font-body text-secondary text-lg leading-relaxed">
          {@html pitch.replace(/Svelte/g, '<span class="text-primary">Svelte</span>').replace(/Laravel/g, '<span class="text-primary">Laravel</span>')}
        </p>
      </div>

      <!-- CTA column -->
      <div class="flex flex-col gap-4 shrink-0">
        <button
          type="button"
          class="bg-primary-container text-on-primary-container font-black py-4 px-10 text-xl tracking-tighter shadow-lg shadow-primary-container/20 hover:scale-105 transition-all"
          on:click={onContactClick}
        >
          COMMENCER LE PROJET
        </button>
        <p class="font-label text-[10px] text-outline text-center">
          STATUS: DISPONIBLE POUR NOUVELLES MISSIONS
        </p>
      </div>
    </div>
  </div>
</section>
