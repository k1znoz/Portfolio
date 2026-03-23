<script>
  // Callback fired with the validated form payload
  export let onSubmit = (_payload) => {}

  let name    = ''
  let email   = ''
  let steel   = 'SVELTEKIT (RÉACTIVITÉ MAX)'
  let specs   = ''
  let sending = false
  let sent    = false
  let error   = ''

  const steelOptions = [
    'SVELTEKIT (RÉACTIVITÉ MAX)',
    'LARAVEL (ROBUSTESSE SYSTÈME)',
    'PHP (FONDATION BACK-END)',
    'FULLSTACK (ECOSYSTÈME COMPLET)',
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    if (sending) return

    // Basic validation
    if (!name.trim() || !email.trim() || !specs.trim()) {
      error = 'TOUS LES CHAMPS SONT REQUIS.'
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error = 'FORMAT EMAIL INVALIDE.'
      return
    }

    error = ''
    sending = true

    try {
      await onSubmit({ name: name.trim(), email: email.trim(), steel, specs: specs.trim() })
      sent = true
    } catch {
      error = 'ERREUR LORS DE L\'ENVOI. RÉESSAYEZ.'
    } finally {
      sending = false
    }
  }
</script>

<!-- CONTACT FORGE / DEVIS DE FORGE ---------------------------------------- -->
<section id="contact" class="iron-contact scroll-mt-20" aria-label="Devis de forge">
  <div class="iron-contact__inner">
    <div class="iron-contact__sheet brushed-metal">
      <div class="iron-contact__inner-border">

        <!-- Sheet header -->
        <div class="flex flex-col md:flex-row justify-between items-start mb-12 border-b-2 border-outline-variant/30 pb-8">
          <div>
            <h2 class="font-headline text-4xl font-black text-on-surface uppercase mb-2">
              DEVIS DE FORGE
            </h2>
            <p class="font-label text-outline text-xs tracking-widest">
              FORM_ID: REQ_CUSTOM_BLADE_2026
            </p>
          </div>
          <div class="mt-4 md:mt-0">
            <span class="material-symbols-outlined text-primary text-5xl opacity-20" aria-hidden="true">
              contract_edit
            </span>
          </div>
        </div>

        {#if sent}
          <!-- Success state -->
          <div class="py-16 text-center">
            <span class="material-symbols-outlined text-primary-container text-6xl mb-4" aria-hidden="true">
              check_circle
            </span>
            <p class="font-headline text-2xl font-black text-on-surface uppercase">
              CAHIER DES CHARGES REÇU
            </p>
            <p class="font-body text-secondary text-sm mt-2">
              Je vous recontacte dans les 24h. La forge est en feu.
            </p>
          </div>
        {:else}
          <!-- Form -->
          <form class="grid grid-cols-1 md:grid-cols-2 gap-8" on:submit={handleSubmit} novalidate>
            <!-- Left column -->
            <div class="space-y-6">
              <!-- Name -->
              <div>
                <label for="forge-name" class="font-label text-[10px] text-primary uppercase block mb-2">
                  IDENTITÉ_DU_CLIENT
                </label>
                <input
                  id="forge-name"
                  type="text"
                  bind:value={name}
                  placeholder="NOM OU COMPAGNIE"
                  autocomplete="name"
                  class="iron-input w-full bg-surface-container-lowest border-b-2 border-outline focus:border-primary-container outline-none py-3 px-4 font-body text-on-surface transition-all placeholder:text-outline/30 placeholder:uppercase placeholder:text-xs"
                />
              </div>

              <!-- Email -->
              <div>
                <label for="forge-email" class="font-label text-[10px] text-primary uppercase block mb-2">
                  CANAL_DE_COMMUNICATION
                </label>
                <input
                  id="forge-email"
                  type="email"
                  bind:value={email}
                  placeholder="EMAIL_SECURISE"
                  autocomplete="email"
                  class="iron-input w-full bg-surface-container-lowest border-b-2 border-outline focus:border-primary-container outline-none py-3 px-4 font-body text-on-surface transition-all placeholder:text-outline/30 placeholder:uppercase placeholder:text-xs"
                />
              </div>

              <!-- Steel type -->
              <div>
                <label for="forge-steel" class="font-label text-[10px] text-primary uppercase block mb-2">
                  TYPE_D_ACIER_REQUIS
                </label>
                <select
                  id="forge-steel"
                  bind:value={steel}
                  class="iron-input w-full bg-surface-container-lowest border-b-2 border-outline outline-none py-3 px-4 font-body text-on-surface transition-all appearance-none uppercase text-xs"
                >
                  {#each steelOptions as opt}
                    <option value={opt}>{opt}</option>
                  {/each}
                </select>
              </div>
            </div>

            <!-- Right column -->
            <div class="flex flex-col h-full">
              <label for="forge-specs" class="font-label text-[10px] text-primary uppercase block mb-2">
                SPÉCIFICATIONS_DU_PROJET
              </label>
              <textarea
                id="forge-specs"
                bind:value={specs}
                placeholder="DÉCRIVEZ VOTRE VISION ICI..."
                rows="8"
                class="iron-input flex-grow w-full bg-surface-container-lowest border-b-2 border-outline outline-none py-3 px-4 font-body text-on-surface transition-all resize-none placeholder:text-outline/30 placeholder:uppercase placeholder:text-xs"
              ></textarea>
            </div>

            <!-- Full-width submit -->
            <div class="md:col-span-2 mt-4">
              {#if error}
                <p class="font-label text-tertiary-container text-xs mb-4 tracking-wider" role="alert">
                  ⚠ {error}
                </p>
              {/if}
              <button type="submit" class="iron-contact__submit" disabled={sending}>
                {sending ? 'TRAITEMENT EN COURS...' : 'SOUMETTRE LE CAHIER DES CHARGES'}
                <span class="material-symbols-outlined" aria-hidden="true">send</span>
              </button>
              <p class="text-center font-label text-[8px] text-outline mt-4 italic opacity-50">
                BY SENDING THIS FORM YOU AGREE TO THE TERMS OF THE FOUNDRY PROTOCOLS
              </p>
            </div>
          </form>
        {/if}

      </div>
    </div>
  </div>
</section>
