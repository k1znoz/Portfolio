<script>
  // Array of experience objects from cvWeb.experiences (portfolio.js)
  // Shape: { period, company, role, points: string[] }
  export let experiences = []

  // Rank / forge title mapping based on period
  function forgeTitle(exp) {
    if (exp.period?.includes('2023') || exp.period?.includes('Depuis')) return 'MASTER SMITH // LEAD DEV'
    if (exp.period?.includes('2019')) return 'JOURNEYMAN // FULLSTACK'
    return 'APPRENTICE // JUNIOR DEV'
  }

  // Active means first (most recent) entry
  $: entries = experiences.map((exp, i) => ({
    ...exp,
    label: forgeTitle(exp),
    isActive: i === 0,
    side: i % 2 === 0 ? 'left' : 'right',
  }))
</script>

<!-- TIMELINE / HISTORIQUE DE FORGE ---------------------------------------- -->
<section id="timeline" class="iron-timeline scroll-mt-20" aria-label="Historique de forge">
  <h2 class="iron-timeline__title">HISTORIQUE DE FORGE</h2>

  <div class="iron-timeline__track">
    <!-- Vertical central axis (visible md+) -->
    <div class="iron-timeline__axis" aria-hidden="true"></div>

    <div class="space-y-16">
      {#each entries as entry, i}
        <div class="relative flex flex-col md:flex-row items-center md:justify-between w-full">

          {#if entry.side === 'left'}
            <!-- Card on the left -->
            <div
              class="md:w-[45%] iron-timeline__card {entry.isActive ? 'iron-timeline__card--left' : 'iron-timeline__card--past-left'} shadow-xl"
            >
              <span class="font-label text-{entry.isActive ? 'primary-container' : 'outline'} text-xs block mb-2">
                {entry.period}
              </span>
              <h3 class="font-headline text-xl font-bold text-on-surface uppercase mb-4">
                {entry.label}
              </h3>
              <p class="font-label text-secondary text-xs font-bold mb-3 uppercase tracking-wider">
                {entry.company} — {entry.role}
              </p>
              {#if entry.points?.length}
                <ul class="space-y-1">
                  {#each entry.points.slice(0, 3) as point}
                    <li class="font-body text-secondary text-sm leading-relaxed flex gap-2">
                      <span class="text-primary-container shrink-0 mt-0.5" aria-hidden="true">›</span>
                      {point}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>

            <!-- Dot on axis -->
            <div
              class="iron-timeline__dot {entry.isActive ? 'iron-timeline__dot--active' : 'iron-timeline__dot--past'}"
              aria-hidden="true"
              style="top: 2rem"
            ></div>

            <!-- Empty right side -->
            <div class="md:w-[45%]"></div>

          {:else}
            <!-- Empty left side -->
            <div class="md:w-[45%]"></div>

            <!-- Dot on axis -->
            <div
              class="iron-timeline__dot iron-timeline__dot--past"
              aria-hidden="true"
              style="top: 2rem"
            ></div>

            <!-- Card on the right -->
            <div class="md:w-[45%] iron-timeline__card iron-timeline__card--right shadow-xl">
              <span class="font-label text-outline text-xs block mb-2">{entry.period}</span>
              <h3 class="font-headline text-xl font-bold text-on-surface uppercase mb-4">
                {entry.label}
              </h3>
              <p class="font-label text-secondary text-xs font-bold mb-3 uppercase tracking-wider">
                {entry.company} — {entry.role}
              </p>
              {#if entry.points?.length}
                <ul class="space-y-1">
                  {#each entry.points.slice(0, 3) as point}
                    <li class="font-body text-secondary text-sm leading-relaxed flex gap-2">
                      <span class="text-outline shrink-0 mt-0.5" aria-hidden="true">›</span>
                      {point}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/if}

        </div>
      {/each}
    </div>
  </div>
</section>
