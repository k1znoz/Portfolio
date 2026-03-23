<script>
  // Array of skill strings from portfolio.js (e.g. ['Svelte', 'Laravel', 'Rust', ...])
  export let skills = []

  // Each grade card combines a known skill with its icon and proficiency bar.
  // Unknown skills get a sensible default icon.
  const gradeDefinitions = [
    { key: 'svelte',      serial: 'ST_01', icon: 'bolt',          label: 'SVELTE',      desc: 'Réactivité atomique sans virtual DOM. Pour des interfaces tranchantes et instantanées.',          bar: 95 },
    { key: 'laravel',     serial: 'LA_02', icon: 'database',      label: 'LARAVEL',     desc: 'Architecture élégante et robuste. La fondation de chaque projet d\'envergure.',                   bar: 98 },
    { key: 'javascript',  serial: 'JS_03', icon: 'code',          label: 'JAVASCRIPT',  desc: 'Dynamisme, interactivité et logique côté client. Pilier de tout front-end moderne.',              bar: 92 },
    { key: 'php',         serial: 'PH_04', icon: 'terminal',      label: 'PHP',         desc: 'Le moteur serveur de confiance. Puissant, éprouvé et largement déployé.',                         bar: 88 },
    { key: 'typescript',  serial: 'TS_05', icon: 'verified',      label: 'TYPESCRIPT',  desc: 'Type-safety et robustesse à l\'échelle. Indispensable pour les projets complexes.',               bar: 85 },
    { key: 'css',         serial: 'CS_06', icon: 'palette',       label: 'CSS / SCSS',  desc: 'Styling précis et animations fluides. La lame affûtée du forgeron UI.',                           bar: 90 },
    { key: 'mysql',       serial: 'DB_07', icon: 'storage',       label: 'MYSQL',       desc: 'Modélisation relationnelle solide. Des schémas pensés pour la performance et l\'intégrité.',      bar: 85 },
    { key: 'rust',        serial: 'RS_08', icon: 'shield',        label: 'RUST',        desc: 'Sécurité mémoire et performance brute. L\'acier le plus pur pour les systèmes critiques.',         bar: 62 },
  ]

  // Build the visible cards: prioritise skills found in the prop array,
  // then fill remaining slots from gradeDefinitions up to a max of 4.
  function buildCards(skillList) {
    const normalized = skillList.map((s) => s.toLowerCase())
    const matched = gradeDefinitions.filter((g) => normalized.includes(g.key))
    const extras  = gradeDefinitions.filter((g) => !normalized.includes(g.key))
    const pool    = [...matched, ...extras]
    return pool.slice(0, 4)
  }

  $: cards = buildCards(skills)
</script>

<!-- STEEL GRADES / SKILL SECTION ------------------------------------------ -->
<section id="skills" class="iron-skills scroll-mt-20" aria-label="Grades d'acier technique">
  <div class="iron-skills__inner">
    <!-- Heading -->
    <div class="mb-20 text-center">
      <h2 class="font-headline text-5xl font-black uppercase tracking-tighter text-on-surface mb-4">
        GRADES D'ACIER TECHNIQUE
      </h2>
      <p class="font-label text-primary tracking-[0.3em]">ALLOY_COMPOSITION_ANALYSIS</p>
    </div>

    <!-- 4-column grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {#each cards as grade}
        <div class="iron-skill-card group">
          <!-- Serial / version tag -->
          <span class="iron-skill-card__serial">{grade.serial}</span>

          <!-- Icon chip -->
          <div class="iron-skill-card__icon">
            <span class="material-symbols-outlined text-primary-container text-3xl" aria-hidden="true">
              {grade.icon}
            </span>
          </div>

          <!-- Label -->
          <h4 class="font-headline text-xl font-black text-primary mb-2">{grade.label}</h4>

          <!-- Description -->
          <p class="font-body text-secondary text-xs leading-relaxed opacity-70">{grade.desc}</p>

          <!-- Proficiency bar -->
          <div class="iron-skill-card__bar-track" role="progressbar" aria-valuenow={grade.bar} aria-valuemin="0" aria-valuemax="100">
            <div class="iron-skill-card__bar-fill" style="width:{grade.bar}%"></div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
